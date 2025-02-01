function calculateScore(stats) {
    let score = 0;

    score += stats.totalCommits * 0.1;  // Cada 10 commits = 1 punto
    score += stats.totalStars * 2;      // Cada estrella = 2 puntos
    score += stats.totalPRs * 5;        // Cada PR = 5 puntos
    score += stats.totalIssues * 2;     // Cada issue cerrado = 2 puntos
    score += stats.contributionsLastYear * 0.5;  // Contribuciones recientes importan más

    return score;
}

function getGrade(score) {
    if (score > 500) return "S";
    if (score > 300) return "A";
    if (score > 200) return "B";
    if (score > 100) return "C";
    if (score > 50) return "D";
    return "E";
}

module.exports = { calculateScore, getGrade };
