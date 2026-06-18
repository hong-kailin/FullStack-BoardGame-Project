import { useState } from "react";
import Board from "./components/Board";
import Pyramid from "./components/Pyramid";
import PlayerInfo from "./components/PlayerInfo";
import DebugPanel from "./components/DebugPanel";
import { createInitialState, executeAction } from "@splendor/core";
import { validateCellSelection } from "@splendor/core";
import { getPlayerBonuses, getActualCost, canAfford } from "@splendor/core";
import type { TokenType } from "@splendor/core";
import "./App.css";

const TOKEN_LABELS: Record<string, string> = {
  red: "🔴", blue: "🔵", green: "🟢",
  white: "⚪", black: "⚫",
  pearl: "🦪", gold: "🟡",
};

type UIPhase = "normal" | "gold_selecting" | "discarding" | "privilege_selecting";

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
  const [uiPhase, setUIPhase] = useState<UIPhase>("normal");
  const [discardNeeded, setDiscardNeeded] = useState(0);
  const [discardSelection, setDiscardSelection] = useState<Record<string, number>>({});

  if (!username) {
    return <AuthForm onLogin={setUsername} />;
  }

  const handleCellClick = (row: number, col: number) => {
    setError("");

    if (uiPhase === "privilege_selecting") {
      const token = state.boardTokens[row][col];
      if (!token || token === "gold") {
        setError("只能拿取非黄金标记");
        return;
      }
      const result = executeAction(state, { type: "use_privilege", position: [row, col] });
      setState(result.state);
      setUIPhase("normal");
      if (result.needsDiscard > 0) {
        setUIPhase("discarding");
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
    const result = executeAction(state, { type: "take_tokens", positions: selectedCells });
    setState(result.state);
    setSelectedCells([]);
    if (result.needsDiscard > 0) {
      setUIPhase("discarding");
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
    const result = executeAction(state, { type: "discard_tokens", discards });
    setState(result.state);
    setMessage(result.message);
    setUIPhase("normal");
    setDiscardNeeded(0);
    setDiscardSelection({});
  };

  const handleTakeGoldAction = () => {
    if (selectedCells.length !== 1) return;
    const pos = selectedCells[0];
    const token = state.boardTokens[pos[0]][pos[1]];
    if (token !== "gold") return;
    setUIPhase("gold_selecting");
    setMessage("请选择一张要保留的卡牌");
  };

  const handleBuy = (cardId: number) => {
    if (uiPhase === "gold_selecting") {
      const result = executeAction(state, { type: "take_gold", position: selectedCells[0], cardId });
      setState(result.state);
      setMessage(result.message);
      setSelectedCells([]);
      setUIPhase("normal");
      return;
    }
    const result = executeAction(state, { type: "buy_card", cardId });
    setState(result.state);
    setMessage(result.message);
  };

  const handleBuyReserved = (cardId: number) => {
    const result = executeAction(state, { type: "buy_card", cardId });
    setState(result.state);
    setMessage(result.message);
  };

  const handleSkip = () => {
    const result = executeAction(state, { type: "pass" });
    setState(result.state);
    setMessage(result.message);
    setSelectedCells([]);
  };

  const handleRefill = () => {
    const result = executeAction(state, { type: "refill_board" });
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

  const canAffordReserved = (cardId: number) => {
    for (const p of state.players) {
      const card = p.reservedCards.find(c => c.id === cardId);
      if (card) {
        const actualCost = getActualCost(card, bonuses);
        return canAfford(player, actualCost);
      }
    }
    return false;
  };

  const isGoldSelected = selectedCells.length === 1 &&
    state.boardTokens[selectedCells[0][0]]?.[selectedCells[0][1]] === "gold";

  const isNormalPhase = uiPhase === "normal" || uiPhase === "privilege_selecting";

  return (
    <div className="app">
      <h1>璀璨宝石对决</h1>
      <DebugPanel state={state} setState={setState} />
      <div className="user-bar">
        <span>{username}</span>
        <button className="btn-link" onClick={() => setUsername(null)}>退出</button>
      </div>
      {message && <div className="message">{message}</div>}
      {uiPhase === "gold_selecting" && <div className="message">请点击金字塔中的一张卡牌来保留</div>}
      {uiPhase === "discarding" && (
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
                  const result = executeAction(state, { type: "claim_royal_card", royalCardId: card.id });
                  setState(result.state);
                  setMessage(result.message);
                }}
              >
                <div className="royal-claim-points">{card.points} 分</div>
                {card.ability && (
                  <div className="royal-claim-ability">
                    {{ extra_turn: "🔄 额外回合", take_privilege: "⭐ 获得特权", take_from_opponent: "👊 抢夺标记", take_matching_token: "🎨 拿取同色" }[card.ability]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {state.pendingGemCard && (
        <div className="gem-color-panel">
          <div className="message">请选择万能奖励的颜色：</div>
          <div className="gem-color-list">
            {(["red", "blue", "green", "white", "black"] as const).map((color) => (
              <div
                key={color}
                className="gem-color-option"
                style={{ borderColor: { red: "#e74c3c", blue: "#3498db", green: "#2ecc71", white: "#ecf0f1", black: "#2c3e50" }[color] }}
                onClick={() => {
                  const result = executeAction(state, { type: "set_gem_color", cardId: state.pendingGemCard!.id, color });
                  setState(result.state);
                  setMessage(result.message);
                }}
              >
                {{ red: "🔴 红色", blue: "🔵 蓝色", green: "🟢 绿色", white: "⚪ 白色", black: "⚫ 黑色" }[color]}
              </div>
            ))}
          </div>
        </div>
      )}
      {uiPhase !== "discarding" && state.pendingRoyalThresholds.length === 0 && !state.pendingGemCard && (
        <>
          <div className="game-layout">
            <div>
              <Board
                boardTokens={state.boardTokens}
                selectedCells={selectedCells}
                onCellClick={handleCellClick}
              />
              {error && <div className="board-error">{error}</div>}
              {!state.winner && isNormalPhase && selectedCells.length > 0 && (
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
            <div className="game-center">
              <Pyramid pyramid={state.pyramid} onBuyCard={handleBuy} canAffordCard={canAffordCard} />
            </div>
            <div className="game-right">
              {state.availableRoyalCards.length > 0 && (
                <div className="royal-cards">
                  <h3>皇室卡牌</h3>
                  <div className="royal-list">
                    {state.availableRoyalCards.map((card) => (
                      <div key={card.id} className="royal-card">
                        <div className="royal-points">{card.points} 分</div>
                        {card.ability && (
                          <div className="royal-ability">
                            {{ extra_turn: "🔄 额外回合", take_privilege: "⭐ 获得特权", take_from_opponent: "👊 抢夺标记", take_matching_token: "🎨 拿取同色" }[card.ability]}
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
            <PlayerInfo player={state.players[0]} isCurrentPlayer={state.currentPlayerIndex === 0} onBuyReserved={handleBuyReserved} canAffordReserved={canAffordReserved} />
            <PlayerInfo player={state.players[1]} isCurrentPlayer={state.currentPlayerIndex === 1} onBuyReserved={handleBuyReserved} canAffordReserved={canAffordReserved} />
          </div>
          {!state.winner && isNormalPhase && (
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
                  className={`btn-pass ${uiPhase === "privilege_selecting" ? "active" : ""}`}
                  onClick={() => {
                    setUIPhase(uiPhase === "privilege_selecting" ? "normal" : "privilege_selecting");
                    setSelectedCells([]);
                    setError(uiPhase === "privilege_selecting" ? "" : "请点击版图上的一个非黄金标记");
                  }}
                >
                  {uiPhase === "privilege_selecting" ? "取消使用特权" : `使用特权 (${player.privileges})`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
