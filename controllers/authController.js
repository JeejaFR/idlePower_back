const { Users } = require("../models/usersModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Utilisateur déjà existant' });
      }

      // Créer un nouvel utilisateur avec mot de passe hashé
      const newUser = new Users({ username, email, password, 'friends': []});
      await newUser.save();

      // Générer un jeton JWT
      const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

      res.status(201).json({ message: 'Utilisateur créé avec succès', token });
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Trouver l'utilisateur dans la base de données
      const user = await Users.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Générer un jeton JWT
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

      
      res.status(200).json({ message: 'Connexion réussie', token });
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  },
  getUserId: async (req, res) => {
    try {
      const token = req.headers['authorization'];

      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      res.status(200).send(decoded.userId);
    } catch (error) {
      console.error('Erreur lors de la vérification du token :', error);
      res.status(500).send('Erreur lors de la vérification du token :', error)
      throw new Error('Token invalide');
    }
  },
};

module.exports = authController;
