// Click-to-enter behavior
const enterLink = document.getElementById("enterLink");

if (enterLink) {
  const goHome = () => {
    window.location.href = "home.html";
  };

  enterLink.addEventListener("click", goHome);

  enterLink.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goHome();
    }
  });
}

// // Optional: add a tiny parallax drift on the welcome page only
// // (kept subtle; safe to delete if you want pure CSS)
// const floatField = document.querySelector(".float-field");
// if (floatField) {
//   let raf = null;

//   window.addEventListener("mousemove", (e) => {
//     const x = (e.clientX / window.innerWidth - 0.5) * 10; // px
//     const y = (e.clientY / window.innerHeight - 0.5) * 10;

//     if (raf) cancelAnimationFrame(raf);
//     raf = requestAnimationFrame(() => {
//       floatField.style.transform = `translate(${x}px, ${y}px)`;
//     });
//   });
// }

// Randomize base rotation for floating linocuts (±10 degrees)
const floats = document.querySelectorAll(".float");

floats.forEach((el) => {
  const rotation = (Math.random() * 20 - 10).toFixed(2); // -10 to +10
  el.style.setProperty("--rot", `${rotation}deg`);
});

// Home hero fade-on-scroll
const heroFade = document.getElementById("heroFade");
const heroBleed = document.getElementById("heroBleed");

if (heroFade && heroBleed) {
  const updateFade = () => {
    const rect = heroBleed.getBoundingClientRect();
    const heroHeight = rect.height;

    // How far we've scrolled through the hero section (0 at top, 1 near bottom)
    const progress = Math.min(Math.max((-rect.top) / (heroHeight * 0.9), 0), 1);

    // Ease it slightly so it feels smoother
    const eased = progress * progress * (3 - 2 * progress); // smoothstep

    heroFade.style.opacity = String(eased);
  };

  updateFade();
  window.addEventListener("scroll", updateFade, { passive: true });
  window.addEventListener("resize", updateFade);
}

// Mouse-shy floats (subtle repulsion) — per element, not a group move
const floatEls = Array.from(document.querySelectorAll(".float"));

if (floatEls.length) {
  const state = new Map();
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tunables
  const radius = 180;      // px: how close the mouse needs to be
  const maxShift = 18;     // px: maximum push away
  const ease = 0.12;       // 0..1: smoothing (higher = snappier)

  floatEls.forEach((el) => {
    state.set(el, { cx: 0, cy: 0, tx: 0, ty: 0 });
    el.style.setProperty("--shx", "0px");
    el.style.setProperty("--shy", "0px");
  });

  let mx = -9999, my = -9999;

  const updateTargets = () => {
    if (prefersReduced) return;

    for (const el of floatEls) {
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;

      const dx = ex - mx;
      const dy = ey - my;
      const d = Math.hypot(dx, dy);

      const s = state.get(el);

      if (d < radius) {
        // falloff: strong near cursor, fades to 0 at radius
        const t = 1 - d / radius;
        const strength = maxShift * (t * t); // quadratic falloff

        const nx = dx / (d || 1);
        const ny = dy / (d || 1);

        s.tx = nx * strength;
        s.ty = ny * strength;
      } else {
        s.tx = 0;
        s.ty = 0;
      }
    }
  };

  const tick = () => {
    if (!prefersReduced) {
      for (const el of floatEls) {
        const s = state.get(el);
        s.cx += (s.tx - s.cx) * ease;
        s.cy += (s.ty - s.cy) * ease;

        el.style.setProperty("--shx", `${s.cx.toFixed(2)}px`);
        el.style.setProperty("--shy", `${s.cy.toFixed(2)}px`);
      }
    }
    requestAnimationFrame(tick);
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      updateTargets();
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    mx = -9999;
    my = -9999;
    updateTargets();
  });

  requestAnimationFrame(tick);
}