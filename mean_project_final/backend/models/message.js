const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Referência ao usuário adicionada
});

module.exports = mongoose.model('Message', messageSchema);

