// Black Cat Meow Solitaire - Game Controller & Audio Synthesizer

// 1. Cat SVG designs for card illustrations
const BLACK_CAT_SVG = `
<svg class="card-back-cat" viewBox="0 0 100 100">
    <polygon points="25,35 15,10 40,25" fill="#181522" stroke="#ff9f43" stroke-width="1.5" />
    <polygon points="75,35 85,10 60,25" fill="#181522" stroke="#ff9f43" stroke-width="1.5" />
    <ellipse cx="50" cy="52" rx="35" ry="30" fill="#181522" stroke="#ff9f43" stroke-width="1.5" />
    <!-- Eyes -->
    <ellipse cx="38" cy="48" rx="7" ry="9" fill="#fee440" />
    <ellipse cx="38" cy="48" rx="1.5" ry="6" fill="#000" />
    <circle cx="36" cy="44" r="1.5" fill="#fff" />
    <ellipse cx="62" cy="48" rx="7" ry="9" fill="#fee440" />
    <ellipse cx="62" cy="48" rx="1.5" ry="6" fill="#000" />
    <circle cx="60" cy="44" r="1.5" fill="#fff" />
    <!-- Nose & Mouth -->
    <polygon points="50,58 47,54 53,54" fill="#ff758c" />
    <path d="M46,62 Q50,65 50,62 Q50,65 54,62" stroke="#ff9f43" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <!-- Whiskers -->
    <line x1="22" y1="60" x2="6" y2="60" stroke="#ff9f43" stroke-width="1" />
    <line x1="22" y1="65" x2="8" y2="68" stroke="#ff9f43" stroke-width="1" />
    <line x1="78" y1="60" x2="94" y2="60" stroke="#ff9f43" stroke-width="1" />
    <line x1="78" y1="65" x2="92" y2="68" stroke="#ff9f43" stroke-width="1" />
</svg>
`;

const ROYAL_CAT_SVGS = {
    J: `<svg class="card-center-svg" viewBox="0 0 100 100">
        <!-- Jack Cat with Feather Hat -->
        <path d="M10,25 Q50,5 90,25" stroke="#f15bb5" stroke-width="4" fill="none" />
        <polygon points="30,35 20,15 42,28" fill="#2f3542" />
        <polygon points="70,35 80,15 58,28" fill="#2f3542" />
        <ellipse cx="50" cy="55" rx="30" ry="25" fill="#2f3542" />
        <!-- Glowing green eyes -->
        <circle cx="40" cy="50" r="5" fill="#26de81" /><circle cx="40" cy="50" r="1.5" fill="#000" />
        <circle cx="60" cy="50" r="5" fill="#26de81" /><circle cx="60" cy="50" r="1.5" fill="#000" />
        <polygon points="50,60 48,57 52,57" fill="#ff758c" />
        <path d="M47,63 Q50,65 53,63" stroke="#fff" stroke-width="1" fill="none" />
    </svg>`,
    Q: `<svg class="card-center-svg" viewBox="0 0 100 100">
        <!-- Queen Cat with Crown -->
        <polygon points="35,15 50,30 65,15 57,35 43,35" fill="#fee440" stroke="#ff9f43" stroke-width="1" />
        <polygon points="30,38 20,18 42,31" fill="#2f3542" />
        <polygon points="70,38 80,18 58,31" fill="#2f3542" />
        <ellipse cx="50" cy="58" rx="30" ry="25" fill="#2f3542" />
        <!-- Sparkling pink cheeks & Blue eyes -->
        <circle cx="38" cy="54" r="5" fill="#00bbf9" /><circle cx="38" cy="54" r="1.5" fill="#000" />
        <circle cx="62" cy="54" r="5" fill="#00bbf9" /><circle cx="62" cy="54" r="1.5" fill="#000" />
        <circle cx="28" cy="62" r="3.5" fill="#f15bb5" opacity="0.5" />
        <circle cx="72" cy="62" r="3.5" fill="#f15bb5" opacity="0.5" />
        <polygon points="50,63 48,60 52,60" fill="#ff758c" />
    </svg>`,
    K: `<svg class="card-center-svg" viewBox="0 0 100 100">
        <!-- King Cat with Large Crown & Beard -->
        <polygon points="30,12 40,28 50,10 60,28 70,12 62,32 38,32" fill="#fee440" stroke="#d35400" />
        <polygon points="28,35 18,12 41,28" fill="#181522" />
        <polygon points="72,35 82,12 59,28" fill="#181522" />
        <ellipse cx="50" cy="55" rx="32" ry="26" fill="#181522" />
        <path d="M30,68 C35,80 65,80 70,68 Z" fill="#f1f2f6" opacity="0.9" /> <!-- Fluffy White Beard -->
        <!-- Glowing golden eyes -->
        <circle cx="38" cy="50" r="6" fill="#fee440" /><circle cx="38" cy="50" r="2" fill="#000" />
        <circle cx="62" cy="50" r="6" fill="#fee440" /><circle cx="62" cy="50" r="2" fill="#000" />
        <polygon points="50,59 47,55 53,55" fill="#ff758c" />
    </svg>`
};

