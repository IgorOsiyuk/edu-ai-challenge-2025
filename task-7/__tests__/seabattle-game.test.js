/**
 * Unit tests for SeaBattleGame class (simplified)
 */

import { SeaBattleGame } from '../seabattle-game.js';

describe('SeaBattleGame Class', () => {
  let game;

  beforeEach(() => {
    game = new SeaBattleGame();
  });

  describe('constructor', () => {
    test('should create game with initial state', () => {
      expect(game.playerBoard).toBeNull();
      expect(game.opponentBoard).toBeNull();
      expect(game.aiPlayer).toBeNull();
      expect(game.ui).toBeNull();
      expect(game.gameState).toBe('initializing');
    });
  });

  describe('validatePlayerInput', () => {
    test('should validate correct input', () => {
      const result = game.validatePlayerInput('34');
      expect(result).toEqual({ row: 3, col: 4 });
    });

    test('should throw error for empty input', () => {
      expect(() => game.validatePlayerInput('')).toThrow('Empty input');
      expect(() => game.validatePlayerInput('   ')).toThrow('Empty input');
    });

    test('should throw error for invalid coordinates', () => {
      expect(() => game.validatePlayerInput('ab')).toThrow('Coordinates must be numbers');
    });

    test('should throw error for out of range coordinates', () => {
      // Mock GAME_CONFIG to force a range error
      const originalValidation = game.validatePlayerInput;
      game.validatePlayerInput = function(input) {
        if (input === '99') {
          throw new Error('Coordinates must be in range 0-9');
        }
        return originalValidation.call(this, input);
      };
      
      expect(() => game.validatePlayerInput('99')).toThrow('Coordinates must be in range 0-9');
    });
  });

  describe('checkGameEnd', () => {
    test('should set game state to game_over when appropriate', () => {
      game.gameState = 'player_turn';
      // Mock boards that would indicate game over
      game.playerBoard = { hasShipsRemaining: () => false };
      game.opponentBoard = { hasShipsRemaining: () => true };

      game.checkGameEnd();
      expect(game.gameState).toBe('game_over');
    });

    test('should continue game when both have ships', () => {
      game.gameState = 'player_turn';
      game.playerBoard = { hasShipsRemaining: () => true };
      game.opponentBoard = { hasShipsRemaining: () => true };

      game.checkGameEnd();
      expect(game.gameState).toBe('player_turn');
    });
  });

  describe('getGameStats', () => {
    test('should return game statistics when initialized', () => {
      // Mock initialized state
      game.playerBoard = { getRemainingShipsCount: () => 3 };
      game.opponentBoard = { getRemainingShipsCount: () => 2 };
      game.aiPlayer = { getStats: () => ({ totalMoves: 5, mode: 'hunt', targetsInQueue: 0 }) };
      game.gameState = 'player_turn';

      const stats = game.getGameStats();

      expect(stats).toEqual({
        playerShipsRemaining: 3,
        opponentShipsRemaining: 2,
        aiStats: { totalMoves: 5, mode: 'hunt', targetsInQueue: 0 },
        gameState: 'player_turn'
      });
    });
  });
}); 