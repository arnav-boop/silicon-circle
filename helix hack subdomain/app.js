// HelixHack 2026 Core Application Scripts & Mock Database Handler

// Register ScrollTrigger if gsap is loaded
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Helper: Liquid Cursor Aura & Ribbon Trail
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let globalMouseX = mouseX;
let globalMouseY = mouseY;
let currentX = mouseX;
let currentY = mouseY;

document.addEventListener('mousemove', (e) => {
  globalMouseX = e.clientX;
  globalMouseY = e.clientY;

  // Contain aura coordinates relative to .hero section boundaries
  const hero = document.querySelector('.hero');
  if (hero) {
    const rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  } else {
    mouseX = -1000;
    mouseY = -1000;
  }
});

function animateCursorAura() {
  currentX += (mouseX - currentX) * 0.07;
  currentY += (mouseY - currentY) * 0.07;

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.setProperty('--mx', currentX + 'px');
    hero.style.setProperty('--my', currentY + 'px');
  }
  requestAnimationFrame(animateCursorAura);
}
animateCursorAura();

// --- CSS Grid Trail Effect (Silicon Wafer) ---
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('trail-wrapper');
  if (!wrapper) return;

  const itemSize = 25; // Size of individual chips

  function createGrid() {
    wrapper.innerHTML = '';
    
    // Determine disc size and how many discs fit the screen
    const discSize = 250; 
    const gap = 10;
    
    const cols = Math.ceil(window.innerWidth / (discSize + gap)) + 1;
    const rows = Math.ceil(window.innerHeight / (discSize + gap)) + 1;
    const totalDiscs = cols * rows;

    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = `repeat(${cols}, ${discSize}px)`;
    wrapper.style.gridTemplateRows = `repeat(${rows}, ${discSize}px)`;
    wrapper.style.gap = `${gap}px`;
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignContent = 'center';

    const R = discSize / 2;
    const cx = R;
    const cy = R;

    for (let d = 0; d < totalDiscs; d++) {
      const disc = document.createElement('div');
      disc.className = 'trail-grid';
      disc.style.width = `${discSize}px`;
      disc.style.height = `${discSize}px`;

      const chipCols = Math.ceil(discSize / itemSize);
      const chipRows = Math.ceil(discSize / itemSize);
      const itemWidth = discSize / chipCols;
      const itemHeight = discSize / chipRows;

      for (let r = 0; r < chipRows; r++) {
        for (let c = 0; c < chipCols; c++) {
          const x1 = c * itemWidth;
          const x2 = (c + 1) * itemWidth;
          const y1 = r * itemHeight;
          const y2 = (r + 1) * itemHeight;

          // Check if all 4 corners of the chip are inside the circular disc
          const corners = [
            [x1, y1],
            [x2, y1],
            [x1, y2],
            [x2, y2]
          ];
          const fullyInside = corners.every(([x, y]) => {
            const dx = x - cx;
            const dy = y - cy;
            return (dx * dx + dy * dy) <= (R * R);
          });

          const item = document.createElement('div');
          item.style.width = `${100 / chipCols}%`;
          item.style.height = `${100 / chipRows}%`;

          if (fullyInside) {
            item.className = 'trail-grid-item';
          } else {
            item.style.visibility = 'hidden';
            item.style.pointerEvents = 'none';
          }
          disc.appendChild(item);
        }
      }
      
      wrapper.appendChild(disc);
    }
  }

  createGrid();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(createGrid, 200);
  });
});


