import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import PlayerInfo from "./components/PlayerInfo";
import { createInitialState, handleTakeTokens, handleBuyCard, handlePass, handleTakeGold, handleDiscardTokens } from "@splendor/core";
import { validateCellSelection } from "@splendor/core";
import { getPlayerBonuses, getActualCost, canAfford } from "@splendor/core";
import type { TokenType } from "@splendor/core";
import "./App.css";

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

function AuthForm({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    const endpoint = isRegister ? "/api/register" : "/api/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    onLogin(username);
  };

  return (
    <div className="auth-form">
      <h2>{isRegister ? "注册" : "登录"}</h2>
      <input
        placeholder="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>{isRegister ? "注册" : "登录"}</button>
      {error && <div className="auth-error">{error}</div>}
      <button className="btn-link" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
        {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
      </button>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [state, setState] = useState(createInitialState());
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [goldMode, setGoldMode] = useState(false);
  const [discardMode, setDiscardMode] = useState(false);
  const [discardNeeded, setDiscardNeeded] = useState(0);
  const [discardSelection, setDiscardSelection] = useState<Record<string, number>>({});

  if (!username) {
    return <AuthForm onLogin={setUsername} />;
  }

  const handleCellClick = (row: number, col: number) => {
    setError("");

    const index = selectedCells.findIndex(([r, c]) => r === row && c === col);
    if (index !== -1) {
      setSelectedCells(selectedCells.filter(([r, c]) => r !== row || c !== col));
      return;
    }

    const validationError = validateCellSelection(
      state.boardTokens, selectedCells, row, col
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedCells([...selectedCells, [row, col]]);
  };

  const handleTake = () => {
    if (selectedCells.length === 0) return;
    const result = handleTakeTokens(state, selectedCells);
    setState(result.state);
    setSelectedCells([]);
    if (result.needsDiscard > 0) {
      setDiscardMode(true);
      setDiscardNeeded(result.needsDiscard);
      setDiscardSelection({});
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  };

  const handleDiscardSelect = (type: TokenType) => {
    const current = discardSelection[type] || 0;
    const totalSelected = Object.values(discardSelection).reduce((a, b) => a + b, 0);
    const available = player.tokens[type] || 0;

    if (current < available && totalSelected < discardNeeded) {
      setDiscardSelection({ ...discardSelection, [type]: current + 1 });
    } else if (current > 0) {
      const newSelection = { ...discardSelection };
      newSelection[type] = current - 1;
      if (newSelection[type] === 0) delete newSelection[type];
      setDiscardSelection(newSelection);
    }
  };

  const handleDiscardConfirm = () => {
    const totalSelected = Object.values(discardSelection).reduce((a, b) => a + b, 0);
    if (totalSelected !== discardNeeded) return;
    const discards: TokenType[] = [];
    for (const [type, count] of Object.entries(discardSelection)) {
      for (let i = 0; i < count; i++) {
        discards.push(type as TokenType);
      }
    }
    const result = handleDiscardTokens(state, discards);
    setState(result.state);
    setMessage(result.message);
    setDiscardMode(false);
    setDiscardNeeded(0);
    setDiscardSelection({});
  };

  const handleTakeGoldAction = () => {
    if (selectedCells.length !== 1) return;
    const pos = selectedCells[0];
    const token = state.boardTokens[pos[0]][pos[1]];
    if (token !== "gold") return;
    setGoldMode(true);
    setMessage("请选择一张要保留的卡牌");
  };

  const handleBuy = (cardId: number) => {
    if (goldMode) {
      const result = handleTakeGold(state, selectedCells[0], cardId);
      setState(result.state);
      setMessage(result.message);
      setSelectedCells([]);
      setGoldMode(false);
      return;
    }
    const result = handleBuyCard(state, cardId);
    setState(result.state);
    setMessage(result.message);
  };

  const handleBuyReserved = (cardId: number) => {
    const result = handleBuyCard(state, cardId);
    setState(result.state);
    setMessage(result.message);
  };

  const handleSkip = () => {
    const result = handlePass(state);
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  };

  const player = state.players[state.currentPlayerIndex];
  const bonuses = getPlayerBonuses(player);

  const canAffordCard = (cardId: number) => {
    for (const level of state.pyramid) {
      const card = level.find(c => c.id === cardId);
      if (card) {
        const actualCost = getActualCost(card, bonuses);
        return canAfford(player, actualCost);
      }
    }
    return false;
  };

  const isGoldSelected = selectedCells.length === 1 &&
    state.boardTokens[selectedCells[0][0]]?.[selectedCells[0][1]] === "gold";

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      <div className="user-bar">
        <span>{username}</span>
        <button className="btn-link" onClick={() => setUsername(null)}>退出</button>
      </div>
      {message && <div className="message">{message}</div>}
      {goldMode && <div className="message">请点击金字塔中的一张卡牌来保留</div>}
      {discardMode && (
        <div className="discard-panel">
          <div className="message">标记超过上限，请选择 {discardNeeded} 个标记归还（已选 {discardSelection.length} 个）</div>
          <div className="discard-tokens">
            {(["pearl", "red", "blue", "green", "white", "black", "gold"] as const).map((type) => {
              const count = player.tokens[type] || 0;
              if (count === 0) return null;
              const selectedCount = discardSelection[type] || 0;
              return (
                <div
                  key={type}
                  className={`discard-token ${selectedCount > 0 ? "selected" : ""}`}
                  onClick={() => handleDiscardSelect(type)}
                >
                  {TOKEN_LABELS[type]} x{count}
                  {selectedCount > 0 && `（归还 ${selectedCount}）`}
                </div>
              );
            })}
          </div>
          {Object.values(discardSelection).reduce((a, b) => a + b, 0) === discardNeeded && (
            <button className="btn-take" onClick={handleDiscardConfirm}>
              确认归还
            </button>
          )}
        </div>
      )}
      {!discardMode && (
        <>
          <div className="game-layout">
            <div>
              <Board
                boardTokens={state.boardTokens}
                selectedCells={selectedCells}
                onCellClick={handleCellClick}
              />
              {error && <div className="board-error">{error}</div>}
              {!state.winner && !goldMode && selectedCells.length > 0 && (
                isGoldSelected ? (
                  <button className="btn-take" onClick={handleTakeGoldAction}>
                    拿取黄金并保留卡牌
                  </button>
                ) : (
                  <button className="btn-take" onClick={handleTake}>
                    拿取标记 ({selectedCells.length} 个)
                  </button>
                )
              )}
            </div>
            <Pyramid pyramid={state.pyramid} onBuyCard={handleBuy} canAffordCard={canAffordCard} />
          </div>
          <div className="players">
            <PlayerInfo player={state.players[0]} isCurrentPlayer={state.currentPlayerIndex === 0} onBuyReserved={handleBuyReserved} />
            <PlayerInfo player={state.players[1]} isCurrentPlayer={state.currentPlayerIndex === 1} onBuyReserved={handleBuyReserved} />
          </div>
          {!state.winner && !goldMode && (
            <button className="btn-pass" onClick={handleSkip}>
              跳过回合
            </button>
          )}
        </>
      )}
    </div>
  );
}
