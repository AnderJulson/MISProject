document.addEventListener('DOMContentLoaded', () => {

    // --- Get DOM Elements ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const finalScoreDisplay = document.getElementById('finalScore');
    const restartButton = document.getElementById('restartButton');

    // --- Game Variables ---
    let bird;
    let pipes;
    let score;
    let gameOver;
    let frameCount;
    
    // --- Game Settings ---
    const birdSize = { width: 35, height: 30 };
    const birdStart = { x: 80, y: 250 };
    const gravity = 0.5;
    const lift = -9;
    
    const pipeWidth = 60;
    const pipeGap = 150;
    const pipeSpeed = 3;
    const pipeInterval = 100; // Frames between new pipes

    // --- Theme Colors (from style.css) ---
    const birdColor = '#ffcc33'; // var(--secondary-color)
    const pipeColor = '#7a0019'; // var(--primary-color)
    const birdEyeColor = '#333'; // var(--text-color)

    // --- Game Functions ---

    /**
     * Initializes or resets the game state
     */
    function setupGame() {
        bird = {
            x: birdStart.x,
            y: birdStart.y,
            width: birdSize.width,
            height: birdSize.height,
            velocity: 0
        };
        pipes = [];
        score = 0;
        gameOver = false;
        frameCount = 0;
        
        scoreDisplay.textContent = 'Score: 0';
        gameOverScreen.style.display = 'none';
        
        // Start the game loop
        gameLoop();
    }

    /**
     * Makes the bird "flap"
     */
    function flap() {
        if (!gameOver) {
            bird.velocity = lift;
        }
    }

    /**
     * Generates a new pair of pipes
     */
    function generatePipe() {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + pipeGap,
            passed: false
        });
    }

    /**
     * Shows the game over modal
     */
    function showGameOver() {
        gameOver = true;
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    /**
     * Draws the bird (a gold square with an "eye")
     */
    function drawBird() {
        // Draw bird body
        ctx.fillStyle = birdColor;
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        
        // Draw bird eye
        ctx.fillStyle = birdEyeColor;
        ctx.fillRect(bird.x + bird.width * 0.6, bird.y + bird.height * 0.3, 5, 5);
    }

    /**
     * Draws all pipes
     */
    function drawPipes() {
        ctx.fillStyle = pipeColor;
        pipes.forEach(pipe => {
            // Draw top pipe
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            // Draw bottom pipe
            ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        });
    }

    /**
     * Updates the game state for each frame
     */
    function update() {
        if (gameOver) return;

        // --- Bird Physics ---
        bird.velocity += gravity;
        bird.y += bird.velocity;

        // --- Collision: Ground ---
        if (bird.y + bird.height > canvas.height) {
            bird.y = canvas.height - bird.height;
            bird.velocity = 0;
            showGameOver();
        }
        
        // --- Collision: Sky ---
        if (bird.y < 0) {
            bird.y = 0;
            bird.velocity = 0;
        }

        // --- Pipe Logic ---
        frameCount++;
        
        // Add new pipe
        if (frameCount % pipeInterval === 0) {
            generatePipe();
        }

        // Update, check collision, and score for each pipe
        for (let i = pipes.length - 1; i >= 0; i--) {
            let pipe = pipes[i];
            
            // Move pipe left
            pipe.x -= pipeSpeed;

            // --- Collision: Pipes ---
            if (
                bird.x < pipe.x + pipeWidth &&
                bird.x + bird.width > pipe.x &&
                (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
            ) {
                showGameOver();
            }

            // --- Scoring ---
            if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
                score++;
                pipe.passed = true;
                scoreDisplay.textContent = `Score: ${score}`;
            }

            // --- Remove Off-screen Pipes ---
            if (pipe.x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }
    }

    /**
     * Draws the game elements on the canvas
     */
    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw game elements
        drawBird();
        drawPipes();
    }

    /**
     * The main game loop
     */
    function gameLoop() {
        update();
        draw();
        
        // Continue loop if game is not over
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    // --- Event Listeners ---
    // Flap on spacebar press or mouse click
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            flap();
        }
    });
    canvas.addEventListener('mousedown', flap);
    
    // Restart game button
    restartButton.addEventListener('click', setupGame);

    // --- Start Game ---
    setupGame();
});
