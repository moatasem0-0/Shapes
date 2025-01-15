const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const shapeSelect = document.getElementById('shape');
const clearButton = document.getElementById('clearCanvas');

let isDrawing = false;
let startX = 0;
let startY = 0;
let currentShape = 'free';
let points = [];

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

shapeSelect.addEventListener('change', () => {
    currentShape = shapeSelect.value;
});

clearButton.addEventListener('click', clearCanvas);

function startDrawing(e) {
    isDrawing = true;
    [startX, startY] = getMousePos(e);
    points = [[startX, startY]];
}

function draw(e) {
    if (!isDrawing) return;

    const [x, y] = getMousePos(e);

    if (currentShape === 'free') {
        points.push([x, y]);
        drawFreehand();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape(x, y);
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;

    isDrawing = false;
    if (currentShape === 'free') {
        refineFreehand();
    } else {
        const [endX, endY] = getMousePos(e);
        drawShape(endX, endY, true);
    }
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

function drawShape(x, y, finalize = false) {
    ctx.beginPath();
    if (currentShape === 'circle') {
        const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    } else if (currentShape === 'rectangle') {
        ctx.rect(startX, startY, x - startX, y - startY);
    } else if (currentShape === 'triangle') {
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.lineTo(startX * 2 - x, y);
        ctx.closePath();
    }
    ctx.stroke();

    if (finalize) {
        ctx.fillStyle = 'rgba(45, 85, 255, 1)';
        ctx.fill();
    }
}

function drawFreehand() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
}

function refineFreehand() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    for (let i = 1; i < points.length - 1; i++) {
        const [prevX, prevY] = points[i - 1];
        const [currentX, currentY] = points[i];
        const [nextX, nextY] = points[i + 1];

        const smoothX = (prevX + currentX + nextX) / 3;
        const smoothY = (prevY + currentY + nextY) / 3;

        ctx.lineTo(smoothX, smoothY);
    }
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
