const { Users } = require("../models/usersModel");
const { Terrains } = require("../models/terrainsModel");

const syncMiddleware = {
  synchronizeBanks: async (req, res, next) => {
    try {
      const userID = req.user.userId;

      const user = await Users.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const terrain = await Terrains.findOne({ userID });
      if (!terrain) {
        console.log("terrain pas trouvé");
        next();
        return;
      }

      const last_sync = terrain.last_sync;
      const actualDate = new Date();

      const differenceInMilliseconds = actualDate - last_sync;

      const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

      // Si plus de 10 minutes d'écart on ne sauvegarde pas
      if(differenceInSeconds > 60*10){
        terrain.last_sync = actualDate;
        terrain.markModified("last_sync");
        await terrain.save();
        next();
        return;
      }

      const energyPerSeconde = terrain.rates.energy.production - terrain.rates.energy.consommation;
      const moneyPerSeconde = terrain.rates.money.production - terrain.rates.money.consommation;

      terrain.banks.energy += energyPerSeconde * differenceInSeconds;
      terrain.banks.money += moneyPerSeconde * differenceInSeconds;
      terrain.last_sync = actualDate;

      terrain.markModified("banks");
      terrain.markModified("last_sync");

      await terrain.save();
      next();
    } catch (error) {
      console.log("Erreur lors de la synchronisation");
    }
  },
};

module.exports = syncMiddleware;
