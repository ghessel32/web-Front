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
  const [loading, setLoading] = useState(true);
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

  const { fast, moderate, slow } = getMetricsByStatus(deviceData);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6">
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
      <div className="rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
          <div className="w-fit p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white mt-2 sm:mt-0 sm:ml-4">
            Performance Summary
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
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

              <span className="flex-shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 w-fit">
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
                <span className="w-fit px-2 sm:px-3 py-1 rounded-full text-xs sm:text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
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
                <span className="w-fit px-2 sm:px-3 py-1 rounded-full text-xs sm:text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
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
