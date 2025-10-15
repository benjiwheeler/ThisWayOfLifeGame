// This Way of Life Will Last Forever - Classic Mac Game
// By Claude Code

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GAME_WIDTH = 512;
const GAME_HEIGHT = 384;
const PLAYER_WIDTH = 16;
const PLAYER_HEIGHT = 24;
const UMBRELLA_OPEN_HEIGHT = 16;
const PLAYER_SPEED = 3;
const GRAVITY = 0.3;
const OBSTACLE_SPEED = 2;
const UMBRELLA_PUSH_FORCE = 8;
const MAX_POWER = 100;
const POWER_DRAIN_RATE = 0.5;
const POWER_RECHARGE_RATE = 0.1;
const GROUND_LEVEL = GAME_HEIGHT - PLAYER_HEIGHT - 10;
const PILE_SEGMENT_WIDTH = 32;

// Game state
let player = {
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GROUND_LEVEL,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    umbrellaOpen: false,
    umbrellaOpenTime: 0,
    power: MAX_POWER
};

let obstacles = [];
let groundPiles = []; // Array to track density of obstacles on ground
let score = 0;
let highScore = parseInt(localStorage.getItem('umbrellaHighScore') || '0');
let gameOver = false;
let keys = {};

// Story and progression system
let countdown = 10;
let showingChoice = false;
let choiceMade = null; // 'fight' or 'learn'
let secondChoiceMade = null; // 'faster' or 'meditate'
let knowledge = 0;
let maxKnowledge = 100;
let knowledgeText = '';
let knowledgeTextTimer = 0;
let knowledgeGainRate = 10; // How much knowledge per touch
let playerSpeed = PLAYER_SPEED;
let stillnessTimer = 0; // Tracks how long player has been still

const knowledgeMessages = [
    "they seem made from strange metallic material",
    "they have small eyes that seem to watch me",
    "i do not know them, but they know me",
    "their surfaces shimmer with unknown symbols",
    "they whisper in frequencies i cannot hear",
    "each one carries a different weight",
    "they fall in patterns, not chaos",
    "they avoid hitting me directly",
    "perhaps they are trying to communicate",
    "their texture feels impossibly smooth"
];

// Initialize ground pile segments
function initGroundPiles() {
    groundPiles = [];
    const numSegments = Math.ceil(GAME_WIDTH / PILE_SEGMENT_WIDTH);
    for (let i = 0; i < numSegments; i++) {
        groundPiles.push({
            x: i * PILE_SEGMENT_WIDTH,
            width: PILE_SEGMENT_WIDTH,
            count: 0, // Number of obstacles in this segment
            height: 0, // Visual height of pile
            obstacles: [] // Actual obstacle objects on ground
        });
    }
}

initGroundPiles();

// Pixel art sprites (1 = black, 0 = white)
const sprites = {
    // Victorian Lady sprite (16x24)
    woman: [
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],  // Hair bun top
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],  // Hair bun
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // Hair with bun
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],  // Face
        [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],  // Eyes
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],  // Nose/mouth
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],  // Neck
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // Shoulders with puff sleeves
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],  // Wide puff sleeves
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // Upper bodice
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],  // Waist (corseted)
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],  // Narrow waist
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],  // Hip area
        [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],  // Dress begins to flare
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],  // Dress wider
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],  // Bell-shaped skirt
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],  // Wide skirt
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // Very wide skirt
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // Bell skirt continues
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // Full bell skirt
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // Widest part
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],  // Bottom of dress
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],  // Hem
        [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0]   // Feet showing
    ],

    // Parasol closed (16x8) - ornate handle
    umbrellaClosed: [
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],  // Decorative top
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],  // Thin pole
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],  // Handle curve
        [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0]   // Curved handle
    ],

    // Ornate Parasol open (24x16) - Victorian lace pattern
    umbrellaOpen: [
        [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],  // Decorative finial
        [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0],  // Top detail
        [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],  // Wide canopy
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],  // Widest part
        [1,1,1,0,1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,1],  // Lace pattern
        [1,1,0,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,0,1,1],  // Decorative scallops
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],  // Pole
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],  // Handle ornament
        [0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0]   // Curved handle
    ],

    // Angry cat (16x16)
    cat: [
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
        [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
        [0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,0,1,1,1,1,1,1,0,1,1,0,0],
        [0,0,1,1,0,0,1,1,1,1,0,0,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,0,1,1,0,1,1,0,1,1,0,1,0,0],
        [0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0],
        [0,0,1,1,0,1,1,1,1,1,1,0,1,1,0,0],
        [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0],
        [0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0],
        [0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0]
    ],

    // Meteor (16x16) - jagged space rock with irregular shape
    meteor: [
        [0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,1,1,0,1,1,1,1,0,1,1,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,1,1,0,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],

    // Boot (16x16)
    boot: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0],
        [0,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
    ],

    // Coke can (12x16)
    cokeCan: [
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,0,0,0,0,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0]
    ]
};

