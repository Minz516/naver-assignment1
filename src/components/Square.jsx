import React from "react";

function Square({ handleClick, value, disabled = false }) {
  return (
    <button
      className="square"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={disabled ? { cursor: "not-allowed", opacity: 0.6 } : {}}
    >
      {value}
    </button>
  );
}

export default Square;
