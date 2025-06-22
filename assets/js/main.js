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

  // Animation settings (increased by 15%)
  BEAT_DURATION: 0.51, // Reduced from 0.6
  BEAT_REPEAT_DELAY: 0.255, // Reduced from 0.3
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
    // Initialize properties
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.group = null;
    this.heart = null;
    this.smallHeart = null;
    this.sampler = null;
    this.originHeart = null;
    this.particles = null;
    this.geometry = null;
    this.material = null;
    this.spikes = [];
    this.positions = new Float32Array(PARTICLE_COUNT_6);
    this.colors = new Float32Array(PARTICLE_COUNT_6);
    this.beat = { a: 0 };
    this.simplex = new SimplexNoise();
    this.pos = new THREE.Vector3();
    this.palette = CONFIG.COLORS.map((color) => new THREE.Color(color));
    this.isLoaded = false;
    this.isAnimating = false;
    this.tempVec3 = new THREE.Vector3();
    this.lastFrameTime = 0;

    // Audio properties
    this.audio = null;
    this.audioContext = null;
    this.audioSource = null;
    this.audioFadeInterval = null;

    // Performance properties
    this.frameSkipCount = 0;
    this.lastRenderTime = 0;

    // Cache DOM elements
    this.loadingElement = document.getElementById("loading");
    this.musicControls = document.getElementById("music-controls");
    this.helpButton = document.getElementById("help-button");
    this.mainContent = document.getElementById("main-content");
    
    // Question overlay elements
    this.loveQuestionOverlay = document.getElementById("love-question-overlay");
    this.yesBtn = document.getElementById("yes-btn");
    this.noBtn = document.getElementById("no-btn");
    this.questionContainer = document.querySelector(".question-container");
    this.questionContent = document.getElementById("question-content");
    this.modelInstruction = document.getElementById("model-instruction");

    // Bind event handlers
    this.boundOnWindowResize = this.onWindowResize.bind(this);
    this.boundDispose = this.dispose.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);

    // Initialize the application
    this.init();

    // Add event listeners
    window.addEventListener("resize", this.boundOnWindowResize);
    window.addEventListener("beforeunload", this.boundDispose);
    document.addEventListener("keydown", this.boundOnKeyDown);
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add event listeners
    window.addEventListener("resize", this.boundOnWindowResize);
    window.addEventListener("beforeunload", this.boundDispose);
    document.addEventListener("keydown", this.boundOnKeyDown);

    // Button listeners
    this.yesBtn.addEventListener("click", () => this.handleYesClick());
    this.noBtn.addEventListener("mouseover", () => this.handleNoMouseOver());
  }

  handleYesClick() {
    console.log("Yes button clicked!"); // Debug log
    
    // 1. Change the "Yes" button text and expand it
    if (this.yesBtn) {
      this.yesBtn.textContent = "yêu em";
      this.yesBtn.classList.add("btn-expanded");
    }

    // 2. Hide the "No" button
    if (this.noBtn) {
      this.noBtn.classList.add("hidden");
    }

    // 3. After a delay, start the transition
    setTimeout(() => {
      console.log("Starting animation transition"); // Debug log
      this.loveQuestionOverlay.classList.add("hidden");
      this.loadingElement.classList.remove("hidden");
      this.startAnimationFlow();
    }, 2000); // Wait 2 seconds before transitioning
  }

  handleNoMouseOver() {
    const noBtn = this.noBtn;
    const container = this.questionContainer;
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();

    let newTop = Math.random() * (containerRect.height - btnRect.height);
    let newLeft = Math.random() * (containerRect.width - btnRect.width);

    noBtn.style.position = 'absolute';
    noBtn.style.top = `${newTop}px`;
    noBtn.style.left = `${newLeft}px`;
  }

  startAnimationFlow() {
    this.checkWebGLSupport();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.mainContent.appendChild(this.renderer.domElement);
    this.setupControls();
    this.setupGroup();
    this.setupParticles();
    this.setupAnimation();
    this.setupAudio();
    this.loadHeartModel();
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
    
    // Add lighting for better small heart visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
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
      this.audio = new Audio("assets/music/Goy_Arachaporn.mp3");
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
      
      this.createClonedHeart();

      this.setupHeartMaterial();
      this.setupSampler();
      this.initParticles();
      
      this.startAnimation();
      this.hideLoading();

      // Play the "Goy_Arachaporn" song after the model is loaded
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

  setupSampler() {
    this.originHeart = Array.from(
      this.heart.geometry.attributes.position.array
    );
    this.sampler = new THREE.MeshSurfaceSampler(this.heart).build();
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
      this.loadingElement.classList.add("hidden");
      setTimeout(() => {
        this.loadingElement.style.display = "none";
        // Focus the main content for accessibility
        if (this.mainContent) {
          this.mainContent.focus();
        }

        // Show 3D model instruction
        if (this.modelInstruction) {
          this.modelInstruction.classList.add("visible");
        }

        // Show welcome message with keyboard shortcuts
        Utils.showNotification(
          "💖 3D Heart Animation loaded! Press H for help",
          "success"
        );
        setTimeout(() => {
          Utils.showNotification(
            "⌨️ Use arrow keys to move camera, Space to pause/resume",
            "info"
          );
        }, 2000);
      }, 500);
    }

    Utils.updateAriaLive("3D Heart Animation loaded and ready", "assertive");
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
      this.updateSmallHeart();
      this.updateControls();
      this.renderer.render(this.scene, this.camera);
    } catch (error) {
      console.error("Render loop error:", error);
      throw error; // Re-throw to be caught by animate function
    }
  }

  updateControls() {
    this.controls.update();
    this.heart.geometry.attributes.position.needsUpdate = true;
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
    const timeFactor = time * 0.0005;

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
  }

  updateSmallHeart() {
    if (!this.smallHeart) return;
    const beat = this.beat.a;
    const pulsation = 1 + beat * 0.4;
    this.smallHeart.scale.setScalar(0.25 * pulsation);
  }

  createClonedHeart() {
    if (!this.heart || !this.group) return;

    const smallHeartGeometry = this.heart.geometry.clone();
    const smallHeartMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000, // Solid red
      shininess: 80,
    });

    this.smallHeart = new THREE.Mesh(smallHeartGeometry, smallHeartMaterial);
    
    this.group.add(this.smallHeart);
  }

  // Audio control methods
  stopAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.audioSource) {
      this.audioSource = null;
    }
  }

  // Cleanup method for memory management
  dispose() {
    // Stop animation
    this.isAnimating = false;

    // Dispose of geometries
    if (this.geometry) {
      this.geometry.dispose();
    }

    // Dispose of materials
    if (this.material) {
      this.material.dispose();
    }

    // Dispose of small heart
    if (this.smallHeart) {
      if (this.smallHeart.geometry) {
        this.smallHeart.geometry.dispose();
      }
      if (this.smallHeart.material) {
        this.smallHeart.material.dispose();
      }
      this.smallHeart = null;
    }

    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Dispose of controls
    if (this.controls) {
      this.controls.dispose();
    }

    // Stop audio
    this.stopAudio();

    // Clear intervals
    if (this.audioFadeInterval) {
      clearInterval(this.audioFadeInterval);
    }

    // Remove event listeners
    window.removeEventListener("resize", this.boundOnWindowResize);
    window.removeEventListener("beforeunload", this.boundDispose);
    document.removeEventListener("keydown", this.boundOnKeyDown);

    // Clear references
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.group = null;
    this.heart = null;
    this.sampler = null;
    this.originHeart = null;
    this.particles = null;
    this.geometry = null;
    this.material = null;
    this.spikes = [];
    this.positions = null;
    this.colors = null;
    this.beat = null;
    this.simplex = null;
    this.pos = null;
    this.palette = null;
    this.audio = null;
    this.audioContext = null;
    this.audioSource = null;
    this.audioFadeInterval = null;
    this.loadingElement = null;
    this.musicControls = null;
    this.helpButton = null;
    this.mainContent = null;

    console.log("Heart animation disposed successfully");
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
      .multiplyScalar(1 + noise2 * (beat.a + 0.3) - beat.a * 1.2);
  }
}

