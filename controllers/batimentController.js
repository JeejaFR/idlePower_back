const { Users } = require("../models/usersModel");
const { Batiments } = require("../models/batimentsModel.js");

const terrainController = {
  getAllBatiments: async (req, res) => {
    try {
      const userID = req.user.userId;

      const user = await Users.findById(userID);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const batiments = await Batiments.find();

      res.json(batiments);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des batiments' });
    }
  },
};

module.exports = terrainController;
