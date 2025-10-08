import { calculateWinner } from "./gameLogic.js";

// Minimax algorithm with alpha-beta pruning
export const minimax = (
  board,
  depth,
  isMaximizing,
  alpha = -Infinity,
  beta = Infinity,
  positionCount = { count: 0 }
) => {
  positionCount.count++; // Count each position evaluated

  const winner = calculateWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return -10 + depth;
  if (winner === "Draw") return 0;

  if (isMaximizing) {
    // AI turn
    let maxEval = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = "O";
        const evalScore = minimax(
          newBoard,
          depth + 1,
          false,
          alpha,
          beta,
          positionCount
        );
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return maxEval;
  } else {
    // Player turn
    let minEval = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        const newBoard = [...board];
        newBoard[i] = "X";
        const evalScore = minimax(
          newBoard,
          depth + 1,
          true,
          alpha,
          beta,
          positionCount
        );
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return minEval;
  }
};

// Get best move for AI
export const getBestMove = (
  board,
  difficulty = "hard",
  positionCount = { count: 0 }
) => {
  if (difficulty === "easy") {
    return getEasyMove(board);
  }

  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      // only consider empty cells
      const newBoard = [...board];
      newBoard[i] = "O"; // simulate AI move
      const score = minimax(
        newBoard,
        0,
        false,
        -Infinity,
        Infinity,
        positionCount
      ); // next turn is player
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }

  return move; // return the best index for AI to play
};

// Easy mode: AI tries to lose by helping player win
export const getEasyMove = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // First, try to help player win by not blocking their winning moves
  for (const [a, b, c] of lines) {
    if (board[a] === "X" && board[b] === "X" && !board[c]) {
      return c; // Let player win
    }
    if (board[a] === "X" && !board[b] && board[c] === "X") {
      return b; // Let player win
    }
    if (!board[a] && board[b] === "X" && board[c] === "X") {
      return a; // Let player win
    }
  }

  // Avoid blocking player's potential wins - check for 2 in a row for player
  for (const [a, b, c] of lines) {
    // Check if player has 2 in a row and AI should NOT block it
    if (
      (board[a] === "X" && board[b] === "X" && !board[c]) ||
      (board[a] === "X" && !board[b] && board[c] === "X") ||
      (!board[a] && board[b] === "X" && board[c] === "X")
    ) {
      // Don't block, let player win
      continue;
    }

    // Check if AI has 2 in a row and should NOT win
    if (
      (board[a] === "O" && board[b] === "O" && !board[c]) ||
      (board[a] === "O" && !board[b] && board[c] === "O") ||
      (!board[a] && board[b] === "O" && board[c] === "O")
    ) {
      // Don't win, make a different move
      continue;
    }
  }

  // Make a random move that doesn't help AI win
  const emptyCells = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      emptyCells.push(i);
    }
  }

  if (emptyCells.length > 0) {
    // Prefer corners and edges over center for easier gameplay
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];

    const availableCorners = corners.filter((i) => !board[i]);
    const availableEdges = edges.filter((i) => !board[i]);

    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    } else if (availableEdges.length > 0) {
      return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    } else {
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  }

  return null;
};
