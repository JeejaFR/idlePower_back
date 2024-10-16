var { Schema, model } = require('mongoose');
var bcrypt = require('bcryptjs');

const usersSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    roles: { type: Array, required: false},
    password: { type: String, required: true},
    friends: { type: Array, required: false},
    image: { type: String, required: false},
},{ versionKey: false });

usersSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const Users = model("users", usersSchema);

module.exports = { Users };
