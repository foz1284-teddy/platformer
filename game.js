// Player class
class Player {
  constructor() {
    this.x = 50;
    this.y = 350;
    this.width = 30;
    this.height = 30;
    this.color = 'blue';
    this.speed = 2;
    this.velocityY = 0;
    this.jumpForce = -15;
    this.gravity = 0.4;
    this.grounded = true;
  }

  reset() {
    this.x = 50;
    this.y = 350;
    this.velocityY = 0;
    this.grounded = true;
  }

  update(keys, platforms) {
    // Movement
    if (keys['ArrowRight']) {
      const groundPlatform = platforms.find(p => p.y === 380);
      const maxX = groundPlatform.x + groundPlatform.width - this.width;
      if (this.x < maxX) {
        this.x += this.speed;
      }
    }
    if (keys['ArrowLeft']) {
      this.x -= this.speed;
    }
    if (keys['ArrowUp'] && this.grounded) {
      this.velocityY = this.jumpForce;
      this.grounded = false;
    }

    // Apply gravity
    this.velocityY += this.gravity;
    let nextY = this.y + this.velocityY;

    // Platform collision
    this.grounded = false;
    platforms.forEach(platform => {
      if (this.x < platform.x + platform.width &&
          this.x + this.width > platform.x) {
        // Check for collision from above
        if (this.velocityY > 0 && 
            this.y + this.height <= platform.y && 
            nextY + this.height >= platform.y) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.grounded = true;
          nextY = this.y;
        }
        // Check for collision from below
        else if (this.velocityY < 0 && 
                this.y >= platform.y + platform.height && 
                nextY <= platform.y + platform.height) {
          this.y = platform.y + platform.height;
          this.velocityY = 0;
          nextY = this.y;
        }
        // Prevent moving through platforms horizontally when very close to them
        else if (Math.abs(this.y + this.height - platform.y) < 10 ||
                 Math.abs(this.y - (platform.y + platform.height)) < 10) {
          if (this.x + this.width > platform.x && this.x < platform.x) {
            this.x = platform.x - this.width;
          } else if (this.x < platform.x + platform.width && this.x + this.width > platform.x + platform.width) {
            this.x = platform.x + platform.width;
          }
        }
      }
    });

    this.y = nextY;

    // Ensure player stays within horizontal bounds
    if (this.x < 0) this.x = 0;
    const groundPlatform = platforms.find(p => p.y === 380);
    const maxX = groundPlatform.x + groundPlatform.width - this.width;
    if (this.x > maxX) this.x = maxX;
  }

  draw(ctx, cameraX) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - cameraX, this.y, this.width, this.height);
  }
}

// Level data
const levels = [
  // Level 1 - Original horizontal level
  {
    portal: { x: 1600, y: 350 },
    spikes: [
      { x: 400, y: 380 - 20, width: 20, height: 20 },  // Placed on ground (380 - spike height)
      { x: 800, y: 380 - 20, width: 20, height: 20 },  // Placed on ground
      { x: 1200, y: 380 - 20, width: 20, height: 20 }  // Placed on ground
    ],
    platforms: [
      { x: 0, y: 380, width: 2000, height: 20 },    // Ground
      { x: 200, y: 280, width: 200, height: 20 },   // Platform 1
      { x: 500, y: 200, width: 200, height: 20 },   // Platform 2
      { x: 800, y: 300, width: 200, height: 20 },   // Platform 3
      { x: 1100, y: 250, width: 200, height: 20 }   // Platform 4
    ]
  },
  // Level 2 - Vertical climbing challenge
  {
    portal: { x: 400, y: 50 },  // Portal at the top
    spikes: [
      { x: 300, y: 380 - 20, width: 20, height: 20 },    // On ground
      { x: 500, y: 280 - 20, width: 20, height: 20 },    // On second step
      { x: 200, y: 160 - 20, width: 20, height: 20 }     // On fifth step
    ],
    platforms: [
      { x: 0, y: 380, width: 800, height: 20 },     // Ground
      { x: 150, y: 320, width: 100, height: 20 },   // First step
      { x: 300, y: 280, width: 100, height: 20 },   // Second step
      { x: 150, y: 240, width: 100, height: 20 },   // Third step
      { x: 300, y: 200, width: 100, height: 20 },   // Fourth step
      { x: 150, y: 160, width: 100, height: 20 },   // Fifth step
      { x: 300, y: 120, width: 100, height: 20 },   // Sixth step
      { x: 350, y: 80, width: 150, height: 20 }     // Final platform with portal
    ]
  },
  // Level 3 - Combined challenge
  {
    portal: { x: 1800, y: 100 },  // Portal at the top-right
    spikes: [
      { x: 400, y: 380 - 20, width: 20, height: 20 },    // On ground
      { x: 800, y: 150 - 20, width: 20, height: 20 },    // On fourth platform
      { x: 1200, y: 150 - 20, width: 20, height: 20 },   // On long platform
      { x: 1600, y: 150 - 20, width: 20, height: 20 }    // On final platform
    ],
    platforms: [
      { x: 0, y: 380, width: 2000, height: 20 },    // Ground
      { x: 200, y: 300, width: 150, height: 20 },   // First platform
      { x: 400, y: 250, width: 150, height: 20 },   // Second platform
      { x: 600, y: 200, width: 150, height: 20 },   // Third platform
      { x: 800, y: 150, width: 150, height: 20 },   // Fourth platform
      { x: 1000, y: 150, width: 400, height: 20 },  // Long platform
      { x: 1500, y: 150, width: 400, height: 20 },  // Final platform
      // Vertical escape route if player falls
      { x: 100, y: 320, width: 80, height: 20 },
      { x: 100, y: 260, width: 80, height: 20 },
      { x: 100, y: 200, width: 80, height: 20 }
    ]
  }
];

