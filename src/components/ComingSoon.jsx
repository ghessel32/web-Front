import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const ComingSoon = () => {
  const url = import.meta.env.VITE_API_URL;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const features = [
    "24/7 Website Health Check",
    "Automated Report Generation",
    "Add Multiple Websites at Once",
    "SMS Support for Alerts",
  ];

  return (
    <div className="min-h-screen bg-[#08070E] text-gray-100 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Glow background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-600/5 to-transparent blur-3xl opacity-40" />

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
          <form
            className="flex flex-col gap-5"
            onSubmit={async (e) => {
              e.preventDefault();

              const formData = new FormData(e.target);
              const name = formData.get('fullName').trim();
              const email = formData.get('email').trim();

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

                alert("Successfully registered for early access!");
                e.target.reset();
              } catch (err) {
                console.error("Error:", err);
                alert(err.message || "Failed to register, try again.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
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
                name="email"
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
                name="fullName"
                placeholder="John Doe"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </button>
          </form>
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