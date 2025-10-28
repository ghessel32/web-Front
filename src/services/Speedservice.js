// speedService.js

function calculateSpeedScore(data) {
  const weights = {
    FCP: 5,
    LCP: 10,
    TBT: 10,
    CLS: 5,
    render: 5,
    img: 5,
    font: 5,
    third: 5,
  };

  const metricMapping = {
    "First Contentful Paint": "FCP",
    "Largest Contentful Paint": "LCP",
    "Total Blocking Time": "TBT",
    "Cumulative Layout Shift": "CLS",
  };

  const issueMapping = {
    "Render-Blocking Requests": "render",
    "Image Optimization": "img",
    "Font Optimization": "font",
    "Third-Party Scripts": "third",
  };

  function scoreMetrics(labData) {
    let score = 0;

    for (const [metricName, value] of Object.entries(labData)) {
      const key = metricMapping[metricName];
      if (!key) continue;

      const weight = weights[key];

      if (value === "fast") {
        score += weight;
      } else if (value === "moderate") {
        score += weight * 0.5;
      }
      // "slow" gives 0 points
    }

    return score;
  }

  function scoreIssues(issuesArray) {
    let score = 0;
    const foundIssues = new Set();

    // Count unique issue types
    issuesArray.forEach((issue) => {
      const key = issueMapping[issue.type];
      if (key) {
        foundIssues.add(key);
      }
    });

    // Award points for issues NOT present
    for (const [issueType, key] of Object.entries(issueMapping)) {
      if (!foundIssues.has(key)) {
        score += weights[key];
      }
    }

    return score;
  }

  function calculateLoadTime(cwvData) {
    if (!cwvData) return 0;
    const lcp = cwvData.LCP || 0;
    const tbt = cwvData.TBT || 0;
    // Both are in milliseconds
    return (lcp + tbt) / 1000; // convert total to seconds
  }

  // Get CWV data (assuming it's available in data object)
  const mobileCWV = data.cwv?.mobile || data.labData?.mobile || {};
  const desktopCWV = data.cwv?.desktop || data.labData?.desktop || {};

  // Calculate load times
  const mobileLoadTime = calculateLoadTime(mobileCWV);
  const desktopLoadTime = calculateLoadTime(desktopCWV);

  // Calculate mobile score
  const mobileMetricsScore = data.labData?.mobile
    ? scoreMetrics(data.labData.mobile)
    : 0;
  const mobileIssuesScore = data.issuesData?.mobile
    ? scoreIssues(data.issuesData.mobile)
    : 0;
  const mobileScore = mobileMetricsScore + mobileIssuesScore;

  // Calculate desktop score
  const desktopMetricsScore = data.labData?.desktop
    ? scoreMetrics(data.labData.desktop)
    : 0;
  const desktopIssuesScore = data.issuesData?.desktop
    ? scoreIssues(data.issuesData.desktop)
    : 0;
  const desktopScore = desktopMetricsScore + desktopIssuesScore;

  // Total score
  const totalScore = mobileScore + desktopScore;

  // Format load time message
  const message = `Load time: MOBILE: ${mobileLoadTime.toFixed(
    2
  )}s & DESKTOP: ${desktopLoadTime.toFixed(2)}s`;

  return {
    mobileScore: Math.round(mobileScore),
    desktopScore: Math.round(desktopScore),
    totalScore: Math.round(totalScore),
    details: message,
  };
}

async function speedService(url) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const storageKey = `speedData_${url}`;

  try {
    // Check for cached data
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      const scores = calculateSpeedScore(cachedData);
      return scores;
    }

    // Clear old speed data from session storage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("speedData_")) {
        sessionStorage.removeItem(key);
      }
    });

    // Fetch fresh data
    const response = await fetch(`${apiUrl}/speed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    // Check if request was successful
    if (!result.success) {
      throw new Error("Speed analysis failed");
    }

    // Store raw data in session storage
    sessionStorage.setItem(storageKey, JSON.stringify(result));

    // Calculate and return scores
    const scores = calculateSpeedScore(result);

    return scores;
  } catch (error) {
    console.error(`Error fetching speed data for ${url}:`, error);
    throw error;
  }
}

export default speedService;
