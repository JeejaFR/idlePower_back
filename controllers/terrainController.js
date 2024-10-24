const { Users } = require("../models/usersModel");
const { Terrains } = require("../models/terrainsModel.js");
const { Batiments } = require("../models/batimentsModel.js");

const { generateInitialGrid, updateRessourceRates } = require("../utils/terrainUtils.js");

const generateTerrain = (userID) => {
  const gridSize = 20;
  const seed = 3843473;
  const grid = generateInitialGrid(gridSize, seed);
  const rates = { energy: { production: 0, consommation: 0 }, money: { production: 0, consommation: 0 } };
  const banks = { energy: 0, money: 10, capacity: 0 };
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
              source: {x: x, y: y},
              batiment: i === 0 && j === 0 ? updatedBatiment : null,
            };
          }
        }
      }

      const rates = updateRessourceRates(updatedTerrain);
      terrain.rates.energy.production = rates.energyProductionRate;
      terrain.rates.energy.consommation = rates.energyConsumptionRate;
      terrain.rates.money.production = rates.moneyProductionRate;
      terrain.rates.money.consommation = rates.moneyConsumptionRate;

      terrain.banks.capacity = rates.energyCapacity;


      terrain.grid = updatedTerrain;

      terrain.markModified("rates");
      terrain.markModified("banks");
      terrain.markModified("grid");

      await terrain.save();

      res.status(200).send({rates, energyBanks: terrain.banks.energy});
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du placement du batiment: " + error });
    }
  },
  setBatimentStatus : async (req, res) => {
    try{
      const userID = req.user.userId;
      const isOn = req.body.isOn;
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
      
      const batiment = terrain.grid[x][y].batiment;
      
      if(batiment){
        if(batiment.isRunning!=isOn){
          terrain.grid[x][y].batiment.isRunning = isOn;

          const rates = updateRessourceRates(terrain.grid);
          terrain.rates.energy.production = rates.energyProductionRate;
          terrain.rates.energy.consommation = rates.energyConsumptionRate;
          terrain.rates.money.production = rates.moneyProductionRate;
          terrain.rates.money.consommation = rates.moneyConsumptionRate;
    
          terrain.banks.capacity = rates.energyCapacity;
    
          terrain.markModified("rates");
          terrain.markModified("banks");
          terrain.markModified("grid");
  
          await terrain.save();
          return res.status(201).send("Le status du batiment à été changé");
        }else{
          return res.status(200).send("Aucun changement de status");
        }
      }
      return res.status(404).send("Aucun batiment à cette emplacement");
    }catch(error){
      res.status(500).send("Erreur lors changement de status du batiment: "+error);
    }
  }
};

module.exports = terrainController;
