document.addEventListener('DOMContentLoaded', function() {
    loadUserTickets();
    
    // Используем делегирование событий
    const ticketsList = document.getElementById('ticketsList');
    if (ticketsList) {
        ticketsList.addEventListener('click', function(event) {
            const button = event.target.closest('.download-btn-dynamic');
            
            if (button) {
                event.preventDefault();
                event.stopPropagation();
                
                const ticketId = button.getAttribute('data-id');
                if (ticketId) {
                    downloadTicket(ticketId);
                }
            }
        });
    }
});

async function loadUserTickets() {
    const ticketsList = document.getElementById('ticketsList');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || !userData.id) {
        ticketsList.innerHTML = '<div class="no-tickets"><h3>Пожалуйста, войдите в систему</h3></div>';
        return;
    }

    try {
        const response = await fetch(`https://fatapi-zw3o.onrender.com/my-tickets/${userData.id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tickets = await response.json();

        if (tickets.length === 0) {
            ticketsList.innerHTML = '<p style="text-align:center; padding: 20px;">У вас пока нет купленных билетов.</p>';
            return;
        }

        ticketsList.innerHTML = ''; 

        tickets.forEach(ticket => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'ticket-card';
            ticketCard.style = "background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-left: 5px solid #1a237e;";

            ticketCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; color: #1a237e;">${ticket.destination}</h3>
                        <p style="margin: 5px 0; color: #666;">
                            <i class="fas fa-calendar-alt"></i> ${ticket.departure_date} | 
                            <i class="fas fa-train"></i> №${ticket.train_number}
                        </p>
                        <p style="margin: 5px 0; font-size: 0.9em;">Тип вагона: <strong>${ticket.carriage_type}</strong></p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.2em; font-weight: bold; color: #2c3e50;">${ticket.price} ₽</span>
                        <div style="color: green; font-size: 0.8em; margin-top: 5px;"><i class="fas fa-check-circle"></i> Оплачено</div>
                        
                        <button type="button" class="download-btn-dynamic" 
                            data-id="${ticket.id}"
                            style="margin-top:10px;padding:6px 12px;
                                   background:#1a237e;color:white;
                                   border:none;border-radius:6px;cursor:pointer;">
                            Скачать билет
                        </button>   
                    </div>
                </div>
            `;
            
            ticketsList.appendChild(ticketCard);
        });

    } catch (error) {
        console.error('Ошибка загрузки билетов:', error);
        ticketsList.innerHTML = '<p style="text-align:center; padding: 20px; color: red;">Не удалось загрузить билеты. Попробуйте позже.</p>';
    }
}

// Исправленная функция скачивания билета
function downloadTicket(ticketId) {
    console.log("Скачивание билета ID:", ticketId);
    
    // Простой способ - открыть ссылку в новом окне
    window.open(`https://fatapi-zw3o.onrender.com/download-ticket/${ticketId}`, '_blank');
    
    // ИЛИ более сложный способ с fetch (раскомментируйте если нужен)
    /*
    fetch(`https://fatapi-zw3o.onrender.com/download-ticket/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Создаем ссылку на blob объект
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket_${ticketId}.pdf`;
            
            // Добавляем, кликаем, удаляем
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Очищаем URL объект
            window.URL.revokeObjectURL(url);
            
            console.log("Билет успешно скачан");
        })
        .catch(error => {
            console.error('Ошибка при скачивании:', error);
            alert('Не удалось скачать билет. Попробуйте позже.');
        });
    */
}

// Альтернативный простой способ без fetch
function downloadTicketSimple(ticketId) {
    // Создаем невидимую ссылку
    const link = document.createElement('a');
    link.href = `https://fatapi-zw3o.onrender.com/download-ticket/${ticketId}`;
    link.target = '_blank';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}