import React, { useEffect, useState } from "react";
import {
  XCircle,
  ExternalLink,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle,
} from "lucide-react";

function BrokenLinks({ url }) {
  const [brokenLinks, setBrokenLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ✅ Unified fetch + cache helper
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
      console.error("BrokenLinks API error:", err);
      setError("Failed to fetch broken links.");
      return null;
    }
  };

  useEffect(() => {
    if (!url) return;

    const storageKey = `brokenLinks_${url}`;
    setLoading(true);
    setError(null);

    // 🧹 Remove old caches from previous sites, keep current
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("brokenLinks_") && key !== storageKey) {
        sessionStorage.removeItem(key);
      }
    });

    const fetchLinks = async () => {
      const data = await fetchWithCache(
        storageKey,
        `${apiUrl}/broken-links`,
        { url }
      );

      setBrokenLinks(data?.links || []);
      setLoading(false);
    };

    fetchLinks();
  }, [url]);

  // 🔹 Status summary component
  const SummaryCard = () => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center">
        <div
          className={`p-3 rounded-xl ${
            brokenLinks.length > 0
              ? "bg-red-500/10 border border-red-500/20"
              : "bg-green-500/10 border border-green-500/20"
          }`}
        >
          <AlertCircle
            className={`w-6 h-6 ${
              brokenLinks.length > 0 ? "text-red-400" : "text-green-400"
            }`}
          />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-white">
            {loading
              ? "Checking Links..."
              : brokenLinks.length > 0
              ? "Broken Links Detected"
              : "No Broken Links"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {loading
              ? "Please wait while we scan your website..."
              : brokenLinks.length > 0
              ? `Found ${brokenLinks.length} broken link${
                  brokenLinks.length > 1 ? "s" : ""
                } on your website.`
              : "All links on your website are working perfectly!"}
          </p>
        </div>
      </div>
    </div>
  );

  // 🔹 Broken link list card
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
    </div>
  );

  // 🔹 No broken links card
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
      <div className="max-w-6xl mx-auto space-y-6">
        <SummaryCard />

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : loading ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 flex items-center justify-center text-center animate-pulse">
            <p className="text-gray-400">Scanning for broken links...</p>
          </div>
        ) : brokenLinks.length > 0 ? (
          <BrokenLinksList />
        ) : (
          <NoBrokenLinksCard />
        )}
      </div>
    </div>
  );
}

export default BrokenLinks;
