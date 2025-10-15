import React from "react";
import { ToolArray } from "../utils/ToolArray.js";

const ToolBox = ({ currentTool, setTool }) => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2">
      <div className="flex gap-4 p-1 bg-white w-fit rounded-lg shadow-lg  ">
        {ToolArray.map((tool) => (
          <button
            key={tool.type}
            title={tool.name}
            className={`p-3 rounded-lg  cursor-pointer ${
              currentTool === tool.type ? "bg-purple-300" : "hover:bg-gray-100"
            } `}
            onClick={() => setTool(tool)}
          >
            <tool.icon width={16} height={16} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolBox;
