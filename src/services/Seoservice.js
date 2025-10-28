// seoService.js

function calculateSEOScore(data) {
  let score = 0;
  const present = [];
  const missing = [];

  const weights = {
    title: 15,
    metaDescription: 15,
    h1: 10,
    robots: 10,
    sitemap: 10,
    canonical: 10,
    mobileFriendly: 10,
    openGraph: 10,
    twitter: 10,
  };

  const labels = {
    title: "title tag",
    metaDescription: "meta description",
    h1: "H1 tag",
    robots: "robots.txt",
    sitemap: "sitemap",
    canonical: "canonical URL",
    mobileFriendly: "mobile-friendly",
    openGraph: "Open Graph tags",
    twitter: "Twitter Card tags",
  };

  // Check basic SEO fields
  for (const key of [
    "title",
    "metaDescription",
    "h1",
    "robots",
    "sitemap",
    "canonical",
  ]) {
    const value = data[key];
    if (value && value !== "Not found" && value !== null) {
      score += weights[key];
      present.push(labels[key]);
    } else {
      missing.push(labels[key]);
    }
  }

  // Check mobile friendly
  if (data.mobileFriendly === true) {
    score += weights.mobileFriendly;
    present.push(labels.mobileFriendly);
  } else {
    missing.push(labels.mobileFriendly);
  }

  // Check Open Graph tags
  if (data.openGraph && data.openGraph.present === true) {
    score += weights.openGraph;
    present.push(labels.openGraph);
  } else {
    missing.push(labels.openGraph);
  }

  // Check Twitter Card tags
  if (data.twitter && data.twitter.present === true) {
    score += weights.twitter;
    present.push(labels.twitter);
  } else {
    missing.push(labels.twitter);
  }

  // Generate message
  let message = "";
  if (present.length > 0) {
    message = present.slice(0, 3).join(", ");
    if (present.length > 3) {
      message += `, +${present.length - 3} more`;
    }
  } else {
    message = "No SEO elements found";
  }

  return {
    totalScore: score,
    details : message,
  };
}

async function seoService(url) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const storageKey = `seoData_${url}`;

  try {
    // Check for cached data
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      const result = calculateSEOScore(cachedData);
      return result;
    }

    // Clear old SEO data from session storage
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("seoData_")) {
        sessionStorage.removeItem(key);
      }
    });

    // Fetch fresh data
    const response = await fetch(`${apiUrl}/seo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    // Check if site is blocked
    if (result.blocked) {
      throw new Error(result.message || "Site is blocked or protected");
    }

    // Store raw data in session storage
    sessionStorage.setItem(storageKey, JSON.stringify(result));

    // Calculate and return scores
    const scores = calculateSEOScore(result);
    return scores;
  } catch (error) {
    console.error(`Error fetching SEO data for ${url}:`, error);
    throw error;
  }
}

export default seoService;
