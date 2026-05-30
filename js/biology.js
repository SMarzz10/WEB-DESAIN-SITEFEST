// ============================================================
//  biology.js — Holographic Anatomy Simulator
// ============================================================

const ORGAN_DATA = {
  "organ-brain": {
    name: "Brain",
    latin: "Encephalon",
    system: "Nervous",
    weight: "~1.4 kg",
    bloodFlow: "15% cardiac output",
    cells: "~86 billion neurons",
    desc: "The cerebrum, cerebellum, and brainstem integrate sensation, movement, memory, and autonomic control. Visible gyri suggest the folded cortical surface.",
    functions: ["Conscious thought", "Motor coordination", "Hormone regulation", "Memory"],
    related: ["Spinal cord", "Hypothalamus", "Pituitary gland"],
    vitals: { hr: [58, 72], temp: [36.8, 37.2], o2: [96, 99], rr: [12, 16] },
  },
  "organ-lungs-l": {
    name: "Left Lung",
    latin: "Pulmo sinister",
    system: "Respiratory",
    weight: "~400 g",
    bloodFlow: "Pulmonary circulation",
    cells: "2 lobes · cardiac notch",
    desc: "The left lung is smaller and bears a cardiac notch where the heart sits. Branching bronchi and lobe contours reflect realistic respiratory anatomy.",
    functions: ["Gas exchange", "Acid-base balance", "Filtration", "Voice resonance"],
    related: ["Trachea", "Heart", "Diaphragm"],
    vitals: { hr: [70, 85], temp: [36.5, 37.0], o2: [94, 98], rr: [14, 20] },
  },
  "organ-lungs-r": {
    name: "Right Lung",
    latin: "Pulmo dexter",
    system: "Respiratory",
    weight: "~450 g",
    bloodFlow: "Pulmonary circulation",
    cells: "3 lobes · shorter bronchus",
    desc: "The right lung has three lobes and receives the right main bronchus. Alveolar networks enable efficient oxygen and carbon dioxide exchange.",
    functions: ["Oxygenation", "CO₂ elimination", "Surfactant", "Immune defense"],
    related: ["Trachea", "Left lung", "Heart"],
    vitals: { hr: [70, 85], temp: [36.5, 37.0], o2: [94, 98], rr: [14, 20] },
  },
  "organ-trachea": {
    name: "Trachea",
    latin: "Trachea",
    system: "Respiratory",
    weight: "~35 g",
    bloodFlow: "Bronchial arteries",
    cells: "C-ring cartilage · ciliated epithelium",
    desc: "The windpipe runs from the larynx to the bronchi. Cartilage rings (shown as horizontal bands) keep the airway open during breathing.",
    functions: ["Air conduction", "Mucociliary clearance", "Cough reflex"],
    related: ["Larynx", "Bronchi", "Lungs"],
    vitals: { hr: [72, 88], temp: [36.4, 36.9], o2: [95, 99], rr: [16, 22] },
  },
  "organ-heart": {
    name: "Heart",
    latin: "Cor",
    system: "Circulatory",
    weight: "~300 g",
    bloodFlow: "Coronary arteries",
    cells: "~2 billion cardiomyocytes",
    desc: "A four-chambered muscular pump angled with the apex toward the left. Great vessels connect at the base; chambers coordinate systole and diastole.",
    functions: ["Systemic pump", "Pulmonary circulation", "Coronary flow", "Endocrine (ANP)"],
    related: ["Aorta", "Pulmonary arteries", "Lungs"],
    vitals: { hr: [60, 100], temp: [36.6, 37.1], o2: [97, 100], rr: [12, 18] },
    pulse: true,
  },
  "organ-liver": {
    name: "Liver",
    latin: "Hepar",
    system: "Digestive · Metabolic",
    weight: "~1.5 kg",
    bloodFlow: "~1.4 L/min",
    cells: "~240 billion hepatocytes",
    desc: "The largest internal organ sits predominantly on the right upper abdomen. Its wedge shape and lobes support bile production and metabolism.",
    functions: ["Bile synthesis", "Detoxification", "Glycogen storage", "Clotting factors"],
    related: ["Gallbladder", "Portal vein", "Stomach"],
    vitals: { hr: [68, 80], temp: [36.7, 37.3], o2: [96, 99], rr: [12, 16] },
  },
  "organ-gallbladder": {
    name: "Gallbladder",
    latin: "Vesica biliaris",
    system: "Digestive",
    weight: "~50 g",
    bloodFlow: "Cystic artery",
    cells: "Simple columnar epithelium",
    desc: "A pear-shaped reservoir beneath the liver that stores and concentrates bile for fat digestion.",
    functions: ["Bile storage", "Concentration", "Fat emulsification"],
    related: ["Liver", "Duodenum", "Bile duct"],
    vitals: { hr: [70, 82], temp: [36.5, 37.0], o2: [97, 99], rr: [12, 16] },
  },
  "organ-stomach": {
    name: "Stomach",
    latin: "Gaster",
    system: "Digestive",
    weight: "~150 g",
    bloodFlow: "Celiac trunk",
    cells: "Parietal · Chief · G cells",
    desc: "A curved J-shaped organ on the left that churns food with acid and enzymes, forming chyme for the small intestine.",
    functions: ["Protein digestion", "Acid sterilization", "Intrinsic factor", "Chyme formation"],
    related: ["Esophagus", "Duodenum", "Pancreas"],
    vitals: { hr: [72, 86], temp: [36.8, 37.4], o2: [96, 98], rr: [14, 18] },
  },
  "organ-pancreas": {
    name: "Pancreas",
    latin: "Pancreas",
    system: "Digestive · Endocrine",
    weight: "~80 g",
    bloodFlow: "Splenic artery",
    cells: "Islets of Langerhans",
    desc: "An elongated gland behind the stomach with exocrine ducts and endocrine islets regulating blood glucose.",
    functions: ["Insulin release", "Digestive enzymes", "Bicarbonate", "Glucagon"],
    related: ["Duodenum", "Liver", "Spleen"],
    vitals: { hr: [70, 84], temp: [36.6, 37.1], o2: [97, 99], rr: [12, 16] },
  },
  "organ-spleen": {
    name: "Spleen",
    latin: "Splen",
    system: "Lymphatic · Immune",
    weight: "~150 g",
    bloodFlow: "Splenic artery",
    cells: "Lymphocytes · Macrophages",
    desc: "A fist-sized lymphoid organ on the left upper abdomen that filters blood and supports immune responses.",
    functions: ["Blood filtration", "Platelet store", "Antibody production", "Recycling RBCs"],
    related: ["Pancreas", "Stomach", "Portal circulation"],
    vitals: { hr: [74, 88], temp: [36.7, 37.2], o2: [96, 98], rr: [13, 17] },
  },
  "organ-small-intestine": {
    name: "Small Intestine",
    latin: "Intestinum tenue",
    system: "Digestive",
    weight: "~1.8 kg",
    bloodFlow: "Superior mesenteric artery",
    cells: "Villi · ~200 m² surface",
    desc: "Coiled loops (~6 m) where most nutrient absorption occurs via villi and microvilli.",
    functions: ["Nutrient absorption", "Enzyme completion", "Immune surveillance", "Water uptake"],
    related: ["Stomach", "Large intestine", "Pancreas"],
    vitals: { hr: [72, 84], temp: [36.9, 37.5], o2: [95, 98], rr: [14, 18] },
  },
  "organ-large-intestine": {
    name: "Large Intestine",
    latin: "Intestinum crassum",
    system: "Digestive",
    weight: "~0.7 kg",
    bloodFlow: "Mesenteric arteries",
    cells: "Gut microbiome",
    desc: "The colon frames the small intestine, reabsorbing water and housing beneficial bacteria.",
    functions: ["Water absorption", "Electrolyte balance", "Microbiome", "Defecation"],
    related: ["Small intestine", "Rectum", "Appendix"],
    vitals: { hr: [70, 82], temp: [36.8, 37.3], o2: [96, 98], rr: [12, 16] },
  },
  "organ-kidney-l": {
    name: "Left Kidney",
    latin: "Ren sinister",
    system: "Urinary",
    weight: "~150 g",
    bloodFlow: "~1.2 L/min (both)",
    cells: "~1M nephrons",
    desc: "Bean-shaped organ slightly higher than the right. Nephrons filter blood and regulate fluid and electrolytes.",
    functions: ["Filtration", "Urine formation", "BP regulation", "Erythropoietin"],
    related: ["Adrenal gland", "Ureter", "Bladder"],
    vitals: { hr: [68, 78], temp: [36.5, 37.0], o2: [97, 99], rr: [12, 15] },
  },
  "organ-kidney-r": {
    name: "Right Kidney",
    latin: "Ren dexter",
    system: "Urinary",
    weight: "~145 g",
    bloodFlow: "~1.2 L/min (both)",
    cells: "~1M nephrons",
    desc: "Sits slightly lower due to the liver. Excretes nitrogenous waste and helps maintain acid-base balance.",
    functions: ["Waste excretion", "Acid-base balance", "Vitamin D activation", "Water homeostasis"],
    related: ["Ureter", "Left kidney", "Bladder"],
    vitals: { hr: [68, 78], temp: [36.5, 37.0], o2: [97, 99], rr: [12, 15] },
  },
  "organ-bladder": {
    name: "Urinary Bladder",
    latin: "Vesica urinaria",
    system: "Urinary",
    weight: "~50 g (empty)",
    bloodFlow: "Internal iliac",
    cells: "Transitional epithelium",
    desc: "A hollow muscular sac in the pelvis that stores urine until micturition.",
    functions: ["Urine storage", "Micturition reflex", "Anti-reflux"],
    related: ["Ureters", "Urethra", "Kidneys"],
    vitals: { hr: [70, 80], temp: [36.5, 36.9], o2: [97, 99], rr: [12, 14] },
  },
  "organ-thyroid": {
    name: "Thyroid Gland",
    latin: "Glandula thyreoidea",
    system: "Endocrine",
    weight: "~20 g",
    bloodFlow: "Superior thyroid arteries",
    cells: "Follicular · Parafollicular cells",
    desc: "A butterfly-shaped endocrine gland in the neck that produces T3 and T4, regulating metabolism, growth, and body temperature.",
    functions: ["Metabolic rate", "Calcium balance", "Growth regulation", "Heat production"],
    related: ["Trachea", "Parathyroid", "Hypothalamus"],
    vitals: { hr: [72, 90], temp: [36.6, 37.4], o2: [96, 99], rr: [14, 18] },
  },
  "organ-thymus": {
    name: "Thymus",
    latin: "Thymus",
    system: "Lymphatic · Immune",
    weight: "~30 g (child)",
    bloodFlow: "Internal thoracic",
    cells: "T-lymphocyte maturation",
    desc: "A lymphoid organ behind the sternum where T-cells mature. Largest in childhood and gradually involutes with age.",
    functions: ["T-cell development", "Immune tolerance", "Adaptive immunity"],
    related: ["Heart", "Lungs", "Lymph nodes"],
    vitals: { hr: [70, 85], temp: [36.5, 37.1], o2: [96, 99], rr: [13, 17] },
  },
  "organ-reproductive": {
    name: "Reproductive System",
    latin: "Systema genitale",
    system: "Reproductive",
    weight: "Varies",
    bloodFlow: "Internal iliac branches",
    cells: "Gamete-producing tissues",
    desc: "The male reproductive organs produce sperm and secrete hormones. In females, analogous structures support oogenesis and pregnancy.",
    functions: ["Gamete production", "Hormone secretion", "Fertilization", "Secondary sex traits"],
    related: ["Bladder", "Urethra", "Pelvic floor"],
    vitals: { hr: [68, 82], temp: [36.5, 37.0], o2: [97, 99], rr: [12, 16] },
  },
};

