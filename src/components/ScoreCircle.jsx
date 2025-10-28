import React from "react";

function ScoreCircle({ 
  score = 0, 
  maxScore = 100, 
  size = "medium", // "small", "medium", "large"
  showLabel = true,
  label = "out of 100",
  className = ""
}) {
  const sizes = {
    small: { 
      container: "w-32 h-32", 
      viewBox: 128, 
      center: 64, 
      radius: 40, 
      strokeWidth: 12, 
      fontSize: "text-3xl" 
    },
    medium: { 
      container: "w-40 h-40", 
      viewBox: 160, 
      center: 80, 
      radius: 65, 
      strokeWidth: 14, 
      fontSize: "text-4xl" 
    },
    large: { 
      container: "w-48 h-48 sm:w-56 sm:h-56", 
      viewBox: 200, 
      center: 100, 
      radius: 80, 
      strokeWidth: 18, 
      fontSize: "text-5xl sm:text-6xl" 
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreStroke = (score) => {
    if (score >= 90) return "#4ade80"; // green-400
    if (score >= 70) return "#facc15"; // yellow-400
    return "#f87171"; // red-400
  };

  const sizeConfig = sizes[size] || sizes.large;
  const { viewBox, center, radius, strokeWidth } = sizeConfig;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  return (
    <div className={`relative ${sizeConfig.container} ${className}`}>
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox={`0 0 ${viewBox} ${viewBox}`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getScoreStroke(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`${sizeConfig.fontSize} font-bold ${getScoreColor(score)}`}>
          {score}
        </p>
        {showLabel && (
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

export default ScoreCircle;