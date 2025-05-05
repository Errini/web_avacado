const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require("mongoose-unique-validator"); // Import validator

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    imagePath: { type: String } // Campo para caminho da imagem adicionado
});

userSchema.plugin(mongooseUniqueValidator); // Apply the unique validator plugin

module.exports = mongoose.model("User", userSchema);