/** Educational call-out layout (matches poster diagram) */
const CALLOUT_ICONS = {
  thyroid: `<path fill="#fbbf24" stroke="#d97706" stroke-width="1" d="M18,38 Q50,22 82,38 Q76,52 50,58 Q24,52 18,38Z"/><path fill="none" stroke="#fcd34d" stroke-width="0.8" d="M28,40 Q50,32 72,40"/>`,
  lungs: `<path fill="#c2410c" stroke="#7f1d1d" stroke-width="1" d="M12,20 C8,45 15,68 28,72 L32,20 C22,18 12,20Z M88,20 C92,45 85,68 72,72 L68,20 C78,18 88,20Z"/><path fill="none" stroke="#fca5a5" stroke-width="0.8" d="M50,25 L50,70 M35,35 Q50,28 65,35 M32,50 Q50,42 68,50"/>`,
  liver: `<path fill="#991b1b" stroke="#7f1d1d" stroke-width="1" d="M8,45 L75,38 C88,38 92,52 85,65 C70,72 25,70 8,58Z"/><path fill="#b91c1c" opacity="0.6" d="M55,42 L80,48 L75,58Z"/>`,
  stomach: `<path fill="#f9a8d4" stroke="#db2777" stroke-width="1" d="M55,15 C80,12 92,35 85,58 C75,72 45,75 35,55 C28,35 38,18 55,15Z"/><path fill="none" stroke="#fbcfe8" d="M50,28 Q65,42 58,55"/>`,
  pancreas: `<path fill="#fde047" stroke="#ca8a04" stroke-width="1" d="M5,42 L90,38 L92,48 L8,52Z"/><path fill="#fbbf24" d="M70,40 L88,38 L90,44 L72,46Z"/>`,
  thymus: `<path fill="#fde047" stroke="#ca8a04" stroke-width="1" d="M25,25 Q50,15 75,25 L72,45 Q50,55 28,45Z"/><path fill="#fbbf24" opacity="0.7" d="M32,30 Q50,22 68,30 L66,42 Q50,48 34,42Z"/>`,
  kidneys: `<path fill="#991b1b" stroke="#7f1d1d" stroke-width="1" d="M18,22 C10,35 12,55 22,62 C30,58 32,38 26,28 C22,22 18,22Z M82,22 C90,35 88,55 78,62 C70,58 68,38 74,28 C78,22 82,22Z"/><path fill="none" stroke="#fca5a5" d="M24,35 Q20,48 26,55 M76,35 Q80,48 74,55"/>`,
  intestines: `<path fill="#9f1239" stroke="#7f1d1d" stroke-width="1" d="M10,20 L85,18 C92,18 95,28 90,40 L12,42 C8,42 6,32 10,20Z"/><path fill="none" stroke="#fda4af" stroke-width="1.2" d="M25,28 Q40,22 55,30 Q70,38 55,48 Q40,55 30,45 Q22,35 25,28 M45,32 Q55,35 50,42"/>`,
  reproductive: `<path fill="#ef4444" stroke="#b91c1c" stroke-width="1" d="M42,15 L58,15 L62,45 L38,45Z"/><circle fill="#fde047" cx="50" cy="52" r="12" stroke="#ca8a04"/><path fill="none" stroke="#f87171" d="M50,64 L50,75"/>`,
  bladder: `<circle fill="#fde047" stroke="#ca8a04" stroke-width="1" cx="50" cy="42" r="28"/><circle fill="none" stroke="#fbbf24" stroke-width="0.8" cx="50" cy="42" r="18"/><circle fill="none" stroke="#fbbf24" stroke-width="0.6" cx="50" cy="42" r="10"/>`,
};

