// ============================================================
//  physic.js — physic.html
// ============================================================

// ── SIMULATION STATE ──
let running = false, circuitType = "series", srcType = "DC", eColor = "#22D3EE";
let simT = 0, stepN = 1, obsT = 0;
let particles = [];

function vals() {
  const V  = parseFloat(document.getElementById("voltSlider").value);
  const ri = parseFloat(document.getElementById("intResSlider").value);
  const R1 = parseFloat(document.getElementById("r1").value);
  const R2 = parseFloat(document.getElementById("r2").value);
  const R3 = parseFloat(document.getElementById("r3").value);
  let Rt;
  if (circuitType === "series")   Rt = R1 + R2 + R3 + ri;
  else if (circuitType === "parallel") Rt = 1 / (1/R1 + 1/R2 + 1/R3) + ri;
  else Rt = R1 + 1 / (1/R2 + 1/R3) + ri;
  const I = V / Rt, P = V * I;
  return { V, ri, R1, R2, R3, Rt, I, P };
}

function sync() {
  const { V, ri, R1, R2, R3, Rt, I, P } = vals();
  document.getElementById("vDisp").textContent   = V.toFixed(1)   + " V";
  document.getElementById("rIntDisp").textContent = ri.toFixed(1) + " Ω";
  document.getElementById("r1Disp").textContent  = R1.toFixed(1)  + " Ω";
  document.getElementById("r2Disp").textContent  = R2.toFixed(1)  + " Ω";
  document.getElementById("r3Disp").textContent  = R3.toFixed(1)  + " Ω";
  document.getElementById("mv").textContent  = V.toFixed(1);
  document.getElementById("mi").textContent  = I.toFixed(3);
  document.getElementById("mr").textContent  = Rt.toFixed(1);
  document.getElementById("mp").textContent  = P.toFixed(2);
  document.getElementById("mvb").style.width = Math.min(100, (V  / 24) * 100) + "%";
  document.getElementById("mib").style.width = Math.min(100, (I  / 5)  * 100) + "%";
  document.getElementById("mrb").style.width = Math.min(100, (Rt / 60) * 100) + "%";
  document.getElementById("mpb").style.width = Math.min(100, (P  / 50) * 100) + "%";
  document.getElementById("ohnums").textContent =
    `${V.toFixed(1)} = ${I.toFixed(3)} × ${Rt.toFixed(1)}`;
  document.getElementById("modeRt").textContent = Rt.toFixed(1) + " Ω";
  document.getElementById("modeI").textContent  = I.toFixed(3)  + " A";
  document.getElementById("modeP").textContent  = P.toFixed(2)  + " W";
  if (stepN < 2) setStep(2);
}

function setCircuit(t, btn) {
  circuitType = t;
  btn.closest(".tab-row").querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modeCircuit").textContent =
    t.charAt(0).toUpperCase() + t.slice(1);
  sync();
  buildParticles();
}

function setSrc(t, btn) {
  srcType = t;
  btn.closest(".tab-row").querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("srcType").textContent  = t;
  document.getElementById("modeSrc").textContent  = t;
  document.getElementById("oscLabel").textContent = t === "AC" ? "50 Hz" : "DC Signal";
}

function setColor(c, el) {
  eColor = c;
  document.querySelectorAll(".clr-dot").forEach((d) => d.classList.remove("active"));
  el.classList.add("active");
}

function setStep(n) {
  stepN = n;
  for (let i = 1; i <= 5; i++) {
    const row = document.getElementById("s" + i);
    const num = document.getElementById("sn" + i);
    row.className = "step-row" + (i < n ? " done" : i === n ? " active" : "");
    num.textContent = i < n ? "✓" : i;
  }
}

function addObs(txt, type = "") {
  obsT++;
  const log = document.getElementById("obsLog");
  const m = String(Math.floor(obsT / 60)).padStart(2, "0");
  const s = String(obsT % 60).padStart(2, "0");
  const d = document.createElement("div");
  d.className = "obs-item" + (type ? " " + type : "");
  d.innerHTML = `<div class="obs-time">${m}:${s}</div><div class="obs-text">${txt}</div>`;
  log.prepend(d);
  while (log.children.length > 7) log.removeChild(log.lastChild);
}

