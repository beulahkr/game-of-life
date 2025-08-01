/**
 * Audio System for the Musical Game of Life
 * Implements windchime-like sounds triggered by cellular automaton
 */

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isEnabled = true;
        this.volume = 0.3;
        this.activeSounds = new Map();
        this.noteMapping = this.createJankoNoteMapping();
        
        this.initializeAudio();
    }

    /**
     * Initialize Web Audio API
     */
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.masterGain.connect(this.audioContext.destination);
            
            // Resume context if it's suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.isEnabled = false;
        }
    }

    /**
     * Create Jankó keyboard note mapping for 30x30 grid
     * Maps grid positions to musical notes
     */
    createJankoNoteMapping() {
        const mapping = new Map();
        
        // Jankó layout has two alternating row patterns
        // Row 1: C# D# F# G# A# (black keys)
        // Row 2: C D E F G A B (white keys)
        
        const row1Notes = ['C#', 'D#', 'F#', 'G#', 'A#']; // Black keys pattern
        const row2Notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // White keys pattern
        
        for (let y = 0; y < 30; y++) {
            for (let x = 0; x < 30; x++) {
                let note, octave;
                
                // Determine which row pattern to use
                const isRow1 = (y % 2) === 0;
                
                if (isRow1) {
                    // Use black keys pattern
                    const noteIndex = x % row1Notes.length;
                    note = row1Notes[noteIndex];
                    octave = Math.floor(x / row1Notes.length) + Math.floor(y / 4) + 1;
                } else {
                    // Use white keys pattern  
                    const noteIndex = x % row2Notes.length;
                    note = row2Notes[noteIndex];
                    octave = Math.floor(x / row2Notes.length) + Math.floor(y / 4) + 1;
                }
                
                // Keep octaves in reasonable range (2-7)
                octave = Math.max(2, Math.min(7, octave));
                
                const frequency = this.noteToFrequency(note, octave);
                mapping.set(`${x},${y}`, {
                    note: `${note}${octave}`,
                    frequency: frequency,
                    x: x,
                    y: y
                });
            }
        }
        
        return mapping;
    }

    /**
     * Convert note name and octave to frequency
     */
    noteToFrequency(note, octave) {
        const noteFrequencies = {
            'C': 261.63,
            'C#': 277.18,
            'D': 293.66,
            'D#': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99,
            'G': 392.00,
            'G#': 415.30,
            'A': 440.00,
            'A#': 466.16,
            'B': 493.88
        };
        
        const baseFreq = noteFrequencies[note] || 440;
        return baseFreq * Math.pow(2, octave - 4);
    }

    /**
     * Create windchime-like sound synthesis
     */
    createWindchimeSound(frequency, duration = 2.0, delay = 0) {
        if (!this.audioContext || !this.isEnabled) return;

        const startTime = this.audioContext.currentTime + delay;
        
        // Create multiple oscillators for rich harmonic content
        const oscillators = [];
        const gains = [];
        
        // Fundamental frequency
        this.createOscillatorChain(frequency, 0.4, startTime, duration, oscillators, gains);
        
        // Harmonic overtones (like real windchimes)
        this.createOscillatorChain(frequency * 2.1, 0.15, startTime, duration, oscillators, gains);
        this.createOscillatorChain(frequency * 3.2, 0.1, startTime, duration, oscillators, gains);
        this.createOscillatorChain(frequency * 4.8, 0.05, startTime, duration, oscillators, gains);
        
        // Add subtle modulation for shimmer effect
        const modulator = this.audioContext.createOscillator();
        const modGain = this.audioContext.createGain();
        modulator.frequency.setValueAtTime(4.5, startTime);
        modulator.type = 'sine';
        modGain.gain.setValueAtTime(8, startTime);
        modulator.connect(modGain);
        
        // Apply modulation to main oscillators
        oscillators.forEach(osc => {
            modGain.connect(osc.frequency);
        });
        
        modulator.start(startTime);
        modulator.stop(startTime + duration);
        
        return { oscillators, gains, duration };
    }

    /**
     * Create oscillator with envelope for windchime effect
     */
    createOscillatorChain(frequency, amplitude, startTime, duration, oscillators, gains) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // High-pass filter for crystalline sound
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(frequency * 0.5, startTime);
        filter.Q.setValueAtTime(2, startTime);
        
        // Windchime envelope: quick attack, long decay
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(amplitude, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(amplitude * 0.1, startTime + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        oscillators.push(oscillator);
        gains.push(gainNode);
    }

    /**
     * Play sound for a cell position
     */
    playCellSound(x, y, type = 'birth') {
        const noteData = this.noteMapping.get(`${x},${y}`);
        if (!noteData) return;

        const delay = type === 'birth' ? Math.random() * 0.1 : 0;
        const duration = type === 'birth' ? 2.5 + Math.random() * 1.5 : 1.0;
        
        this.createWindchimeSound(noteData.frequency, duration, delay);
    }

    /**
     * Play arpeggiated sequence for multiple cells
     */
    playArpeggio(cellPositions, direction = 'up') {
        if (!cellPositions.length) return;

        // Sort by frequency for arpeggio
        const notes = cellPositions
            .map(pos => this.noteMapping.get(`${pos.x},${pos.y}`))
            .filter(note => note)
            .sort((a, b) => direction === 'up' ? a.frequency - b.frequency : b.frequency - a.frequency);

        notes.forEach((note, index) => {
            const delay = index * 0.05; // 50ms between notes
            this.createWindchimeSound(note.frequency, 2.0, delay);
        });
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    /**
     * Get note information for a cell position
     */
    getNoteForPosition(x, y) {
        return this.noteMapping.get(`${x},${y}`);
    }

    /**
     * Resume audio context (call on user interaction)
     */
    async resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}