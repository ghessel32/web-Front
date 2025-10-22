import React from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-[#08070E] border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <img
            src="/Untitled design.png"
            alt="Logo"
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <span className="text-lg sm:text-2xl text-white font-semibold">
            <a href="/">WebVytal</a>
          </span>
        </div>

        {/* Join Button */}
        <button
          onClick={() => navigate("/form")}
          className="text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-semibold px-3 sm:px-4 py-2 rounded-md cursor-pointer transition-all duration-200"
        >
          Join Early Access
        </button>
      </div>
    </header>
  );
}

export default Header;
