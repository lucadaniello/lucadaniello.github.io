/* ============================================================
   Hero network — a growing graph.
   A central node appears first, then nodes are added one by one
   and link into the graph with curved connections drawn as they
   form, so it looks like a network being built. Once grown, the
   nodes drift gently to keep the background alive.
   ============================================================ */
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── tuning ──────────────────────────────────────────────
    const TARGET       = 300;   // final number of nodes
    const GROWTH_MS     = 65;    // cadence of new nodes (moderate build)
    const NODE_APPEAR   = 500;   // node fade/scale-in (ms)
    const EDGE_GROW     = 450;   // edge draw-in (ms)
    const EXTRA_LINK_P  = 0.3;   // chance of an extra mesh link
    const MAX_LINK_DIST = 150;   // px for the extra mesh link
    const DRIFT         = 0.16;  // idle drift speed
    const CURVE         = 0.22;  // max edge curvature

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

    function addNode(x, y, r, parentIdx) {
        nodes.push({ x, y, vx: rand(-DRIFT, DRIFT), vy: rand(-DRIFT, DRIFT), r, born: now(), deg: 0 });
        const idx = nodes.length - 1;
        if (parentIdx != null) addEdge(parentIdx, idx);
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
        const dist   = rand(45, 110);
        const m      = 34;
        const x = Math.max(m, Math.min(W - m, parent.x + Math.cos(ang) * dist));
        const y = Math.max(m, Math.min(H - m, parent.y + Math.sin(ang) * dist));
        const idx = addNode(x, y, rand(2.2, 5.5), p);   // bigger, always varied sizes

        // sometimes wire the new node to its nearest neighbour → loops
        if (Math.random() < EXTRA_LINK_P) {
            let best = -1, bd = MAX_LINK_DIST * MAX_LINK_DIST;
            for (let i = 0; i < nodes.length - 1; i++) {
                if (i === p) continue;
                const dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
                if (d < bd) { bd = d; best = i; }
            }
            if (best >= 0) addEdge(best, idx);
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

        // edges — curved, drawn in from parent toward child
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
            if (n.deg >= 5) {
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
        addNode(W / 2, H / 2, 7, null);          // the central node, first
        growthTimer = setInterval(grow, GROWTH_MS);
        loop();
    }

    resize();

    if (reduce) {
        // Build the full graph instantly, no motion
        nodes.length = 0; edges.length = 0;
        addNode(W / 2, H / 2, 7, null);
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
