import { GameOfLife } from './game/GameOfLife.js';
import { Renderer } from './rendering/Renderer.js';
import { Controls } from './ui/Controls.js';
import { AudioSystem } from './audio/AudioSystem.js';

/**
 * Main application entry point
 */
class GameOfLifeApp {
    constructor() {
        this.isMouseDown = false;
        this.lastMousePos = null;
        
        this.initializeCanvas();
        this.initializeGame();
        this.initializeRenderer();
        this.initializeAudio();
        this.initializeControls();
        this.setupCanvasInteraction();
        this.setupWindowEvents();
        this.startApplication();
    }

    /**
     * Initialize the canvas element
     */
    initializeCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Set initial canvas size with proper high-DPI handling
        this.resizeCanvas();
        
        // Ensure canvas is ready for high-quality rendering
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }
    }

    /**
     * Initialize the game logic
     */
    initializeGame() {
        // Fixed 30x30 grid size for Jankó keyboard layout
        this.game = new GameOfLife(30, 30);
    }

    /**
     * Initialize the renderer
     */
    initializeRenderer() {
        this.renderer = new Renderer(this.canvas);
        
        // Start the render loop
        this.renderer.startRenderLoop(() => this.game.getGrid());
    }

    /**
     * Initialize the audio system
     */
    initializeAudio() {
        this.audioSystem = new AudioSystem();
        this.game.setAudioSystem(this.audioSystem);
    }

    /**
     * Initialize the UI controls
     */
    initializeControls() {
        this.controls = new Controls(this.game, this.renderer);
    }

    /**
     * Setup canvas mouse/touch interaction
     */
    setupCanvasInteraction() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.handleCanvasClick(e.offsetX, e.offsetY);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.handleCanvasClick(e.offsetX, e.offsetY);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.lastMousePos = null;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
            this.lastMousePos = null;
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.isMouseDown = true;
            this.handleCanvasClick(x, y);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isMouseDown) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.handleCanvasClick(x, y);
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isMouseDown = false;
            this.lastMousePos = null;
        });
    }

    /**
     * Handle canvas click/touch to toggle cells
     */
    handleCanvasClick(x, y) {
        const gridPos = this.renderer.canvasToGrid(x, y, this.game.getGrid());
        
        if (gridPos) {
            // For drawing, we want to set cells to alive when dragging
            // Only toggle if this is a new position
            if (!this.lastMousePos || 
                this.lastMousePos.x !== gridPos.x || 
                this.lastMousePos.y !== gridPos.y) {
                
                this.game.setCellState(gridPos.x, gridPos.y, true);
                
                // Play sound for user interaction
                this.game.playCellSound(gridPos.x, gridPos.y);
                
                // Resume audio context on first interaction
                this.audioSystem.resumeAudio();
                
                this.lastMousePos = gridPos;
            }
        }
    }

    /**
     * Setup window events (resize, etc.)
     */
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Handle page visibility changes (pause when hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Optionally pause the game when tab is not visible
                // this.game.stop();
            } else {
                // Optionally resume the game when tab becomes visible
                // this.game.start();
            }
        });
    }

    /**
     * Resize canvas to fill container with high-DPI support
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;

        // Get container dimensions accounting for border and padding
        const containerStyle = window.getComputedStyle(container);
        const containerRect = container.getBoundingClientRect();
        
        // Account for border and padding
        const borderWidth = parseInt(containerStyle.borderLeftWidth) + parseInt(containerStyle.borderRightWidth);
        const borderHeight = parseInt(containerStyle.borderTopWidth) + parseInt(containerStyle.borderBottomWidth);
        const paddingWidth = parseInt(containerStyle.paddingLeft) + parseInt(containerStyle.paddingRight);
        const paddingHeight = parseInt(containerStyle.paddingTop) + parseInt(containerStyle.paddingBottom);
        
        // Calculate full available space minus border and padding
        const availableWidth = containerRect.width - borderWidth - paddingWidth;
        const availableHeight = containerRect.height - borderHeight - paddingHeight;
        
        // Use the full available space
        const width = Math.max(availableWidth, 200); // Minimum width
        const height = Math.max(availableHeight, 200); // Minimum height
        
        // Get device pixel ratio for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        // Only resize renderer if it exists
        if (this.renderer) {
            this.renderer.resize(width, height, dpr);
        } else {
            // Set canvas size directly with high-DPI support
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            
            // Scale context for high-DPI
            const ctx = this.canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        }
    }

    /**
     * Start the application
     */
    startApplication() {
        console.log('Enhanced Game of Life - Application Started');
        
        // Load a simple pattern to start with
        this.game.loadPattern([
            [false, true, false],
            [false, false, true],
            [true, true, true]
        ]);

        // Apply any saved settings
        this.loadSettings();
        
        // Show some helpful instructions
        this.showInstructions();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('gameOfLifeSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.controls.applySettings(settings);
            }
        } catch (e) {
            console.warn('Could not load saved settings:', e);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            const settings = this.controls.getSettings();
            localStorage.setItem('gameOfLifeSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    /**
     * Show helpful instructions
     */
    showInstructions() {
        // Check if instructions have been shown before
        const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');
        
        if (!hasSeenInstructions) {
            setTimeout(() => {
                alert(`Welcome to Enhanced Game of Life!
                
Key controls:
• Space: Play/Pause
• Click/drag on grid: Add cells
• Try different color schemes and patterns
• Adjust speed and grid size

Have fun exploring Conway's cellular automaton!`);
                
                localStorage.setItem('hasSeenInstructions', 'true');
            }, 1000);
        }
    }

    /**
     * Cleanup when application is destroyed
     */
    destroy() {
        this.renderer.stopRenderLoop();
        this.game.stop();
        this.saveSettings();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new GameOfLifeApp();
        
        // Save settings on page unload
        window.addEventListener('beforeunload', () => {
            app.destroy();
        });
        
        // Make app globally available for debugging
        window.gameOfLifeApp = app;
        
    } catch (error) {
        console.error('Failed to initialize Game of Life application:', error);
        
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            z-index: 1000;
        `;
        errorDiv.textContent = 'Failed to load Game of Life. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});