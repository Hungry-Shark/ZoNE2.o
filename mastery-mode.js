class MasteryMode extends MazeGame {
    constructor() {
        super('mazeCanvas');
        this.difficulty = 'medium';
        this.maxScore = 1000;
        
        this.setupDifficultyButtons();
        this.setupGenerateButton();
        this.generateMaze();
    }
    
    setupDifficultyButtons() {
        const buttons = document.querySelectorAll('.difficulty-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.difficulty = button.dataset.difficulty;
                buttons.forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
                this.updateGridSize();
                this.generateMaze();
            });
        });
    }
    
    setupGenerateButton() {
        document.getElementById('generateMaze').addEventListener('click', () => {
            this.generateMaze();
        });
    }
    
    updateGridSize() {
        switch (this.difficulty) {
            case 'easy':
                this.gridSize = 10;
                this.maxScore = 500;
                break;
            case 'medium':
                this.gridSize = 20;
                this.maxScore = 1000;
                break;
            case 'hard':
                this.gridSize = 30;
                this.maxScore = 1500;
                break;
        }
        this.cellSize = this.canvas.width / this.gridSize;
    }
    
    generateMaze() {
        super.generateMaze();
        const timeLimit = this.getTimeLimit();
        this.startTimer(timeLimit);
        document.getElementById('message').textContent = 
            `Navigate the maze! Difficulty: ${this.difficulty}`;
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
    new MasteryMode();
});