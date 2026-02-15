// Функционал для FAQ
document.addEventListener('DOMContentLoaded', function() {
    // Получаем все элементы FAQ
    const faqItems = document.querySelectorAll('.faq-item');

    // Добавляем обработчик событий для каждого вопроса
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle');

        question.addEventListener('click', () => {
            // Закрываем все остальные открытые вопросы
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Переключаем текущий вопрос
            item.classList.toggle('active');
        });

        // Обработчик для кнопки переключения
        toggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем срабатывание события на родительском элементе

            // Закрываем все остальные открытые вопросы
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Переключаем текущий вопрос
            item.classList.toggle('active');
        });
    });

    // Обработчик формы обратной связи
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Получаем данные формы
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');

            // В реальном приложении здесь был бы код для отправки данных на сервер
            // Для демонстрации просто показываем сообщение об успехе

            // Создаем сообщение об успехе
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.cssText = `
                background: #e8f5e9;
                color: #2e7d32;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
                text-align: center;
                border: 1px solid #c8e6c9;
            `;
            successMessage.textContent = 'Спасибо! Ваше сообщение отправлено. Мы ответим вам в ближайшее время.';

            // Вставляем сообщение после формы
            contactForm.parentNode.insertBefore(successMessage, contactForm.nextSibling);

            // Очищаем форму
            contactForm.reset();

            // Удаляем сообщение через 5 секунд
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }

    // Обработчик поиска в разделе помощи
    const helpSearchInput = document.querySelector('.help-search-input');
    const helpSearchBtn = document.querySelector('.help-search-btn');

    if (helpSearchInput && helpSearchBtn) {
        // Обработчик клика по кнопке поиска
        helpSearchBtn.addEventListener('click', performHelpSearch);

        // Обработчик нажатия Enter в поле поиска
        helpSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performHelpSearch();
            }
        });

        function performHelpSearch() {
            const searchTerm = helpSearchInput.value.trim();

            if (searchTerm) {
                // В реальном приложении здесь был бы код для поиска по базе знаний
                // Для демонстрации просто показываем сообщение
                alert(`Поиск по запросу: "${searchTerm}". Пока ничего нет (мне лень).`);

                // Прокручиваем к разделу FAQ после поиска
                document.querySelector('.faq-section').scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                alert('Пожалуйста, введите поисковый запрос.');
                helpSearchInput.focus();
            }
        }
    }
});