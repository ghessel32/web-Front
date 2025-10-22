import React from "react";
import { Clock, XCircle } from "lucide-react";

function Uptimer({ url }) {
  const [uptimeData, setUptimeData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    if (!url) return;

    const storageKey = `uptimeData_${url}`;
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      setUptimeData(JSON.parse(cached));
      setLoading(false);
    } else {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("uptimeData_")) {
          sessionStorage.removeItem(key);
        }
      });

      setLoading(true);
      fetch(`${apiUrl}/check-uptime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
        .then((res) => res.json())
        .then((result) => {
          setUptimeData(result);
          sessionStorage.setItem(storageKey, JSON.stringify(result));
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [url]);

  const StatusBadge = ({ status, children }) => {
    const colors = {
      error: "bg-red-500/20 text-red-400 border-red-500/30",
      success: "bg-green-500/20 text-green-400 border-green-500/30",
      warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      default: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${
          colors[status] || colors.default
        }`}
      >
        {children}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-400 mb-4">Loading....</p>
      </div>
    );

  if (!uptimeData)
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-400">No data available</p>
      </div>
    );

  const uptimeShow = uptimeData.responseTime < 400;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6">
      {/* Summary */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 sm:mr-3 text-purple-400" />
          Summary
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {uptimeData.ok ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-3 sm:px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex items-center mb-2 sm:mb-0">
                <Clock className="w-5 h-5 text-green-400 mr-2 sm:mr-4" />
                <span className="text-gray-200 text-sm sm:text-base">
                  Your website is up and running smoothly!
                </span>
              </div>
              <StatusBadge status="success">Alive</StatusBadge>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-3 sm:px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
              <div className="flex items-center mb-2 sm:mb-0">
                <XCircle className="w-5 h-5 text-red-400 mr-2 sm:mr-4" />
                <span className="text-gray-200 text-sm sm:text-base">
                  There are issues with your website.
                </span>
              </div>
              <StatusBadge status="error">Error</StatusBadge>
            </div>
          )}
        </div>
      </div>

      {/* Recent Uptime Card */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 sm:mr-3 text-green-400" />
            Recent Uptime
          </h3>
          <div className="flex items-center justify-center h-28 sm:h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-green-400">
                {uptimeData.responseTime} ms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Uptimer;
