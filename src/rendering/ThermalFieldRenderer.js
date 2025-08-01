/**
 * Thermal Field Renderer - Creates smooth thermal/heat map visualization
 * No distinguishable cells, just continuous gradient fields
 */
export class ThermalFieldRenderer {
    constructor() {
        this.fieldCache = new Map();
        this.temperatureField = null;
        this.blurBuffer = null;
        this.lastFieldData = null;
        this.framesSinceUpdate = 0;
        this.lastUpdateTime = 0;
        
        // Thermal rendering settings - OPTIMIZED FOR PERFORMANCE
        this.settings = {
            fieldResolution: 4, // Increased for better performance (was 2)
            thermalRange: { min: 0, max: 1 },
            blurRadius: 4, // Reduced blur for better performance (was 8)
            temperatureDecay: 0.95,
            heatDiffusion: 0.08, // Slightly reduced for performance
            enableCaching: true,
            cacheLifetime: 3, // Frames to keep cache
            maxFPS: 30 // Target FPS cap
        };
    }

    /**
     * Create thermal field from cellular automaton state - PERFORMANCE OPTIMIZED
     */
    createThermalField(cells, gridWidth, gridHeight, canvasWidth, canvasHeight) {
        const currentTime = performance.now();
        
        // Performance optimization: Skip expensive calculations if recent cache exists
        if (this.settings.enableCaching && this.lastFieldData && 
            this.framesSinceUpdate < this.settings.cacheLifetime &&
            currentTime - this.lastUpdateTime < 100) { // Max 100ms cache
            this.framesSinceUpdate++;
            return this.lastFieldData;
        }
        
        // Calculate field dimensions for smooth interpolation
        const fieldWidth = Math.floor(canvasWidth / this.settings.fieldResolution);
        const fieldHeight = Math.floor(canvasHeight / this.settings.fieldResolution);
        
        // Create temperature field
        const temperatureField = new Float32Array(fieldWidth * fieldHeight);
        const activityField = new Float32Array(fieldWidth * fieldHeight);
        
        // Map cellular automaton to thermal field
        this.mapCellsToThermalField(
            cells, gridWidth, gridHeight,
            temperatureField, activityField,
            fieldWidth, fieldHeight,
            canvasWidth, canvasHeight
        );
        
        // Apply thermal diffusion and smoothing
        this.applyThermalDiffusion(temperatureField, fieldWidth, fieldHeight);
        
        // Apply Gaussian blur for ultra-smooth gradients
        const blurredField = this.applyGaussianBlur(
            temperatureField, fieldWidth, fieldHeight, this.settings.blurRadius
        );
        
        const result = {
            temperature: blurredField,
            activity: activityField,
            width: fieldWidth,
            height: fieldHeight,
            scale: this.settings.fieldResolution
        };
        
        // Cache the result for performance
        if (this.settings.enableCaching) {
            this.lastFieldData = result;
            this.framesSinceUpdate = 0;
            this.lastUpdateTime = currentTime;
        }
        
        return result;
    }

