/**
 * professional.js — career Gantt + detail cards, coloured by geography.
 *
 * To edit your timeline, change the ROLES array below.
 *   - start / end: decimal years (e.g. 2021.4 ~ mid-2021). Used for bar width.
 *   - geo: must match a key in GEO_COLORS (controls the colour).
 *   - short: the label shown inside the bar (keep it tight).
 *   - role: the full title shown in the detail card.
 *   - did:  plain-language "what I did" paragraph.
 *   - present: true on the current role (shows "Present" instead of an end year).
 *
 * Clicking a bar (or a company name) highlights and scrolls to its detail card.
 */

const FIRST_YEAR = 2011;
const LAST_YEAR  = 2026;

/* Colour by where I was based — highlights the US -> Singapore arc. */
const GEO_COLORS = {
    "United States": "#e8642a",
    "Singapore":     "#0099ff",
};

const ROLES = [
    {
        company: "University of Chicago", role: "Bachelor of Arts in Economics",
        short: "Economics", start: 2011.7, end: 2014.5, geo: "United States",
        did: "Where it started, and a formative few years. I trained in economics \u2013 econometrics, statistical models, linear algebra, the economics of crime from Steve Levitt, game theory from Roger Myerson. The habit that stuck with me from those years: take a messy real-world question, write down the objective function, identify the variables, work the first- and second-order conditions, and reason from there."
    },
    {
        company: "Kearney", role: "Associate",
        short: "Associate", start: 2014.7, end: 2021.4, geo: "United States",
        did: "My first real job, and where I learned the craft of consulting. I worked on cost and operations problems for large manufacturers and retailers across supply chains, factories, and procurement. The skill that compounded from those years: walking into a complicated operation, finding where the value sits, and leading a team to unlock it."
    },
    {
        company: "MIT Sloan", role: "MBA",
        short: "MBA", start: 2018.6, end: 2020.5, geo: "United States",
        did: "Two years at MIT, and the most international stretch of my career. The summers and lab terms mattered as much as the classroom. I worked on Grab's regional payments strategy across Southeast Asia, spent a summer in Shanghai on the electrification of ABInBev's APAC truck fleet which was my first real exposure to the China market, and did a lab term in Israel learning how its startup ecosystem actually works. By the end I had a much sharper sense of where I wanted to point next: technology, and Asia."
    },
    {
        company: "Google",
        role: "Country Strategy & Operations Lead, Southeast Asia (Chief of Staff to Country Directors)",
        short: "Chief of Staff", start: 2021.4, end: 2024.4, geo: "Singapore",
        did: "This is where I learned how to run a complex, few-hundred-million-dollar sales organization, as Chief of Staff to the Southeast Asia Country Directors. The job was the operating model behind a regional business: how planning got done, how performance was reviewed, and how sales, product, and operations stayed aligned. I redesigned the sales org structure with the Country Director and ran the weekly leadership reviews where the real decisions about people and budget got made."
    },
    {
        company: "Bain & Company", role: "Manager",
        short: "Manager", start: 2024.4, end: 2025.6, geo: "Singapore",
        did: "Back to consulting, this time as a Manager leading the teams rather than sitting in them. In a little over a year I shaped a five-year growth strategy for a regional bank, led an operational turnaround for a consumer goods company, and helped a manufacturer rethink a large IT budget. A dense stretch of very different, senior-facing problems."
    },
    {
        company: "AWS", role: "Investments Strategy & Compete Lead, GTM",
        short: "Strategy & Compete", start: 2025.7, end: 2026.4, geo: "Singapore", present: true,
        did: "I joined AWS to build its investment and competitive capability for the Asia-Pacific region. I stood up the competitive intelligence function, using AI agents to turn market research and live deal data into practical playbooks for sellers, and built AI-driven workflows for funding and reporting that replaced slow, manual processes. The thread running through it: using AI to take friction out of how a large sales organization works."
    },
];

