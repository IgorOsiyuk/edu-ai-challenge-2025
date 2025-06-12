/**
 * Unit tests for AiPlayer class
 */

import { AiPlayer } from '../ai-player.js';
import { GAME_CONFIG } from '../utils.js';

describe('AiPlayer Class', () => {
  let aiPlayer;

  beforeEach(() => {
    aiPlayer = new AiPlayer(10);
  });

  describe('constructor', () => {
    test('should create AI player with correct initial state', () => {
      expect(aiPlayer.boardSize).toBe(10);
      expect(aiPlayer.guesses).toBeInstanceOf(Set);
      expect(aiPlayer.guesses.size).toBe(0);
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.targetQueue).toEqual([]);
    });

    test('should use default board size', () => {
      const defaultAi = new AiPlayer();
      expect(defaultAi.boardSize).toBe(GAME_CONFIG.BOARD_SIZE);
    });
  });

  describe('makeMove', () => {
    test('should make hunt move when in hunt mode', () => {
      const move = aiPlayer.makeMove();
      expect(move).toHaveProperty('row');
      expect(move).toHaveProperty('col');
      expect(typeof move.row).toBe('number');
      expect(typeof move.col).toBe('number');
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(10);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThan(10);
    });

    test('should make targeted move when targets available', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [{ row: 3, col: 4 }];
      
      const move = aiPlayer.makeMove();
      expect(move).toEqual({ row: 3, col: 4 });
      expect(aiPlayer.guesses.has('34')).toBe(true);
      expect(aiPlayer.targetQueue).toHaveLength(0);
    });

    test('should switch to hunt mode when target queue empty', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [];
      
      const move = aiPlayer.makeMove();
      expect(aiPlayer.mode).toBe('hunt');
      expect(move).toHaveProperty('row');
      expect(move).toHaveProperty('col');
    });
  });

  describe('processResult', () => {
    test('should switch to hunt mode when ship sunk', () => {
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [{ row: 1, col: 1 }];
      
      aiPlayer.processResult(2, 3, true, true);
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.targetQueue).toEqual([]);
    });

    test('should switch to target mode and add adjacent targets on hit', () => {
      aiPlayer.processResult(5, 5, true, false);
      expect(aiPlayer.mode).toBe('target');
      expect(aiPlayer.targetQueue).toHaveLength(4);
      expect(aiPlayer.targetQueue).toContainEqual({ row: 4, col: 5 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 6, col: 5 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 5, col: 4 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 5, col: 6 });
    });

    test('should not change mode on miss', () => {
      const originalMode = aiPlayer.mode;
      const originalQueue = [...aiPlayer.targetQueue];
      
      aiPlayer.processResult(3, 3, false, false);
      expect(aiPlayer.mode).toBe(originalMode);
      expect(aiPlayer.targetQueue).toEqual(originalQueue);
    });
  });

  describe('addAdjacentTargets', () => {
    test('should add valid adjacent coordinates', () => {
      aiPlayer.addAdjacentTargets(5, 5);
      expect(aiPlayer.targetQueue).toHaveLength(4);
      expect(aiPlayer.targetQueue).toContainEqual({ row: 4, col: 5 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 6, col: 5 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 5, col: 4 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 5, col: 6 });
    });

    test('should filter edge positions correctly', () => {
      aiPlayer.addAdjacentTargets(0, 0);
      expect(aiPlayer.targetQueue).toHaveLength(2);
      expect(aiPlayer.targetQueue).toContainEqual({ row: 1, col: 0 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 0, col: 1 });
    });

    test('should not add already guessed positions', () => {
      aiPlayer.guesses.add('45');
      aiPlayer.guesses.add('65');
      
      aiPlayer.addAdjacentTargets(5, 5);
      expect(aiPlayer.targetQueue).toHaveLength(2);
      expect(aiPlayer.targetQueue).toContainEqual({ row: 5, col: 4 });
      expect(aiPlayer.targetQueue).toContainEqual({ row: 5, col: 6 });
    });
  });

  describe('findFirstAvailableMove', () => {
    test('should find first available position', () => {
      aiPlayer.guesses.add('00');
      aiPlayer.guesses.add('01');
      
      const move = aiPlayer.findFirstAvailableMove();
      expect(move).toEqual({ row: 0, col: 2 });
    });

    test('should throw error when no moves available', () => {
      // Fill entire board
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          aiPlayer.guesses.add(`${row}${col}`);
        }
      }
      
      expect(() => aiPlayer.findFirstAvailableMove()).toThrow('No available moves');
    });
  });

  describe('getStats', () => {
    test('should return correct statistics', () => {
      aiPlayer.guesses.add('00');
      aiPlayer.guesses.add('11');
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [{ row: 1, col: 2 }];
      
      const stats = aiPlayer.getStats();
      expect(stats).toEqual({
        totalMoves: 2,
        mode: 'target',
        targetsInQueue: 1
      });
    });
  });

  describe('reset', () => {
    test('should reset AI state', () => {
      aiPlayer.guesses.add('00');
      aiPlayer.mode = 'target';
      aiPlayer.targetQueue = [{ row: 1, col: 2 }];
      
      aiPlayer.reset();
      expect(aiPlayer.guesses.size).toBe(0);
      expect(aiPlayer.mode).toBe('hunt');
      expect(aiPlayer.targetQueue).toEqual([]);
    });
  });
}); 