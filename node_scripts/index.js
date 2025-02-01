const fetchGitHubStats = require("./utils/fetchGitHubStats");
const { calculateScore, getGrade } = require("./utils/calculateGrade");
const generateGitHubStatsImage = require("./generateGitHubStatsImage");
const generateMostUsedLanguages = require("./generateMostUsedLanguages");
const generateGraphLanguages = require("./generateGraphLanguages");
const updateReadme = require("./modify");

async function main() {
    const stats = await fetchGitHubStats();
    if (!stats) return console.log("❌ No se encontraron datos.");

    console.log(stats)
    const score = calculateScore(stats);
    const grade = getGrade(score);

    await generateGitHubStatsImage(stats, grade);
    await generateMostUsedLanguages(stats.languages);
    await generateGraphLanguages(stats.languages);

    await updateReadme();
}

main();
