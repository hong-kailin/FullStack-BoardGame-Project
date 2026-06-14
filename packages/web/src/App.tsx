import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import PlayerInfo from "./components/PlayerInfo";
import { createInitialState, handleTakeTokens, handleBuyCard, handlePass, handleTakeGold, handleDiscardTokens, handleRefillBoard, handleUsePrivilege, handleClaimRoyalCard } from "@splendor/core";
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
  const [privilegeMode, setPrivilegeMode] = useState(false);

  if (!username) {
    return <AuthForm onLogin={setUsername} />;
  }

  const handleCellClick = (row: number, col: number) => {
    setError("");

    if (privilegeMode) {
      const token = state.boardTokens[row][col];
      if (!token || token === "gold") {
        setError("只能拿取非黄金标记");
        return;
      }
      const result = handleUsePrivilege(state, [row, col]);
      setState(result.state);
      setPrivilegeMode(false);
      if (result.needsDiscard > 0) {
        setDiscardMode(true);
        setDiscardNeeded(result.needsDiscard);
        setDiscardSelection({});
      }
      setMessage(result.message);
      return;
    }

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

  const handleRefill = () => {
    const result = handleRefillBoard(state);
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  };

  const player = state.players[state.currentPlayerIndex];
  const { bonuses, wildBonus } = getPlayerBonuses(player);

  const canAffordCard = (cardId: number) => {
    for (const level of state.pyramid) {
      const card = level.find(c => c.id === cardId);
      if (card) {
        const actualCost = getActualCost(card, bonuses, wildBonus);
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
      {state.pendingRoyalThresholds.length > 0 && (
        <div className="royal-claim-panel">
          <div className="message">达到 {state.pendingRoyalThresholds.join("/")} 王冠！请选择一张皇室卡牌：</div>
          <div className="royal-claim-list">
            {state.availableRoyalCards.map((card) => (
              <div
                key={card.id}
                className="royal-claim-card"
                onClick={() => {
                  const result = handleClaimRoyalCard(state, card.id);
                  setState(result.state);
                  setMessage(result.message);
                }}
              >
                <div className="royal-claim-points">{card.points} 分</div>
                {card.ability && (
                  <div className="royal-claim-ability">
                    {{ extra_turn: "🔄 额外回合", take_privilege: "⭐ 获得特权", take_from_opponent: "👊 抢夺标记", take_matching_token: "🎨 拿取同色", copy_bonus: "📋 复制奖励" }[card.ability]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {!discardMode && state.pendingRoyalThresholds.length === 0 && (
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
            <div>
              <Pyramid pyramid={state.pyramid} onBuyCard={handleBuy} canAffordCard={canAffordCard} />
              {state.availableRoyalCards.length > 0 && (
                <div className="royal-cards">
                  <h3>皇室卡牌</h3>
                  <div className="royal-list">
                    {state.availableRoyalCards.map((card) => (
                      <div key={card.id} className="royal-card">
                        <div className="royal-points">{card.points} 分</div>
                        {card.ability && (
                          <div className="royal-ability">
                            {{ extra_turn: "🔄 额外回合", take_privilege: "⭐ 获得特权", take_from_opponent: "👊 抢夺标记", take_matching_token: "🎨 拿取同色", copy_bonus: "📋 复制奖励" }[card.ability]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="players">
            <PlayerInfo player={state.players[0]} isCurrentPlayer={state.currentPlayerIndex === 0} onBuyReserved={handleBuyReserved} />
            <PlayerInfo player={state.players[1]} isCurrentPlayer={state.currentPlayerIndex === 1} onBuyReserved={handleBuyReserved} />
          </div>
          {/*
            && 是短路求值：从左到右，遇到 false 就停。
            !state.winner && !goldMode 翻译成人话：
            "游戏没结束 且 不在黄金模式" → 渲染按钮；否则什么都不渲染。
            React 中 {false} 和 {null} 都不会产生任何 DOM。
          */}
          {!state.winner && !goldMode && (
            <div className="action-buttons">
              <button className="btn-pass" onClick={handleSkip}>
                跳过回合
              </button>
              <button
                className="btn-pass"
                onClick={handleRefill}
                disabled={state.bag.length === 0}
                title={state.bag.length === 0 ? "袋子为空" : `袋子中有 ${state.bag.length} 个标记`}
              >
                补充版图（对手+1特权）
              </button>
              {player.privileges > 0 && (
                <button
                  className={`btn-pass ${privilegeMode ? "active" : ""}`}
                  onClick={() => {
                    setPrivilegeMode(!privilegeMode);
                    setSelectedCells([]);
                    setError(privilegeMode ? "" : "请点击版图上的一个非黄金标记");
                  }}
                >
                  {privilegeMode ? "取消使用特权" : `使用特权 (${player.privileges})`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
