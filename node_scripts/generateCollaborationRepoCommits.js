const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 700;
const PADDING = 20;
const ROW_HEIGHT = 32;
const BORDER_RADIUS = 15;
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

function formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 30) return `Hace ${diffDays} días`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `Hace ${diffMonths} mes${diffMonths > 1 ? "es" : ""}`;

    const diffYears = Math.floor(diffMonths / 12);
    return `Hace ${diffYears} año${diffYears > 1 ? "s" : ""}`;
}

// collaborationRepos: [{ repo: "owner/name", updatedAt: "2026-05-01T..." }, ...]
// ya ordenado del más reciente al más antiguo (por pushed_at)
function generateCollaborationRepoCommits(collaborationRepos) {
    const repos = collaborationRepos;
    const canvasHeight = PADDING * 2 + 40 + repos.length * ROW_HEIGHT + PADDING;
    const canvas = createCanvas(WIDTH, canvasHeight);
    const ctx = canvas.getContext("2d");

    // Fondo con bordes redondeados
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.moveTo(BORDER_RADIUS, 0);
    ctx.lineTo(WIDTH - BORDER_RADIUS, 0);
    ctx.arcTo(WIDTH, 0, WIDTH, BORDER_RADIUS, BORDER_RADIUS);
    ctx.lineTo(WIDTH, canvasHeight - BORDER_RADIUS);
    ctx.arcTo(WIDTH, canvasHeight, WIDTH - BORDER_RADIUS, canvasHeight, BORDER_RADIUS);
    ctx.lineTo(BORDER_RADIUS, canvasHeight);
    ctx.arcTo(0, canvasHeight, 0, canvasHeight - BORDER_RADIUS, BORDER_RADIUS);
    ctx.lineTo(0, BORDER_RADIUS);
    ctx.arcTo(0, 0, BORDER_RADIUS, 0, BORDER_RADIUS);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Collaboration Repos - Most Recently Updated", PADDING, 32);

    if (repos.length === 0) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#AAAAAA";
        ctx.fillText("No se encontraron repos de colaboración", PADDING, 80);
    } else {
        let yOffset = 60;

        repos.forEach((r, index) => {
            if (index % 2 === 0) {
                ctx.fillStyle = "#25324A";
                ctx.fillRect(PADDING, yOffset - 20, WIDTH - PADDING * 2, ROW_HEIGHT);
            }

            let label = r.repo;
            if (label.length > 55) label = label.slice(0, 52) + "...";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "14px Arial";
            ctx.fillText(label, PADDING + 10, yOffset);

            const dateLabel = formatRelativeDate(r.updatedAt);
            ctx.fillStyle = "#FFD700";
            ctx.font = "13px Arial";
            const dateWidth = ctx.measureText(dateLabel).width;
            ctx.fillText(dateLabel, WIDTH - PADDING - 10 - dateWidth, yOffset);

            yOffset += ROW_HEIGHT;
        });
    }

    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "collaboration_repos.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'collaboration_repos.png' generada correctamente.`);
}

module.exports = generateCollaborationRepoCommits;