import React, { useEffect, useState } from "react";
import {
  XCircle,
  ExternalLink,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle";

function BrokenLinks({ url }) {
  const [brokenCount, setBrokenCount] = useState(0);
  const [brokenLinks, setBrokenLinks] = useState([]); // URLs
  const [totalLinks, setTotalLinks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const storageKey = `brokenLinks_${url}`;
    const cached = sessionStorage.getItem(storageKey);

    if (cached) {
      const data = JSON.parse(cached);
      setBrokenCount(data.brokenLinks || 0);
      setBrokenLinks(data.links || []);
      setTotalLinks(data.totalLinks || 0);
      setLoading(false);
      setError(null);
    } else {
      console.log(`No data found in sessionStorage for ${url}`);
      setBrokenCount(0);
      setBrokenLinks([]);
      setTotalLinks(0);
      setLoading(false);
      setError("No data available");
    }
  }, [url]);

  // ✅ Calculate score
  const calculateBrokenLinksScore = (total, broken) => {
    if (total === 0) return { totalScore: 100, details: "No links found" };

    const score = 100 * (1 - broken / total);
    return {
      totalScore: Math.floor(score),
      details: `${broken} broken links out of ${total}`,
    };
  };

  const { totalScore, details } = calculateBrokenLinksScore(
    totalLinks,
    brokenCount
  );

  // ✅ Summary
  const SummaryCard = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
      {/* Header: icon + title */}
      <div className="flex items-center mb-4">
        <div
          className={`p-3 rounded-xl ${
            brokenCount > 0
              ? "bg-red-500/10 border border-red-500/20"
              : "bg-green-500/10 border border-green-500/20"
          }`}
        >
          <AlertCircle
            className={`w-6 h-6 ${
              brokenCount > 0 ? "text-red-400" : "text-green-400"
            }`}
          />
        </div>
        <h3 className="ml-3 text-lg font-semibold text-white">
          {loading ? "Checking Links..." : "Broken Links Summary"}
        </h3>
      </div>
      {/* Optional note */}
      {!loading && brokenCount > 0 && (
        <div className="flex items-start py-4 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-blue-300 text-sm font-medium">
              🔒 Fix broken links to improve your score by{" "}
              {Math.round(100 - totalScore)} points.
            </span>
          </div>
        </div>
      )}

      {/* Status list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/10">
          <span className="flex items-center gap-2 text-gray-200">
            <LinkIcon className="w-4 h-4 text-gray-400" />
            <span>Total Links</span>
          </span>
          <span className="text-gray-400">{totalLinks}</span>
        </div>

        <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/10">
          <span className="flex items-center gap-2 text-gray-200">
            <XCircle className="w-4 h-4 text-gray-400" />
            <span>Broken Links</span>
          </span>
          <span
            className={`font-medium ${
              brokenCount > 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            {brokenCount > 0 ? `${brokenCount} found` : "None"}
          </span>
        </div>

        <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/10">
          <span className="flex items-center gap-2 text-gray-200">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            <span>Status</span>
          </span>
          <span
            className={`font-medium ${
              brokenCount > 0 ? "text-red-400" : "text-green-400"
            }`}
          >
            {loading
              ? "Scanning..."
              : brokenCount > 0
              ? "Needs Attention"
              : "Healthy"}
          </span>
        </div>
      </div>
    </div>
  );

  // ✅ Broken links list
  const BrokenLinksList = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <LinkIcon className="w-6 h-6 text-orange-400" />
        </div>
        <h3 className="text-lg font-semibold text-white ml-4">
          Broken Links Details
        </h3>
      </div>

      {brokenLinks.length > 0 ? (
        <div className="space-y-4">
          {brokenLinks.map((link, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-red-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-gray-300 font-mono break-all">
                  {link}
                </p>
              </div>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 text-gray-500 hover:text-gray-300 transition" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No broken link URLs found.</p>
      )}
    </div>
  );

  const NoBrokenLinksCard = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 flex items-center justify-center text-center">
      <div className="text-center">
        <div className="p-4 rounded-full bg-green-500/10 border border-green-500/20 inline-block mb-3">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">No Broken Links</h3>
        <p className="text-gray-400 mt-1">
          All links on your website are healthy and working!
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8">
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

        {/* Summary */}
        <SummaryCard />

        {/* Results */}
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : loading ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 flex items-center justify-center text-center animate-pulse">
            <p className="text-gray-400">Scanning for broken links...</p>
          </div>
        ) : brokenCount > 0 ? (
          <BrokenLinksList />
        ) : (
          <NoBrokenLinksCard />
        )}
      </div>
    </div>
  );
}

export default BrokenLinks;
