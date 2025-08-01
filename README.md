# Enhanced Conway's Game of Life

A visually stunning implementation of Conway's cellular automaton with liquid-feeling visuals, bright colors, and smooth animations.

## 🎨 Features

- **Traditional Conway's Game of Life** rules with modern visuals
- **Multiple Color Schemes**: Neon Dreams, Fire & Ice, Ocean Depths, Aurora, Plasma, and Monochrome
- **Liquid Visual Mode**: Organic, blob-like cell rendering
- **Smooth Animations**: 60fps rendering with glow effects
- **Interactive Controls**: Click and drag to create patterns
- **Predefined Patterns**: Glider, Blinker, Toad, Beacon, Pulsar, and more
- **Customizable Settings**: Speed, grid size, visual modes
- **Keyboard Shortcuts**: Space (play/pause), Ctrl+R (reset), Ctrl+S (step)
- **Mobile Friendly**: Touch support for tablets and phones

## 🚀 Getting Started

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
⚠️ **Note**: Modern browsers may block ES modules when opening files directly. Use one of the server methods above for best results.

## 🎮 How to Use

### Basic Controls
- **Play/Pause**: Click the Play button or press Space
- **Reset**: Clear the grid and start over
- **Random**: Generate a random pattern
- **Speed**: Adjust simulation speed (1-60 fps)
- **Grid Size**: Change the grid dimensions (20x20 to 100x100)

### Creating Patterns
- **Click** on the grid to add individual cells
- **Click and drag** to draw patterns
- **Load Pattern**: Select from predefined patterns and click Load

### Visual Customization
- **Color Scheme**: Choose from 6 different color palettes
- **Grid Lines**: Toggle grid visibility
- **Glow Effects**: Enhanced visual effects for active cells

### Keyboard Shortcuts
- `Space`: Play/Pause simulation
- `Ctrl+R` / `Cmd+R`: Reset grid
- `Ctrl+S` / `Cmd+S`: Step forward one generation
- `Ctrl+G` / `Cmd+G`: Generate random pattern

## 🎨 Color Schemes

1. **Neon Dreams**: Electric blues, magentas, and cyans
2. **Fire & Ice**: Warm oranges and reds transitioning to cool blues
3. **Ocean Depths**: Deep blues to bright teals and seafoam
4. **Aurora**: Purple, green, and pink gradients
5. **Plasma**: Dynamic rainbow cycling
6. **Monochrome**: Elegant black, white, and gray gradients

## 🔧 Technical Details

### Architecture
- **TypeScript**: Modern, type-safe JavaScript
- **HTML5 Canvas**: High-performance rendering
- **ES Modules**: Modern module system
- **No Build Tools**: Simple setup with modern browser features

### Performance
- Optimized canvas rendering
- Efficient neighbor counting algorithms
- 60fps animation loop
- Responsive design for different screen sizes

### Browser Support
- Modern browsers with ES module support
- Chrome 61+, Firefox 60+, Safari 11+, Edge 16+

## 📁 Project Structure

```
game-of-life/
├── index.html              # Main HTML template
├── plan.md                 # Detailed project roadmap
├── src/
│   ├── main.ts             # Application entry point
│   ├── game/               # Core game logic
│   │   ├── GameOfLife.ts   # Main game engine
│   │   ├── Cell.ts         # Cell state management
│   │   └── Grid.ts         # Grid utilities
│   ├── rendering/          # Visual rendering
│   │   ├── Renderer.ts     # Canvas rendering engine
│   │   └── ColorManager.ts # Color schemes and gradients
│   └── ui/                 # User interface
│       └── Controls.ts     # UI controls and interactions
├── styles/
│   └── main.css           # Application styling
└── assets/
    └── patterns/          # Pattern library
```

## 🚧 Future Enhancements

See `plan.md` for the complete roadmap including:

- **Advanced Visual Effects**: Metaball rendering, particle systems
- **Pattern Library**: Expanded collection with .rle file support
- **Animation Modes**: Heat maps, history trails, influence fields
- **Performance**: Web Workers, optimized algorithms
- **Mobile**: Enhanced touch controls and responsive design

## 🤝 Contributing

This is a demonstration project, but feel free to:
1. Fork the repository
2. Add new color schemes or patterns
3. Implement new visual effects
4. Optimize performance
5. Submit pull requests

## 📜 License

MIT License - Feel free to use this code for learning, teaching, or building your own projects.

## 🎯 Conway's Game of Life Rules

For those new to Conway's Game of Life, here are the simple rules:

1. **Birth**: A dead cell with exactly 3 living neighbors becomes alive
2. **Survival**: A living cell with 2 or 3 living neighbors stays alive
3. **Death**: A living cell with fewer than 2 or more than 3 neighbors dies

These simple rules create surprisingly complex and beautiful patterns!

---

**Enjoy exploring the fascinating world of cellular automata!** 🎮✨