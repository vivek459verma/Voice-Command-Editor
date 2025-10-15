import React, { useEffect, useState } from "react";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import ToolBox from "./components/ToolBox.jsx";
import ColorPalette from "./components/ColorPalette.jsx";
import VoiceCommand from "./components/VoiceCommand.jsx";
import AudioVisualizerDrawing from "./components/AudioVisualizerDrawing.jsx";

function App() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [voiceMode, setVoiceMode] = useState("commands"); // 'commands' or 'visualizer'

  const appID = Number(import.meta.env.VITE_APP_ID);
  const server = import.meta.env.VITE_APP_SERVER;
  const userID = import.meta.env.VITE_APP_USER_ID;
  const token = import.meta.env.VITE_APP_TOKEN;
  const roomID = import.meta.env.VITE_APP_ROOM_ID;

  const zg = new ZegoExpressEngine(appID, server);
  const zegoSuperBoard = ZegoSuperBoardManager.getInstance();

  const iniializeBoard = async () => {
    await zegoSuperBoard.init(zg, {
      parentDomID: "whiteboard",
      appID: appID,
      userID: userID,
      token: token,
    });

    // Listen for the tool change event from the SDK
    zegoSuperBoard.onToolChange = (tool) => {
      setSelectedTool(tool);
    };

    // Set the initial tool
    setSelectedTool(zegoSuperBoard.getToolType());

    await zg.loginRoom(
      roomID,
      token,
      {
        userID: userID,
        userName: "User " + userID,
      },
      {
        userUpdate: true,
      }
    );

    await zegoSuperBoard.createWhiteboardView({
      name: "MyEditor",
      perPageWidth: window.innerWidth,
      perPageHeight: window.innerHeight,
      pageCount: 1,
    });
  };

  useEffect(() => {
    if (zegoSuperBoard) {
      iniializeBoard();
    }
    () => {
      zegoSuperBoard.destroySuperBoardSubView(roomID);
      zg.logoutRoom(roomID);
      zegoSuperBoard.unInit();
      zg.destroyEngine();
    };
  }, []);

  // const backgroundColorr =
  // ZegoSuperBoardManager.getInstance().setWhiteboardBackgroundColor("white");

  return (
    <div className="relative h-screen">
      <div id="whiteboard" className="absolute w-screen h-screen"></div>
      <ToolBox
        currentTool={selectedTool}
        setTool={(tool) => {
          // This will trigger the onToolChange event
          zegoSuperBoard.setToolType(tool.type);
          setSelectedTool(tool.type);
        }}
      />
      <ColorPalette
        setBrushColor={(color) => {
          ZegoSuperBoardManager.getInstance().setBrushColor(color);
        }}
        setBackgroundColor={(color) => {
          ZegoSuperBoardManager.getInstance().setWhiteboardBackgroundColor(
            color
          );
        }}
        setBrushSize={(size) => {
          ZegoSuperBoardManager.getInstance().setBrushSize(size);
        }}
        setFontSize={(size) => {
          ZegoSuperBoardManager.getInstance().setFontSize(Number(size));
        }}
      />

      {/* Voice Mode Toggle */}
      <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setVoiceMode("commands")}
            className={`px-3 py-2 text-xs rounded ${
              voiceMode === "commands"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-colors`}
          >
            Voice Commands
          </button>
          <button
            onClick={() => setVoiceMode("visualizer")}
            className={`px-3 py-2 text-xs rounded ${
              voiceMode === "visualizer"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-colors`}
          >
            Voice Visualizer
          </button>
        </div>
      </div>
      {voiceMode === "commands" ? (
        <VoiceCommand
          zegoSuperBoard={zegoSuperBoard}
          setSelectedTool={setSelectedTool}
        />
      ) : (
        <AudioVisualizerDrawing
          zegoSuperBoard={zegoSuperBoard}
          setSelectedTool={setSelectedTool}
        />
      )}
    </div>
  );
}

export default App;
