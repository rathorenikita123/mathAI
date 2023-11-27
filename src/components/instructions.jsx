const Instructions = () => {
  return (
    <div className="flex flex-col justify-center px-4">
      <p className="font-medium text-2xl text-start pb-6">
        How to draw a<span className="text-red-600"> Triangle:</span>
      </p>
      <ul className="flex flex-col items-start text-start">
        <li>
          <strong>Click on Canvas to Create Point A:</strong>
          <ul>
            <li>
              Click anywhere on the canvas to create the first point, labeled as
              "A."
            </li>
          </ul>
        </li>
        <li>
          <strong>Click Again to Draw Line Segment AB:</strong>
          <ul>
            <li>
              After creating point A, click again on the canvas to draw a line
              segment AB. Adjust the size of the line segment by dragging the
              mouse.
            </li>
          </ul>
        </li>
        <li>
          <strong>Create Point C from Point B:</strong>
          <ul>
            <li>
              Click on the canvas near point B to create a new point, labeled as
              "C." Adjust the position of point C to achieve the desired angle.
            </li>
          </ul>
        </li>
        <li>
          <strong>Create Point D Overlapping Point A:</strong>
          <ul>
            <li>
              Finally, create a new point, labeled as "D," and overlap it with
              point A. This will complete the triangle ABC.
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Instructions;
