const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 600;
const HEIGHT = 300;
const BORDER_RADIUS = 20; // Bordes redondeados

const scriptsPath = path.join(__dirname, "scripts");
if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

async function generateGitHubStatsImage(stats, grade) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Fondo con bordes redondeados
    ctx.fillStyle = "#1E293B"; // Azul oscuro
    ctx.beginPath();
    ctx.moveTo(BORDER_RADIUS, 0);
    ctx.lineTo(WIDTH - BORDER_RADIUS, 0);
    ctx.arcTo(WIDTH, 0, WIDTH, BORDER_RADIUS, BORDER_RADIUS);
    ctx.lineTo(WIDTH, HEIGHT - BORDER_RADIUS);
    ctx.arcTo(WIDTH, HEIGHT, WIDTH - BORDER_RADIUS, HEIGHT, BORDER_RADIUS);
    ctx.lineTo(BORDER_RADIUS, HEIGHT);
    ctx.arcTo(0, HEIGHT, 0, HEIGHT - BORDER_RADIUS, BORDER_RADIUS);
    ctx.lineTo(0, BORDER_RADIUS);
    ctx.arcTo(0, 0, BORDER_RADIUS, 0, BORDER_RADIUS);
    ctx.closePath();
    ctx.fill();

    // Borde exterior
    ctx.strokeStyle = "#4B5563"; // Gris azulado
    ctx.lineWidth = 4;
    ctx.stroke();

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 30px Arial";
    ctx.fillText(`${stats.username}'s GitHub Stats`, 30, 40);

    // Datos de estadísticas
    ctx.font = "22px Arial";
    ctx.fillText(`Total Stars Earned: ${stats.totalStars}`, 30, 100);
    ctx.fillText(`Total Commits: ${stats.totalCommits}`, 30, 140);
    ctx.fillText(`Total PRs: ${stats.totalPRs}`, 30, 180);
    ctx.fillText(`Total Issues: ${stats.totalIssues}`, 30, 220);
    ctx.fillText(`Contributed to (last year): ${stats.contributionsLastYear}`, 30, 260);

    // Círculo de progreso
    ctx.beginPath();
    ctx.arc(500, 150, 60, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.strokeStyle = "#38BDF8"; // Azul claro
    ctx.lineWidth = 12;
    ctx.stroke();

    // Letra de calificación
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 50px Arial";
    ctx.fillText(grade, 480, 165);

    // Guardar la imagen
    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "github_stats.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'github_stats.png' generada correctamente.`);
}

module.exports = generateGitHubStatsImage;
