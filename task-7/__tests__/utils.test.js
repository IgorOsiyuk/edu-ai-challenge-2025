/**
 * Unit tests for utils.js module
 */

import { 
  isValidCoordinate,
  coordinatesToString,
  parseCoordinates,
  randomInt,
  randomOrientation,
  getAdjacentCoordinates,
  GAME_CONFIG
} from '../utils.js';

describe('Utils Module', () => {
  
  describe('isValidCoordinate', () => {
    test('should return true for valid coordinates', () => {
      expect(isValidCoordinate(0, 0, 10)).toBe(true);
      expect(isValidCoordinate(5, 5, 10)).toBe(true);
      expect(isValidCoordinate(9, 9, 10)).toBe(true);
    });

    test('should return false for invalid coordinates', () => {
      expect(isValidCoordinate(-1, 0, 10)).toBe(false);
      expect(isValidCoordinate(0, -1, 10)).toBe(false);
      expect(isValidCoordinate(10, 0, 10)).toBe(false);
      expect(isValidCoordinate(0, 10, 10)).toBe(false);
      expect(isValidCoordinate(10, 10, 10)).toBe(false);
    });
  });

  describe('coordinatesToString', () => {
    test('should convert coordinates to string correctly', () => {
      expect(coordinatesToString(0, 0)).toBe('00');
      expect(coordinatesToString(1, 2)).toBe('12');
      expect(coordinatesToString(9, 9)).toBe('99');
    });
  });

  describe('parseCoordinates', () => {
    test('should parse valid coordinate strings', () => {
      expect(parseCoordinates('00')).toEqual({ row: 0, col: 0 });
      expect(parseCoordinates('12')).toEqual({ row: 1, col: 2 });
      expect(parseCoordinates('99')).toEqual({ row: 9, col: 9 });
    });

    test('should throw error for invalid input', () => {
      expect(() => parseCoordinates('')).toThrow('Coordinates must contain exactly two characters');
      expect(() => parseCoordinates('1')).toThrow('Coordinates must contain exactly two characters');
      expect(() => parseCoordinates('123')).toThrow('Coordinates must contain exactly two characters');
      expect(() => parseCoordinates('ab')).toThrow('Coordinates must be numbers');
      expect(() => parseCoordinates(null)).toThrow('Coordinates must contain exactly two characters');
    });
  });

  describe('randomInt', () => {
    test('should generate numbers within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(0, 10);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(10);
      }
    });

    test('should handle single value range', () => {
      const result = randomInt(5, 6);
      expect(result).toBe(5);
    });
  });

  describe('randomOrientation', () => {
    test('should return valid orientations', () => {
      const orientations = new Set();
      for (let i = 0; i < 100; i++) {
        const orientation = randomOrientation();
        orientations.add(orientation);
        expect(['horizontal', 'vertical']).toContain(orientation);
      }
      // Should generate both orientations over many trials
      expect(orientations.size).toBe(2);
    });
  });

  describe('getAdjacentCoordinates', () => {
    test('should return all adjacent coordinates for center position', () => {
      const adjacent = getAdjacentCoordinates(5, 5, 10);
      expect(adjacent).toHaveLength(4);
      expect(adjacent).toContainEqual({ row: 4, col: 5 });
      expect(adjacent).toContainEqual({ row: 6, col: 5 });
      expect(adjacent).toContainEqual({ row: 5, col: 4 });
      expect(adjacent).toContainEqual({ row: 5, col: 6 });
    });

    test('should filter out invalid coordinates at edges', () => {
      const topLeft = getAdjacentCoordinates(0, 0, 10);
      expect(topLeft).toHaveLength(2);
      expect(topLeft).toContainEqual({ row: 1, col: 0 });
      expect(topLeft).toContainEqual({ row: 0, col: 1 });

      const bottomRight = getAdjacentCoordinates(9, 9, 10);
      expect(bottomRight).toHaveLength(2);
      expect(bottomRight).toContainEqual({ row: 8, col: 9 });
      expect(bottomRight).toContainEqual({ row: 9, col: 8 });
    });
  });

  describe('GAME_CONFIG', () => {
    test('should have correct default values', () => {
      expect(GAME_CONFIG.BOARD_SIZE).toBe(10);
      expect(GAME_CONFIG.NUM_SHIPS).toBe(3);
      expect(GAME_CONFIG.SHIP_LENGTH).toBe(3);
      expect(GAME_CONFIG.SYMBOLS.WATER).toBe('~');
      expect(GAME_CONFIG.SYMBOLS.SHIP).toBe('S');
      expect(GAME_CONFIG.SYMBOLS.HIT).toBe('X');
      expect(GAME_CONFIG.SYMBOLS.MISS).toBe('O');
    });
  });
}); 