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

// Trae TODOS tus commits (repos propios Y ajenos) usando el Search API de GitHub.
// Límite duro de la API: 1000 resultados por búsqueda (10 páginas de 100).
async function fetchAllCommitsViaSearch() {
    let allItems = [];
    let page = 1;
    let totalCount = 0;
    let fetchedCount;

    do {
        const response = await axios.get("https://api.github.com/search/commits", {
            headers,
            params: {
                q: `author:${USERNAME}`,
                per_page: 100,
                page,
                sort: "author-date",
                order: "desc",
            },
        });
        totalCount = response.data.total_count;
        fetchedCount = response.data.items.length;
        allItems = allItems.concat(response.data.items);
        page++;
    } while (fetchedCount === 100 && allItems.length < 1000);

    if (totalCount > allItems.length) {
        console.warn(`⚠️ Tienes ${totalCount} commits en total, pero el Search API de GitHub solo permite traer los primeros ${allItems.length}. El conteo de commits está topado ahí.`);
    }

    return { items: allItems, totalCount };
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

        // 1. Commits: propios + ajenos, vía Search API
        const { items: commitItems, totalCount: totalCommits } = await fetchAllCommitsViaSearch();

        let commitActivity = Array(24).fill(0);
        let commitsLast30Days = Array(30).fill(0);
        let commitsByYear = {};
        let commitsByRepo = {}; // { "owner/repo": { count, owner, isOwn } }
        let reposTouchedThisYear = new Set();

        commitItems.forEach((item) => {
            const commitDate = new Date(item.commit.author.date);
            const hour = commitDate.getHours();
            const year = commitDate.getFullYear();

            commitActivity[hour]++;
            commitsByYear[year] = (commitsByYear[year] || 0) + 1;

            const daysAgo = Math.floor((Date.now() - commitDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysAgo >= 0 && daysAgo < 30) commitsLast30Days[29 - daysAgo]++;

            const repoFullName = item.repository.full_name;
            const repoOwner = item.repository.owner.login;
            const isOwn = repoOwner.toLowerCase() === USERNAME.toLowerCase();

            if (!commitsByRepo[repoFullName]) {
                commitsByRepo[repoFullName] = { count: 0, owner: repoOwner, isOwn };
            }
            commitsByRepo[repoFullName].count++;

            if (year === CURRENT_YEAR && isOwn) {
                reposTouchedThisYear.add(repoFullName);
            }
        });

        const topCommitsByRepo = Object.entries(commitsByRepo)
            .map(([repo, data]) => ({ repo, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 2. Stars, lenguajes, PRs, issues -> solo repos propios (como antes)
        let totalStars = 0, totalPRs = 0, totalIssues = 0;
        let prStatus = { open: 0, closed: 0, merged: 0 };
        let issueStatus = { open: 0, closed: 0 };
        let repoCreationTimeline = {};
        const languageStats = {};
        const languageStatsThisYear = {};
        let totalBytes = 0;
        let totalBytesThisYear = 0;

        await Promise.all(repos.map(async (repo) => {
            totalStars += repo.stargazers_count;
            const createdYear = new Date(repo.created_at).getFullYear();
            repoCreationTimeline[createdYear] = (repoCreationTimeline[createdYear] || 0) + 1;

            try {
                if (repo.languages_url) {
                    const langResponse = await axios.get(repo.languages_url, { headers });
                    const languagesData = langResponse.data;
                    const repoTotalBytes = Object.values(languagesData).reduce((a, b) => a + b, 0);

                    for (const [lang, bytes] of Object.entries(languagesData)) {
                        if (!languageStats[lang]) languageStats[lang] = { bytes: 0, percent: 0 };
                        languageStats[lang].bytes += bytes;
                    }
                    totalBytes += repoTotalBytes;

                    if (reposTouchedThisYear.has(repo.full_name) && repoTotalBytes > 0) {
                        for (const [lang, bytes] of Object.entries(languagesData)) {
                            if (!languageStatsThisYear[lang]) languageStatsThisYear[lang] = { bytes: 0, percent: 0 };
                            languageStatsThisYear[lang].bytes += bytes;
                        }
                        totalBytesThisYear += repoTotalBytes;
                    }
                }

                const prsResponse = await axios.get(`https://api.github.com/repos/${USERNAME}/${repo.name}/pulls?state=all&per_page=100`, { headers });
                prsResponse.data.forEach((pr) => {
                    if (pr.state === "open") prStatus.open++;
                    if (pr.state === "closed") prStatus.closed++;
                    if (pr.merged_at) prStatus.merged++;
                });
                totalPRs += prsResponse.data.length;

                const issuesResponse = await axios.get(`https://api.github.com/repos/${USERNAME}/${repo.name}/issues?state=all&per_page=100`, { headers });
                issuesResponse.data.forEach((issue) => {
                    if (issue.pull_request) return;
                    if (issue.state === "open") issueStatus.open++;
                    if (issue.state === "closed") issueStatus.closed++;
                    totalIssues++;
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
            commitsByRepo: topCommitsByRepo,
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
