import { useState } from "react";
import Stage from "./views/Stage";

type Position = {
  x: number;
  y: number;
};

export default function App() {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  function onStageClick(x: number, y: number) {
    setPosition({ x, y });
  }

  return (
    <div>
      <Stage onStageClick={onStageClick} />
    </div>
  );
}