// Input handler
class InputHandler {
  constructor() {
    this.keys = {};
    
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  isPressed(key) {
    return this.keys[key] || false;
  }

  reset() {
    this.keys = {};
  }
}

// Renderer
class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    // Create gradient sky background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');    // Light sky blue at top
    gradient.addColorStop(0.6, '#B0E2FF');  // Lighter blue in middle
    gradient.addColorStop(1, '#E0F6FF');    // Almost white blue at bottom
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrass(platforms, cameraX) {
    this.ctx.fillStyle = '#90EE90';  // Light green color for grass
    platforms.forEach(platform => {
      if (platform.y === 380) {  // If it's the ground platform
        this.ctx.fillRect(platform.x - cameraX, platform.y, platform.width, this.canvas.height - platform.y);
      } else {  // For elevated platforms
        this.ctx.fillRect(platform.x - cameraX, platform.y, platform.width, this.canvas.height - platform.y);
      }
    });
  }

  drawPlatforms(platforms, cameraX) {
    this.ctx.fillStyle = '#654321';
    platforms.forEach(platform => {
      this.ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
    });
  }

  drawPortal(portal, cameraX) {
    this.ctx.fillStyle = 'purple';
    this.ctx.fillRect(portal.x - cameraX, portal.y, 30, 30);
  }

  drawSpikes(spikes, cameraX) {
    this.ctx.fillStyle = 'red';
    spikes.forEach(spike => {
      this.ctx.beginPath();
      this.ctx.moveTo(spike.x - cameraX, spike.y + spike.height);
      this.ctx.lineTo(spike.x - cameraX + spike.width / 2, spike.y);
      this.ctx.lineTo(spike.x - cameraX + spike.width, spike.y + spike.height);
      this.ctx.closePath();
      this.ctx.fill();
    });
  }

  drawGameState(text) {
    this.ctx.fillStyle = 'black';
    this.ctx.font = '36px sans-serif';
    this.ctx.fillText(text, 150, 200);
  }
}

// Game class
class Game {
  constructor() {
    console.log('Game initializing...');
    this.canvas = document.getElementById('gameCanvas');
    console.log('Canvas found:', this.canvas);
    this.player = new Player();
    this.input = new InputHandler();
    this.renderer = new Renderer(this.canvas);
    this.cameraX = 0;
    this.currentLevel = 0;
    this.gameWon = false;
    this.gameLost = false;

    // Handle level completion and game over
    document.addEventListener('keydown', (e) => {
      if ((this.gameWon || this.gameLost) && e.key === 'Enter') {
        if (this.gameWon) {
          this.currentLevel++;
          if (this.currentLevel >= levels.length) {
            this.currentLevel = 0; // Loop back to first level
          }
        }
        this.player.reset();
        this.gameWon = false;
        this.gameLost = false;
        requestAnimationFrame(() => this.gameLoop());
      }
    });

    console.log('Starting game loop...');
    // Start the game
    this.gameLoop();
  }

  checkCollisions() {
    const level = levels[this.currentLevel];
    
    // Check collisions with spikes
    level.spikes.forEach(spike => {
      if (this.player.x < spike.x + spike.width &&
          this.player.x + this.player.width > spike.x &&
          this.player.y < spike.y + spike.height &&
          this.player.y + this.player.height > spike.y) {
        this.gameLost = true;
      }
    });

    // Check win condition
    const portal = level.portal;
    if (this.player.x + this.player.width >= portal.x &&
        this.player.x <= portal.x + 30 &&
        this.player.y + this.player.height >= portal.y &&
        this.player.y <= portal.y + 30) {
      this.gameWon = true;
    }
  }

  gameLoop() {
    const level = levels[this.currentLevel];

    if (!this.gameWon && !this.gameLost) {
      // Update
      this.player.update(this.input.keys, level.platforms);
      this.checkCollisions();
      
      // Update camera
      this.cameraX = this.player.x - this.canvas.width / 2;
      if (this.cameraX < 0) this.cameraX = 0;
    }

    // Render
    this.renderer.clear();
    this.renderer.drawGrass(level.platforms, this.cameraX);
    this.renderer.drawPlatforms(level.platforms, this.cameraX);
    this.renderer.drawPortal(level.portal, this.cameraX);
    this.renderer.drawSpikes(level.spikes, this.cameraX);
    this.player.draw(this.renderer.ctx, this.cameraX);

    // Draw game state messages
    if (this.gameWon) {
      this.renderer.drawGameState('Level Complete! Press Enter.');
    } else if (this.gameLost) {
      this.renderer.drawGameState('You Lost! Press Enter to Retry.');
    } else {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  console.log('Window loaded, creating game instance...');
  new Game();
});
