import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComingSoon = () => {
  const url = import.meta.env.VITE_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({ email: "", fullName: "" });
  const navigate = useNavigate();

  const features = [
    "24/7 Website Health Check",
    "Automated Report Generation",
    "Add Multiple Websites at Once",
    "SMS Support for Alerts",
  ];

  const handleSubmit = async () => {
    const name = formData.fullName.trim();
    const email = formData.email.trim();

    if (!name || !email) {
      alert("Please fill all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${url}/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      // Wait for the data, then show welcome card
      setUserName(name);
      setShowWelcome(true);
      setFormData({ email: "", fullName: "" });
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Failed to register, try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070E] text-gray-100 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* X Icon top-right */}

      <a
        href="https://x.com/KumarRahul65727"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-cyan-500/30 hover:border-cyan-400 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 1227"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M714.2 519.2L1160.9 0H1052L673.8 442.2 384.2 0H0L468.9 681.7 0 1226.6H108.9L511.1 757.5 831.1 1226.6H1200M148.5 79.2H326.5L1051.4 1147.4H873.4" />
        </svg>
      </a>

      {/* Glow background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-600/5 to-transparent blur-3xl opacity-40" />

      {/* Welcome Card Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-cyan-400" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                Welcome, {userName}! 🎉
              </h3>

              <p className="text-gray-300 text-lg">
                Thank you for joining our early access list!
              </p>

              <p className="text-gray-400 text-sm">
                We'll notify you as soon as the Website Health Dashboard
                launches. Get ready for seamless monitoring!
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-6 cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/40"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 max-w-5xl w-full">
        {/* Left side - Info */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            🚀 Website Health Dashboard <br />
            <span className="text-cyan-400">Coming Soon</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-lg mx-auto lg:mx-0">
            Stay ahead of downtime with real-time monitoring, automated reports,
            and powerful alerts.
          </p>

          <div className="space-y-3">
            {features.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-center lg:justify-start gap-2"
              >
                <CheckCircle2 className="text-cyan-400 w-5 h-5" />
                <span className="text-gray-200 text-sm md:text-base">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">
            Join Our Early Access
          </h2>
          <div className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="block text-white text-sm mb-2 font-medium"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-white text-sm mb-2 font-medium"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-cyan-500 cursor-pointer hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="mt-10 text-gray-400 text-sm text-center">
        © {new Date().getFullYear()} Website Health Checker — All Rights
        Reserved
      </div>
    </div>
  );
};

export default ComingSoon;