// Background Effects Manager Class
class BackgroundEffectsManager {
  constructor() {
    this.particlesContainer = document.getElementById('background-particles');
    this.shapesContainer = document.getElementById('background-shapes');
    this.heartBgContainer = document.getElementById('heart-bg');
    this.canvas = document.getElementById('background-canvas');
    this.ctx = null;
    this.particles = [];
    this.shapes = [];
    this.hearts = [];
    this.isActive = false;
    this.init();
  }

  init() {
    this.setupCanvas();
    this.createBackgroundParticles();
    this.createBackgroundShapes();
    this.createHeartBackground();
    this.startAnimation();
  }

  setupCanvas() {
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  createBackgroundParticles() {
    if (!this.particlesContainer) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'bg-particle';
      
      // Random position and delay
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${20 + Math.random() * 15}s`;
      
      this.particlesContainer.appendChild(particle);
    }
  }

  createBackgroundShapes() {
    if (!this.shapesContainer) return;

    const shapeTypes = ['large', 'medium', 'small'];
    
    for (let i = 0; i < 15; i++) {
      const shape = document.createElement('div');
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      shape.className = `bg-shape ${type}`;
      
      // Random position and delay
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.animationDelay = `${Math.random() * 40}s`;
      
      this.shapesContainer.appendChild(shape);
    }
  }

  createHeartBackground() {
    if (!this.heartBgContainer) return;

    const heartSymbols = ['❤️', '💖', '💕', '💗', '💓', '💝', '💞', '💟'];
    
    for (let i = 0; i < 20; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-bg-element';
      heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
      
      // Random position and delay
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 60}s`;
      heart.style.animationDuration = `${60 + Math.random() * 20}s`;
      
      this.heartBgContainer.appendChild(heart);
    }
  }

