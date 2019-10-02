var express = require('express')
var Router = express.Router()

var bodyParser = require("body-parser")
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var adModel = require("../models/ad")
var messageModel = require("../models/message")
var userModel = require("../models/user")
const _ = require("lodash")

const checkLogIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/')
    }
}

Router.get('/login', (req, res) => {
    res.render('login')
})

Router.post('/login', urlencodedParser, (req, res) => {
    switch (req.body.action) {
        case 'signup':
            userModel.findOne({ email: req.body.email }, function (err, doc) {
                if (err) {
                    console.log(err, 'error')
                    res.redirect('/')
                    return
                }
                if (_.isEmpty(doc)) {
                    let newUser = new userModel();
                    newUser.email = req.body.email;
                    newUser.password = req.body.password;
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err, 'error')
                            return
                        }
                        res.render('login', { message: "Sign Up Successful. Please log in." })
                    });

                } else {
                    res.render('login', { message: "User already exists" })
                }
            })
            break;
        case 'login':
            userModel.findOne({ email: req.body.email, password: req.body.password }, function (err, doc) {
                if (err) {
                    console.log(err, 'error')
                    res.redirect('/')
                    return
                }
                if (_.isEmpty(doc)) {
                    res.render('login', { message: "Please check email/password" })
                } else {
                    req.session.user = doc
                    res.redirect('/user/dashboard')
                }
            })
            break;
    }

})

Router.get('/dashboard', checkLogIn, (req, res) => {
    adModel.find({ postedBy: req.session.user._id }, (err, docs) => {
        res.render('user', { user: req.session.user, ads: docs })
    })
})

Router.post('/dashboard', urlencodedParser, checkLogIn, (req, res) => {
    let newAd = new adModel()
    newAd.name = req.body.name
    newAd.postedBy = req.session.user._id
    newAd.save(function (err) {
        res.redirect("/user/dashboard")
    })
})

Router.get("/ad/:id/chats", (req, res) => {
    messageModel.find({ adId: req.params.id }, (err, docs) => {
        docs = _.groupBy(docs, "buyerId")
        docs = _.map(docs, (value, index) => { return value })
        res.render("chats", { chats: docs })
    })
})

Router.post("/ad/:id/chats", urlencodedParser, (req, res) => {
    let newMessage = new messageModel()
    newMessage.buyerId = req.body.buyerid
    newMessage.message = req.body.message
    newMessage.adId = req.params.id
    newMessage.from = "seller"
    adModel.findOne({ _id: req.params.id }, (err, doc) => {
        newMessage.sellerId = doc.postedBy
        newMessage.save((err) => {
            res.redirect("/user/ad/" + req.params.id + "/chats")
        })
    })
})

Router.get('/logout', checkLogIn, (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

module.exports = Router