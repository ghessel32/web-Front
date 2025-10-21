import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Lock,
  Calendar,
  Link2Off,
  Shield,
  Zap,
  Smartphone,
} from "lucide-react";

const ReportCard = () => {
  const [data, setData] = useState(null);
  const location = useLocation();

  // Extract the ?url=... query parameter
  const params = new URLSearchParams(location.search);
  const url = params.get("url");
  const name = params.get("name");
  console.log(name, url);

  // Helper: extract domain (without protocol or path)
  const extractDomain = (fullUrl) => {
    try {
      const hostname = new URL(fullUrl).hostname;
      return hostname.replace(/^www\./, ""); // remove "www."
    } catch {
      return fullUrl;
    }
  };

  useEffect(() => {
    if (!url) return;

    const domain = extractDomain(url);

    try {
      const stored = {
        uptime: JSON.parse(sessionStorage.getItem(`uptimeData_${url}`)),
        broken: JSON.parse(sessionStorage.getItem(`brokenLinks_${url}`)),
        ssl: JSON.parse(sessionStorage.getItem(`ssl_${url}`)),
        domain: JSON.parse(sessionStorage.getItem(`domain_${domain}`)),
        seo: JSON.parse(sessionStorage.getItem(`seo_${url}`)),
        security: JSON.parse(sessionStorage.getItem(`security_${url}`)),
        speed: JSON.parse(sessionStorage.getItem(`speedData_${url}`)),
      };

      if (Object.values(stored).some((v) => v !== null)) {
        setData(stored);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error("Error reading session data:", err);
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#08070E] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">
          No stored report data found.
        </div>
      </div>
    );
  }
  console.log(data);

  const checks = [
    {
      icon: Globe,
      label: "Website Uptime",
      status: data.uptime?.status === 200 ? "success" : "error",
      details:
        data.uptime?.status === 200
          ? "Website is reachable and online"
          : "Website appears to be down",
    },
    {
      icon: Zap,
      label: "Desktop Performance",
      status:
        data.speed?.labData?.desktop &&
        Object.values(data.speed.labData.desktop).every((v) => v === "fast")
          ? "success"
          : data.speed?.labData?.desktop &&
            Object.values(data.speed.labData.desktop).some((v) => v === "slow")
          ? "error"
          : "warning",
      details:
        data.speed?.labData?.desktop &&
        Object.values(data.speed.labData.desktop).every((v) => v === "fast")
          ? "Excellent loading speed"
          : data.speed?.labData?.desktop
          ? "Needs optimization"
          : "Data unavailable",
    },
    {
      icon: Lock,
      label: "SSL Certificate",
      status: data.ssl?.Status === "Valid & Secure" ? "success" : "error",
      details: data.ssl?.Status || "No SSL data found",
    },
    {
      icon: Calendar,
      label: "Domain Status",
      status:
        data.domain?.daysLeft > 30
          ? "success"
          : data.domain?.daysLeft > 0
          ? "warning"
          : "error",
      details: data.domain?.daysLeft
        ? `${data.domain.daysLeft} days remaining`
        : "Domain expiration unknown",
    },
    {
      icon: Shield,
      label: "Security Configuration",
      status:
        data.security &&
        [
          "httpsEnabled",
          "hstsHeader",
          "contentSecurityPolicy",
          "xFrameOptions",
        ].filter((f) => data.security[f]).length >= 3
          ? "success"
          : "warning",
      details: `${
        data.security
          ? [
              "httpsEnabled",
              "hstsHeader",
              "contentSecurityPolicy",
              "xFrameOptions",
            ].filter((f) => data.security[f]).length
          : 0
      } / 4 key headers configured`,
    },
    {
      icon: CheckCircle,
      label: "SEO Readiness",
      status:
        data.seo &&
        ["title", "metaDescription", "h1", "robots", "sitemap"].filter(
          (f) => data.seo[f]
        ).length >= 4
          ? "success"
          : "warning",
      details: `${
        data.seo
          ? ["title", "metaDescription", "h1", "robots", "sitemap"].filter(
              (f) => data.seo[f]
            ).length
          : 0
      } / 5 essential elements present`,
    },
    {
      icon: Link2Off,
      label: "Broken Links",
      status:
        data.broken?.count === 0
          ? "success"
          : data.broken?.count
          ? "error"
          : "warning",
      details:
        data.broken?.count === 0
          ? "All links are functional"
          : `${data.broken?.count || "Unknown"} broken links found`,
    },
    {
      icon: Smartphone,
      label: "Mobile Performance",
      status:
        data.speed?.labData?.mobile &&
        Object.values(data.speed.labData.mobile).every((v) => v === "fast")
          ? "success"
          : data.speed?.labData?.mobile &&
            Object.values(data.speed.labData.mobile).some((v) => v === "slow")
          ? "error"
          : "warning",
      details: data.speed?.labData?.mobile
        ? Object.values(data.speed.labData.mobile).every((v) => v === "fast")
          ? "Optimized for mobile"
          : "Needs improvement"
        : "No mobile data found",
    },
  ];

  const getStatusIcon = (status) => {
    if (status === "success")
      return <CheckCircle className="w-5 h-5 mr-2 text-green-400" />;
    if (status === "error")
      return <XCircle className="w-5 h-5 mr-2 text-red-400" />;
    return <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />;
  };

  return (
    <div className="min-h-screen bg-[#08070E] flex items-center justify-center p-8">
       
      <div
        id="report-card"
        className="relative max-w-2xl w-full p-8 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.45), inset 0 0 0.5px 0.5px rgba(255,255,255,0.2)",
        }}
      >
       
        {/* Header */}
        <div className="text-center mb-5 pb-3 border-b border-white/20">
          <div className="flex items-center justify-center mb-4">
            <div className="m-2">
              <img
                src={`https://www.google.com/s2/favicons?domain=${url}&sz=128`}
                alt={`${name} logo`}
                className="w-13 h-13 rounded-xl bg-white/5 p-2 border border-white/10"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="flex-col items-start justify-center ml-2">
              <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                {name}
              </h1>
              <p className="text-cyan-300 text-xs">{url}</p>
            </div>
          </div>

          <div className="mt-4 inline-block px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
            <p className="text-sm text-gray-200">Website Health Report</p>
          </div>
        </div>

        {/* Checks */}
        <div className="space-y-3 mb-8">
          {checks.map((check, i) => {
            const Icon = check.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl p-2 border border-white/20 backdrop-bl-sm hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      check.status === "success"
                        ? "bg-green-500/20"
                        : check.status === "error"
                        ? "bg-red-500/20"
                        : "bg-yellow-500/20"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        check.status === "success"
                          ? "text-green-400"
                          : check.status === "error"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium text-base">
                      {check.label}
                    </p>
                    <p className="text-gray-300 text-xs">{check.details}</p>
                  </div>
                </div>
                <div>{getStatusIcon(check.status)}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-white/20">
          <p className="text-gray-300 text-sm">
            Generated on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
