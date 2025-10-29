import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  Globe,
  Zap,
  Shield,
  Link,
  Search,
  Activity,
} from "lucide-react";

import uptimeService from "../services/UptimeService.js";
import broLinkservice from "../services/BroLinkservice.js";
import getSecurityThreatScore from "../services/Securityservice.js";
import getSSLDomainScore from "../services/SSL&dnservice.js";
import seoService from "../services/Seoservice.js";
import speedService from "../services/Speedservice.js";

// Constants moved outside component to prevent recreation
const CHECKS_CONFIG = [
  {
    id: "uptime",
    label: "Uptime Check",
    icon: Activity,
    color: "text-green-500",
  },
  { id: "speed", label: "Speed Test", icon: Zap, color: "text-yellow-500" },
  { id: "seo", label: "SEO Analysis", icon: Search, color: "text-blue-500" },
  {
    id: "ssl",
    label: "SSL Certificate",
    icon: Shield,
    color: "text-purple-500",
  },
  {
    id: "security",
    label: "Security Scan",
    icon: Shield,
    color: "text-red-500",
  },
  { id: "links", label: "Broken Links", icon: Link, color: "text-orange-500" },
];

const extractDomain = (urlString) => {
  try {
    const input = urlString.startsWith("http")
      ? urlString
      : `https://${urlString}`;
    const url = new URL(input);

    const hostname = url.hostname.replace(/^www\./, "");
    const normalized = `${url.protocol}//${hostname}`;

    return normalized.toLowerCase();
  } catch {
    return urlString.trim().toLowerCase();
  }
};

const getScoreColor = (score) => {
  if (score >= 90) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  return "text-red-500";
};

const getScoreBg = (score) => {
  if (score >= 90) return "bg-green-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-red-500";
};

const getScoreStatus = (score) => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  return "Needs Improvement";
};

