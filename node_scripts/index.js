const fetchGitHubStats = require("./utils/fetchGitHubStats");
const { calculateScore, getGrade } = require("./utils/calculateGrade");
const generateGitHubStatsImage = require("./generateGitHubStatsImage");
const generateMostUsedLanguages = require("./generateMostUsedLanguages")

async function main() {
    const stats = await fetchGitHubStats();
    if (!stats) return console.log("❌ No se encontraron datos.");

    console.log(stats)
    const score = calculateScore(stats);
    const grade = getGrade(score);

    await generateGitHubStatsImage(stats, grade);
    console.log("asdf")
    await generateMostUsedLanguages(stats.languages);
    console.log("bfk")
    console.log(stats.languages)
}

main();
