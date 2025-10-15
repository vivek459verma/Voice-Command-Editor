import React, { useState } from "react";
import { StrokesArray } from "../utils/StrokesArray.js";

const StrokeBox = ({ setBrushSize, setFontSize }) => {
  const [currentStrokeSize, setCurrentStrokeSize] = useState(5);
  return (
    <div>
      <h1 className="text-sm font-bold text-gray-700 mb-2">Stroke Size</h1>
      <div className="grid grid-cols-6 gap-2">
        {StrokesArray.map((stroke) => (
          <button
            key={stroke.id}
            className={`flex items-center justify-center  w-8 h-8 rounded-md border border-gray-300 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 cursor-pointer ${
              stroke.stroke === currentStrokeSize && "bg-purple-300"
            }`}
            title={stroke.type}
            onClick={() => {
              setBrushSize(stroke.stroke);
              setCurrentStrokeSize(stroke.stroke);
            }}
          >
            <stroke.icon width={16} height={16} className={stroke.iconColor} />
          </button>
        ))}
      </div>

      <hr className="my-3 border-gray-200" />
      <h1 className="text-sm font-bold text-gray-700 mb-2">Font Size</h1>
      <input
        type="range"
        min="10"
        max="100"
        defaultValue="16"
        step="2"
        onChange={(e) => setFontSize(e.target.value)}
      />
    </div>
  );
};

export default StrokeBox;