// Draw a sprite from pixel array
function drawSprite(sprite, x, y, scale = 2) {
    const height = sprite.length;
    const width = sprite[0].length;

    ctx.fillStyle = '#000';
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if (sprite[row][col] === 1) {
                ctx.fillRect(
                    Math.floor(x + col * scale),
                    Math.floor(y + row * scale),
                    scale,
                    scale
                );
            }
        }
    }
}

// Draw player
function drawPlayer() {
    drawSprite(sprites.woman, player.x, player.y);

    if (player.umbrellaOpen) {
        // Draw open umbrella above player (larger if fighting)
        if (choiceMade === 'fight') {
            // Draw larger umbrella by scaling
            const largeUmbrellaSprite = sprites.umbrellaOpen;
            const scale = 3; // Larger scale
            drawSprite(largeUmbrellaSprite, player.x - 16, player.y - 40, scale);
        } else {
            drawSprite(sprites.umbrellaOpen, player.x - 8, player.y - 32);
        }
    } else {
        // Draw closed umbrella next to player
        drawSprite(sprites.umbrellaClosed, player.x + 12, player.y + 4);
    }
}

// Obstacle types
const obstacleTypes = [
    { sprite: sprites.cat, width: 16, height: 16, name: 'cat' },
    { sprite: sprites.meteor, width: 16, height: 16, name: 'meteor' },
    { sprite: sprites.boot, width: 16, height: 16, name: 'boot' },
    { sprite: sprites.cokeCan, width: 12, height: 16, name: 'can' }
];

// Create obstacle
function createObstacle() {
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const obstacle = {
        x: Math.random() * (GAME_WIDTH - type.width * 2),
        y: -type.height * 2,
        width: type.width * 2,
        height: type.height * 2,
        velocityY: OBSTACLE_SPEED + Math.random() * 1,
        velocityX: 0,
        type: type,
        deflected: false,
        onGround: false,
        trail: [] // For meteor trails
    };

    // Meteors have diagonal movement
    if (type.name === 'meteor') {
        const angle = Math.random() * Math.PI / 3 - Math.PI / 6; // -30 to +30 degrees
        obstacle.velocityX = Math.sin(angle) * (OBSTACLE_SPEED + 1);
        obstacle.velocityY = Math.cos(angle) * (OBSTACLE_SPEED + 1);

        // Start from top or sides depending on angle
        if (obstacle.velocityX < 0) {
            obstacle.x = GAME_WIDTH + type.width * 2; // Start from right
        } else if (obstacle.velocityX > 0) {
            obstacle.x = -type.width * 2; // Start from left
        }
    }

    return obstacle;
}

