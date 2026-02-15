let currentTickets = [];
let selectedClass = null;

// --- БЛОК ПОДСКАЗОК ГОРОДОВ ---
const popularCities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", 
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону", 
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Тюмень", 
    "Саратов", "Тольятти", "Ижевск", "Барнаул", "Ульяновск", "Иркутск", 
    "Хабаровск", "Махачкала", "Оренбург", "Томск", "Кемерово", "Астрахань",
    "Сочи", "Адлер", "Анапа", "Новороссийск", "Туапсе", "Геленджик", 
    "Краснодар", "Ставрополь", "Кисловодск", "Пятигорск", "Ессентуки", 
    "Минеральные Воды", "Севастополь", "Симферополь", "Феодосия", "Евпатория",
    "Мурманск", "Архангельск", "Петрозаводск", "Вологда", "Череповец", 
    "Псков", "Великий Новгород", "Калининград", "Сыктывкар", "Воркута",
    "Владивосток", "Улан-Удэ", "Чита", "Благовещенск", "Южно-Сахалинск", 
    "Сургут", "Нижневартовск", "Ханты-Мансийск", "Магнитогорск", "Нижний Тагил", 
    "Курган", "Абакан", "Братск", "Находка", "Уссурийск",
    "Ярославль", "Рязань", "Липецк", "Тула", "Курск", "Брянск", "Орел", 
    "Тамбов", "Кострома", "Иваново", "Владимир", "Смоленск", "Калуга", 
    "Пенза", "Саранск", "Киров", "Чебоксары", "Йошкар-Ола", "Белгород",
    "Бологое", "Лиски", "Ртищево", "Грязи", "Барабинск", "Тайшет"
];

function setupSuggestions(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return;

    input.addEventListener('input', () => {
        const val = input.value.trim().toLowerCase();
        container.innerHTML = '';
        if (val.length < 1) { container.style.display = 'none'; return; }

        const filtered = popularCities.filter(city => 
            city.toLowerCase().includes(val)
        ).slice(0, 6);

        if (filtered.length > 0) {
            filtered.forEach(city => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = city;
                item.onclick = () => {
                    input.value = city;
                    container.style.display = 'none';
                };
                container.appendChild(item);
            });
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input) container.style.display = 'none';
    });
}

function transliterate(word) {
    const converter = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z',
        'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ь': '', 'ы': 'y', 'ъ': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return word.toLowerCase().split('').map(char => converter[char] || char).join('').replace(/\s+/g, '-');
}

document.addEventListener('DOMContentLoaded', () => {
    setupSuggestions('from', 'from-suggestions');
    setupSuggestions('to', 'to-suggestions');

   const dateInput = document.getElementById('date');
    if (dateInput) {
        flatpickr(dateInput, {
            "locale": "ru",
            dateFormat: "Y-m-d",
            minDate: "today",
            disableMobile: "true",
            // Берем дату из localStorage для инициализации
            defaultDate: localStorage.getItem('searchDate') || null,
            onChange: function(selectedDates, dateStr) {
                // Сохраняем новую дату, если пользователь её изменил в календаре
                localStorage.setItem('searchDate', dateStr);
                // Если хотите, чтобы поиск запускался сразу после выбора даты, раскомментируйте:
                // findTickets(); 
            }
        });
    }
    
    const savedFrom = localStorage.getItem('searchFrom');
    const savedTo = localStorage.getItem('searchTo');
    const savedDate = localStorage.getItem('searchDate');

    if (savedFrom) document.getElementById('from').value = savedFrom;
    if (savedTo) document.getElementById('to').value = savedTo;
    if (savedDate) document.getElementById('date').value = savedDate;

    if (savedFrom && savedTo && savedDate) findTickets();
});

