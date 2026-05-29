/**
 * writing.js — pulls the latest posts from a Substack publication's RSS feed.
 *
 * Substack exposes /feed at every publication URL.
 * Browsers can't fetch arbitrary RSS directly due to CORS, so we use a small
 * public CORS-friendly proxy (rss2json.com) to convert RSS to JSON.
 *
 * If you'd rather not rely on a third-party proxy, alternatives:
 *   1. Run your own Cloudflare Worker that fetches the feed and adds CORS headers.
 *   2. Build the post list manually and update writing.html when you publish.
 */
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
            mount.innerHTML = items.map(function (it) {
                const date = formatDate(it.pubDate);
                const section = inferSection(it);
                return '<li>' +
                    '<span class="post-date">' + date + '</span>' +
                    '<a class="post-title" href="' + it.link + '" target="_blank" rel="noopener">' +
                        escapeHtml(it.title) +
                    '</a>' +
                    (section ? '<span class="post-section">' + section + '</span>' : '') +
                '</li>';
            }).join("");
        })
        .catch(function () {
            mount.innerHTML =
                '<li><em>Couldn\'t load the feed right now. ' +
                '<a href="' + substackUrl + '" target="_blank" rel="noopener">Visit Substack &rarr;</a></em></li>';
        });
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
// rss2json returns categories as `it.categories`. Map your section names to short labels.
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
