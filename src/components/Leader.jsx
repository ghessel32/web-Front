import React, { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import TopThreeRank from "./TopThree.jsx"; // keep your existing file
import {
  fetchLeaderboard,
  fetchTopWebsites,
} from "../services/leaderservice.js";

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [topThree, setTopThree] = useState([]);
  const [data, setData] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [top, leaderboard] = await Promise.all([
          fetchTopWebsites(),
          fetchLeaderboard(),
        ]);

        // Map Supabase data to your UI format
        const mappedTop = top.map((item) => ({
          name: item.name,
          logo: `https://www.google.com/s2/favicons?domain=${item.url}&sz=128`,
          score: item.score,
        }));

        const mappedAll = leaderboard.map((item) => ({
          logo: `https://www.google.com/s2/favicons?domain=${item.url}&sz=128`,
          name: item.name,
          healthScore: item.score,
          url: item.url,
        }));

        setTopThree(mappedTop);
        setData(mappedAll);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to load leaderboard:", err);
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

  const getInsetShadow = (rank) => {
    switch (rank) {
      case 1:
        return "inset 20px 0 12px -8px rgba(234, 179, 8, 0.3)";
      case 2:
        return "inset 20px 0 12px -8px rgba(156, 163, 175, 0.3)";
      case 3:
        return "inset 20px 0 12px -8px rgba(217, 119, 6, 0.3)";
      default:
        return "";
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0b0b0b] to-[#1a1a1a] text-white flex flex-col items-center pt-16 px-4">
        <h1 className="text-3xl font-semibold mb-10 text-center">
          Website Health Leaderboard
        </h1>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-white text-xl italic z-20">
            Loading...
          </div>
        ) : (
          <>
            {/* Top 3 Ranking */}
            <TopThreeRank topThree={topThree} />

            {/* Full leaderboard list */}
            <div className="w-full max-w-5xl space-y-4">
              {data && data.length > 0 ? (
                data.map((site, index) => {
                  const isTopThree = index < 3;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-6 ${
                        isTopThree
                          ? `border border-l-4 ${getRankBorder(index + 1)}`
                          : "border border-white/20"
                      } bg-white/10 backdrop-blur-lg rounded-2xl hover:bg-white/20 transition-all duration-300`}
                      style={
                        isTopThree
                          ? { boxShadow: getInsetShadow(index + 1) }
                          : {}
                      }
                    >
                      <div className="flex items-center space-x-4">
                        {isTopThree && (
                          <Crown
                            className={`${getCrownColor(index + 1)} w-5 h-5`}
                          />
                        )}
                        <img
                          src={site.logo}
                          alt={site.name}
                          className="w-12 h-12 rounded-lg border border-white/20 object-cover p-1"
                        />
                        <div className="flex flex-col justify-start items-start">
                          <span className="text-lg font-medium">
                            {site.name}
                          </span>
                          <a
                            href={site.url}
                            className="text-gray-500 hover:text-gray-300 truncate max-w-[150px] block"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {site.url}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-10">
                        <span
                          className={`font-bold text-2xl ${getScoreColor(
                            site.healthScore
                          )}`}
                        >
                          {site.healthScore}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 italic py-10">
                  No data available.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
