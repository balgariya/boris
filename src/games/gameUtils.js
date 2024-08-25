
export const activeGames = new Map();

export function isGameActive(channelId) {
  return activeGames.has(channelId);
}

export function setGameActive(channelId, gameState) {
  activeGames.set(channelId, gameState);
}

export function removeGame(channelId) {
  activeGames.delete(channelId);
}

export function getGameState(channelId) {
  return activeGames.get(channelId);
}
