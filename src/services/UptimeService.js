// Calculate scores based on status and response time
function calculateScores(data) {
  const scores = {
    statusScore: 0,
    responseTimeScore: 0,
    totalScore: 0,
    details: "",
  };

  if (data.status === 200) {
    scores.statusScore = 70;
    scores.details = "Website is up and running";
  } else {
    scores.statusScore = 0;
    scores.details = `Website is down (Status: ${data.status || "Unknown"})`;
  }

  const responseTime = data.responseTime || data.response_time || 0;

  if (responseTime < 500) {
    scores.responseTimeScore = 30;
  } else if (responseTime < 1500) {
    scores.responseTimeScore = 20;
  } else {
    scores.responseTimeScore = 10;
  }

  scores.totalScore = scores.statusScore + scores.responseTimeScore;

  return scores;
}

async function uptimeService(url) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const storageKey = `uptimeData_${url}`;

  try {
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      const scores = calculateScores(cachedData);
      return scores;
    }

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("uptimeData")) {
        sessionStorage.removeItem(key);
      }
    });

    // Fetch fresh data
    const response = await fetch(`${apiUrl}/check-uptime`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    sessionStorage.setItem(storageKey, JSON.stringify(result));

    const scores = calculateScores(result);

    return scores;
  } catch (error) {
    console.error(`Error checking uptime for ${url}:`, error);
    throw error;
  }
}

export default uptimeService;
