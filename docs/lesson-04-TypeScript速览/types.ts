type GemColor = "red" | "blue" | "green" | "white" | "black";

interface Card {
  id: number;
  level: number;
  gem: GemColor;
  points: number;
  cost: Record<GemColor, number>;
}

interface Player {
  id: number;
  name: string;
  gems: Record<GemColor, number>;
  cards: Card[];
  points: number;
}

const sampleCard: Card = {
  id: 1,
  level: 1,
  gem: "red",
  points: 1,
  cost: { red: 0, blue: 0, green: 0, white: 0, black: 3 }
};

console.log("Card:", sampleCard);
console.log("Cost for black gems:", sampleCard.cost.black);
