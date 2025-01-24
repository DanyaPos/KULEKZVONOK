const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Массив всех подключённых пользователей с именами
let users = []; 

// Обслуживаем статические файлы
app.use(express.static('public'));

// Когда пользователь подключается
io.on('connection', (socket) => {
  console.log('Пользователь подключился: ' + socket.id);

  // Слушаем имя пользователя
  socket.on('set-username', (userName) => {
    users.push({ id: socket.id, name: userName });
    io.emit('update-users', users.map(user => user.name)); // Отправляем всем пользователям обновленный список имен
  });

  // Обработка offer
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  // Обработка answer
  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  // Обработка ICE-кандидатов
  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });

  // Когда пользователь отключается
  socket.on('disconnect', () => {
    console.log('Пользователь отключился: ' + socket.id);
    users = users.filter(user => user.id !== socket.id); // Убираем пользователя из списка
    io.emit('update-users', users.map(user => user.name)); // Отправляем обновленный список
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