function renderGantt(mount) {
    if (!mount) return;
    renderLegend(document.getElementById("geo-legend"));

    const years = [];
    for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) years.push(y);

    const gantt = document.createElement("div");
    gantt.className = "gantt";
    gantt.style.gridTemplateColumns = "minmax(120px, 24%) repeat(" + years.length + ", 1fr)";

    // Header row of years.
    const header = document.createElement("div");
    header.className = "gantt-header";
    header.appendChild(cell());
    years.forEach(function (y) {
        const c = document.createElement("div");
        c.className = "gantt-year";
        c.textContent = (y % 5 === 0 || y === LAST_YEAR || y === FIRST_YEAR) ? y : "";
        header.appendChild(c);
    });
    gantt.appendChild(header);

    // One row per role.
    ROLES.forEach(function (r, idx) {
        const row = document.createElement("div");
        row.className = "gantt-row";

        const label = document.createElement("div");
        label.className = "gantt-label";
        label.innerHTML = '<a href="#detail-' + idx + '" data-target="detail-' + idx + '">' +
            esc(r.company) + "</a>";
        row.appendChild(label);

        const startCol = Math.floor(r.start - FIRST_YEAR) + 2;
        const endCol   = Math.ceil(r.end - FIRST_YEAR) + 2;
        const span     = Math.max(1, endCol - startCol);

        for (let i = 0; i < startCol - 2; i++) row.appendChild(cell());

        const bar = document.createElement("div");
        bar.className = "gantt-bar";
        bar.style.gridColumn = "span " + span;
        bar.style.background = GEO_COLORS[r.geo] || "#999";
        bar.textContent = r.short || r.role;
        bar.title = r.company + ", " + r.role + " (" +
            displayYear(r.start) + " \u2013 " + (r.present ? "Present" : displayYear(r.end)) + ")";
        bar.addEventListener("click", function () { highlight("detail-" + idx); });
        row.appendChild(bar);

        gantt.appendChild(row);
    });

    mount.innerHTML = "";
    mount.appendChild(gantt);

    // Detail cards under the chart.
    ROLES.forEach(function (r, idx) {
        const card = document.createElement("div");
        card.className = "gantt-detail";
        card.id = "detail-" + idx;
        card.style.borderLeftColor = GEO_COLORS[r.geo] || "#999";
        card.innerHTML =
            "<h4>" + esc(r.company) + "</h4>" +
            '<div class="role-line">' + esc(r.role) + "</div>" +
            '<div class="meta">' + displayYear(r.start) + " \u2013 " +
                (r.present ? "Present" : displayYear(r.end)) + " \u00b7 " + esc(r.geo) + "</div>" +
            "<p>" + esc(r.did) + "</p>";
        mount.appendChild(card);
    });

    // Clicking a company name also highlights its card.
    mount.querySelectorAll(".gantt-label a").forEach(function (a) {
        a.addEventListener("click", function (e) {
            e.preventDefault();
            highlight(a.getAttribute("data-target"));
        });
    });
}

function renderLegend(mount) {
    if (!mount) return;
    const present = [];
    ROLES.forEach(function (r) { if (present.indexOf(r.geo) < 0) present.push(r.geo); });
    mount.className = "geo-legend";
    mount.innerHTML = present.map(function (g) {
        return '<span class="swatch"><span class="dot" style="background:' +
            (GEO_COLORS[g] || "#999") + '"></span>' + esc(g) + "</span>";
    }).join("");
}

function highlight(id) {
    const el = document.getElementById(id);
    if (!el) return;
    document.querySelectorAll(".gantt-detail.highlight").forEach(function (e) {
        e.classList.remove("highlight");
    });
    void el.offsetWidth; // restart the flash animation if re-clicked
    el.classList.add("highlight");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cell() { return document.createElement("div"); }
function displayYear(y) { return String(Math.floor(y)); }
function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
