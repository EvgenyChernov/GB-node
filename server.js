#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length; // Получаем количество CPU

// Функция для рендеринга HTML страницы
function renderHtml(response, content) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(content);
    response.end();
}

// Функция для показа содержимого директории
function showDirectory(response, directoryPath) {
    console.log(`Чтение директории: ${directoryPath}`);
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error(`Ошибка при чтении директории: ${err.message}`);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.write('Ошибка при чтении директории');
            response.end();
            return;
        }

        let content = `<h1>Содержимое директории ${directoryPath}</h1><ul>`;
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                content += `<li><a href="?path=${encodeURIComponent(filePath)}">${file}/</a></li>`;
            } else {
                content += `<li><a href="?file=${encodeURIComponent(filePath)}">${file}</a></li>`;
            }
        });
        content += '</ul>';

        renderHtml(response, content);
    });
}

// Функция для показа содержимого файла
function showFile(response, filePath) {
    console.log(`Чтение файла: ${filePath}`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Ошибка при чтении файла: ${err.message}`);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.write('Ошибка при чтении файла');
            response.end();
            return;
        }

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write(data);
        response.end();
    });
}

if (cluster.isMaster) { // Если текущий процесс является главным (master)
    console.log(`Главный процесс ${process.pid} запущен`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork(); // Создаем воркеры для каждого CPU
    }

    cluster.on('exit', (worker, code, signal) => { // Когда воркер завершает работу
        console.log(`Воркер ${worker.process.pid} завершился. Перезапуск...`);
        cluster.fork(); // Перезапускаем воркер
    });
} else { // Если текущий процесс является воркером
    const server = http.createServer((request, response) => { // Создаем HTTP-сервер
        const queryObject = url.parse(request.url, true).query;
        console.log(`Запрос получен: ${request.url}`);

        if (request.method === 'GET') { // Обработка GET-запросов
            if (queryObject.path) {
                showDirectory(response, queryObject.path); // Показать содержимое директории
            } else if (queryObject.file) {
                showFile(response, queryObject.file); // Показать содержимое файла
            } else {
                showDirectory(response, __dirname); // Показать содержимое текущей директории
            }
        } else if (request.method === 'POST') { // Обработка POST-запросов
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString(); // Собираем данные POST-запроса
            });
            request.on('end', () => {
                console.log(`Данные POST: ${body}`);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ status: 'success', data: body }));
            });
        } else {
            response.writeHead(405, { 'Content-Type': 'text/plain' });
            response.end('Метод не разрешен');
        }
    });

    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`Воркер ${process.pid} слушает порт ${PORT}`);
    });

    server.on('error', (err) => { // Обработка ошибок сервера
        console.error(`Ошибка сервера: ${err.message}`);
    });
}

/**
 * Последовательность запуска:
 * 1. Запуск скрипта и проверка, является ли процесс главным.
 * 2. В главном процессе (master):
 *    - Создание воркеров с помощью cluster.fork().
 *    - Прослушивание событий выхода воркеров и их перезапуск.
 * 3. В воркерах:
 *    - Создание HTTP-сервера.
 *    - Обработка GET-запросов:
 *      - Вызов showDirectory для отображения содержимого директории.
 *      - Вызов showFile для отображения содержимого файла.
 *    - Обработка POST-запросов:
 *      - Чтение данных из запроса.
 *      - Возврат данных в формате JSON.
 *    - Обработка других методов с возвращением статуса 405.
 * 4. Функция showDirectory:
 *    - Чтение содержимого указанной директории.
 *    - Формирование HTML-контента для списка файлов и директорий.
 *    - Вызов функции renderHtml для отправки ответа.
 * 5. Функция showFile:
 *    - Чтение содержимого указанного файла.
 *    - Отправка содержимого файла в ответ.
 * 6. Функция renderHtml:
 *    - Формирование и отправка HTML-ответа клиенту.
 */
