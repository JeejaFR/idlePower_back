const { Users } = require("../models/usersModel");
const { Terrains } = require("../models/terrainsModel.js");
const { Batiments } = require("../models/batimentsModel.js");

const { generateInitialGrid } = require("../utils/terrainUtils.js");

const generateTerrain = (userID) => {
  const gridSize = 20;
  const seed = 3843473;
  const grid = generateInitialGrid(gridSize, seed);
  const rates = { energy: { production: 0, consommation: 0 }, money: { production: 0, consommation: 0 } };
  const banks = { energy: 0, money: 10 };
  const last_sync = new Date();
  return { userID, grid, rates, banks, last_sync };
};

const canPlaceBatiment = (grid, x, y, batiment) => {
  const defaultAltitude = grid[x][y].altitude;

  for (let i = 0; i < batiment.taille.x; i++) {
    for (let j = 0; j < batiment.taille.y; j++) {
      const targetX = x - i;
      const targetY = y - j;

      const isOutOfMap = targetX < 0 || targetX >= grid.length || targetY < 0 || targetY >= grid[targetX].length;

      if (isOutOfMap) {
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

      const terrain = await Terrains.findOneAndUpdate({ userID }, { $setOnInsert: generateTerrain(userID) }, { new: true, upsert: true });

      const last_sync = new Date();
      terrain.last_sync = last_sync;
      await terrain.save();

      res.json(terrain);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération ou génération du terrain" });
    }
  },
  placeBatiment: async (req, res) => {
    try {
      const userID = req.user.userId;
      const batimentID = req.body.batimentID;

      const x = req.body.positionX;
      const y = req.body.positionY;

      const user = await Users.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const terrain = await Terrains.findOne({ userID });
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

      const canAffordBatiment = terrain.banks.money >= batiment.price;
      if (!canAffordBatiment) {
        return res.status(403).json({ message: "Vous n'avez pas les fonds nécessaires'" });
      }

      // Créer une copie du batiment et modifier sa propriété isRunning
      const updatedBatiment = { ...batiment.toObject(), isRunning: true };

      // Cloner le terrain
      const updatedTerrain = [...terrain.grid];

      for (let i = 0; i < updatedBatiment.taille.x; i++) {
        for (let j = 0; j < updatedBatiment.taille.y; j++) {
          const targetX = x - i;
          const targetY = y - j;

          if (targetX >= 0 && targetX < updatedTerrain.length && targetY >= 0 && targetY < updatedTerrain[targetX].length) {
            // Cloner la ligne de terrain pour ne pas muter l'original
            updatedTerrain[targetX] = [...updatedTerrain[targetX]];

            // Mettre à jour la case spécifique avec le bâtiment
            updatedTerrain[targetX][targetY] = {
              ...updatedTerrain[targetX][targetY],
              hasBuilding: true,
              batiment: i === 0 && j === 0 ? updatedBatiment : null, // Utiliser le bâtiment modifié seulement pour la première case
            };
          }
        }
      }

      terrain.rates.energy.consommation += batiment.rates.energy.consommation;
      terrain.rates.energy.production += batiment.rates.energy.production;
      terrain.rates.money.consommation += batiment.rates.money.consommation;
      terrain.rates.money.production += batiment.rates.money.production;

      terrain.grid = updatedTerrain;

      terrain.markModified("rates");
      terrain.markModified("grid");

      await terrain.save();

      res.json(updatedTerrain[x][y]);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du placement du batiment: " + error });
    }
  },
};

module.exports = terrainController;
