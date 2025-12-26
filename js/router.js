import { init3DScene, stop3DScene } from './main.js';

const routes = {
    '/': '/views/home.html', // Redirect root to home content
    '/home': '/views/home.html',
    '/portfolio': '/views/portfolio.html',
    '/contact': '/views/contact.html'
};

async function loadLayout() {
    const resp = await fetch('/components/menu-bar.html');
    const html = await resp.text();
    document.getElementById('navigation-root').innerHTML = html;
}

async function handleLocation() {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];

    try {
        const resp = await fetch(route);
        if (!resp.ok) throw new Error('Page not found');
        const html = await resp.text();
        document.getElementById("app-root").innerHTML = html;

        if (path === '/portfolio') {
            init3DScene();
        } else {
            stop3DScene();
        }
    } catch (err) {
        document.getElementById("app-root").innerHTML = "<h1>404 - Page Not Found</h1>";
    }
}

// Global router function
window.route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.getAttribute('href'));
    handleLocation();
};

window.onpopstate = handleLocation;

// Initialize
loadLayout();
handleLocation();