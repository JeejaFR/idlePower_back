var { Schema, model } = require('mongoose');

const terrainsSchema = new Schema({
    userID: { type: String, required: true, unique: true },
    grid: { type: Array, required: true },
    rates : { type: Object, required: true} // default: {energy: {production: 0, consommation: 0}, money: {production: 0, consommation: 0}} },
},{ versionKey: false });

const Terrains = model("terrains", terrainsSchema);

module.exports = { Terrains };