const CALLOUTS = {
  left: [
    { label: "THYROID", icon: "thyroid", targets: ["organ-thyroid"], infoId: "organ-thyroid" },
    { label: "LUNGS", icon: "lungs", targets: ["organ-lungs-l", "organ-lungs-r"], infoId: "organ-lungs-l" },
    { label: "LIVER", icon: "liver", targets: ["organ-liver"], infoId: "organ-liver" },
    { label: "STOMACH", icon: "stomach", targets: ["organ-stomach"], infoId: "organ-stomach" },
    { label: "PANCREAS", icon: "pancreas", targets: ["organ-pancreas"], infoId: "organ-pancreas" },
  ],
  right: [
    { label: "THYMUS", icon: "thymus", targets: ["organ-thymus"], infoId: "organ-thymus" },
    { label: "KIDNEYS", icon: "kidneys", targets: ["organ-kidney-l", "organ-kidney-r"], infoId: "organ-kidney-l" },
    { label: "INTESTINES", icon: "intestines", targets: ["organ-small-intestine", "organ-large-intestine"], infoId: "organ-small-intestine" },
    { label: "REPRODUCTIVE SYSTEM", icon: "reproductive", targets: ["organ-reproductive"], infoId: "organ-reproductive" },
    { label: "BLADDER", icon: "bladder", targets: ["organ-bladder"], infoId: "organ-bladder" },
  ],
};

