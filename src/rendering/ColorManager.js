/**
 * Manages color schemes and gradients for the Game of Life visualization
 */
export class ColorManager {
    constructor() {
        this.currentScheme = 'monochrome';
        
        this.schemes = {
            monochrome: {
                name: 'Classic Mac',
                primary: '#00FF41',
                secondary: '#ffffff',
                accent: '#66FF66',
                background: '#000000',
                grid: '#333333'
            }
        };
    }

    /**
     * Set the current color scheme
     */
    setScheme(schemeName) {
        if (this.schemes[schemeName]) {
            this.currentScheme = schemeName;
        }
    }

    /**
     * Get the current color scheme
     */
    getCurrentScheme() {
        return this.schemes[this.currentScheme];
    }

    /**
     * Get all available color schemes
     */
    getAllSchemes() {
        return { ...this.schemes };
    }

    /**
     * Get color for a cell based on its age and state
     */
    getCellColor(age, isAlive) {
        if (!isAlive) {
            return 'transparent';
        }

        const scheme = this.getCurrentScheme();
        const normalizedAge = Math.min(age / 50, 1); // Cap at 50 for color purposes

        switch (this.currentScheme) {
            case 'neon':
                return this.interpolateColors(scheme.accent, scheme.primary, normalizedAge);
            
            case 'fire':
                if (normalizedAge < 0.3) {
                    return this.interpolateColors('#ffff00', scheme.primary, normalizedAge / 0.3);
                } else if (normalizedAge < 0.7) {
                    return this.interpolateColors(scheme.primary, scheme.secondary, (normalizedAge - 0.3) / 0.4);
                } else {
                    return this.interpolateColors(scheme.secondary, scheme.accent, (normalizedAge - 0.7) / 0.3);
                }
            
            case 'ocean':
                return this.interpolateColors(scheme.accent, scheme.primary, normalizedAge);
            
            case 'aurora':
                if (normalizedAge < 0.5) {
                    return this.interpolateColors(scheme.primary, scheme.secondary, normalizedAge / 0.5);
                } else {
                    return this.interpolateColors(scheme.secondary, scheme.accent, (normalizedAge - 0.5) / 0.5);
                }
            
            case 'plasma':
                const hue = (normalizedAge * 360 + Date.now() * 0.1) % 360;
                return `hsl(${hue}, 100%, 60%)`;
            
            case 'monochrome':
                // Classic Mac green phosphor effect
                if (normalizedAge < 0.3) {
                    return scheme.accent; // Bright green for young cells
                } else if (normalizedAge < 0.7) {
                    return scheme.primary; // Standard green
                } else {
                    return scheme.secondary; // White for old cells
                }
            
            case 'macintosh':
                // Classic Mac black and white
                return normalizedAge > 0.5 ? scheme.primary : scheme.secondary;
            
            case 'amber':
                // Amber terminal colors
                if (normalizedAge < 0.5) {
                    return scheme.accent; // Light amber
                } else {
                    return scheme.primary; // Standard amber
                }
            
            default:
                return scheme.primary;
        }
    }

    /**
     * Get glow color for a cell
     */
    getCellGlowColor(age) {
        const scheme = this.getCurrentScheme();
        const normalizedAge = Math.min(age / 20, 1);
        
        if (this.currentScheme === 'plasma') {
            const hue = (normalizedAge * 360 + Date.now() * 0.1) % 360;
            return `hsl(${hue}, 100%, 50%)`;
        }
        
        return this.addAlpha(scheme.primary, 0.3 + normalizedAge * 0.4);
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColors(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Convert hex color to RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Add alpha channel to a color
     */
    addAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const rgb = this.hexToRgb(color);
            if (rgb) {
                return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            }
        }
        
        if (color.startsWith('rgb(')) {
            return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
        }
        
        return color;
    }

    /**
     * Create a radial gradient for a cell
     */
    createCellGradient(ctx, centerX, centerY, radius, age) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        const cellColor = this.getCellColor(age, true);
        const glowColor = this.getCellGlowColor(age);
        
        gradient.addColorStop(0, cellColor);
        gradient.addColorStop(0.7, this.addAlpha(cellColor, 0.8));
        gradient.addColorStop(1, this.addAlpha(glowColor, 0.2));
        
        return gradient;
    }

    /**
     * Get grid line color
     */
    getGridColor() {
        return this.getCurrentScheme().grid;
    }

    /**
     * Get background color
     */
    getBackgroundColor() {
        return this.getCurrentScheme().background;
    }

    /**
     * Create a pulsing effect color based on time
     */
    getPulsingColor(baseColor, time, frequency = 2) {
        const intensity = 0.5 + 0.5 * Math.sin(time * frequency);
        return this.addAlpha(baseColor, intensity);
    }
}