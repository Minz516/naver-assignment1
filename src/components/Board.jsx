import React from "react";
import Square from "./Square.jsx";

export default function Board({ squares, handleClick }) {
  const squareComponents = squares.map((square, index) => (
    <Square key={index} handleClick={() => handleClick(index)} value={square} />
  ));
  return (
    <div className="board">
      <div>
        <div className="board-row">{squareComponents.slice(0, 3)}</div>
        <div className="board-row">{squareComponents.slice(3, 6)}</div>
        <div className="board-row">{squareComponents.slice(6)}</div>
      </div>
    </div>
  );
}