async function findTickets() {
    const resultsDiv = document.getElementById('results');
    const loader = document.getElementById('loader-overlay'); 
    
    if(!resultsDiv) return;

    const rawFrom = document.getElementById('from').value;
    const rawTo = document.getElementById('to').value;
    const rawDate = document.getElementById('date').value; 

    if (!rawFrom || !rawTo || !rawDate) {
        alert("Пожалуйста, заполните все поля.");
        return;
    }

    const oldCards = resultsDiv.querySelectorAll('.ticket-card, .error-message, .no-results');
    oldCards.forEach(card => card.remove());

    if (loader) loader.style.display = 'flex';

    localStorage.setItem('searchFrom', rawFrom);
    localStorage.setItem('searchTo', rawTo);
    localStorage.setItem('searchDate', rawDate);

    const formattedDate = rawDate.split('-').reverse().join('.'); 
    const data = {
        departure: transliterate(rawFrom),
        arrival: transliterate(rawTo),
        date: formattedDate
    };

    try {
        const response = await fetch('https://fatapi-zw3o.onrender.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Ошибка сети');
        
        currentTickets = await response.json();
        
        if (currentTickets.length === 0) {
            resultsDiv.insertAdjacentHTML('beforeend', '<p class="no-results" style="text-align:center; padding:20px;">Билетов не найдено.</p>');
        } else {
            applySortAndRender();
        }

    } catch (error) {
        resultsDiv.insertAdjacentHTML('beforeend', '<p class="error-message" style="color:red; text-align:center; padding:20px;">Ошибка при подключении к серверу.</p>');
    } finally {
        if (loader) {
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }
    }
}

function applySortAndRender() {
    const sortSelect = document.getElementById('sortTickets');
    if (!sortSelect || currentTickets.length === 0) return;
    
    const sortType = sortSelect.value;
    let sorted = [...currentTickets];
    
    sorted.sort((a, b) => {
        const priceA = (a.price === "Н/Д" || !a.price) ? 0 : parseInt(a.price);
        const priceB = (b.price === "Н/Д" || !b.price) ? 0 : parseInt(b.price);
        if (sortType === 'cheap') return (priceA || Infinity) - (priceB || Infinity);
        if (sortType === 'expensive') return priceB - priceA;
        return 0;
    });
    
    renderTickets(sorted);
}

