import React from "react";

function Header() {
  return (
    <header className="border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 sticky top-0 z-50 w-full mt-0">
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
      </div>
    </header>
  );
}

export default Header;
