/**
 * DrawingEngine - Advanced integration with ZegoSuperBoard for voice-controlled drawing
 */

export class DrawingEngine {
  constructor(zegoSuperBoard) {
    this.board = zegoSuperBoard;
    this.isDrawing = false;
    this.currentPath = [];
    this.drawingQueue = [];
    this.lastPosition = { x: 0, y: 0 };
    this.smoothingFactor = 0.3;
  }

  // Initialize drawing with voice commands
  startVoiceDrawing(options = {}) {
    this.isDrawing = true;
    this.currentPath = [];

    // Set initial drawing parameters
    this.board.setToolType(options.toolType || 1); // Default to pen
    this.board.setBrushColor(options.color || "#000000");
    this.board.setBrushSize(options.size || 5);

    console.log("Voice drawing started");
  }

  stopVoiceDrawing() {
    this.isDrawing = false;
    this.currentPath = [];
    this.drawingQueue = [];
    console.log("Voice drawing stopped");
  }

  // Draw based on audio frequency data
  drawFromAudioData(audioData, canvasRect) {
    if (!this.isDrawing || !canvasRect) return;

    const { frequencyData, volume, pitch } = audioData;
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;

    // Calculate drawing parameters from audio
    const intensity = Math.min(volume * 200, 100);
    const brushSize = Math.max(3, Math.min(20, intensity / 5));

    // Update brush size based on volume
    this.board.setBrushSize(brushSize);

    // Generate position based on frequency data
    const position = this.calculateDrawingPosition(
      frequencyData,
      volume,
      pitch,
      centerX,
      centerY
    );

    // Smooth the drawing path
    const smoothedPosition = this.smoothPosition(position);

    // Add to current path
    this.currentPath.push(smoothedPosition);

    // Draw the stroke
    this.drawStroke(smoothedPosition);

    return smoothedPosition;
  }

  // Calculate drawing position from audio analysis
  calculateDrawingPosition(frequencyData, volume, pitch, centerX, centerY) {
    // Analyze frequency bands
    const lowFreq = this.getFrequencyBandAverage(frequencyData, 0, 64);
    const midFreq = this.getFrequencyBandAverage(frequencyData, 64, 192);
    const highFreq = this.getFrequencyBandAverage(frequencyData, 192, 256);

    // Map frequency data to X/Y coordinates
    const x = centerX + (lowFreq - midFreq) * volume * 2;
    const y = centerY + (highFreq - midFreq) * volume * 2;

    // Apply constraints to keep drawing on canvas
    const constrainedX = Math.max(50, Math.min(window.innerWidth - 50, x));
    const constrainedY = Math.max(50, Math.min(window.innerHeight - 50, y));

    return { x: constrainedX, y: constrainedY, intensity: volume };
  }

  // Get average of frequency band
  getFrequencyBandAverage(frequencyData, start, end) {
    const slice = frequencyData.slice(start, end);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    return sum / slice.length / 255; // Normalize to 0-1
  }

  // Smooth drawing positions to reduce jitter
  smoothPosition(newPosition) {
    if (this.currentPath.length === 0) {
      this.lastPosition = newPosition;
      return newPosition;
    }

    const smoothed = {
      x:
        this.lastPosition.x +
        (newPosition.x - this.lastPosition.x) * this.smoothingFactor,
      y:
        this.lastPosition.y +
        (newPosition.y - this.lastPosition.y) * this.smoothingFactor,
      intensity: newPosition.intensity,
    };

    this.lastPosition = smoothed;
    return smoothed;
  }

  // Draw stroke at position (this needs to be adapted to ZegoSuperBoard's actual API)
  drawStroke(position) {
    try {
      // This is a placeholder - you'll need to adapt this to ZegoSuperBoard's actual API
      // The exact method depends on how ZegoSuperBoard handles programmatic drawing

      // Option 1: If ZegoSuperBoard has a direct drawing API
      // this.board.drawPoint(position.x, position.y);

      // Option 2: If you need to simulate mouse events
      this.simulateDrawingEvent(position);
    } catch (error) {
      console.warn("Drawing stroke failed:", error);
    }
  }

  // Simulate mouse/touch events for drawing
  simulateDrawingEvent(position) {
    const canvas = document.getElementById("whiteboard");
    if (!canvas) return;

    // Create synthetic mouse events
    const mouseDownEvent = new MouseEvent("mousedown", {
      clientX: position.x,
      clientY: position.y,
      bubbles: true,
    });

    const mouseMoveEvent = new MouseEvent("mousemove", {
      clientX: position.x,
      clientY: position.y,
      bubbles: true,
    });

    const mouseUpEvent = new MouseEvent("mouseup", {
      clientX: position.x,
      clientY: position.y,
      bubbles: true,
    });

    // Dispatch events to simulate drawing
    canvas.dispatchEvent(mouseDownEvent);
    canvas.dispatchEvent(mouseMoveEvent);

    // Quick mouseup to create dots/short strokes
    setTimeout(() => {
      canvas.dispatchEvent(mouseUpEvent);
    }, 10);
  }