function toggleRun() {
  running = !running;
  const btnTop = document.getElementById("runBtnTop");
  const badge  = document.getElementById("runBadge");
  btnTop.textContent    = running ? "⏸ Pause" : "▶ Run Simulation";
  badge.style.display   = running ? "flex" : "none";
  if (running) {
    setStep(Math.max(stepN, 3));
    const { V, I, P } = vals();
    addObs(`Simulation started · V=${V.toFixed(1)}V · I=${I.toFixed(3)}A · P=${P.toFixed(2)}W`, "ok");
    if (I > 3) addObs("⚠ High current! Consider increasing resistance.", "warn");
  } else {
    addObs("Simulation paused.");
  }
}

function resetLab() {
  running = false;
  document.getElementById("runBtnTop").textContent = "▶ Run Simulation";
  document.getElementById("runBadge").style.display = "none";
  document.getElementById("voltSlider").value   = 12;
  document.getElementById("intResSlider").value = 0.5;
  document.getElementById("r1").value = 4;
  document.getElementById("r2").value = 8;
  document.getElementById("r3").value = 6;
  sync(); setStep(1); buildParticles();
  addObs("Circuit reset to default values.");
}

function loadChallenge() {
  document.getElementById("voltSlider").value = 9;
  document.getElementById("r1").value = 3;
  document.getElementById("r2").value = 5;
  document.getElementById("r3").value = 7;
  sync(); setStep(1);
  addObs("🏆 Challenge: R1=3Ω · R2=5Ω · R3=7Ω · 9V. Verify Ohm's Law!", "warn");
}

// Run initial sync on page load
sync();

// ── MAIN CANVAS ──
const canvas = document.getElementById("mainCanvas");
const ctx    = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width  = canvas.parentElement.offsetWidth;
  canvas.height = 420;
}
resizeCanvas();
window.addEventListener("resize", () => { resizeCanvas(); buildParticles(); });

function buildParticles() {
  particles = [];
  for (let i = 0; i < 28; i++)
    particles.push({ t: i / 28, speed: 0.003 + Math.random() * 0.002 });
}
buildParticles();

function getPath() {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  if (circuitType === "series") {
    return [
      { x: cx-220, y: cy-90 }, { x: cx-90,  y: cy-90 },
      { x: cx+30,  y: cy-90 }, { x: cx+150, y: cy-90 },
      { x: cx+220, y: cy-90 }, { x: cx+220, y: cy+90 },
      { x: cx+150, y: cy+90 }, { x: cx+30,  y: cy+90 },
      { x: cx-90,  y: cy+90 }, { x: cx-220, y: cy+90 },
      { x: cx-220, y: cy-90 },
    ];
  } else if (circuitType === "parallel") {
    return [
      { x: cx-200, y: cy-60 }, { x: cx-80, y: cy-60 },
      { x: cx-80, y: cy-130 }, { x: cx+80, y: cy-130 },
      { x: cx+80, y: cy-60  }, { x: cx-80, y: cy-60  },
      { x: cx-80, y: cy+10  }, { x: cx+80, y: cy+10  },
      { x: cx+80, y: cy-60  }, { x: cx+200, y: cy-60 },
      { x: cx+200, y: cy+80 }, { x: cx-200, y: cy+80 },
      { x: cx-200, y: cy-60 },
    ];
  } else {
    return [
      { x: cx-200, y: cy-70 }, { x: cx-40, y: cy-70  },
      { x: cx-40, y: cy-130 }, { x: cx+60, y: cy-130 },
      { x: cx+60, y: cy-70  }, { x: cx-40, y: cy-70  },
      { x: cx-40, y: cy-10  }, { x: cx+60, y: cy-10  },
      { x: cx+60, y: cy-70  }, { x: cx+160, y: cy-70 },
      { x: cx+200, y: cy-70 }, { x: cx+200, y: cy+70 },
      { x: cx-200, y: cy+70 }, { x: cx-200, y: cy-70 },
    ];
  }
}

function pathPos(t, path) {
  let segs = [], total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i+1].x - path[i].x, dy = path[i+1].y - path[i].y;
    const len = Math.sqrt(dx*dx + dy*dy);
    segs.push({ x0: path[i].x, y0: path[i].y, dx, dy, len });
    total += len;
  }
  let d = t * total;
  for (const s of segs) {
    if (d <= s.len) { const f = d / s.len; return { x: s.x0 + s.dx*f, y: s.y0 + s.dy*f }; }
    d -= s.len;
  }
  return path[0];
}

let animT = 0;