const SUITS_MAP = {
    H: { name: 'Hearts', char: '♥', color: 'red' },
    D: { name: 'Diamonds', char: '♦', color: 'red' },
    C: { name: 'Clubs', char: '♣', color: 'black' },
    S: { name: 'Spades', char: '♠', color: 'black' }
};

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 2. Game State and History for Undo
let deck = [];
let piles = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []], // Index 0-3
    tableau: [[], [], [], [], [], [], []] // Index 0-6
};

let undoHistory = [];
let movesCount = 0;
let gameScore = 0;
let gameTimeSeconds = 0;
let gameTimerInterval = null;
let isGameActive = false;

// Audio Context State
let audioCtx = null;
let isSoundEnabled = true;

// Dragging tracking state
let dragData = null;

// Confetti canvas variables
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId = null;

// Initialize Sound context
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 3. Audio synthesis algorithms (No external files needed!)
function playMeow() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Synthesize a cute, high-pitched cat meow (frequency sweep)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.15);
    osc.frequency.linearRampToValueAtTime(550, now + 0.38);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    
    osc.start(now);
    osc.stop(now + 0.4);
}

function playHiss() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    // Create white noise buffer for cat growl/hiss/scratch
    const bufferSize = audioCtx.sampleRate * 0.28;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    // High-pass filter to make it sound like a cat hiss
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3600, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.28);
    filter.Q.value = 1.2;
    
    const gain = audioCtx.createGain();
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.20, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.3);
}

function playCardFlip() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.08);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
    
    osc.start(now);
    osc.stop(now + 0.08);
}

function playClick() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
    
    osc.start(now);
    osc.stop(now + 0.03);
}

// 4. Game Logic Helpers

// Generate a brand new deck of 52 cards
function createDeck() {
    const newDeck = [];
    const suits = ['H', 'D', 'C', 'S'];
    
    suits.forEach(suit => {
        RANKS.forEach((rank, valIdx) => {
            newDeck.push({
                suit: suit,
                rank: rank,
                value: valIdx + 1, // Ace is 1, Jack is 11, etc.
                color: SUITS_MAP[suit].color,
                faceUp: false,
                id: `${suit}-${rank}`
            });
        });
    });
    return newDeck;
}

// Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Deep clone piles to store history for undo
function cloneGameState() {
    const clonePile = arr => arr.map(card => ({ ...card }));
    return {
        score: gameScore,
        moves: movesCount,
        piles: {
            stock: clonePile(piles.stock),
            waste: clonePile(piles.waste),
            foundations: piles.foundations.map(clonePile),
            tableau: piles.tableau.map(clonePile)
        }
    };
}

// Push current state to undo history
function pushToUndoHistory() {
    undoHistory.push(cloneGameState());
    // Limit history stack size to 25 to preserve memory
    if (undoHistory.length > 25) {
        undoHistory.shift();
    }
    document.getElementById('undo-btn').disabled = false;
}

