// Light and dark mode switching
function applyTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    } else if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
    }
}

// Add click events to theme switcher after the page has loaded
window.addEventListener('load', function() {
    document.querySelectorAll('.snappy-theme-btn').forEach(function (el) {
        el.addEventListener('click', function() {
            localStorage.setItem('theme', el.dataset.theme);
            applyTheme();
        })
    })
})

// Handle changes to system theme
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    applyTheme();
})

// Apply theme on initial page load
applyTheme();