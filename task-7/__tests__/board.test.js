/**
 * Unit tests for Board class
 */

import { Board } from '../board.js';
import { GAME_CONFIG } from '../utils.js';

describe('Board Class', () => {
  let board;
  let playerBoard;

  beforeEach(() => {
    board = new Board(10, false);
    playerBoard = new Board(10, true);
  });

  describe('constructor', () => {
    test('should create board with correct size', () => {
      expect(board.size).toBe(10);
      expect(board.grid).toHaveLength(10);
      expect(board.grid[0]).toHaveLength(10);
      expect(board.showShips).toBe(false);
      expect(board.ships).toEqual([]);
      expect(board.guesses).toBeInstanceOf(Set);
    });

    test('should create player board that shows ships', () => {
      expect(playerBoard.showShips).toBe(true);
    });
  });

  describe('initializeGrid', () => {
    test('should initialize grid with water symbols', () => {
      const grid = board.initializeGrid();
      expect(grid).toHaveLength(10);
      grid.forEach(row => {
        expect(row).toHaveLength(10);
        row.forEach(cell => {
          expect(cell).toBe(GAME_CONFIG.SYMBOLS.WATER);
        });
      });
    });
  });

  describe('canPlaceShip', () => {
    test('should allow placement in empty water', () => {
      expect(board.canPlaceShip(0, 0, 3, 'horizontal')).toBe(true);
      expect(board.canPlaceShip(0, 0, 3, 'vertical')).toBe(true);
    });

    test('should prevent placement outside boundaries', () => {
      expect(board.canPlaceShip(0, 8, 3, 'horizontal')).toBe(false);
      expect(board.canPlaceShip(8, 0, 3, 'vertical')).toBe(false);
    });

    test('should prevent placement on occupied cells', () => {
      // Place a ship first
      board.grid[1][1] = GAME_CONFIG.SYMBOLS.SHIP;
      expect(board.canPlaceShip(1, 0, 3, 'horizontal')).toBe(false);
    });
  });

  describe('placeShipsRandomly', () => {
    test('should place ships successfully', () => {
      const result = board.placeShipsRandomly(3, 3);
      expect(result).toBe(true);
      expect(board.ships).toHaveLength(3);
    });

    test('should show ships on player board', () => {
      playerBoard.placeShipsRandomly(1, 3);
      expect(playerBoard.ships).toHaveLength(1);
      
      // Check that ship symbols are visible
      const ship = playerBoard.ships[0];
      ship.locations.forEach(location => {
        const row = parseInt(location[0]);
        const col = parseInt(location[1]);
        expect(playerBoard.grid[row][col]).toBe(GAME_CONFIG.SYMBOLS.SHIP);
      });
    });
  });

  describe('processShot', () => {
    beforeEach(() => {
      // Manually place a ship for testing
      board.placeShipsRandomly(1, 3);
    });

    test('should handle miss', () => {
      const result = board.processShot(9, 9);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.alreadyGuessed).toBe(false);
      expect(board.grid[9][9]).toBe(GAME_CONFIG.SYMBOLS.MISS);
    });

    test('should detect already guessed', () => {
      board.processShot(5, 5);
      const result = board.processShot(5, 5);
      expect(result.alreadyGuessed).toBe(true);
    });
  });

  describe('hasShipsRemaining', () => {
    test('should return true when ships are not sunk', () => {
      board.placeShipsRandomly(1, 3);
      expect(board.hasShipsRemaining()).toBe(true);
    });

    test('should return false when all ships are sunk', () => {
      board.placeShipsRandomly(1, 3);
      const ship = board.ships[0];
      
      // Sink the ship
      ship.locations.forEach(location => {
        ship.hit(location);
      });
      
      expect(board.hasShipsRemaining()).toBe(false);
    });
  });

  describe('getRemainingShipsCount', () => {
    test('should count remaining ships correctly', () => {
      board.placeShipsRandomly(2, 3);
      expect(board.getRemainingShipsCount()).toBe(2);
      
      // Sink one ship
      const ship = board.ships[0];
      ship.locations.forEach(location => {
        ship.hit(location);
      });
      
      expect(board.getRemainingShipsCount()).toBe(1);
    });
  });

  describe('getDisplaySymbol', () => {
    test('should return correct symbol', () => {
      expect(board.getDisplaySymbol(0, 0)).toBe(GAME_CONFIG.SYMBOLS.WATER);
      
      board.grid[1][1] = GAME_CONFIG.SYMBOLS.HIT;
      expect(board.getDisplaySymbol(1, 1)).toBe(GAME_CONFIG.SYMBOLS.HIT);
    });
  });

  describe('hasGuessed', () => {
    test('should track guesses correctly', () => {
      expect(board.hasGuessed(0, 0)).toBe(false);
      
      board.processShot(0, 0);
      expect(board.hasGuessed(0, 0)).toBe(true);
    });
  });
}); 