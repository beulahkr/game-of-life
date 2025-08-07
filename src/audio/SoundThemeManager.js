/**
 * Manages different sound themes for the Game of Life
 * Coordinates with AudioSystem to provide themed audio experiences
 */
export class SoundThemeManager {
    constructor(audioSystem) {
        this.audioSystem = audioSystem;
        this.currentTheme = 'chimes';
        this.themes = {
            chimes: {
                name: 'Chimes',
                description: 'Ethereal windchime sounds',
                synthesisMethod: 'windchime'
            },
            synth: {
                name: 'Synth',
                description: 'Organ-like synthesizer tones',
                synthesisMethod: 'organ'
            }
        };
    }

    /**
     * Set the active sound theme
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.audioSystem.setSynthesisMethod(this.themes[themeName].synthesisMethod);
            console.log(`Sound theme changed to: ${this.themes[themeName].name}`);
        } else {
            console.warn(`Unknown sound theme: ${themeName}`);
        }
    }

    /**
     * Get the current active theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get all available themes
     */
    getAvailableThemes() {
        return this.themes;
    }

    /**
     * Get theme info by name
     */
    getThemeInfo(themeName) {
        return this.themes[themeName] || null;
    }
}