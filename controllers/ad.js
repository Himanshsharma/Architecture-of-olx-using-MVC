var express = require('express')
var Router = express.Router()

var bodyParser = require("body-parser")
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var adModel = require("../models/ad")
var messageModel = require("../models/message")

const checkLogIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/')
    }
}

//Ad Routes
Router.get('/:id', (req, res) => {
    adModel.findById(req.params.id, (err, doc) => {
        if (req.session.user) {
            messageModel.find({
                buyerId: req.session.user._id,
                adId: req.params.id
            }, (err2, docs2) => {
                res.render("ad", {
                    user: req.session.user, ad: doc, messages: docs2
                })
            })
        } else {
            res.render("ad", {
                user: req.session.user, ad: doc
            })
        }
    })
})

//saving user message
Router.post("/:id", checkLogIn, urlencodedParser, (req, res) => {
    let newMessage = new messageModel()
    newMessage.buyerId = req.session.user._id
    newMessage.message = req.body.msg
    newMessage.adId = req.params.id
    newMessage.from = "buyer"
    adModel.findOne({ _id: req.params.id }, (err, doc) => {
        newMessage.sellerId = doc.postedBy
        newMessage.save((err) => {
            res.redirect("/ad/" + req.params.id)
        })
    })
})

module.exports = Router