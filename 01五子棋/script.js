class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black'; // 玩家始终是黑棋
        this.gameOver = false;
        this.moveHistory = [];
        this.winningStones = [];
        this.isAITurn = false;
        this.difficulty = 'medium';
        
        this.initializeBoard();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        // 初始化棋盘数组
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        
        // 创建棋盘格子
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                gameBoard.appendChild(cell);
            }
        }
    }
    
    bindEvents() {
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('new-game-btn').addEventListener('click', () => this.hideResult());
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
    }
    
    handleCellClick(event) {
        if (this.gameOver || this.isAITurn) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (this.board[row][col] !== null) return;
        
        this.makeMove(row, col);
    }
    
    makeMove(row, col) {
        // 记录移动历史
        this.moveHistory.push({
            row: row,
            col: col,
            player: this.currentPlayer
        });
        
        // 更新棋盘状态
        this.board[row][col] = this.currentPlayer;
        
        // 在界面上放置棋子
        this.placeStone(row, col, this.currentPlayer);
        
        // 检查胜负
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.highlightWinningStones();
            this.showResult(this.currentPlayer);
            return;
        }
        
        // 检查平局
        if (this.checkDraw()) {
            this.gameOver = true;
            this.showResult('draw');
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateUI();
        
        // 如果轮到AI，延迟执行AI移动
        if (this.currentPlayer === 'white' && !this.gameOver) {
            this.isAITurn = true;
            setTimeout(() => this.makeAIMove(), 800);
        }
    }
    
    placeStone(row, col, player) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('occupied');
        
        const stone = document.createElement('div');
        stone.className = `stone ${player}`;
        cell.appendChild(stone);
        
        // 播放落子音效
        this.playSound('place');
    }
    
    checkWin(row, col) {
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            const stones = this.getConsecutiveStones(row, col, dx, dy);
            if (stones.length >= 5) {
                this.winningStones = stones;
                return true;
            }
        }
        
        return false;
    }
    
    getConsecutiveStones(row, col, dx, dy) {
        const player = this.board[row][col];
        const stones = [{row, col}];
        
        // 向一个方向搜索
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            
            if (newRow < 0 || newRow >= this.boardSize || 
                newCol < 0 || newCol >= this.boardSize ||
                this.board[newRow][newCol] !== player) {
                break;
            }
            
            stones.push({row: newRow, col: newCol});
        }
        
        // 向相反方向搜索
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            
            if (newRow < 0 || newRow >= this.boardSize || 
                newCol < 0 || newCol >= this.boardSize ||
                this.board[newRow][newCol] !== player) {
                break;
            }
            
            stones.unshift({row: newRow, col: newCol});
        }
        
        return stones;
    }
    
    checkDraw() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    highlightWinningStones() {
        this.winningStones.forEach(({row, col}) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            const stone = cell.querySelector('.stone');
            if (stone) {
                stone.classList.add('winning');
            }
        });
    }
    
    makeAIMove() {
        if (this.gameOver) return;
        
        const bestMove = this.findBestMoveForAI();
        if (bestMove) {
            this.makeMove(bestMove.row, bestMove.col);
        }
        this.isAITurn = false;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver || this.isAITurn) return;
        
        // 人机对战模式下，需要撤销两步（玩家和AI的）
        if (this.moveHistory.length >= 2) {
            // 撤销AI的移动
            const aiMove = this.moveHistory.pop();
            this.board[aiMove.row][aiMove.col] = null;
            let cell = document.querySelector(`[data-row="${aiMove.row}"][data-col="${aiMove.col}"]`);
            cell.classList.remove('occupied');
            cell.innerHTML = '';
            
            // 撤销玩家的移动
            const playerMove = this.moveHistory.pop();
            this.board[playerMove.row][playerMove.col] = null;
            cell = document.querySelector(`[data-row="${playerMove.row}"][data-col="${playerMove.col}"]`);
            cell.classList.remove('occupied');
            cell.innerHTML = '';
            
            this.currentPlayer = 'black'; // 重新轮到玩家
        } else if (this.moveHistory.length === 1) {
            // 只撤销玩家的第一步
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.row][lastMove.col] = null;
            const cell = document.querySelector(`[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
            cell.classList.remove('occupied');
            cell.innerHTML = '';
            this.currentPlayer = 'black';
        }
        
        this.updateUI();
        this.playSound('undo');
    }
    
    showHint() {
        if (this.gameOver) return;
        
        const bestMove = this.findBestMove();
        if (bestMove) {
            const cell = document.querySelector(`[data-row="${bestMove.row}"][data-col="${bestMove.col}"]`);
            cell.classList.add('hint-cell');
            
            setTimeout(() => {
                cell.classList.remove('hint-cell');
            }, 3000);
            
            this.playSound('hint');
        }
    }
    
    findBestMove() {
        // 简单的AI逻辑：寻找最佳落子位置（用于提示功能）
        const moves = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    const score = this.evaluatePosition(row, col);
                    moves.push({row, col, score});
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        // 按分数排序，返回最佳位置
        moves.sort((a, b) => b.score - a.score);
        return moves[0];
    }
    
    findBestMoveForAI() {
        // 根据难度设置搜索深度
        let depth;
        switch (this.difficulty) {
            case 'easy':
                depth = 1;
                break;
            case 'medium':
                depth = 2;
                break;
            case 'hard':
                depth = 3;
                break;
            default:
                depth = 2;
        }
        
        // 使用minimax算法寻找最佳移动
        const result = this.minimax(depth, 'white', -Infinity, Infinity);
        return result.move;
    }
    
    minimax(depth, player, alpha, beta) {
        // 检查游戏是否结束或达到搜索深度
        if (depth === 0 || this.gameOver) {
            return {
                score: this.evaluateBoardState(),
                move: null
            };
        }
        
        const moves = this.getValidMoves();
        if (moves.length === 0) {
            return {
                score: 0,
                move: null
            };
        }
        
        let bestMove = null;
        
        if (player === 'white') { // AI最大化
            let maxScore = -Infinity;
            
            for (const move of moves) {
                this.board[move.row][move.col] = player;
                const score = this.minimax(depth - 1, 'black', alpha, beta).score;
                this.board[move.row][move.col] = null;
                
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta剪枝
            }
            
            return {
                score: maxScore,
                move: bestMove
            };
        } else { // 玩家最小化
            let minScore = Infinity;
            
            for (const move of moves) {
                this.board[move.row][move.col] = player;
                const score = this.minimax(depth - 1, 'white', alpha, beta).score;
                this.board[move.row][move.col] = null;
                
                if (score < minScore) {
                    minScore = score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta剪枝
            }
            
            return {
                score: minScore,
                move: bestMove
            };
        }
    }
    
    getValidMoves() {
        const moves = [];
        const searchRadius = 2; // 只搜索已有棋子周围的位置
        
        if (this.moveHistory.length === 0) {
            // 如果是第一步，选择中心附近的位置
            const center = Math.floor(this.boardSize / 2);
            for (let row = center - 1; row <= center + 1; row++) {
                for (let col = center - 1; col <= center + 1; col++) {
                    if (this.board[row][col] === null) {
                        moves.push({row, col});
                    }
                }
            }
        } else {
            const occupied = new Set();
            
            // 找到所有已占用位置周围的空位
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (this.board[row][col] !== null) {
                        for (let dr = -searchRadius; dr <= searchRadius; dr++) {
                            for (let dc = -searchRadius; dc <= searchRadius; dc++) {
                                const newRow = row + dr;
                                const newCol = col + dc;
                                
                                if (newRow >= 0 && newRow < this.boardSize &&
                                    newCol >= 0 && newCol < this.boardSize &&
                                    this.board[newRow][newCol] === null) {
                                    
                                    const key = `${newRow},${newCol}`;
                                    if (!occupied.has(key)) {
                                        occupied.add(key);
                                        moves.push({row: newRow, col: newCol});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // 按评估分数排序，优先考虑更好的位置
        moves.forEach(move => {
            move.score = this.evaluatePosition(move.row, move.col);
        });
        
        moves.sort((a, b) => b.score - a.score);
        
        // 限制搜索的移动数量以提高性能
        return moves.slice(0, Math.min(20, moves.length));
    }
    
    evaluateBoardState() {
        let score = 0;
        
        // 评估整个棋盘状态
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== null) {
                    const playerScore = this.evaluatePosition(row, col);
                    if (this.board[row][col] === 'white') {
                        score += playerScore;
                    } else {
                        score -= playerScore;
                    }
                }
            }
        }
        
        return score;
    }
    
    evaluatePosition(row, col) {
        let score = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            // 评估当前玩家的得分
            const currentScore = this.evaluateDirection(row, col, dx, dy, this.currentPlayer);
            // 评估对手的得分（防守）
            const opponentScore = this.evaluateDirection(row, col, dx, dy, 
                this.currentPlayer === 'black' ? 'white' : 'black');
            
            score += currentScore + opponentScore * 0.8;
        }
        
        // 中心位置加分
        const centerDistance = Math.abs(row - 7) + Math.abs(col - 7);
        score += (14 - centerDistance) * 0.1;
        
        return score;
    }
    
    evaluateDirection(row, col, dx, dy, player) {
        let score = 0;
        let consecutive = 1;
        let openEnds = 0;
        
        // 向一个方向搜索
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            
            if (newRow < 0 || newRow >= this.boardSize || 
                newCol < 0 || newCol >= this.boardSize) {
                break;
            }
            
            if (this.board[newRow][newCol] === player) {
                consecutive++;
            } else if (this.board[newRow][newCol] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
        }
        
        // 向相反方向搜索
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            
            if (newRow < 0 || newRow >= this.boardSize || 
                newCol < 0 || newCol >= this.boardSize) {
                break;
            }
            
            if (this.board[newRow][newCol] === player) {
                consecutive++;
            } else if (this.board[newRow][newCol] === null) {
                openEnds++;
                break;
            } else {
                break;
            }
        }
        
        // 根据连续数和开放端数计算分数
        if (consecutive >= 5) {
            score = 10000;
        } else if (consecutive === 4) {
            score = openEnds >= 1 ? 1000 : 100;
        } else if (consecutive === 3) {
            score = openEnds >= 2 ? 500 : openEnds === 1 ? 50 : 10;
        } else if (consecutive === 2) {
            score = openEnds >= 2 ? 50 : openEnds === 1 ? 10 : 1;
        }
        
        return score;
    }
    
    showResult(winner) {
        const resultElement = document.getElementById('game-result');
        const resultText = document.getElementById('result-text');
        const winnerStone = document.querySelector('.winner-stone');
        
        if (winner === 'draw') {
            resultText.textContent = '平局！';
            winnerStone.className = 'winner-stone';
        } else {
            resultText.textContent = `${winner === 'black' ? '玩家' : '电脑'}获胜！`;
            winnerStone.className = `winner-stone ${winner}-stone`;
        }
        
        resultElement.classList.remove('hidden');
        this.playSound('win');
    }
    
    hideResult() {
        document.getElementById('game-result').classList.add('hidden');
        this.restartGame();
    }
    
    restartGame() {
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.winningStones = [];
        this.isAITurn = false;
        
        this.initializeBoard();
        this.updateUI();
        this.playSound('restart');
    }
    
    updateUI() {
        const statusText = document.getElementById('status-text');
        const humanPlayer = document.querySelector('.human-player');
        const aiPlayer = document.querySelector('.ai-player');
        const undoBtn = document.getElementById('undo-btn');
        
        if (this.gameOver) {
            statusText.textContent = '游戏结束';
            humanPlayer.classList.remove('active');
            aiPlayer.classList.remove('active');
        } else if (this.isAITurn) {
            statusText.textContent = '电脑思考中...';
            humanPlayer.classList.remove('active');
            aiPlayer.classList.add('active');
        } else {
            statusText.textContent = `${this.currentPlayer === 'black' ? '玩家' : '电脑'}回合`;
            
            if (this.currentPlayer === 'black') {
                humanPlayer.classList.add('active');
                aiPlayer.classList.remove('active');
            } else {
                aiPlayer.classList.add('active');
                humanPlayer.classList.remove('active');
            }
        }
        
        undoBtn.disabled = this.moveHistory.length === 0 || this.gameOver || this.isAITurn;
    }
    
    playSound(type) {
        // 创建音效（使用Web Audio API生成简单音效）
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency, duration;
        
        switch (type) {
            case 'place':
                frequency = 800;
                duration = 0.1;
                break;
            case 'win':
                frequency = 1000;
                duration = 0.5;
                break;
            case 'undo':
                frequency = 600;
                duration = 0.1;
                break;
            case 'hint':
                frequency = 1200;
                duration = 0.2;
                break;
            case 'restart':
                frequency = 400;
                duration = 0.3;
                break;
            default:
                frequency = 800;
                duration = 0.1;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
}

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        document.getElementById('restart-btn').click();
    } else if (e.key === 'u' || e.key === 'U') {
        document.getElementById('undo-btn').click();
    } else if (e.key === 'h' || e.key === 'H') {
        document.getElementById('hint-btn').click();
    }
});

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new GomokuGame();
});

// 防止右键菜单
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// 触摸设备支持
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false); 