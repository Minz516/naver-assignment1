import React from "react";

function Square({ handleClick, value }) {
  return (
    <button className="square" onClick={handleClick}>
      {value}
    </button>
  );
}

export default Square;
