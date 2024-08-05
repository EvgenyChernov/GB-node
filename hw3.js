const fs = require('fs'); // Подключаем модуль 'fs' для работы с файловой системой
const readline = require('readline'); // Подключаем модуль 'readline' для построчного чтения файла

// Указываем IP-адреса для поиска
const ipAddresses = ['89.123.1.41', '34.48.240.111'];

// Создаем потоки записи для каждого IP-адреса
const outputStreams = ipAddresses.reduce((acc, ip) => {
    acc[ip] = fs.createWriteStream(`${ip}_requests.log`, { flags: 'a' }); // Создаем поток записи в файл с именем '%ip-адрес%_requests.log'
    return acc;
}, {});

// Функция для обработки строки лога
function processLine(line) {
    ipAddresses.forEach(ip => {
        if (line.includes(ip)) { // Проверяем, содержит ли строка один из IP-адресов
            outputStreams[ip].write(line + '\n'); // Если содержит, записываем строку в соответствующий файл
        }
    });
}

// Читаем файл построчно
const fileStream = fs.createReadStream('./data/access_tmp.log.txt'); // Создаем поток чтения из файла
const rl = readline.createInterface({
    input: fileStream, // Устанавливаем поток чтения в качестве источника данных для readline
    crlfDelay: Infinity // Настраиваем задержку для корректного распознавания строк
});

// Обработка каждой строки лога
rl.on('line', (line) => {
    processLine(line); // Вызываем функцию обработки строки для каждой прочитанной строки
});

// Закрытие потоков записи после завершения чтения файла
rl.on('close', () => {
    console.log('Файл обработан.'); // Выводим сообщение о завершении обработки файла
    ipAddresses.forEach(ip => {
        outputStreams[ip].end(); // Закрываем все потоки записи
    });
});

// Обработка ошибок чтения файла
fileStream.on('error', (err) => {
    console.error(`Ошибка чтения файла: ${err.message}`); // Выводим сообщение об ошибке, если возникла проблема с чтением файла
});
