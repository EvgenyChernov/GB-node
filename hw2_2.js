// Функция для парсинга даты и времени из строки
function parseDateTime(dateTimeStr) {
    // Разделяем строку по дефисам и преобразуем каждую часть в число
    const [hour, day, month, year] = dateTimeStr.split('-').map(Number);
    // Создаем объект Date с указанными параметрами (месяцы в JavaScript начинаются с 0, поэтому month - 1)
    return new Date(year, month - 1, day, hour, 0, 0);
}

// Функция для создания таймера
function createTimer(endTime, index) {
    // Устанавливаем интервал, который будет выполняться каждую секунду (1000 мс)
    const interval = setInterval(() => {
        const now = new Date(); // Получаем текущую дату и время
        const timeLeft = endTime - now; // Вычисляем оставшееся время в миллисекундах

        if (timeLeft <= 0) {
            // Если оставшееся время меньше или равно нулю, таймер завершен
            console.log(`Таймер ${index + 1}: Завершен`);
            clearInterval(interval); // Останавливаем интервал
        } else {
            // Иначе вычисляем оставшиеся часы, минуты и секунды
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            // Выводим оставшееся время в консоль
            console.log(`Таймер ${index + 1}: Осталось ${hours} ч ${minutes} м ${seconds} с`);
        }
    }, 1000); // Интервал срабатывает каждую секунду (1000 мс)
}

// Функция для запуска программы
function startTimers(dates) {
    dates.forEach((dateStr, index) => {
        // Для каждой даты в массиве преобразуем строку в объект Date
        const endTime = parseDateTime(dateStr);
        // Создаем таймер для данной даты
        createTimer(endTime, index);
    });
}

// Получаем аргументы из командной строки и передаем их в startTimers
const args = process.argv.slice(2); // Извлекаем аргументы, начиная с третьего (первые два - node и имя файла)
if (args.length === 0) {
    // Если аргументы не были переданы, выводим сообщение с просьбой ввести даты
    console.log('Пожалуйста, введите даты в формате «час-день-месяц-год» через пробел.');
} else {
    // Если аргументы переданы, запускаем таймеры для введенных дат
    startTimers(args);
}
