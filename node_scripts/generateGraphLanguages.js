const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 400;
const HEIGHT = 500;
const BAR_HEIGHT = 12;
const PADDING = 20;
const BAR_SPACING = 25;
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

function generateLanguageChart(languages) {
    const canvasHeight = PADDING * 2 + languages.length * BAR_SPACING;
    const canvas = createCanvas(WIDTH, canvasHeight);
    const ctx = canvas.getContext("2d");

    // Fondo
    ctx.fillStyle = "#1E293B";
    ctx.fillRect(0, 0, WIDTH, canvasHeight);

    // Borde
    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, WIDTH, canvasHeight);

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Most Used Languages", PADDING, 30);

    const barX = PADDING;
    const barWidth = WIDTH - PADDING * 2;
    let yOffset = 50;
    const colors = ["#FFD700", "#FF6384", "#FF8C00", "#8A2BE2", "#00BFFF", "#4682B4", "#32CD32", "#DC143C", "#8B4513"];

    languages.forEach((lang, index) => {
        const langWidth = (lang.percent / 100) * barWidth;
        ctx.fillStyle = "#AAAAAA";
        ctx.fillRect(barX, yOffset, barWidth, BAR_HEIGHT);
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(barX, yOffset, langWidth, BAR_HEIGHT);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";
        ctx.fillText(lang.lang, barX, yOffset - 2);
        ctx.fillText(`${lang.percent}%`, barX + barWidth - 40, yOffset - 2);
        
        yOffset += BAR_SPACING;
    });

    // Guardar imagen
    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "language_chart.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'language_chart.png' generada correctamente.`);
}

module.exports = generateLanguageChart;