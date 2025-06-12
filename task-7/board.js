/**
 * Game board class for the "Sea Battle" game
 * @module Board
 */

import { Ship } from './ship.js';
import { 
  GAME_CONFIG, 
  isValidCoordinate, 
  coordinatesToString, 
  randomInt, 
  randomOrientation 
} from './utils.js';

/**
 * Class representing a game board
 */
export class Board {
  /**
   * Creates a new game board
   * @param {number} size - Board size (default 10x10)
   * @param {boolean} showShips - Whether to show ships on the board
   */
  constructor(size = GAME_CONFIG.BOARD_SIZE, showShips = false) {
    this.size = size;
    this.showShips = showShips;
    this.grid = this.initializeGrid();
    this.ships = [];
    this.guesses = new Set();
  }

  /**
   * Initializes the board grid
   * @returns {string[][]} - Two-dimensional array of symbols
   */
  initializeGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill(GAME_CONFIG.SYMBOLS.WATER)
    );
  }

  /**
   * Places ships randomly on the board
   * @param {number} numShips - Number of ships
   * @param {number} shipLength - Ship length
   * @returns {boolean} - true if all ships were placed successfully
   */
  placeShipsRandomly(numShips, shipLength) {
    let placedShips = 0;
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops

    while (placedShips < numShips && attempts < maxAttempts) {
      attempts++;
      
      const orientation = randomOrientation();
      const { startRow, startCol } = this.getRandomStartPosition(shipLength, orientation);
      
      if (this.canPlaceShip(startRow, startCol, shipLength, orientation)) {
        const ship = new Ship(shipLength);
        this.placeShip(ship, startRow, startCol, orientation);
        this.ships.push(ship);
        placedShips++;
      }
    }

    return placedShips === numShips;
  }

  /**
   * Gets random starting position for a ship
   * @param {number} shipLength - Ship length
   * @param {string} orientation - Ship orientation
   * @returns {{startRow: number, startCol: number}} - Starting coordinates
   */
  getRandomStartPosition(shipLength, orientation) {
    let startRow, startCol;
    
    if (orientation === 'horizontal') {
      startRow = randomInt(0, this.size);
      startCol = randomInt(0, this.size - shipLength + 1);
    } else {
      startRow = randomInt(0, this.size - shipLength + 1);
      startCol = randomInt(0, this.size);
    }
    
    return { startRow, startCol };
  }

  /**
   * Checks if a ship can be placed at the specified position
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} length - Ship length
   * @param {string} orientation - Ship orientation
   * @returns {boolean} - true if ship can be placed
   */
  canPlaceShip(startRow, startCol, length, orientation) {
    for (let i = 0; i < length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      if (!isValidCoordinate(row, col, this.size) || 
          this.grid[row][col] !== GAME_CONFIG.SYMBOLS.WATER) {
        return false;
      }
    }
    return true;
  }

  /**
   * Places a ship on the board
   * @param {Ship} ship - Ship to place
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {string} orientation - Ship orientation
   */
  placeShip(ship, startRow, startCol, orientation) {
    for (let i = 0; i < ship.length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      ship.addLocation(row, col);
      
      if (this.showShips) {
        this.grid[row][col] = GAME_CONFIG.SYMBOLS.SHIP;
      }
    }
  }

  /**
   * Processes a shot at the board
   * @param {number} row - Shot row
   * @param {number} col - Shot column
   * @returns {{hit: boolean, sunk: boolean, alreadyGuessed: boolean}} - Shot result
   */
  processShot(row, col) {
    const location = coordinatesToString(row, col);
    
    if (this.guesses.has(location)) {
      return { hit: false, sunk: false, alreadyGuessed: true };
    }
    
    this.guesses.add(location);
    
    const targetShip = this.ships.find(ship => ship.occupies(location));
    
    if (targetShip) {
      const wasHit = targetShip.hit(location);
      if (wasHit) {
        this.grid[row][col] = GAME_CONFIG.SYMBOLS.HIT;
        return { hit: true, sunk: targetShip.isSunk(), alreadyGuessed: false };
      }
    }
    
    this.grid[row][col] = GAME_CONFIG.SYMBOLS.MISS;
    return { hit: false, sunk: false, alreadyGuessed: false };
  }

  /**
   * Checks if there are ships remaining afloat
   * @returns {boolean} - true if there are ships afloat
   */
  hasShipsRemaining() {
    return this.ships.some(ship => !ship.isSunk());
  }

  /**
   * Gets the number of remaining ships
   * @returns {number} - Number of ships afloat
   */
  getRemainingShipsCount() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Gets the display symbol for the specified position
   * @param {number} row - Row
   * @param {number} col - Column
   * @returns {string} - Symbol to display
   */
  getDisplaySymbol(row, col) {
    return this.grid[row][col];
  }

  /**
   * Checks if there was an attempt at the specified position
   * @param {number} row - Row
   * @param {number} col - Column
   * @returns {boolean} - true if there was an attempt
   */
  hasGuessed(row, col) {
    const location = coordinatesToString(row, col);
    return this.guesses.has(location);
  }
} 