import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import { createInitialState } from "./game/gameState";
import "./App.css";

export default function App() {
  const [state] = useState(createInitialState());

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      <div className="game-layout">
        <Board boardTokens={state.boardTokens} />
        <Pyramid pyramid={state.pyramid} />
      </div>
    </div>
  );
}