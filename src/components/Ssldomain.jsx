import React, { useEffect, useState } from "react";
import {
  Shield,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle";

// Score calculation constants
const SSL_WEIGHT = 50;
const DOMAIN_VALIDITY_WEIGHT = 30;
const DOMAIN_PROTECTION_WEIGHT = 20;
const VALID_SSL_KEYWORDS = ["VALID", "ACTIVE", "OK", "SECURE"];

// Calculate SSL score based on status
function calculateSSLScore(data) {
  const status = (data?.Status || data?.status || "").toUpperCase();
  const hasValidKeyword = VALID_SSL_KEYWORDS.some((keyword) =>
    status.includes(keyword)
  );
  const score = hasValidKeyword ? SSL_WEIGHT : 0;
  return Math.round(score * 100) / 100;
}

// Calculate domain score based on protection
function calculateDomainScore(data) {
  let score = 0;
  const daysLeft = data?.daysLeft || data?.days_left || 0;
  if (daysLeft > 2) {
    score += DOMAIN_VALIDITY_WEIGHT;
  }
  const isProtected = data?.isProtected || data?.is_protected || false;
  if (isProtected) {
    score += DOMAIN_PROTECTION_WEIGHT;
  }
  return Math.round(score * 100) / 100;
}

// Generate improvement suggestions
function getImprovementSuggestions(sslScore, domainScore, sslData, domainData) {
  const suggestions = [];
  let potentialPoints = 0;

  // Check SSL
  if (sslScore < SSL_WEIGHT) {
    suggestions.push("Enable or renew SSL certificate");
    potentialPoints += SSL_WEIGHT - sslScore;
  }

  // Check domain validity
  const daysLeft = domainData?.daysLeft || 0;
  if (daysLeft <= 2) {
    suggestions.push("Renew your domain");
    potentialPoints += DOMAIN_VALIDITY_WEIGHT;
  }

  // Check domain protection
  const isProtected = domainData?.isProtected || false;
  if (!isProtected) {
    suggestions.push("Enable server-side domain protection");
    potentialPoints += DOMAIN_PROTECTION_WEIGHT;
  }

  return { suggestions, potentialPoints };
}

function SSLDomain({ url }) {
  const [sslData, setSslData] = useState(null);
  const [domainData, setDomainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const domain = url ? new URL(url).hostname : null;

  const fetchWithCache = async (key) => {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  };

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      const ssl = await fetchWithCache(`ssl_${url}`);
      setSslData(ssl || {});
      const domainInfo = await fetchWithCache(`domain_${domain}`);
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

  // Calculate scores
  const sslScore = calculateSSLScore(sslData);
  const domainScore = calculateDomainScore(domainData);
  const totalScore = Math.round(sslScore + domainScore);

  // Get improvement suggestions
  const { suggestions, potentialPoints } = getImprovementSuggestions(
    sslScore,
    domainScore,
    sslData,
    domainData
  );

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
    <div className="min-h-screen p-8 ">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Score Display */}
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

        {/* Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Security & Domain Summary
          </h3>
          {/* Improvement Suggestion */}
          {potentialPoints > 0 && (
            <div className="flex items-start py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-blue-300 text-sm font-medium">
                  Fix these to earn {potentialPoints} more points:
                </span>
                <span className="text-blue-200 text-sm ml-1">
                  {suggestions.join(", ")}
                </span>
              </div>
            </div>
          )}

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
            <div className="flex items-center py-3 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mt-3">
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
