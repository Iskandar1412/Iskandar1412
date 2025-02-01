const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 800;
const PADDING = 20;
const BAR_HEIGHT = 14;
const BAR_SPACING = 40;
const BORDER_RADIUS = 15;
const TEXT_SPACING = 8;
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

function generateLanguageChart(languages) {
    const canvasHeight = PADDING * 2 + languages.length * BAR_SPACING + PADDING;
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

    // Borde
    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Use Of Languages", PADDING, 30);

    const barX = PADDING;
    const barWidth = WIDTH - PADDING * 2;
    let yOffset = 60;
    const colors = [
        "#FFD700", "#FF6384", "#FF8C00", "#8A2BE2", "#00BFFF", "#4682B4", "#32CD32", "#DC143C", "#8B4513",
        "#E6E6FA", "#D2691E", "#7FFF00", "#FF4500", "#ADFF2F", "#9400D3", "#20B2AA", "#5F9EA0", "#DC143C",
        "#00CED1", "#DAA520", "#FF1493", "#00FA9A", "#8B008B", "#FF69B4", "#B22222", "#32CD32", "#8B0000",
        "#4169E1", "#2E8B57", "#800000", "#BDB76B", "#3CB371", "#7B68EE", "#6A5ACD", "#FFB6C1", "#9932CC",
        "#8A2BE2", "#A52A2A", "#DEB887", "#5F9EA0", "#7FFF00", "#D2691E", "#6495ED", "#FF7F50", "#DC143C",
        "#00FFFF", "#00008B", "#008B8B", "#B8860B", "#A9A9A9", "#006400"
    ];

    languages.forEach((lang, index) => {
        const langWidth = (lang.percent / 100) * barWidth;
        ctx.fillStyle = "#AAAAAA";
        ctx.fillRect(barX, yOffset, barWidth, BAR_HEIGHT);
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(barX, yOffset, langWidth, BAR_HEIGHT);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";
        ctx.fillText(lang.lang, barX, yOffset - TEXT_SPACING);
        ctx.fillText(`${lang.percent}%`, barX + barWidth - 40, yOffset - TEXT_SPACING);
        
        yOffset += BAR_SPACING;
    });

    // Guardar imagen
    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "languages_chart.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'languages_chart.png' generada correctamente.`);
}

module.exports = generateLanguageChart;