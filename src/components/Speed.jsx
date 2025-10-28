import React, { useState, useEffect } from "react";
import {
  Zap,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle.jsx";
import SpeedFix from "./speedCompo/SpeedFix.jsx";
import SpeedLab from "./speedCompo/SpeedLab.jsx";

// Score calculation function
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
    }

    return score;
  }

  function scoreIssues(issuesArray) {
    let score = 0;
    const foundIssues = new Set();

    issuesArray.forEach((issue) => {
      const key = issueMapping[issue.type];
      if (key) {
        foundIssues.add(key);
      }
    });

    for (const [issueType, key] of Object.entries(issueMapping)) {
      if (!foundIssues.has(key)) {
        score += weights[key];
      }
    }

    return score;
  }

  const mobileMetricsScore = data.labData?.mobile
    ? scoreMetrics(data.labData.mobile)
    : 0;
  const mobileIssuesScore = data.issuesData?.mobile
    ? scoreIssues(data.issuesData.mobile)
    : 0;
  const mobileScore = mobileMetricsScore + mobileIssuesScore;

  const desktopMetricsScore = data.labData?.desktop
    ? scoreMetrics(data.labData.desktop)
    : 0;
  const desktopIssuesScore = data.issuesData?.desktop
    ? scoreIssues(data.issuesData.desktop)
    : 0;
  const desktopScore = desktopMetricsScore + desktopIssuesScore;

  const totalScore = mobileScore + desktopScore;

  return {
    mobileScore: Math.round(mobileScore),
    desktopScore: Math.round(desktopScore),
    totalScore: Math.round(totalScore),
  };
}

// Get improvement suggestions
function getSpeedImprovements(data, mobileScore, desktopScore) {
  const suggestions = [];
  let potentialPoints = 0;

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

  // Check mobile metrics
  if (data.labData?.mobile) {
    Object.entries(data.labData.mobile).forEach(([metricName, value]) => {
      const key = metricMapping[metricName];
      if (!key) return;

      if (value === "slow") {
        if (!suggestions.includes(`Improve ${metricName} (Mobile)`)) {
          suggestions.push(`Improve ${metricName} (Mobile)`);
          potentialPoints += weights[key];
        }
      } else if (value === "moderate") {
        if (!suggestions.includes(`Optimize ${metricName} (Mobile)`)) {
          suggestions.push(`Optimize ${metricName} (Mobile)`);
          potentialPoints += weights[key] * 0.5;
        }
      }
    });
  }

  // Check desktop metrics
  if (data.labData?.desktop) {
    Object.entries(data.labData.desktop).forEach(([metricName, value]) => {
      const key = metricMapping[metricName];
      if (!key) return;

      if (value === "slow") {
        if (!suggestions.includes(`Improve ${metricName} (Desktop)`)) {
          suggestions.push(`Improve ${metricName} (Desktop)`);
          potentialPoints += weights[key];
        }
      } else if (value === "moderate") {
        if (!suggestions.includes(`Optimize ${metricName} (Desktop)`)) {
          suggestions.push(`Optimize ${metricName} (Desktop)`);
          potentialPoints += weights[key] * 0.5;
        }
      }
    });
  }

  // Check mobile issues
  if (data.issuesData?.mobile) {
    const foundIssues = new Set();
    data.issuesData.mobile.forEach((issue) => {
      const key = issueMapping[issue.type];
      if (key) foundIssues.add(key);
    });

    Object.entries(issueMapping).forEach(([issueType, key]) => {
      if (foundIssues.has(key)) {
        suggestions.push(`Fix ${issueType} (Mobile)`);
        potentialPoints += weights[key];
      }
    });
  }

  // Check desktop issues
  if (data.issuesData?.desktop) {
    const foundIssues = new Set();
    data.issuesData.desktop.forEach((issue) => {
      const key = issueMapping[issue.type];
      if (key) foundIssues.add(key);
    });

    Object.entries(issueMapping).forEach(([issueType, key]) => {
      if (foundIssues.has(key)) {
        suggestions.push(`Fix ${issueType} (Desktop)`);
        potentialPoints += weights[key];
      }
    });
  }

  return { suggestions, potentialPoints: Math.round(potentialPoints) };
}