// Draw obstacle
function drawObstacle(obstacle) {
    // Draw meteor trail
    if (obstacle.type.name === 'meteor' && !obstacle.onGround && obstacle.trail.length > 0) {
        ctx.fillStyle = '#000';
        for (let i = 0; i < obstacle.trail.length; i++) {
            const trailPoint = obstacle.trail[i];
            const alpha = 1 - (i / obstacle.trail.length);
            const size = Math.max(1, 4 - i);

            // Draw small dots for trail
            for (let dx = 0; dx < size; dx++) {
                for (let dy = 0; dy < size; dy++) {
                    if (Math.random() > 0.3) { // Sparse trail
                        ctx.fillRect(trailPoint.x + dx, trailPoint.y + dy, 1, 1);
                    }
                }
            }
        }
    }

    drawSprite(obstacle.type.sprite, obstacle.x, obstacle.y);
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check if obstacle would collide with any grounded obstacles
function checkGroundObstacleCollision(obstacle) {
    if (obstacle.deflected) return null; // Deflected obstacles pass through

    for (let pile of groundPiles) {
        for (let groundObstacle of pile.obstacles) {
            if (checkCollision(obstacle, groundObstacle)) {
                return groundObstacle;
            }
        }
    }
    return null;
}

// Find the highest obstacle at a given x position
function getHighestObstacleAt(x, width) {
    let highest = GROUND_LEVEL;

    for (let pile of groundPiles) {
        for (let groundObstacle of pile.obstacles) {
            // Check if x ranges overlap
            if (x < groundObstacle.x + groundObstacle.width &&
                x + width > groundObstacle.x) {
                highest = Math.min(highest, groundObstacle.y);
            }
        }
    }

    return highest;
}

// Get pile density at player position
function getPileDensityAtPosition(x) {
    const segmentIndex = Math.floor(x / PILE_SEGMENT_WIDTH);
    if (segmentIndex >= 0 && segmentIndex < groundPiles.length) {
        return groundPiles[segmentIndex].count;
    }
    return 0;
}

// Update game
function update() {
    if (gameOver) return;
    if (showingChoice) return; // Pause game during choice

    // Update knowledge text timer
    if (knowledgeTextTimer > 0) {
        knowledgeTextTimer--;
        if (knowledgeTextTimer === 0) {
            knowledgeText = '';
        }
    }

    // Check if knowledge meter is full and trigger second choice
    if (choiceMade === 'learn' && !secondChoiceMade && knowledge >= maxKnowledge) {
        showingChoice = true;
    }

    // Calculate speed modifier based on ground pile density
    const pileDensity = getPileDensityAtPosition(player.x + player.width / 2);
    const speedModifier = Math.max(0.15, 1 - (pileDensity * 0.2)); // Much slower with more piles

    // Track player movement for meditation mode
    let playerMoved = false;

    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= playerSpeed * speedModifier;
        playerMoved = true;
    }
    if (keys['ArrowRight'] && player.x < GAME_WIDTH - player.width) {
        player.x += playerSpeed * speedModifier;
        playerMoved = true;
    }

    // Meditation mode: gain knowledge when still
    if (secondChoiceMade === 'meditate') {
        if (!playerMoved && !player.umbrellaOpen) {
            stillnessTimer++;
            // Gain knowledge every 60 frames (1 second) of stillness
            if (stillnessTimer >= 60) {
                knowledge = Math.min(maxKnowledge, knowledge + 1);
                stillnessTimer = 0;
            }
        } else {
            stillnessTimer = 0;
        }
    }

    // Umbrella control and power management
    if (keys['ArrowUp'] && player.power > 0) {
        player.umbrellaOpen = true;
        player.umbrellaOpenTime = 10;
        player.power = Math.max(0, player.power - POWER_DRAIN_RATE);
    } else {
        if (player.umbrellaOpenTime > 0) {
            player.umbrellaOpenTime--;
        } else {
            player.umbrellaOpen = false;
        }
        // Recharge power when umbrella is closed
        if (!player.umbrellaOpen) {
            player.power = Math.min(MAX_POWER, player.power + POWER_RECHARGE_RATE);
        }
    }

    // Can't keep umbrella open with no power
    if (player.power <= 0) {
        player.umbrellaOpen = false;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];

        // Skip updating grounded obstacles - they're handled separately
        if (obstacle.onGround) continue;

        if (!obstacle.deflected) {
            // Update meteor trail
            if (obstacle.type.name === 'meteor') {
                obstacle.trail.unshift({ x: obstacle.x + obstacle.width / 2, y: obstacle.y + obstacle.height / 2 });
                if (obstacle.trail.length > 8) {
                    obstacle.trail.pop();
                }
            }

            obstacle.y += obstacle.velocityY;
            obstacle.x += obstacle.velocityX; // Apply horizontal velocity (for meteors)

            // Check collision with grounded obstacles (only if not deflected)
            const groundCollision = checkGroundObstacleCollision(obstacle);
            if (groundCollision) {
                // Land on top of the grounded obstacle
                obstacle.y = groundCollision.y - obstacle.height;
                obstacle.onGround = true;
                obstacle.velocityY = 0;
                obstacle.velocityX = 0;
                obstacle.trail = []; // Clear trail when grounded

                // Add to appropriate pile
                const segmentIndex = Math.floor((obstacle.x + obstacle.width / 2) / PILE_SEGMENT_WIDTH);
                if (segmentIndex >= 0 && segmentIndex < groundPiles.length) {
                    const pile = groundPiles[segmentIndex];
                    pile.count++;
                    pile.obstacles.push(obstacle);
                }
            }
        } else {
            // Deflected obstacles ignore other obstacles
            obstacle.velocityY += GRAVITY;
            obstacle.y += obstacle.velocityY;
            obstacle.x += obstacle.velocityX;
            obstacle.trail = []; // Clear trail when deflected
        }

        // Check umbrella collision when open
        if (player.umbrellaOpen && !obstacle.deflected && !obstacle.onGround) {
            const umbrellaSize = choiceMade === 'fight' ? 64 : 48;
            const umbrellaOffset = choiceMade === 'fight' ? -16 : -8;
            const umbrellaBox = {
                x: player.x + umbrellaOffset,
                y: player.y - 32,
                width: umbrellaSize,
                height: 32
            };

            if (checkCollision(obstacle, umbrellaBox)) {
                obstacle.deflected = true;
                obstacle.velocityY = -UMBRELLA_PUSH_FORCE;
                obstacle.velocityX = (obstacle.x - player.x) / 10;
                score += 10;
                updateScore();

                // Countdown decreases when deflecting
                if (countdown > 0) {
                    countdown--;
                    if (countdown === 0 && !choiceMade) {
                        showingChoice = true;
                    }
                }
            }
        }

        // Check collision for learning mode (Choice B)
        // In meditation mode, obstacles don't give knowledge - only stillness does
        if (choiceMade === 'learn' && secondChoiceMade !== 'meditate' && !obstacle.deflected && !obstacle.onGround && checkCollision(obstacle, player)) {
            // In learn mode, touching obstacles gives knowledge instead of game over
            knowledge = Math.min(maxKnowledge, knowledge + knowledgeGainRate);
            knowledgeText = knowledgeMessages[Math.floor(Math.random() * knowledgeMessages.length)];
            knowledgeTextTimer = 120; // 2 seconds at 60fps
            obstacle.deflected = true;
            obstacle.velocityY = -2; // Gentle push away
            obstacle.velocityX = (obstacle.x - player.x) / 20;
        }

        // Check player collision with falling obstacles only (not grounded ones)
        // Game over in fight mode, or in meditation mode (can't learn from touching in meditation)
        if ((choiceMade !== 'learn' || secondChoiceMade === 'meditate') && !obstacle.deflected && !obstacle.onGround && checkCollision(obstacle, player)) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('umbrellaHighScore', highScore);
                document.getElementById('highScore').textContent = highScore;
            }
        }

        // Add to ground pile when obstacle hits ground level
        if (obstacle.y + obstacle.height >= GROUND_LEVEL && !obstacle.onGround) {
            obstacle.onGround = true;
            obstacle.velocityY = 0;
            obstacle.velocityX = 0;
            obstacle.y = GROUND_LEVEL - obstacle.height; // Snap to ground properly
            obstacle.trail = []; // Clear trail

            const segmentIndex = Math.floor((obstacle.x + obstacle.width / 2) / PILE_SEGMENT_WIDTH);
            if (segmentIndex >= 0 && segmentIndex < groundPiles.length) {
                const pile = groundPiles[segmentIndex];
                pile.count++;
                pile.obstacles.push(obstacle);

                // Countdown increases when NON-DEFLECTED obstacle hits ground
                if (!obstacle.deflected && countdown > 0) {
                    countdown++;
                    if (countdown > 10) countdown = 10; // Cap at 10
                }
            }
        }

        // Remove off-screen obstacles (only if not on ground)
        if (!obstacle.onGround && (obstacle.y > GAME_HEIGHT + 50 || obstacle.y < -100 ||
            obstacle.x < -100 || obstacle.x > GAME_WIDTH + 100)) {
            obstacles.splice(i, 1);
        }
    }

    // Handle umbrella pushing grounded obstacles
    if (player.umbrellaOpen) {
        for (let pile of groundPiles) {
            for (let groundObstacle of pile.obstacles) {
                if (!groundObstacle.pushing && checkCollision(player, {
                    x: player.x - 20,
                    y: player.y,
                    width: player.width + 40,
                    height: player.height
                })) {
                    // Determine push direction based on player position
                    const pushDirection = (player.x + player.width / 2) < (groundObstacle.x + groundObstacle.width / 2) ? 1 : -1;
                    groundObstacle.pushVelocityX = pushDirection * 2;
                    groundObstacle.pushing = true;
                }
            }
        }
    }

    // Update grounded obstacles physics
    for (let pile of groundPiles) {
        for (let i = pile.obstacles.length - 1; i >= 0; i--) {
            const groundObstacle = pile.obstacles[i];

            // Apply push velocity
            if (groundObstacle.pushVelocityX) {
                groundObstacle.x += groundObstacle.pushVelocityX;
                // Friction
                groundObstacle.pushVelocityX *= 0.95;
                if (Math.abs(groundObstacle.pushVelocityX) < 0.1) {
                    groundObstacle.pushVelocityX = 0;
                    groundObstacle.pushing = false;
                }

                // Check if pushed off screen
                if (groundObstacle.x < -groundObstacle.width || groundObstacle.x > GAME_WIDTH) {
                    // Remove from pile
                    pile.obstacles.splice(i, 1);
                    pile.count--;
                    // Remove from main obstacles array
                    const obstacleIndex = obstacles.indexOf(groundObstacle);
                    if (obstacleIndex !== -1) {
                        obstacles.splice(obstacleIndex, 1);
                    }
                    continue;
                }

                // Update pile assignment if moved to different segment
                const newSegmentIndex = Math.floor((groundObstacle.x + groundObstacle.width / 2) / PILE_SEGMENT_WIDTH);
                const oldSegmentIndex = groundPiles.indexOf(pile);
                if (newSegmentIndex !== oldSegmentIndex && newSegmentIndex >= 0 && newSegmentIndex < groundPiles.length) {
                    // Remove from old pile
                    pile.obstacles.splice(i, 1);
                    pile.count--;
                    // Add to new pile
                    groundPiles[newSegmentIndex].obstacles.push(groundObstacle);
                    groundPiles[newSegmentIndex].count++;
                }
            }

            // Apply gravity to grounded obstacles to make them fall if nothing below
            if (!groundObstacle.pushing) { // Don't apply gravity while being pushed
                const supportY = getHighestObstacleAt(groundObstacle.x, groundObstacle.width);
                const expectedY = supportY - groundObstacle.height;

                if (groundObstacle.y < expectedY - 2) {
                    // Something below was removed, fall down
                    groundObstacle.y += 3; // Fall speed
                    if (groundObstacle.y >= expectedY) {
                        groundObstacle.y = expectedY;
                    }
                } else if (groundObstacle.y > expectedY + 2) {
                    // Too low, move up (shouldn't happen but just in case)
                    groundObstacle.y = expectedY;
                } else {
                    // Stable - snap to expected position
                    groundObstacle.y = expectedY;
                }
            }
        }
    }

    // Spawn new obstacles
    if (Math.random() < 0.02) {
        obstacles.push(createObstacle());
    }

    // Check if any pile has reached too high (game over condition)
    const DANGER_HEIGHT = 150; // Height at which piles become dangerous
    for (let pile of groundPiles) {
        if (pile.count > 0) {
            // Calculate actual pile top position
            const pileTop = GROUND_LEVEL - (pile.count * 32); // Each obstacle is roughly 32 pixels tall
            if (pileTop <= 50) { // If pile reaches near top of screen
                gameOver = true;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('umbrellaHighScore', highScore);
                    document.getElementById('highScore').textContent = highScore;
                }
                break;
            }
        }
    }
}

