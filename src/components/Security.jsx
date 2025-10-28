import React, { useEffect, useState } from "react";
import {
  Shield,
  CheckCircle,
  Lock,
  AlertTriangle,
  Globe,
  TrendingUp,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle.jsx";

const SECURITY_WEIGHTS = {
  httpsEnabled: 20,
  hstsHeader: 15,
  contentSecurityPolicy: 15,
  xFrameOptions: 10,
};

const THREAT_WEIGHT = 40;

function SecurityThreat({ url }) {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState({});
  const [threatData, setThreatData] = useState({});
  const [error, setError] = useState(null);

  const fetchWithCache = async (key) => {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  };

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      const security = await fetchWithCache(`security_${url}`);
      setSecurityData(security || {});
      const threat = await fetchWithCache(`threat_${url}`);
      setThreatData(threat || {});
      setLoading(false);
    };

    fetchData();
  }, [url]);

  // Calculate security score and missing headers
  const calculateSecurityScore = () => {
    let score = 0;
    const missing = [];

    if (securityData.httpsEnabled || securityData.https_enabled) {
      score += SECURITY_WEIGHTS.httpsEnabled;
    } else {
      missing.push({ name: "HTTPS", points: SECURITY_WEIGHTS.httpsEnabled });
    }

    if (securityData.hstsHeader || securityData.hsts_header) {
      score += SECURITY_WEIGHTS.hstsHeader;
    } else {
      missing.push({
        name: "HSTS Header",
        points: SECURITY_WEIGHTS.hstsHeader,
      });
    }

    if (
      securityData.contentSecurityPolicy ||
      securityData.content_security_policy
    ) {
      score += SECURITY_WEIGHTS.contentSecurityPolicy;
    } else {
      missing.push({
        name: "Content Security Policy",
        points: SECURITY_WEIGHTS.contentSecurityPolicy,
      });
    }

    if (securityData.xFrameOptions || securityData.x_frame_options) {
      score += SECURITY_WEIGHTS.xFrameOptions;
    } else {
      missing.push({
        name: "X-Frame-Options",
        points: SECURITY_WEIGHTS.xFrameOptions,
      });
    }

    return { score, missing };
  };

  // Calculate threat score
  const calculateThreatScore = () => {
    if (!threatData) return 0;
    const isSafe = threatData.safe === true;
    return isSafe ? THREAT_WEIGHT : 0;
  };

  const securityScore = calculateSecurityScore();
  const threatScore = calculateThreatScore();
  const totalScore = Math.round(securityScore.score + threatScore);

  //Get summary msgs
  const getSummaryMessages = () => {
    const messages = [];
    const isThreatSafe = threatData.safe === true;
    const missingHeaders = securityScore.missing;

    // Calculate total points that can be earned
    const totalMissingPoints = missingHeaders.reduce(
      (sum, item) => sum + item.points,
      0
    );
    const threatPoints = !isThreatSafe ? THREAT_WEIGHT : 0;
    const totalEarnablePoints = totalMissingPoints + threatPoints;

    // Fix message on top (only if there are issues)
    if (totalEarnablePoints > 0) {
      messages.push({
        type: "info",
        icon: TrendingUp,
        text: `Fix security issues and earn ${totalEarnablePoints} points`,
      });
    }

    // Safe Browsing Status
    if (isThreatSafe) {
      messages.push({
        type: "success",
        icon: CheckCircle,
        text: "Safe Browsing: No threats detected - your website is clean",
      });
    } else {
      const issues = [];
      if (threatData.malware) issues.push("malware");
      if (threatData.phishing) issues.push("phishing");
      if (threatData.unwanted) issues.push("unwanted programs");

      messages.push({
        type: "error",
        icon: AlertTriangle,
        text: `Safe Browsing: Threats detected (${issues.join(", ")})`,
      });
    }

    // Security Headers Status
    if (missingHeaders.length === 0) {
      messages.push({
        type: "success",
        icon: CheckCircle,
        text: "Security Headers: All headers properly configured",
      });
    } else {
      const headerNames = missingHeaders.map((h) => h.name).join(", ");

      messages.push({
        type: "warning",
        icon: AlertTriangle,
        text: `Security Headers: Missing ${missingHeaders.length} header${
          missingHeaders.length > 1 ? "s" : ""
        } (${headerNames})`,
      });
    }

    return messages;
  };

  const summaryMessages = getSummaryMessages();

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
      <span
        className={`text-sm font-medium ${
          status === "success"
            ? "text-green-400"
            : status === "warning"
            ? "text-yellow-400"
            : "text-red-400"
        }`}
      >
        {statusText}
      </span>
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
    <div className="min-h-screen p-4 sm:p-6 md:p-8 space-y-6">
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

        {/* Summary Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
          <div className="flex items-center mb-5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="ml-3 text-lg sm:text-xl font-semibold text-white">
              Security Summary
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
                    : "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15  font-bold"
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
                icon={
                  securityData.httpsEnabled || securityData.https_enabled
                    ? CheckCircle
                    : AlertTriangle
                }
                label="HTTPS Enabled"
                status={
                  securityData.httpsEnabled || securityData.https_enabled
                    ? "success"
                    : "error"
                }
                statusText={
                  securityData.httpsEnabled || securityData.https_enabled
                    ? "Active"
                    : "Inactive"
                }
              />
              <InfoRow
                icon={
                  securityData.hstsHeader || securityData.hsts_header
                    ? CheckCircle
                    : AlertTriangle
                }
                label="Strict-Transport-Security"
                status={
                  securityData.hstsHeader || securityData.hsts_header
                    ? "success"
                    : "error"
                }
                statusText={
                  securityData.hstsHeader || securityData.hsts_header
                    ? "Enabled"
                    : "Missing"
                }
              />
              <InfoRow
                icon={
                  securityData.xFrameOptions || securityData.x_frame_options
                    ? CheckCircle
                    : AlertTriangle
                }
                label="X-Frame-Options"
                status={
                  securityData.xFrameOptions || securityData.x_frame_options
                    ? "success"
                    : "error"
                }
                statusText={
                  securityData.xFrameOptions || securityData.x_frame_options
                    ? "Enabled"
                    : "Missing"
                }
              />
              <InfoRow
                icon={
                  securityData.contentSecurityPolicy ||
                  securityData.content_security_policy
                    ? CheckCircle
                    : AlertTriangle
                }
                label="Content-Security-Policy"
                status={
                  securityData.contentSecurityPolicy ||
                  securityData.content_security_policy
                    ? "success"
                    : "warning"
                }
                statusText={
                  securityData.contentSecurityPolicy ||
                  securityData.content_security_policy
                    ? "Enabled"
                    : "Missing"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityThreat;
