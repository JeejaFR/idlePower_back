const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

var authRouter = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);

// Utiliser le middleware CORS pour accepter les connexions du frontend
app.use(cors({
  origin: 'http://localhost:3000' // Remplace par l'URL de ton frontend en production
}));

app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
connectDB();

// Créer une instance de Socket.io et la lier au serveur HTTP
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use('/', authRouter);

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  // Exemple d'écoute d'un événement personnalisé 'move'
  socket.on('move', (data) => {
    console.log(`Received move data:`, data);

    // Diffuser l'événement à tous les autres clients connectés
    socket.broadcast.emit('move', data);
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