function drawBattery(ctx, x, y, V) {
  const b = V / 24;
  ctx.save();
  ctx.shadowBlur = 12 + b * 10; ctx.shadowColor = "rgba(251,191,36,0.6)";
  ctx.strokeStyle = `rgba(251,191,36,${0.5 + b * 0.4})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y-18); ctx.lineTo(x, y+18); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x-7, y-12); ctx.lineTo(x-7, y+12); ctx.stroke();
  ctx.restore();
  ctx.font = "10px Space Mono,monospace";
  ctx.fillStyle = "rgba(251,191,36,0.8)"; ctx.textAlign = "center";
  ctx.fillText(V.toFixed(0) + "V", x, y-26);
  ctx.fillText("+", x+6, y-4);
  ctx.fillStyle = "rgba(251,191,36,0.5)"; ctx.fillText("–", x-14, y+4);
  ctx.fillStyle = "rgba(251,191,36,0.07)";
  ctx.beginPath(); ctx.roundRect(x-22, y-28, 44, 56, 4); ctx.fill();
  ctx.textAlign = "left";
}

function drawResistor(ctx, x, y, val, col, lbl, valStr, vert = false) {
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = col;
  ctx.fillStyle = col + "18"; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  if (vert) {
    ctx.beginPath(); ctx.roundRect(x-12, y-24, 24, 48, 3); ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.roundRect(x-26, y-12, 52, 24, 3); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
  ctx.font = "bold 9px Space Mono,monospace"; ctx.fillStyle = col; ctx.textAlign = "center";
  ctx.fillText(lbl, x, y + (vert ? 5 : 4));
  ctx.font = "8px Space Mono,monospace"; ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(valStr, x, y + (vert ? -28 : -16));
  ctx.textAlign = "left";
}

function drawBulb(ctx, x, y, I) {
  const b = Math.min(1, I / 4);
  ctx.save();
  if (running && b > 0.1) {
    ctx.shadowBlur = 25 + b * 30; ctx.shadowColor = `rgba(255,200,60,${b})`;
  }
  ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,200,60,${0.04 + b * 0.45})`; ctx.fill();
  ctx.strokeStyle = `rgba(255,200,60,${0.3 + b * 0.6})`; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  ctx.font = "16px serif"; ctx.textAlign = "center"; ctx.fillText("💡", x, y+6);
  ctx.font = "8px Space Mono,monospace";
  ctx.fillStyle = `rgba(255,200,60,${0.4 + b * 0.5})`; ctx.textAlign = "center";
  ctx.fillText((I * I * 10).toFixed(1) + "W", x, y+32);
  ctx.textAlign = "left";
}

function drawGround(ctx, x, y) {
  [0, 5, 10].forEach((d, i) => {
    ctx.strokeStyle = `rgba(34,211,238,${0.5 - i * 0.13})`;
    ctx.lineWidth = 1.5 - i * 0.3;
    const hw = 14 - i * 4;
    ctx.beginPath(); ctx.moveTo(x-hw, y+i*5); ctx.lineTo(x+hw, y+i*5); ctx.stroke();
  });
}

function drawMeter(ctx, x, y, type, val, col) {
  ctx.fillStyle = "#040A12"; ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x-28, y-18, 56, 36, 3); ctx.fill(); ctx.stroke();
  ctx.font = "bold 9px Space Mono,monospace"; ctx.fillStyle = col; ctx.textAlign = "center";
  ctx.fillText(type, x, y-4);
  ctx.font = "10px Space Mono,monospace"; ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(val, x, y+10); ctx.textAlign = "left";
}

function drawCapacitor(ctx, x, y, V, I) {
  const charge = Math.min(1, (V / 24)); // 0..1
  
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(34,211,238,0.5)";
  
  // Plate kiri
  ctx.strokeStyle = `rgba(34,211,238,${0.4 + charge * 0.5})`;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x-6, y-20); ctx.lineTo(x-6, y+20); ctx.stroke();
  
  // Plate kanan
  ctx.beginPath(); ctx.moveTo(x+6, y-20); ctx.lineTo(x+6, y+20); ctx.stroke();
  
  // Fill indikator muatan
  if (running) {
    const fillH = charge * 36;
    ctx.fillStyle = `rgba(34,211,238,${0.08 + charge * 0.18})`;
    ctx.fillRect(x-5, y+18-fillH, 10, fillH);
  }
  
  // Wire kiri-kanan
  ctx.strokeStyle = "rgba(34,211,238,0.4)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(x-20, y); ctx.lineTo(x-6, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+6, y); ctx.lineTo(x+20, y); ctx.stroke();
  
  ctx.restore();
  
  // Label
  ctx.font = "8px Space Mono,monospace";
  ctx.fillStyle = "rgba(34,211,238,0.6)";
  ctx.textAlign = "center";
  ctx.fillText("CAP", x, y - 26);
  ctx.fillText((charge * 100).toFixed(0) + "%", x, y + 36);
  ctx.textAlign = "left";
}

