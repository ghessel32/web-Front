import React, { useEffect, useState } from "react";
import {
  Shield,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

function SSLDomain({ url }) {
  const [sslData, setSslData] = useState(null);
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const domain = url ? new URL(url).hostname : null;

  const fetchWithCache = async (key, endpoint, payload) => {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      sessionStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    setError(null);

    // 🧹 Remove old cache entries for previous URLs/domains
    Object.keys(sessionStorage).forEach((key) => {
      if (
        (key.startsWith("ssl_") && key !== `ssl_${url}`) ||
        (key.startsWith("domain_") && key !== `domain_${domain}`)
      ) {
        sessionStorage.removeItem(key);
      }
    });

    const fetchData = async () => {
      const ssl = await fetchWithCache(`ssl_${url}`, `${apiUrl}/ssl`, { url });
      setSslData(ssl || {});
      const domainInfo = await fetchWithCache(
        `domain_${domain}`,
        `${apiUrl}/domain`,
        { domain }
      );
      setDomainData(domainInfo || {});
      setLoading(false);
    };

    fetchData();
  }, [url, domain]);

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-gray-200 font-medium">
        {value || "..."}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading SSL and Domain data...
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

  const sslDaysLeft = Number(sslData?.["Days Left"]?.replace(/\D/g, "")) || 0;
  const domainDaysLeft = Number(domainData?.daysLeft) || 0;
  const renewalSoon = sslDaysLeft < 40 || domainDaysLeft < 40;

  const isSSLActive =
    sslData?.Status?.toLowerCase()?.includes("valid") ||
    sslData?.Status === "Active";
  const isDomainActive = domainData?.daysLeft > 0;
  const protectionLabel = domainData?.isProtected
    ? "Server-side"
    : "Not Protected";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Security & Domain Summary
          </h3>

          {/* Active/Inactive messages */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
              <div className="flex items-center">
                <Shield
                  className={`w-5 h-5 mr-3 ${
                    isSSLActive ? "text-green-400" : "text-red-400"
                  }`}
                />
                <span className="text-gray-200">SSL Certificate</span>
              </div>
              {isSSLActive ? (
                <span className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> Active
                </span>
              ) : (
                <span className="text-red-400 text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> Inactive
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
              <div className="flex items-center">
                <Globe
                  className={`w-5 h-5 mr-3 ${
                    isDomainActive ? "text-green-400" : "text-red-400"
                  }`}
                />
                <span className="text-gray-200">Domain</span>
              </div>
              {isDomainActive ? (
                <span className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> Active
                </span>
              ) : (
                <span className="text-red-400 text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-1" /> Inactive
                </span>
              )}
            </div>

            {protectionLabel === "Not Protected" && (
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
                <div className="flex items-center">
                  <Globe
                    className={`w-5 h-5 mr-3 ${
                      protectionLabel === "Not Protected"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  />
                  <span className="text-gray-200">
                    Domain is not protected from server side.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Renewal message */}
          {renewalSoon && (
            <div className="flex items-center py-3 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
              <span className="text-yellow-300 text-sm">
                Renewal recommended —{" "}
                {Number(sslDaysLeft) < 40 && `SSL (${sslDaysLeft} days)`}
                {Number(sslDaysLeft) < 40 &&
                  Number(domainDaysLeft) < 40 &&
                  " & "}
                {Number(domainDaysLeft) < 40 &&
                  `Domain (${domainDaysLeft} days)`}{" "}
                left before expiration.
              </span>
            </div>
          )}
        </div>

        {/* SSL and Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SSL Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-4">
                SSL Certificate
              </h3>
            </div>
            <div className="space-y-3">
              <InfoRow label="Status" value={sslData?.Status || "Unknown"} />
              <InfoRow label="Days Left" value={sslData?.["Days Left"]} />
              <InfoRow label="Valid Until" value={sslData?.["Valid Until"]} />
            </div>
          </div>

          {/* Domain Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white ml-4">
                Domain Information
              </h3>
            </div>
            <div className="space-y-3">
              <InfoRow
                label="Protection"
                value={
                  domainData?.isProtected ? "Server-side" : "Not Protected"
                }
              />

              <InfoRow label="Days Left" value={domainData?.daysLeft} />
              <InfoRow label="Valid Until" value={domainData?.expiryDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SSLDomain;