// 5. Timer control
function startTimer() {
    stopTimer();
    gameTimeSeconds = 0;
    document.getElementById('timer-val').textContent = '00:00';
    
    gameTimerInterval = setInterval(() => {
        gameTimeSeconds++;
        const mins = Math.floor(gameTimeSeconds / 60).toString().padStart(2, '0');
        const secs = (gameTimeSeconds % 60).toString().padStart(2, '0');
        document.getElementById('timer-val').textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopTimer() {
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
        gameTimerInterval = null;
    }
}

// 6. UI Rendering Logic

// Create HTML representation of a card
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.faceUp ? 'faceup' : 'facedown'}`;
    cardEl.id = card.id;
    cardEl.dataset.suit = card.suit;
    cardEl.dataset.rank = card.rank;
    
    const centerGraphic = ROYAL_CAT_SVGS[card.rank] || `<span class="suit-center">${SUITS_MAP[card.suit].char}</span>`;
    
    cardEl.innerHTML = `
        <div class="card-face card-back">
            ${BLACK_CAT_SVG}
        </div>
        <div class="card-face card-front">
            <div class="card-corner top-left">
                <span class="corner-rank">${card.rank}</span>
                <span class="corner-suit">${SUITS_MAP[card.suit].char}</span>
            </div>
            <div class="card-center">
                ${centerGraphic}
            </div>
            <div class="card-corner bottom-right">
                <span class="corner-rank">${card.rank}</span>
                <span class="corner-suit">${SUITS_MAP[card.suit].char}</span>
            </div>
        </div>
    `;
    
    if (card.faceUp) {
        initCardDragging(cardEl);
    }
    
    return cardEl;
}

// Render stock and waste piles
function renderTopPiles() {
    const stockEl = document.getElementById('stock-pile');
    stockEl.innerHTML = '';
    if (piles.stock.length > 0) {
        stockEl.classList.remove('empty');
        const cardBack = document.createElement('div');
        cardBack.className = 'card facedown';
        cardBack.innerHTML = `<div class="card-face card-back">${BLACK_CAT_SVG}</div>`;
        stockEl.appendChild(cardBack);
    } else {
        stockEl.classList.add('empty');
    }
    
    const wasteEl = document.getElementById('waste-pile');
    wasteEl.innerHTML = '';
    if (piles.waste.length > 0) {
        wasteEl.classList.remove('empty');
        const topWasteCard = piles.waste[piles.waste.length - 1];
        const cardEl = createCardElement(topWasteCard);
        wasteEl.appendChild(cardEl);
    } else {
        wasteEl.classList.add('empty');
    }
    
    // Render foundations
    for (let fIdx = 0; fIdx < 4; fIdx++) {
        const fPileEl = document.getElementById(`foundation-${fIdx}`);
        // Clear all except suit placeholder
        const placeholder = fPileEl.querySelector('.suit-placeholder');
        fPileEl.innerHTML = '';
        fPileEl.appendChild(placeholder);
        
        const fArray = piles.foundations[fIdx];
        if (fArray.length > 0) {
            fPileEl.classList.remove('empty');
            const topFCard = fArray[fArray.length - 1];
            const cardEl = createCardElement(topFCard);
            fPileEl.appendChild(cardEl);
        } else {
            fPileEl.classList.add('empty');
        }
    }
}

// Render Tableau columns (Handling card stacked vertically offsets)
function renderTableau() {
    for (let tIdx = 0; tIdx < 7; tIdx++) {
        const colEl = document.getElementById(`tableau-${tIdx}`);
        colEl.innerHTML = '';
        
        const colCards = piles.tableau[tIdx];
        if (colCards.length === 0) {
            colEl.classList.add('empty');
            continue;
        }
        colEl.classList.remove('empty');
        
        colCards.forEach((card, cardIndex) => {
            const cardEl = createCardElement(card);
            // Stack offset spacing top positions
            cardEl.style.top = `${cardIndex * 26}px`;
            colEl.appendChild(cardEl);
        });
    }
}

// Main board redraw
function drawBoard() {
    renderTopPiles();
    renderTableau();
    
    document.getElementById('score-val').textContent = gameScore;
    document.getElementById('moves-val').textContent = movesCount;
}

// 7. Drag and Drop Custom Mechanics (Works seamlessly with overlapping layout)

let isDragging = false;
let startX = 0;
let startY = 0;
let draggedElements = [];

function initCardDragging(cardEl) {
    cardEl.addEventListener('mousedown', startDrag);
    cardEl.addEventListener('touchstart', startDrag, { passive: false });
}

function startDrag(e) {
    if (e.button !== undefined && e.button !== 0) return; // Only left mouse button
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const cardEl = e.currentTarget;
    const cardId = cardEl.id;
    const pileInfo = getCardPileLocation(cardId);
    
    if (!pileInfo) return;
    
    let draggedCards = [];
    if (pileInfo.type === 'tableau') {
        const colIdx = pileInfo.index;
        const cardIdx = piles.tableau[colIdx].findIndex(c => c.id === cardId);
        
        if (!piles.tableau[colIdx][cardIdx].faceUp) return;
        
        draggedCards = piles.tableau[colIdx].slice(cardIdx);
    } else if (pileInfo.type === 'waste') {
        if (piles.waste[piles.waste.length - 1].id !== cardId) return;
        draggedCards = [piles.waste[piles.waste.length - 1]];
    } else if (pileInfo.type === 'foundation') {
        const fIdx = pileInfo.index;
        if (piles.foundations[fIdx][piles.foundations[fIdx].length - 1].id !== cardId) return;
        draggedCards = [piles.foundations[fIdx][piles.foundations[fIdx].length - 1]];
    }
    
    if (draggedCards.length === 0) return;
    
    e.preventDefault();
    
    if (!isGameActive) {
        isGameActive = true;
        startTimer();
    }
    
    dragData = {
        source: pileInfo,
        cards: draggedCards
    };
    
    isDragging = true;
    startX = clientX;
    startY = clientY;
    
    draggedElements = draggedCards.map(c => document.getElementById(c.id));
    
    draggedElements.forEach((el, index) => {
        el.classList.add('dragging');
        el.style.zIndex = 1000 + index;
    });
    
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, { passive: false });
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
}

function dragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    draggedElements.forEach((el, index) => {
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotateY(180deg) scale(1.02)`;
    });
    
    clearDragOverStyles();
    const target = findDropTarget(clientX, clientY);
    if (target && isValidMove(dragData, target.type, target.index)) {
        const targetEl = document.getElementById(target.type === 'tableau' ? `tableau-${target.index}` : `foundation-${target.index}`);
        if (targetEl) {
            targetEl.classList.add('drag-over');
        }
    }
}

function dragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    
    window.removeEventListener('mousemove', dragMove);
    window.removeEventListener('touchmove', dragMove);
    window.removeEventListener('mouseup', dragEnd);
    window.removeEventListener('touchend', dragEnd);
    
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    
    clearDragOverStyles();
    
    const target = findDropTarget(clientX, clientY);
    let success = false;
    
    if (target && isValidMove(dragData, target.type, target.index)) {
        executeMove(dragData, target.type, target.index);
        success = true;
    }
    
    if (!success) {
        playHiss();
        draggedElements.forEach(el => {
            el.classList.remove('dragging');
            el.style.transform = '';
            el.style.zIndex = '';
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 360);
        });
    }
    
    dragData = null;
    draggedElements = [];
}

function findDropTarget(x, y) {
    draggedElements.forEach(el => el.style.visibility = 'hidden');
    const elementUnder = document.elementFromPoint(x, y);
    draggedElements.forEach(el => el.style.visibility = '');
    
    if (!elementUnder) return null;
    
    const pileEl = elementUnder.closest('.pile');
    if (pileEl) {
        if (pileEl.id.startsWith('tableau-')) {
            const index = parseInt(pileEl.id.replace('tableau-', ''));
            return { type: 'tableau', index };
        }
        if (pileEl.id.startsWith('foundation-')) {
            const index = parseInt(pileEl.id.replace('foundation-', ''));
            return { type: 'foundation', index };
        }
    }
    return null;
}

function setupPileDropZones() {
    const stockEl = document.getElementById('stock-pile');
    stockEl.addEventListener('click', () => {
        playClick();
        handleStockClick();
    });
}

function clearDragOverStyles() {
    document.querySelectorAll('.pile').forEach(p => p.classList.remove('drag-over'));
}

// Shakes cards indicating wrong moves
function shakeDraggedCards() {
    if (!dragData) return;
    const topCardId = dragData.cards[0].id;
    const cardEl = document.getElementById(topCardId);
    if (cardEl) {
        cardEl.classList.add('shake');
        setTimeout(() => {
            cardEl.classList.remove('shake');
        }, 360);
    }
}

// 8. Solitaire Rules Validator

