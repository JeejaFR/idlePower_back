var { Schema, model } = require('mongoose');

const terrainsSchema = new Schema({
    userID: { type: String, required: true, unique: true },
    grid: { type: Array, required: true },
},{ versionKey: false });

const Terrains = model("terrains", terrainsSchema);

module.exports = { Terrains };
