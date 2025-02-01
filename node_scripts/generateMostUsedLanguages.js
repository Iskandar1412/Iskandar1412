const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 600;
const HEIGHT = 300;
const BORDER_RADIUS = 15;
const BAR_HEIGHT = 35; // Aumentamos más el grosor de la barra principal
const PADDING = 30;
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

function generateLanguageChart(languages) {
    // Limitar a top 9 lenguajes
    languages = languages.slice(0, 9);
    
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Fondo con bordes redondeados
    ctx.fillStyle = "#1E293B";
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

    // Borde
    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Most Used Languages", PADDING, 40);

    // Fondo de la barra completa
    const barX = PADDING;
    const barY = 70;
    const barWidth = WIDTH - PADDING * 2;
    ctx.fillStyle = "#33394D";
    ctx.fillRect(barX, barY, barWidth, BAR_HEIGHT);

    // Barra de progreso con colores distribuidos correctamente
    let xOffset = barX;
    const colors = ["#FF6384", "#FF8C00", "#8A2BE2", "#00BFFF", "#FFD700", "#4682B4", "#32CD32", "#DC143C", "#8B4513"];
    let colorIndex = 0;

    languages.forEach((lang) => {
        const langWidth = (lang.percent / 100) * barWidth;
        ctx.fillStyle = colors[colorIndex % colors.length];
        ctx.fillRect(xOffset, barY, langWidth, BAR_HEIGHT);
        xOffset += langWidth;
        colorIndex++;
    });

    // Distribución mejorada del texto más abajo
    let yOffset = 170;
    const rowSpacing = 35;
    const colSpacing = WIDTH / 3;
    const textXOffsets = [PADDING + 10, PADDING + colSpacing + 20, PADDING + 2 * colSpacing];
    
    colorIndex = 0;
    languages.forEach((lang, index) => {
        const colIndex = index % 3;
        if (colIndex === 0 && index !== 0) yOffset += rowSpacing;
        const xOffset = textXOffsets[colIndex];
        
        ctx.fillStyle = colors[colorIndex % colors.length];
        ctx.beginPath();
        ctx.arc(xOffset, yOffset, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "14px Arial";
        ctx.fillText(`${lang.lang} ${lang.percent}%`, xOffset + 15, yOffset + 4);
        colorIndex++;
    });

    // Guardar imagen
    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "language_chart.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'language_chart.png' generada correctamente.`);
}

module.exports = generateLanguageChart;