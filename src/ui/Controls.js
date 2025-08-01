/**
 * Manages the user interface controls for the Game of Life
 */
export class Controls {
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;
        
        // Get UI elements
        this.playPauseBtn = this.getElement('playPauseBtn');
        this.resetBtn = this.getElement('resetBtn');
        this.randomBtn = this.getElement('randomBtn');
        this.speedSlider = this.getElement('speedSlider');
        this.speedDisplay = this.getElement('speedDisplay');
        this.patternSelect = this.getElement('patternSelect');
        this.loadPatternBtn = this.getElement('loadPatternBtn');
        this.generationCount = this.getElement('generationCount');
        this.populationCount = this.getElement('populationCount');
        this.volumeSlider = this.getElement('volumeSlider');
        this.volumeDisplay = this.getElement('volumeDisplay');

        this.setupEventListeners();
        this.setupGameCallbacks();
        this.updateUI();
    }

    /**
     * Get DOM element by ID with error checking
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return element;
    }

    /**
     * Setup event listeners for all UI controls
     */
    setupEventListeners() {
        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => {
            this.game.toggle();
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.game.reset();
        });

        // Random button
        this.randomBtn.addEventListener('click', () => {
            this.game.randomize(0.3);
        });

        // Speed slider
        this.speedSlider.addEventListener('input', () => {
            const fps = parseInt(this.speedSlider.value);
            this.game.setSpeedAsFPS(fps);
            this.updateSpeedDisplay(fps);
        });

        // Grid size is now fixed at 30x30 for Jankó layout - no slider needed

        // Set fixed color scheme to monochrome (Classic Mac)
        this.renderer.setColorScheme('monochrome');

        // Pattern loader
        this.loadPatternBtn.addEventListener('click', () => {
            const patternName = this.patternSelect.value;
            if (patternName) {
                this.loadPattern(patternName);
            }
        });

        // Volume control
        this.volumeSlider.addEventListener('input', () => {
            const volume = parseInt(this.volumeSlider.value) / 100;
            this.setVolume(volume);
            this.updateVolumeDisplay(parseInt(this.volumeSlider.value));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    /**
     * Setup callbacks for game state changes
     */
    setupGameCallbacks() {
        this.game.setOnUpdateCallback(() => {
            this.updateUI();
        });

        this.game.setOnStateChangeCallback((isRunning) => {
            this.updatePlayPauseButton(isRunning);
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.game.toggle();
                break;
            case 'KeyR':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.game.reset();
                }
                break;
            case 'KeyS':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.game.step();
                }
                break;
            case 'KeyG':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.game.randomize();
                }
                break;
        }
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateCounters();
        this.updatePlayPauseButton(this.game.getIsRunning());
    }

    /**
     * Update generation and population counters
     */
    updateCounters() {
        this.generationCount.textContent = this.game.getGeneration().toString();
        this.populationCount.textContent = this.game.getPopulation().toString();
    }

    /**
     * Update play/pause button text and state
     */
    updatePlayPauseButton(isRunning) {
        // Update the text content of the span inside the button
        const textSpan = this.playPauseBtn.querySelector('.glass-text');
        if (textSpan) {
            textSpan.textContent = isRunning ? 'Pause' : 'Play';
        } else {
            // Fallback if span doesn't exist
            this.playPauseBtn.textContent = isRunning ? 'Pause' : 'Play';
        }
        
        // Keep the original styling classes and optionally add state
        this.playPauseBtn.className = `liquid-glass ${isRunning ? 'running' : 'paused'}`;
    }

    /**
     * Update speed display
     */
    updateSpeedDisplay(fps) {
        this.speedDisplay.textContent = `${fps} fps`;
    }

    // Grid size is fixed at 30x30 for Jankó keyboard layout

    /**
     * Load a predefined pattern
     */
    loadPattern(patternName) {
        const patterns = this.getPatterns();
        const pattern = patterns[patternName];
        
        if (pattern) {
            this.game.reset();
            this.game.loadPattern(pattern);
        }
    }

    /**
     * Get predefined patterns
     */
    getPatterns() {
        return {
            glider: [
                [false, true, false],
                [false, false, true],
                [true, true, true]
            ],
            blinker: [
                [true, true, true]
            ],
            toad: [
                [false, true, true, true],
                [true, true, true, false]
            ],
            beacon: [
                [true, true, false, false],
                [true, true, false, false],
                [false, false, true, true],
                [false, false, true, true]
            ],
            pulsar: [
                [false, false, true, true, true, false, false, false, true, true, true, false, false],
                [false, false, false, false, false, false, false, false, false, false, false, false, false],
                [true, false, false, false, false, true, false, true, false, false, false, false, true],
                [true, false, false, false, false, true, false, true, false, false, false, false, true],
                [true, false, false, false, false, true, false, true, false, false, false, false, true],
                [false, false, true, true, true, false, false, false, true, true, true, false, false],
                [false, false, false, false, false, false, false, false, false, false, false, false, false],
                [false, false, true, true, true, false, false, false, true, true, true, false, false],
                [true, false, false, false, false, true, false, true, false, false, false, false, true],
                [true, false, false, false, false, true, false, true, false, false, false, false, true],
                [true, false, false, false, false, true, false, true, false, false, false, false, true],
                [false, false, false, false, false, false, false, false, false, false, false, false, false],
                [false, false, true, true, true, false, false, false, true, true, true, false, false]
            ],
            pentadecathlon: [
                [true, true, true, true, true, true, true, true, true, true]
            ]
        };
    }



    /**
     * Get current settings for external use
     */
    getSettings() {
        return {
            speed: parseInt(this.speedSlider.value),
            gridSize: 30 // Fixed for Jankó layout
        };
    }

    /**
     * Apply settings from external source
     */
    applySettings(settings) {
        if (settings.speed) {
            this.speedSlider.value = settings.speed.toString();
            this.game.setSpeedAsFPS(settings.speed);
            this.updateSpeedDisplay(settings.speed);
        }

        // Grid size is fixed at 30x30 for Jankó layout
        if (settings.gridSize && settings.gridSize !== 30) {
            console.warn('Grid size is fixed at 30x30 for musical Jankó layout');
        }


    }

    /**
     * Enable/disable controls
     */
    setEnabled(enabled) {
        const controls = [
            this.playPauseBtn,
            this.resetBtn,
            this.randomBtn,
            this.speedSlider,
            this.patternSelect,
            this.loadPatternBtn
        ];

        controls.forEach(control => {
            control.disabled = !enabled;
        });
    }

    /**
     * Set audio volume
     */
    setVolume(volume) {
        const audioSystem = this.game.audioSystem;
        if (audioSystem) {
            audioSystem.setVolume(volume);
        }
    }

    /**
     * Update volume display
     */
    updateVolumeDisplay(volume) {
        this.volumeDisplay.textContent = `${volume}%`;
    }
}