// Draw power meter
function drawPowerMeter() {
    const meterWidth = choiceMade === 'fight' ? 150 : 100;
    const meterHeight = 12;
    const meterX = 10;
    const meterY = 10;

    // Outer border (Mac-style)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    // Inner white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(meterX + 2, meterY + 2, meterWidth - 4, meterHeight - 4);

    // Power fill (black bar)
    const maxPower = choiceMade === 'fight' ? MAX_POWER * 1.5 : MAX_POWER;
    const powerWidth = Math.max(0, (player.power / maxPower) * (meterWidth - 4));
    ctx.fillStyle = '#000';
    ctx.fillRect(meterX + 2, meterY + 2, powerWidth, meterHeight - 4);

    // Label
    ctx.fillStyle = '#000';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('POWER', meterX, meterY - 2);
}

// Draw knowledge meter (for Choice B)
function drawKnowledgeMeter() {
    if (choiceMade !== 'learn') return;

    const meterWidth = 100;
    const meterHeight = 12;
    const meterX = 10;
    const meterY = 30;

    // Outer border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    // Inner white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(meterX + 2, meterY + 2, meterWidth - 4, meterHeight - 4);

    // Knowledge fill (black bar)
    const knowledgeWidth = Math.max(0, (knowledge / maxKnowledge) * (meterWidth - 4));
    ctx.fillStyle = '#000';
    ctx.fillRect(meterX + 2, meterY + 2, knowledgeWidth, meterHeight - 4);

    // Label
    ctx.fillStyle = '#000';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('KNOWLEDGE', meterX, meterY - 2);
}

