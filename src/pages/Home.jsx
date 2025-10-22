import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigateTo = useNavigate();

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[800px] h-[30vh] max-h-[400px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-4xl w-full py-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-white mb-4 md:mb-6 leading-tight">
          Stop juggling tools.
          <br />
          Get clear website
          <br />
          health in one place.
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
          Check your website daily health: uptime, speed, SSL, domain, SEO & security checks and explains results in plain English.
        </p>

        <button
          className="group bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] cursor-pointer"
          onClick={() => navigateTo("/check")}
        >
          Check Your Website
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}