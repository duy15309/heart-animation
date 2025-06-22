/**
 * 3D Heart Animation - Optimized Version
 * A Three.js-based interactive 3D heart animation with particle effects
 *
 * Performance optimizations:
 * - Efficient particle system with object pooling
 * - Memory management and cleanup
 * - Optimized rendering loops
 * - Accessibility improvements
 * - Error handling and recovery
 * - Mobile optimization
 */

// Easter egg for the special someone 💕
console.log(
  "%c💖 Beating Heart Easter Egg 💖",
  "color: #ff77fc; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(255, 119, 252, 0.5);"
);
console.log(
  "%cChào bé yêu! 💕",
  "color: #ff1775; font-size: 16px; font-weight: bold;"
);
console.log(
  "%cTrái tim này là dành cho vợ, như tim anh vậy... 💓",
  "color: #ff77ae; font-size: 14px;"
);
console.log(
  "%cMỗi hạt, mỗi chuyển động, mỗi nhịp đập - tất cả đều dành cho vợ! ✨",
  "color: #ff77ae; font-size: 14px;"
);
console.log(
  "%c❤️ Chồng yêu vợ! ❤️",
  "color: #ff1775; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px rgba(255, 23, 117, 0.3);"
);

// Configuration object for easy customization
const CONFIG = {
  // Scene settings
  CAMERA_FOV: 75,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
  CAMERA_POSITION_Z: 1.8,

  // Controls settings
  CONTROLS_MAX_DISTANCE: 3,
  CONTROLS_MIN_DISTANCE: 0.7,

  // Heart settings
  HEART_SCALE: 0.04,
  HEART_ROTATION: -Math.PI * 0.5,
  HEART_TRANSLATE_Y: -0.4,

  // Particle settings
  PARTICLE_COUNT: 10000,
  PARTICLE_SIZE: 0.009,
  PARTICLE_RANDOM_FACTOR: 0.03,

  // Animation settings
  BEAT_DURATION: 0.48,
  BEAT_REPEAT_DELAY: 0.24,
  BEAT_MAX_VALUE: 0.5,

  // Noise settings
  NOISE_SCALE: 1.5,
  NOISE_FREQUENCY: 500,
  NOISE_AMPLITUDE: 0.15,

  // Rendering settings
  MAX_Z: 0.23,
  RATE_Z: 0.5,

  // Colors
  COLORS: ["#ffd4ee", "#ff77fc", "#ff77ae", "#ff1775"],

  // Performance settings
  TARGET_FPS: 60,
  FRAME_SKIP_THRESHOLD: 16, // ms

  // Accessibility settings
  REDUCED_MOTION: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  // Audio settings
  AUDIO_VOLUME: 0.7,
  AUDIO_FADE_DURATION: 0.5,
};

// Pre-compute constants for performance
const PARTICLE_COUNT_6 = CONFIG.PARTICLE_COUNT * 6;
const MAX_Z_RATE_Z = CONFIG.MAX_Z * CONFIG.RATE_Z;
const NOISE_SCALE_AMPLITUDE = CONFIG.NOISE_SCALE * CONFIG.NOISE_AMPLITUDE;

