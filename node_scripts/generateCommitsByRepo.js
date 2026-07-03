const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 700;
const PADDING = 20;
const BAR_HEIGHT = 16;
const BAR_SPACING = 40;
const BORDER_RADIUS = 15;
const TEXT_SPACING = 8;
const LABEL_WIDTH = 180; // espacio reservado para el nombre del repo
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

const COLOR_OWN = "#38BDF8";      // repos propios
const COLOR_EXTERNAL = "#FFD700"; // repos de colaboración / ajenos

// commitsByRepo: [{ repo: "owner/name", count, owner, isOwn }, ...] ya ordenado desc
function generateCommitsByRepo(commitsByRepo) {
    const repos = commitsByRepo.slice(0, 10);
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
    ctx.fillText("Commits by Repository", PADDING, 30);

    // Leyenda
    ctx.fillStyle = COLOR_OWN;
    ctx.fillRect(WIDTH - 220, 18, 12, 12);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    ctx.fillText("Own", WIDTH - 200, 28);

    ctx.fillStyle = COLOR_EXTERNAL;
    ctx.fillRect(WIDTH - 150, 18, 12, 12);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Collaboration", WIDTH - 130, 28);

    if (repos.length === 0) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#AAAAAA";
        ctx.fillText("Sin commits registrados", PADDING, 80);
    } else {
        const maxCount = Math.max(...repos.map((r) => r.count), 1);
        const barX = PADDING + LABEL_WIDTH;
        const barMaxWidth = WIDTH - barX - PADDING - 40;
        let yOffset = 70;

        repos.forEach((r) => {
            const barWidth = (r.count / maxCount) * barMaxWidth;

            // Fondo de barra
            ctx.fillStyle = "#33394D";
            ctx.fillRect(barX, yOffset, barMaxWidth, BAR_HEIGHT);

            // Barra de valor
            ctx.fillStyle = r.isOwn ? COLOR_OWN : COLOR_EXTERNAL;
            ctx.fillRect(barX, yOffset, barWidth, BAR_HEIGHT);

            // Nombre del repo (truncado si es muy largo)
            let label = r.repo;
            if (label.length > 26) label = label.slice(0, 23) + "...";
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "12px Arial";
            ctx.fillText(label, PADDING, yOffset + BAR_HEIGHT - 4);

            // Conteo al final de la barra
            ctx.fillText(String(r.count), barX + barWidth + 8, yOffset + BAR_HEIGHT - 4);

            yOffset += BAR_SPACING;
        });
    }

    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "commits_by_repo.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'commits_by_repo.png' generada correctamente.`);
}

module.exports = generateCommitsByRepo;
