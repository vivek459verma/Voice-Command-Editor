import React, { useState } from "react";
import { colors } from "../utils/ColorsArray.js";
import StrokeBox from "./StrokeBox.jsx";

const ColorPalette = ({
  setBrushColor,
  setBackgroundColor,
  setBrushSize,
  setFontSize,
}) => {
  const [isBrushPaletteExpanded, setIsBrushPaletteExpanded] = useState(false);
  const [isBackgroundPaletteExpanded, setIsBackgroundPaletteExpanded] =
    useState(false);

  const brushDisplayedColors = isBrushPaletteExpanded
    ? colors
    : colors.slice(0, 6);
  const backgroundDisplayedColors = isBackgroundPaletteExpanded
    ? colors
    : colors.slice(0, 6);

  return (
    <div className="absolute top-1/3 left-6 p-4 bg-white w-fit rounded-lg shadow-lg">
      {/* Brush Color Palette */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-sm font-bold text-gray-700">Brush Color</h1>
        <button
          onClick={() => setIsBrushPaletteExpanded(!isBrushPaletteExpanded)}
          className="focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 text-gray-500 transform transition-transform ${
              isBrushPaletteExpanded ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className=" grid grid-cols-6 gap-2 ">
        {brushDisplayedColors.map((color, colorIndex) => (
          <button
            key={colorIndex}
            className="w-6 h-6 rounded-md border border-gray-300 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 cursor-pointer"
            title={color}
            style={{ backgroundColor: color }}
            onClick={() => setBrushColor(color)}
          />
        ))}
      </div>

      <hr className="my-3 border-gray-200" />

      {/* Background Color Palette */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-sm font-bold text-gray-700">Background Color</h1>
        <button
          onClick={() =>
            setIsBackgroundPaletteExpanded(!isBackgroundPaletteExpanded)
          }
          className="focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 text-gray-500 transform transition-transform ${
              isBackgroundPaletteExpanded ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-6 gap-2 ">
        {backgroundDisplayedColors.map((color, colorIndex) => (
          <button
            key={colorIndex}
            className="w-6 h-6 rounded-md border border-gray-300 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 cursor-pointer"
            title={color}
            style={{ backgroundColor: color }}
            onClick={() => setBackgroundColor(color)}
          />
        ))}
      </div>

      <hr className="my-3 border-gray-200" />

      <StrokeBox setBrushSize={setBrushSize} setFontSize={setFontSize} />
    </div>
  );
};

export default ColorPalette;
