class MazeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 15;
        this.cellSize = this.canvas.width / this.gridSize;
        this.maze = [];
        this.coins = [];
        this.powerUps = [];
        this.movingWalls = [];
        this.player = {
            row: 0,
            col: 0,
            direction: 0, // 0: right, 1: down, 2: left, 3: up
            glow: 0,
            speed: 1,
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
        setInterval(() => this.updateMovingWalls(), 100);
    }

    playSound(sound) {
        const audio = new Audio(`assets/${sound}.wav`);
        audio.play();
    }
    
    generateMaze(seed) {
        this.maze = [];
        this.coins = [];
        this.powerUps = [];
        this.movingWalls = [];
        this.gameWon = false;
        this.score = 0;
        this.player.speed = 1;

        // Initialize grid
        for (let row = 0; row < this.gridSize; row++) {
            this.maze[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.maze[row][col] = new Cell(row, col);
            }
        }

        // Seeded random number generator
        const seededRandom = (s) => {
            let mask = 0xffffffff;
            let m_w = (123456789 + s) & mask;
            let m_z = (987654321 - s) & mask;
            return () => {
                m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
                m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
                let result = ((m_z << 16) + (m_w & 65535)) & mask;
                result /= 4294967296;
                return result + 0.5;
            }
        };

        const random = seed ? seededRandom(seed) : Math.random;

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
                const randomNeighbor = unvisitedNeighbors[Math.floor(random() * unvisitedNeighbors.length)];
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

        // Place coins
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (random() < 0.1 && !(row === 0 && col === 0) && !(row === this.gridSize - 1 && col === this.gridSize - 1)) {
                    this.coins.push({ row, col });
                }
            }
        }

        // Place power-ups
        if (this.gridSize > 10) {
            const powerUpRow = Math.floor(random() * (this.gridSize - 2)) + 1;
            const powerUpCol = Math.floor(random() * (this.gridSize - 2)) + 1;
            this.powerUps.push({ row: powerUpRow, col: powerUpCol, type: 'speed' });
        }

        // Place moving walls
        for (let i = 0; i < this.gridSize / 5; i++) {
            const row = Math.floor(random() * (this.gridSize - 2)) + 1;
            const col = Math.floor(random() * (this.gridSize - 4)) + 2;
            this.movingWalls.push({ row, col, direction: 1, length: 2, isVertical: false });
        }

        for (let i = 0; i < this.gridSize / 5; i++) {
            const row = Math.floor(random() * (this.gridSize - 4)) + 2;
            const col = Math.floor(random() * (this.gridSize - 2)) + 1;
            this.movingWalls.push({ row, col, direction: 1, length: 2, isVertical: true });
        }
        
        this.drawMaze();
        this.startTimer(this.getTimeLimit());
    }

    updateMovingWalls() {
        this.movingWalls.forEach(wall => {
            if (wall.isVertical) {
                wall.row += wall.direction;
                if (wall.row <= 1 || wall.row >= this.gridSize - wall.length) {
                    wall.direction *= -1;
                }
            } else {
                wall.col += wall.direction;
                if (wall.col <= 1 || wall.col >= this.gridSize - wall.length) {
                    wall.direction *= -1;
                }
            }
        });
        this.drawMaze();
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
                this.ctx.strokeStyle = '#45A29E';
                this.ctx.lineWidth = 2;
                
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
                    this.ctx.fillStyle = 'rgba(102, 252, 241, 0.3)';
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                } else if (cell.isEnd) {
                    this.ctx.fillStyle = 'rgba(247, 37, 133, 0.3)';
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
            }
        }

        // Draw moving walls
        this.ctx.fillStyle = '#e53e3e';
        this.movingWalls.forEach(wall => {
            const x = wall.col * this.cellSize;
            const y = wall.row * this.cellSize;
            if (wall.isVertical) {
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize * wall.length);
            } else {
                this.ctx.fillRect(x, y, this.cellSize * wall.length, this.cellSize);
            }
        });

        // Draw coins
        this.ctx.fillStyle = 'gold';
        this.coins.forEach(coin => {
            const x = coin.col * this.cellSize + this.cellSize / 2;
            const y = coin.row * this.cellSize + this.cellSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            const x = powerUp.col * this.cellSize + this.cellSize / 2;
            const y = powerUp.row * this.cellSize + this.cellSize / 2;
            this.ctx.fillStyle = '#66FCF1';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - this.cellSize / 4);
            this.ctx.lineTo(x + this.cellSize / 4, y + this.cellSize / 4);
            this.ctx.lineTo(x - this.cellSize / 4, y + this.cellSize / 4);
            this.ctx.closePath();
            this.ctx.fill();
        });
        
        // Draw player
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
        
        this.ctx.fillStyle = `rgba(102, 252, 241, ${glowIntensity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.cellSize/3, -this.cellSize/4);
        this.ctx.lineTo(this.cellSize/3, 0);
        this.ctx.lineTo(-this.cellSize/3, this.cellSize/4);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.shadowColor = `rgba(102, 252, 241, ${glowIntensity * 0.7})`;
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = `rgba(102, 252, 241, ${glowIntensity * 0.5})`;
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
                event.preventDefault();
                if (this.player.row > 0 && !this.maze[this.player.row][this.player.col].walls.top) {
                    newRow -= 1;
                    this.player.direction = 3;
                }
                break;
            case 's':
            case 'arrowdown':
                event.preventDefault();
                if (this.player.row < this.gridSize - 1 && !this.maze[this.player.row][this.player.col].walls.bottom) {
                    newRow += 1;
                    this.player.direction = 1;
                }
                break;
            case 'a':
            case 'arrowleft':
                event.preventDefault();
                if (this.player.col > 0 && !this.maze[this.player.row][this.player.col].walls.left) {
                    newCol -= 1;
                    this.player.direction = 2;
                }
                break;
            case 'd':
            case 'arrowright':
                event.preventDefault();
                if (this.player.col < this.gridSize - 1 && !this.maze[this.player.row][this.player.col].walls.right) {
                    newCol += 1;
                    this.player.direction = 0;
                }
                break;
            default:
                return;
        }
        
        if (newRow !== this.player.row || newCol !== this.player.col) {
            this.playSound('move');
            // Check for collisions with moving walls
            let collision = false;
            this.movingWalls.forEach(wall => {
                if (wall.isVertical) {
                    if (newCol === wall.col && newRow >= wall.row && newRow < wall.row + wall.length) {
                        collision = true;
                    }
                } else {
                    if (newRow === wall.row && newCol >= wall.col && newCol < wall.col + wall.length) {
                        collision = true;
                    }
                }
            });

            if (collision) {
                return;
            }

            this.player.row = newRow;
            this.player.col = newCol;

            // Check for coin collection
            const coinIndex = this.coins.findIndex(coin => coin.row === newRow && coin.col === newCol);
            if (coinIndex > -1) {
                this.coins.splice(coinIndex, 1);
                this.updateScore(100);
                this.playSound('coin');
            }

            // Check for power-up collection
            const powerUpIndex = this.powerUps.findIndex(powerUp => powerUp.row === newRow && powerUp.col === newCol);
            if (powerUpIndex > -1) {
                const powerUp = this.powerUps.splice(powerUpIndex, 1)[0];
                if (powerUp.type === 'speed') {
                    this.player.speed = 2;
                    this.playSound('powerup');
                    setTimeout(() => {
                        this.player.speed = 1;
                    }, 5000);
                }
            }

            this.drawMaze();
            
            // Check if player reached the end
            if (this.player.row === this.gridSize - 1 && this.player.col === this.gridSize - 1) {
                this.gameWon = true;
                clearInterval(this.timerInterval);
                const compliment = this.getCompliment();
                document.getElementById('message').textContent = `You solved the maze! ${compliment}`;
                this.updateScore();
                this.updateStars();
                this.saveScore();
                
                if (this.onLevelComplete) {
                    this.onLevelComplete();
                }
            }
        }
    }

    saveScore() {
        const name = prompt("Congratulations! Enter your name for the leaderboard:");
        if (!name) return;

        const leaderboards = JSON.parse(localStorage.getItem('leaderboards')) || {};
        const level = this.currentLevel || 'mastery';

        if (!leaderboards[level]) {
            leaderboards[level] = [];
        }

        leaderboards[level].push({ name, score: this.score });
        leaderboards[level].sort((a, b) => b.score - a.score);
        leaderboards[level] = leaderboards[level].slice(0, 10); // Keep top 10

        localStorage.setItem('leaderboards', JSON.stringify(leaderboards));
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

    updateScore(points = 0) {
        this.score += points;
        const timeBonus = Math.floor((this.timeLeft / this.getTimeLimit()) * 500);
        const levelBonus = this.currentLevel ? this.currentLevel * 20 : 0;
        this.score += timeBonus + levelBonus;
        
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