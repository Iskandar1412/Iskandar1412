const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const WIDTH = 600;
const HEIGHT = 300;
const BORDER_RADIUS = 15;
const BAR_HEIGHT = 35;
const PADDING = 30;
const scriptsPath = path.join(__dirname, "scripts");

if (!fs.existsSync(scriptsPath)) {
    fs.mkdirSync(scriptsPath, { recursive: true });
}

function generateTopLanguagesThisYear(languagesThisYear) {
    const languages = languagesThisYear.slice(0, 9);
    const currentYear = new Date().getFullYear();

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

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

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`Top Languages ${currentYear}`, PADDING, 40);

    if (languages.length === 0) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#AAAAAA";
        ctx.fillText("Sin actividad registrada este año", PADDING, 150);
    } else {
        const barX = PADDING;
        const barY = 70;
        const barWidth = WIDTH - PADDING * 2;
        ctx.fillStyle = "#33394D";
        ctx.fillRect(barX, barY, barWidth, BAR_HEIGHT);

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
    }

    const buffer = canvas.toBuffer("image/png");
    const outputPath = path.join(scriptsPath, "top_languages_this_year.png");
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Imagen 'top_languages_this_year.png' generada correctamente.`);
}

module.exports = generateTopLanguagesThisYear;
