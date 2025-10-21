import React from "react";
import { useNavigate } from "react-router-dom";
function Header() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <header className="bg-[#08070E] border-b border-gray-700 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <img
                  src="../../public/Untitled design.png"
                  alt="Logo"
                  className="w-10 h-10"
                />
                <span className="text-2xl text-white font-semibold">
                  WebVytal
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/form')}
            className="bg-cyan-500 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Join Early Access
          </button>
        </div>
      </header>
    </div>
  );
}

export default Header;
