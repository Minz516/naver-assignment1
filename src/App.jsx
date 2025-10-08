import React, { useState, useEffect } from "react";
import Board from "./components/Board.jsx";
import { calculateWinner } from "./utils/gameLogic.js";
import { getBestMove } from "./utils/ai.js";

function App() {
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState(null); // null, "friend", "ai"
  const [aiDifficulty, setAiDifficulty] = useState("hard"); // "easy", "hard"
  const [showModeSelection, setShowModeSelection] = useState(true);

  // Performance metrics
  const [aiThinkingTime, setAiThinkingTime] = useState(0);
  const [positionsEvaluated, setPositionsEvaluated] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  // Score tracking
  const [gameHistory, setGameHistory] = useState([]);
  const [scores, setScores] = useState({
    xWins: 0,
    oWins: 0,
    draws: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastWinner: null,
  });

  // Load scores from localStorage on component mount
  useEffect(() => {
    const savedScores = localStorage.getItem("ticTacToeScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
    const savedHistory = localStorage.getItem("ticTacToeHistory");
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Auto-hide winner popup after 3 seconds
  useEffect(() => {
    if (winner) {
      const timer = setTimeout(() => {
        setWinner(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  // AI move logic
  useEffect(() => {
    if (!xIsNext && gameMode === "ai") {
      // Add delay to make AI seem like it's thinking
      const aiDelay = Math.random() * 1000 + 500; // Random delay between 500ms to 1500ms

      const timer = setTimeout(() => {
        const startTime = performance.now();
        const positionCount = { count: 0 };
        const bestMove = getBestMove(squares, aiDifficulty, positionCount);
        const endTime = performance.now();
        const thinkingTime = endTime - startTime;

        // Update performance metrics
        setAiThinkingTime(Math.round(thinkingTime));
        setPositionsEvaluated(positionCount.count);

        if (bestMove !== null) {
          const newBoard = [...squares];
          newBoard[bestMove] = "O";
          setSquares(newBoard);
          setXIsNext(true); // Switch back to player (X)
        }
      }, aiDelay);

      return () => clearTimeout(timer);
    }
  }, [xIsNext, gameMode, aiDifficulty, squares]);

  // Winner detection and score updating
  useEffect(() => {
    const currentWinner = calculateWinner(squares);
    setWinner(currentWinner);

    // Only update scores when game ends (not during gameplay)
    const isGameOver = currentWinner !== null || !squares.includes(null);
    if (isGameOver && currentWinner !== null && !gameEnded) {
      setGameEnded(true);
      updateScores(currentWinner);
    }
  }, [squares, gameEnded]);

  const updateScores = (winner) => {
    const gameNumber = gameHistory.length + 1;
    const timestamp = new Date().toLocaleString();

    let newScores = { ...scores };
    let newHistory = [...gameHistory];

    if (winner === "X") {
      newScores.xWins++;
      newScores.currentStreak =
        newScores.lastWinner === "X" ? newScores.currentStreak + 1 : 1;
      newHistory.push({
        gameNumber,
        result: "X win",
        opponent: gameMode === "friend" ? "O lose" : "AI lose",
        timestamp,
        mode: gameMode,
        difficulty: gameMode === "ai" ? aiDifficulty : null,
      });
    } else if (winner === "O") {
      newScores.oWins++;
      newScores.currentStreak =
        newScores.lastWinner === "O" ? newScores.currentStreak + 1 : 1;
      newHistory.push({
        gameNumber,
        result: "O win",
        opponent: gameMode === "friend" ? "X lose" : "Player lose",
        timestamp,
        mode: gameMode,
        difficulty: gameMode === "ai" ? aiDifficulty : null,
      });
    } else if (winner === "Draw") {
      newScores.draws++;
      newScores.currentStreak = 0;
      newHistory.push({
        gameNumber,
        result: "Draw",
        opponent: "Tie",
        timestamp,
        mode: gameMode,
        difficulty: gameMode === "ai" ? aiDifficulty : null,
      });
    }

    newScores.maxStreak = Math.max(
      newScores.maxStreak,
      newScores.currentStreak
    );
    newScores.lastWinner = winner === "Draw" ? null : winner;

    setScores(newScores);
    setGameHistory(newHistory);

    // Save to localStorage
    localStorage.setItem("ticTacToeScores", JSON.stringify(newScores));
    localStorage.setItem("ticTacToeHistory", JSON.stringify(newHistory));
  };

  // Handle player move
  const handleClick = (i) => {
    if (winner || squares[i]) {
      return;
    }

    // In friend mode, both X and O are human players
    // In AI mode, only X is human player
    const currentPlayer = xIsNext ? "X" : "O";
    squares[i] = currentPlayer;
    setXIsNext(!xIsNext);
    setSquares([...squares]);
  };

  // Restart game
  const handlRestart = () => {
    setWinner(null);
    setXIsNext(true);
    setSquares(Array(9).fill(null));
    setGameEnded(false);
    setAiThinkingTime(0);
    setPositionsEvaluated(0);
  };

  // Select game mode
  const selectGameMode = (mode) => {
    setGameMode(mode);
    if (mode === "friend") {
      setShowModeSelection(false);
    }
  };

  // Select AI difficulty
  const selectAiDifficulty = (difficulty) => {
    setAiDifficulty(difficulty);
    setShowModeSelection(false);
  };

  // Back to mode selection
  const backToModeSelection = () => {
    setGameMode(null);
    setShowModeSelection(true);
    handlRestart();
  };

  // Reset scores and history
  const resetScores = () => {
    const defaultScores = {
      xWins: 0,
      oWins: 0,
      draws: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastWinner: null,
    };
    setScores(defaultScores);
    setGameHistory([]);
    localStorage.setItem("ticTacToeScores", JSON.stringify(defaultScores));
    localStorage.setItem("ticTacToeHistory", JSON.stringify([]));
  };

  // Mode selection screens
  if (showModeSelection) {
    if (gameMode === null) {
      return (
        <div className="main">
          <h2 className="mode-title">Choose Game Mode</h2>
          <div className="mode-selection">
            <button
              onClick={() => selectGameMode("friend")}
              className="mode-btn friend-btn"
            >
              Play vs Friend
            </button>
            <button
              onClick={() => selectGameMode("ai")}
              className="mode-btn ai-btn"
            >
              Play with AI
            </button>
          </div>
        </div>
      );
    } else if (gameMode === "ai") {
      return (
        <div className="main">
          <h2 className="mode-title">Choose AI Difficulty</h2>
          <div className="mode-selection">
            <button
              onClick={() => selectAiDifficulty("easy")}
              className="mode-btn easy-btn"
            >
              Easy Mode
            </button>
            <button
              onClick={() => selectAiDifficulty("hard")}
              className="mode-btn hard-btn"
            >
              Hard Mode
            </button>
          </div>
          <button onClick={() => setGameMode(null)} className="back-btn">
            Back
          </button>
        </div>
      );
    }
  }

  // Main game screen
  return (
    <div className="game-layout">
      {/* Winner Popup */}
      {winner && (
        <div className="winner-popup">
          <div className="winner-content">
            <h2 className="winner-text">🎉 {winner} Wins! 🎉</h2>
            <div className="confetti"></div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="game-header">
        <div className="game-info">
          <span className="game-mode">
            Mode:{" "}
            {gameMode === "friend" ? "vs Friend" : `vs AI (${aiDifficulty})`}
          </span>
          <span className="player">Next player is: {xIsNext ? "X" : "O"}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      {gameMode === "ai" && (
        <div className="performance-metrics">
          <div className="metric-item">
            <span className="metric-label">AI Thinking Time:</span>
            <span className="metric-value">{aiThinkingTime}ms</span>
          </div>
          {aiDifficulty === "hard" && (
            <div className="metric-item">
              <span className="metric-label">Positions Evaluated:</span>
              <span className="metric-value">
                {positionsEvaluated.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="game-content">
        <div className="game-main">
          <div className="game">
            <Board squares={squares} handleClick={handleClick} />
          </div>

          {/* Score Tracking */}
          <div className="score-tracking">
            <h3>Score Tracking</h3>
            <div className="scores-grid-horizontal">
              <div className="score-item">
                <span className="score-label">X Wins:</span>
                <span className="score-value x-wins">{scores.xWins}</span>
              </div>
              <div className="score-item">
                <span className="score-label">O Wins:</span>
                <span className="score-value o-wins">{scores.oWins}</span>
              </div>
              <div className="score-item">
                <span className="score-label">Draws:</span>
                <span className="score-value draws">{scores.draws}</span>
              </div>
              {/* Only show streak tracking in AI mode */}
              {gameMode === "ai" && (
                <>
                  <div className="score-item">
                    <span className="score-label">Current Streak:</span>
                    <span className="score-value streak">
                      {scores.currentStreak}
                    </span>
                  </div>
                  <div className="score-item">
                    <span className="score-label">Max Streak:</span>
                    <span className="score-value max-streak">
                      {scores.maxStreak}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game History - Separate panel outside white background */}
      {gameHistory.length > 0 && (
        <div className="game-history-panel">
          <div className="game-history">
            <h3>Game History</h3>
            <div className="history-list">
              {gameHistory
                .slice(-5)
                .reverse()
                .map((game, index) => (
                  <div key={game.gameNumber} className="history-item">
                    <span className="game-number">Game {game.gameNumber}:</span>
                    <span
                      className={`result ${
                        game.result.includes("X")
                          ? "x-win"
                          : game.result.includes("O")
                          ? "o-win"
                          : "draw"
                      }`}
                    >
                      {game.result}
                    </span>
                    <span
                      className={`opponent ${
                        game.opponent.includes("lose") ? "lose" : "tie"
                      }`}
                    >
                      {game.opponent}
                    </span>
                    <span className="game-mode-info">
                      {game.mode === "friend"
                        ? "vs Friend"
                        : `vs AI (${game.difficulty})`}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Reset Scores Button */}
          <button onClick={resetScores} className="reset-scores-btn">
            Reset Scores
          </button>
        </div>
      )}

      {/* Game Controls */}
      <div className="game-controls">
        <button onClick={handlRestart} className="restart-btn">
          Restart Game
        </button>
        <button onClick={backToModeSelection} className="mode-btn">
          Change Mode
        </button>
      </div>
    </div>
  );
}

export default App;
