import { Cell } from './Cell.js';

/**
 * Manages the 2D grid of cells for Conway's Game of Life
 */
export class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cells = this.createEmptyGrid();
    }

    /**
     * Create an empty grid filled with dead cells
     */
    createEmptyGrid() {
        const grid = [];
        for (let y = 0; y < this.height; y++) {
            grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                grid[y][x] = new Cell(false);
            }
        }
        return grid;
    }

    /**
     * Get the cell at the specified coordinates
     */
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.cells[y][x];
    }

    /**
     * Set the state of a cell at the specified coordinates
     */
    setCellState(x, y, alive) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.setState(alive);
        }
    }

    /**
     * Toggle the state of a cell at the specified coordinates
     */
    toggleCell(x, y) {
        const cell = this.getCell(x, y);
        if (cell) {
            cell.toggle();
        }
    }

    /**
     * Get the number of living neighbors for a cell at the given coordinates
     */
    getLivingNeighborCount(x, y) {
        let count = 0;
        
        // Check all 8 neighboring positions
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                // Skip the center cell (the cell itself)
                if (dx === 0 && dy === 0) continue;
                
                const neighbor = this.getCell(x + dx, y + dy);
                if (neighbor && neighbor.alive) {
                    count++;
                }
            }
        }
        
        return count;
    }

    /**
     * Get all cells in the grid
     */
    getAllCells() {
        return this.cells;
    }

    /**
     * Get grid dimensions
     */
    getDimensions() {
        return { width: this.width, height: this.height };
    }

    /**
     * Clear the entire grid (set all cells to dead)
     */
    clear() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.cells[y][x].reset();
            }
        }
    }

    /**
     * Randomize the grid with a given probability of life
     */
    randomize(probability = 0.3) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const alive = Math.random() < probability;
                this.cells[y][x].setState(alive);
            }
        }
    }

    /**
     * Get the current population count (number of living cells)
     */
    getPopulation() {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cells[y][x].alive) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Resize the grid (preserving existing cells where possible)
     */
    resize(newWidth, newHeight) {
        const oldCells = this.cells;
        const oldWidth = this.width;
        const oldHeight = this.height;

        this.width = newWidth;
        this.height = newHeight;
        this.cells = this.createEmptyGrid();

        // Copy over existing cells that fit in the new dimensions
        const copyWidth = Math.min(oldWidth, newWidth);
        const copyHeight = Math.min(oldHeight, newHeight);

        for (let y = 0; y < copyHeight; y++) {
            for (let x = 0; x < copyWidth; x++) {
                this.cells[y][x] = oldCells[y][x].clone();
            }
        }
    }

    /**
     * Load a pattern into the grid at the specified position
     */
    loadPattern(pattern, startX, startY) {
        for (let y = 0; y < pattern.length; y++) {
            for (let x = 0; x < pattern[y].length; x++) {
                const gridX = startX + x;
                const gridY = startY + y;
                
                if (gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height) {
                    this.setCellState(gridX, gridY, pattern[y][x]);
                }
            }
        }
    }

    /**
     * Get a sub-region of the grid as a 2D boolean array
     */
    getRegion(startX, startY, width, height) {
        const region = [];
        
        for (let y = 0; y < height; y++) {
            region[y] = [];
            for (let x = 0; x < width; x++) {
                const cell = this.getCell(startX + x, startY + y);
                region[y][x] = cell ? cell.alive : false;
            }
        }
        
        return region;
    }

    /**
     * Check if the grid is empty (no living cells)
     */
    isEmpty() {
        return this.getPopulation() === 0;
    }

    /**
     * Create a copy of the current grid
     */
    clone() {
        const newGrid = new Grid(this.width, this.height);
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newGrid.cells[y][x] = this.cells[y][x].clone();
            }
        }
        
        return newGrid;
    }
}