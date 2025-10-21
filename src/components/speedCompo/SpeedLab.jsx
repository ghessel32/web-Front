import React from "react";
import { Activity } from "lucide-react";

function SpeedLab({ labData, deviceType }) {
  
  if (!labData) return <p className="text-gray-400 text-center">Loading...</p>;

  const data = labData?.[deviceType];
  if (!data) return <p className="text-gray-400 text-center">No data available</p>;

  // Map your lab value to badge status
  const mapStatus = (value) => {
    switch (value.toLowerCase()) {
      case "fast":
        return "success";
      case "moderate":
        return "warning";
      case "slow":
        return "danger";
      default:
        return "danger";
    }
  };

  const StatusBadge = ({ status, children }) => (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
        status === "success"
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : status === "warning"
          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      }`}
    >
      {children}
    </span>
  );

  const MetricItem = ({ label, value }) => {
    const status = mapStatus(value);
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
        <span className="text-sm text-gray-300">{label}</span>
        <StatusBadge status={status}>
          {status === "success"
            ? "Fast"
            : status === "warning"
            ? "Moderate"
            : "Slow"}
        </StatusBadge>
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white ml-4">Data</h3>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {Object.entries(data).map(([label, value]) => (
          <MetricItem key={label} label={label} value={value} />
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
        <p className="text-xs text-gray-400 text-center">
          {deviceType === "desktop"
            ? "Simulated on throttled desktop connection"
            : "Simulated on throttled mobile connection"}
        </p>
      </div>
    </div>
  );
}

export default SpeedLab;