// GSAP Entrance & Scroll Animations (only on landing page)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined') {
    // 1. Hero Text & Buttons Stagger Entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });

    heroTl.fromTo('.hero-tag', { opacity: 0, y: -20 }, { opacity: 1, y: 0 })
      .fromTo('.hero h1', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, '-=0.9')
      .fromTo('.hero p.lead', { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=0.9')
      .fromTo('.hero-cta .btn', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.15 }, '-=0.9');

    // 1.5 Fade in Three.js helix after hero
    gsap.to('#canvas-container', {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.hero',
        start: 'bottom 80%',
        toggleActions: 'play none none reverse'
      }
    });

    // 2. Scroll Trigger: Themes Section Card Staggers
    gsap.fromTo('.theme-card',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 1.0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#themes',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        onComplete: () => gsap.set('.theme-card', { clearProps: 'transform' })
      }
    );

    // 2.5 Three.js DNA Helix Background
    let threeStarted = true; // Start immediately since it's global background
    let threeScene, threeCamera, threeRenderer, threeHelix, parallaxGroup;
    let targetRotationX = 0;
    let targetRotationY = 0;

    if (typeof THREE !== 'undefined') {
      const container = document.getElementById('canvas-container');
      if (container) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;

        threeScene = new THREE.Scene();
        threeCamera = new THREE.PerspectiveCamera(60, cw / ch, 0.1, 1000);
        threeCamera.position.z = 40;

        threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        threeRenderer.setSize(cw, ch);
        threeRenderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(threeRenderer.domElement);

        parallaxGroup = new THREE.Group();
        threeHelix = new THREE.Group();
        parallaxGroup.add(threeHelix);
        threeScene.add(parallaxGroup);

        const numBasePairs = 100;
        const radius = 8;
        const heightOffset = 1.5;

        const sphereGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 });
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.02 });

        for (let i = 0; i < numBasePairs; i++) {
          const t = i * 0.4;
          const y = (i - numBasePairs / 2) * heightOffset;

          const x1 = Math.cos(t) * radius;
          const z1 = Math.sin(t) * radius;

          const x2 = Math.cos(t + Math.PI) * radius;
          const z2 = Math.sin(t + Math.PI) * radius;

          const s1 = new THREE.Mesh(sphereGeo, nodeMat);
          s1.position.set(x1, y, z1);
          threeHelix.add(s1);

          const s2 = new THREE.Mesh(sphereGeo, nodeMat);
          s2.position.set(x2, y, z2);
          threeHelix.add(s2);

          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y, z1),
            new THREE.Vector3(x2, y, z2)
          ]);
          const line = new THREE.Line(lineGeo, lineMat);
          threeHelix.add(line);
        }

        // Tilt the helix for a cooler angle
        threeHelix.rotation.z = Math.PI / 6;
        parallaxGroup.position.x = cw > 800 ? 15 : 0; // offset to the right on desktop

        window.addEventListener('resize', () => {
          if (container && threeRenderer && threeCamera) {
            const w = container.clientWidth;
            const h = container.clientHeight;
            threeRenderer.setSize(w, h);
            threeCamera.aspect = w / h;
            threeCamera.updateProjectionMatrix();
            parallaxGroup.position.x = w > 800 ? 15 : 0;
          }
        });

        // Parallax mouse tracking
        document.addEventListener('mousemove', (e) => {
          if (threeStarted) {
            targetRotationY = (e.clientX / window.innerWidth - 0.5) * 1.0;
            targetRotationX = (e.clientY / window.innerHeight - 0.5) * 1.0;
          }
        });

        function animateThree() {
          requestAnimationFrame(animateThree);
          if (threeStarted) {
            threeHelix.rotation.y += 0.002; // slower auto rotation
            parallaxGroup.rotation.y += (targetRotationY - parallaxGroup.rotation.y) * 0.0005;
            parallaxGroup.rotation.x += (targetRotationX - parallaxGroup.rotation.x) * 0.0005;

            threeRenderer.render(threeScene, threeCamera);
          }
        }
        animateThree();
      }
    }

    gsap.fromTo('#overview',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#overview',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onComplete: () => gsap.set('#overview', { clearProps: 'transform' })
      }
    );

    // 3. Scroll Trigger: Timeline Items Sliding In
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, idx) => {
      const slideDirection = idx % 2 === 0 ? -60 : 60;
      gsap.fromTo(item,
        { opacity: 0, x: slideDirection },
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // 4. Scroll Trigger: Prizes & Cards Animation
    gsap.fromTo('#prizes .card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#prizes',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        onComplete: () => gsap.set('#prizes .card', { clearProps: 'transform' })
      }
    );
  }
});

// Database layer is now handled by supabase.js (HelixSupabase class)
// The global `db` and `featureFlags` objects are created in supabase.js

// Highlight Active Link in Navbar
document.addEventListener('DOMContentLoaded', async () => {
  // Apply feature flags to hide/show gated sections
  if (typeof applyFeatureFlags === 'function') {
    await applyFeatureFlags();
  }

  const currentPath = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  // Setup FAQ Accordions
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');

      // Close all FAQs
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  // Bind Easter Egg Activation
  const eeTrigger = document.getElementById('easter-egg-trigger');
  if (eeTrigger) {
    eeTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openEasterEggModal();
    });
  }
});

// Easter Egg Decryptor Modal Logic
function openEasterEggModal() {
  // Create modal container if not exists
  let modal = document.getElementById('ee-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ee-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeEasterEggModal()">&times;</button>
        <h3 class="font-heading text-xl mb-4 matrix-glow">🧬 HELIX DECRYPTER v1.0</h3>
        <p class="text-sm text-dim mb-4">
          A security lock has been triggered. Decipher the cipher key to unlock the Easter Egg.
        </p>
        <div class="card p-4 bg-black/60 border-emerald-500/20 mb-4 text-left font-mono">
          <p class="text-emerald-500 text-xs mb-2">> INPUT CIPHER TEXT: "KHOla"</p>
          <p class="text-emerald-500 text-xs mb-2">> HINT: Caesar Shift of -3 (e.g. D -> A)</p>
          <p class="text-emerald-400 text-xs">> Enter decyphered key below:</p>
        </div>
        <div class="terminal-input-container mb-4">
          <span>$</span>
          <input type="text" id="ee-input" placeholder="type translation..." autofocus />
        </div>
        <button class="btn btn-primary w-full" onclick="verifyEasterEggKey()">Decrypt Key</button>
        <p id="ee-feedback" class="text-xs mt-3 text-rose-400" style="display:none;"></p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.classList.add('show');

  // Handle keypress
  const inputEl = document.getElementById('ee-input');
  if (inputEl) {
    inputEl.value = "";
    inputEl.focus();
    inputEl.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        verifyEasterEggKey();
      }
    });
  }

  const feedbackEl = document.getElementById('ee-feedback');
  if (feedbackEl) feedbackEl.style.display = 'none';
}

function closeEasterEggModal() {
  const modal = document.getElementById('ee-modal');
  if (modal) {
    modal.classList.remove('show');
  }
}

function verifyEasterEggKey() {
  const key = document.getElementById('ee-input').value.trim().toLowerCase();
  const feedback = document.getElementById('ee-feedback');

  if (key === 'helix') {
    feedback.className = "text-xs mt-3 text-emerald-400 font-mono text-left";
    feedback.style.display = "block";
    feedback.innerHTML = `
      > DECRYPTION SUCCESSFUL!<br>
      > CODE WORD: <strong class="matrix-glow">NEBULA_STRIKE</strong><br>
      > TEAM ID: <strong class="matrix-glow">HH26-EASTEREGG</strong><br>
      > Show this to the registration desk on Demo Day to claim your special recognition badge!
    `;
  } else {
    feedback.className = "text-xs mt-3 text-rose-400 font-mono";
    feedback.style.display = "block";
    feedback.innerText = "Error: Key verification failed. Incorrect translation.";
  }
}
