var express = require('express')
var app = express()
app.set("view engine", "ejs")

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chats', { useNewUrlParser: true });

var session = require('express-session')
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 1160000 } }))

var adModel = require("./models/ad")
var adController = require("./controllers/ad")
var userController = require("./controllers/user")

app.get('/', (req, res) => {
    adModel.find({}, (err, docs) => {
        res.render('index', { user: req.session.user, ads: docs })
    })
})

app.use("/ad", adController)
app.use("/user", userController)


app.listen(3000, () => {
    console.log("Server is running")
})