const SYSTEM_LABELS = {
  skeletal: "SKELETAL SCAN",
  organs: "ORGAN VIEW",
  muscular: "MUSCULAR OVERLAY",
  nervous: "NERVOUS SYSTEM",
  circulatory: "CIRCULATORY MAP",
};

let activeOrganId = null;
let activeTargets = [];

document.addEventListener("DOMContentLoaded", () => {
  const organGroups = document.querySelectorAll(".organ-group");
  const organs = document.querySelectorAll(".organ.clickable");
  const obsLog = document.getElementById("obsLog");
  const organInfo = document.getElementById("organInfo");
  const bodyContainer = document.getElementById("bodyContainer");
  const opacitySlider = document.getElementById("opacitySlider");
  const rotateSlider = document.getElementById("rotateSlider");
  const zoomSlider = document.getElementById("zoomSlider");
  const resetBtn = document.getElementById("resetBtn");
  const tooltip = document.getElementById("organTooltip");
  const holoMode = document.getElementById("holoMode");
  const holoOrgan = document.getElementById("holoOrgan");
  const anatomyLayout = document.getElementById("anatomyLayout");

  const hasGsap = typeof gsap !== "undefined";

  buildCallouts();
  bindSystemTabs();
  bindLayerToggles();
  bindSliders();
  window.addEventListener("resize", () => requestAnimationFrame(drawConnectors));

  organGroups.forEach((group) => {
    const organ = group.querySelector(".organ.clickable");
    if (!organ) return;
    const organId = organ.id;

    group.addEventListener("mouseenter", (e) => {
      highlightHover(group, organId, true);
      const data = ORGAN_DATA[organId];
      if (!data) return;
      const sys = data.system.split("·")[0].trim();
      tooltip.innerHTML =
        `<span class="organ-tooltip-tag">[${sys}]</span> ${data.name}` +
        `<span class="organ-tooltip-latin">${data.latin}</span>`;
      tooltip.classList.add("visible");
      updateTooltipPos(e);
    });

    group.addEventListener("mousemove", (e) => updateTooltipPos(e));

    group.addEventListener("mouseleave", () => {
      if (activeOrganId !== organId) highlightHover(group, organId, false);
      tooltip.classList.remove("visible");
    });

    group.addEventListener("click", () => selectOrgan(organId, [organId]));
  });

  function highlightHover(group, organId, on) {
    group.classList.toggle("is-hovered", on);
    if (on && activeTargets.length && !activeTargets.includes(organId)) {
      organGroups.forEach((g) => {
        if (g !== group && !activeTargets.some((id) => g.querySelector(`#${id}`))) g.classList.add("dimmed");
      });
    } else if (!on && !activeOrganId) {
      organGroups.forEach((g) => g.classList.remove("dimmed"));
    }
  }

  function selectOrgan(organId, targets = [organId]) {
    activeOrganId = organId;
    activeTargets = targets;

    organs.forEach((o) => o.classList.remove("selected"));
    organGroups.forEach((g) => {
      g.classList.remove("is-selected", "is-hovered", "dimmed");
      if (targets.some((id) => g.querySelector(`#${id}`))) g.classList.add("is-selected");
      else g.classList.add("dimmed");
    });

    targets.forEach((id) => document.getElementById(id)?.classList.add("selected"));

    document.querySelectorAll(".organ-callout").forEach((c) => {
      const ct = c.dataset.targets.split(",");
      const match = ct.length === targets.length && ct.every((id) => targets.includes(id));
      c.classList.toggle("active", match);
    });

    const el = document.getElementById(targets[0]);
    const data = ORGAN_DATA[organId];
    if (!data) return;

    if (hasGsap && el) {
      gsap.fromTo(el, { scale: 1 }, { scale: 1.04, duration: 0.2, yoyo: true, repeat: 1, transformOrigin: "center center", transformBox: "fill-box" });
    }

    renderOrganInfo(data);
    applyOrganVitals(data);
    toggleHeartPulse(!!data.pulse || targets.includes("organ-heart"));
    holoOrgan.textContent = data.name.toUpperCase();
    addLog(`Scan: ${data.name} (${data.latin}) — ${data.system}`);
    drawConnectors();
  }

  function buildCallouts() {
    const left = document.getElementById("calloutsLeft");
    const right = document.getElementById("calloutsRight");
    if (!left || !right) return;

    const render = (item, side) => `
      <button type="button" class="organ-callout" data-side="${side}"
        data-targets="${item.targets.join(",")}" data-info-id="${item.infoId}">
        <div class="callout-icon-wrap">
          <svg viewBox="0 0 100 80" class="callout-svg" aria-hidden="true">${CALLOUT_ICONS[item.icon]}</svg>
        </div>
        <span class="callout-label">${item.label}</span>
      </button>`;

    left.innerHTML = CALLOUTS.left.map((i) => render(i, "left")).join("");
    right.innerHTML = CALLOUTS.right.map((i) => render(i, "right")).join("");

    document.querySelectorAll(".organ-callout").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targets = btn.dataset.targets.split(",");
        selectOrgan(btn.dataset.infoId, targets);
      });
    });

    requestAnimationFrame(drawConnectors);
  }

  function drawConnectors() {
    const svg = document.getElementById("connectorSvg");
    const layout = anatomyLayout;
    if (!svg || !layout) return;

    const layoutRect = layout.getBoundingClientRect();
    if (layoutRect.width < 10) return;

    svg.setAttribute("viewBox", `0 0 ${layoutRect.width} ${layoutRect.height}`);
    svg.innerHTML = "";

    document.querySelectorAll(".organ-callout").forEach((callout) => {
      const targets = callout.dataset.targets.split(",");
      const organEl = document.getElementById(targets[0]);
      const iconWrap = callout.querySelector(".callout-icon-wrap");
      if (!organEl || !iconWrap) return;

      const isLeft = callout.dataset.side === "left";
      const cRect = iconWrap.getBoundingClientRect();
      const oRect = organEl.getBoundingClientRect();

      const x1 = isLeft ? cRect.right - layoutRect.left : cRect.left - layoutRect.left;
      const y1 = cRect.top + cRect.height / 2 - layoutRect.top;
      const x2 = oRect.left + oRect.width / 2 - layoutRect.left;
      const y2 = oRect.top + oRect.height / 2 - layoutRect.top;
      const midX = isLeft ? x1 + (x2 - x1) * 0.55 : x1 - (x1 - x2) * 0.55;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${x1} ${y1} L ${midX} ${y1} L ${x2} ${y2}`);
      path.setAttribute("class", "connector-line");
      if (callout.classList.contains("active")) path.classList.add("active");
      svg.appendChild(path);
    });
  }

  function renderOrganInfo(data) {
    const funcTags = data.functions.map((f) => `<span class="bio-tag">${f}</span>`).join("");
    const relatedTags = data.related.map((r) => `<span class="bio-tag bio-tag-dim">${r}</span>`).join("");

    organInfo.innerHTML = `
      <div class="organ-info-inner">
        <div class="organ-title">${data.name}</div>
        <div class="organ-latin">${data.latin}</div>
        <div class="organ-system-badge">System · ${data.system}</div>
        <div class="organ-desc">${data.desc}</div>
        <div class="bio-metrics">
          <div class="bio-metric"><span class="bio-metric-lbl">Mass</span><span class="bio-metric-val">${data.weight}</span></div>
          <div class="bio-metric"><span class="bio-metric-lbl">Blood flow</span><span class="bio-metric-val">${data.bloodFlow}</span></div>
          <div class="bio-metric"><span class="bio-metric-lbl">Histology</span><span class="bio-metric-val">${data.cells}</span></div>
        </div>
        <div class="bio-section-lbl">Primary functions</div>
        <div class="bio-tags">${funcTags}</div>
        <div class="bio-section-lbl">Connected structures</div>
        <div class="bio-tags">${relatedTags}</div>
      </div>
    `;

    if (hasGsap) {
      gsap.from(".organ-info-inner > *", { opacity: 0, y: 8, duration: 0.35, stagger: 0.05, ease: "power2.out" });
    }
  }

  function bindSystemTabs() {
    document.querySelectorAll(".tab-btn[data-system]").forEach((btn) => {
      btn.addEventListener("click", () => setSystem(btn.dataset.system, btn));
    });
  }

  function bindLayerToggles() {
    document.querySelectorAll(".layer-check input[data-layer]").forEach((input) => {
      input.addEventListener("change", () => toggleLayer(input.dataset.layer, input.checked));
    });
  }

  function bindSliders() {
    opacitySlider?.addEventListener("input", updateOpacity);
    rotateSlider?.addEventListener("input", updateTransform);
    zoomSlider?.addEventListener("input", updateTransform);
  }

  function updateTooltipPos(e) {
    tooltip.style.left = `${e.clientX + 14}px`;
    tooltip.style.top = `${e.clientY + 14}px`;
  }

  function updateOpacity() {
    const skinLayer = document.getElementById("layer-skin");
    const val = opacitySlider.value / 100;
    if (skinLayer) skinLayer.style.opacity = val;
  }

  function updateTransform() {
    const rot = rotateSlider?.value || 0;
    const scale = (zoomSlider?.value || 100) / 100;
    if (hasGsap) {
      gsap.to(bodyContainer, { rotateY: rot, scale, duration: 0.4, ease: "power2.out" });
    } else {
      bodyContainer.style.transform = `rotateY(${rot}deg) scale(${scale})`;
    }
    requestAnimationFrame(drawConnectors);
  }

  window.toggleLayer = (layer, checked) => {
    if (layer === "labels") {
      document.querySelectorAll(".organ-label, .label-line").forEach((el) => {
        el.classList.toggle("layer-hidden", !checked);
      });
      document.querySelectorAll(".callout-label").forEach((el) => {
        el.style.opacity = checked ? "" : "0";
      });
      const conn = document.getElementById("connectorSvg");
      if (conn) conn.style.opacity = checked ? "" : "0";
    } else if (layer === "organs") {
      document.getElementById("system-organs")?.classList.toggle("layer-hidden", !checked);
    } else if (layer === "vessels") {
      document.getElementById("layer-vessels")?.classList.toggle("layer-hidden", !checked);
    } else if (layer === "outline") {
      document.getElementById("layer-skin")?.classList.toggle("layer-hidden", !checked);
    }
    addLog(`Layer «${layer}»: ${checked ? "on" : "off"}`);
  };

  window.setSystem = (system, btn) => {
    document.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
    btn?.classList.add("active");

    const layers = {
      skeletal: document.getElementById("system-skeletal"),
      organs: document.getElementById("system-organs"),
      nervous: document.getElementById("system-nervous"),
      circulatory: document.getElementById("system-circulatory"),
      muscular: document.getElementById("system-muscular"),
    };
    const vesselLayer = document.getElementById("layer-vessels");
    const simView = document.querySelector(".sim-view");

    simView?.classList.remove("mode-circulatory", "mode-nervous", "mode-skeletal");

    Object.values(layers).forEach((g) => {
      if (g) {
        g.classList.add("hidden");
        g.classList.remove("dimmed");
      }
    });
    stopCirculatoryAnim();
    if (holoMode) holoMode.textContent = SYSTEM_LABELS[system] || system.toUpperCase();

    if (system === "skeletal") {
      layers.skeletal?.classList.remove("hidden");
      simView?.classList.add("mode-skeletal");
    } else if (system === "organs") {
      layers.organs?.classList.remove("hidden");
      organGroups.forEach((g) => g.classList.remove("dimmed"));
    } else if (system === "muscular") {
      layers.muscular?.classList.remove("hidden");
      layers.organs?.classList.remove("hidden");
      layers.organs?.classList.add("dimmed");
    } else if (system === "circulatory") {
      layers.circulatory?.classList.remove("hidden");
      layers.organs?.classList.remove("hidden");
      layers.organs?.classList.add("dimmed");
      vesselLayer?.classList.remove("layer-hidden");
      startCirculatoryAnim();
      simView?.classList.add("mode-circulatory");
    } else if (system === "nervous") {
      layers.nervous?.classList.remove("hidden");
      layers.organs?.classList.remove("hidden");
      layers.organs?.classList.add("dimmed");
      simView?.classList.add("mode-nervous");
    }

    addLog(`Imaging: ${SYSTEM_LABELS[system] || system}`);
    requestAnimationFrame(drawConnectors);
  };

  function startCirculatoryAnim() {
    document.querySelectorAll(".blood-flow").forEach((p) => p.classList.add("flow-active"));
  }

  function stopCirculatoryAnim() {
    document.querySelectorAll(".blood-flow").forEach((p) => p.classList.remove("flow-active"));
  }

  function toggleHeartPulse(on) {
    document.getElementById("organ-heart")?.classList.toggle("heart-pulse", on);
  }

  resetBtn?.addEventListener("click", () => {
    opacitySlider.value = 70;
    rotateSlider.value = 0;
    zoomSlider.value = 100;
    updateOpacity();
    updateTransform();
    activeOrganId = null;
    organs.forEach((o) => o.classList.remove("selected"));
    organGroups.forEach((g) => g.classList.remove("is-selected", "is-hovered", "dimmed"));
    activeTargets = [];
    document.querySelectorAll(".organ-callout").forEach((el) => el.classList.remove("active"));
    toggleHeartPulse(false);
    holoOrgan.textContent = "Select an organ";
    organInfo.innerHTML =
      `<div class="info-placeholder">Click an organ on the diagram or use the labeled call-outs to explore structure, function, and connected systems.</div>`;
    drawConnectors();
    const organTab = document.querySelector('.tab-btn[data-system="organs"]');
    if (organTab) setSystem("organs", organTab);
    addLog("View reset — baseline holographic anatomy restored.");
  });

  function pickVital(range) {
    const [min, max] = range;
    if (Number.isInteger(min)) return Math.floor(min + Math.random() * (max - min + 1));
    return (min + Math.random() * (max - min)).toFixed(1);
  }

  function applyOrganVitals(data) {
    if (!data.vitals) return;
    setVal("hrVal", pickVital(data.vitals.hr));
    setVal("tempVal", pickVital(data.vitals.temp));
    setVal("o2Val", pickVital(data.vitals.o2));
    setVal("rrVal", pickVital(data.vitals.rr));
    setVal("bpVal", `${110 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 10)}`);
    updateBars();
  }

  function setVal(id, v) {
    const el = document.getElementById(id);
    if (!el) return;
    if (hasGsap) {
      gsap.fromTo(el, { opacity: 0.4 }, { opacity: 1, duration: 0.3 });
    }
    el.textContent = v;
  }

  function updateBars() {
    const hr = parseFloat(document.getElementById("hrVal")?.textContent) || 72;
    const temp = parseFloat(document.getElementById("tempVal")?.textContent) || 36.6;
    const o2 = parseFloat(document.getElementById("o2Val")?.textContent) || 98;
    const rr = parseFloat(document.getElementById("rrVal")?.textContent) || 14;
    animateBar("hrBar", Math.min(100, (hr / 120) * 100));
    animateBar("tempBar", Math.min(100, (temp / 40) * 100));
    animateBar("o2Bar", o2);
    animateBar("rrBar", Math.min(100, (rr / 30) * 100));
  }

  function animateBar(id, width) {
    const bar = document.getElementById(id);
    if (!bar) return;
    if (hasGsap) gsap.to(bar, { width: `${width}%`, duration: 0.5, ease: "power2.out" });
    else bar.style.width = `${width}%`;
  }

  function updateVitals() {
    if (activeOrganId && ORGAN_DATA[activeOrganId]) {
      applyOrganVitals(ORGAN_DATA[activeOrganId]);
      return;
    }
    setVal("hrVal", 68 + Math.floor(Math.random() * 8));
    setVal("tempVal", (36.4 + Math.random() * 0.4).toFixed(1));
    setVal("o2Val", 96 + Math.floor(Math.random() * 3));
    setVal("rrVal", 13 + Math.floor(Math.random() * 4));
    setVal("bpVal", `${115 + Math.floor(Math.random() * 10)}/${72 + Math.floor(Math.random() * 8)}`);
    updateBars();
  }

  setInterval(updateVitals, 3500);

  function addLog(text) {
    const time = new Date();
    const m = String(time.getMinutes()).padStart(2, "0");
    const s = String(time.getSeconds()).padStart(2, "0");
    const item = document.createElement("div");
    item.className = "obs-item";
    item.innerHTML = `<div class="obs-time">${m}:${s}</div><div class="obs-text">${text}</div>`;
    obsLog?.prepend(item);
    if (obsLog && obsLog.children.length > 12) obsLog.removeChild(obsLog.lastChild);
    if (hasGsap) gsap.from(item, { opacity: 0, x: -8, duration: 0.3 });
  }

  updateOpacity();
  addLog("Educational anatomy map loaded — poster layout active.");
  addLog("Click call-outs or organs on the body to explore.");
});