// Utility functions
const Utils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for performance
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Check if device is mobile
  isMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Iemobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  },

  // Check if device supports touch
  isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  },

  // Update loading progress
  updateLoadingProgress(percent) {
    const progressBar = document.getElementById("progress-bar");
    const loadingText = document.getElementById("loading-text");

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    if (loadingText) {
      loadingText.textContent = `Loading 3D Heart Animation... ${Math.round(
        percent
      )}%`;
    }
  },

  // Show error with retry option
  showError(message, retryCallback = null) {
    const errorDisplay = document.getElementById("error-display");
    const errorMessage = document.getElementById("error-message");
    const errorRetry = document.getElementById("error-retry");

    if (errorDisplay && errorMessage) {
      errorMessage.textContent = message;
      errorDisplay.hidden = false;

      if (retryCallback && errorRetry) {
        errorRetry.onclick = retryCallback;
        errorRetry.style.display = "block";
      } else if (errorRetry) {
        errorRetry.style.display = "none";
      }
    }
  },

  // Hide error display
  hideError() {
    const errorDisplay = document.getElementById("error-display");
    if (errorDisplay) {
      errorDisplay.hidden = true;
    }
  },

  // Update ARIA live regions
  updateAriaLive(message, priority = "polite") {
    const ariaLive = document.createElement("div");
    ariaLive.setAttribute("aria-live", priority);
    ariaLive.setAttribute("aria-atomic", "true");
    ariaLive.style.position = "absolute";
    ariaLive.style.left = "-9999px";
    ariaLive.style.width = "1px";
    ariaLive.style.height = "1px";
    ariaLive.style.overflow = "hidden";
    ariaLive.textContent = message;

    document.body.appendChild(ariaLive);

    // Remove after a short delay
    setTimeout(() => {
      if (ariaLive.parentNode) {
        ariaLive.parentNode.removeChild(ariaLive);
      }
    }, 1000);
  },

  // Show notification for keyboard shortcuts
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    const colors = {
      info: { bg: "rgba(255, 119, 252, 0.9)", border: "#ff77fc" },
      success: { bg: "rgba(119, 255, 119, 0.9)", border: "#77ff77" },
      warning: { bg: "rgba(255, 170, 119, 0.9)", border: "#ffaa77" },
      error: { bg: "rgba(255, 119, 119, 0.9)", border: "#ff7777" },
    };

    const color = colors[type] || colors.info;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color.bg};
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      border: 2px solid ${color.border};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInNotification 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Add CSS animation if not already present
    if (!document.getElementById("notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
        @keyframes slideInNotification {
          0% { 
            opacity: 0; 
            transform: translateX(100px) scale(0.8); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
        }
        @keyframes slideOutNotification {
          0% { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(100px) scale(0.8); 
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutNotification 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  },
};

// Main application class
class HeartAnimation {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.group = null;
    this.particles = null;
    this.geometry = null;
    this.material = null;
    this.heart = null;
    this.originHeart = null;
    this.sampler = null;
    this.spikes = [];
    this.positions = null;
    this.colors = null;
    this.palette = [
      new THREE.Color("#ffd4ee"),
      new THREE.Color("#ff77fc"),
      new THREE.Color("#ff77ae"),
      new THREE.Color("#ff1775"),
    ];
    this.simplex = new SimplexNoise();
    this.beat = { a: 0 };
    this.pos = new THREE.Vector3();
    this.tempVec3 = new THREE.Vector3();
    this.isAnimating = false;
    this.lastRenderTime = 0;

    // UI elements
    this.mainContent = document.getElementById("main-content");
    this.loadingElement = document.getElementById("loading");
    this.helpButton = document.getElementById("help-button");
    this.musicControls = document.getElementById("music-controls");
    this.introScreen = document.getElementById('intro-screen');
    this.yesButton = document.getElementById('yes-button');
    this.noButton = document.getElementById('no-button');
    this.noClickCount = 0;
    this.noMessages = [
        "Không",
        "Thật sự là không sao?",
        "Suy nghĩ lại đi mò",
        "Làm ơn",
        "Em chọn có điiiii",
        "Có nhé? năn nỉ đó",
        "Please say yes :("
    ];

    // Audio properties
    this.audio = null;
    this.audioContext = null;
    this.audioSource = null;
    this.audioFadeInterval = null;

    // Performance properties
    this.frameSkipCount = 0;
    this.lastRenderTime = 0;

    // Initialize the application
    this.init();
  }

  init() {
    this.setupIntroLogic();
  }

  setupIntroLogic() {
    this.yesButton.addEventListener('click', () => this.handleYesClick());
    this.noButton.addEventListener('click', () => this.handleNoClick());
  }

  handleYesClick() {
    this.introScreen.style.opacity = '0';
    setTimeout(() => {
        this.introScreen.style.display = 'none';

        if (this.loadingElement) {
            this.loadingElement.hidden = false;
        }

        this.startMainAnimation();
    }, 1000);
  }

  handleNoClick() {
    this.noClickCount++;
    const messageIndex = Math.min(this.noClickCount, this.noMessages.length - 1);
    
    this.noButton.textContent = this.noMessages[messageIndex];
    
    const scaleFactor = 1 + this.noClickCount * 0.3;
    const paddingX = 15 + this.noClickCount * 10;
    const paddingY = 10 + this.noClickCount * 5;
    const fontSize = 1.2 + this.noClickCount * 0.15;

    this.yesButton.style.transform = `scale(${scaleFactor})`;
    this.yesButton.style.padding = `${paddingY}px ${paddingX}px`;
    this.yesButton.style.fontSize = `${fontSize}rem`;

    const randomX = (Math.random() - 0.5) * 200;
    const randomY = (Math.random() - 0.5) * 200;
    this.noButton.style.transform = `translate(${randomX}px, ${randomY}px)`;
    
    if (this.noClickCount > this.noMessages.length) {
        this.noButton.style.display = 'none';
    }
  }

  startMainAnimation() {
    try {
        this.checkWebGLSupport();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupGroup();
        this.positions = new Float32Array(CONFIG.PARTICLE_COUNT * 6);
        this.colors = new Float32Array(CONFIG.PARTICLE_COUNT * 6);
        this.setupParticles();
        this.setupAnimation();
        this.setupAudio();
        this.loadHeartModel();
    } catch (error) {
        console.error("Critical initialization failed:", error);
        this.showError("Đã có lỗi xảy ra. Vui lòng tải lại trang.");
    }
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    
    // Add lighting for 3D text
    this.setupLighting();
  }

  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0xff77fc, 0.5, 10);
    pointLight.position.set(0, 0, 2);
    this.scene.add(pointLight);
    
    // Store lights for animation
    this.lights = {
      directional: directionalLight,
      point: pointLight
    };
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      CONFIG.CAMERA_NEAR,
      CONFIG.CAMERA_FAR
    );
    this.camera.position.z = CONFIG.CAMERA_POSITION_Z;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: !Utils.isMobile(), // Disable antialiasing on mobile for performance
      alpha: false,
      powerPreference: "high-performance",
      precision: Utils.isMobile() ? "mediump" : "highp", // Use medium precision on mobile
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: false,
    });

    this.renderer.setClearColor(new THREE.Color("#000000"));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false; // Disable shadows for performance
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.tonemapping = THREE.NoTonemapping;

    // Performance optimizations
    this.renderer.sortObjects = false; // Disable automatic sorting
    this.renderer.autoClear = true;
    this.renderer.autoClearColor = true;
    this.renderer.autoClearDepth = true;
    this.renderer.autoClearStencil = false;

    // Insert canvas into main content area for better accessibility
    if (this.mainContent) {
      this.mainContent.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }

    // Add keyboard controls for accessibility
    document.addEventListener("keydown", (event) => this.onKeyDown(event));

    // Add touch support for mobile with better handling
    if (Utils.isTouchDevice()) {
      this.renderer.domElement.addEventListener(
        "touchstart",
        (event) => {
          event.preventDefault();
        },
        { passive: false }
      );

      // Add touch gesture support
      this.setupTouchGestures();
    }

    // Add music controls overlay click handler
    if (this.musicControls) {
      this.musicControls.addEventListener("click", () => {
        this.musicControls.style.opacity = "0";
        setTimeout(() => {
          this.musicControls.hidden = true;
        }, 300);
      });
    }

    // Add help button event listener
    if (this.helpButton) {
      this.helpButton.addEventListener("click", () => {
        this.toggleControlsVisibility();
      });
    }

    // Optimized resize handler with debouncing
    const debouncedResize = Utils.debounce(() => this.onWindowResize(), 100);
    window.addEventListener("resize", debouncedResize, false);

    // Setup audio after renderer is ready
    this.setupAudio();
  }

  setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    this.renderer.domElement.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      },
      { passive: true }
    );

    this.renderer.domElement.addEventListener(
      "touchend",
      (e) => {
        if (e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const touchEndTime = Date.now();
          const touchDuration = touchEndTime - touchStartTime;

          // Detect tap gesture
          if (
            touchDuration < 300 &&
            Math.abs(touchEndX - touchStartX) < 10 &&
            Math.abs(touchEndY - touchStartY) < 10
          ) {
            this.onTap();
          }
        }
      },
      { passive: true }
    );
  }

  onTap() {
    // Handle tap gesture - could toggle music controls visibility
    if (this.musicControls && this.musicControls.hidden) {
      this.musicControls.hidden = false;
      this.musicControls.style.opacity = "0.8";
    }
  }

  setupControls() {
    this.controls = new THREE.TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.noPan = true;
    this.controls.maxDistance = CONFIG.CONTROLS_MAX_DISTANCE;
    this.controls.minDistance = CONFIG.CONTROLS_MIN_DISTANCE;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  setupGroup() {
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  setupParticles() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      vertexColors: true,
      size: CONFIG.PARTICLE_SIZE,
      transparent: true,
      opacity: 0.8,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.group.add(this.particles);
  }

  setupAnimation() {
    // Use GSAP for heartbeat animation with reduced motion support
    if (CONFIG.REDUCED_MOTION) {
      // Simplified animation for reduced motion preference
      this.beat.a = CONFIG.BEAT_MAX_VALUE * 0.3;
    } else {
      gsap
        .timeline({
          repeat: -1,
          repeatDelay: CONFIG.BEAT_REPEAT_DELAY,
        })
        .to(this.beat, {
          a: CONFIG.BEAT_MAX_VALUE,
          duration: CONFIG.BEAT_DURATION,
          ease: "power2.in",
        })
        .to(this.beat, {
          a: 0.0,
          duration: CONFIG.BEAT_DURATION,
          ease: "power3.out",
        });
    }
  }

  startAnimation() {
    this.isAnimating = true;
    this.lastRenderTime = performance.now();

    // Use requestAnimationFrame with performance monitoring
    const animate = (currentTime) => {
      if (!this.isAnimating) return;

      // Frame skipping for performance
      const deltaTime = currentTime - this.lastRenderTime;
      if (deltaTime < CONFIG.FRAME_SKIP_THRESHOLD) {
        requestAnimationFrame(animate);
        return;
      }

      try {
        this.render(currentTime);
        this.lastRenderTime = currentTime;
      } catch (error) {
        console.error("Render error:", error);
        this.isAnimating = false;
        Utils.showError(
          "Rendering error occurred. Please refresh the page.",
          () => {
            window.location.reload();
          }
        );
        return;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  setupAudio() {
    try {
      // Create audio element
      this.audio = new Audio("/heart-animation/assets/music/Goy Arachaporn.mp3");
      this.audio.preload = "auto";
      this.audio.volume = CONFIG.AUDIO_VOLUME; // Set volume to 70%
      this.audio.loop = true; // Enable auto-replay

      // Add event listeners for audio
      this.audio.addEventListener("canplaythrough", () => {
        // Audio loaded and ready to play
      });

      this.audio.addEventListener("error", (error) => {
        console.error("Audio loading error:", error);
        this.showAudioError();
      });

      this.audio.addEventListener("ended", () => {
        // Audio playback ended - restarting automatically
        // The loop property should handle this automatically, but we'll add a fallback
        if (!this.audio.loop) {
          this.audio.currentTime = 0;
          this.audio.play().catch((error) => {
            console.error("Failed to restart audio:", error);
          });
        }
      });

      // Add loading progress
      this.audio.addEventListener("loadstart", () => {
        // Audio loading started
      });

      this.audio.addEventListener("loadeddata", () => {
        // Audio data loaded
      });
    } catch (error) {
      console.error("Failed to setup audio:", error);
      this.showAudioError();
    }
  }

  showAudioError() {
    console.warn("Audio file not available - continuing without music");
    // Optionally show a subtle notification to the user
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 119, 252, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 1000;
      animation: fadeInOut 3s ease-in-out;
    `;
    notification.textContent = "🎵 Music file not found";
    document.body.appendChild(notification);

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(100px); }
        20% { opacity: 1; transform: translateX(0); }
        80% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(100px); }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  showLoopStatus() {
    const message = this.audio.loop ? "🔄 Loop enabled" : "⏹️ Loop disabled";
    Utils.showNotification(message, this.audio.loop ? "success" : "warning");
  }

  toggleControlsVisibility() {
    if (this.musicControls) {
      const isVisible = !this.musicControls.hidden;

      if (isVisible) {
        this.musicControls.style.opacity = "0";
        setTimeout(() => {
          this.musicControls.hidden = true;
        }, 300);
        Utils.updateAriaLive("Controls hidden", "polite");
        Utils.showNotification("👁️ Controls hidden", "info");
      } else {
        this.musicControls.hidden = false;
        this.musicControls.style.opacity = "0.8";
        Utils.updateAriaLive("Controls shown", "polite");
        Utils.showNotification("👁️ Controls shown", "success");
      }
    }
  }

  playAudio() {
    if (this.audio) {
      try {
        // Check if audio is already playing
        if (this.audio.paused) {
          // Try to play with better error handling
          const playPromise = this.audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                Utils.updateAriaLive("Music started playing", "polite");
              })
              .catch((error) => {
                console.error("Failed to play audio:", error);
                // Handle autoplay restrictions
                this.handleAutoplayRestriction();
              });
          }
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  }

  handleAutoplayRestriction() {
    // Create a user interaction prompt for audio
    const audioPrompt = document.createElement("div");
    audioPrompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #ff77fc;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 2000;
      font-family: Arial, sans-serif;
      border: 2px solid #ff77fc;
    `;
    audioPrompt.innerHTML = `
      <h3>🎵 Music Ready!</h3>
      <p>Click anywhere to start the music</p>
      <button style="
        background: #ff77fc;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
      ">Play Music</button>
    `;

    document.body.appendChild(audioPrompt);

    const playButton = audioPrompt.querySelector("button");
    const playMusic = () => {
      this.audio
        .play()
        .then(() => {
          document.body.removeChild(audioPrompt);
        })
        .catch((error) => {
          console.error("Still failed to play audio:", error);
        });
    };

    playButton.addEventListener("click", playMusic);
    audioPrompt.addEventListener("click", playMusic);
  }

  loadHeartModel() {
    const loader = new THREE.OBJLoader();

    // Update loading progress
    Utils.updateLoadingProgress(95);
    Utils.updateAriaLive("Loading 3D heart model...", "polite");

    loader.load(
      "https://assets.codepen.io/127738/heart_2.obj",
      (obj) => {
        this.onHeartLoaded(obj);
      },
      (progress) => {
        this.onHeartProgress(progress);
      },
      (error) => {
        this.onHeartError(error);
      }
    );
  }

  onHeartLoaded(obj) {
    try {
      Utils.updateAriaLive("3D heart model loaded successfully", "polite");

      this.heart = obj.children[0];
      this.setupHeartGeometry();
      this.setupHeartMaterial();

      this.originHeart = Array.from(
        this.heart.geometry.attributes.position.array
      );
      this.sampler = new THREE.MeshSurfaceSampler(this.heart).build();
      
      this.initParticles();
      this.setupHeartText();
      this.startAnimation();
      this.hideLoading();

      // Play the "she-says" song after the model is loaded
      this.playAudio();

      // Update ARIA for screen readers
      if (this.mainContent) {
        this.mainContent.setAttribute(
          "aria-label",
          "3D Heart Animation - Model loaded and ready for interaction"
        );
      }

      Utils.updateLoadingProgress(100);
      Utils.hideError(); // Hide any previous errors
    } catch (error) {
      console.error("Error setting up heart:", error);
      Utils.showError(
        "Failed to setup heart model. Please refresh the page.",
        () => {
          window.location.reload();
        }
      );
    }
  }

  onHeartProgress(progress) {
    const percent = Math.round((progress.loaded / progress.total) * 100);
    Utils.updateLoadingProgress(95 + percent * 0.05); // Last 5% of loading
  }

  onHeartError(error) {
    console.error("Error loading heart model:", error);
    Utils.showError(
      "Failed to load heart model. Please check your internet connection and refresh the page.",
      () => {
        this.loadHeartModel(); // Retry loading
      }
    );
  }

  setupHeartGeometry() {
    this.heart.geometry.rotateX(CONFIG.HEART_ROTATION);
    this.heart.geometry.scale(
      CONFIG.HEART_SCALE,
      CONFIG.HEART_SCALE,
      CONFIG.HEART_SCALE
    );
    this.heart.geometry.translate(0, CONFIG.HEART_TRANSLATE_Y, 0);
    this.group.add(this.heart);
  }

  setupHeartMaterial() {
    this.heart.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#000000"),
      transparent: true,
      opacity: 0.3,
    });
  }

  initParticles() {
    this.spikes = [];
    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      this.spikes.push(
        new SparkPoint(this.sampler, this.palette, this.simplex, this.pos)
      );
    }
  }

  hideLoading() {
    if (this.loadingElement) {
        this.loadingElement.style.opacity = '0';
        setTimeout(() => {
            this.loadingElement.style.display = 'none';
        }, 1000);
    }

    if (this.mainContent) {
        this.mainContent.hidden = false;
    }

    Utils.showNotification(
      "💖 Chào mừng em!",
      "success"
    );

    const rotationHint = document.getElementById('rotation-hint');
    if (rotationHint) {
        rotationHint.hidden = false;
        setTimeout(() => {
            rotationHint.classList.add('show');
        }, 500);
    }
  }

  showError(message) {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.innerHTML = `
        <div>
          <div class="loading-text" style="color: #ff4444;">${message}</div>
          <div class="loading-text" style="font-size: 14px; margin-top: 10px;">Please refresh the page to try again.</div>
        </div>
      `;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  onKeyDown(event) {
    switch (event.key) {
      case "ArrowUp":
        this.camera.position.y += 0.1;
        break;
      case "ArrowDown":
        this.camera.position.y -= 0.1;
        break;
      case "ArrowLeft":
        this.camera.position.x -= 0.1;
        break;
      case "ArrowRight":
        this.camera.position.x += 0.1;
        break;
      case " ":
        // Toggle animation
        this.isAnimating = !this.isAnimating;
        if (this.isAnimating) {
          this.renderer.setAnimationLoop((time) => this.render(time));
          Utils.showNotification("▶️ Animation started", "success");
        } else {
          this.renderer.setAnimationLoop(null);
          Utils.showNotification("⏸️ Animation paused", "warning");
        }
        break;
      case "m":
      case "M":
        // Toggle music play/pause
        if (this.audio) {
          if (this.audio.paused) {
            this.audio.play();
            Utils.showNotification("🎵 Music playing", "success");
          } else {
            this.audio.pause();
            Utils.showNotification("⏸️ Music paused", "warning");
          }
        } else {
          Utils.showNotification("❌ No audio available", "error");
        }
        break;
      case "r":
      case "R":
        // Restart music
        if (this.audio) {
          this.audio.currentTime = 0;
          this.audio.play();
          Utils.showNotification("🔄 Music restarted", "success");
        } else {
          Utils.showNotification("❌ No audio available", "error");
        }
        break;
      case "+":
      case "=":
        // Increase volume
        if (this.audio && this.audio.volume < 1.0) {
          this.audio.volume = Math.min(1.0, this.audio.volume + 0.1);
          const volumePercent = Math.round(this.audio.volume * 100);
          Utils.showNotification(`🔊 Volume: ${volumePercent}%`, "info");
        } else if (this.audio) {
          Utils.showNotification("🔊 Volume at maximum", "warning");
        } else {
          Utils.showNotification("❌ No audio available", "error");
        }
        break;
      case "-":
        // Decrease volume
        if (this.audio && this.audio.volume > 0.0) {
          this.audio.volume = Math.max(0.0, this.audio.volume - 0.1);
          const volumePercent = Math.round(this.audio.volume * 100);
          Utils.showNotification(`🔊 Volume: ${volumePercent}%`, "info");
        } else if (this.audio) {
          Utils.showNotification("🔊 Volume at minimum", "warning");
        } else {
          Utils.showNotification("❌ No audio available", "error");
        }
        break;
      case "l":
      case "L":
        // Toggle loop
        if (this.audio) {
          this.audio.loop = !this.audio.loop;
          if (this.audio.loop) {
            Utils.showNotification("🔄 Loop enabled", "success");
          } else {
            Utils.showNotification("⏹️ Loop disabled", "warning");
          }
        } else {
          Utils.showNotification("❌ No audio available", "error");
        }
        break;
      case "h":
      case "H":
        // Toggle controls visibility
        this.toggleControlsVisibility();
        break;
      case "t":
      case "T":
        // Toggle heart text visibility
        if (this.heartText) {
          this.heartText.visible = !this.heartText.visible;
          const message = this.heartText.visible ? "💕 Text visible" : "💕 Text hidden";
          Utils.showNotification(message, this.heartText.visible ? "success" : "warning");
        } else {
          Utils.showNotification("❌ No text available", "error");
        }
        break;
    }
  }

  render(time) {
    if (!this.isAnimating || !this.heart) return;

    // Check if page is visible for performance
    if (document.hidden) {
      return;
    }

    try {
      this.updateParticles();
      this.updateHeartGeometry(time);
      this.updateControls();
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      console.error("Render loop error:", error);
      throw error; // Re-throw to be caught by animate function
    }
  }

  updateParticles() {
    let posIdx = 0,
      colorIdx = 0;
    const spikes = this.spikes;
    const positions = this.positions;
    const colors = this.colors;
    const beat = this.beat;

    for (let i = 0, len = spikes.length; i < len; i++) {
      const spike = spikes[i];
      spike.update(beat);

      const rand = spike.rand;
      const color = spike.color;
      const one = spike.one;
      const two = spike.two;

      // First particle layer
      if (MAX_Z_RATE_Z + rand > one.z && one.z > -MAX_Z_RATE_Z - rand) {
        positions[posIdx++] = one.x;
        positions[posIdx++] = one.y;
        positions[posIdx++] = one.z;
        colors[colorIdx++] = color.r;
        colors[colorIdx++] = color.g;
        colors[colorIdx++] = color.b;
      }

      // Second particle layer
      if (MAX_Z_RATE_Z + rand * 2 > one.z && one.z > -MAX_Z_RATE_Z - rand * 2) {
        positions[posIdx++] = two.x;
        positions[posIdx++] = two.y;
        positions[posIdx++] = two.z;
        colors[colorIdx++] = color.r;
        colors[colorIdx++] = color.g;
        colors[colorIdx++] = color.b;
      }
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions.subarray(0, posIdx), 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors.subarray(0, colorIdx), 3)
    );
  }

  updateHeartGeometry(time) {
    const vs = this.heart.geometry.attributes.position.array;
    const originHeart = this.originHeart;
    const tempVec3 = this.tempVec3;
    const simplex = this.simplex;
    const beat = this.beat.a;
    const timeFactor = time * 0.000625;

    for (let i = 0, len = vs.length; i < len; i += 3) {
      const x = originHeart[i];
      const y = originHeart[i + 1];
      const z = originHeart[i + 2];

      const noise =
        simplex.noise4D(
          x * CONFIG.NOISE_SCALE,
          y * CONFIG.NOISE_SCALE,
          z * CONFIG.NOISE_SCALE,
          timeFactor
        ) + 1;

      const scale = noise * NOISE_SCALE_AMPLITUDE * beat;
      vs[i] = x * scale;
      vs[i + 1] = y * scale;
      vs[i + 2] = z * scale;
    }

    this.heart.geometry.attributes.position.needsUpdate = true;
    
    // Update text animation
    this.updateTextAnimation(time);
  }

  updateTextAnimation(time) {
    if (this.heartText && this.textAnimation) {
      const timeFactor = time * 0.001;

      // Gentle floating animation
      const floatY = Math.sin(timeFactor * this.textAnimation.frequency) * this.textAnimation.amplitude;
      this.heartText.position.y = floatY;

      // Pulse scale with heart beat
      const scale = 1 + (Math.sin(timeFactor * 5) * 0.05);
      this.heartText.scale.setScalar(scale);
    } else if (this.heartText) {
      // For fallback text, just keep it simple without animation
      // The text will rotate with the main group
    }
  }

  updateControls() {
    this.controls.update();
  }

  // Cleanup method for memory management
  cleanup() {
    this.isAnimating = false;

    // Stop audio
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }

    // Clear audio fade interval
    if (this.audioFadeInterval) {
      clearInterval(this.audioFadeInterval);
      this.audioFadeInterval = null;
    }

    // Dispose of text resources
    if (this.heartText) {
      if (this.heartText.geometry) {
        this.heartText.geometry.dispose();
      }
      if (this.heartText.material) {
        this.heartText.material.dispose();
      }
      this.heartText = null;
    }

    // Dispose of lighting
    if (this.lights) {
      if (this.lights.directional) {
        this.lights.directional.dispose();
      }
      if (this.lights.point) {
        this.lights.point.dispose();
      }
      this.lights = null;
    }

    // Dispose of Three.js resources
    if (this.geometry) {
      this.geometry.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    // Clear arrays
    this.spikes = [];
    this.positions = null;
    this.colors = null;
  }

  setupHeartText() {
    try {
      const loader = new THREE.FontLoader();
      const fontUrl = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_regular.typeface.json';

      loader.load(fontUrl, (font) => {
        const textContent = 'Anh yeu Em\nMinh Ngoc';
        const textGeometry = new THREE.TextGeometry(textContent, {
          font: font,
          size: 0.07,
          height: 0.01,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.003,
          bevelSize: 0.002,
          bevelOffset: 0,
          bevelSegments: 5
        });

        textGeometry.center();

        const textMaterial = new THREE.MeshPhongMaterial({ 
          color: 0xffddff, 
          emissive: 0x440011,
          shininess: 100,
          transparent: true,
          opacity: 0.95
        });
        
        this.heartText = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text to stand upright inside the heart
        this.heartText.position.set(0, 0, 0.05);
        this.group.add(this.heartText);

        this.textAnimation = {
            amplitude: 0.01,
            frequency: 1.5,
        };

        console.log('💕 3D text "Anh yêu Em, Minh Ngọc" created successfully!');

      }, undefined, (error) => {
        console.error('Error loading font:', error);
        this.createFallbackText();
      });

    } catch (error) {
      console.error('Error setting up heart text:', error);
      this.createFallbackText();
    }
  }

  createFallbackText() {
    // Fallback to 2D text if 3D creation fails
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#ff77fc');
    gradient.addColorStop(0.5, '#ff77ae');
    gradient.addColorStop(1, '#ff1775');
    ctx.fillStyle = gradient;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textLines = ['Anh yêu Em', 'Minh Ngọc'];
    const lineHeight = 70;
    const startY = canvas.height / 2 - (textLines.length - 1) * lineHeight / 2;

    textLines.forEach((line, index) => {
      const y = startY + index * lineHeight;
      ctx.font = 'bold 55px Arial, sans-serif';
      ctx.fillText(line, canvas.width / 2, y);
    });

    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(0.8, 0.4);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    this.heartText = new THREE.Mesh(textGeometry, textMaterial);
    // Position the fallback text to stand upright
    this.heartText.position.set(0, 0, 0.1);
    this.group.add(this.heartText);
  }
}