function getCardPileLocation(cardId) {
    // Check waste
    if (piles.waste.some(c => c.id === cardId)) {
        return { type: 'waste' };
    }
    // Check foundations
    for (let i = 0; i < 4; i++) {
        if (piles.foundations[i].some(c => c.id === cardId)) {
            return { type: 'foundation', index: i };
        }
    }
    // Check tableau
    for (let i = 0; i < 7; i++) {
        if (piles.tableau[i].some(c => c.id === cardId)) {
            return { type: 'tableau', index: i };
        }
    }
    return null;
}

function isValidMove(dragged, targetType, targetIdx) {
    if (!dragged) return false;
    
    const movingCard = dragged.cards[0];
    
    if (targetType === 'tableau') {
        const targetCol = piles.tableau[targetIdx];
        if (targetCol.length === 0) {
            // Only King (Value 13) can be placed on an empty column
            return movingCard.value === 13;
        }
        
        const targetCard = targetCol[targetCol.length - 1];
        // Tableau rules: Card must be opposite color and exactly one rank lower
        return (movingCard.color !== targetCard.color) && (movingCard.value === targetCard.value - 1);
    }
    
    if (targetType === 'foundation') {
        // Can only move one card at a time to foundations
        if (dragged.cards.length > 1) return false;
        
        const fPile = piles.foundations[targetIdx];
        const fSuit = document.getElementById(`foundation-${targetIdx}`).dataset.suit;
        
        // Foundation suit must match
        if (movingCard.suit !== fSuit) return false;
        
        if (fPile.length === 0) {
            // First card must be Ace (Value 1)
            return movingCard.value === 1;
        }
        
        const topCard = fPile[fPile.length - 1];
        // Must be same suit and exactly one rank higher
        return movingCard.value === topCard.value + 1;
    }
    
    return false;
}

// 9. Move Execution & Undo

function executeMove(dragged, targetType, targetIdx) {
    pushToUndoHistory();
    
    const movingCards = dragged.cards;
    const sourceInfo = dragged.source;
    
    // 1. Remove from source
    if (sourceInfo.type === 'tableau') {
        const sColIdx = sourceInfo.index;
        const removeCount = movingCards.length;
        piles.tableau[sColIdx].splice(piles.tableau[sColIdx].length - removeCount);
        
        // Flip the new top card face up if it was face down
        if (piles.tableau[sColIdx].length > 0) {
            const topCard = piles.tableau[sColIdx][piles.tableau[sColIdx].length - 1];
            if (!topCard.faceUp) {
                topCard.faceUp = true;
                playCardFlip();
                gameScore += 5; // +5 points for flipping card face up
            }
        }
    } else if (sourceInfo.type === 'waste') {
        piles.waste.pop();
    } else if (sourceInfo.type === 'foundation') {
        const sFIdx = sourceInfo.index;
        piles.foundations[sFIdx].pop();
        gameScore = Math.max(0, gameScore - 15); // Penalty for pulling card out of foundation
    }
    
    // 2. Add to target
    if (targetType === 'tableau') {
        piles.tableau[targetIdx].push(...movingCards);
        // Scoring: moving card from waste to tableau earns 5 points
        if (sourceInfo.type === 'waste') {
            gameScore += 5;
        }
    } else if (targetType === 'foundation') {
        piles.foundations[targetIdx].push(movingCards[0]);
        // Scoring: moving card to foundation earns 10 points
        gameScore += 10;
    }
    
    movesCount++;
    playMeow(); // Play happy meow on correct move!
    
    drawBoard();
    checkWinCondition();
}

function handleStockClick() {
    if (!isGameActive) {
        isGameActive = true;
        startTimer();
    }
    
    pushToUndoHistory();
    
    if (piles.stock.length > 0) {
        // Draw one card from stock to waste
        const card = piles.stock.pop();
        card.faceUp = true;
        piles.waste.push(card);
        movesCount++;
        playCardFlip();
    } else {
        // Recycle waste back to stock
        if (piles.waste.length === 0) {
            playHiss();
            return;
        }
        playCardFlip();
        piles.stock = piles.waste.map(c => ({ ...c, faceUp: false })).reverse();
        piles.waste = [];
        movesCount++;
    }
    drawBoard();
}

