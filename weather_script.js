// קואורדינטות לראשון לציון
const LAT = 31.97;
const LON = 34.81;

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. יצירת המבנה של התחזית (רץ פעם אחת בטעינה)
    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer) {
        forecastContainer.innerHTML = ''; // ניקוי שאריות
        for (let i = 0; i < 7; i++) {
            forecastContainer.innerHTML += `
                <div class="forecast-item">
                    <span class="fc-day">--</span>
                    <span class="material-symbols-outlined fc-icon">cloud</span>
                    <span class="fc-temp">--°</span>
                </div>
            `;
        }
    }

    // 2. פונקציית עדכון מזג אוויר
    async function updateWeather() {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=weathercode,temperature_2m_max&timezone=auto`;
            const response = await fetch(url);
            const data = await response.json();

            // עדכון נוכחי
            document.querySelector('.main-temp').textContent = `${Math.round(data.current_weather.temperature)}°`;
            document.getElementById('main-weather-icon').textContent = getWeatherIcon(data.current_weather.weathercode);

            // עדכון תחזית שבועית
            const daysHe = ["יום א'", "יום ב'", "יום ג'", "יום ד'", "יום ה'", "יום ו'", "שבת"];
            const todayIndex = new Date().getDay();
            const items = document.querySelectorAll('.forecast-item');

            items.forEach((item, i) => {
                const dayName = daysHe[(todayIndex + i) % 7];
                item.querySelector('.fc-day').textContent = (i === 0) ? "היום" : dayName;
                item.querySelector('.fc-temp').textContent = `${Math.round(data.daily.temperature_2m_max[i])}°`;
                item.querySelector('.fc-icon').textContent = getWeatherIcon(data.daily.weathercode[i]);
            });

        } catch (error) {
            console.error("שגיאה בעדכון מזג האוויר:", error);
        }
    }

    function getWeatherIcon(code) {
        if (code === 0) return 'wb_sunny';
        if (code <= 3) return 'partly_cloudy_day';
        if (code >= 51 && code <= 67) return 'rainy';
        if (code >= 95) return 'thunderstorm';
        return 'cloud';
    }

    function updateClock() {
        const now = new Date();
        const timeEl = document.getElementById('time');
        const dateEl = document.getElementById('date');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'});
        if (dateEl) dateEl.textContent = now.toLocaleDateString('he-IL', {weekday: 'long', day: 'numeric', month: 'long'});
    }

    // הפעלה ראשונית
    updateClock();
    updateWeather();
    
    // אינטרוולים
    setInterval(updateClock, 10000); // כל 10 שניות לשעון
    setInterval(updateWeather, 1800000); // כל חצי שעה למזג אוויר
});