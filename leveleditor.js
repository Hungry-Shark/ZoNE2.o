class LevelEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.cellSize = this.canvas.width / this.gridSize;
        this.grid = [];
        this.activeTool = 'wall'; // wall, start, end, coin, powerup

        this.init();
    }

    init() {
        // Initialize grid
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = {
                    walls: { top: true, right: true, bottom: true, left: true },
                    isStart: false,
                    isEnd: false,
                    hasCoin: false,
                    hasPowerUp: false,
                };
            }
        }

        this.drawGrid();
        this.initToolbar();
        this.initCanvasListeners();
    }

    initToolbar() {
        const wallButton = document.getElementById('wall-button');
        const startButton = document.getElementById('start-button');
        const endButton = document.getElementById('end-button');
        const coinButton = document.getElementById('coin-button');
        const powerupButton = document.getElementById('powerup-button');
        const saveButton = document.getElementById('save-button');

        wallButton.addEventListener('click', () => this.setActiveTool('wall'));
        startButton.addEventListener('click', () => this.setActiveTool('start'));
        endButton.addEventListener('click', () => this.setActiveTool('end'));
        coinButton.addEventListener('click', () => this.setActiveTool('coin'));
        powerupButton.addEventListener('click', () => this.setActiveTool('powerup'));
        saveButton.addEventListener('click', () => this.saveLevel());
    }

    setActiveTool(tool) {
        this.activeTool = tool;
        const buttons = document.querySelectorAll('.tool-button');
        buttons.forEach(button => button.classList.remove('active'));
        document.getElementById(`${tool}-button`).classList.add('active');
    }

    initCanvasListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleCanvasClick(e));
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            return;
        }

        switch (this.activeTool) {
            case 'wall':
                this.toggleWall(row, col, x, y);
                break;
            case 'start':
                this.setStart(row, col);
                break;
            case 'end':
                this.setEnd(row, col);
                break;
            case 'coin':
                this.toggleCoin(row, col);
                break;
            case 'powerup':
                this.togglePowerUp(row, col);
                break;
        }

        this.drawGrid();
    }

    toggleWall(row, col, x, y) {
        const cellX = col * this.cellSize;
        const cellY = row * this.cellSize;
        const dx = x - cellX;
        const dy = y - cellY;

        if (Math.abs(dx - this.cellSize / 2) > Math.abs(dy - this.cellSize / 2)) {
            // Horizontal wall
            if (dx > this.cellSize / 2) { // Right wall
                this.grid[row][col].walls.right = !this.grid[row][col].walls.right;
                if (col < this.gridSize - 1) {
                    this.grid[row][col + 1].walls.left = !this.grid[row][col + 1].walls.left;
                }
            } else { // Left wall
                this.grid[row][col].walls.left = !this.grid[row][col].walls.left;
                if (col > 0) {
                    this.grid[row][col - 1].walls.right = !this.grid[row][col - 1].walls.right;
                }
            }
        } else {
            // Vertical wall
            if (dy > this.cellSize / 2) { // Bottom wall
                this.grid[row][col].walls.bottom = !this.grid[row][col].walls.bottom;
                if (row < this.gridSize - 1) {
                    this.grid[row + 1][col].walls.top = !this.grid[row + 1][col].walls.top;
                }
            } else { // Top wall
                this.grid[row][col].walls.top = !this.grid[row][col].walls.top;
                if (row > 0) {
                    this.grid[row - 1][col].walls.bottom = !this.grid[row - 1][col].walls.bottom;
                }
            }
        }
    }

    setStart(row, col) {
        this.grid.forEach(r => r.forEach(c => c.isStart = false));
        this.grid[row][col].isStart = true;
    }

    setEnd(row, col) {
        this.grid.forEach(r => r.forEach(c => c.isEnd = false));
        this.grid[row][col].isEnd = true;
    }

    toggleCoin(row, col) {
        this.grid[row][col].hasCoin = !this.grid[row][col].hasCoin;
    }

    togglePowerUp(row, col) {
        this.grid[row][col].hasPowerUp = !this.grid[row][col].hasPowerUp;
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
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

                // Draw markers
                if (cell.isStart) {
                    this.ctx.fillStyle = 'rgba(102, 252, 241, 0.5)';
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
                if (cell.isEnd) {
                    this.ctx.fillStyle = 'rgba(247, 37, 133, 0.5)';
                    this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                }
                if (cell.hasCoin) {
                    this.ctx.fillStyle = 'gold';
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 4, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                if (cell.hasPowerUp) {
                    this.ctx.fillStyle = '#66FCF1';
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.cellSize / 2, y + this.cellSize / 2 - this.cellSize / 4);
                    this.ctx.lineTo(x + this.cellSize / 2 + this.cellSize / 4, y + this.cellSize / 2 + this.cellSize / 4);
                    this.ctx.lineTo(x + this.cellSize / 2 - this.cellSize / 4, y + this.cellSize / 2 + this.cellSize / 4);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
        }
    }

    saveLevel() {
        const levelData = {
            gridSize: this.gridSize,
            maze: this.grid,
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(levelData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "custom_level.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editor = new LevelEditor('editor-canvas');
});
