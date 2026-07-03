const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 600;
const HEIGHT = 300;
const PADDING = 40;
const BORDER_RADIUS = 15;
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

// commitsByYear: { "2023": 120, "2024": 340, "2025": 210, ... }
function generateCommitsPerYear(commitsByYear) {
    const years = Object.keys(commitsByYear).sort();
    const values = years.map((y) => commitsByYear[y]);
    const maxValue = Math.max(...values, 1);

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

    ctx.strokeStyle = "#4B5563";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Arial";
    ctx.fillText("Commits Per Year", PADDING, 35);

    // Área de las barras
    const chartTop = 60;
    const chartBottom = HEIGHT - 40;
    const chartHeight = chartBottom - chartTop;
    const chartLeft = PADDING;
    const chartRight = WIDTH - PADDING;
    const chartWidth = chartRight - chartLeft;
    const barSpacing = 20;
    const barWidth = years.length > 0 ? (chartWidth - barSpacing * (years.length - 1)) / years.length : 0;

    const colors = ["#38BDF8", "#FF6384", "#FFD700", "#32CD32", "#8A2BE2", "#FF8C00", "#00BFFF", "#DC143C"];

    years.forEach((year, index) => {
        const value = commitsByYear[year];
        const barHeight = (value / maxValue) * chartHeight;
        const x = chartLeft + index * (barWidth + barSpacing);
        const y = chartBottom - barHeight;

        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Valor arriba de la barra
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(String(value), x + barWidth / 2, y - 8);

        // Año debajo de la barra
        ctx.fillText(year, x + barWidth / 2, chartBottom + 20);
    });
    ctx.textAlign = "left";

    // Línea base
    ctx.strokeStyle = "#4B5563";
    ctx.beginPath();
    ctx.moveTo(chartLeft, chartBottom);
    ctx.lineTo(chartRight, chartBottom);
    ctx.stroke();

    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "commits_per_year.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'commits_per_year.png' generada correctamente.`);
}

module.exports = generateCommitsPerYear;