  startAnimation() {
    this.isActive = true;
    if (this.canvas && this.ctx) {
      this.animateCanvas();
    }
  }

  animateCanvas() {
    if (!this.isActive || !this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Create floating orbs
    this.createFloatingOrbs();
    
    // Create wave effects
    this.createWaveEffects();

    requestAnimationFrame(() => this.animateCanvas());
  }

  createFloatingOrbs() {
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 8; i++) {
      const x = (this.canvas.width / 8) * i + Math.sin(time + i) * 50;
      const y = this.canvas.height / 2 + Math.cos(time + i * 0.5) * 100;
      const radius = 20 + Math.sin(time + i) * 10;
      
      // Create gradient
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 105, 180, ${0.3 + Math.sin(time + i) * 0.1})`);
      gradient.addColorStop(0.5, `rgba(221, 160, 221, ${0.2 + Math.sin(time + i) * 0.1})`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  createWaveEffects() {
    const time = Date.now() * 0.001;
    const waveCount = 3;
    
    for (let w = 0; w < waveCount; w++) {
      this.ctx.strokeStyle = `rgba(255, 105, 180, ${0.1 - w * 0.02})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      
      for (let x = 0; x < this.canvas.width; x += 5) {
        const y = this.canvas.height / 2 + 
                  Math.sin(x * 0.01 + time + w) * 50 +
                  Math.sin(x * 0.005 + time * 0.5 + w) * 30;
        
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.stroke();
    }
  }

  // Add special effects for interactions
  addInteractionEffect(x, y) {
    if (!this.ctx) return;

    // Create ripple effect
    const ripple = {
      x: x,
      y: y,
      radius: 0,
      maxRadius: 100,
      alpha: 1,
      speed: 3
    };

    const animateRipple = () => {
      if (ripple.radius >= ripple.maxRadius || ripple.alpha <= 0) return;

      ripple.radius += ripple.speed;
      ripple.alpha -= 0.02;

      this.ctx.strokeStyle = `rgba(255, 105, 180, ${ripple.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.ctx.stroke();

      requestAnimationFrame(animateRipple);
    };

    animateRipple();
  }

  // Add sparkle effect
  addSparkleEffect(x, y) {
    if (!this.ctx) return;

    for (let i = 0; i < 8; i++) {
      const sparkle = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        decay: 0.02
      };

      const animateSparkle = () => {
        if (sparkle.life <= 0) return;

        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.life -= sparkle.decay;

        this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.life})`;
        this.ctx.beginPath();
        this.ctx.arc(sparkle.x, sparkle.y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        requestAnimationFrame(animateSparkle);
      };

      animateSparkle();
    }
  }

