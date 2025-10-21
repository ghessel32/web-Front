import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

function SEOAnalysis({ url }) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ✅ Reusable utilities
  const StatusBadge = ({ status, children }) => {
    const colors = {
      success: "bg-green-500/20 text-green-400 border border-green-500/30",
      warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      error: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${colors[status] || colors.error}`}
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

  // ✅ Fetch + caching
  useEffect(() => {
    if (!url) return;
    const storageKey = `seo_${url}`;
    const cached = sessionStorage.getItem(storageKey);

    if (cached) return setSeoData(JSON.parse(cached));

    setLoading(true);
    fetch(`${apiUrl}/seo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSeoData(data);
        sessionStorage.setItem(storageKey, JSON.stringify(data));
      })
      .catch((err) => {
        console.error("Error fetching SEO data:", err);
        setSeoData(null);
      })
      .finally(() => setLoading(false));
  }, [url, apiUrl]);

  // ✅ Helper for extracting consistent data
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

  // ✅ Derived values memoized (no re-calculation each render)
  const { seoItems, firstMessage, secondMessage } = useMemo(() => {
    if (!seoData)
      return { seoItems: [], firstMessage: "", secondMessage: "" };

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

  // ✅ UI states
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Checking SEO data...
      </div>
    );

  if (!seoData)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Failed to fetch SEO data.
      </div>
    );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Summary Box */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="ml-4 text-2xl font-semibold text-white flex-1">
              SEO Health Check
            </h3>
          </div>

          <div className="space-y-4">
            <div className="py-3 px-4 rounded-xl bg-white/5 flex items-center">
              <CheckCircle className="w-5 h-5 mr-1 text-green-400" />
              <p className="ml-3 text-gray-200">{firstMessage}</p>
            </div>

            {secondMessage && (
              <div className="py-3 px-4 rounded-xl bg-white/5 flex items-center">
                <XCircle className="w-5 h-5 mr-1 text-red-400" />
                <p className="ml-3 text-gray-200">{secondMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Search className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-white">
              Detailed Results
            </h3>
          </div>

          <div className="space-y-4">
            {seoItems.map((item, index) => (
              <SEOItem key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SEOAnalysis;
