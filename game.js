class MazeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 15;
        this.cellSize = this.canvas.width / this.gridSize;
        this.maze = [];
        this.player = {
            row: 0,
            col: 0,
            direction: 0, // 0: right, 1: down, 2: left, 3: up
            glow: 0
        };
        this.gameWon = false;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.score = 0;
        this.maxScore = 1000;
        this.starThresholds = [0.5, 0.75, 0.9]; // 50%, 75%, 90% of max score
        
        this.init();
    }
    
    init() {
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    generateMaze() {
        this.maze = [];
        this.gameWon = false;
        this.score = 0;
        
        // Initialize grid
        for (let row = 0; row < this.gridSize; row++) {
            this.maze[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.maze[row][col] = new Cell(row, col);
            }
        }

        // Generate maze using depth-first search
        const stack = [];
        let startCell = this.maze[0][0];
        startCell.visited = true;
        stack.push(startCell);

        while (stack.length > 0) {
            const currentCell = stack.pop();
            const unvisitedNeighbors = this.getUnvisitedNeighbors(currentCell);
            
            if (unvisitedNeighbors.length > 0) {
                stack.push(currentCell);
                const randomNeighbor = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
                this.removeWalls(currentCell, randomNeighbor);
                randomNeighbor.visited = true;
                stack.push(randomNeighbor);
            }
        }

        // Set start and end points
        this.maze[0][0].isStart = true;
        this.maze[this.gridSize - 1][this.gridSize - 1].isEnd = true;
        this.player.row = 0;
        this.player.col = 0;
        this.player.direction = 0;
        
        this.drawMaze();
        this.startTimer(this.getTimeLimit());
    }

    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const { row, col } = cell;
        
        if (row > 0 && !this.maze[row - 1][col].visited) neighbors.push(this.maze[row - 1][col]);
        if (row < this.gridSize - 1 && !this.maze[row + 1][col].visited) neighbors.push(this.maze[row + 1][col]);
        if (col > 0 && !this.maze[row][col - 1].visited) neighbors.push(this.maze[row][col - 1]);
        if (col < this.gridSize - 1 && !this.maze[row][col + 1].visited) neighbors.push(this.maze[row][col + 1]);
        
        return neighbors;
    }

    removeWalls(cell1, cell2) {
        if (cell1.row === cell2.row) {
            if (cell1.col > cell2.col) {
                cell1.walls.left = false;
                cell2.walls.right = false;
            } else {
                cell1.walls.right = false;
                cell2.walls.left = false;
            }
        } else {
            if (cell1.row > cell2.row) {
                cell1.walls.top = false;
                cell2.walls.bottom = false;
            } else {
                cell1.walls.bottom = false;
                cell2.walls.top = false;
            }
        }
    }

    drawMaze() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.maze[row][col];
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                // Draw walls
                this.ctx.strokeStyle = '#d1d5db';
                this.ctx.lineWidth = 3;
                
                if (cell.walls.top) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + this.cellSize, y);
                    this.ctx.stroke();
                }
                
                if (cell.walls.right) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.cellSize, y);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.stroke();
                }
                
                if (cell.walls.bottom) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.lineTo(x, y + this.cellSize);
                    this.ctx.stroke();
                }
                
                if (cell.walls.left) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y + this.cellSize);
                    this.ctx.lineTo(x, y);
                    this.ctx.stroke();
                }
                
                // Draw start and end markers
                if (cell.isStart) {
                    this.ctx.fillStyle = 'rgba(187, 247, 208, 0.7)';
                    this.ctx.fillRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6);
                } else if (cell.isEnd) {
                    this.ctx.fillStyle = 'rgba(253, 230, 138, 0.7)';
                    this.ctx.fillRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6);
                }
            }
        }
        
        // Draw player (glowing arrow)
        this.drawPlayer();
    }

    drawPlayer() {
        const x = this.player.col * this.cellSize + this.cellSize / 2;
        const y = this.player.row * this.cellSize + this.cellSize / 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.player.direction * Math.PI / 2);
        
        // Glow effect
        this.player.glow = (this.player.glow + 0.05) % (Math.PI * 2);
        const glowIntensity = 0.7 + Math.sin(this.player.glow) * 0.3;
        
        // Arrow body
        this.ctx.fillStyle = `rgba(245, 101, 101, ${glowIntensity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.cellSize/3, -this.cellSize/4);
        this.ctx.lineTo(this.cellSize/3, 0);
        this.ctx.lineTo(-this.cellSize/3, this.cellSize/4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Arrow head
        this.ctx.fillStyle = `rgba(245, 101, 101, ${glowIntensity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(this.cellSize/3, -this.cellSize/3);
        this.ctx.lineTo(this.cellSize/2, 0);
        this.ctx.lineTo(this.cellSize/3, this.cellSize/3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Glow effect
        this.ctx.shadowColor = `rgba(245, 101, 101, ${glowIntensity * 0.7})`;
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = `rgba(245, 101, 101, ${glowIntensity * 0.5})`;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.cellSize/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    handleKeyPress(event) {
        if (this.gameWon) return;
        
        let newRow = this.player.row;
        let newCol = this.player.col;
        
        switch (event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                if (this.player.row > 0 && !this.maze[this.player.row][this.player.col].walls.top) {
                    newRow -= 1;
                    this.player.direction = 3;
                }
                break;
            case 's':
            case 'arrowdown':
                if (this.player.row < this.gridSize - 1 && !this.maze[this.player.row][this.player.col].walls.bottom) {
                    newRow += 1;
                    this.player.direction = 1;
                }
                break;
            case 'a':
            case 'arrowleft':
                if (this.player.col > 0 && !this.maze[this.player.row][this.player.col].walls.left) {
                    newCol -= 1;
                    this.player.direction = 2;
                }
                break;
            case 'd':
            case 'arrowright':
                if (this.player.col < this.gridSize - 1 && !this.maze[this.player.row][this.player.col].walls.right) {
                    newCol += 1;
                    this.player.direction = 0;
                }
                break;
            default:
                return;
        }
        
        if (newRow !== this.player.row || newCol !== this.player.col) {
            this.player.row = newRow;
            this.player.col = newCol;
            this.drawMaze();
            
            // Check if player reached the end
            if (this.player.row === this.gridSize - 1 && this.player.col === this.gridSize - 1) {
                this.gameWon = true;
                clearInterval(this.timerInterval);
                const compliment = this.getCompliment();
                document.getElementById('message').textContent = `You solved the maze! ${compliment}`;
                this.updateScore();
                this.updateStars();
                
                if (this.onLevelComplete) {
                    this.onLevelComplete();
                }
            }
        }
    }

    getCompliment() {
        switch (this.difficulty) {
            case 'easy': return "Nice job! Try a harder difficulty!";
            case 'medium': return "Great work! You're getting good!";
            case 'hard': return "Amazing! You're a maze master!";
            default: return "Well done!";
        }
    }

    getTimeLimit() {
        switch (this.difficulty) {
            case 'easy': return 180;
            case 'medium': return 120;
            case 'hard': return 60;
            default: return 120;
        }
    }

    startTimer(seconds) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timeLeft = seconds;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateTimerDisplay();
            } else {
                clearInterval(this.timerInterval);
                document.getElementById('message').textContent = "Time's up! Try again!";
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer-display').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateScore() {
        const timeBonus = Math.floor((this.timeLeft / this.getTimeLimit()) * 500);
        const levelBonus = this.currentLevel ? this.currentLevel * 20 : 0;
        this.score = 500 + timeBonus + levelBonus;
        
        document.getElementById('score').textContent = this.score;
        if (document.getElementById('max-score')) {
            document.getElementById('max-score').textContent = this.maxScore;
        }
    }

    updateStars() {
        const percentage = this.score / this.maxScore;
        const stars = document.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            star.classList.toggle('active', percentage >= this.starThresholds[index]);
        });
    }
}

// Cell constructor
function Cell(row, col) {
    this.row = row;
    this.col = col;
    this.walls = {
        top: true,
        right: true,
        bottom: true,
        left: true
    };
    this.visited = false;
    this.isStart = false;
    this.isEnd = false;
}