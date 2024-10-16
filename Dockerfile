# Utiliser l'image officielle de Node.js
FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port sur lequel l'application écoute
EXPOSE 3001

# Commande pour démarrer l'application
CMD ["npx", "nodemon", "app.js"]