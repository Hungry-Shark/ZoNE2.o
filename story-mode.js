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
        this.generateMaze(this.currentLevel);
        
        // Set time limit based on level difficulty
        const timeLimit = 180 - (levelNumber * 5);
        this.startTimer(timeLimit);
    }
    
    resetStars() {
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
    }
    
    updateScore(points = 0) {
        this.score += points;
        const timeBonus = Math.floor((this.timeLeft / this.getTimeLimit()) * 500);
        const levelBonus = this.currentLevel * 20;
        this.score += timeBonus + levelBonus;
        
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

    unlockAchievement(achievementId) {
        const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
        if (!unlockedAchievements.includes(achievementId)) {
            unlockedAchievements.push(achievementId);
            localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
        }
    }
    
    onLevelComplete() {
        this.playSound('win');
        // Save progress
        const progress = Math.floor((this.currentLevel / this.totalLevels) * 100);
        localStorage.setItem('mazeProgress', progress);

        // Unlock achievements
        this.unlockAchievement(`level_${this.currentLevel}`);
        if (this.coins.length === 0) {
            this.unlockAchievement('all_coins');
        }
        
        // Unlock next level if not last level
        if (this.currentLevel < this.totalLevels) {
            setTimeout(() => {
                this.loadLevel(this.currentLevel + 1);
            }, 1500);
        } else {
            document.getElementById('message').textContent = 
                "Congratulations! You completed all levels!";
            this.unlockAchievement('level_25');
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#66FCF1"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#45A29E",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // Start the game
    const game = new StoryMode();
    game.onLevelComplete = game.onLevelComplete.bind(game);
});