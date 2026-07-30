/* ============================================================
   Hero network — a growing graph.
   A central node appears first, then nodes appear spread across
   the whole area (kept apart from one another) and link to their
   nearest neighbour with a curved connection drawn as it forms,
   so the network builds up evenly instead of clumping. Once
   grown, the nodes drift gently to keep the background alive.
   ============================================================ */
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── tuning ──────────────────────────────────────────────
    const TARGET       = 110;   // final number of nodes
    const GROWTH_MS     = 95;    // cadence of new nodes (moderate build)
    const NODE_APPEAR   = 500;   // node fade/scale-in (ms)
    const EDGE_GROW     = 450;   // edge draw-in (ms)
    const SPREAD_TRIES  = 16;    // candidates per node → pick the most isolated
    const SECOND_LINK_D = 170;   // px, optional 2nd link for mesh loops
    const SECOND_LINK_P = 0.5;
    const DRIFT         = 0.12;  // idle drift speed
    const CURVE         = 0.2;   // max edge curvature

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

    function addEdge(a, b) {
        edges.push({ a, b, created: now(), curv: rand(-CURVE, CURVE) });
        nodes[a].deg++;
        nodes[b].deg++;
    }

    function addNode(x, y, r) {
        nodes.push({ x, y, vx: rand(-DRIFT, DRIFT), vy: rand(-DRIFT, DRIFT), r, born: now(), deg: 0 });
        return nodes.length - 1;
    }

    // Pick a point that is as far as possible from existing nodes → even spread
    function spreadPoint() {
        const m = 40;
        let best = null, bestD = -1;
        for (let k = 0; k < SPREAD_TRIES; k++) {
            const x = rand(m, W - m), y = rand(m, H - m);
            let nd = Infinity;
            for (const n of nodes) {
                const dx = n.x - x, dy = n.y - y, d = dx * dx + dy * dy;
                if (d < nd) nd = d;
            }
            if (nd > bestD) { bestD = nd; best = { x, y }; }
        }
        return best;
    }

    function grow() {
        if (nodes.length >= TARGET) {
            if (growthTimer) { clearInterval(growthTimer); growthTimer = null; }
            return;
        }
        const p = spreadPoint();
        const idx = addNode(p.x, p.y, rand(2.2, 5.5));   // bigger, always varied sizes

        // link to the two nearest existing nodes
        let n1 = -1, d1 = Infinity, n2 = -1, d2 = Infinity;
        for (let i = 0; i < nodes.length - 1; i++) {
            const dx = nodes[i].x - p.x, dy = nodes[i].y - p.y, d = dx * dx + dy * dy;
            if (d < d1) { d2 = d1; n2 = n1; d1 = d; n1 = i; }
            else if (d < d2) { d2 = d; n2 = i; }
        }
        if (n1 >= 0) addEdge(n1, idx);
        if (n2 >= 0 && d2 < SECOND_LINK_D * SECOND_LINK_D && Math.random() < SECOND_LINK_P) addEdge(n2, idx);
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

        // edges — curved, drawn in from the existing node toward the new one
        for (const e of edges) {
            const a = nodes[e.a], b = nodes[e.b];
            const ap = Math.min((t - a.born) / NODE_APPEAR, 1);
            const bp = Math.min((t - b.born) / NODE_APPEAR, 1);
            const gp = easeOut(Math.min((t - e.created) / EDGE_GROW, 1));

            const dx = b.x - a.x, dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;                 // unit normal
            const cx = (a.x + b.x) / 2 + nx * len * e.curv;      // bezier control
            const cy = (a.y + b.y) / 2 + ny * len * e.curv;

            ctx.strokeStyle = `rgba(205,228,240,${0.15 * Math.min(ap, bp)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            if (gp >= 1) {
                ctx.quadraticCurveTo(cx, cy, b.x, b.y);
            } else {
                const seg = 14;
                for (let i = 1; i <= seg; i++) {
                    const tt = gp * i / seg;
                    const u = 1 - tt;
                    ctx.lineTo(
                        u * u * a.x + 2 * u * tt * cx + tt * tt * b.x,
                        u * u * a.y + 2 * u * tt * cy + tt * tt * b.y
                    );
                }
            }
            ctx.stroke();
        }

        // nodes (scale-in)
        for (const n of nodes) {
            const p = easeOut(Math.min((t - n.born) / NODE_APPEAR, 1));
            const r = n.r * p;
            if (r <= 0.05) continue;
            if (n.deg >= 4) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, r + 3.5, 0, Math.PI * 2);
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
        addNode(W / 2, H / 2, 7);                 // the central node, first
        growthTimer = setInterval(grow, GROWTH_MS);
        loop();
    }

    resize();

    if (reduce) {
        // Build the full graph instantly, no motion
        nodes.length = 0; edges.length = 0;
        addNode(W / 2, H / 2, 7);
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
