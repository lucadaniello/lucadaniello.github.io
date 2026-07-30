/* ============================================================
   Hero falling icons — small science/research/statistics glyphs
   drift down from the top of the hero. Nothing is shown for the
   first second, then icons begin to fall (à la emilhvitfeldt.com).
   ============================================================ */
(function () {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Respect reduced-motion (CSS also hides the layer)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'hero-falling';
    layer.setAttribute('aria-hidden', 'true');
    hero.appendChild(layer);

    // Icons referencing statistics, scientific research, articles & books
    const ICONS = [
        'fa-chart-bar', 'fa-chart-line', 'fa-chart-pie', 'fa-chart-area',
        'fa-square-root-variable', 'fa-percent', 'fa-superscript', 'fa-calculator',
        'fa-flask', 'fa-atom', 'fa-microscope', 'fa-brain',
        'fa-book', 'fa-book-open', 'fa-file-lines', 'fa-newspaper',
        'fa-graduation-cap', 'fa-diagram-project', 'fa-magnifying-glass-chart', 'fa-network-wired'
    ];

    // Soft light / sage / gold tones that read well on the navy hero
    const COLORS = [
        'rgba(255,255,255,0.55)',
        'rgba(167,196,188,0.65)',  // sage
        'rgba(203,216,201,0.6)',   // pale green
        'rgba(217,194,126,0.6)',   // gold
        'rgba(127,176,196,0.6)',   // light teal
        'rgba(159,184,173,0.55)'
    ];

    const rand  = (min, max) => Math.random() * (max - min) + min;
    const pick  = arr => arr[Math.floor(Math.random() * arr.length)];

    let running = true;
    let spawnTimer = null;
    const MAX_LIVE = 22;

    function spawn() {
        if (!running) return;
        if (layer.childElementCount >= MAX_LIVE) return;

        const el = document.createElement('i');
        el.className = 'fas ' + pick(ICONS) + ' falling-icon';

        const size     = rand(14, 34);
        const duration = rand(9, 17);
        const drift    = rand(-40, 40);            // horizontal sway (px)
        const spin     = rand(-140, 140);          // rotation on the way down
        const peak     = rand(0.28, 0.6);

        el.style.left              = rand(0, 100) + '%';
        el.style.fontSize          = size + 'px';
        el.style.color             = pick(COLORS);
        el.style.animationDuration = duration + 's';
        el.style.setProperty('--fall', 'calc(100% + 120px)');
        el.style.setProperty('--spin', spin + 'deg');
        el.style.setProperty('--peak', peak.toFixed(2));
        el.style.transform = 'translateX(' + drift + 'px)';

        el.addEventListener('animationend', () => el.remove(), { once: true });
        layer.appendChild(el);
    }

    function start() {
        // Pre-seed a few so the fall reads immediately after the pause
        for (let i = 0; i < 6; i++) setTimeout(spawn, i * 260);
        spawnTimer = setInterval(spawn, 620);
    }

    // Nothing for 1 second, then the icons begin to fall
    let started = false;
    const startTimeout = setTimeout(() => { started = true; start(); }, 1000);

    // Pause when the tab is hidden to save CPU
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            running = false;
            if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
        } else if (started) {
            running = true;
            if (!spawnTimer) spawnTimer = setInterval(spawn, 620);
        }
    });
})();
