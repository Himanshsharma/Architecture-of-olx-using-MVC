const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const messageSchema = new Schema({
    buyerId: ObjectId,
    sellerId: ObjectId,
    from: String,
    message: String,
    adId: ObjectId
})

module.exports = mongoose.model("Message", messageSchema)