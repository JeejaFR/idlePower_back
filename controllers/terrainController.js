const { Users } = require("../models/usersModel");
const { Terrains } = require("../models/terrainsModel.js");
const { Batiments } = require("../models/batimentsModel.js");

const { generateInitialGrid } = require('../utils/terrainGeneration.js');

const generateTerrain = (userID) => {
  const gridSize = 20;
  const seed = 3843473;
  const grid = generateInitialGrid(gridSize, seed);

  return { userID, grid };
};

const canPlaceBatiment = (grid, x, y, batiment) => {
  const defaultAltitude = grid[x][y].altitude;

  for (let i = 0; i < batiment.taille.x; i++) {
    for (let j = 0; j < batiment.taille.y; j++) {
      const targetX = x - i;
      const targetY = y - j;

      const isOutOfMap = targetX < 0 || targetX >= grid.length || targetY < 0 || targetY >= grid[targetX].length;

      if(isOutOfMap){
        return false;
      }

      const currentAltitude = grid[targetX][targetY].altitude;
      const hasBuilding = grid[targetX][targetY].hasBuilding;
      const hasDifferentAltitude = defaultAltitude != currentAltitude;

      if (hasBuilding || hasDifferentAltitude) {
        return false;
      }
    }
  }
  return true;
};

const terrainController = {
  getTerrain: async (req, res) => {
    try {
      const userID = req.user.userId;

      const user = await Users.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const terrain = await Terrains.findOneAndUpdate(
        { userID },
        { $setOnInsert: generateTerrain(userID) },
        { new: true, upsert: true }
      );

      res.json(terrain);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération ou génération du terrain' });
    }
  },
  placeBatiment: async (req, res) => {
    try {
      const userID = req.user.userId;
      const batimentID = req.body.batimentID;
      // const batimentID = "6712a458f6fb6b1faec71787";

      const x = req.body.positionX;
      const y = req.body.positionY;

      console.log("x: "+x);
      console.log("y: "+y);


      const user = await Users.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const terrain = await Terrains.findOne({userID});
      if (!terrain) {
        return res.status(404).json({ message: "Terrain non trouvé" });
      }

      const batiment = await Batiments.findById(batimentID);

      if (!batiment) {
        return res.status(404).json({ message: "Batiment non trouvé" });
      }

      if (!canPlaceBatiment(terrain.grid, x, y, batiment)) {
        return res.status(403).json({ message: "Vous ne pouvez pas placer de batiment ici" });
      }
  
      const updatedTerrain = [...terrain.grid];
  
      for (let i = 0; i < batiment.taille.x; i++) {
        for (let j = 0; j < batiment.taille.y; j++) {
          const targetX = x - i;
          const targetY = y - j;
  
          if (targetX >= 0 && targetX < updatedTerrain.length && targetY >= 0 && targetY < updatedTerrain[targetX].length) {
            updatedTerrain[targetX] = [...updatedTerrain[targetX]];
  
            updatedTerrain[targetX][targetY] = {
              ...updatedTerrain[targetX][targetY],
              hasBuilding: true,
              batiment: i === 0 && j === 0 ? batiment : null,
            };
          }
        }
      }

      terrain.grid = updatedTerrain;
      await terrain.save();
  
      res.json(updatedTerrain[x][y]);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du placement du batiment' });
    }
  },
};

module.exports = terrainController;
