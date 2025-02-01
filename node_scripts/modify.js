const fs = require("fs");

const readmePath = "README.md";

function updateReadme() {
    if (!fs.existsSync(readmePath)) {
        console.error("⚠️ No se encontró el README.md");
        return;
    }

    const readmeContent = fs.readFileSync(readmePath, "utf-8").split("\n");
    const startMarker = "<!-- LANGUAGES-START -->";
    const endMarker = "<!-- LANGUAGES-END -->";

    if (!readmeContent.includes(startMarker) || !readmeContent.includes(endMarker)) {
        console.error("⚠️ No se encontraron los marcadores en el README. Verifica que estén presentes.");
        return;
    }

    const startIdx = readmeContent.indexOf(startMarker) + 1;
    const endIdx = readmeContent.indexOf(endMarker);


    const newSection = [
        "## 📊 GitHub Stats\n\n",
        `<table align="center">
  <tr>
    <td align="center">
      <img src="./node_scripts/scripts/github_stats.png" />
    </td>
    <td align="center">
      <img src="./node_scripts/scripts/language_chart.png" />
    </td>
  </tr>
</table>`,
        "\n\n---------\n\n",
        "## 🔢 Lenguajes Usados\n\n",
        `<table align="center">
  <tr>
    <td align="center">
      <img src="./node_scripts/scripts/languages_chart.png" />
    </td>
  </tr>
</table>\n\n\n`,
        `\n<!-- Última actualización: ${new Date().toISOString()} -->\n`
    ];

    const updatedReadme = [
        ...readmeContent.slice(0, startIdx),
        ...newSection,
        ...readmeContent.slice(endIdx)
    ].join("\n");

    fs.writeFileSync(readmePath, updatedReadme, "utf-8");
    console.log("✅ README.md actualizado correctamente.");
}

module.exports = updateReadme;