// Draw countdown
function drawCountdown() {
    ctx.fillStyle = '#000';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Countdown: ' + countdown, GAME_WIDTH - 10, 20);
}

// Draw knowledge text
function drawKnowledgeText() {
    if (knowledgeText && knowledgeTextTimer > 0) {
        ctx.fillStyle = '#000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        const maxWidth = GAME_WIDTH - 40;
        ctx.fillText(knowledgeText, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);
    }
}

// Draw choice screen
function drawChoice() {
    if (!showingChoice) return;

    // Darken background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 40, GAME_WIDTH - 40, GAME_HEIGHT - 80);

    // Story text
    ctx.fillStyle = '#000';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    // Different text for first vs second choice
    let story, choice1, choice2;
    if (!choiceMade) {
        // First choice
        story = "Are these obstacles falling just on me?\nWhy are they keeping me away from\nthose I love? Should I fight them,\nor try to learn more about why\nthey are falling?";
        choice1 = "A) Fight them!";
        choice2 = "B) Learn about them";
    } else if (choiceMade === 'learn' && !secondChoiceMade) {
        // Second choice (after learning)
        story = "I have learned so much, and yet I feel\nmore mystified than before. How can I\nbridge this gap?";
        choice1 = "A) Try to learn faster";
        choice2 = "B) Meditate";
    }

    const lines = story.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, GAME_WIDTH / 2, 80 + i * 16);
    });

    // Choices
    ctx.font = 'bold 14px monospace';
    ctx.fillText(choice1, GAME_WIDTH / 2, 200);
    ctx.fillText(choice2, GAME_WIDTH / 2, 230);

    ctx.font = '10px monospace';
    ctx.fillText('Press A or B to choose', GAME_WIDTH / 2, 280);
}