function drawArrow(ctx, x, y, dir, col) {
  ctx.save(); ctx.fillStyle = col; ctx.translate(x, y);
  if (dir === "right") {
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8,-4); ctx.lineTo(-8,4); ctx.closePath();
  } else {
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(8,-4); ctx.lineTo(8,4); ctx.closePath();
  }
  ctx.fill(); ctx.restore();
}

function drawInfo(ctx, x, y, text) {
  ctx.font = "10px Space Mono,monospace"; ctx.fillStyle = "rgba(34,211,238,0.4)";
  ctx.textAlign = "center"; ctx.fillText(text, x, y); ctx.textAlign = "left";
}

function drawMain() {
  const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(14,165,233,0.04)"; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 44) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 44) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  const path = getPath();
  const { V, R1, R2, R3, Rt, I, P } = vals();

  // Wire glow
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = "rgba(14,165,233,0.3)";
  ctx.strokeStyle = "rgba(14,165,233,0.25)"; ctx.lineWidth = 4;
  ctx.beginPath();
  path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke(); ctx.restore();

  // Wire
  ctx.strokeStyle = "rgba(14,165,233,0.6)"; ctx.lineWidth = 2;
  ctx.beginPath();
  path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  if (circuitType === "series") {
    drawBattery(ctx, cx-220, cy-90, V);
    drawResistor(ctx, cx-90,  cy-90, R1, "#0EA5E9", "R1", R1.toFixed(0) + "Ω");
    drawResistor(ctx, cx+30,  cy-90, R2, "#10B981", "R2", R2.toFixed(0) + "Ω");
    drawResistor(ctx, cx+150, cy-90, R3, "#8B5CF6", "R3", R3.toFixed(0) + "Ω");
    drawBulb(ctx, cx+220, cy, I);
    drawGround(ctx, cx, cy+90);
    drawInfo(ctx, cx, cy+120, `Total: ${Rt.toFixed(1)}Ω  ·  I = ${I.toFixed(3)}A  ·  P = ${P.toFixed(2)}W`);
    drawArrow(ctx, cx-20, cy-90, "right", "rgba(14,165,233,0.4)");
    drawArrow(ctx, cx+100, cy-90, "right", "rgba(14,165,233,0.4)");
    drawArrow(ctx, cx-80, cy+90, "left", "rgba(14,165,233,0.4)");
  } else if (circuitType === "parallel") {
    drawBattery(ctx, cx-200, cy-60, V);
    drawResistor(ctx, cx, cy-130, R1, "#0EA5E9", "R1", R1.toFixed(0) + "Ω", true);
    drawResistor(ctx, cx, cy+10,  R2, "#10B981", "R2", R2.toFixed(0) + "Ω", true);
    drawBulb(ctx, cx+200, cy-60, I);
    drawGround(ctx, cx, cy+80);
    const Rp = (1 / (1/R1 + 1/R2)).toFixed(1);
    drawInfo(ctx, cx, cy+120, `R1‖R2 = ${Rp}Ω  ·  Total ${Rt.toFixed(1)}Ω  ·  I=${I.toFixed(3)}A`);
  } else {
    drawBattery(ctx, cx-200, cy-70, V);
    drawResistor(ctx, cx+10,  cy-130, R1, "#0EA5E9", "R1", R1.toFixed(0) + "Ω", true);
    drawResistor(ctx, cx+10,  cy-10,  R2, "#10B981", "R2", R2.toFixed(0) + "Ω", true);
    drawResistor(ctx, cx+160, cy-70,  R3, "#8B5CF6", "R3", R3.toFixed(0) + "Ω");
    drawBulb(ctx, cx+200, cy+10, I);
    drawGround(ctx, cx, cy+70);
    drawInfo(ctx, cx, cy+105, `Mixed · Total ${Rt.toFixed(1)}Ω · I=${I.toFixed(3)}A · P=${P.toFixed(2)}W`);
  }

  // Voltmeter
  if (document.querySelectorAll(".comp-btn")[1]?.classList.contains("active")) {
    drawMeter(ctx, cx+60, cy-50, "V", V.toFixed(1), "#FBBF24");
  }

  //Ammeter
  if  (document.querySelectorAll(".comp-btn")[2]?.classList.contains("active")) {
    drawMeter(ctx, cx-60, cy+50, "A", I.toFixed(3)+"A", "#0EA5E9");
  }

  //Capacitor
  if (document.querySelectorAll(".comp-btn")[3]?.classList.contains("active")) {
    drawCapacitor(ctx, cx+100, cy+50, V, I);
  }

  // Electrons
  if (running) {
    animT += 0.01;
    const spd = Math.min(0.009, 0.002 + I * 0.002);
    particles.forEach((p) => {
      p.t = (p.t + spd) % 1;
      const pos = pathPos(p.t, path);
      ctx.save();
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = eColor; ctx.shadowBlur = 12; ctx.shadowColor = eColor;
      ctx.fill(); ctx.restore();
    });
    if (stepN < 4) setStep(4);
  }

  // AC overlay
  if (srcType === "AC" && running) {
    ctx.save();
    ctx.strokeStyle = "rgba(251,191,36,0.15)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let x = 0; x < W; x += 2) {
      const y = cy + 90 + Math.sin(x * 0.1 + animT * 4) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }

  requestAnimationFrame(drawMain);
}

