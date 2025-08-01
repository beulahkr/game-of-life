/**
 * Represents a single cell in Conway's Game of Life
 */
export class Cell {
    constructor(alive = false) {
        this._alive = alive;
        this._age = alive ? 1 : 0;
        this._nextState = false;
    }

    /**
     * Get the current alive state of the cell
     */
    get alive() {
        return this._alive;
    }

    /**
     * Get the age of the cell (how long it has been alive)
     */
    get age() {
        return this._age;
    }

    /**
     * Get the next state that will be applied in the next generation
     */
    get nextState() {
        return this._nextState;
    }

    /**
     * Set the next state for this cell
     */
    setNextState(alive) {
        this._nextState = alive;
    }

    /**
     * Apply the next state to the current state
     * This should be called during the generation update
     */
    update() {
        const wasAlive = this._alive;
        this._alive = this._nextState;

        if (this._alive) {
            if (wasAlive) {
                this._age++;
            } else {
                this._age = 1; // New birth
            }
        } else {
            this._age = 0; // Dead cell has no age
        }
    }

    /**
     * Set the cell state directly (for initialization or user interaction)
     */
    setState(alive) {
        this._alive = alive;
        this._nextState = alive;
        this._age = alive ? 1 : 0;
    }

    /**
     * Toggle the current state of the cell
     */
    toggle() {
        this.setState(!this._alive);
    }

    /**
     * Reset the cell to dead state
     */
    reset() {
        this._alive = false;
        this._nextState = false;
        this._age = 0;
    }

    /**
     * Get a normalized age value (0-1) for visual effects
     * Caps at age 100 for practical purposes
     */
    getNormalizedAge() {
        return Math.min(this._age / 100, 1);
    }

    /**
     * Check if the cell just became alive this generation
     */
    isNewborn() {
        return this._alive && this._age === 1;
    }

    /**
     * Check if the cell is considered "mature" (lived for a while)
     */
    isMature() {
        return this._alive && this._age >= 10;
    }

    /**
     * Clone this cell
     */
    clone() {
        const cell = new Cell(this._alive);
        cell._age = this._age;
        cell._nextState = this._nextState;
        return cell;
    }
}