  // Draw predefined shapes based on voice commands
  drawShape(shapeName, position, size = 50) {
    const { x, y } = position;

    switch (shapeName.toLowerCase()) {
      case "circle":
        this.drawCircle(x, y, size);
        break;
      case "square":
      case "rectangle":
        this.drawRectangle(x, y, size, size);
        break;
      case "triangle":
        this.drawTriangle(x, y, size);
        break;
      case "star":
        this.drawStar(x, y, size);
        break;
      case "heart":
        this.drawHeart(x, y, size);
        break;
      default:
        console.warn(`Unknown shape: ${shapeName}`);
    }
  }

  // Draw circle using multiple points
  drawCircle(centerX, centerY, radius) {
    const points = [];
    const numPoints = 60;

    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x, y });
    }

    this.drawPointSequence(points);
  }

  // Draw rectangle
  drawRectangle(x, y, width, height) {
    const points = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
      { x, y }, // Close the shape
    ];

    this.drawPointSequence(points);
  }

  // Draw triangle
  drawTriangle(centerX, centerY, size) {
    const height = (size * Math.sqrt(3)) / 2;
    const points = [
      { x: centerX, y: centerY - height / 2 },
      { x: centerX - size / 2, y: centerY + height / 2 },
      { x: centerX + size / 2, y: centerY + height / 2 },
      { x: centerX, y: centerY - height / 2 }, // Close the shape
    ];

    this.drawPointSequence(points);
  }

  // Draw star shape
  drawStar(centerX, centerY, size) {
    const points = [];
    const numPoints = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;

    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i / (numPoints * 2)) * 2 * Math.PI - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x, y });
    }
    points.push(points[0]); // Close the shape

    this.drawPointSequence(points);
  }

  // Draw heart shape
  drawHeart(centerX, centerY, size) {
    const points = [];
    const numPoints = 100;

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      const x = centerX + size * (16 * Math.pow(Math.sin(t), 3));
      const y =
        centerY -
        (size *
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t))) /
          16;
      points.push({ x, y });
    }

    this.drawPointSequence(points);
  }

  // Draw sequence of points
  drawPointSequence(points) {
    points.forEach((point, index) => {
      setTimeout(() => {
        this.drawStroke(point);
      }, index * 20); // Small delay between points for smoother drawing
    });
  }

  // Change color based on audio characteristics
  updateColorFromAudio(volume, pitch, frequencyData) {
    let color;

    if (volume < 0.2) {
      color = "#3b82f6"; // Blue for quiet
    } else if (volume < 0.4) {
      color = "#10b981"; // Green for medium
    } else if (volume < 0.6) {
      color = "#f59e0b"; // Yellow for loud
    } else if (volume < 0.8) {
      color = "#ef4444"; // Red for very loud
    } else {
      color = "#8b5cf6"; // Purple for extremely loud
    }

    // Add frequency-based color variations
    const highFreq = this.getFrequencyBandAverage(frequencyData, 192, 256);
    if (highFreq > 0.7) {
      color = "#ec4899"; // Pink for high frequencies
    }

    this.board.setBrushColor(color);
    return color;
  }

  // Clear the canvas
  clearCanvas() {
    try {
      // This depends on ZegoSuperBoard's API
      this.board.clearWhiteboardView();
    } catch (error) {
      console.warn("Clear canvas failed:", error);
    }
  }

  // Get current drawing statistics
  getDrawingStats() {
    return {
      isDrawing: this.isDrawing,
      pathLength: this.currentPath.length,
      lastPosition: this.lastPosition,
    };
  }
}

// Audio analysis utilities
export class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
  }

  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);

      this.analyser.fftSize = 512;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.microphone.connect(this.analyser);

      return true;
    } catch (error) {
      console.error("Audio initialization failed:", error);
      return false;
    }
  }

  getAudioData() {
    if (!this.analyser || !this.dataArray) return null;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate volume (average of all frequencies)
    const volume =
      this.dataArray.reduce((sum, value) => sum + value, 0) /
      this.dataArray.length /
      255;

    // Estimate pitch (dominant frequency)
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }
    const pitch =
      (maxIndex / this.dataArray.length) * (this.audioContext.sampleRate / 2);

    return {
      frequencyData: Array.from(this.dataArray),
      volume,
      pitch,
      rawData: this.dataArray,
    };
  }

  cleanup() {
    if (this.microphone) {
      this.microphone.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
