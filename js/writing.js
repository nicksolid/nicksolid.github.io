/**
 * writing.js — pulls the latest posts from a Substack publication's RSS feed
 * and renders them as title + date + short excerpt cards.
 *
 * Substack exposes /feed at every publication URL.
 * Browsers can't fetch arbitrary RSS directly due to CORS, so we use
 * rss2json.com as a free CORS-friendly RSS-to-JSON proxy.
 *
 * If you'd rather not rely on a third-party proxy, alternatives:
 *   1. Run your own Cloudflare Worker that fetches the feed and adds CORS headers.
 *   2. Build the post list manually and update writing.html when you publish.
 */

const EXCERPT_WORD_LIMIT = 45;   // ~3 short sentences

function loadSubstackFeed(opts) {
    const { substackUrl, mount, linkEl, limit } = opts;
    if (!mount) return;

    if (linkEl && substackUrl) {
        linkEl.href = substackUrl;
    } else if (linkEl) {
        linkEl.href = "#";
    }

    if (!substackUrl) {
        mount.innerHTML =
            '<li><em>Once your Substack is live, set <code>substackUrl</code> in writing.html and posts will appear here automatically.</em></li>';
        return;
    }

    const feedUrl = substackUrl.replace(/\/$/, "") + "/feed";
    const proxyUrl =
        "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feedUrl);

    fetch(proxyUrl)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!data || data.status !== "ok" || !Array.isArray(data.items)) {
                throw new Error("Bad feed response");
            }
            const items = data.items.slice(0, limit || 5);
            if (items.length === 0) {
                mount.innerHTML = "<li><em>No posts yet.</em></li>";
                return;
            }
            mount.innerHTML = items.map(renderItem).join("");
        })
        .catch(function () {
            mount.innerHTML =
                '<li><em>Couldn\'t load the feed right now. ' +
                '<a href="' + substackUrl + '" target="_blank" rel="noopener">Visit Substack &rarr;</a></em></li>';
        });
}

function renderItem(it) {
    const date = formatDate(it.pubDate);
    const section = inferSection(it);
    const excerpt = buildExcerpt(it);

    return '<li>' +
        '<div class="post-meta">' +
            '<span class="post-date">' + date + '</span>' +
            (section ? '<span class="post-section">' + section + '</span>' : '') +
        '</div>' +
        '<a class="post-title" href="' + it.link + '" target="_blank" rel="noopener">' +
            escapeHtml(it.title) +
        '</a>' +
        (excerpt ? '<p class="post-excerpt">' + excerpt + '</p>' : '') +
        '<a class="post-readmore" href="' + it.link + '" target="_blank" rel="noopener">' +
            'Read on Substack &rarr;' +
        '</a>' +
    '</li>';
}

/**
 * Substack RSS provides:
 *   - it.description: short summary / subtitle (often the one we want)
 *   - it.content:     full HTML body (fallback if description is empty)
 * We strip HTML, collapse whitespace, and trim to ~EXCERPT_WORD_LIMIT words.
 */
function buildExcerpt(it) {
    const raw = (it.description || it.content || "").trim();
    if (!raw) return "";

    // Strip HTML tags and decode common entities.
    let text = raw
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&rsquo;/g, "\u2019")
        .replace(/&lsquo;/g, "\u2018")
        .replace(/&rdquo;/g, "\u201d")
        .replace(/&ldquo;/g, "\u201c")
        .replace(/&mdash;/g, "\u2014")
        .replace(/&ndash;/g, "\u2013")
        .replace(/\s+/g, " ")
        .trim();

    const words = text.split(" ");
    if (words.length <= EXCERPT_WORD_LIMIT) return escapeHtml(text);
    return escapeHtml(words.slice(0, EXCERPT_WORD_LIMIT).join(" ")) + "\u2026";
}

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
        return "";
    }
}

// If you tag posts with sections in Substack, surface them here.
function inferSection(item) {
    const cats = (item.categories || []).map(function (c) { return c.toLowerCase(); });
    if (cats.some(function (c) { return c.includes("dad") || c.includes("baby"); })) return "Dad Notes";
    if (cats.some(function (c) { return c.includes("rumin") || c.includes("life"); })) return "Ruminations";
    if (cats.some(function (c) { return c.includes("cloud") || c.includes("operator"); })) return "Cloud Operator";
    return "";
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
