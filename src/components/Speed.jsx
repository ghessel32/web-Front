import React, { useState, useEffect } from "react";
import {
  Zap,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import SpeedLab from "./speedCompo/SpeedLab.jsx";
import SpeedFix from "./speedCompo/SpeedFix.jsx";

function SpeedPerformance({ url }) {
  const [labData, setLabData] = useState(null);
  const [fixData, setFixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceType, setDeviceType] = useState("mobile");
  const apiUrl = import.meta.env.VITE_API_URL;

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
    }
    setLoading(true);
    setError(null);

    // Clear old data BEFORE fetching
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("speedData_") && key !== storageKey) {
        sessionStorage.removeItem(key);
      }
    });
    fetch(`${apiUrl}/speed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((result) => {
        setLabData(result.labData || {});
        setFixData(result.issuesData || {});
        sessionStorage.setItem(storageKey, JSON.stringify(result));
        window.dispatchEvent(new Event("dataUpdated"));
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Failed to fetch speed data");
      })
      .finally(() => setLoading(false));
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

  // --- Compute Metrics by Status ---
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

  // // For testing - remove this and use deviceData in production
  // const dumData = {
  //   "Cumulative Layout Shift": "fast",
  //   "First Contentful Paint": "fast",
  //   "Largest Contentful Paint": "slow",
  //   "Total Blocking Time": "moderate",
  // };

  const { fast, moderate, slow } = getMetricsByStatus(deviceData);

  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Device Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-white/10 rounded-lg overflow-hidden border border-white/20">
          <button
            className={`px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
              deviceType === "mobile"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setDeviceType("mobile")}
          >
            <Smartphone className="w-4 h-4 inline-block mr-1" /> Mobile
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
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
      <div className="rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white ml-4">
            Performance Summary
          </h2>
        </div>

        <div className="space-y-4">
          {/* Fast Metrics */}
          {fast.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">
                      {fast.length === Object.keys(deviceData).length
                        ? "All metrics performing excellently"
                        : `${fast.length} metric${
                            fast.length > 1 ? "s" : ""
                          } performing well`}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {fast.join(", ")}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  Fast
                </span>
              </div>
            </div>
          )}

          {/* Moderate Metrics */}
          {moderate.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">
                      {moderate.length} metric{moderate.length > 1 ? "s" : ""}{" "}
                      need{moderate.length === 1 ? "s" : ""} optimization
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {moderate.join(", ")}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Moderate
                </span>
              </div>
            </div>
          )}

          {/* Slow Metrics */}
          {slow.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">
                      {slow.length} metric{slow.length > 1 ? "s" : ""} require
                      {slow.length === 1 ? "s" : ""} immediate attention
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {slow.join(", ")}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
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
          {/* Lab Data */}
          <SpeedLab labData={labData || {}} deviceType={deviceType} />
        </div>
        {/* Problematic Files / Fixes */}
        <SpeedFix fixData={fixData || {}} deviceType={deviceType} />
      </div>
    </div>
  );
}

export default SpeedPerformance;
