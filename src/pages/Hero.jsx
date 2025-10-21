import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WebsiteHealthChecker() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    siteName: "",
    siteUrl: "",
  });
  const [errors, setErrors] = useState({
    siteName: "",
    siteUrl: "",
  });
  const [isChecking, setIsChecking] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.siteName.trim())
      newErrors.siteName = "Please enter a website name";
    const urlPattern = /^https?:\/\/.+\..+/;
    if (!urlPattern.test(formData.siteUrl))
      newErrors.siteUrl =
        "Please enter a valid URL (e.g., https://example.com)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkWebsiteExists = async (url) => {
    try {
      const response = await fetch(`${apiUrl}/check-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check website");
      }

      return data.exists;
    } catch (error) {
      console.error("Error checking website:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsChecking(true);
    setErrors((prev) => ({ ...prev, siteUrl: "" }));

    try {
      const exists = await checkWebsiteExists(formData.siteUrl);

      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          siteUrl:
            "Unable to reach this website (host not found or returned error). Please check the URL.",
        }));
        setIsChecking(false);
        return;
      }

      const websiteData = {
        name: formData.siteName.trim(),
        url: formData.siteUrl.trim(),
        timestamp: new Date().toISOString(),
      };

      navigate("/details", { state: { websiteData } });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        siteUrl: "Error checking website. Please try again.",
      }));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070E] flex items-center justify-center p-5 z-10">
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">
              Website Health Checker
            </h1>
            <p className="text-purple-200 text-lg">
              Monitor your website's performance and security
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="siteName"
                className="block text-white font-semibold mb-2"
              >
                Website Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="e.g., My Awesome Website"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              {errors.siteName && (
                <p className="text-red-300 text-sm mt-2">{errors.siteName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="siteUrl"
                className="block text-white font-semibold mb-2"
              >
                Website URL
              </label>
              <input
                type="url"
                id="siteUrl"
                name="siteUrl"
                value={formData.siteUrl}
                onChange={handleChange}
                placeholder="e.g., https://example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              {errors.siteUrl && (
                <p className="text-red-300 text-sm mt-2">{errors.siteUrl}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChecking}
              className={`w-full py-4 font-bold rounded-xl transform transition-all shadow-lg cursor-pointer ${
                isChecking
                  ? "bg-gray-500 text-gray-300 cursor-wait"
                  : "bg-cyan-500 text-white hover:bg-cyan-600 hover:scale-[1.02] hover:shadow-cyan-500/50"
              }`}
            >
              {isChecking ? "Fetching..." : "Check Website Health"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
