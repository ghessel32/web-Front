import React, { useEffect, useState } from "react";
import { ArrowRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { fetchTopWebsites } from "../services/leaderservice.js";

export default function LandingPage() {
  const navigateTo = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const top = await fetchTopWebsites();

        const mappedTop = (top || []).slice(0, 3).map((item) => ({
          name: item.name,
          logo: `https://www.google.com/s2/favicons?domain=${item.url}&sz=128`,
          healthScore: item.score,
          url: item.url,
        }));

        setData(mappedTop);
      } catch (err) {
        console.error("Error fetching top websites:", err);
      }
    }
    loadData();
  }, []);

  const getRankBorder = (rank) => {
    switch (rank) {
      case 1:
        return "border-yellow-400";
      case 2:
        return "border-gray-300";
      case 3:
        return "border-orange-400";
      default:
        return "border-white/10";
    }
  };

  const getCrownColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-300";
      case 3:
        return "text-orange-400";
      default:
        return "text-transparent";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center  px-4 gap-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)",
        }}
      />

      <Header />

      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white text-center leading-tight z-20 m-3">
        Can your website outperform <br className="hidden sm:block" />
        these top scorers? <br className="hidden sm:block" />
        <span className="block mt-2 text-cyan-400 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
          Check your health score instantly — it’s free.
        </span>
      </h2>

      {/* Leaderboard Section */}
      <div className="z-10 w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden mt-3">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
            🏆 Leaderboard
          </h2>
          <ArrowRight
            onClick={() => navigateTo("/leaderboard")}
            className="w-5 h-5 text-cyan-300 cursor-pointer"
          />
        </div>

        {/* Scrollable list */}
        <div className="max-h-[400px] overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm italic">
              Loading...
            </div>
          ) : (
            data.map((site, index) => {
              const isTopThree = index < 3;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${
                    isTopThree
                      ? `border-l-4 border-1 ${getRankBorder(index + 1)}`
                      : "border border-white/10"
                  } bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300`}
                >
                  <div className="flex items-center gap-4">
                    {isTopThree && (
                      <Crown
                        className={`${getCrownColor(index + 1)} w-5 h-5`}
                      />
                    )}
                    <img
                      src={site.logo}
                      alt={site.name}
                      className="w-10 h-10 rounded-md border border-white/20 object-cover p-1"
                    />
                    <span className="text-white/90 text-base font-medium">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {site.name}
                      </a>
                    </span>
                  </div>
                  <span
                    className={`text-xl font-semibold ${getScoreColor(
                      site.healthScore
                    )}`}
                  >
                    {site.healthScore}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Call to Action Button */}
      <button
        className="group z-20 bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] cursor-pointer m-5"
        onClick={() => navigateTo("/check")}
      >
        Check Your Website
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
