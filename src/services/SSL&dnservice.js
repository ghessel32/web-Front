const SSL_WEIGHT = 50;
const DOMAIN_VALIDITY_WEIGHT = 30;
const DOMAIN_PROTECTION_WEIGHT = 20;

// SSL status types that are considered valid
const VALID_SSL_KEYWORDS = ["VALID", "ACTIVE", "OK", "SECURE"];

// Calculate SSL score based on status
function calculateSSLScore(data) {
  const status = (data.Status || data.status || "").toUpperCase();
  const hasValidKeyword = VALID_SSL_KEYWORDS.some((keyword) =>
    status.includes(keyword)
  );

  const score = hasValidKeyword ? SSL_WEIGHT : 0;
  return Math.round(score * 100) / 100;
}

// Calculate domain score based on protection
function calculateDomainScore(data) {
  let score = 0;

  const daysLeft = data.daysLeft || data.days_left || 0;
  if (daysLeft > 2) {
    score += DOMAIN_VALIDITY_WEIGHT;
  }

  // Check if domain is protected
  const isProtected = data.isProtected || data.is_protected || false;
  if (isProtected) {
    score += DOMAIN_PROTECTION_WEIGHT;
  }

  return Math.round(score * 100) / 100;
}

// Generate dynamic SSL & Domain message
function getSSLDomainMessage(sslScore, domainScore) {
  const isSSLValid = sslScore === SSL_WEIGHT;
  const isDomainValid = domainScore >= DOMAIN_VALIDITY_WEIGHT;

  if (isSSLValid && isDomainValid) {
    return "SSL & Domain are valid";
  } else if (isSSLValid && !isDomainValid) {
    return "SSL is valid but Domain is not";
  } else if (!isSSLValid && isDomainValid) {
    return "Domain is valid but SSL is not";
  } else {
    return "SSL & Domain are not valid";
  }
}

// Main function to get SSL and Domain scores
async function getSSLDomainScore(url) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const domain = url ? new URL(url).hostname : null;
  const sslKey = `ssl_${url}`;
  const domainKey = `domain_${domain}`;

  try {
    // Try to get from cache
    const cachedSSL = sessionStorage.getItem(sslKey);
    const cachedDomain = sessionStorage.getItem(domainKey);

    let sslData, domainData;

    if (cachedSSL && cachedDomain) {
      sslData = JSON.parse(cachedSSL);
      domainData = JSON.parse(cachedDomain);
    } else {
      // Clear older cache entries
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("ssl_") || key.startsWith("domain_")) {
          sessionStorage.removeItem(key);
        }
      });

      // Fetch from backend
      const [sslResponse, domainResponse] = await Promise.all([
        fetch(`${apiUrl}/ssl`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }),
        fetch(`${apiUrl}/domain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain }),
        }),
      ]);

      sslData = await sslResponse.json();
      domainData = await domainResponse.json();

      // Store raw data only
      sessionStorage.setItem(sslKey, JSON.stringify(sslData));
      sessionStorage.setItem(domainKey, JSON.stringify(domainData));
    }

    // Calculate scores only
    const sslScore = calculateSSLScore(sslData);
    const domainScore = calculateDomainScore(domainData);
    const totalScore = Math.round((sslScore + domainScore) * 100) / 100;
    
    // Generate dynamic message
    const message = getSSLDomainMessage(sslScore, domainScore);

    // ✅ Return only scores and dynamic message
    return {
      totalScore,
      ssl: sslScore,
      domain: domainScore,
      details: message,
    };
  } catch (error) {
    console.error(`Error getting SSL & Domain data for ${url}:`, error);
    throw error;
  }
}

export default getSSLDomainScore;