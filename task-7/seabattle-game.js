/**
 * Main game class for "Sea Battle"
 */

import { Board } from './board.js';
import { AiPlayer } from './ai-player.js';
import { GameUI } from './game-ui.js';
import { 
  GAME_CONFIG, 
  parseCoordinates, 
  isValidCoordinate 
} from './utils.js';

/**
 * Game state enumeration
 */
const GAME_STATES = {
  INITIALIZING: 'initializing',
  PLAYER_TURN: 'player_turn',
  AI_TURN: 'ai_turn',
  GAME_OVER: 'game_over'
};

/**
 * Main game class
 */
export class SeaBattleGame {
  constructor() {
    this.playerBoard = null;
    this.opponentBoard = null;
    this.aiPlayer = null;
    this.ui = null;
    this.gameState = GAME_STATES.INITIALIZING;
  }

  /**
   * Initializes the game
   */
  async initialize() {
    this.ui = new GameUI();
    await this.ui.initializeReadline();
    
    // Create game boards
    this.playerBoard = new Board(GAME_CONFIG.BOARD_SIZE, true); // Show player ships
    this.opponentBoard = new Board(GAME_CONFIG.BOARD_SIZE, false); // Hide opponent ships
    
    // Create AI
    this.aiPlayer = new AiPlayer(GAME_CONFIG.BOARD_SIZE);
    
    // Place ships
    const playerShipsPlaced = this.playerBoard.placeShipsRandomly(
      GAME_CONFIG.NUM_SHIPS, 
      GAME_CONFIG.SHIP_LENGTH
    );
    
    const opponentShipsPlaced = this.opponentBoard.placeShipsRandomly(
      GAME_CONFIG.NUM_SHIPS, 
      GAME_CONFIG.SHIP_LENGTH
    );
    
    if (!playerShipsPlaced || !opponentShipsPlaced) {
      throw new Error('Failed to place ships on the board');
    }
    
    this.gameState = GAME_STATES.PLAYER_TURN;
    
    this.ui.displayWelcome();
    this.ui.displayMessage('Ships placed! Game starting!');
  }

  /**
   * Starts the main game loop
   */
  async startGame() {
    await this.initialize();
    
    while (this.gameState !== GAME_STATES.GAME_OVER) {
      this.ui.displayBoards(this.playerBoard, this.opponentBoard);
      
      if (this.gameState === GAME_STATES.PLAYER_TURN) {
        await this.handlePlayerTurn();
      } else if (this.gameState === GAME_STATES.AI_TURN) {
        await this.handleAiTurn();
      }
      
      this.checkGameEnd();
    }
    
    this.endGame();
  }

  /**
   * Handles player turn
   */
  async handlePlayerTurn() {
    let validMove = false;
    
    while (!validMove) {
      try {
        const input = await this.ui.getPlayerMove();
        const move = this.validatePlayerInput(input);
        
        const result = this.opponentBoard.processShot(move.row, move.col);
        this.ui.displayShotResult(result, true);
        
        if (!result.alreadyGuessed) {
          validMove = true;
          
          // Switch to AI turn only if game is not over
          if (this.opponentBoard.hasShipsRemaining()) {
            this.gameState = GAME_STATES.AI_TURN;
          }
        }
        
      } catch (error) {
        this.ui.displayValidationError(error.message);
      }
    }
  }

  /**
   * Handles AI turn
   */
  async handleAiTurn() {
    this.ui.displayMessage("\n--- Opponent's Turn ---");
    
    const move = this.aiPlayer.makeMove();
    const result = this.playerBoard.processShot(move.row, move.col);
    
    this.ui.displayMessage(`Opponent shoots at position ${move.row}${move.col}`);
    this.ui.displayShotResult(result, false);
    
    // Process result for AI
    this.aiPlayer.processResult(move.row, move.col, result.hit, result.sunk);
    
    // Switch to player turn if game is not over
    if (this.playerBoard.hasShipsRemaining()) {
      this.gameState = GAME_STATES.PLAYER_TURN;
    }
  }

  /**
   * Validates player input
   */
  validatePlayerInput(input) {
    if (!input || input.trim().length === 0) {
      throw new Error('Empty input');
    }
    
    const trimmedInput = input.trim();
    const coordinates = parseCoordinates(trimmedInput);
    
    if (!isValidCoordinate(coordinates.row, coordinates.col, GAME_CONFIG.BOARD_SIZE)) {
      throw new Error(
        `Coordinates must be in range 0-${GAME_CONFIG.BOARD_SIZE - 1}`
      );
    }
    
    return coordinates;
  }

  /**
   * Checks for game end
   */
  checkGameEnd() {
    if (!this.playerBoard.hasShipsRemaining() || 
        !this.opponentBoard.hasShipsRemaining()) {
      this.gameState = GAME_STATES.GAME_OVER;
    }
  }

  /**
   * Ends the game
   */
  endGame() {
    this.ui.displayBoards(this.playerBoard, this.opponentBoard);
    
    const playerWon = this.opponentBoard.hasShipsRemaining() === false;
    this.ui.displayVictory(playerWon);
    
    this.ui.close();
  }

  /**
   * Gets game statistics
   */
  getGameStats() {
    return {
      playerShipsRemaining: this.playerBoard.getRemainingShipsCount(),
      opponentShipsRemaining: this.opponentBoard.getRemainingShipsCount(),
      aiStats: this.aiPlayer.getStats(),
      gameState: this.gameState
    };
  }
} 