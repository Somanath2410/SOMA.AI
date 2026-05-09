function showView(viewId) {
    document.querySelectorAll('main').forEach(m => m.style.display = 'none');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if (target) {
        if (viewId === 'home') target.style.display = 'flex';
        else if (viewId === 'modules') target.style.display = 'grid';
        else target.style.display = 'block';
    }
    const nav = document.getElementById('nav-' + viewId);
    if (nav) nav.classList.add('active');
    window.scrollTo(0, 0);
}

function connectSoftware(btn, name) {
    btn.innerText = "CONNECTING...";
    setTimeout(() => {
        btn.innerText = "CONNECTED";
        btn.style.color = "#00f2ff";
        btn.style.borderColor = "#00f2ff";
        btn.disabled = true;
    }, 1500);
}

function startPlanForge() {
    const status = document.getElementById('planforge-status');
    const img = document.getElementById('planforge-img');
    status.style.display = 'block';
    status.innerText = "[ SOMA BRAIN: OPTIMIZING LAYOUT... ]";
    img.style.opacity = "0.3";
    setTimeout(() => {
        status.innerText = "[ LAYOUT GENERATED SUCCESSFULLY ]";
        status.style.color = "#00f2ff";
        img.style.opacity = "1";
        img.style.filter = "hue-rotate(90deg)";
    }, 3000);
}

// Live Simulation
setInterval(() => {
    const health = document.querySelector('.stat-value[style*="success"]');
    if (health && Math.random() > 0.7) {
        const newVal = (98 + Math.random() * 1).toFixed(1);
        health.innerText = newVal + "%";
    }
}, 3000);

showView('home');