// Calculate score based on broken links
function calculateBrokenLinksScore(data) {
  const totalLinks = data.totalLinks || data.total_links || 0;
  const brokenLinks = data.brokenLinks || data.broken_links || 0;

  let score = 0;

  if (totalLinks > 0) {
    score = 100 * (1 - brokenLinks / totalLinks);
  } else {
    score = 100; // No links means perfect score
  }

  const message = `${brokenLinks} broken links found out of ${totalLinks}`;

  return {
    totalScore: Math.floor(score),
    details: message,
  };
}

async function broLinkservice(url) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const storageKey = `brokenLinks_${url}`;

  try {
    // Check if raw data exists in sessionStorage
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      const scoreData = calculateBrokenLinksScore(cachedData);
      return scoreData;
    }

    // Clear all other brokenLinks entries before fetching new data
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("brokenLinks_")) {
        sessionStorage.removeItem(key);
      }
    });

    // Fetch fresh data
    const response = await fetch(`${apiUrl}/broken-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    // Store ONLY raw data in sessionStorage
    sessionStorage.setItem(storageKey, JSON.stringify(result));

    // Calculate and return score (not stored)
    const scoreData = calculateBrokenLinksScore(result);

    return scoreData;
  } catch (error) {
    console.error(`Error checking broken links for ${url}:`, error);
    throw error;
  }
}

export default broLinkservice;
