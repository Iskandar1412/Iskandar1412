const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 700;
const PADDING = 20;
const BAR_HEIGHT = 16;
const BAR_SPACING = 40;
const BORDER_RADIUS = 15;
const LABEL_WIDTH = 180; // espacio reservado para el nombre del repo
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

const BAR_COLOR = "#FFD700";

// collaborationRepoCommits: [{ repo: "owner/name", totalCommits }, ...] ya ordenado desc
// totalCommits = commits de TODO el repo (todos los autores), no solo los tuyos.
function generateCollaborationRepoCommits(collaborationRepoCommits) {
    const repos = collaborationRepoCommits;
    const canvasHeight = PADDING * 2 + 40 + repos.length * BAR_SPACING + PADDING;
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
    ctx.font = "bold 16px Arial";
    ctx.fillText("Collaboration Repos - Total Commits", PADDING, 30);

    if (repos.length === 0) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#AAAAAA";
        ctx.fillText("Sin repos de colaboración con commits tuyos", PADDING, 80);
    } else {
        const maxCount = Math.max(...repos.map((r) => r.totalCommits), 1);
        const barX = PADDING + LABEL_WIDTH;
        const barMaxWidth = WIDTH - barX - PADDING - 40;
        let yOffset = 60;

        repos.forEach((r) => {
            const barWidth = (r.totalCommits / maxCount) * barMaxWidth;

            // Fondo de barra
            ctx.fillStyle = "#33394D";
            ctx.fillRect(barX, yOffset, barMaxWidth, BAR_HEIGHT);

            // Barra de valor
            ctx.fillStyle = BAR_COLOR;
            ctx.fillRect(barX, yOffset, barWidth, BAR_HEIGHT);

            // Nombre del repo (truncado si es muy largo)
            let label = r.repo;
            if (label.length > 26) label = label.slice(0, 23) + "...";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "12px Arial";
            ctx.fillText(label, PADDING, yOffset + BAR_HEIGHT - 4);

            // Total al final de la barra
            ctx.fillText(String(r.totalCommits), barX + barWidth + 8, yOffset + BAR_HEIGHT - 4);

            yOffset += BAR_SPACING;
        });
    }

    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "collaboration_repos.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'collaboration_repos.png' generada correctamente.`);
}

module.exports = generateCollaborationRepoCommits;