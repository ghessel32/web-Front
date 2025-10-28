const SECURITY_WEIGHTS = {
  httpsEnabled: 20,
  hstsHeader: 15,
  contentSecurityPolicy: 15,
  xFrameOptions: 10,
};

const THREAT_WEIGHT = 40;

// Calculate security score based on headers
function calculateSecurityScore(data) {
  let score = 0;

  if (data.httpsEnabled || data.https_enabled)
    score += SECURITY_WEIGHTS.httpsEnabled;
  if (data.hstsHeader || data.hsts_header) score += SECURITY_WEIGHTS.hstsHeader;
  if (data.contentSecurityPolicy || data.content_security_policy)
    score += SECURITY_WEIGHTS.contentSecurityPolicy;
  if (data.xFrameOptions || data.x_frame_options)
    score += SECURITY_WEIGHTS.xFrameOptions;

  return Math.round(score * 100) / 100;
}

// Calculate threat score
export function calculateThreatScore(data) {
  if (!data) return 0; // safeguard

  const isSafe = data.safe === true;
  const score = isSafe ? THREAT_WEIGHT : 0;

  return Math.round(score * 100) / 100;
}

// Generate dynamic security message
function getSecurityMessage(totalScore) {
  if (totalScore === 100) {
    return "Excellent security - all measures in place";
  } else if (totalScore >= 70) {
    return "Website has some security issues";
  } else {
    return "No security vulnerabilities detected";
  }
}

// Main function to get security and threat data
async function getSecurityThreatScore(url) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const securityKey = `security_${url}`;
  const threatKey = `threat_${url}`;

  try {
    // Try to get from cache
    const cachedSecurity = sessionStorage.getItem(securityKey);
    const cachedThreat = sessionStorage.getItem(threatKey);

    let securityData, threatData;

    if (cachedSecurity && cachedThreat) {
      securityData = JSON.parse(cachedSecurity);
      threatData = JSON.parse(cachedThreat);
    } else {
      // Clear older cache entries
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("security_") || key.startsWith("threat_")) {
          sessionStorage.removeItem(key);
        }
      });

      // Fetch from backend
      const [securityResponse, threatResponse] = await Promise.all([
        fetch(`${apiUrl}/security`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }),
        fetch(`${apiUrl}/threat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }),
      ]);

      securityData = await securityResponse.json();
      threatData = await threatResponse.json();

      // Store raw data only
      sessionStorage.setItem(securityKey, JSON.stringify(securityData));
      sessionStorage.setItem(threatKey, JSON.stringify(threatData));
    }

    // Calculate scores only
    const securityScore = calculateSecurityScore(securityData);
    const threatScore = calculateThreatScore(threatData);
    const totalScore = Math.round((securityScore + threatScore) * 100) / 100;

    // Generate dynamic message based on total score
    const message = getSecurityMessage(totalScore);

    // ✅ Return only scores and dynamic message
    return {
      totalScore,
      security: securityScore,
      threat: threatScore,
      details: message,
    };
  } catch (error) {
    console.error(`Error getting security & threat data for ${url}:`, error);
    throw error;
  }
}

export default getSecurityThreatScore;
