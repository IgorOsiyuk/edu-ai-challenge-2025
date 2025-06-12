/**
 * Unit tests for Ship class
 */

import { Ship } from '../ship.js';

describe('Ship Class', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  describe('constructor', () => {
    test('should create ship with correct length', () => {
      expect(ship.length).toBe(3);
      expect(ship.locations).toEqual([]);
      expect(ship.hits).toBeInstanceOf(Set);
      expect(ship.hits.size).toBe(0);
    });
  });

  describe('addLocation', () => {
    test('should add location correctly', () => {
      ship.addLocation(1, 2);
      expect(ship.locations).toContain('12');
    });

    test('should add multiple locations', () => {
      ship.addLocation(1, 2);
      ship.addLocation(1, 3);
      ship.addLocation(1, 4);
      expect(ship.locations).toEqual(['12', '13', '14']);
    });
  });

  describe('hit', () => {
    beforeEach(() => {
      ship.addLocation(1, 2);
      ship.addLocation(1, 3);
      ship.addLocation(1, 4);
    });

    test('should register hit on valid location', () => {
      const result = ship.hit('12');
      expect(result).toBe(true);
      expect(ship.hits.has('12')).toBe(true);
    });

    test('should not register hit on invalid location', () => {
      const result = ship.hit('99');
      expect(result).toBe(false);
      expect(ship.hits.has('99')).toBe(false);
    });

    test('should not register duplicate hit', () => {
      ship.hit('12');
      const result = ship.hit('12');
      expect(result).toBe(false);
      expect(ship.hits.size).toBe(1);
    });
  });

  describe('isSunk', () => {
    beforeEach(() => {
      ship.addLocation(1, 2);
      ship.addLocation(1, 3);
      ship.addLocation(1, 4);
    });

    test('should return false when ship is not sunk', () => {
      expect(ship.isSunk()).toBe(false);
      ship.hit('12');
      expect(ship.isSunk()).toBe(false);
      ship.hit('13');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when ship is completely sunk', () => {
      ship.hit('12');
      ship.hit('13');
      ship.hit('14');
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('isHit', () => {
    beforeEach(() => {
      ship.addLocation(1, 2);
      ship.hit('12');
    });

    test('should return true for hit locations', () => {
      expect(ship.isHit('12')).toBe(true);
    });

    test('should return false for non-hit locations', () => {
      expect(ship.isHit('13')).toBe(false);
    });
  });

  describe('occupies', () => {
    beforeEach(() => {
      ship.addLocation(1, 2);
      ship.addLocation(1, 3);
    });

    test('should return true for occupied locations', () => {
      expect(ship.occupies('12')).toBe(true);
      expect(ship.occupies('13')).toBe(true);
    });

    test('should return false for non-occupied locations', () => {
      expect(ship.occupies('14')).toBe(false);
      expect(ship.occupies('99')).toBe(false);
    });
  });

  describe('getLocations', () => {
    test('should return copy of locations array', () => {
      ship.addLocation(1, 2);
      ship.addLocation(1, 3);
      
      const locations = ship.getLocations();
      expect(locations).toEqual(['12', '13']);
      
      // Ensure it's a copy, not reference
      locations.push('14');
      expect(ship.locations).toEqual(['12', '13']);
    });
  });

  describe('integration scenarios', () => {
    test('should handle complete ship lifecycle', () => {
      // Create and place ship
      ship.addLocation(0, 0);
      ship.addLocation(0, 1);
      ship.addLocation(0, 2);

      // Test initial state
      expect(ship.isSunk()).toBe(false);
      expect(ship.getLocations()).toHaveLength(3);

      // Hit ship progressively
      expect(ship.hit('00')).toBe(true);
      expect(ship.isSunk()).toBe(false);

      expect(ship.hit('01')).toBe(true);
      expect(ship.isSunk()).toBe(false);

      expect(ship.hit('02')).toBe(true);
      expect(ship.isSunk()).toBe(true);

      // Verify final state
      expect(ship.isHit('00')).toBe(true);
      expect(ship.isHit('01')).toBe(true);
      expect(ship.isHit('02')).toBe(true);
    });
  });
}); 