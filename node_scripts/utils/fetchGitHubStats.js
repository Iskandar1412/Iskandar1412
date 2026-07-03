const axios = require("axios");

const GITHUB_TOKEN = process.env.PAT_GITHUB_PRIVATE;
const headers = { Authorization: `Bearer ${GITHUB_TOKEN}` };
const USERNAME = "Iskandar1412";
const CURRENT_YEAR = new Date().getFullYear();

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

// Trae TODOS los commits del usuario en un repo, paginando, filtrado por autor.
// MAX_PAGES es un límite de seguridad para no disparar cientos de requests en repos gigantes.
async function fetchAllCommitsForRepo(repoName, MAX_PAGES = 10) {
    let allCommits = [];
    let page = 1;
    let fetched;

    do {
        const response = await axios.get(
            `https://api.github.com/repos/${USERNAME}/${repoName}/commits`,
            {
                headers,
                params: {
                    author: USERNAME, // solo tus commits, no los de colaboradores
                    per_page: 100,
                    page,
                },
            }
        );
        fetched = response.data;
        allCommits = allCommits.concat(fetched);
        page++;
    } while (fetched.length === 100 && page <= MAX_PAGES);

    return allCommits;
}

async function fetchGitHubStats() {
    try {
        console.log("📡 Obteniendo estadísticas de GitHub...");

        const userResponse = await axios.get("https://api.github.com/user", { headers });

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
        let commitsByYear = {};
        const languageStats = {};
        const languageStatsThisYear = {};
        let totalBytes = 0;
        let totalBytesThisYear = 0;

        await Promise.all(repos.map(async (repo) => {
            totalStars += repo.stargazers_count;
            const createdYear = new Date(repo.created_at).getFullYear();
            repoCreationTimeline[createdYear] = (repoCreationTimeline[createdYear] || 0) + 1;

            try {
                let languagesData = {};
                let repoTotalBytes = 0;

                if (repo.languages_url) {
                    const langResponse = await axios.get(repo.languages_url, { headers });
                    languagesData = langResponse.data;
                    repoTotalBytes = Object.values(languagesData).reduce((a, b) => a + b, 0);

                    for (const [lang, bytes] of Object.entries(languagesData)) {
                        if (!languageStats[lang]) {
                            languageStats[lang] = { bytes: 0, percent: 0 };
                        }
                        languageStats[lang].bytes += bytes;
                    }
                    totalBytes += repoTotalBytes;
                }

                const repoCommits = await fetchAllCommitsForRepo(repo.name);
                totalCommits += repoCommits.length;

                let touchedThisYear = false;

                repoCommits.forEach((commit) => {
                    const commitDate = new Date(commit.commit.author.date);
                    const hour = commitDate.getHours();
                    commitActivity[hour]++;

                    const year = commitDate.getFullYear();
                    commitsByYear[year] = (commitsByYear[year] || 0) + 1;
                    if (year === CURRENT_YEAR) touchedThisYear = true;

                    const daysAgo = Math.floor((Date.now() - commitDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysAgo < 30) commitsLast30Days[29 - daysAgo]++;
                });

                // Si tocaste este repo este año, sus bytes de lenguaje cuentan para "lenguajes del año"
                if (touchedThisYear && repoTotalBytes > 0) {
                    for (const [lang, bytes] of Object.entries(languagesData)) {
                        if (!languageStatsThisYear[lang]) {
                            languageStatsThisYear[lang] = { bytes: 0, percent: 0 };
                        }
                        languageStatsThisYear[lang].bytes += bytes;
                    }
                    totalBytesThisYear += repoTotalBytes;
                }

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

        if (totalBytesThisYear > 0) {
            Object.keys(languageStatsThisYear).forEach((lang) => {
                languageStatsThisYear[lang].percent = ((languageStatsThisYear[lang].bytes / totalBytesThisYear) * 100).toFixed(2);
            });
        }

        const sortedLanguages = Object.entries(languageStats)
            .map(([lang, data]) => ({ lang, percent: parseFloat(data.percent) }))
            .sort((a, b) => b.percent - a.percent);

        const sortedLanguagesThisYear = Object.entries(languageStatsThisYear)
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
            commitsByYear,
            prStatus,
            issueStatus,
            languages: sortedLanguages,
            languagesThisYear: sortedLanguagesThisYear,
            repoCreationTimeline,
            contributionsLastYear,
        };
    } catch (error) {
        console.error("❌ Error obteniendo estadísticas de GitHub:", error.message);
        return null;
    }
}

module.exports = fetchGitHubStats;