  // Intensify background effects
  intensify() {
    // Add more particles temporarily
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        if (this.particlesContainer) {
          const particle = document.createElement('div');
          particle.className = 'bg-particle';
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.animationDelay = '0s';
          particle.style.animationDuration = `${15 + Math.random() * 10}s`;
          this.particlesContainer.appendChild(particle);

          // Remove after animation
          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }, 25000);
        }
      }, i * 200);
    }
  }

  dispose() {
    this.isActive = false;
    
    // Clear containers
    if (this.particlesContainer) {
      this.particlesContainer.innerHTML = '';
    }
    if (this.shapesContainer) {
      this.shapesContainer.innerHTML = '';
    }
    if (this.heartBgContainer) {
      this.heartBgContainer.innerHTML = '';
    }
    
    // Clear canvas
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Scene Transition Manager Class
class SceneTransitionManager {
  constructor() {
    this.transitionTypes = {
      FADE: 'fade',
      SLIDE: 'slide',
      CIRCULAR: 'circular',
      PARTICLE_EXPLOSION: 'particle-explosion',
      HEART_BURST: 'heart-burst',
      MATRIX_RAIN: 'matrix-rain',
      STAR_FIELD: 'star-field',
      LOVE_MESSAGE: 'love-message'
    };
    this.currentTransition = null;
  }

  // Fade transition
  fadeTransition(duration = 1000, callback = null) {
    const fade = document.createElement('div');
    fade.className = 'scene-transition';
    document.body.appendChild(fade);

    setTimeout(() => fade.classList.add('active'), 10);

    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        fade.classList.remove('active');
        setTimeout(() => {
          if (fade.parentNode) fade.parentNode.removeChild(fade);
        }, 800);
      }, duration);
    }, 800);
  }

  // Slide transition
  slideTransition(direction = 'left', callback = null) {
    const slide = document.createElement('div');
    slide.className = 'slide-transition';
    if (direction === 'right') {
      slide.style.transform = 'translateX(100%)';
    }
    document.body.appendChild(slide);

    setTimeout(() => slide.classList.add('active'), 10);

    setTimeout(() => {
      if (callback) callback();
      slide.classList.add('exit');
      setTimeout(() => {
        if (slide.parentNode) slide.parentNode.removeChild(slide);
      }, 1000);
    }, 1000);
  }

  // Circular reveal transition
  circularReveal(callback = null) {
    const circle = document.createElement('div');
    circle.className = 'circular-reveal';
    document.body.appendChild(circle);

    setTimeout(() => circle.classList.add('active'), 10);

    setTimeout(() => {
      if (callback) callback();
      setTimeout(() => {
        if (circle.parentNode) circle.parentNode.removeChild(circle);
      }, 1200);
    }, 1200);
  }

  // Particle explosion effect
  particleExplosion(x = window.innerWidth / 2, y = window.innerHeight / 2, callback = null) {
    const explosion = document.createElement('div');
    explosion.className = 'particle-explosion';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    document.body.appendChild(explosion);

    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      
      const angle = (i / 20) * Math.PI * 2;
      const distance = 100 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      
      explosion.appendChild(particle);
    }

    if (callback) callback();

    setTimeout(() => {
      if (explosion.parentNode) explosion.parentNode.removeChild(explosion);
    }, 1500);
  }

  // Heart burst effect
  heartBurst(x = window.innerWidth / 2, y = window.innerHeight / 2, callback = null) {
    const burst = document.createElement('div');
    burst.className = 'heart-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    document.body.appendChild(burst);

    const hearts = ['❤️', '💖', '💕', '💗', '💓', '💝', '💞', '💟'];
    
    for (let i = 0; i < 12; i++) {
      const heart = document.createElement('div');
      heart.className = 'burst-heart';
      heart.textContent = hearts[i % hearts.length];
      
      const angle = (i / 12) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      heart.style.setProperty('--x', `${x}px`);
      heart.style.setProperty('--y', `${y}px`);
      
      burst.appendChild(heart);
    }

    if (callback) callback();

    setTimeout(() => {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 2000);
  }

  // Matrix rain effect
  matrixRain(duration = 3000, callback = null) {
    const matrix = document.createElement('div');
    matrix.className = 'matrix-rain';
    document.body.appendChild(matrix);

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    for (let i = 0; i < 50; i++) {
      const column = document.createElement('div');
      column.className = 'rain-column';
      column.style.left = `${Math.random() * 100}%`;
      column.style.animationDelay = `${Math.random() * 3}s`;
      column.style.animationDuration = `${2 + Math.random() * 2}s`;
      
      let text = '';
      for (let j = 0; j < 20; j++) {
        text += characters[Math.floor(Math.random() * characters.length)] + '<br>';
      }
      column.innerHTML = text;
      
      matrix.appendChild(column);
    }

    if (callback) callback();

    setTimeout(() => {
      if (matrix.parentNode) matrix.parentNode.removeChild(matrix);
    }, duration);
  }

  // Star field effect
  starField(duration = 4000, callback = null) {
    const starField = document.createElement('div');
    starField.className = 'star-field';
    document.body.appendChild(starField);

    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      starField.appendChild(star);
    }

    if (callback) callback();

    setTimeout(() => {
      if (starField.parentNode) starField.parentNode.removeChild(starField);
    }, duration);
  }

  // Love message transition
  loveMessageTransition(message = '💕 Yêu em! 💕', duration = 3000, callback = null) {
    const loveTransition = document.createElement('div');
    loveTransition.className = 'love-transition';
    document.body.appendChild(loveTransition);

    const messageElement = document.createElement('div');
    messageElement.className = 'love-transition-message';
    messageElement.textContent = message;
    loveTransition.appendChild(messageElement);

    setTimeout(() => loveTransition.classList.add('active'), 10);

    if (callback) callback();

    setTimeout(() => {
      loveTransition.classList.remove('active');
      setTimeout(() => {
        if (loveTransition.parentNode) loveTransition.parentNode.removeChild(loveTransition);
      }, 1000);
    }, duration);
  }

  // Random transition
  randomTransition(callback = null) {
    const transitions = [
      () => this.fadeTransition(1000, callback),
      () => this.slideTransition('left', callback),
      () => this.circularReveal(callback),
      () => this.particleExplosion(window.innerWidth / 2, window.innerHeight / 2, callback),
      () => this.heartBurst(window.innerWidth / 2, window.innerHeight / 2, callback),
      () => this.matrixRain(3000, callback),
      () => this.starField(4000, callback),
      () => this.loveMessageTransition('💕 Forever Love! 💕', 3000, callback)
    ];

    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
    randomTransition();
  }

  // Sequence of transitions
  transitionSequence(transitions = [], callback = null) {
    if (transitions.length === 0) {
      if (callback) callback();
      return;
    }

    const [currentTransition, ...remainingTransitions] = transitions;
    const nextCallback = () => {
      setTimeout(() => {
        this.transitionSequence(remainingTransitions, callback);
      }, 500);
    };

    currentTransition(nextCallback);
  }
}

