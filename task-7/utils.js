/**
 * Utility functions for the "Sea Battle" game
 * @module Utils
 */

/**
 * Validates coordinates on the game board
 * @param {number} row - Row
 * @param {number} col - Column
 * @param {number} boardSize - Game board size
 * @returns {boolean} - true if coordinates are valid
 */
export const isValidCoordinate = (row, col, boardSize) => {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
};

/**
 * Converts coordinates to string representation
 * @param {number} row - Row
 * @param {number} col - Column
 * @returns {string} - String representation of coordinates
 */
export const coordinatesToString = (row, col) => {
  return String(row) + String(col);
};

/**
 * Parses string representation of coordinates
 * @param {string} coordinateStr - String representation of coordinates
 * @returns {{row: number, col: number}} - Object with coordinates
 */
export const parseCoordinates = (coordinateStr) => {
  if (!coordinateStr || coordinateStr.length !== 2) {
    throw new Error('Coordinates must contain exactly two characters');
  }
  
  const row = parseInt(coordinateStr[0]);
  const col = parseInt(coordinateStr[1]);
  
  if (isNaN(row) || isNaN(col)) {
    throw new Error('Coordinates must be numbers');
  }
  
  return { row, col };
};

/**
 * Generates random number in range [min, max)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} - Random number
 */
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Generates random ship orientation
 * @returns {'horizontal'|'vertical'} - Ship orientation
 */
export const randomOrientation = () => {
  return Math.random() < 0.5 ? 'horizontal' : 'vertical';
};

/**
 * Gets adjacent coordinates for a given position
 * @param {number} row - Row
 * @param {number} col - Column
 * @param {number} boardSize - Game board size
 * @returns {Array<{row: number, col: number}>} - Array of adjacent coordinates
 */
export const getAdjacentCoordinates = (row, col, boardSize) => {
  const adjacent = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 }
  ];
  
  return adjacent.filter(coord => 
    isValidCoordinate(coord.row, coord.col, boardSize)
  );
};

/**
 * Game constants
 */
export const GAME_CONFIG = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3,
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  }
}; 