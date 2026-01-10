const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* =========================
   Mouse
========================= */
let mouse = { x: 0, y: 0 };

canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});

/* =========================
   Math helpers
========================= */
function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function closestPointOnSegment(a, b, p) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;

  const abLen2 = abx * abx + aby * aby;
  let t = (apx * abx + apy * aby) / abLen2;
  t = Math.max(0, Math.min(1, t));

  return {
    x: a.x + abx * t,
    y: a.y + aby * t,
  };
}

/* =========================
   Closest point on polygon
========================= */
function closestPointOnPolygon(poly, p) {
  let closest = null;
  let minDist = Infinity;

  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const cp = closestPointOnSegment(a, b, p);
    const d = dist2(cp, p);

    if (d < minDist) {
      minDist = d;
      closest = cp;
    }
  }
  return closest;
}

/* =========================
   Shape helpers
========================= */
function rectangleToPolygon(x, y, w, h) {
  return [
    { x: x, y: y },
    { x: x + w, y: y },
    { x: x + w, y: y + h },
    { x: x, y: y + h },
  ];
}

function regularPolygon(cx, cy, radius, sides, rotation = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i * 2 * Math.PI) / sides;
    pts.push({
      x: cx + Math.cos(a) * radius,
      y: cy + Math.sin(a) * radius,
    });
  }
  return pts;
}

/* =========================
   Shapes (NO OVERLAP)
========================= */
// Row 1
const rectangle = rectangleToPolygon(80, 80, 220, 140);
const triangle = regularPolygon(520, 150, 90, 3);

// Row 2
const pentagon = regularPolygon(350, 350, 90, 5);

/* =========================
   Drawing helpers
========================= */
function drawPolygon(poly) {
  ctx.beginPath();
  poly.forEach((p, i) => {
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

/* =========================
   Render loop
========================= */
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  // Rectangle (row 1 - left)
  drawPolygon(rectangle);
  drawDot(closestPointOnPolygon(rectangle, mouse));

  // Triangle (row 1 - right)
  drawPolygon(triangle);
  drawDot(closestPointOnPolygon(triangle, mouse));

  // Pentagon (row 2 - center)
  drawPolygon(pentagon);
  drawDot(closestPointOnPolygon(pentagon, mouse));

  requestAnimationFrame(render);
}

render();
