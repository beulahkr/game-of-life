# Musical Game of Life

A unique implementation of Conway's cellular automaton that transforms the visual patterns into musical compositions using a Jankó keyboard note mapping system. Each cell position on the 30x30 grid corresponds to musical notes, creating windchime-like sounds as cells are born and evolve.

## Features

- **Musical Generation**: Cells trigger harmonic windchime sounds based on their grid position
- **Jankó Keyboard Mapping**: Grid positions mapped to musical notes using the Jankó keyboard layout
- **Traditional Conway's Rules**: Classic Game of Life cellular automaton mechanics
- **Interactive Audio**: Real-time sound generation with Web Audio API
- **Volume Control**: Adjustable audio levels from silent to full volume
- **Visual Interface**: Clean, retro-styled interface with pixel-perfect rendering
- **Interactive Controls**: Click and drag to create patterns that generate music
- **Predefined Patterns**: Glider, Blinker, Toad, Beacon, Pulsar, and Pentadecathlon
- **Adjustable Speed**: Control simulation speed from 1 to 60 steps per second
- **Keyboard Shortcuts**: Space for play/pause, intuitive controls
- **Mobile Friendly**: Touch support for creating musical patterns

## Getting Started

### Option 1: Simple File Server
1. Open a terminal in the project directory
2. Start a simple HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have it)
   npx serve .
   ```
3. Open your browser to `http://localhost:8000`

### Option 2: Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

### Option 3: Direct File Access
**Note**: Modern browsers may block ES modules when opening files directly. Use one of the server methods above for best results.

## How to Use

### Audio Experience
- **Automatic Audio**: Sound is enabled by default when you interact with the grid
- **Volume Control**: Use the volume slider to adjust audio levels (0-100%)
- **Musical Mapping**: Each grid position produces a unique note based on Jankó keyboard layout
- **Windchime Sounds**: Cells generate harmonic, bell-like tones when born or activated

### Basic Controls
- **Play/Pause**: Click the Play button or press Space to start/stop the simulation
- **Reset**: Clear the grid and start over
- **Random**: Generate a random pattern to hear different musical combinations
- **Speed**: Adjust simulation speed (1-60 steps per second)

### Creating Musical Patterns
- **Click** on individual grid cells to add them and hear their corresponding notes
- **Click and drag** to draw patterns that will create evolving musical compositions
- **Load Pattern**: Select from predefined patterns (Glider, Blinker, etc.) and click Load
- **Live Interaction**: Add cells while the simulation runs to influence the musical output

### Pattern Library
- **Glider**: Creates moving patterns that generate traveling musical sequences
- **Blinker**: Simple oscillating pattern with rhythmic audio
- **Toad**: Two-step oscillator creating alternating musical phrases
- **Beacon**: Stable oscillator with consistent musical intervals
- **Pulsar**: Complex 15-step oscillator creating elaborate musical cycles
- **Pentadecathlon**: Long-period oscillator with extended musical sequences

### Keyboard Shortcuts
- `Space`: Play/Pause simulation
- Click anywhere on the canvas to interact and automatically resume audio context

## Musical System

### Jankó Keyboard Layout
The 30x30 grid uses a Jankó keyboard note mapping where:
- Each cell position corresponds to a specific musical note
- The layout follows the Jankó keyboard pattern with alternating rows of black and white keys
- Row 1 pattern: C#, D#, F#, G#, A# (black keys)
- Row 2 pattern: C, D, E, F, G, A, B (white keys)

### Audio Features
- **Windchime Synthesis**: Multiple oscillators create rich harmonic content
- **Frequency Range**: Notes span multiple octaves across the grid
- **Real-time Generation**: Sounds are generated dynamically as cells become active
- **Web Audio API**: High-quality audio synthesis with precise timing
- **Volume Control**: Smooth volume adjustment from 0% to 100%

## Technical Details

### Architecture
- **JavaScript ES Modules**: Modern module system with clean separation of concerns
- **Web Audio API**: High-quality real-time audio synthesis
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **No Build Tools**: Direct browser execution with modern web standards

### Audio System
- **Real-time Synthesis**: Windchime-like sounds generated on-demand
- **Multiple Oscillators**: Rich harmonic content with fundamental and overtone frequencies
- **Jankó Note Mapping**: Mathematical mapping of grid positions to musical frequencies
- **Audio Context Management**: Automatic context resumption and audio initialization

### Performance
- Optimized canvas rendering with pixel-perfect graphics
- Efficient cellular automaton algorithms
- Smooth animation loop with requestAnimationFrame
- Responsive design for different screen sizes
- Audio processing optimized for real-time performance

### Browser Support
- Modern browsers with ES module and Web Audio API support
- Chrome 61+, Firefox 60+, Safari 11+, Edge 16+
- Audio features require user interaction for browser policy compliance

## Project Structure

```
game-of-life/
├── index.html              # Main HTML template
├── README.md               # Project documentation
├── src/
│   ├── main.js             # Application entry point
│   ├── audio/              # Audio system
│   │   └── AudioSystem.js  # Web Audio API integration and Jankó mapping
│   ├── game/               # Core game logic
│   │   ├── GameOfLife.js   # Main game engine with audio integration
│   │   ├── Cell.js         # Cell state management
│   │   └── Grid.js         # Grid utilities and neighbor calculations
│   ├── rendering/          # Visual rendering
│   │   ├── Renderer.js     # Canvas rendering engine
│   │   ├── ColorManager.js # Color schemes and visual effects
│   │   └── ThermalFieldRenderer.js # Advanced thermal visualization
│   └── ui/                 # User interface
│       └── Controls.js     # UI controls and user interactions
├── styles/
│   └── main.css           # Retro-styled application styling
└── assets/
    └── patterns/          # Pattern library documentation
```

## Future Enhancements

Potential improvements for the Musical Game of Life:

- **Advanced Audio**: Additional synthesis methods, reverb effects, and audio recording
- **Pattern Library**: Expanded collection with more complex musical patterns
- **Visual Modes**: Thermal field visualization and other rendering styles  
- **Performance**: Optimized audio processing and larger grid sizes
- **Musical Features**: Scale selection, tempo synchronization, and chord progressions
- **Mobile**: Enhanced touch controls for mobile music creation

## Contributing

This is a demonstration project showcasing the intersection of cellular automata and musical generation. Feel free to:
1. Fork the repository
2. Add new musical patterns or scales
3. Implement additional audio synthesis methods
4. Optimize performance for larger grids
5. Submit pull requests

## License

MIT License - Feel free to use this code for learning, teaching, or building your own musical cellular automaton projects.

## Conway's Game of Life Rules

For those new to Conway's Game of Life, here are the simple rules that drive the musical generation:

1. **Birth**: A dead cell with exactly 3 living neighbors becomes alive (triggers note)
2. **Survival**: A living cell with 2 or 3 living neighbors stays alive
3. **Death**: A living cell with fewer than 2 or more than 3 neighbors dies

These simple rules create surprisingly complex patterns that translate into evolving musical compositions!

---

**Explore the fascinating intersection of mathematics, cellular automata, and music generation!**