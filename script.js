// =========================
// Canvas setup
// =========================
var canvas = document.getElementById("canvas");
var maybeCtx = canvas.getContext("2d");
if (!maybeCtx) {
    throw new Error("Canvas 2D context not available");
}
var ctx = maybeCtx;
// =========================
// Layout positions
// =========================
var ROW1_Y = 150;
var ROW2_Y = 380;
var COL_LEFT = 200;
var COL_RIGHT = 520;
// =========================
// Mouse
// =========================
var mouse = { x: 0, y: 0 };
canvas.addEventListener("mousemove", function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
});
// =========================
// Math helpers
// =========================
function dist2(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx * dx + dy * dy;
}
function closestPointOnSegment(a, b, p) {
    var abx = b.x - a.x;
    var aby = b.y - a.y;
    var apx = p.x - a.x;
    var apy = p.y - a.y;
    var abLen2 = abx * abx + aby * aby;
    var t = (apx * abx + apy * aby) / abLen2;
    t = Math.max(0, Math.min(1, t));
    return {
        x: a.x + abx * t,
        y: a.y + aby * t,
    };
}
function closestPointOnPolygon(poly, p) {
    var closest = null;
    var minDist = Infinity;
    for (var i = 0; i < poly.length; i++) {
        var a = poly[i];
        var b = poly[(i + 1) % poly.length];
        var cp = closestPointOnSegment(a, b, p);
        var d = dist2(cp, p);
        if (d < minDist) {
            minDist = d;
            closest = cp;
        }
    }
    // Polygon always has at least one edge
    return closest;
}
// =========================
// Shape helpers
// =========================
function rectangleFromCenter(cx, cy, w, h) {
    return [
        { x: cx - w / 2, y: cy - h / 2 },
        { x: cx + w / 2, y: cy - h / 2 },
        { x: cx + w / 2, y: cy + h / 2 },
        { x: cx - w / 2, y: cy + h / 2 },
    ];
}
function regularPolygon(cx, cy, radius, sides, rotation) {
    if (rotation === void 0) { rotation = -Math.PI / 2; }
    var pts = [];
    for (var i = 0; i < sides; i++) {
        var a = rotation + (i * 2 * Math.PI) / sides;
        pts.push({
            x: cx + Math.cos(a) * radius,
            y: cy + Math.sin(a) * radius,
        });
    }
    return pts;
}
function chevronShape(cx, cy, width, height, notchDepth) {
    var hw = width / 2;
    var hh = height / 2;
    return [
        { x: cx - hw, y: cy - hh },
        { x: cx + hw, y: cy - hh },
        { x: cx + hw, y: cy + hh },
        { x: cx, y: cy + hh - notchDepth },
        { x: cx - hw, y: cy + hh },
    ];
}
// =========================
// Shapes (ORDERED)
// =========================
// Row 1
var triangle = regularPolygon(COL_LEFT, ROW1_Y, 90, 3);
var square = rectangleFromCenter(COL_RIGHT, ROW1_Y, 160, 160);
// Row 2
var chevron = chevronShape(COL_LEFT, ROW2_Y, 180, 160, 70);
var pentagon = regularPolygon(COL_RIGHT, ROW2_Y, 80, 5);
// =========================
// Drawing helpers
// =========================
function drawPolygon(poly) {
    ctx.beginPath();
    poly.forEach(function (p, i) {
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();
}
function drawDot(p) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
}
// =========================
// Render loop
// =========================
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    drawPolygon(triangle);
    drawDot(closestPointOnPolygon(triangle, mouse));
    drawPolygon(square);
    drawDot(closestPointOnPolygon(square, mouse));
    drawPolygon(chevron);
    drawDot(closestPointOnPolygon(chevron, mouse));
    drawPolygon(pentagon);
    drawDot(closestPointOnPolygon(pentagon, mouse));
    requestAnimationFrame(render);
}
render();
