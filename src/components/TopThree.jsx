import React from "react";
import { Crown } from "lucide-react";

const TopThreeRank = ({ topThree }) => {
  if (!topThree || topThree.length === 0) return null;

  // Sort by rank or score (if not already sorted)
  const sorted = [...topThree].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="flex items-end justify-center gap-6 sm:gap-8">
        {/* #2 */}
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 sm:w-22 sm:h-22 mb-2">
            <img
              src={sorted[1]?.logo}
              alt={sorted[1]?.name}
              className="w-full h-full rounded-full object-cover border-4 border-gray-300 shadow-md p-1 sm:p-2"
            />
            <Crown className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 text-gray-300 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-medium text-gray-700 text-sm sm:text-lg">
            {sorted[1]?.name}
          </p>
          <span className="text-xs sm:text-sm text-gray-500">Rank #2</span>
        </div>

        {/* #1 */}
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 sm:w-30 sm:h-30 mb-2">
            <img
              src={sorted[0]?.logo}
              alt={sorted[0]?.name}
              className="w-full h-full rounded-full object-cover border-4 border-yellow-400 shadow-lg p-1 sm:p-2"
            />
            <Crown className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-yellow-500 w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="font-semibold text-gray-500 text-sm sm:text-lg">
            {sorted[0]?.name}
          </p>
          <span className="text-xs sm:text-sm text-gray-500">Rank #1</span>
        </div>

        {/* #3 */}
        <div className="flex flex-col items-center">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 mb-2">
            <img
              src={sorted[2]?.logo}
              alt={sorted[2]?.name}
              className="w-full h-full rounded-full object-cover border-4 border-orange-500 shadow-md p-1 sm:p-2"
            />
            <Crown className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 text-orange-400 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="font-medium text-gray-700 text-sm sm:text-lg">
            {sorted[2]?.name}
          </p>
          <span className="text-xs sm:text-sm text-gray-500">Rank #3</span>
        </div>
      </div>
    </div>
  );
};

export default TopThreeRank;
