const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Chat = mongoose.model('dms', messageSchema);
module.exports = Chat;