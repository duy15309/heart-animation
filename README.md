# 3D Heart Animation - Optimized

A high-performance, interactive 3D heart animation built with Three.js, featuring particle effects and smooth animations.

## ✨ Features

- **Interactive 3D Heart** - Rotate, zoom, and explore the heart model
- **Particle Effects** - Dynamic particle system with noise-based animations
- **Smooth Animations** - GSAP-powered heartbeat animation
- **Responsive Design** - Works on desktop and mobile devices
- **Performance Optimized** - Efficient rendering with WebGL
- **Accessibility** - Keyboard controls and reduced motion support
- **Loading States** - Visual feedback during asset loading
- **Error Handling** - Graceful error handling and user feedback

## 🚀 Performance Optimizations

- **Object-Oriented Architecture** - Clean, maintainable code structure
- **Configuration-Driven** - Easy customization through CONFIG object
- **Memory Management** - Efficient particle system and geometry updates
- **WebGL Optimizations** - High-performance rendering settings
- **Responsive Pixel Ratio** - Optimized for different screen densities
- **Page Visibility API** - Pauses animation when tab is not visible

## 📁 Project Structure

```txt
├── index.html                # Main HTML file (optimized)
├── assets/
│   ├── css/
│   │   └── style.css         # Optimized styles with responsive design
│   └── js/
│       ├── three.min.js      # Three.js library
│       ├── mesh-surface-sampler.js
│       ├── trackball-controls.js
│       ├── simplex-noise.js
│       ├── obj-loader.js
│       ├── gsap.min.js       # GSAP animation library
│       └── main.js           # Optimized main application script
└── README.md                 # Project documentation
```

## 🎮 Controls

- **Mouse/Touch** - Rotate, zoom, and pan the heart
- **Arrow Keys** - Move camera position
- **Spacebar** - Toggle animation on/off

## 🛠️ Technical Details

### Dependencies

- **Three.js** - 3D graphics and WebGL rendering
- **GSAP** - High-performance animations
- **Simplex Noise** - Procedural noise generation
- **Trackball Controls** - Interactive camera controls

### Browser Compatibility

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features

- Efficient particle system (10,000 particles)
- Optimized geometry updates
- Responsive design with adaptive scaling
- Reduced motion support for accessibility

## 🎨 Customization

The animation can be easily customized by modifying the `CONFIG` object in `main.js`:

```javascript
const CONFIG = {
  PARTICLE_COUNT: 10000,      // Number of particles
  BEAT_DURATION: 0.6,         // Animation duration
  COLORS: ["#ffd4ee", ...],   // Particle colors
  // ... more options
};
```

## 📱 Responsive Design

The application automatically adapts to different screen sizes:

- **Desktop** - Full 3D experience with all controls
- **Tablet** - Scaled down for optimal viewing
- **Mobile** - Touch-optimized controls

## ♿ Accessibility

- **Keyboard Navigation** - Full keyboard control support
- **Reduced Motion** - Respects user's motion preferences
- **High Contrast** - Clear visual feedback
- **Screen Reader** - Semantic HTML structure

## 🚀 Getting Started

1. Clone or download the project
2. Open `index.html` in a modern web browser
3. Wait for the heart model to load
4. Interact with the 3D heart using mouse/touch or keyboard

## 🔧 Development

The codebase is structured for easy maintenance and extension:

- **Modular Classes** - `HeartAnimation` and `SparkPoint` classes
- **Configuration Object** - Centralized settings for easy tweaking
- **Error Handling** - Comprehensive error catching and user feedback
- **Performance Monitoring** - Console logging for development

## 📄 License

This project is open source and available under the MIT License.