// 10. Undo function
function triggerUndo() {
    if (undoHistory.length === 0) return;
    
    playClick();
    const prev = undoHistory.pop();
    
    gameScore = prev.score;
    movesCount = prev.moves;
    piles = prev.piles;
    
    if (undoHistory.length === 0) {
        document.getElementById('undo-btn').disabled = true;
    }
    
    drawBoard();
}

// Setup a new clean game
function initNewGame() {
    stopTimer();
    isGameActive = false;
    
    document.getElementById('win-modal').classList.add('hidden');
    
    undoHistory = [];
    document.getElementById('undo-btn').disabled = true;
    
    movesCount = 0;
    gameScore = 0;
    
    // Create new shuffled deck
    const freshDeck = shuffle(createDeck());
    
    // Reset piles
    piles = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []]
    };
    
    // Distribute cards to Tableau columns
    let deckIndex = 0;
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
            const card = freshDeck[deckIndex++];
            if (row === col) {
                card.faceUp = true; // Top card is face up
            }
            piles.tableau[col].push(card);
        }
    }
    
    // Remaining cards go to stock
    piles.stock = freshDeck.slice(deckIndex);
    
    drawBoard();
    playMeow(); // Soft welcome meow!
}

// Check if all cards are in the foundation piles
function checkWinCondition() {
    const totalFoundationCards = piles.foundations.reduce((sum, f) => sum + f.length, 0);
    if (totalFoundationCards === 52) {
        handleVictory();
    }
}

function handleVictory() {
    stopTimer();
    isGameActive = false;
    
    // Start particle burst
    for (let i = 0; i < 90; i++) {
        confettiParticles.push(new ConfettiParticle(Math.random() * canvas.width, Math.random() * canvas.height - 100));
    }
    startConfetti();
    
    // Play happy meow synth sounds repeatedly
    playMeow();
    setTimeout(playMeow, 300);
    
    // Populate and open win popup
    document.getElementById('modal-score').textContent = gameScore;
    document.getElementById('modal-moves').textContent = movesCount;
    
    const mins = Math.floor(gameTimeSeconds / 60).toString().padStart(2, '0');
    const secs = (gameTimeSeconds % 60).toString().padStart(2, '0');
    document.getElementById('modal-time').textContent = `${mins}:${secs}`;
    
    setTimeout(() => {
        document.getElementById('win-modal').classList.remove('hidden');
    }, 700);
}

// 11. Confetti Canvas Graphics Loop
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 6;
        
        const colors = ['#9b5de5', '#f15bb5', '#fee440', '#00f5d4', '#00bbf9', '#ff9f43'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 6 + 3;
        this.gravity = 0.12;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.2 - 0.1;
        this.opacity = 1;
        this.decay = Math.random() * 0.015 + 0.01;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function startConfetti() {
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    
    function updateLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const modal = document.getElementById('win-modal');
        if (!modal.classList.contains('hidden') && confettiParticles.length < 150) {
            confettiParticles.push(new ConfettiParticle(Math.random() * canvas.width, -10));
        }
        
        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0 || p.y > canvas.height) {
                confettiParticles.splice(i, 1);
            }
        }
        
        if (confettiParticles.length > 0) {
            confettiAnimationId = requestAnimationFrame(updateLoop);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confettiAnimationId = null;
        }
    }
    updateLoop();
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', handleResize);
handleResize();

// 12. Main Setup Initialization listeners
document.addEventListener('DOMContentLoaded', () => {
    initNewGame();
    setupPileDropZones();
    
    // Restart action
    document.getElementById('restart-btn').addEventListener('click', () => {
        playClick();
        initNewGame();
    });
    
    // Undo action
    document.getElementById('undo-btn').addEventListener('click', () => {
        triggerUndo();
    });
    
    // Mute toggle action
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        const iconSpan = soundBtn.querySelector('.btn-icon');
        
        if (isSoundEnabled) {
            iconSpan.textContent = '🔊';
            soundBtn.title = 'Mute Sound';
            playClick();
        } else {
            iconSpan.textContent = '🔇';
            soundBtn.title = 'Unmute Sound';
        }
    });
    
    // Play again modal trigger
    document.getElementById('modal-play-again').addEventListener('click', () => {
        playClick();
        initNewGame();
    });
    
    // Interactive event to resume AudioContext (Modern browsers restriction)
    document.body.addEventListener('mousedown', () => {
        initAudio();
    }, { once: true });
});
