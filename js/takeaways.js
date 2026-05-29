/**
 * takeaways.js — renders the "Takeaways" page.
 *
 * To add an entry: add an object to the ENTRIES array at the top of this file.
 *
 *   {
 *     type:      "book" | "podcast" | "reading" | "show" | "tweet",
 *     date:      "2026-05-26",     // when YOU consumed it. drives sort.
 *     published: "2026-05-26",     // when the SOURCE came out. shown to readers.
 *     title:     "Headline",
 *     source:    "Author / show / publisher",
 *     url:       "https://...",    // optional. adds a "read \u2192" / "listen \u2192" link.
 *     take:      "Paragraph."      // string, or array of strings for >1 paragraph.
 *   }
 *
 * Inline italics: wrap a phrase in *asterisks* inside a take string.
 *
 * Date format: YYYY-MM-DD (full), YYYY-MM, or YYYY. Display picks the right form.
 * Each entry is colour-coded by media type via the TYPES map below.
 */

const TYPES = {
    book:    { label: "Books",    pill: "Book",    color: "#0099ff", verb: "read"   },
    podcast: { label: "Podcasts", pill: "Podcast", color: "#7c5cff", verb: "listen" },
    reading: { label: "Reading",  pill: "Reading", color: "#2a8a35", verb: "read"   },
    show:    { label: "Shows",    pill: "Show",    color: "#e8642a", verb: "watch"  },
    tweet:   { label: "Tweets",   pill: "Tweet",   color: "#1d1d1f", verb: "read"   },
};

const ENTRIES = [
    {
        type: "podcast", date: "2026-05-26", published: "2026-05-26",
        title: "All-In: Gavin Baker on AI Stack Valuations & the NVIDIA Quarter",
        source: "All-In Podcast",
        url: "https://podcasts.apple.com/us/podcast/all-in-with-chamath-jason-sacks-friedberg/id1502871393",
        take: [
            "Across the public AI hardware stack, multiples are mutually inconsistent. Memory at 3-5x P/E, NVIDIA at a depressed P/E, accelerator companies at reasonable multiples, and power / cooling / optical names at high multiples. If power / cooling / optical multiples are correct, NVIDIA and memory have to go up a lot. If NVIDIA and memory are correctly priced, the rest underperforms.",
            "Disaggregated inference extends GPU useful life. LLM inference splits into two phases:",
            "1/ Prefill: the model reads the entire prompt at once, processing it in parallel through every layer of the model. This phase is *compute-bound*, and GPUs are purpose-built for it.",
            "2/ Decode: once the prompt is read, the model generates the answer one token at a time, sequentially. Each new token has to look back at every previous token's \"memory.\" This is *memory-bandwidth-bound*: the bottleneck is how fast data can move in and out of memory.",
            "You can keep the GPU fleet doing prefill, training, fine-tuning, and batch jobs, where it's still very competitive, and bolt on Groq or Cerebras clusters for decode as that traffic grows."
        ]
    },
    {
        type: "reading", date: "2026-05-26", published: "2026-05",
        title: "The AI Stack: A Blueprint for Technological Supremacy",
        source: "Chamath Palihapitiya / Social Capital",
        url: "https://chamath.substack.com/p/the-ai-stack",
        take: [
            "Chamath lays out a six-layer map of the AI economy: Application, Execution, Models, Data, Chips, and Infrastructure. Below the chip layer the stack forks into Digital AI and Physical AI, each with different data, chips, and scaling laws.",
            "The test for what counts as a \"fulcrum asset\" \u2013 the layers where value concentrates \u2013 is whether every unit of value passes through it, how long it would take to substitute, who sets the price, and whether there is a flywheel that compounds with use. The model layer fails this test. It is commoditizing on a 3-6 month clock as open-weight models catch up to the frontier. Value barbells to the two ends instead. Below: physical chokepoints like TSMC, ASML, refining, and power generation. Above: workflow owners like Bloomberg and Tesla that embed in the customer's day-to-day.",
            "ASML is an interesting case. It is the only company in the world that makes EUV lithography machines, and yet it has captured far less value than NVIDIA over the last five years. The same complexity that protects its monopoly is what caps how fast it can grow. Its supply constraints prevent value from accruing to it."
        ]
    },
    {
        type: "book", date: "2026-05", published: "2025",
        title: "Apple in China",
        source: "Patrick McGee",
        url: "https://www.simonandschuster.com/books/Apple-in-China/Patrick-McGee/9781668053379",
        take: "Apple contributed as much to the development of China's industrial base as China did to the development of Apple's manufacturing prowess. Both needed each other; neither would exist in its current form without the other."
    },
    {
        type: "book", date: "2026-05", published: "2025",
        title: "Breakneck: China's Quest to Engineer the Future",
        source: "Dan Wang",
        url: "https://www.penguinrandomhouse.com/books/719876/breakneck-by-dan-wang/",
        take: "Wang's argument is that China is an engineering state and the United States is a lawyerly society. China's elite are trained in engineering and run the country as a problem to be solved. America's elite are trained in law and run the country through procedure, contestation, and rights claims. The lens stuck with me as a way to understand the two countries."
    },
    {
        type: "book", date: "2026-04", published: "2019",
        title: "Cribsheet",
        source: "Emily Oster",
        url: "https://www.penguinrandomhouse.com/books/572658/cribsheet-by-emily-oster/",
        take: "Most parenting choices are revealed preferences rather than evidence-based. Once you see this, the anxiety around early-childhood decisions drops considerably."
    },
];