// SparkPoint class for particle management
class SparkPoint {
  constructor(sampler, palette, simplex, pos) {
    sampler.sample(pos);
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.rand = Math.random() * CONFIG.PARTICLE_RANDOM_FACTOR;
    this.pos = pos.clone();
    this.one = null;
    this.two = null;
    this.simplex = simplex;
  }

  update(beat) {
    const noise =
      this.simplex.noise4D(
        this.pos.x * 1,
        this.pos.y * 1,
        this.pos.z * 1,
        0.1
      ) + 1.5;

    const noise2 =
      this.simplex.noise4D(
        this.pos.x * CONFIG.NOISE_FREQUENCY,
        this.pos.y * CONFIG.NOISE_FREQUENCY,
        this.pos.z * CONFIG.NOISE_FREQUENCY,
        1
      ) + 1;

    this.one = this.pos
      .clone()
      .multiplyScalar(1.01 + noise * NOISE_SCALE_AMPLITUDE * beat.a);
    this.two = this.pos
      .clone()
      .multiplyScalar(1.01 + noise2 * NOISE_SCALE_AMPLITUDE * beat.a);
  }
}

// Initialize and start the application
window.addEventListener('DOMContentLoaded', () => {
    const app = new HeartAnimation();
    app.init();
});

// Handle page visibility changes for performance
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause animation when tab is not visible
    Utils.updateAriaLive("Animation paused", "polite");
  } else {
    // Resume animation when tab becomes visible
    Utils.updateAriaLive("Animation resumed", "polite");
  }
});

// Handle page unload for cleanup
window.addEventListener("beforeunload", () => {
  if (window.heartAnimation) {
    window.heartAnimation.cleanup();
  }
});

// Handle errors globally
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  Utils.showError(
    "An unexpected error occurred. Please refresh the page.",
    () => {
      window.location.reload();
    }
  );
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  Utils.showError(
    "An error occurred while loading resources. Please refresh the page.",
    () => {
      window.location.reload();
    }
  );
});

// Service Worker registration for offline capability (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Service Worker registered successfully
      })
      .catch((registrationError) => {
        // Service Worker registration failed
      });
  });
}
