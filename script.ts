// Types

interface Point {
  x: number;
  y: number;
}

// Canvas setup

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const maybeCtx = canvas.getContext("2d");
if (!maybeCtx) {
  throw new Error("Canvas 2D context not available");
}

const ctx: CanvasRenderingContext2D = maybeCtx;

// Layout positions

const ROW1_Y = 150;
const ROW2_Y = 380;
const COL_LEFT = 200;
const COL_RIGHT = 520;

// Mouse

let mouse: Point = { x: 0, y: 0 };

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});

// Math helpers

function dist2(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function closestPointOnSegment(a: Point, b: Point, p: Point): Point {
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

function closestPointOnPolygon(poly: Point[], p: Point): Point {
  let closest: Point | null = null;
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

  // Polygon always has at least one edge
  return closest as Point;
}

// Shape helpers

function rectangleFromCenter(
  cx: number,
  cy: number,
  w: number,
  h: number
): Point[] {
  return [
    { x: cx - w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy + h / 2 },
    { x: cx - w / 2, y: cy + h / 2 },
  ];
}

function regularPolygon(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number = -Math.PI / 2
): Point[] {
  const pts: Point[] = [];

  for (let i = 0; i < sides; i++) {
    const a = rotation + (i * 2 * Math.PI) / sides;
    pts.push({
      x: cx + Math.cos(a) * radius,
      y: cy + Math.sin(a) * radius,
    });
  }

  return pts;
}

function chevronShape(
  cx: number,
  cy: number,
  width: number,
  height: number,
  notchDepth: number
): Point[] {
  const hw = width / 2;
  const hh = height / 2;

  return [
    { x: cx - hw, y: cy - hh },
    { x: cx + hw, y: cy - hh },
    { x: cx + hw, y: cy + hh },
    { x: cx, y: cy + hh - notchDepth },
    { x: cx - hw, y: cy + hh },
  ];
}

// Shapes (ORDERED)

// Row 1
const triangle: Point[] = regularPolygon(COL_LEFT, ROW1_Y, 90, 3);
const square: Point[] = rectangleFromCenter(COL_RIGHT, ROW1_Y, 160, 160);

// Row 2
const chevron: Point[] = chevronShape(COL_LEFT, ROW2_Y, 180, 160, 70);
const pentagon: Point[] = regularPolygon(COL_RIGHT, ROW2_Y, 80, 5);

// Drawing helpers

function drawPolygon(poly: Point[]): void {
  ctx.beginPath();
  poly.forEach((p, i) => {
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.stroke();
}

function drawDot(p: Point): void {
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

// Render loop

function render(): void {
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