// Interactive Features Class
class InteractiveFeatures {
  constructor() {
    this.cherryBlossomContainer = document.getElementById('cherry-blossom-container');
    this.loveMessages = [
      '💕 Yêu em!',
      '❤️ Forever!',
      '💖 My love!',
      '💝 Sweetheart!',
      '💗 Darling!',
      '💓 Honey!',
      '💞 Beloved!',
      '💕 Sweetie!'
    ];
    this.clickCount = 0;
    this.isCherryBlossomActive = false;
    this.init();
  }

  init() {
    this.setupCherryBlossom();
    this.setupInteractiveHeartbeat();
    this.setupLoveMessages();
  }

  setupCherryBlossom() {
    this.createCherryBlossomParticles();
    setTimeout(() => {
      this.startCherryBlossom();
      // Add special initial burst
      this.createInitialBurst();
    }, 3000);
  }

  createCherryBlossomParticles() {
    if (!this.cherryBlossomContainer) return;
    
    // Create more initial cherry blossoms
    for (let i = 0; i < 25; i++) {
      this.createSingleCherryBlossom();
    }
  }

  createSingleCherryBlossom() {
    if (!this.cherryBlossomContainer) return;

    const blossom = document.createElement('div');
    blossom.className = 'cherry-blossom';
    
    // Add random variant
    const variants = ['', 'variant-1', 'variant-2', 'variant-3', 'variant-4', 'enhanced'];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    if (randomVariant) {
      blossom.classList.add(randomVariant);
    }
    
    const x = Math.random() * window.innerWidth;
    const delay = Math.random() * 8;
    const size = 0.8 + Math.random() * 0.6; // Random size between 0.8 and 1.4
    
    blossom.style.left = `${x}px`;
    blossom.style.animationDelay = `${delay}s`;
    blossom.style.transform = `scale(${size})`;
    
    this.cherryBlossomContainer.appendChild(blossom);
    
    setTimeout(() => {
      if (blossom.parentNode) {
        blossom.parentNode.removeChild(blossom);
      }
    }, 8000 + delay * 1000);
  }

