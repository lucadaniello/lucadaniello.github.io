/* ============================================================
   Hero network — a growing graph.
   A central node appears first, then nodes are added one by one
   and link into the graph, drawing the connections as they form,
   so it looks like a network being built. Once grown, the nodes
   drift gently to keep the background alive.
   ============================================================ */
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── tuning ──────────────────────────────────────────────
    const TARGET       = 48;    // final number of nodes
    const GROWTH_MS     = 210;   // cadence of new nodes (moderate)
    const NODE_APPEAR   = 500;   // node fade/scale-in (ms)
    const EDGE_GROW     = 450;   // edge draw-in (ms)
    const EXTRA_LINK_P  = 0.35;  // chance of an extra mesh link
    const MAX_LINK_DIST = 175;   // px for the extra mesh link
    const DRIFT         = 0.18;  // idle drift speed

    let W, H, dpr, raf, growthTimer;
    const nodes = [];
    const edges = [];

    const rand = (a, b) => Math.random() * (b - a) + a;
    const now  = () => performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function addNode(x, y, r, parentIdx) {
        const n = { x, y, vx: rand(-DRIFT, DRIFT), vy: rand(-DRIFT, DRIFT), r, born: now(), deg: 0 };
        nodes.push(n);
        const idx = nodes.length - 1;
        if (parentIdx != null) {
            edges.push({ a: parentIdx, b: idx, created: now() });
            nodes[parentIdx].deg++;
            n.deg++;
        }
        return idx;
    }

    // Preferential attachment → a few natural hubs
    function pickParent() {
        let total = 0;
        for (const n of nodes) total += n.deg + 1;
        let r = Math.random() * total;
        for (let i = 0; i < nodes.length; i++) {
            r -= nodes[i].deg + 1;
            if (r <= 0) return i;
        }
        return nodes.length - 1;
    }

    function grow() {
        if (nodes.length >= TARGET) {
            if (growthTimer) { clearInterval(growthTimer); growthTimer = null; }
            return;
        }
        const p      = pickParent();
        const parent = nodes[p];
        const ang    = rand(0, Math.PI * 2);
        const dist   = rand(55, 120);
        const m      = 38;
        const x = Math.max(m, Math.min(W - m, parent.x + Math.cos(ang) * dist));
        const y = Math.max(m, Math.min(H - m, parent.y + Math.sin(ang) * dist));
        const idx = addNode(x, y, rand(1.6, 3), p);

        // sometimes wire the new node to its nearest neighbour → loops
        if (Math.random() < EXTRA_LINK_P) {
            let best = -1, bd = MAX_LINK_DIST * MAX_LINK_DIST;
            for (let i = 0; i < nodes.length - 1; i++) {
                if (i === p) continue;
                const dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
                if (d < bd) { bd = d; best = i; }
            }
            if (best >= 0) {
                edges.push({ a: best, b: idx, created: now() });
                nodes[best].deg++;
                nodes[idx].deg++;
            }
        }
    }

    function update() {
        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < n.r || n.x > W - n.r) n.vx *= -1;
            if (n.y < n.r || n.y > H - n.r) n.vy *= -1;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const t = now();

        // edges (draw-in from parent toward child)
        for (const e of edges) {
            const a = nodes[e.a], b = nodes[e.b];
            const ap = Math.min((t - a.born) / NODE_APPEAR, 1);
            const bp = Math.min((t - b.born) / NODE_APPEAR, 1);
            const gp = easeOut(Math.min((t - e.created) / EDGE_GROW, 1));
            const ex = a.x + (b.x - a.x) * gp;
            const ey = a.y + (b.y - a.y) * gp;
            const alpha = 0.16 * Math.min(ap, bp);
            ctx.strokeStyle = `rgba(205,228,240,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }

        // nodes (scale-in)
        for (const n of nodes) {
            const p = easeOut(Math.min((t - n.born) / NODE_APPEAR, 1));
            const r = n.r * p;
            if (r <= 0.05) continue;
            if (n.deg >= 4) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(120,190,210,${0.06 * p})`;
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.30 * p + 0.06})`;
            ctx.fill();
        }
    }

    function loop() {
        update();
        draw();
        raf = requestAnimationFrame(loop);
    }

    function build() {
        cancelAnimationFrame(raf);
        if (growthTimer) clearInterval(growthTimer);
        nodes.length = 0;
        edges.length = 0;
        addNode(W / 2, H / 2, 4.2, null);        // the central node, first
        growthTimer = setInterval(grow, GROWTH_MS);
        loop();
    }

    resize();

    if (reduce) {
        // Build the full graph instantly, no motion
        nodes.length = 0; edges.length = 0;
        addNode(W / 2, H / 2, 4.2, null);
        while (nodes.length < TARGET) grow();
        const past = now() - 3000;
        nodes.forEach(n => { n.born = past; n.vx = n.vy = 0; });
        edges.forEach(e => { e.created = past; });
        draw();
    } else {
        setTimeout(build, 200);   // let the central node register first
    }

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { resize(); if (!reduce) build(); else draw(); }, 200);
    });

    // Pause when the tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (reduce) return;
        if (document.hidden) {
            cancelAnimationFrame(raf);
            if (growthTimer) { clearInterval(growthTimer); growthTimer = null; }
        } else {
            loop();
            if (nodes.length < TARGET && !growthTimer) growthTimer = setInterval(grow, GROWTH_MS);
        }
    });
})();