    /**
     * Map cellular automaton state to thermal field
     */
    mapCellsToThermalField(cells, gridWidth, gridHeight, tempField, actField, 
                          fieldWidth, fieldHeight, canvasWidth, canvasHeight) {
        
        // Calculate scaling factors
        const scaleX = canvasWidth / fieldWidth;
        const scaleY = canvasHeight / fieldHeight;
        const cellWidth = canvasWidth / gridWidth;
        const cellHeight = canvasHeight / gridHeight;
        
        // Clear fields
        tempField.fill(0);
        actField.fill(0);
        
        // For each field point, calculate thermal influence
        for (let fy = 0; fy < fieldHeight; fy++) {
            for (let fx = 0; fx < fieldWidth; fx++) {
                const fieldIdx = fy * fieldWidth + fx;
                
                // Convert field coordinates to world coordinates
                const worldX = fx * scaleX;
                const worldY = fy * scaleY;
                
                let totalHeat = 0;
                let totalActivity = 0;
                let influenceCount = 0;
                
                // Sample surrounding cells with Gaussian influence
                const sampleRadius = Math.max(cellWidth, cellHeight) * 2;
                
                for (let cy = 0; cy < gridHeight; cy++) {
                    for (let cx = 0; cx < gridWidth; cx++) {
                        const cell = cells[cy][cx];
                        
                        // Calculate cell center in world coordinates
                        const cellCenterX = (cx + 0.5) * cellWidth;
                        const cellCenterY = (cy + 0.5) * cellHeight;
                        
                        // Calculate distance from field point to cell center
                        const dx = worldX - cellCenterX;
                        const dy = worldY - cellCenterY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance <= sampleRadius) {
                            // Calculate Gaussian influence
                            const sigma = sampleRadius * 0.3;
                            const influence = Math.exp(-(distance * distance) / (2 * sigma * sigma));
                            
                            if (cell.alive) {
                                // Living cells generate heat
                                const cellHeat = this.calculateCellHeat(cell);
                                totalHeat += cellHeat * influence;
                                totalActivity += influence;
                            }
                            
                            influenceCount += influence;
                        }
                    }
                }
                
                // Normalize and store field values
                if (influenceCount > 0) {
                    tempField[fieldIdx] = totalHeat / influenceCount;
                    actField[fieldIdx] = totalActivity / influenceCount;
                }
            }
        }
    }

    /**
     * Calculate heat value for a living cell
     */
    calculateCellHeat(cell) {
        // Base heat for living cell
        let heat = 1.0;
        
        // Age contributes to heat (older = hotter)
        const ageBonus = Math.min(cell.age / 20, 0.5);
        heat += ageBonus;
        
        // Recent birth creates extra heat
        if (cell.isNewborn()) {
            heat += 0.8;
        }
        
        return Math.min(heat, 2.0);
    }

    /**
     * Apply thermal diffusion for realistic heat spreading
     */
    applyThermalDiffusion(field, width, height) {
        const newField = new Float32Array(field.length);
        const diffusion = this.settings.heatDiffusion;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                
                // Sample neighboring points
                const center = field[idx];
                const north = field[(y - 1) * width + x];
                const south = field[(y + 1) * width + x];
                const east = field[y * width + (x + 1)];
                const west = field[y * width + (x - 1)];
                
                // Apply diffusion equation
                const laplacian = north + south + east + west - 4 * center;
                newField[idx] = center + diffusion * laplacian;
                
                // Apply temperature decay
                newField[idx] *= this.settings.temperatureDecay;
            }
        }
        
        // Copy back to original field
        for (let i = 0; i < field.length; i++) {
            field[i] = newField[i];
        }
    }

    /**
     * Apply optimized Gaussian blur for smooth gradients - PERFORMANCE OPTIMIZED
     */
    applyGaussianBlur(field, width, height, radius) {
        if (radius <= 0) return new Float32Array(field);
        
        // Performance optimization: Use simpler box blur for small radius
        if (radius <= 2) {
            return this.applyBoxBlur(field, width, height, radius);
        }
        
        const blurred = new Float32Array(field.length);
        const kernel = this.createGaussianKernel(radius);
        const kernelSize = kernel.length;
        const kernelRadius = Math.floor(kernelSize / 2);
        
        // Horizontal pass
        const temp = new Float32Array(field.length);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let weightSum = 0;
                
                for (let k = 0; k < kernelSize; k++) {
                    const sampleX = x + k - kernelRadius;
                    if (sampleX >= 0 && sampleX < width) {
                        const weight = kernel[k];
                        sum += field[y * width + sampleX] * weight;
                        weightSum += weight;
                    }
                }
                
                temp[y * width + x] = weightSum > 0 ? sum / weightSum : 0;
            }
        }
        
        // Vertical pass
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let weightSum = 0;
                
                for (let k = 0; k < kernelSize; k++) {
                    const sampleY = y + k - kernelRadius;
                    if (sampleY >= 0 && sampleY < height) {
                        const weight = kernel[k];
                        sum += temp[sampleY * width + x] * weight;
                        weightSum += weight;
                    }
                }
                
                blurred[y * width + x] = weightSum > 0 ? sum / weightSum : 0;
            }
        }
        
        return blurred;
    }

    /**
     * Fast box blur for performance (alternative to Gaussian for small radius)
     */
    applyBoxBlur(field, width, height, radius) {
        const blurred = new Float32Array(field.length);
        const temp = new Float32Array(field.length);
        
        // Horizontal pass
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let count = 0;
                
                for (let dx = -radius; dx <= radius; dx++) {
                    const sampleX = x + dx;
                    if (sampleX >= 0 && sampleX < width) {
                        sum += field[y * width + sampleX];
                        count++;
                    }
                }
                
                temp[y * width + x] = count > 0 ? sum / count : 0;
            }
        }
        
        // Vertical pass
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    const sampleY = y + dy;
                    if (sampleY >= 0 && sampleY < height) {
                        sum += temp[sampleY * width + x];
                        count++;
                    }
                }
                
                blurred[y * width + x] = count > 0 ? sum / count : 0;
            }
        }
        
        return blurred;
    }

    /**
     * Create Gaussian kernel for blurring
     */
    createGaussianKernel(radius) {
        const size = radius * 2 + 1;
        const kernel = new Float32Array(size);
        const sigma = radius / 3;
        const twoSigmaSquared = 2 * sigma * sigma;
        
        let sum = 0;
        for (let i = 0; i < size; i++) {
            const x = i - radius;
            kernel[i] = Math.exp(-(x * x) / twoSigmaSquared);
            sum += kernel[i];
        }
        
        // Normalize kernel
        for (let i = 0; i < size; i++) {
            kernel[i] /= sum;
        }
        
        return kernel;
    }

    /**
     * Render thermal field to canvas - PERFORMANCE OPTIMIZED
     */
    renderThermalField(ctx, thermalData, colorManager, canvasWidth, canvasHeight) {
        const { temperature, width, height, scale } = thermalData;
        
        // Performance optimization: Use lower resolution for rendering
        const renderScale = Math.max(1, Math.floor(scale / 2));
        const renderWidth = Math.floor(canvasWidth / renderScale);
        const renderHeight = Math.floor(canvasHeight / renderScale);
        
        // Create smaller image data for faster processing
        const imageData = ctx.createImageData(renderWidth, renderHeight);
        const pixels = imageData.data;
        
        // Calculate thermal range for color mapping
        const tempRange = this.calculateTemperatureRange(temperature);
        
        // Render each pixel at reduced resolution
        for (let y = 0; y < renderHeight; y++) {
            for (let x = 0; x < renderWidth; x++) {
                // Sample thermal field with bilinear interpolation
                const fieldX = (x * renderScale) / scale;
                const fieldY = (y * renderScale) / scale;
                const temp = this.sampleThermalField(temperature, width, height, fieldX, fieldY);
                
                // Map temperature to color
                const normalizedTemp = (temp - tempRange.min) / (tempRange.max - tempRange.min);
                const color = this.getThermalColor(normalizedTemp, colorManager);
                
                // Set pixel color
                const pixelIdx = (y * renderWidth + x) * 4;
                pixels[pixelIdx] = color.r;
                pixels[pixelIdx + 1] = color.g;
                pixels[pixelIdx + 2] = color.b;
                pixels[pixelIdx + 3] = Math.floor(color.a * 255);
            }
        }
        
        // Draw to canvas and scale up
        if (renderScale > 1) {
            // Create temporary canvas for scaling
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = renderWidth;
            tempCanvas.height = renderHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);
            
            // Draw scaled version
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(tempCanvas, 0, 0, renderWidth, renderHeight, 
                         0, 0, canvasWidth, canvasHeight);
        } else {
            ctx.putImageData(imageData, 0, 0);
        }
    }

    /**
     * Sample thermal field with bilinear interpolation
     */
    sampleThermalField(field, width, height, x, y) {
        // Clamp coordinates
        x = Math.max(0, Math.min(width - 1.001, x));
        y = Math.max(0, Math.min(height - 1.001, y));
        
        // Get integer and fractional parts
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        const x1 = Math.min(x0 + 1, width - 1);
        const y1 = Math.min(y0 + 1, height - 1);
        
        const fx = x - x0;
        const fy = y - y0;
        
        // Sample four corners
        const tl = field[y0 * width + x0]; // top-left
        const tr = field[y0 * width + x1]; // top-right
        const bl = field[y1 * width + x0]; // bottom-left
        const br = field[y1 * width + x1]; // bottom-right
        
        // Bilinear interpolation
        const top = tl + (tr - tl) * fx;
        const bottom = bl + (br - bl) * fx;
        return top + (bottom - top) * fy;
    }

    /**
     * Calculate temperature range for normalization
     */
    calculateTemperatureRange(field) {
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < field.length; i++) {
            const temp = field[i];
            if (temp < min) min = temp;
            if (temp > max) max = temp;
        }
        
        // Ensure non-zero range
        if (max <= min) {
            max = min + 0.1;
        }
        
        return { min, max };
    }

    /**
     * Map normalized temperature to thermal color
     */
    getThermalColor(normalizedTemp, colorManager) {
        // Clamp temperature
        const temp = Math.max(0, Math.min(1, normalizedTemp));
        
        // Thermal color mapping (like thermal camera)
        if (temp < 0.1) {
            // Cold - dark blue/black
            return {
                r: Math.floor(temp * 10 * 20),
                g: 0,
                b: Math.floor(temp * 10 * 40),
                a: temp > 0.01 ? 0.8 : 0
            };
        } else if (temp < 0.3) {
            // Cool - blue to purple
            const t = (temp - 0.1) / 0.2;
            return {
                r: Math.floor(20 + t * 80),
                g: 0,
                b: Math.floor(40 + t * 120),
                a: 0.8 + t * 0.2
            };
        } else if (temp < 0.5) {
            // Moderate - purple to red
            const t = (temp - 0.3) / 0.2;
            return {
                r: Math.floor(100 + t * 120),
                g: Math.floor(t * 60),
                b: Math.floor(160 - t * 140),
                a: 1.0
            };
        } else if (temp < 0.8) {
            // Hot - red to orange
            const t = (temp - 0.5) / 0.3;
            return {
                r: Math.floor(220 + t * 35),
                g: Math.floor(60 + t * 140),
                b: Math.floor(20 - t * 20),
                a: 1.0
            };
        } else {
            // Very hot - orange to white
            const t = (temp - 0.8) / 0.2;
            return {
                r: 255,
                g: Math.floor(200 + t * 55),
                b: Math.floor(t * 150),
                a: 1.0
            };
        }
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.fieldCache.clear();
    }
}