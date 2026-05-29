/**
 * site.js — shared nav + footer.
 * Each page calls renderChrome("home" | "professional" | "writing" | "projects").
 * Update nav links / footer text in one place.
 */
(function () {
    const NAV = [
        { name: "Home",         link: "index.html",         key: "home" },
        { name: "Professional", link: "professional.html",  key: "professional" },
        { name: "Writing",      link: "writing.html",       key: "writing" },
        { name: "Takeaways",    link: "takeaways.html",     key: "takeaways" },
        { name: "Projects",     link: "projects.html",      key: "projects" },
    ];
    const FOOTER_TEXT = "© " + new Date().getFullYear() + " Dickson Li";

    window.renderChrome = function (activeKey) {
        const nav = document.getElementById("nav-mount");
        if (nav) {
            const items = NAV.map(function (n) {
                const cls = "alignable pull-left nav-list" + (n.key === activeKey ? " active" : "");
                return '<li class="' + cls + '"><a href="' + n.link + '">' + n.name + "</a></li>";
            }).join("");
            nav.innerHTML =
                '<a id="author-name" class="alignable pull-left" href="index.html">Dickson Li</a>' +
                '<ul id="navlist" class="alignable pull-right navbar-ul">' + items + "</ul>";
        }
        const footer = document.getElementById("footer-mount");
        if (footer) {
            footer.innerHTML =
                '<hr /><p class="site-footer"><small>' + FOOTER_TEXT + "</small></p>";
        }
    };
})();
