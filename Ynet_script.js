/**
 * פונקציה למשיכת נתונים באמצעות פרוקסי חלופי (AllOrigins)
 * הפרוקסי הזה הרבה יותר אמין לעדכונים בזמן אמת
 */
async function fetchYnetNews() {
    const statusMsg = document.getElementById('status-msg');
    const RSS_URL = "https://www.ynet.co.il/Integration/StoryRss1854.xml";
    
    // שימוש בפרוקסי AllOrigins שמביא את המידע גולמי ללא Cache
    const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_URL)}&_=` + new Date().getTime();

    try {
        const response = await fetch(PROXY_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        
        // המרת הטקסט הגולמי ל-XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, "text/xml");
        const items = Array.from(xmlDoc.querySelectorAll("item"));

        if (items.length > 0) {
            renderTicker(items);
            if (statusMsg) statusMsg.style.display = 'none';
        } else {
            throw new Error("No items found");
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        if (statusMsg) statusMsg.textContent = "שגיאה בטעינה...";
    }
}

/**
 * עיבוד הנתונים מה-XML והזרקה ל-DOM
 */
function renderTicker(items) {
    const ticker = document.getElementById('ticker');
    if (!ticker) return;

    const newsHtml = items.slice(0, 15).map(item => {
        const title = item.querySelector("title").textContent;
        const link = item.querySelector("link").textContent;
        const pubDateStr = item.querySelector("pubDate").textContent;

        // טיפול ידני בשעה כדי למנוע סטיות UTC
        const date = new Date(pubDateStr);
        
        // יצירת פורמט HH:mm מקומי לישראל
        const timeStr = date.toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jerusalem'
        });

        return `
            <a href="${link}" target="_blank" class="ticker-item">
                <span class="ticker-time">${timeStr}</span>
                <span class="ticker-title">${title}</span>
            </a>
            <span class="separator">•</span>
        `;
    }).join('');

    ticker.innerHTML = newsHtml + newsHtml;
}

// הפעלה
document.addEventListener('DOMContentLoaded', () => {
    fetchYnetNews();
    setInterval(fetchYnetNews, 3 * 60 * 1000); // רענון כל 3 דקות
});