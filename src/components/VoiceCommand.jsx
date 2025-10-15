import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

const VoiceCommand = ({ zegoSuperBoard, setSelectedTool }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef(null);
  const drawingIntervalRef = useRef(null);
  const currentPositionRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    // Check if browser supports speech recognition
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setFeedback("Speech recognition not supported in this browser");
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        processVoiceCommand(finalTranscript.toLowerCase().trim());
      }
    };

    recognitionRef.current.onerror = (event) => {
      setFeedback(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (drawingIntervalRef.current) {
        clearInterval(drawingIntervalRef.current);
      }
    };
  }, []);

  const processVoiceCommand = (command) => {
    setFeedback(`Processing: "${command}"`);

    // Tool selection commands
    if (
      command.includes("pen") ||
      command.includes("draw") ||
      command.includes("brush")
    ) {
      zegoSuperBoard.setToolType(1); // Pen tool
      setSelectedTool(1);
      setFeedback("Pen tool selected");
    } else if (command.includes("eraser") || command.includes("erase")) {
      zegoSuperBoard.setToolType(64); // Eraser tool
      setSelectedTool(64);
      setFeedback("Eraser tool selected");
    } else if (command.includes("text") || command.includes("type")) {
      zegoSuperBoard.setToolType(2); // Text tool
      setSelectedTool(2);
      setFeedback("Text tool selected");
    } else if (command.includes("line")) {
      zegoSuperBoard.setToolType(4); // Line tool
      setSelectedTool(4);
      setFeedback("Line tool selected");
    } else if (
      command.includes("rectangle") ||
      command.includes("rect") ||
      command.includes("square")
    ) {
      zegoSuperBoard.setToolType(8); // Rectangle tool
      setSelectedTool(8);
      setFeedback("Rectangle tool selected");
    } else if (
      command.includes("circle") ||
      command.includes("ellipse") ||
      command.includes("oval")
    ) {
      zegoSuperBoard.setToolType(16); // Ellipse tool
      setSelectedTool(16);
      setFeedback("Circle tool selected");
    }

    // Color commands
    else if (command.includes("red color") || command.includes("make it red")) {
      zegoSuperBoard.setBrushColor("#ff0000");
      setFeedback("Color changed to red");
    } else if (
      command.includes("blue color") ||
      command.includes("make it blue")
    ) {
      zegoSuperBoard.setBrushColor("#0000ff");
      setFeedback("Color changed to blue");
    } else if (
      command.includes("green color") ||
      command.includes("make it green")
    ) {
      zegoSuperBoard.setBrushColor("#00ff00");
      setFeedback("Color changed to green");
    } else if (
      command.includes("yellow color") ||
      command.includes("make it yellow")
    ) {
      zegoSuperBoard.setBrushColor("#ffff00");
      setFeedback("Color changed to yellow");
    } else if (
      command.includes("black color") ||
      command.includes("make it black")
    ) {
      zegoSuperBoard.setBrushColor("#000000");
      setFeedback("Color changed to black");
    } else if (
      command.includes("white color") ||
      command.includes("make it white")
    ) {
      zegoSuperBoard.setBrushColor("#ffffff");
      setFeedback("Color changed to white");
    }

    // Size commands
    else if (command.includes("small size") || command.includes("thin")) {
      zegoSuperBoard.setBrushSize(5);
      setFeedback("Brush size set to small");
    } else if (command.includes("medium size")) {
      zegoSuperBoard.setBrushSize(10);
      setFeedback("Brush size set to medium");
    } else if (command.includes("large size") || command.includes("thick")) {
      zegoSuperBoard.setBrushSize(15);
      setFeedback("Brush size set to large");
    } else if (
      command.includes("extra large") ||
      command.includes("very thick")
    ) {
      zegoSuperBoard.setBrushSize(20);
      setFeedback("Brush size set to extra large");
    }

    // Background commands
    else if (
      command.includes("white background") ||
      command.includes("clear background")
    ) {
      zegoSuperBoard.setWhiteboardBackgroundColor("#ffffff");
      setFeedback("Background set to white");
    } else if (command.includes("black background")) {
      zegoSuperBoard.setWhiteboardBackgroundColor("#000000");
      setFeedback("Background set to black");
    }

    // Drawing actions
    else if (
      command.includes("start drawing") ||
      command.includes("begin drawing")
    ) {
      startContinuousDrawing();
    } else if (
      command.includes("stop drawing") ||
      command.includes("end drawing")
    ) {
      stopContinuousDrawing();
    } else if (command.includes("draw circle")) {
      drawShape("circle");
    } else if (
      command.includes("draw rectangle") ||
      command.includes("draw square")
    ) {
      drawShape("rectangle");
    } else if (command.includes("draw line")) {
      drawShape("line");
    } else if (
      command.includes("clear all") ||
      command.includes("clear canvas")
    ) {
      clearCanvas();
    } else {
      setFeedback(
        "Command not recognized. Try: 'pen', 'red color', 'large size', 'draw circle', etc."
      );
    }
  };

  const startContinuousDrawing = () => {
    if (!isDrawing) {
      setIsDrawing(true);
      zegoSuperBoard.setToolType(1); // Set to pen
      setSelectedTool(1);
      setFeedback("Started continuous drawing mode");

      // Simulate drawing by moving in a pattern
      drawingIntervalRef.current = setInterval(() => {
        const canvas = document.getElementById("whiteboard");
        if (canvas) {
          // Create a simple pattern or respond to voice intensity
          simulateDrawingMovement();
        }
      }, 100);
    }
  };

  const stopContinuousDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (drawingIntervalRef.current) {
        clearInterval(drawingIntervalRef.current);
        drawingIntervalRef.current = null;
      }
      setFeedback("Stopped continuous drawing mode");
    }
  };

  const simulateDrawingMovement = () => {
    // This is a simplified version - you might want to integrate with
    // actual audio levels or more sophisticated drawing patterns
    const canvas = document.getElementById("whiteboard");
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = currentPositionRef.current.x + (Math.random() - 0.5) * 50;
      const y = currentPositionRef.current.y + (Math.random() - 0.5) * 50;

      // Keep within bounds
      currentPositionRef.current.x = Math.max(50, Math.min(rect.width - 50, x));
      currentPositionRef.current.y = Math.max(
        50,
        Math.min(rect.height - 50, y)
      );

      // You would implement actual drawing logic here using ZegoSuperBoard API
      // This is a placeholder for the drawing action
    }
  };

  const drawShape = (shape) => {
    // const centerX = window.innerWidth / 2;
    // const centerY = window.innerHeight / 2;

    switch (shape) {
      case "circle":
        zegoSuperBoard.setToolType(16); // Ellipse tool
        setSelectedTool(16);
        setFeedback("Drawing a circle");
        break;
      case "rectangle":
        zegoSuperBoard.setToolType(8); // Rectangle tool
        setSelectedTool(8);
        setFeedback("Drawing a rectangle");
        break;
      case "line":
        zegoSuperBoard.setToolType(4); // Line tool
        setSelectedTool(4);
        setFeedback("Drawing a line");
        break;
    }
  };

  const clearCanvas = () => {
    // Clear the canvas - you'll need to implement this with ZegoSuperBoard API
    zegoSuperBoard.clearWhiteboardView();
    setFeedback("Canvas cleared");
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      stopContinuousDrawing();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setFeedback("Listening for voice commands...");
    }
  };

  return (
    <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700">Voice Commands</h3>
        <button
          onClick={toggleListening}
          className={`p-2 rounded-full ${
            isListening
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-green-100 text-green-600 hover:bg-green-200"
          } transition-colors`}
          title={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {isDrawing && (
        <div className="flex items-center gap-2 mb-2 text-sm text-orange-600">
          <Volume2 size={16} />
          <span>Drawing Mode Active</span>
        </div>
      )}

      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Status:</div>
        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded min-h-[20px]">
          {feedback || "Ready for voice commands"}
        </div>
      </div>

      {transcript && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Last command:</div>
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            "{transcript}"
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <div className="mb-1">Try saying:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>"pen" or "eraser"</li>
          <li>"red color" or "blue color"</li>
          <li>"large size" or "small size"</li>
          <li>"draw circle" or "draw rectangle"</li>
          <li>"start drawing" or "stop drawing"</li>
          <li>"clear all"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceCommand;
