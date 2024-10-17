const { Users } = require("../models/usersModel");
const { generateInitialGrid } = require('../utils/terrainGeneration');

const terrainController = {
  generate: async (req, res) => {
    try {
      const userID = req.user.userId;
      const gridSize = 20;
      const seed = 1234;

      const grid = generateInitialGrid(gridSize, seed);

      res.json(grid);
    } catch (error) {
      console.log("error: "+error);
      res.status(500).json({ message: 'Erreur lors de la génération du terrain: ' });
    }
  },
};

module.exports = terrainController;