function renderTakeaways() {
    const filterBar  = document.getElementById("media-filters");
    const targetList = document.getElementById("media-list");
    if (!targetList) return;

    const entries = ENTRIES.slice().sort(function (a, b) {
        return (b.date || "").localeCompare(a.date || "");
    });

    // Build filter buttons: All + each type actually present, in TYPES order.
    const present = Object.keys(TYPES).filter(function (t) {
        return entries.some(function (e) { return e.type === t; });
    });
    const buttons = [{ key: "all", label: "All", color: "#555" }].concat(
        present.map(function (t) {
            return { key: t, label: TYPES[t].label, color: TYPES[t].color };
        })
    );

    filterBar.innerHTML = buttons.map(function (b) {
        return '<button class="media-filter-btn' + (b.key === "all" ? " active" : "") +
            '" data-filter="' + b.key + '" data-color="' + b.color + '">' + b.label + "</button>";
    }).join("");

    function paintActive(btn) {
        filterBar.querySelectorAll(".media-filter-btn").forEach(function (b) {
            b.classList.remove("active");
            b.style.background = "";
        });
        btn.classList.add("active");
        btn.style.background = btn.getAttribute("data-color");
    }

    function render(filter) {
        const visible = filter === "all"
            ? entries
            : entries.filter(function (e) { return e.type === filter; });

        if (visible.length === 0) {
            targetList.innerHTML = '<li class="media-entry"><em>Nothing here yet.</em></li>';
            return;
        }
        targetList.innerHTML = visible.map(entryHtml).join("");
    }

    filterBar.querySelectorAll(".media-filter-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            paintActive(btn);
            render(btn.getAttribute("data-filter"));
        });
    });

    paintActive(filterBar.querySelector('[data-filter="all"]'));
    render("all");
}

function entryHtml(e) {
    const t = TYPES[e.type] || { pill: e.type, color: "#999", verb: "read" };
    const titleHtml = e.url
        ? '<a href="' + e.url + '" target="_blank" rel="noopener">' + esc(e.title) + "</a>"
        : esc(e.title);

    // Source line: Source · Date · listen \u2192   (each part optional)
    const parts = [];
    if (e.source)    parts.push(esc(e.source));
    if (e.published) parts.push(esc(fmtDate(e.published)));
    if (e.url)       parts.push('<a href="' + e.url + '" target="_blank" rel="noopener">' +
                                t.verb + " \u2192</a>");
    const sourceLine = parts.length
        ? '<div class="entry-source">' + parts.join(" &middot; ") + "</div>"
        : "";

    const takeHtml = Array.isArray(e.take)
        ? e.take.map(function (p) { return "<p>" + fmtTake(p) + "</p>"; }).join("")
        : "<p>" + fmtTake(e.take) + "</p>";

    return '<li class="media-entry" style="border-left-color:' + t.color + '">' +
        '<div class="entry-head">' +
            '<span class="type-pill" style="color:' + t.color + ';border-color:' + t.color + '40">' +
                esc(t.pill) + "</span>" +
            '<span class="title">' + titleHtml + "</span>" +
        "</div>" +
        sourceLine +
        takeHtml +
    "</li>";
}

/**
 * Escape HTML, then convert *italics* to <em>. Order matters: escape first
 * so any < > in the source stays text, then re-introduce <em> tags from the
 * sanitized version.
 */
function fmtTake(s) {
    return esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function fmtDate(d) {
    if (!d) return "";
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parts = d.split("-");
    if (parts.length === 3) {
        const m = months[parseInt(parts[1], 10)] || "";
        const day = parseInt(parts[2], 10);
        return m + " " + day + ", " + parts[0];
    }
    if (parts.length === 2) {
        const m = months[parseInt(parts[1], 10)] || "";
        return m + " " + parts[0];
    }
    return d;
}

function esc(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