drawMain();

// ── OSCILLOSCOPE ──
const osc  = document.getElementById("oscilloCanvas");
const octx = osc.getContext("2d");
let oscT2 = 0;
const oscHist = [];

function drawOscillo() {
  const W = osc.parentElement.offsetWidth - 28;
  osc.width = W; osc.height = 60;
  octx.clearRect(0, 0, W, 60);

  octx.strokeStyle = "rgba(14,165,233,0.06)"; octx.lineWidth = 1;
  [15, 30, 45].forEach((y) => {
    octx.beginPath(); octx.moveTo(0, y); octx.lineTo(W, y); octx.stroke();
  });
  [W/4, W/2, 3*W/4].forEach((x) => {
    octx.beginPath(); octx.moveTo(x, 0); octx.lineTo(x, 60); octx.stroke();
  });

  const { I } = vals();
  if (running) {
    oscT2 += 0.05;
    let v;
    if (srcType === "AC") v = 30 - Math.sin(oscT2) * Math.min(24, I * 7);
    else                   v = 30 - Math.min(22, I * 7);
    oscHist.push(v);
    if (oscHist.length > W) oscHist.shift();
  }

  octx.save();
  octx.shadowBlur = 5; octx.shadowColor = "#22D3EE";
  octx.strokeStyle = "#22D3EE"; octx.lineWidth = 1.5;
  octx.beginPath();
  oscHist.slice(-W).forEach((y, i) => i === 0 ? octx.moveTo(i, y) : octx.lineTo(i, y));
  octx.stroke(); octx.restore();

  octx.strokeStyle = "rgba(255,255,255,0.05)"; octx.lineWidth = 1;
  octx.setLineDash([3, 3]);
  octx.beginPath(); octx.moveTo(0, 30); octx.lineTo(W, 30); octx.stroke();
  octx.setLineDash([]);

  requestAnimationFrame(drawOscillo);
}
drawOscillo();

// ── AUTO OBSERVATION LOG ──
setInterval(() => {
  if (!running) return;
  const { V, I, P, Rt } = vals();
  const msgs = [
    `Electron flow stable · ${I.toFixed(3)}A detected.`,
    `Power dissipation: ${P.toFixed(2)}W across resistors.`,
    circuitType === "series"
      ? `Series circuit: same current ${I.toFixed(3)}A through all components.`
      : `Parallel branches share total current ${I.toFixed(3)}A.`,
    `Ohm's Law verified: ${V.toFixed(1)} ÷ ${Rt.toFixed(1)} = ${I.toFixed(3)}A ✓`,
  ];
  addObs(msgs[Math.floor(Math.random() * msgs.length)]);
  if (stepN >= 3) setStep(5);
}, 7000);

// ── SIDEBAR NAV ACTIVE ──
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    const href = item.getAttribute("href");
    if (!href || href === "#") e.preventDefault();
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
  });
});