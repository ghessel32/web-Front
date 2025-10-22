import React, { useEffect, useState } from "react";
import { Shield, CheckCircle, Lock, AlertTriangle } from "lucide-react";

function SecurityThreat({ url }) {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState({});
  const [threatData, setThreatData] = useState({});
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchWithCache = async (key, endpoint, payload) => {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached); // ✅ Use cache if available

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      sessionStorage.setItem(key, JSON.stringify(data)); // ✅ Save to cache
      return data;
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
      return {};
    }
  };

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);

    // 🧹 Clear cache of any previous website (different from current)
    Object.keys(sessionStorage).forEach((key) => {
      if (
        (key.startsWith("security_") || key.startsWith("threat_")) &&
        !key.endsWith(url)
      ) {
        sessionStorage.removeItem(key);
      }
    });

    const fetchData = async () => {
      // ✅ These functions will use cache if already present
      const security = await fetchWithCache(
        `security_${url}`,
        `${apiUrl}/security`,
        { url }
      );
      setSecurityData(security);

      const threat = await fetchWithCache(`threat_${url}`, `${apiUrl}/threat`, {
        url,
      });
      setThreatData(threat);

      setLoading(false);
    };

    fetchData();
  }, [url]);

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

  const InfoRow = ({ icon: Icon, label, status, statusText }) => (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
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
        <span className="text-sm text-gray-200">{label}</span>
      </div>
      <StatusBadge status={status}>{statusText}</StatusBadge>
    </div>
  );

  if (loading)
    return (
      <div className="text-center text-gray-400 py-10">
        Loading security data...
      </div>
    );
  if (error)
    return <div className="text-center text-red-400 py-10">{error}</div>;
  if (!url)
    return (
      <div className="text-center text-gray-400 py-10">
        No URL provided for security check
      </div>
    );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Summary Message */}
        {(() => {
          const missingHeaders = [
            !securityData.hstsHeader,
            !securityData.xFrameOptions,
            !securityData.contentSecurityPolicy,
          ].filter(Boolean).length;

          let title = "Your Website is Safe";
          let message =
            "No security threats detected. All checks passed successfully.";
          let badgeStatus = "success";
          let iconColor = "text-green-400";
          let bgColor = "bg-green-500/10 border-green-500/20";

          if (missingHeaders === 1 || missingHeaders === 2) {
            title = "Needs Improvement";
            message =
              "Some security headers are missing. Improve to enhance protection.";
            badgeStatus = "warning";
            iconColor = "text-yellow-400";
            bgColor = "bg-yellow-500/10 border-yellow-500/20";
          } else if (missingHeaders >= 3) {
            title = "Your Website is Unsafe";
            message =
              "Critical security headers are missing. Immediate attention required.";
            badgeStatus = "error";
            iconColor = "text-red-400";
            bgColor = "bg-red-500/10 border-red-500/20";
          }

          return (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-start sm:items-center">
                  <div className={`p-2 sm:p-3 rounded-xl ${bgColor}`}>
                    <Shield className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`} />
                  </div>
                  <div className="ml-0 mt-2 sm:ml-4 sm:mt-0">
                    <h3 className="text-lg sm:text-2xl font-semibold text-white">
                      {title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mt-1">
                      {message}
                    </p>
                  </div>
                </div>

                <StatusBadge status={badgeStatus}>
                  {badgeStatus === "success"
                    ? "Secure"
                    : badgeStatus === "warning"
                    ? "Needs Improvement"
                    : "Unsafe"}
                </StatusBadge>
              </div>
            </div>
          );
        })()}

        {/* Security Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Safe Browsing */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-4">
                Safe Browsing
              </h3>
            </div>
            <div className="space-y-3">
              <InfoRow
                icon={threatData.malware ? AlertTriangle : CheckCircle}
                label="Malware Check"
                status={threatData.malware ? "error" : "success"}
                statusText={threatData.malware ? "Detected" : "Clean"}
              />
              <InfoRow
                icon={threatData.unwanted ? AlertTriangle : CheckCircle}
                label="Blacklist Status"
                status={threatData.unwanted ? "warning" : "success"}
                statusText={threatData.unwanted ? "Listed" : "Not Listed"}
              />
              <InfoRow
                icon={threatData.phishing ? AlertTriangle : CheckCircle}
                label="Phishing Check"
                status={threatData.phishing ? "error" : "success"}
                statusText={threatData.phishing ? "Detected" : "Safe"}
              />
              <InfoRow
                icon={threatData.unwanted ? AlertTriangle : CheckCircle}
                label="Unwanted Programs"
                status={threatData.unwanted ? "error" : "success"}
                statusText={threatData.unwanted ? "Detected" : "Clean"}
              />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <p className="text-sm text-gray-300 text-center">
                {threatData.safe
                  ? "✓ All browsing safety checks passed"
                  : "⚠ Potential threat detected"}
              </p>
            </div>
          </div>

          {/* HTTPS & Security Headers */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-4">
                Security Headers
              </h3>
            </div>
            <div className="space-y-3">
              <InfoRow
                icon={CheckCircle}
                label="HTTPS Enabled"
                status={securityData.httpsEnabled ? "success" : "error"}
                statusText={securityData.httpsEnabled ? "Active" : "Inactive"}
              />
              <InfoRow
                icon={CheckCircle}
                label="Strict-Transport-Security"
                status={securityData.hstsHeader ? "success" : "error"}
                statusText={securityData.hstsHeader ? "Enabled" : "Missing"}
              />
              <InfoRow
                icon={CheckCircle}
                label="X-Frame-Options"
                status={securityData.xFrameOptions ? "success" : "error"}
                statusText={securityData.xFrameOptions ? "Enabled" : "Missing"}
              />
              <InfoRow
                icon={
                  securityData.contentSecurityPolicy
                    ? CheckCircle
                    : AlertTriangle
                }
                label="Content-Security-Policy"
                status={
                  securityData.contentSecurityPolicy ? "success" : "warning"
                }
                statusText={
                  securityData.contentSecurityPolicy ? "Enabled" : "Missing"
                }
              />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <p className="text-sm text-gray-300 text-center">
                {securityData.contentSecurityPolicy
                  ? "✓ All headers present"
                  : "⚠ Consider adding CSP header"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityThreat;