  startCherryBlossom() {
    this.isCherryBlossomActive = true;
    
    this.cherryBlossomInterval = setInterval(() => {
      if (this.isCherryBlossomActive) {
        // Create multiple blossoms per interval
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.createSingleCherryBlossom();
          }, i * 200);
        }
      }
    }, 1500); // Reduced interval for more frequent spawning
  }

  stopCherryBlossom() {
    this.isCherryBlossomActive = false;
    if (this.cherryBlossomInterval) {
      clearInterval(this.cherryBlossomInterval);
    }
  }

  setupInteractiveHeartbeat() {
    document.addEventListener('click', (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      
      if (distance < 200) {
        this.triggerHeartbeat();
        this.showLoveMessage(e.clientX, e.clientY);
        this.clickCount++;
        
        if (this.clickCount % 5 === 0) {
          this.intensifyCherryBlossom();
        }
      }
    });
  }

  triggerHeartbeat() {
    document.body.classList.add('heartbeat-pulse');
    
    setTimeout(() => {
      document.body.classList.remove('heartbeat-pulse');
    }, 600);
    
    this.playHeartbeatSound();
  }

  playHeartbeatSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }

  setupLoveMessages() {
    // Love messages will be shown on heart clicks
  }

  showLoveMessage(x, y) {
    const message = document.createElement('div');
    message.className = 'love-message';
    message.textContent = this.loveMessages[Math.floor(Math.random() * this.loveMessages.length)];
    
    message.style.left = `${x}px`;
    message.style.top = `${y}px`;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }

  intensifyCherryBlossom() {
    // Create more cherry blossoms for a short period with better timing
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        this.createSingleCherryBlossom();
      }, i * 150);
    }
    
    // Create a special burst of enhanced blossoms
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const blossom = document.createElement('div');
          blossom.className = 'cherry-blossom enhanced';
          
          const x = Math.random() * window.innerWidth;
          const delay = Math.random() * 3;
          const size = 1.2 + Math.random() * 0.8;
          
          blossom.style.left = `${x}px`;
          blossom.style.animationDelay = `${delay}s`;
          blossom.style.transform = `scale(${size})`;
          
          this.cherryBlossomContainer.appendChild(blossom);
          
          setTimeout(() => {
            if (blossom.parentNode) {
              blossom.parentNode.removeChild(blossom);
            }
          }, 8000 + delay * 1000);
        }, i * 100);
      }
    }, 500);
  }

  createInitialBurst() {
    // Create a dramatic initial burst of cherry blossoms
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const blossom = document.createElement('div');
        blossom.className = 'cherry-blossom enhanced';
        
        const x = Math.random() * window.innerWidth;
        const delay = Math.random() * 2;
        const size = 1.0 + Math.random() * 1.0;
        
        blossom.style.left = `${x}px`;
        blossom.style.animationDelay = `${delay}s`;
        blossom.style.transform = `scale(${size})`;
        
        this.cherryBlossomContainer.appendChild(blossom);
        
        setTimeout(() => {
          if (blossom.parentNode) {
            blossom.parentNode.removeChild(blossom);
          }
        }, 8000 + delay * 1000);
      }, i * 100);
    }
  }

  dispose() {
    this.stopCherryBlossom();
    if (this.cherryBlossomInterval) {
      clearInterval(this.cherryBlossomInterval);
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check for WebGL support
  if (!window.WebGLRenderingContext) {
    Utils.showError(
      "WebGL is not supported in your browser. Please use a modern browser with WebGL support."
    );
    return;
  }

  // Initialize the heart animation
  let heartAnimation = null;
  let interactiveFeatures = null;
  let sceneTransitionManager = null;
  let backgroundEffectsManager = null;

  try {
    heartAnimation = new HeartAnimation();
    interactiveFeatures = new InteractiveFeatures();
    sceneTransitionManager = new SceneTransitionManager();
    backgroundEffectsManager = new BackgroundEffectsManager();

    // Store references for cleanup
    window.heartAnimation = heartAnimation;
    window.interactiveFeatures = interactiveFeatures;
    window.sceneTransitionManager = sceneTransitionManager;
    window.backgroundEffectsManager = backgroundEffectsManager;

    // Add transition triggers
    setupTransitionTriggers();
    // Add background interaction triggers
    setupBackgroundInteractions();
  } catch (error) {
    console.error("Failed to initialize HeartAnimation:", error);
    Utils.showError(
      "Failed to initialize the 3D animation. Please refresh the page.",
      () => {
        window.location.reload();
      }
    );
  }
});