export default function WebsiteAnalyzer() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [cardResults, setCardResults] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [overallScore, setOverallScore] = useState(null);
  const [websiteInfo, setWebsiteInfo] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Memoize website info to prevent unnecessary recalculations
  const faviconUrl = useMemo(
    () =>
      websiteInfo &&
      `https://www.google.com/s2/favicons?domain=${websiteInfo.url}&sz=128`,
    [websiteInfo]
  );

  const handleAnalyze = async () => {
    if (!url) return;

    setIsAnalyzing(true);
    setShowResults(true);
    setCardResults({});
    setCompletedCount(0);
    setOverallScore(null);
    setPageError(null);

    try {
      const response = await fetch(`${apiUrl}/check-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      console.log(data);

      if (!data.exists) {
        setIsAnalyzing(false);
        setPageError(
          "Page does not exist. Please check the URL and try again."
        );
        return;
      }
    } catch (err) {
      console.error("check-page error:", err);
      setIsAnalyzing(false);
      setPageError("Unable to verify page. Please try again later.");
      return;
    }

    const normalizedUrl = extractDomain(url);
    const domain = normalizedUrl.replace(/^https?:\/\//, "");
    const websiteName =
      domain.split(".")[0].charAt(0).toUpperCase() +
      domain.split(".")[0].slice(1);

    setWebsiteInfo({
      name: websiteName,
      url: normalizedUrl,
    });

    const services = {
      uptime: uptimeService(normalizedUrl),
      links: broLinkservice(normalizedUrl),
      security: getSecurityThreatScore(normalizedUrl),
      ssl: getSSLDomainScore(normalizedUrl),
      seo: seoService(normalizedUrl),
      speed: speedService(normalizedUrl),
    };

    const results = {};
    let completed = 0;

    Object.entries(services).forEach(([key, promise]) => {
      promise
        .then((data) => {
          const score = data?.totalScore || 0;
          const status = getScoreStatus(score);
          const details = data?.details || `Score: ${score.toFixed(1)}`;

          results[key] = score;

          setCardResults((prev) => ({
            ...prev,
            [key]: { score, status, details },
          }));

          completed++;
          setCompletedCount(completed);

          if (completed === Object.keys(services).length) {
            const scores = Object.values(results);
            const overall =
              scores.reduce((acc, curr) => acc + curr, 0) / scores.length;

            const finalScore = Math.round(overall);
            console.log("final score", finalScore);

            setOverallScore(finalScore);
            setIsAnalyzing(false);

            sessionStorage.setItem(
              `score_${urlToCheck}`,
              JSON.stringify(results)
            );

            fetch(`${apiUrl}/add-website`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: websiteName,
                url: urlToCheck,
                score: finalScore,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log("Add website:", data?.msg || "No message");
              })
              .catch((err) => {
                console.error("add-website error:", err);
              });
          }
        })
        .catch((err) => {
          console.error(`${key} error:`, err);
          completed++;
          setCompletedCount(completed);

          if (completed === Object.keys(services).length) {
            setIsAnalyzing(false);
          }
        });
    });
  };

  const handleSeeDetails = () => {
    const websiteData = {
      name: websiteInfo?.name,
      url: websiteInfo?.url,
    };

    navigate("/details", { state: websiteData });
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 pt-8">
            <Globe className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-white mb-3">
              Website Health Checker
            </h1>
            <p className="text-gray-300 text-lg">
              Comprehensive health check for your website
            </p>
          </header>

          {/* Input Section */}
          {!isAnalyzing && !overallScore && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 md:p-8 mb-8 border border-white/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base sm:text-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                  aria-label="Website URL"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={!url}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  Analyze
                </button>
              </div>
            </div>
          )}

          {pageError && (
            <div className="bg-red-500/20 text-red-400 text-center p-4 rounded-xl border border-red-500/40 mb-6">
              {pageError}
            </div>
          )}

          {/* Results Section */}
          {showResults && websiteInfo && (
            <div className="space-y-6">
              {/* Website Info Box */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                    <img
                      src={faviconUrl}
                      alt={`${websiteInfo.name} favicon`}
                      className="w-12 h-12 rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.querySelector(
                          ".fallback-icon"
                        ).style.display = "flex";
                      }}
                    />
                    <Globe
                      className="w-8 h-8 text-cyan-400 fallback-icon"
                      style={{ display: "none" }}
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">
                      {websiteInfo.name}
                    </h2>
                    <p className="text-gray-400">{websiteInfo.url}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isAnalyzing && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold">
                      Analysis Progress
                    </span>
                    <span className="text-purple-400 font-bold">
                      {completedCount} of {CHECKS_CONFIG.length} complete
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                      style={{
                        width: `${
                          (completedCount / CHECKS_CONFIG.length) * 100
                        }%`,
                      }}
                      role="progressbar"
                      aria-valuenow={completedCount}
                      aria-valuemin="0"
                      aria-valuemax={CHECKS_CONFIG.length}
                    />
                  </div>
                </div>
              )}

              {/* Overall Score */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p- border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Overall Health Score
                </h2>
                <div className="relative w-48 h-48 mx-auto">
                  {overallScore === null ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold text-gray-500 animate-pulse">
                        -
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-full h-full transform -rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-white/20"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 88 * (1 - overallScore / 100)
                          }`}
                          className={`${getScoreColor(
                            overallScore
                          )} transition-all duration-1000`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <div
                            className={`text-6xl font-bold ${getScoreColor(
                              overallScore
                            )}`}
                          >
                            {overallScore}
                          </div>
                          <div className="text-gray-300 text-sm">
                            out of 100
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CHECKS_CONFIG.map((check) => {
                  const Icon = check.icon;
                  const result = cardResults[check.id];
                  const isLoading = !result;

                  return (
                    <div
                      key={check.id}
                      className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all duration-500 ${
                        !isLoading
                          ? "scale-100 opacity-100"
                          : "scale-95 opacity-70"
                      }`}
                    >
                      {isLoading ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/10">
                              <Icon className={`w-6 h-6 ${check.color}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {check.label}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Analyzing...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-center py-8">
                            <Loader2
                              className={`w-12 h-12 ${check.color} animate-spin`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="animate-in fade-in duration-500">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white/10">
                                <Icon className={`w-6 h-6 ${check.color}`} />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {check.label}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  {result.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`text-2xl font-bold ${getScoreColor(
                                  result.score
                                )}`}
                              >
                                {result.score}
                              </div>
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                            <div
                              className={`h-2 rounded-full ${getScoreBg(
                                result.score
                              )} transition-all duration-1000`}
                              style={{ width: `${result.score}%` }}
                              role="progressbar"
                              aria-valuenow={result.score}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                          <p className="text-sm text-gray-300">
                            {result.details}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!showResults && (
            <div className="text-center py-16">
              <Globe className="w-24 h-24 text-cyan-400/50 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Enter a URL above to start analyzing your website
              </p>
            </div>
          )}

          {completedCount == 6 && (
            <div className="w-full flex justify-center">
              <button
                onClick={handleSeeDetails}
                className="text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-white font-bold px-5 sm:px-5 py-3 rounded-md cursor-pointer transition-all duration-200 m-5"
              >
                See Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
