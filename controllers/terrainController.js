const { Users } = require("../models/usersModel");
const { generateInitialGrid } = require('../utils/terrainGeneration.js');

const terrainController = {
  generate: async (req, res) => {
    try {
      const userID = req.user;
      const gridSize = 20;
      const seed = 3843473;
      
      const grid = generateInitialGrid(gridSize, seed);

      res.json(grid);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la génération du terrain' });
    }
  },
};

module.exports = terrainController;
