/* Hero network animation — floating nodes connected by lines */
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const NODE_COUNT = 55;
    const MAX_DIST   = 160;
    const SPEED      = 0.28;

    let W, H, nodes, raf;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function initNodes() {
        nodes = Array.from({ length: NODE_COUNT }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
            r:  Math.random() * 1.8 + 0.8
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        /* connections */
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_DIST) {
                    const alpha = (1 - d / MAX_DIST) * 0.18;
                    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                    ctx.lineWidth   = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        /* nodes */
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.30)';
            ctx.fill();
        });
    }

    function update() {
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
        });
    }

    function loop() {
        update();
        draw();
        raf = requestAnimationFrame(loop);
    }

    /* pause when tab is hidden to save CPU */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(raf); }
        else { loop(); }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); initNodes(); }, 150);
    });

    resize();
    initNodes();
    loop();
})();