// Setup transition triggers
function setupTransitionTriggers() {
  // Add keyboard shortcuts for transitions
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case '1':
          window.sceneTransitionManager.fadeTransition(1000);
          break;
        case '2':
          window.sceneTransitionManager.slideTransition('left');
          break;
        case '3':
          window.sceneTransitionManager.circularReveal();
          break;
        case '4':
          window.sceneTransitionManager.particleExplosion();
          break;
        case '5':
          window.sceneTransitionManager.heartBurst();
          break;
        case '6':
          window.sceneTransitionManager.matrixRain();
          break;
        case '7':
          window.sceneTransitionManager.starField();
          break;
        case '8':
          window.sceneTransitionManager.loveMessageTransition('💕 Yêu em! 💕');
          break;
        case '0':
          window.sceneTransitionManager.randomTransition();
          break;
      }
    }
  });

  // Add click triggers for transitions
  document.addEventListener('dblclick', (e) => {
    if (e.clientY < 100) { // Top area
      window.sceneTransitionManager.particleExplosion(e.clientX, e.clientY);
    } else if (e.clientY > window.innerHeight - 100) { // Bottom area
      window.sceneTransitionManager.heartBurst(e.clientX, e.clientY);
    }
  });

  // Add special transition for love question
  const yesBtn = document.getElementById('yes-btn');
  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      setTimeout(() => {
        window.sceneTransitionManager.heartBurst();
      }, 1000);
    });
  }
}

// Setup background interaction triggers
function setupBackgroundInteractions() {
  // Add click effects to background
  document.addEventListener('click', (e) => {
    if (window.backgroundEffectsManager) {
      window.backgroundEffectsManager.addInteractionEffect(e.clientX, e.clientY);
    }
  });

  // Add sparkle effects on mouse move
  let sparkleTimeout;
  document.addEventListener('mousemove', (e) => {
    clearTimeout(sparkleTimeout);
    sparkleTimeout = setTimeout(() => {
      if (window.backgroundEffectsManager && Math.random() < 0.1) {
        window.backgroundEffectsManager.addSparkleEffect(e.clientX, e.clientY);
      }
    }, 100);
  });

  // Intensify background on heart clicks
  const originalTriggerHeartbeat = window.interactiveFeatures?.triggerHeartbeat;
  if (window.interactiveFeatures && originalTriggerHeartbeat) {
    window.interactiveFeatures.triggerHeartbeat = function() {
      originalTriggerHeartbeat.call(this);
      if (window.backgroundEffectsManager) {
        window.backgroundEffectsManager.intensify();
      }
    };
  }
}

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
    window.heartAnimation.dispose();
  }
  if (window.interactiveFeatures) {
    window.interactiveFeatures.dispose();
  }
  if (window.backgroundEffectsManager) {
    window.backgroundEffectsManager.dispose();
  }
  if (window.sceneTransitionManager) {
    // SceneTransitionManager doesn't need explicit disposal as it cleans up automatically
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
