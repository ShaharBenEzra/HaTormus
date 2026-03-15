const RSS_URL = "https://www.ynet.co.il/Integration/StoryRss1854.xml";
const PROXY_URL = url =>
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

const STORAGE_KEY = "ynet-news-cache";

async function fetchYnetNews() {

    const statusMsg = document.getElementById("status-msg");

    try {

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(PROXY_URL(RSS_URL), {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error("Network error");

        const data = await response.json();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");

        const items = Array.from(xmlDoc.querySelectorAll("item"));

        if (!items.length) throw new Error("No items");

        const parsedItems = items.slice(0, 15).map(item => {

            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "#";
            const pubDateStr = item.querySelector("pubDate")?.textContent || "";

            const date = new Date(pubDateStr);

            const timeStr = date.toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Jerusalem"
            });

            return { title, link, timeStr };

        });

        renderTicker(parsedItems);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedItems));

        if (statusMsg) statusMsg.style.display = "none";

    } catch (error) {

        console.warn("YNET fetch failed → loading cache");

        const cached = localStorage.getItem(STORAGE_KEY);

        if (cached) {
            renderTicker(JSON.parse(cached));
        }

        if (statusMsg) statusMsg.textContent = "טוען חדשות...";
    }
}

function renderTicker(items) {

    const ticker = document.getElementById("ticker");
    if (!ticker) return;

    const newsHtml = items.map(item => {

        return `
            <a href="${item.link}" target="_blank" class="ticker-item">
                <span class="ticker-time">${item.timeStr}</span>
                <span class="ticker-title">${item.title}</span>
            </a>
            <span class="separator">•</span>
        `;

    }).join("");

    ticker.innerHTML = newsHtml + newsHtml;
}

document.addEventListener("DOMContentLoaded", () => {

    fetchYnetNews();

    setInterval(fetchYnetNews, 10 * 60 * 1000);

});
