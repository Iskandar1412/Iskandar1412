const axios = require("axios");

const GITHUB_TOKEN = process.env.PAT_GITHUB_PRIVATE;
const headers = { Authorization: `Bearer ${GITHUB_TOKEN}` };
const USERNAME = "Iskandar1412";

async function fetchContributionsLastYear() {
    const lastYear = new Date().getFullYear() - 1;
    const fromDate = `${lastYear}-01-01T00:00:00Z`;
    const toDate = `${lastYear}-12-31T23:59:59Z`;

    const query = `{
        viewer {
            contributionsCollection(from: "${fromDate}", to: "${toDate}") {
                contributionCalendar {
                    totalContributions
                }
            }
        }
    }`;
    
    try {
        const response = await axios.post("https://api.github.com/graphql", { query }, { headers });
        return response.data.data.viewer.contributionsCollection.contributionCalendar.totalContributions;
    } catch (error) {
        console.error("❌ Error obteniendo contribuciones del último año:", error.message);
        return 0;
    }
}

async function fetchGitHubStats() {
    try {
        console.log("📡 Obteniendo estadísticas de GitHub...");

        // 📌 1. Datos Generales del Usuario
        const userResponse = await axios.get("https://api.github.com/user", { headers });

        // 📌 2. Obtener todos los repositorios (manejo de paginación)
        let page = 1;
        let repos = [];
        let fetchedRepos;
        
        do {
            const reposResponse = await axios.get(`https://api.github.com/user/repos?per_page=100&page=${page}&visibility=all&affiliation=owner`, { headers });
            fetchedRepos = reposResponse.data;
            repos = repos.concat(fetchedRepos);
            page++;
        } while (fetchedRepos.length === 100);

        repos = repos.filter(repo => !repo.fork);

        let totalStars = 0, totalCommits = 0, totalPRs = 0, totalIssues = 0;
        let commitActivity = Array(24).fill(0);
        let prStatus = { open: 0, closed: 0, merged: 0 };
        let issueStatus = { open: 0, closed: 0 };
        let commitsLast30Days = Array(30).fill(0);
        let repoCreationTimeline = {};
        const languageStats = {};
        let totalBytes = 0;

        // 📌 3. Procesar cada repositorio en paralelo
        await Promise.all(repos.map(async (repo) => {
            totalStars += repo.stargazers_count;
            const createdYear = new Date(repo.created_at).getFullYear();
            repoCreationTimeline[createdYear] = (repoCreationTimeline[createdYear] || 0) + 1;

            try {
                if (repo.languages_url) {
                    const langResponse = await axios.get(repo.languages_url, { headers });
                    const languagesData = langResponse.data;
                    let repoTotalBytes = Object.values(languagesData).reduce((a, b) => a + b, 0);

                    for (const [lang, bytes] of Object.entries(languagesData)) {
                        if (!languageStats[lang]) {
                            languageStats[lang] = { bytes: 0, percent: 0 };
                        }
                        languageStats[lang].bytes += bytes;
                    }
                    totalBytes += repoTotalBytes;
                }
                
                const commitsResponse = await axios.get(`https://api.github.com/repos/${USERNAME}/${repo.name}/commits?per_page=100`, { headers });
                const commits = commitsResponse.data;
                totalCommits += commits.length;

                commits.forEach((commit) => {
                    const commitDate = new Date(commit.commit.author.date);
                    const hour = commitDate.getHours();
                    commitActivity[hour]++;

                    const daysAgo = Math.floor((Date.now() - commitDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysAgo < 30) commitsLast30Days[29 - daysAgo]++;
                });

                const prsResponse = await axios.get(`https://api.github.com/repos/${USERNAME}/${repo.name}/pulls?state=all&per_page=100`, { headers });
                prsResponse.data.forEach((pr) => {
                    if (pr.state === "open") prStatus.open++;
                    if (pr.state === "closed") prStatus.closed++;
                    if (pr.merged_at) prStatus.merged++;
                });

                const issuesResponse = await axios.get(`https://api.github.com/repos/${USERNAME}/${repo.name}/issues?state=all&per_page=100`, { headers });
                issuesResponse.data.forEach((issue) => {
                    if (issue.pull_request) return;
                    if (issue.state === "open") issueStatus.open++;
                    if (issue.state === "closed") issueStatus.closed++;
                });

            } catch (error) {
                console.warn(`⚠️ No se pudieron obtener datos para ${repo.name}: ${error.message}`);
            }
        }));

        if (totalBytes > 0) {
            Object.keys(languageStats).forEach((lang) => {
                languageStats[lang].percent = ((languageStats[lang].bytes / totalBytes) * 100).toFixed(2);
            });
        }

        const sortedLanguages = Object.entries(languageStats)
            .map(([lang, data]) => ({ lang, percent: parseFloat(data.percent) }))
            .sort((a, b) => b.percent - a.percent);

        const contributionsLastYear = await fetchContributionsLastYear();

        return {
            username: userResponse.data.login,
            totalRepos: repos.length,
            totalStars,
            totalCommits,
            totalPRs,
            totalIssues,
            commitActivity,
            commitsLast30Days,
            prStatus,
            issueStatus,
            languages: sortedLanguages,
            repoCreationTimeline,
            contributionsLastYear,
        };
    } catch (error) {
        console.error("❌ Error obteniendo estadísticas de GitHub:", error.message);
        return null;
    }
}

module.exports = fetchGitHubStats;