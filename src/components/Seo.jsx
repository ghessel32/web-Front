import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Share2,
  TrendingUp,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle";

function SEOAnalysis({ url }) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    const storageKey = `seoData_${url}`;
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      setSeoData(JSON.parse(cached));
      setLoading(false);
      return;
    } else {
      setSeoData(null);
      setError(true);
    }
  }, [url]);

  // Helper for extracting consistent data
  const getData = (field) => {
    const d = seoData?.[field];
    if (d == null)
      return { value: "Not found", status: "error", description: "" };

    if (typeof d === "object")
      return {
        value: d.value || "Not found",
        status: d.status || "warning",
        description: d.description || "",
      };

    if (typeof d === "boolean")
      return {
        value: d ? "Yes" : "No",
        status: d ? "success" : "error",
        description: "",
      };

    return {
      value: d,
      status: d ? "success" : "warning",
      description: "",
    };
  };

  // Reusable utilities
  const StatusBadge = ({ status, children }) => {
    const colors = {
      success: "bg-green-500/20 text-green-400 border border-green-500/30",
      warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      error: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
          colors[status] || colors.error
        }`}
      >
        {children}
      </span>
    );
  };

  const SEOItem = ({ icon: Icon, label, value, status, description }) => (
    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <Icon
            className={`w-5 h-5 mr-3 ${
              status === "success"
                ? "text-green-400"
                : status === "warning"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          />
          <span className="text-sm font-medium text-gray-200">{label}</span>
        </div>
        <StatusBadge status={status}>
          {status === "success"
            ? "Good"
            : status === "warning"
            ? "Needs Work"
            : "Missing"}
        </StatusBadge>
      </div>
      <div className="ml-8">
        {value && (
          <p className="text-sm text-gray-400 mb-1 font-mono break-words">
            {value}
          </p>
        )}
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );

  const SocialTagsSection = ({ title, tags, present, icon: Icon, color }) => {
    const status = present ? "success" : "error";
    const colorClasses = {
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
      },
      purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-400",
      },
    };
    const c = colorClasses[color] || colorClasses.blue;

    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
          <div className={`p-2 sm:p-3 rounded-xl ${c.bg} border ${c.border}`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${c.text}`} />
          </div>
          <h3 className="mt-2 sm:mt-0 sm:ml-4 text-base sm:text-lg font-semibold text-white flex-1">
            {title}
          </h3>
          <StatusBadge status={status}>
            {present ? "Present" : "Missing"}
          </StatusBadge>
        </div>

        {present ? (
          <div className="space-y-3">
            {Object.entries(tags).map(([key, value]) => (
              <div
                key={key}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  {key}
                </div>
                <div className="text-sm text-gray-200 break-words font-mono">
                  {value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              No {title.toLowerCase()} found. These tags are important for
              social media sharing.
            </p>
          </div>
        )}
      </div>
    );
  };

  function calculateSEOScore(data) {
    if (!data)
      return { totalScore: 0, details: "", missing: [], missingPoints: 0 };

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
      title: "Title Tag",
      metaDescription: "Meta Description",
      h1: "H1 Tag",
      robots: "Robots.txt",
      sitemap: "Sitemap",
      canonical: "Canonical URL",
      mobileFriendly: "Mobile-Friendly",
      openGraph: "Open Graph Tags",
      twitter: "Twitter Card Tags",
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
        missing.push({ name: labels[key], points: weights[key] });
      }
    }

    // Check mobile friendly
    if (data.mobileFriendly === true) {
      score += weights.mobileFriendly;
      present.push(labels.mobileFriendly);
    } else {
      missing.push({
        name: labels.mobileFriendly,
        points: weights.mobileFriendly,
      });
    }

    // Check Open Graph tags
    if (data.openGraph && data.openGraph.present === true) {
      score += weights.openGraph;
      present.push(labels.openGraph);
    } else {
      missing.push({ name: labels.openGraph, points: weights.openGraph });
    }

    // Check Twitter Card tags
    if (data.twitter && data.twitter.present === true) {
      score += weights.twitter;
      present.push(labels.twitter);
    } else {
      missing.push({ name: labels.twitter, points: weights.twitter });
    }

    // Generate message
    let message = "";
    const missingPoints = missing.reduce((sum, item) => sum + item.points, 0);

    if (score === 100) {
      message = "Perfect SEO! All elements are optimized. 🎉";
    } else if (missing.length > 0) {
      const missingNames = missing.map((m) => m.name).join(", ");
      message = `🔒 Fix ${missingNames} and earn ${missingPoints} more points!`;
    } else {
      message = "Great SEO setup!";
    }

    return {
      totalScore: score,
      details: message,
      missing,
      missingPoints,
    };
  }

  const scoreData = calculateSEOScore(seoData);
  const totalScore = scoreData.totalScore;

  // Get summary info based on score
  const getSummaryInfo = () => {
    if (totalScore === 100) {
      return {
        status: "success",
        iconColor: "text-green-400",
        bgColor: "bg-green-500/10 border-green-500/20",
        badgeText: "Excellent",
      };
    } else if (totalScore >= 70) {
      return {
        status: "warning",
        iconColor: "text-yellow-400",
        bgColor: "bg-yellow-500/10 border-yellow-500/20",
        badgeText: "Good",
      };
    } else {
      return {
        status: "error",
        iconColor: "text-red-400",
        bgColor: "bg-red-500/10 border-red-500/20",
        badgeText: "Needs Work",
      };
    }
  };

  const summaryInfo = getSummaryInfo();

  // Derived values memoized (no re-calculation each render)
  const { seoItems, firstMessage, secondMessage } = useMemo(() => {
    if (!seoData) return { seoItems: [], firstMessage: "", secondMessage: "" };

    const fields = [
      ["Title Tag", "title"],
      ["Meta Description", "metaDescription"],
      ["H1 Tag", "h1"],
      ["Robots.txt", "robots"],
      ["Sitemap", "sitemap"],
      ["Canonical URL", "canonical"],
      ["Mobile Indexability", "mobileFriendly"],
    ];

    const items = fields.map(([label, key]) => {
      const data = getData(key);
      const icon =
        data.status === "error"
          ? XCircle
          : data.status === "warning"
          ? AlertTriangle
          : CheckCircle;
      return { label, icon, ...data };
    });

    const passed = items.filter((i) => i.status === "success");
    const missing = items.filter((i) => i.status !== "success");

    const first =
      passed.length >= 5
        ? "Great job! Most of your SEO essentials are in place."
        : passed.length > 0
        ? "Good start! Some SEO elements are optimized."
        : "Let's get started with SEO optimization.";

    const second =
      missing.length > 0
        ? `Missing: ${missing.map((i) => i.label).join(", ")}`
        : "";

    return { seoItems: items, firstMessage: first, secondMessage: second };
  }, [seoData]);

  const getSummaryMessages = () => {
    const messages = [];
    const { missing, missingPoints } = scoreData;

    // Fix message on top (only if there are missing items)
    if (missingPoints > 0) {
      messages.push({
        type: "info",
        icon: TrendingUp,
        text: `Fix missing SEO elements and earn ${missingPoints} points`,
      });
    }

    // Status messages
    if (totalScore === 100) {
      messages.push({
        type: "success",
        icon: CheckCircle,
        text: "Perfect SEO! All elements are optimized",
      });
    } else if (totalScore >= 70) {
      messages.push({
        type: "success",
        icon: CheckCircle,
        text: firstMessage,
      });
      if (secondMessage) {
        messages.push({
          type: "warning",
          icon: AlertTriangle,
          text: secondMessage,
        });
      }
    } else {
      messages.push({
        type: "warning",
        icon: AlertTriangle,
        text: firstMessage,
      });
      if (secondMessage) {
        messages.push({
          type: "error",
          icon: XCircle,
          text: secondMessage,
        });
      }
    }

    return messages;
  };

  const summaryMessages = getSummaryMessages();

  // UI states
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Checking SEO data...
      </div>
    );

  if (error) return <div>Failed to fetch SEO data.</div>;

  if (!seoData) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Score Circle */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="flex justify-center">
            <ScoreCircle
              score={totalScore}
              size="medium"
              showLabel={true}
              label="out of 100"
            />
          </div>
        </div>

        {/* Summary Box */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="flex items-center mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="ml-3 text-lg sm:text-xl font-semibold text-white">
              SEO Health Check
            </h3>
          </div>

          <div className="space-y-3">
            {summaryMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  msg.type === "success"
                    ? "bg-green-500/10 border-green-500/30 hover:bg-green-500/15"
                    : msg.type === "error"
                    ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/15"
                    : msg.type === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15"
                    : "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15"
                }`}
              >
                <msg.icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    msg.type === "success"
                      ? "text-green-400"
                      : msg.type === "error"
                      ? "text-red-400"
                      : msg.type === "warning"
                      ? "text-yellow-400"
                      : "text-blue-400"
                  }`}
                />
                <span className="text-sm text-gray-200 leading-relaxed">
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <h3 className="mt-2 sm:mt-0 sm:ml-4 text-base sm:text-lg font-semibold text-white">
              Detailed Results
            </h3>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {seoItems.map((item, index) => (
              <SEOItem key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Open Graph Tags */}
        {seoData.openGraph && (
          <SocialTagsSection
            title="Open Graph Tags"
            tags={seoData.openGraph.tags}
            present={seoData.openGraph.present}
            icon={Share2}
            color="blue"
          />
        )}

        {/* Twitter Card Tags */}
        {seoData.twitter && (
          <SocialTagsSection
            title="Twitter Card Tags"
            tags={seoData.twitter.tags}
            present={seoData.twitter.present}
            icon={Share2}
            color="purple"
          />
        )}
      </div>
    </div>
  );
}

export default SEOAnalysis;
