import React, { useRef, useEffect, useState } from "react";
import Instructions from "./instructions";

const Canvas = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState({});
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleStart = (x, y) => {
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
      if (selectedPoint) {
        const newPoints = { ...points };
        newPoints[selectedPoint] = { x, y };
        setPoints(newPoints);
      }
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
  }, [points, selectedPoint]);

  const handleClearLines = () => {
    setPoints({});
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
    let totalLength = 0;
    for (let i = 0; i < pointKeys.length - 1; i++) {
      const startPoint = points[pointKeys[i]];
      const endPoint = points[pointKeys[i + 1]];

      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      context.lineTo(endPoint.x, endPoint.y);
      context.strokeStyle = "black";
      context.stroke();

      // Calculate and displaylength in cm
      const segmentLength =
        Math.sqrt(
          (endPoint.x - startPoint.x) ** 2 + (endPoint.y - startPoint.y) ** 2
        ) / 20;
      totalLength += segmentLength;
      const midX = (startPoint.x + endPoint.x) / 2;
      const midY = (startPoint.y + endPoint.y) / 2;
      context.fillStyle = "black";
      context.fillText(`${segmentLength.toFixed(2)} cm`, midX, midY - 5);
    }

    // Display total length in cm
    context.fillStyle = "black";
    context.fillText(
      `Total Length: ${totalLength.toFixed(2)} cm`,
      canvas.width - 120,
      20
    );

    // Calculate and display angles in degrees with arcs between line segments
    for (let i = 1; i < pointKeys.length - 1; i++) {
      const pointA = points[pointKeys[i - 1]];
      const pointB = points[pointKeys[i]];
      const pointC = points[pointKeys[i + 1]];

      const angle = calculateAngle(pointA, pointB, pointC);

      // Draw an arc between the line segments for the angle
      context.beginPath();
      context.arc(
        pointB.x,
        pointB.y,
        30,
        Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x),
        Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x)
      );
      context.strokeStyle = "blue";
      context.stroke();

      // Label the angle near the arc
      context.fillStyle = "blue";
      context.fillText(`${angle.toFixed(2)}°`, pointB.x, pointB.y);
    }
  }, [points]);

  const calculateAngle = (pointA, pointB, pointC) => {
    const vector1 = { x: pointA.x - pointB.x, y: pointA.y - pointB.y };
    const vector2 = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

    const cosTheta = dotProduct / (magnitude1 * magnitude2);
    const angleRad = Math.acos(cosTheta);

    return angleRad * (180 / Math.PI);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold p-4 text-center">
        <span className="text-green-700">Welcome,</span> lets learn to draw
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
          <button
            onClick={handleClearLines}
            className="p-2 bg-red-600 rounded-md text-white"
          >
            Clear Lines
          </button>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
