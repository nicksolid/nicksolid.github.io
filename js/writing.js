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

const EXCERPT_WORD_LIMIT = 150;  // ~6-8 sentences of body prose

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
    const subtitle = (it.description || "").trim();
    const excerptHtml = buildExcerpt(it, subtitle);

    return '<li class="post-card">' +
        '<div class="post-meta">' +
            '<span class="post-date">' + date + '</span>' +
            ' &middot; <span class="post-source">Cloud Operator</span>' +
            ' &middot; <a class="post-source-link" href="' + it.link + '" target="_blank" rel="noopener">' +
                'read on Substack &rarr;' +
            '</a>' +
        '</div>' +
        '<a class="post-title" href="' + it.link + '" target="_blank" rel="noopener">' +
            escapeHtml(it.title) +
        '</a>' +
        (subtitle ? '<div class="post-subtitle">' + escapeHtml(stripHtml(subtitle)) + '</div>' : '') +
        (excerptHtml ? '<div class="post-excerpt">' + excerptHtml + '</div>' : '') +
    '</li>';
}

function stripHtml(s) {
    return String(s)
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
}

/**
 * Substack RSS provides:
 *   - it.description: short summary, almost always just the post subtitle
 *   - it.content:     full HTML body of the post
 * The subtitle alone reads thin (it's the same idea as the title), so we
 * walk the article body and pull out paragraphs and section headings up to
 * EXCERPT_WORD_LIMIT total words, preserving block structure as <p> tags
 * and <p class="excerpt-h"> for section headings (Situation, Complication, etc).
 */
function buildExcerpt(it, subtitle) {
    const body = (it.content || "").trim();
    if (!body) {
        // Last-resort fallback: just use the subtitle if we have nothing else
        return subtitle ? "<p>" + escapeHtml(stripHtml(subtitle)) + "</p>" : "";
    }

    const blocks = extractBlocks(body);
    if (blocks.length === 0) return "";

    // Drop a leading block that just repeats the subtitle (Substack sometimes
    // wraps the subtitle as the first <p> or <h3>).
    const sub = subtitle ? stripHtml(subtitle).slice(0, 30) : "";
    if (sub && blocks[0] && blocks[0].text.indexOf(sub) === 0) {
        blocks.shift();
    }

    // Walk blocks until we hit the word budget.
    let wordsUsed = 0;
    const out = [];
    for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const remaining = EXCERPT_WORD_LIMIT - wordsUsed;
        if (remaining <= 0) break;

        const words = b.text.split(/\s+/);
        if (words.length <= remaining) {
            out.push(b);
            wordsUsed += words.length;
        } else {
            // Truncate this block to the remaining word budget.
            out.push({
                type: b.type,
                text: words.slice(0, remaining).join(" ") + "\u2026",
            });
            wordsUsed = EXCERPT_WORD_LIMIT;
            break;
        }
    }

    return out.map(function (b) {
        if (b.type === "heading") {
            return '<p class="excerpt-heading">' + escapeHtml(b.text) + "</p>";
        }
        return "<p>" + escapeHtml(b.text) + "</p>";
    }).join("");
}

/**
 * Walk an HTML string and extract its block-level elements in order.
 * Returns an array of { type: "para" | "heading", text: "..." }.
 * Anything that isn't <p> or <h1>-<h6> at the top level is ignored.
 */
function extractBlocks(html) {
    // Strip Substack's cover-image figure/picture blocks at the top of the post.
    // These contain attributes like `srcset="..."` that confuse a naive
    // <p>...</p> regex (it can match an attribute value across element boundaries).
    const cleaned = html
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<figure[\s\S]*?<\/figure>/gi, "")
        .replace(/<picture[\s\S]*?<\/picture>/gi, "")
        .replace(/<div[^>]*captioned-image-container[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/a>\s*<\/figure>\s*<\/div>/gi, "")
        // Remove any remaining standalone img / source / source-set tags
        .replace(/<(img|source)\b[^>]*\/?>(?:\s*<\/\1>)?/gi, "");

    const blocks = [];
    const re = /<(p|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = re.exec(cleaned)) !== null) {
        const tag  = m[1].toLowerCase();
        const text = stripHtml(m[2]);
        if (!text) continue;
        blocks.push({
            type: tag.charAt(0) === "h" ? "heading" : "para",
            text: text,
        });
    }
    return blocks;
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
