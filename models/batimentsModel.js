var { Schema, model } = require('mongoose');

const batimentsSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    imageName: { type: String, required: true },
    taille: { type: Object, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    consommation: { type: Number, required: true },
    production: { type: Number, required: true },
    stock: { type: Number, required: true },
},{ versionKey: false });

const Batiments = model("batiments", batimentsSchema);

module.exports = { Batiments };
