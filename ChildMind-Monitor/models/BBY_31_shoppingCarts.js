const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    therapist: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    timeLength: {
        type: String,
        enum: ["freePlan", "monthPlan", "threeMonthPlan", "yearPlan"],
        required: true,
        default: "freePlan"
    },
    status: {
        type: String,
        enum: ["completed", "active", "deleted", "refunded"],
        required: true
    },
    cost: {
        type: String
    },
    expiringTime: {
        type: Date
    },
    purchased: {
        type: Date
    }
}, { versionKey: false });

const Cart = mongoose.model('shoppingCart', cartSchema);
module.exports = Cart;

