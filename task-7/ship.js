/**
 * Ship class for the "Sea Battle" game
 * @module Ship
 */

import { coordinatesToString } from './utils.js';

/**
 * Class representing a ship in the game
 */
export class Ship {
  /**
   * Creates a new ship
   * @param {number} length - Ship length
   */
  constructor(length) {
    this.length = length;
    this.locations = [];
    this.hits = new Set();
  }

  /**
   * Adds a ship position
   * @param {number} row - Row
   * @param {number} col - Column
   */
  addLocation(row, col) {
    const locationStr = coordinatesToString(row, col);
    this.locations.push(locationStr);
  }

  /**
   * Processes a hit on the ship
   * @param {string} location - Hit position
   * @returns {boolean} - true if hit was successful
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && !this.hits.has(location)) {
      this.hits.add(location);
      return true;
    }
    return false;
  }

  /**
   * Checks if the ship is sunk
   * @returns {boolean} - true if ship is sunk
   */
  isSunk() {
    return this.hits.size >= this.length;
  }

  /**
   * Checks if this position was already hit
   * @param {string} location - Position to check
   * @returns {boolean} - true if already hit
   */
  isHit(location) {
    return this.hits.has(location);
  }

  /**
   * Checks if ship occupies the specified position
   * @param {string} location - Position to check
   * @returns {boolean} - true if ship occupies this position
   */
  occupies(location) {
    return this.locations.includes(location);
  }

  /**
   * Gets all ship positions
   * @returns {string[]} - Array of ship positions
   */
  getLocations() {
    return [...this.locations];
  }
} 