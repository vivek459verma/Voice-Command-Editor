import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Waves, Square } from "lucide-react";

const AudioVisualizerDrawing = ({ zegoSuperBoard, setSelectedTool }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPattern, setDrawingPattern] = useState("wave");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationRef = useRef(null);
  const drawingPathRef = useRef([]);
  const lastDrawTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      stopAudioCapture();
    };
  }, []);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      microphoneRef.current.connect(analyserRef.current);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average volume
          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          const normalizedLevel = average / 255;

          setAudioLevel(normalizedLevel);

          // Draw based on audio if in drawing mode
          if (isDrawingMode && normalizedLevel > 0.1) {
            drawBasedOnAudio(normalizedLevel, dataArray);
          }

          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
      setIsListening(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopAudioCapture = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsListening(false);
    setAudioLevel(0);
  };

  const drawBasedOnAudio = (level, frequencyData) => {
    const now = Date.now();
    if (now - lastDrawTimeRef.current < 50) return; // Throttle drawing

    lastDrawTimeRef.current = now;

    const canvas = document.getElementById("whiteboard");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate drawing parameters based on audio
    const intensity = level * 100;
    const brushSize = Math.max(5, Math.min(25, intensity / 2));

    // Update brush size
    zegoSuperBoard.setBrushSize(brushSize);

    // Generate drawing coordinates based on pattern and audio
    let x, y;
    const time = now / 1000;

    switch (drawingPattern) {
      case "wave":
        x = centerX + Math.sin(time * 2) * intensity * 2;
        y = centerY + Math.cos(time * 3) * intensity * 1.5;
        break;
      case "spiral": {
        const angle = time * 2;
        const radius = intensity;
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
        break;
      }
      case "frequency": {
        // Use frequency data to create patterns
        const freqIndex = Math.floor(
          (frequencyData.length * level) % frequencyData.length
        );
        const freqValue = frequencyData[freqIndex] / 255;
        x = centerX + (Math.random() - 0.5) * intensity * freqValue;
        y = centerY + (Math.random() - 0.5) * intensity * freqValue;
        break;
      }
      case "radial": {
        const radialAngle = (time * intensity) / 10;
        x = centerX + Math.cos(radialAngle) * intensity;
        y = centerY + Math.sin(radialAngle) * intensity;
        break;
      }
      default:
        x = centerX + (Math.random() - 0.5) * intensity;
        y = centerY + (Math.random() - 0.5) * intensity;
    }

    // Add to drawing path
    drawingPathRef.current.push({ x, y, intensity: level });

    // Keep only recent points
    if (drawingPathRef.current.length > 100) {
      drawingPathRef.current.shift();
    }

    // Here you would implement the actual drawing using ZegoSuperBoard API
    // This might involve simulating mouse events or using the board's drawing API
    simulateDrawingAtPosition(x, y);
  };

  const simulateDrawingAtPosition = (x, y) => {
    // This is where you'd integrate with ZegoSuperBoard's drawing API
    // For now, this is a placeholder that shows the concept

    // You might need to trigger drawing events or use the board's API directly
    // Example (pseudo-code):
    // zegoSuperBoard.drawPoint(x, y);
    // or
    // zegoSuperBoard.addStroke([{x, y}]);

    console.log(`Drawing at: ${x}, ${y}`);
  };

  const toggleDrawingMode = () => {
    if (isDrawingMode) {
      setIsDrawingMode(false);
      zegoSuperBoard.setToolType(0); // None tool
      setSelectedTool(0);
    } else {
      setIsDrawingMode(true);
      zegoSuperBoard.setToolType(1); // Pen tool
      setSelectedTool(1);
      drawingPathRef.current = [];
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopAudioCapture();
      setIsDrawingMode(false);
    } else {
      startAudioCapture();
    }
  };

  const getColorFromAudio = (level) => {
    // Map audio level to color
    if (level < 0.2) return "#3b82f6"; // Blue for quiet
    if (level < 0.4) return "#10b981"; // Green for medium
    if (level < 0.6) return "#f59e0b"; // Yellow for loud
    if (level < 0.8) return "#ef4444"; // Red for very loud
    return "#8b5cf6"; // Purple for extremely loud
  };

  useEffect(() => {
    if (isDrawingMode && isListening) {
      const color = getColorFromAudio(audioLevel);
      zegoSuperBoard.setBrushColor(color);
    }
  }, [audioLevel, isDrawingMode, isListening]);

  return (
    <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-700">Voice Drawing</h3>
        <div className="flex gap-2">
          <button
            onClick={toggleDrawingMode}
            className={`p-2 rounded-full ${
              isDrawingMode
                ? "bg-purple-100 text-purple-600"
                : "bg-gray-100 text-gray-600"
            } hover:scale-105 transition-all`}
            title={isDrawingMode ? "Stop drawing mode" : "Start drawing mode"}
          >
            <Waves size={18} />
          </button>
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full ${
              isListening
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            } hover:scale-105 transition-all`}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>

      {/* Audio Level Visualizer */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Audio Level</div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-100 rounded-full"
            style={{
              width: `${audioLevel * 100}%`,
              backgroundColor: getColorFromAudio(audioLevel),
            }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {(audioLevel * 100).toFixed(1)}%
        </div>
      </div>

      {/* Drawing Pattern Selection */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Drawing Pattern</div>
        <div className="grid grid-cols-2 gap-2">
          {["wave", "spiral", "frequency", "radial"].map((pattern) => (
            <button
              key={pattern}
              onClick={() => setDrawingPattern(pattern)}
              className={`text-xs p-2 rounded ${
                drawingPattern === pattern
                  ? "bg-purple-100 text-purple-700 border-purple-300"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              } border transition-colors`}
            >
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              isListening ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-gray-700">
            {isListening ? "Listening" : "Stopped"}
          </span>
          {isDrawingMode && (
            <>
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-purple-700">Drawing</span>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500">
        <div className="mb-2">Instructions:</div>
        <ul className="list-disc list-inside space-y-1">
          <li>Click mic to start listening</li>
          <li>Click wave icon to enable drawing</li>
          <li>Speak or make sounds to draw</li>
          <li>Louder sounds = bigger strokes</li>
          <li>Different patterns create different shapes</li>
        </ul>
      </div>

      {/* Real-time drawing path info */}
      {drawingPathRef.current.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Points drawn: {drawingPathRef.current.length}
        </div>
      )}
    </div>
  );
};

export default AudioVisualizerDrawing;
