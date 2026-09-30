import { createGame } from "./game/game.js";

function initializeGame() {
  const canvas = document.querySelector("#game-canvas");
  const status = document.querySelector("#game-status");
  if (!canvas || !status) throw new Error("Required game page elements were not found.");

  const game = createGame(canvas);
  game.start();
  status.textContent = "Ready — render loop running";
  return game;
}

initializeGame();
