import React, { useRef, useEffect, useState } from "react";
import Instructions from "./instructions";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState({});
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [drawMode, setDrawMode] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleStart = (x, y) => {
      if (!drawMode) {
        return; // If drawMode is disabled, do not add new points
      }
      const newPoints = { ...points };

      // Check proximity to existing points
      for (const point in points) {
        const { x: px, y: py } = points[point];
        const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);

        // If within proximity, select the point for movement
        if (distance < 20) {
          setSelectedPoint(point);
          return;
        }
      }

      // If not near any existing point, create a new one
      const pointName = String.fromCharCode(65 + Object.keys(newPoints).length);
      newPoints[pointName] = { x, y };
      setPoints(newPoints);
    };

    const handleMove = (x, y) => {
      if (!drawMode || !selectedPoint) {
        return; // If drawMode is disabled or no point is selected, do not proceed with movement
      }
      const newPoints = { ...points };
      newPoints[selectedPoint] = { x, y };
      setPoints(newPoints);
    };

    const handleEnd = () => {
      setSelectedPoint(null);
    };

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      handleStart(x, y);
    };

    const handleCanvasMove = (e) => {
      if (selectedPoint) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        handleMove(x, y);
      }
    };

    const handleCanvasEnd = () => {
      handleEnd();
    };

    canvas.addEventListener("mousedown", handleCanvasClick);
    canvas.addEventListener("mousemove", handleCanvasMove);
    canvas.addEventListener("mouseup", handleCanvasEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleCanvasClick);
      canvas.removeEventListener("mousemove", handleCanvasMove);
      canvas.removeEventListener("mouseup", handleCanvasEnd);
    };
  }, [points, selectedPoint, drawMode]);

  const handleClearLines = () => {
    setPoints({});
  };

  const handleToggleDrawMode = () => {
    setDrawMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the grid
    const gridSize = 15;
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        context.strokeStyle = "#ddd";
        context.strokeRect(x, y, gridSize, gridSize);
      }
    }

    // Draw points on the canvas
    for (const point in points) {
      const { x, y } = points[point];
      context.beginPath();
      context.arc(x, y, 5, 0, 2 * Math.PI);
      context.fillStyle = "black";
      context.fill();
      context.stroke();

      // Label the points
      context.fillStyle = "black";
      context.fillText(point, x + 10, y - 10);
    }

    // Draw line segments based on the points and calculate length
    const pointKeys = Object.keys(points);
    for (let i = 0; i < pointKeys.length - 1; i++) {
      const startPoint = points[pointKeys[i]];
      const endPoint = points[pointKeys[i + 1]];

      if (drawMode) {
        // Draw only if drawMode is true
        context.beginPath();
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(endPoint.x, endPoint.y);
        context.strokeStyle = "black";
        context.stroke();
      }

      // Calculate and display length in cm
      const segmentLength =
        Math.sqrt(
          (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2
        ) / 20;
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;
      context.fillStyle = "black";
      context.fillText(`${segmentLength.toFixed(2)} cm`, midX, midY - 5);
    }

    const scalingFactor = 20;

    // Calculate angles and display
    if (pointKeys.length === 3) {
      const pointA = points[pointKeys[0]];
      const pointB = points[pointKeys[1]];
      const pointC = points[pointKeys[2]];

      const sideAB = calculateDistance(pointA, pointB) / scalingFactor;
      const sideBC = calculateDistance(pointB, pointC) / scalingFactor;
      const sideCA = calculateDistance(pointC, pointA) / scalingFactor;

      const angleA = calculateAngle(sideBC, sideCA, sideAB);
      const angleB = calculateAngle(sideCA, sideAB, sideBC);
      const angleC = calculateAngle(sideAB, sideBC, sideCA);

      // Display angles
      context.fillStyle = "blue";
      context.fillText(
        `Angle A: ${angleA.toFixed(2)}°`,
        pointA.x,
        pointA.y - 20
      );
      context.fillText(
        `Angle B: ${angleB.toFixed(2)}°`,
        pointB.x,
        pointB.y - 20
      );
      context.fillText(
        `Angle C: ${angleC.toFixed(2)}°`,
        pointC.x,
        pointC.y - 20
      );

      // Display lengths
      const midX_AC = (pointA.x + pointC.x) / 2.5;
      const midY_AC = (pointA.y + pointC.y) / 2;
      context.fillStyle = "black";
      context.fillText(`${sideCA.toFixed(2)} cm`, midX_AC, midY_AC);
    }

    // Draw the triangle by connecting the first and last points
    if (pointKeys.length >= 3 && drawMode) {
      const firstPoint = points[pointKeys[0]];
      const lastPoint = points[pointKeys[pointKeys.length - 1]];

      context.beginPath();
      context.moveTo(firstPoint.x, firstPoint.y);
      context.lineTo(lastPoint.x, lastPoint.y);
      context.strokeStyle = "black";
      context.stroke();
    }
  }, [points, drawMode]);

  const calculateDistance = (point1, point2) => {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
  };

  const calculateAngle = (a, b, c) => {
    const radianAngle = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
    return (radianAngle * 180) / Math.PI;
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold p-4 text-center">
        <span className="text-green-700">Welcome,</span> let's learn to draw
        figures
      </h1>
      <div className="flex justify-center">
        <Instructions />
        <div>
          <canvas
            ref={canvasRef}
            width={1000}
            height={800}
            className="bg-white"
          ></canvas>
          <div className="flex justify-evenly">
            <button
              onClick={handleToggleDrawMode}
              className={`p-2 ${
                drawMode ? "bg-blue-600" : "bg-gray-400"
              } rounded-md text-white`}
            >
              {drawMode ? (
                <img src="./images/line.png" alt="line" width={100} />
              ) : (
                <img src="./images/line.png" alt="line" width={100} />
              )}
            </button>
            <button
              onClick={handleClearLines}
              className="p-2 bg-red-600 rounded-md text-white"
            >
              Clear Lines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
