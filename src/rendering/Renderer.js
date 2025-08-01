import { ColorManager } from './ColorManager.js';
import { ThermalFieldRenderer } from './ThermalFieldRenderer.js';

/**
 * Handles rendering the Game of Life grid to a canvas
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = ctx;
        this.colorManager = new ColorManager();
        this.thermalRenderer = new ThermalFieldRenderer();
        this.animationFrame = null;
        this.performanceMode = 'optimized';
        this.lastFrameTime = 0;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.displayWidth = canvas.width;
        this.displayHeight = canvas.height;
        
        this.settings = {
            cellSize: 10,
            smoothAnimations: true
        };

        // Animation state

        // Disable smooth rendering for pixel-perfect look
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingQuality = 'low';
    }

    /**
     * Render the grid to the canvas
     */
    render(grid, currentTime = performance.now()) {
        // Performance optimization: Skip frames if falling behind
        if (currentTime - this.lastFrameTime < 33.33) { // Cap at ~30 FPS for thermal mode
            return;
        }
        
        // Update frame timing
        this.lastFrameTime = currentTime;

        this.clearCanvas();
        
        const { width, height } = grid.getDimensions();
        const cellSize = this.calculateCellSize(width, height);
        
        // Calculate grid to fill maximum available space
        const gridWidth = width * cellSize;
        const gridHeight = height * cellSize;
        
        // Start from 0,0 to maximize canvas usage, center any minimal remaining space
        const offsetX = (this.displayWidth - gridWidth) / 2;
        const offsetY = (this.displayHeight - gridHeight) / 2;

        // Draw background 
        this.drawBackground();
        
        // Draw grid lines for pixel-perfect look
        this.drawGrid(width, height, cellSize, offsetX, offsetY);
        
        // Draw cells in pixel art style
        this.drawPixelArtCells(grid, cellSize, offsetX, offsetY);
    }

    /**
     * Start the render loop
     */
    startRenderLoop(getGrid) {
        const renderFrame = (currentTime) => {
            this.render(getGrid(), currentTime);
            this.animationFrame = requestAnimationFrame(renderFrame);
        };
        
        this.animationFrame = requestAnimationFrame(renderFrame);
    }

    /**
     * Stop the render loop
     */
    stopRenderLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Clear the entire canvas
     */
    clearCanvas() {
        this.ctx.fillStyle = this.colorManager.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
    }

    /**
     * Draw the background with subtle patterns
     */
    drawBackground() {
        // Add subtle gradient or texture for depth
        if (this.settings.frostedGlass) {
            const gradient = this.ctx.createRadialGradient(
                this.displayWidth / 2, this.displayHeight / 2, 0,
                this.displayWidth / 2, this.displayHeight / 2, Math.max(this.displayWidth, this.displayHeight) / 2
            );
            gradient.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
            gradient.addColorStop(1, 'rgba(5, 5, 5, 1)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);
        }
    }

    /**
     * Calculate optimal cell size based on grid dimensions and canvas size
     * Grid will fill the entire canvas with no padding
     */
    calculateCellSize(gridWidth, gridHeight) {
        const cellWidth = this.displayWidth / gridWidth;
        const cellHeight = this.displayHeight / gridHeight;
        return Math.min(cellWidth, cellHeight); // Use the smaller dimension to fit perfectly
    }

    /**
     * Draw pixel-perfect grid lines
     */
    drawGrid(gridWidth, gridHeight, cellSize, offsetX, offsetY) {
        this.ctx.strokeStyle = this.colorManager.getGridColor();
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;

        this.ctx.beginPath();
        
        // Vertical lines
        for (let x = 0; x <= gridWidth; x++) {
            const lineX = Math.floor(offsetX + x * cellSize) + 0.5;
            this.ctx.moveTo(lineX, Math.floor(offsetY));
            this.ctx.lineTo(lineX, Math.floor(offsetY + gridHeight * cellSize));
        }
        
        // Horizontal lines
        for (let y = 0; y <= gridHeight; y++) {
            const lineY = Math.floor(offsetY + y * cellSize) + 0.5;
            this.ctx.moveTo(Math.floor(offsetX), lineY);
            this.ctx.lineTo(Math.floor(offsetX + gridWidth * cellSize), lineY);
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw cells in pixel art style - crisp rectangular blocks
     */
    drawPixelArtCells(grid, cellSize, offsetX, offsetY) {
        const { width, height } = grid.getDimensions();
        const cells = grid.getAllCells();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = cells[y][x];
                if (!cell.alive) continue;

                const cellX = Math.floor(offsetX + x * cellSize);
                const cellY = Math.floor(offsetY + y * cellSize);
                const size = Math.floor(cellSize - 1); // Leave 1px for grid lines
                
                // Get color based on cell age
                this.ctx.fillStyle = this.colorManager.getCellColor(cell.age, true);
                
                // Draw pixel-perfect rectangle
                this.ctx.fillRect(cellX + 1, cellY + 1, size - 1, size - 1);
                
                // Add slight highlight for 3D effect (classic Mac style)
                if (cellSize >= 8) {
                    this.ctx.fillStyle = this.addBrightness(this.ctx.fillStyle, 0.3);
                    this.ctx.fillRect(cellX + 1, cellY + 1, size - 1, 1); // Top edge
                    this.ctx.fillRect(cellX + 1, cellY + 1, 1, size - 1); // Left edge
                }
            }
        }
    }

    /**
     * Add brightness to a color for highlight effect
     */
    addBrightness(color, amount) {
        // Simple brightness increase for monochrome themes
        if (color.includes('#00FF41') || color.includes('rgb(0, 255, 65)')) {
            return '#66FF66'; // Brighter green
        }
        if (color.includes('#000000') || color.includes('rgb(0, 0, 0)')) {
            return '#333333'; // Lighter black
        }
        if (color.includes('#FFFFFF') || color.includes('rgb(255, 255, 255)')) {
            return '#FFFFFF'; // White stays white
        }
        return color;
    }

    /**
     * Draw cells in basic square mode
     */
    drawBasicCells(grid, cellSize, offsetX, offsetY) {
        const { width, height } = grid.getDimensions();
        const cells = grid.getAllCells();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = cells[y][x];
                if (!cell.alive) continue;

                const cellX = offsetX + x * cellSize;
                const cellY = offsetY + y * cellSize;
                
                this.drawCell(cell, cellX, cellY, cellSize);
            }
        }
    }

    /**
     * Draw cells in liquid mode (more organic shapes)
     */
    drawLiquidCells(grid, cellSize, offsetX, offsetY) {
        const { width, height } = grid.getDimensions();
        const cells = grid.getAllCells();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = cells[y][x];
                if (!cell.alive) continue;

                const cellX = offsetX + x * cellSize;
                const cellY = offsetY + y * cellSize;
                
                this.drawLiquidCell(cell, cellX, cellY, cellSize, grid, x, y);
            }
        }
    }

    /**
     * Draw a single cell
     */
    drawCell(cell, x, y, size) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size * 0.4;

        // Create gradient if enabled
        if (this.settings.glowEffect) {
            this.ctx.fillStyle = this.colorManager.createCellGradient(
                this.ctx, centerX, centerY, radius, cell.age
            );
        } else {
            this.ctx.fillStyle = this.colorManager.getCellColor(cell.age, true);
        }

        // Draw cell as circle for smoother appearance
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Add glow effect for newborn cells
        if (cell.isNewborn() && this.settings.glowEffect) {
            this.drawGlowEffect(centerX, centerY, radius * 1.5, cell.age);
        }
    }

    /**
     * Draw a cell in liquid mode with organic shape
     */
    drawLiquidCell(cell, x, y, size, grid, gridX, gridY) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        
        // Check neighboring cells to create organic connections
        const neighbors = this.getNeighborConnections(grid, gridX, gridY);
        
        if (neighbors.length === 0) {
            // Single cell - draw as circle
            this.drawCell(cell, x, y, size);
            return;
        }

        // Create organic blob shape based on neighbors
        this.drawOrganicBlob(cell, centerX, centerY, size * 0.4, neighbors);
    }

    /**
     * Get neighboring cells that are alive
     */
    getNeighborConnections(grid, x, y) {
        const connections = [];
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const neighbor = grid.getCell(x + dx, y + dy);
                if (neighbor && neighbor.alive) {
                    connections.push({ dx, dy });
                }
            }
        }
        
        return connections;
    }

    /**
     * Draw an organic blob shape
     */
    drawOrganicBlob(cell, centerX, centerY, radius, neighbors) {
        this.ctx.fillStyle = this.colorManager.getCellColor(cell.age, true);
        
        this.ctx.beginPath();
        
        const points = 8;
        let firstPoint = true;
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            let pointRadius = radius;
            
            // Extend towards neighbors
            for (const neighbor of neighbors) {
                const neighborAngle = Math.atan2(neighbor.dy, neighbor.dx);
                const angleDiff = Math.abs(angle - neighborAngle);
                const minAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
                
                if (minAngleDiff < Math.PI / 4) {
                    pointRadius *= 1.3; // Extend towards neighbor
                }
            }
            
            const x = centerX + Math.cos(angle) * pointRadius;
            const y = centerY + Math.sin(angle) * pointRadius;
            
            if (firstPoint) {
                this.ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add glow effect for liquid cells
        if (this.settings.glowEffect) {
            this.drawGlowEffect(centerX, centerY, radius * 1.2, cell.age);
        }
    }

    /**
     * Draw cells using optimized metaball technique for ultimate liquid effect
     */
    drawMetaballCells(grid, cellSize, offsetX, offsetY) {
        const { width, height } = grid.getDimensions();
        const cells = grid.getAllCells();

        // Create optimized metaball field
        const metaballData = this.metaballOptimizer.createOptimizedMetaballField(
            cells, width, height, cellSize, offsetX, offsetY
        );

        // Save current context
        this.ctx.save();
        
        // Set blend mode for liquid effect
        this.ctx.globalCompositeOperation = 'normal';
        this.ctx.globalAlpha = 0.9;
        
        // Render optimized metaballs
        this.metaballOptimizer.renderOptimizedMetaballs(
            this.ctx, metaballData, this.colorManager, 0.35
        );
        
        // Restore context
        this.ctx.restore();
        
        // Add individual cell highlights for newborn cells
        this.drawCellHighlights(grid, cellSize, offsetX, offsetY);
    }

    /**
     * Draw thermal field visualization - smooth gradient with no visible cells
     */
    drawThermalField(grid) {
        const { width, height } = grid.getDimensions();
        const cells = grid.getAllCells();

        // Create thermal field data
        const thermalData = this.thermalRenderer.createThermalField(
            cells, width, height, this.displayWidth, this.displayHeight
        );

        // Render thermal field directly to canvas
        this.thermalRenderer.renderThermalField(
            this.ctx, thermalData, this.colorManager, 
            this.displayWidth, this.displayHeight
        );
    }

    /**
     * Draw highlights for special cells (newborn, etc.) - disabled in thermal mode
     */
    drawCellHighlights(grid, cellSize, offsetX, offsetY) {
        const { width, height } = grid.getDimensions();
        const cells = grid.getAllCells();

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = cells[y][x];
                if (!cell.alive) continue;

                const cellX = offsetX + x * cellSize + cellSize / 2;
                const cellY = offsetY + y * cellSize + cellSize / 2;
                
                // Pulsing effect for newborn cells
                if (cell.isNewborn()) {
                    const pulse = this.animationEngine.getPulseScale(cell, 0.3);
                    const glowColor = this.colorManager.getCellGlowColor(cell.age);
                    
                    this.ctx.fillStyle = glowColor;
                    this.ctx.globalAlpha = pulse;
                    this.ctx.beginPath();
                    this.ctx.arc(cellX, cellY, cellSize * 0.6 * pulse, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }

        this.ctx.restore();
    }

    /**
     * Draw frosted glass overlay effect
     */
    drawFrostedGlassOverlay() {
        // Create subtle noise pattern for frosted glass effect
        const time = this.animationEngine.getTime();
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.03;
        this.ctx.globalCompositeOperation = 'overlay';
        
        // Create noise pattern
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.displayWidth;
            const y = Math.random() * this.displayHeight;
            const size = Math.random() * 2 + 1;
            const opacity = Math.sin(time + i * 0.1) * 0.5 + 0.5;
            
            this.ctx.globalAlpha = opacity * 0.05;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    /**
     * Draw glow effect around a cell
     */
    drawGlowEffect(centerX, centerY, radius, age) {
        const glowColor = this.colorManager.getCellGlowColor(age);
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = glowColor;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    /**
     * Update render settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * Get current render settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Set color scheme
     */
    setColorScheme(scheme) {
        this.colorManager.setScheme(scheme);
    }

    /**
     * Convert canvas coordinates to grid coordinates
     */
    canvasToGrid(canvasX, canvasY, grid) {
        const { width, height } = grid.getDimensions();
        const cellSize = this.calculateCellSize(width, height);
        
        const gridWidth = width * cellSize;
        const gridHeight = height * cellSize;
        const offsetX = (this.displayWidth - gridWidth) / 2;
        const offsetY = (this.displayHeight - gridHeight) / 2;
        
        const gridX = Math.floor((canvasX - offsetX) / cellSize);
        const gridY = Math.floor((canvasY - offsetY) / cellSize);
        
        if (gridX >= 0 && gridX < width && gridY >= 0 && gridY < height) {
            return { x: gridX, y: gridY };
        }
        
        return null;
    }

    /**
     * Resize the canvas with high-DPI support
     */
    resize(width, height, devicePixelRatio = window.devicePixelRatio || 1) {
        // Set actual canvas size with pixel ratio
        this.canvas.width = width * devicePixelRatio;
        this.canvas.height = height * devicePixelRatio;
        
        // Set display size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Scale context for high-DPI
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        
        // Store the scale factor for calculations
        this.pixelRatio = devicePixelRatio;
        this.displayWidth = width;
        this.displayHeight = height;
        
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.imageSmoothingQuality = 'low';
        
        // Set text rendering for crisp text
        this.ctx.textRenderingOptimization = 'optimizeQuality';
    }
}