// Draw ground piles
function drawGroundPiles() {
    // Draw actual obstacle sprites on ground
    groundPiles.forEach(pile => {
        pile.obstacles.forEach(obstacle => {
            drawSprite(obstacle.type.sprite, obstacle.x, obstacle.y);
        });
    });
}

// Draw game
function draw() {
    // Clear screen with white
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground piles first (behind everything)
    drawGroundPiles();

    // Draw active obstacles (not on ground)
    obstacles.forEach(obstacle => {
        if (!obstacle.onGround) {
            drawObstacle(obstacle);
        }
    });

    // Draw player
    drawPlayer();

    // Draw power meter
    drawPowerMeter();

    // Draw knowledge meter (if in learn mode)
    drawKnowledgeMeter();

    // Draw countdown
    drawCountdown();

    // Draw knowledge text
    drawKnowledgeText();

    // Draw choice screen
    drawChoice();

    // Draw game over
    if (gameOver) {
        ctx.fillStyle = '#000';
        ctx.font = '32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        ctx.font = '16px monospace';
        ctx.fillText('Press SPACE to restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
    }

    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('highScore').textContent = highScore;
}

// Reset game
function resetGame() {
    player.x = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
    player.y = GROUND_LEVEL;
    player.umbrellaOpen = false;
    player.power = MAX_POWER;
    obstacles = [];
    initGroundPiles();
    score = 0;
    gameOver = false;
    countdown = 10;
    showingChoice = false;
    choiceMade = null;
    secondChoiceMade = null;
    knowledge = 0;
    knowledgeText = '';
    knowledgeTextTimer = 0;
    knowledgeGainRate = 10;
    playerSpeed = PLAYER_SPEED;
    stillnessTimer = 0;
    updateScore();
}

// Keyboard controls
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && gameOver) {
        resetGame();
    }

    // Handle choice selection
    if (showingChoice) {
        if (e.key === 'a' || e.key === 'A') {
            if (!choiceMade) {
                // First choice: Fight
                choiceMade = 'fight';
                showingChoice = false;
                // Increase power capacity for fight mode
                player.power = MAX_POWER * 1.5;
                countdown = 10; // Reset countdown for next choice
            } else if (choiceMade === 'learn' && !secondChoiceMade) {
                // Second choice A: Learn faster
                secondChoiceMade = 'faster';
                showingChoice = false;
                // Reset knowledge meter
                knowledge = 0;
                // Increase movement speed
                playerSpeed = PLAYER_SPEED * 1.5;
                // Increase knowledge gain rate
                knowledgeGainRate = 15; // Increased from 10
            }
        } else if (e.key === 'b' || e.key === 'B') {
            if (!choiceMade) {
                // First choice: Learn
                choiceMade = 'learn';
                showingChoice = false;
                countdown = 10; // Reset countdown for next choice
            } else if (choiceMade === 'learn' && !secondChoiceMade) {
                // Second choice B: Meditate
                secondChoiceMade = 'meditate';
                showingChoice = false;
                // Reset knowledge meter
                knowledge = 0;
            }
        }
        e.preventDefault();
        return;
    }

    // Prevent default arrow key scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize
updateScore();
gameLoop();
