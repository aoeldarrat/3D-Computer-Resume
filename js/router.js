import { init3DScene, stop3DScene } from './main.js';

const routes = {
    '/': '/views/home.html',
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
        document.getElementById("app-root").innerHTML = err;
    }
}

// Global router function
window.route = (event) => {
    event.preventDefault();
    const href = event.currentTarget.getAttribute('href')
    window.history.pushState({}, "", href);
    handleLocation();
};

window.onpopstate = handleLocation;

// Initialize
loadLayout();
handleLocation();