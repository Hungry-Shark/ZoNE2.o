class StoryMode extends MazeGame {
    constructor() {
        super('mazeCanvas');
        this.currentLevel = 1;
        this.totalLevels = 25;
        this.maxScore = 1000;
        this.starThresholds = [0.5, 0.75, 0.9];
        this.difficulty = 'medium';
        
        this.initLevelSelector();
        this.loadLevel(this.currentLevel);
    }
    
    initLevelSelector() {
        const levelGrid = document.getElementById('level-grid');
        
        for (let i = 1; i <= this.totalLevels; i++) {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.textContent = i;
            button.addEventListener('click', () => {
                this.loadLevel(i);
            });
            levelGrid.appendChild(button);
        }
    }
    
    loadLevel(levelNumber) {
        this.currentLevel = levelNumber;
        document.getElementById('current-level').textContent = levelNumber;
        document.getElementById('max-score').textContent = this.maxScore;
        
        // Update level buttons
        const levelButtons = document.querySelectorAll('.level-button');
        levelButtons.forEach((button, index) => {
            button.classList.remove('current');
            if (index < levelNumber - 1) button.classList.add('completed');
            if (index === levelNumber - 1) button.classList.add('current');
        });
        
        // Set grid size based on level
        if (levelNumber <= 10) {
            this.gridSize = 10 + Math.floor(levelNumber / 3);
        } else if (levelNumber <= 20) {
            this.gridSize = 15 + Math.floor((levelNumber - 10) / 2);
        } else {
            this.gridSize = 20 + (levelNumber - 20);
        }
        
        this.cellSize = this.canvas.width / this.gridSize;
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.resetStars();
        this.generateMaze();
        
        // Set time limit based on level difficulty
        const timeLimit = 180 - (levelNumber * 5);
        this.startTimer(timeLimit);
    }
    
    resetStars() {
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
    }
    
    updateScore() {
        const timeBonus = Math.floor((this.timeLeft / this.getTimeLimit()) * 500);
        const levelBonus = this.currentLevel * 20;
        this.score = 500 + timeBonus + levelBonus;
        
        document.getElementById('score').textContent = this.score;
        this.updateStars();
    }
    
    updateStars() {
        const percentage = this.score / this.maxScore;
        const stars = document.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            star.classList.toggle('active', percentage >= this.starThresholds[index]);
        });
    }
    
    onLevelComplete() {
        // Save progress
        const progress = Math.floor((this.currentLevel / this.totalLevels) * 100);
        localStorage.setItem('mazeProgress', progress);
        
        // Unlock next level if not last level
        if (this.currentLevel < this.totalLevels) {
            setTimeout(() => {
                this.loadLevel(this.currentLevel + 1);
            }, 1500);
        } else {
            document.getElementById('message').textContent = 
                "Congratulations! You completed all levels!";
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 60 },
            color: { value: "#4cc9f0" },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#4cc9f0",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true
            }
        },
        interactivity: {
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });

    // Start the game
    const game = new StoryMode();
    game.onLevelComplete = game.onLevelComplete.bind(game);
});