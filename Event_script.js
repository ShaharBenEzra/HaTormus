async function fetchHebrewHolidays() {
    const container = document.getElementById('holidays-list');
    // כתובת מקוצרת ובדוקה
    const url = 'https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&year=now&month=all&lg=he';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('שגיאת שרת');
        const data = await response.json();
        const now = new Date();
        
        // סינון מועדים עתידיים
        const upcoming = data.items
            .filter(item => new Date(item.date) >= now)
            .slice(0, 5); 

        container.innerHTML = ''; 
        upcoming.forEach(event => {
            const eventDate = new Date(event.date);
            const monthNames = ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יולי", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"];
            
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-date">
                    <span class="day">${eventDate.getDate()}</span>
                    <span class="month">${monthNames[eventDate.getMonth()]}</span>
                </div>
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p>חג/מועד</p>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p style="padding:15px;">שגיאה בטעינת מועדים</p>';
    }
}
document.addEventListener('DOMContentLoaded', fetchHebrewHolidays);