#!/usr/bin/env node

// Импортируем необходимые модули
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');

// Создаем экземпляр приложения Express
const app = express();
// Включаем CORS для всех запросов
app.use(cors());

// Обрабатываем GET-запрос к корневому маршруту
app.get('/', (req, res) => {
    // Читаем содержимое текущей директории
    fs.readdir(__dirname, (err, files) => {
        // Если произошла ошибка, отправляем сообщение об ошибке
        if (err) {
            res.status(500).send('Ошибка при чтении директории');
            return;
        }

        // Создаем HTML-контент для отображения списка файлов и директорий
        let content = `<h1>Содержимое директории ${__dirname}</h1><ul>`;
        files.forEach(file => {
            const filePath = path.join(__dirname, file);
            // Если это директория, добавляем соответствующую ссылку
            if (fs.lstatSync(filePath).isDirectory()) {
                content += `<li><a href="?path=${encodeURIComponent(filePath)}">${file}/</a></li>`;
            } else {
                // Если это файл, добавляем ссылку на файл
                content += `<li><a href="?file=${encodeURIComponent(filePath)}">${file}</a></li>`;
            }
        });
        content += '</ul>';
        // Отправляем HTML-контент в ответ на запрос
        res.send(content);
    });
});

// Создаем HTTP-сервер на базе приложения Express
const server = http.createServer(app);
// Подключаем Socket.IO к серверу и настраиваем CORS
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Инициализируем счетчик посетителей
let visitorCount = 0;

// Обрабатываем событие подключения нового клиента
io.on('connection', (socket) => {
    // Генерируем уникальное имя пользователя
    const userName = `User${Math.floor(Math.random() * 1000)}`;
    // Увеличиваем счетчик посетителей
    visitorCount++;
    // Отправляем всем клиентам обновленное количество посетителей
    io.emit('VISITOR_COUNT', { count: visitorCount });

    // Уведомляем остальных клиентов о новом подключении
    socket.broadcast.emit('NEW_CONN_EVENT', { msg: `${userName} подключился` });

    // Обрабатываем событие отключения клиента
    socket.on('disconnect', () => {
        // Уменьшаем счетчик посетителей
        visitorCount--;
        // Отправляем всем клиентам обновленное количество посетителей
        io.emit('VISITOR_COUNT', { count: visitorCount });
        // Уведомляем остальных клиентов об отключении
        socket.broadcast.emit('NEW_CONN_EVENT', { msg: `${userName} отключился` });
    });

    // Обрабатываем сообщение от клиента
    socket.on('CLIENT_MSG', (data) => {
        // Отправляем сообщение всем клиентам
        io.emit('SERVER_MSG', { user: userName, msg: data.msg });
    });
});

// Настраиваем сервер на прослушивание порта 3000
server.listen(3000, () => {
    console.log('Сервер слушает порт 3000');
});

// Обрабатываем ошибки сервера
server.on('error', (err) => {
    console.error(`Ошибка сервера: ${err.message}`);
});

/**
 * Последовательность запуска:
 * 1. Запуск скрипта и создание HTTP-сервера на базе Express.
 * 2. Настройка CORS для всех запросов.
 * 3. Обработка GET-запросов:
 *    - Чтение содержимого текущей директории.
 *    - Формирование HTML-контента для списка файлов и директорий.
 *    - Отправка HTML-контента в ответ.
 * 4. Создание экземпляра Socket.IO для обработки WebSocket-соединений.
 * 5. Обработка событий подключения и отключения WebSocket-клиентов:
 *    - Увеличение/уменьшение счетчика посетителей.
 *    - Отправка обновленного количества посетителей всем клиентам.
 *    - Уведомление остальных клиентов о подключении/отключении пользователя.
 *    - Обработка сообщений от клиентов и их рассылка всем подключенным клиентам.
 * 6. Запуск сервера на прослушивание порта 3000.
 * 7. Обработка ошибок сервера.
 */