function SpeedPerformance({ url }) {
  const [labData, setLabData] = useState(null);
  const [fixData, setFixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceType, setDeviceType] = useState("mobile");

  useEffect(() => {
    if (!url) return;
    const storageKey = `speedData_${url}`;
    const cached = sessionStorage.getItem(storageKey);
    if (cached) {
      const { labData, issuesData } = JSON.parse(cached);

      setLabData(labData || {});
      setFixData(issuesData || {});
      setLoading(false);
      return;
    } else {
      setLabData(null);
      setFixData(null);
      setError(true);
    }
  }, [url]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading performance data...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  // Calculate scores
  const scoreData = calculateSpeedScore({
    labData: labData,
    issuesData: fixData,
  });

  const { suggestions, potentialPoints } = getSpeedImprovements(
    { labData, issuesData: fixData },
    scoreData.mobileScore,
    scoreData.desktopScore
  );

  const getMetricsByStatus = (data) => {
    if (!data) return { fast: [], moderate: [], slow: [] };

    const fast = [];
    const moderate = [];
    const slow = [];

    Object.entries(data).forEach(([key, value]) => {
      const status = value.toLowerCase();
      if (status === "fast") fast.push(key);
      else if (status === "moderate") moderate.push(key);
      else if (status === "slow") slow.push(key);
    });

    return { fast, moderate, slow };
  };

  const deviceData = labData?.[deviceType] || {};
  const { fast, moderate, slow } = getMetricsByStatus(deviceData);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Score Display */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="flex justify-center mb-6">
          <ScoreCircle
            score={scoreData.totalScore}
            size="medium"
            showLabel={true}
            label="out of 100"
          />
        </div>

        {/* Score Breakdown */}
        <div className="flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Mobile</div>
            <div className="text-white font-semibold text-lg">
              {scoreData.mobileScore}/50
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Desktop</div>
            <div className="text-white font-semibold text-lg">
              {scoreData.desktopScore}/50
            </div>
          </div>
        </div>
      </div>

      {/* Device Toggle */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="flex flex-wrap bg-white/10 rounded-lg overflow-hidden border border-white/20">
          <button
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              deviceType === "mobile"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setDeviceType("mobile")}
          >
            <Smartphone className="w-4 h-4 inline-block mr-1" /> Mobile
          </button>
          <button
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              deviceType === "desktop"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setDeviceType("desktop")}
          >
            <Monitor className="w-4 h-4 inline-block mr-1" /> Desktop
          </button>
        </div>
      </div>

      {/* Performance Summary Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
          <div className="w-fit p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white mt-2 sm:mt-0 sm:ml-4">
            Performance Summary
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Improvement Message */}
          {potentialPoints > 0 && (
            <div className="flex items-start py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-blue-300 text-sm font-medium">
                  Fix these to earn {potentialPoints} more points:
                </span>
                <span className="text-blue-200 text-sm ml-1">
                  {suggestions.slice(0, 3).join(", ")}
                  {suggestions.length > 3 &&
                    ` and ${suggestions.length - 3} more`}
                </span>
              </div>
            </div>
          )}

          {/* Fast Metrics */}
          {fast.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="flex items-start sm:items-center space-x-2">
                <div className="flex-shrink-0 p-2 sm:p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    {fast.length === Object.keys(deviceData).length
                      ? "All metrics performing excellently"
                      : `${fast.length} metric${
                          fast.length > 1 ? "s" : ""
                        } performing well`}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {fast.join(", ")}
                  </p>
                </div>
              </div>
              <span className="flex-shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 w-fit mt-2">
                Fast
              </span>
            </div>
          )}

          {/* Moderate Metrics */}
          {moderate.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-start sm:items-center">
                  <div className="flex-shrink-0 p-2 sm:p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-white font-medium text-sm sm:text-base">
                      {moderate.length} metric{moderate.length > 1 ? "s" : ""}{" "}
                      need{moderate.length === 1 ? "s" : ""} optimization
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {moderate.join(", ")}
                    </p>
                  </div>
                </div>
                <span className="w-fit px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Moderate
                </span>
              </div>
            </div>
          )}

          {/* Slow Metrics */}
          {slow.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-red-500/20 hover:border-red-500/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-start sm:items-center">
                  <div className="flex-shrink-0 p-2 sm:p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-white font-medium text-sm sm:text-base">
                      {slow.length} metric{slow.length > 1 ? "s" : ""} require
                      {slow.length === 1 ? "s" : ""} immediate attention
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {slow.join(", ")}
                    </p>
                  </div>
                </div>
                <span className="w-fit px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                  Slow
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Data Sections */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-6">
          <SpeedLab labData={labData || {}} deviceType={deviceType} />
        </div>
        <SpeedFix fixData={fixData || {}} deviceType={deviceType} />
      </div>
    </div>
  );
}

export default SpeedPerformance;
