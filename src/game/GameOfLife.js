import { Grid } from './Grid.js';

/**
 * Main game engine for Conway's Game of Life
 */
export class GameOfLife {
    constructor(width, height) {
        this.grid = new Grid(width, height);
        this.generation = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.updateSpeed = 100; // milliseconds between updates
        this.onUpdate = null;
        this.onStateChange = null;
        this.audioSystem = null;
        this.cellStateChanges = { births: [], deaths: [] };
    }

    /**
     * Apply Conway's Game of Life rules for the next generation
     */
    applyRules() {
        const { width, height } = this.grid.getDimensions();

        // Calculate next state for all cells
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = this.grid.getCell(x, y);
                if (!cell) continue;

                const neighborCount = this.grid.getLivingNeighborCount(x, y);
                const isAlive = cell.alive;

                // Conway's Game of Life rules:
                let nextState = false;

                if (isAlive) {
                    // Living cell with 2 or 3 neighbors survives
                    nextState = neighborCount === 2 || neighborCount === 3;
                } else {
                    // Dead cell with exactly 3 neighbors becomes alive
                    nextState = neighborCount === 3;
                }

                cell.setNextState(nextState);
            }
        }

        // Clear previous state changes
        this.cellStateChanges = { births: [], deaths: [] };

        // Apply the next state to all cells and track changes
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = this.grid.getCell(x, y);
                if (cell) {
                    const wasAlive = cell.alive;
                    cell.update();
                    const isAlive = cell.alive;
                    
                    // Track state changes for audio
                    if (!wasAlive && isAlive) {
                        this.cellStateChanges.births.push({ x, y });
                    } else if (wasAlive && !isAlive) {
                        this.cellStateChanges.deaths.push({ x, y });
                    }
                }
            }
        }

        // Play audio for state changes
        if (this.audioSystem) {
            this.playAudioForChanges();
        }

        this.generation++;
    }

    /**
     * Advance to the next generation
     */
    step() {
        this.applyRules();
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Start the automatic simulation
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.step();
        }, this.updateSpeed);

        if (this.onStateChange) this.onStateChange(true);
    }

    /**
     * Stop the automatic simulation
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.onStateChange) this.onStateChange(false);
    }

    /**
     * Toggle the simulation state (start/stop)
     */
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Reset the game to initial state
     */
    reset() {
        this.stop();
        this.grid.clear();
        this.generation = 0;
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Randomize the grid with living cells
     */
    randomize(probability = 0.3) {
        this.stop();
        this.grid.randomize(probability);
        this.generation = 0;
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Set the simulation speed (milliseconds between generations)
     */
    setSpeed(speed) {
        this.updateSpeed = Math.max(1, speed);
        
        // If running, restart with new speed
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    /**
     * Get the simulation speed in generations per second
     */
    getSpeedAsFPS() {
        return Math.round(1000 / this.updateSpeed);
    }

    /**
     * Set speed as frames per second
     */
    setSpeedAsFPS(fps) {
        const speed = Math.round(1000 / Math.max(1, fps));
        this.setSpeed(speed);
    }

    /**
     * Get the current grid
     */
    getGrid() {
        return this.grid;
    }

    /**
     * Get the current generation number
     */
    getGeneration() {
        return this.generation;
    }

    /**
     * Get the current population count
     */
    getPopulation() {
        return this.grid.getPopulation();
    }

    /**
     * Check if the simulation is currently running
     */
    getIsRunning() {
        return this.isRunning;
    }

    /**
     * Resize the grid
     */
    resizeGrid(width, height) {
        const wasRunning = this.isRunning;
        this.stop();
        
        this.grid.resize(width, height);
        if (this.onUpdate) this.onUpdate();
        
        if (wasRunning) {
            this.start();
        }
    }

    /**
     * Load a predefined pattern into the grid
     */
    loadPattern(pattern, centerX, centerY) {
        const { width, height } = this.grid.getDimensions();
        
        // Default to center of grid
        const startX = centerX !== undefined ? 
            centerX - Math.floor(pattern[0].length / 2) : 
            Math.floor((width - pattern[0].length) / 2);
        const startY = centerY !== undefined ? 
            centerY - Math.floor(pattern.length / 2) : 
            Math.floor((height - pattern.length) / 2);

        this.grid.loadPattern(pattern, startX, startY);
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Toggle a cell at the given coordinates
     */
    toggleCell(x, y) {
        this.grid.toggleCell(x, y);
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Set a cell state at the given coordinates
     */
    setCellState(x, y, alive) {
        this.grid.setCellState(x, y, alive);
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Set callback for when the game state updates
     */
    setOnUpdateCallback(callback) {
        this.onUpdate = callback;
    }

    /**
     * Set callback for when the running state changes
     */
    setOnStateChangeCallback(callback) {
        this.onStateChange = callback;
    }

    /**
     * Check if the grid is empty
     */
    isEmpty() {
        return this.grid.isEmpty();
    }

    /**
     * Get grid dimensions
     */
    getGridDimensions() {
        return this.grid.getDimensions();
    }

    /**
     * Set audio system for musical feedback
     */
    setAudioSystem(audioSystem) {
        this.audioSystem = audioSystem;
    }

    /**
     * Play audio for cell state changes
     */
    playAudioForChanges() {
        const { births } = this.cellStateChanges;
        
        // Only play sounds for births (cells coming alive)
        if (births.length > 0) {
            if (births.length === 1) {
                // Single cell birth - play individual note
                this.audioSystem.playCellSound(births[0].x, births[0].y, 'birth');
            } else if (births.length <= 8) {
                // Multiple births - play as arpeggio
                this.audioSystem.playArpeggio(births, 'up');
            } else {
                // Many births - play random selection as arpeggio
                const selectedBirths = this.selectRandomCells(births, 8);
                this.audioSystem.playArpeggio(selectedBirths, 'up');
            }
        }
        
        // No sounds for deaths - silence for cell deaths
    }

    /**
     * Select random cells from array
     */
    selectRandomCells(cells, count) {
        const shuffled = [...cells].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Manually trigger cell sound for user interaction
     */
    playCellSound(x, y) {
        if (this.audioSystem) {
            this.audioSystem.playCellSound(x, y, 'birth');
        }
    }
}