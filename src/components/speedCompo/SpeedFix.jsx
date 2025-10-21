import React, { useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  Code,
  Database,
  Zap,
  FileWarning,
  X,
} from "lucide-react";

function SpeedFix({ fixData, deviceType }) {
  const issues = fixData?.[deviceType] || [];
  const [selectedIssue, setSelectedIssue] = useState(null);

  const StatusBadge = ({ severity }) => {
    const colors = {
      high: "bg-red-500/20 text-red-400 border border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      low: "bg-green-500/20 text-green-400 border border-green-500/30",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
          colors[severity] || colors.low
        }`}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getIconByType = (type) => {
    switch (type) {
      case "Render-Blocking Requests":
        return Database;
      case "Image Optimization":
        return ImageIcon;
      case "Font Loading Strategy":
        return FileWarning;
      case "Third-Party Code":
        return Code;
      default:
        return FileWarning;
    }
  };

  // 🧠 Custom human-readable descriptions
  const getCustomDescription = (type, items = []) => {
    const count = items.length;
    switch (type) {
      case "Image Optimization":
        return `Found ${count} unoptimized image${
          count !== 1 ? "s" : ""
        } totaling approximately ${(count * 0.3).toFixed(1)} MB.`;
      case "Render-Blocking Requests":
        return `${count} file${
          count !== 1 ? "s" : ""
        } block rendering and delay first paint.`;
      case "Font Loading Strategy":
        return `${count} web font${
          count !== 1 ? "s" : ""
        } are loading inefficiently and may delay text rendering.`;
      case "Third-Party Code":
        return `${count} external script${
          count !== 1 ? "s" : ""
        } from third-party sources are affecting page performance.`;
      default:
        return `Detected ${count} performance-related issue${
          count !== 1 ? "s" : ""
        } in this category.`;
    }
  };

  const IssueItem = ({ icon: Icon, issue }) => {
    const { type, severity, impact, items } = issue;
    const lowerSeverity = severity?.toLowerCase() || "low";
    const isClickable = Array.isArray(items) && items.length > 0;
    const description = getCustomDescription(type, items);

    return (
      <div
        onClick={() => isClickable && setSelectedIssue(issue)}
        className={`p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 cursor-${
          isClickable ? "pointer" : "default"
        }`}
      >
        <div className="flex items-start">
          <div
            className={`p-2 rounded-lg ${
              lowerSeverity === "high"
                ? "bg-red-500/10"
                : lowerSeverity === "medium"
                ? "bg-yellow-500/10"
                : "bg-green-500/10"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                lowerSeverity === "high"
                  ? "text-red-400"
                  : lowerSeverity === "medium"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            />
          </div>

          <div className="ml-4 flex-1">
            <h4 className="text-sm font-semibold text-gray-200 mb-1">{type}</h4>
            <p className="text-xs text-gray-400">{description}</p>
            {impact && (
              <p className="text-xs text-gray-500 mt-1 italic">
                Impact: {impact}
              </p>
            )}
          </div>

          <StatusBadge severity={lowerSeverity} />
        </div>
      </div>
    );
  };

  // Example total improvement (static for demo)
  const totalImprovement = (issues.length * 0.3).toFixed(1);

  return (
    <>
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <AlertCircle className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white ml-4">
            Issues & Recommendations ({deviceType})
          </h3>
        </div>

        <div className="space-y-4">
          {issues.length > 0 ? (
            issues.map((issue, index) => (
              <IssueItem
                key={index}
                icon={getIconByType(issue.type)}
                issue={issue}
              />
            ))
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              No significant performance issues detected 🎉
            </div>
          )}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              Potential Speed Improvement
            </span>
            <span className="text-sm font-semibold text-orange-400">
              ~{totalImprovement}s faster load time
            </span>
          </div>
        </div>
      </div>

      {selectedIssue && (
  <div className="fixed inset-0 z-50 flex">
    {/* Dimmed overlay */}
    <div
      className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={() => setSelectedIssue(null)}
    />

    {/* Sliding sidebar */}
    <div className="w-full max-w-md bg-gradient-to-b from-gray-900/90 to-gray-800/90 border-l border-white/10 shadow-2xl backdrop-blur-xl transform translate-x-0 animate-slideInRight">
      <div className="flex justify-between items-center p-5 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">
          {selectedIssue.type} URLs
        </h3>
        <button
          onClick={() => setSelectedIssue(null)}
          className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {selectedIssue.items && selectedIssue.items.length > 0 ? (
        <ul className="max-h-[70vh] overflow-y-auto p-5 space-y-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {selectedIssue.items.map((item, i) => (
            <li
              key={i}
              className="text-sm text-gray-300 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all duration-200"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all"
              >
                {item.url}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 text-center py-10">
          No URLs available for this issue.
        </p>
      )}
    </div>
  </div>
)}

    </>
  );
}

export default SpeedFix;
