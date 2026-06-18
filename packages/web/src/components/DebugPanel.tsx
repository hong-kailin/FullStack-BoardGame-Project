import { useState, useEffect } from "react";
import type { GameState, Player, TokenType } from "@splendor/core";
import type { Card } from "@splendor/core";
import { createInitialState } from "@splendor/core";

interface DebugPanelProps {
  state: GameState;
  setState: (state: GameState) => void;
}

const TOKEN_TYPES: TokenType[] = ["red", "blue", "green", "white", "black", "pearl", "gold"];

function updatePlayer(
  players: [Player, Player],
  index: number,
  fn: (p: Player) => Player
): [Player, Player] {
  const newPlayers = [...players] as [Player, Player];
  newPlayers[index] = fn({ ...newPlayers[index] });
  return newPlayers;
}

export default function DebugPanel({ state, setState }: DebugPanelProps) {
  const [open, setOpen] = useState(() => {
    return localStorage.getItem("debugPanelOpen") === "true";
  });

  useEffect(() => {
    localStorage.setItem("debugPanelOpen", String(open));
  }, [open]);

  if (!open) {
    return (
      <button className="debug-toggle" onClick={() => setOpen(true)} title="调试面板">
        ⚙️
      </button>
    );
  }

  const modifyPlayer = (playerIndex: number, fn: (p: Player) => Player) => {
    setState({
      ...state,
      players: updatePlayer(state.players, playerIndex, fn),
    });
  };

  const addPoints = (playerIndex: number, delta: number) => {
    modifyPlayer(playerIndex, (p) => {
      const newCards = [...p.cards];
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          newCards.push({
            id: 9000 + Math.random() * 1000,
            level: 0,
            gem: null,
            points: 1,
            crowns: 0,
            bonusCount: 0,
            cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0 },
            ability: null,
          });
        }
      } else {
        let toRemove = -delta;
        newCards.reverse();
        const filtered = newCards.filter((c) => {
          if (toRemove > 0 && c.points > 0 && c.crowns === 0 && c.bonusCount === 0 && !c.ability) {
            toRemove--;
            return false;
          }
          return true;
        });
        return { ...p, cards: filtered.reverse() };
      }
      return { ...p, cards: newCards };
    });
  };

  const addCrowns = (playerIndex: number, delta: number) => {
    modifyPlayer(playerIndex, (p) => {
      const newCards = [...p.cards];
      if (delta > 0) {
        for (let i = 0; i < delta; i++) {
          newCards.push({
            id: 9100 + Math.random() * 1000,
            level: 0,
            gem: null,
            points: 0,
            crowns: 1,
            bonusCount: 0,
            cost: { red: 0, blue: 0, green: 0, white: 0, black: 0, pearl: 0 },
            ability: null,
          });
        }
      } else {
        let toRemove = -delta;
        const filtered = newCards.filter((c) => {
          if (toRemove > 0 && c.crowns > 0 && c.points === 0 && c.bonusCount === 0 && !c.ability) {
            toRemove--;
            return false;
          }
          return true;
        });
        return { ...p, cards: filtered };
      }
      return { ...p, cards: newCards };
    });
  };

  const setPrivileges = (playerIndex: number, value: number) => {
    modifyPlayer(playerIndex, (p) => ({ ...p, privileges: Math.max(0, Math.min(3, value)) }));
  };

  const addToken = (playerIndex: number, type: TokenType, delta: number) => {
    modifyPlayer(playerIndex, (p) => ({
      ...p,
      tokens: {
        ...p.tokens,
        [type]: Math.max(0, (p.tokens[type] || 0) + delta),
      },
    }));
  };

  const clearDeck = (level: number) => {
    setState({
      ...state,
      decks: state.decks.map((deck, i) => (i === level ? [] : deck)) as [Card[], Card[], Card[]],
    });
  };

  const resetGame = () => {
    setState(createInitialState());
  };

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h3>🔧 调试面板</h3>
        <button className="debug-close" onClick={() => setOpen(false)}>✕</button>
      </div>

      <div className="debug-section">
        <h4>全局</h4>
        <button className="debug-btn" onClick={resetGame}>重置游戏</button>
      </div>

      {[0, 1].map((pi) => {
        const p = state.players[pi];
        return (
          <div key={pi} className="debug-section">
            <h4>{p.name}（玩家{pi + 1}）</h4>

            <div className="debug-row">
              <span>分数</span>
              <div className="debug-btn-group">
                <button className="debug-btn" onClick={() => addPoints(pi, -5)}>-5</button>
                <button className="debug-btn" onClick={() => addPoints(pi, -1)}>-1</button>
                <span className="debug-value">{p.cards.reduce((s, c) => s + c.points, 0)}</span>
                <button className="debug-btn" onClick={() => addPoints(pi, 1)}>+1</button>
                <button className="debug-btn" onClick={() => addPoints(pi, 5)}>+5</button>
                <button className="debug-btn" onClick={() => addPoints(pi, 19)}>19</button>
              </div>
            </div>

            <div className="debug-row">
              <span>王冠</span>
              <div className="debug-btn-group">
                <button className="debug-btn" onClick={() => addCrowns(pi, -3)}>-3</button>
                <button className="debug-btn" onClick={() => addCrowns(pi, -1)}>-1</button>
                <span className="debug-value">{p.cards.reduce((s, c) => s + c.crowns, 0) + p.royalCards.reduce((s, c) => s + c.crowns, 0)}</span>
                <button className="debug-btn" onClick={() => addCrowns(pi, 1)}>+1</button>
                <button className="debug-btn" onClick={() => addCrowns(pi, 3)}>+3</button>
                <button className="debug-btn" onClick={() => addCrowns(pi, 6)}>6</button>
              </div>
            </div>

            <div className="debug-row">
              <span>特权</span>
              <div className="debug-btn-group">
                <button className="debug-btn" onClick={() => setPrivileges(pi, p.privileges - 1)}>-</button>
                <span className="debug-value">{p.privileges}</span>
                <button className="debug-btn" onClick={() => setPrivileges(pi, p.privileges + 1)}>+</button>
              </div>
            </div>

            <div className="debug-row">
              <span>标记</span>
            </div>
            {TOKEN_TYPES.map((type) => (
              <div key={type} className="debug-row debug-token-row">
                <span className="debug-token-label">{type}</span>
                <div className="debug-btn-group">
                  <button className="debug-btn" onClick={() => addToken(pi, type, -3)}>-3</button>
                  <button className="debug-btn" onClick={() => addToken(pi, type, -1)}>-1</button>
                  <span className="debug-value">{p.tokens[type] || 0}</span>
                  <button className="debug-btn" onClick={() => addToken(pi, type, 1)}>+1</button>
                  <button className="debug-btn" onClick={() => addToken(pi, type, 3)}>+3</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="debug-section">
        <h4>牌库</h4>
        {[0, 1, 2].map((level) => (
          <div key={level} className="debug-row">
            <span>等级 {level + 1}</span>
            <span className="debug-value">{state.decks[level].length} 张</span>
            <button className="debug-btn" onClick={() => clearDeck(level)}>清空</button>
          </div>
        ))}
      </div>
    </div>
  );
}
