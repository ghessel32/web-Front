import React, { useState, useEffect } from "react";
import {
  Globe,
  Shield,
  Search,
  Lock,
  Link2Off,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Uptimer from "../components/Uptimer.jsx";
import SSLDomain from "../components/Ssldomain.jsx";
import BrokenLinks from "../components/BrokenLink.jsx";
import SecurityThreat from "../components/Security.jsx";
import SEOAnalysis from "../components/Seo.jsx";
import SpeedPerformance from "../components/Speed.jsx";

const Details = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { name, url } = location.state || {};

  const tabs = [
    { id: "overview", label: "Uptime", icon: Globe },
    { id: "speed", label: "Speed", icon: Activity },
    { id: "ssl", label: "SSL&Domain", icon: Lock },
    { id: "seo", label: "SEO", icon: Search },
    { id: "security", label: "Security", icon: Shield },
    { id: "broken", label: "Broken Links", icon: Link2Off },
  ];

  const renderTabContent = () => {
    if (!url)
      return (
        <div className="text-center text-gray-400 py-10">No URL provided.</div>
      );

    switch (activeTab) {
      case "overview":
        return <Uptimer url={url} />;
      case "speed":
        return <SpeedPerformance url={url} />;
      case "ssl":
        return <SSLDomain url={url} />;
      case "seo":
        return <SEOAnalysis url={url} />;
      case "security":
        return <SecurityThreat url={url} />;
      case "broken":
        return <BrokenLinks url={url} />;
      default:
        return (
          <div className="text-gray-300 text-center py-10">
            Other tabs not updated yet.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#08070E] text-gray-100 p-4">
      {/* --- Top Section: Website Info --- */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start space-x-4">
          {/* Logo */}
          {url && (
            <div className="flex-shrink-0">
              <img
                src={`https://www.google.com/s2/favicons?domain=${url}&sz=128`}
                alt={`${name || "My website"} logo`}
                className="w-16 h-16 rounded-xl bg-white/5 p-2 border border-white/10"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Website Info */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              {name || "My web"}
            </h2>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">{url}</span>
            </a>
          </div>
        </div>
        <button 
        onClick={()=> navigate("/leaderboard")}
        className="text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold px-3 sm:px-4 py-2 rounded-md cursor-pointer transition-all duration-200 mr-20 mt-5">LeaderBoard</button>
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="flex space-x-6 border-b border-gray-700 mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 flex items-center text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-white"
                  : "border-b-2 border-transparent text-gray-400 hover:text-white hover:border-gray-600"
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- Tab Content --- */}
      {renderTabContent()}
    </div>
  );
};

export default Details;