function renderTickets(tickets) {
    const resultsDiv = document.getElementById('results');
    const oldCards = resultsDiv.querySelectorAll('.ticket-card, .no-results, .error-message');
    oldCards.forEach(card => card.remove());

    tickets.forEach((t, index) => {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        
        let pricesHtml = '';
        const types = [
            { key: 'Базовый', label: 'Базовый' }, { key: 'Эконом', label: 'Эконом' },
            { key: 'Эконом+', label: 'Эконом+' }, { key: 'Семейный', label: 'Семейный' },
            { key: 'Бистро', label: 'Бистро' }, { key: 'Бизнес', label: 'Бизнес' },
            { key: 'Первый', label: 'Первый' }, { key: 'Купе-Сьют', label: 'Сьют' },
            { key: 'Сидячий', label: 'Сидячий' }, { key: 'Плацкарт', label: 'Плацкарт' },
            { key: 'Купе', label: 'Купе' }, { key: 'СВ', label: 'СВ' },
            { key: 'Люкс', label: 'Люкс' }
        ];

        types.forEach(type => {
            const info = t.prices_all[type.key];
            if (info && typeof info === 'object' && info.price !== '—') {
                const formattedPrice = Math.floor(Number(info.price)).toLocaleString('ru-RU');
                
                pricesHtml += `
                    <div class="price-item" onclick="selectVagon(this, '${type.label}', '${info.price}', ${index})">
                        <div class="price-row-main">
                            <span class="p-label">${type.label}</span>
                            <span class="p-seats">мест: ${info.seats}</span>
                        </div>
                        <div class="p-price-block">
                            <span class="p-value">${formattedPrice} ₽</span>
                        </div>
                    </div>`;
            }
        });

        card.innerHTML = `
            <div class="ticket-grid">
                <div class="ticket-main-info">
                    <div class="train-header">
                        <div class="train-number">Поезд ${t.train}</div>
                        <div class="train-route-text" style="color: #007bff; font-size: 0.9em; margin-top: 5px; cursor: default;">
                            ${t.route}
                        </div>
                    </div>
                    
                    <div class="path-visualization">
                        <div class="time-point">
                            <span class="t-time">${t.departure_time}</span>
                            <div class="location-details">
                                <div class="t-city">${t.dep_city}</div>
                                ${t.dep_station ? `<div class="t-station">${t.dep_station}</div>` : ''}
                            </div>
                        </div>

                        <div class="path-line-wrapper">
                            <div class="path-line"></div>
                            <i class="fas fa-train"></i>
                        </div>

                        <div class="time-point">
                            <span class="t-time">${t.arrival_time}</span>
                            <div class="location-details">
                                <div class="t-city">${t.arr_city}</div>
                                ${t.arr_station ? `<div class="t-station">${t.arr_station}</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ticket-price-side">
                    <div class="price-list" id="price-list-${index}">
                        ${pricesHtml || '<div class="no-seats">Мест нет</div>'}
                    </div>
                    <div class="action-area">
                         <button class="btn-buy" onclick="openBookingModal(${index})">Оформить</button>
                    </div>
                </div>
            </div>`;
        resultsDiv.appendChild(card);
    });
}

function selectVagon(element, label, price, ticketIndex) {
    const parent = document.getElementById(`price-list-${ticketIndex}`);
    if (!parent) return;
    parent.querySelectorAll('.price-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    
    // Сохраняем полный маршрут из объекта билета
    selectedClass = { 
        label, 
        price, 
        train: currentTickets[ticketIndex].train, 
        route: currentTickets[ticketIndex].route // Берем полный маршрут t.route
    };
}

function openBookingModal(index) {
    if (!selectedClass || selectedClass.train !== currentTickets[index].train) {
        alert("Пожалуйста, сначала выберите тип вагона (кликните на цену)");
        return;
    }

    const modal = document.getElementById('bookingModal');
    const infoDiv = document.getElementById('modalTicketInfo');
    
    if (!modal) return;

    const ticket = currentTickets[index];
    const modalFormattedPrice = Math.floor(Number(selectedClass.price)).toLocaleString('ru-RU');
    
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="modal-summary" style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                <p><strong>Поезд:</strong> ${ticket.train}</p>
                <p><strong>Маршрут:</strong> ${ticket.route}</p>
                <p><strong>Вагон:</strong> ${selectedClass.label}</p>
                <p style="color: #333; font-size: 1.2em;"><strong>К оплате:</strong> ${modalFormattedPrice} ₽</p>
            </div>
        `;
    }

    const userJson = localStorage.getItem('user');
    if (userJson) {
        const userData = JSON.parse(userJson);
        const fioInput = document.getElementById('pass-fio');
        const emailInput = document.getElementById('pass-email');
        if (fioInput) fioInput.value = `${userData.last_name || ''} ${userData.name || ''}`.trim();
        if (emailInput) emailInput.value = userData.email || '';
    }

    modal.style.display = "flex";
}

// Функция для закрытия окна бронирования
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

// ЕДИНАЯ ФУНКЦИЯ БРОНИРОВАНИЯ
async function confirmBooking(event) {
    event.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const searchTo = localStorage.getItem('searchTo') || "Не указано";
    const searchDate = localStorage.getItem('searchDate');

    // Получаем элементы и проверяем их наличие перед чтением .value
    const fioElem = document.getElementById('pass-fio');
    const emailElem = document.getElementById('pass-email');
    const docElemSeries = document.getElementById('pass-series');
    const docElemNumber = document.getElementById('pass-doc');

    const bookingData = {
        user_id: user ? user.id : null,
        destination: searchTo,
        departure_date: searchDate,
        train_number: selectedClass.train,
        carriage_type: selectedClass.label,
        price: Number(selectedClass.price),
        email: emailElem ? emailElem.value : null,
        passenger_fio: fioElem ? fioElem.value : null,
        passport_serias: docElemSeries ? docElemSeries.value : null,
        passport_number: docElemNumber ? docElemNumber.value : null,
        route: selectedClass.route
    };

    const submitBtn = event.target.querySelector('button');
    if (submitBtn) {
        submitBtn.innerText = "Оформление...";
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch('https://fatapi-zw3o.onrender.com/send-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            alert(`Успешно! Билет забронирован и отправлен на почту.`);
            closeModal('bookingModal');
        } else {
            const errorData = await response.json();
            alert("Ошибка сервера: " + (errorData.detail || "Не удалось сохранить"));
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при подключении к серверу.");
    } finally {
        if (submitBtn) {
            submitBtn.innerText = "Оплатить и получить билет";
            submitBtn.disabled = false;
        }
    }
}



// Добавьте в конец файла search.js
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
});

// Закрытие по клавише ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'flex' || modal.style.display === 'block') {
                modal.style.display = "none";
            }
        });
    }
});