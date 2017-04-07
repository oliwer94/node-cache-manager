/*jshint esversion: 6 */

var express = require('express');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var cache = require('persistent-cache');


var mycache = cache({
    //duration: 1000 * 3600 * 24 //one day
    duration: 1000 * 60 * 1 // 1 mins
});
var PORT = process.env.PORT || 4000;
var app = express();

app.use(bodyParser.json());
app.use(cookieParser());


//     TODO: EITHER HERE or ON NGIX - ONLY ALLOW THE IPS OF THE OTHER SERVICES

function updateCacheEntryTTL(token, id) {
    removeUserFromCache(token);
    addUserToCache(token, id);
}

function addUserToCache(token, _userId) {
    mycache.putSync(token, { "_userId": _userId });
}

function removeUserFromCache(token) {
    mycache.deleteSync(token);
}

function getUserFromCache(token) {
    return mycache.getSync(token);
}

//authenticate token 
app.post('/authenticate', (req, res) => {

    var token = req.body.token;
    var value = getUserFromCache(token);
    if (value !== undefined) 
    {
        updateCacheEntryTTL(token,value);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(401);
    }
});

//Delete users/me/logout
app.post('/addUserToCache',  (req, res) => {

    addUserToCache(req.body.token, req.body.id);
    res.sendStatus(200);

});
//Delete users/me/logout
app.post('/removeUserFromCache',  (req, res) => {

    if (getUserFromCache(req.body.token) !== undefined) {

        removeUserFromCache(req.body.token);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }

});
//Delete users/me/logout
app.post('/updateUserInCache',  (req, res) => {

    updateCacheEntryTTL(req.body.token, req.body.id);
    res.sendStatus(200);

});

//return userId
app.post('/getUserFromCache',  (req, res) => {

    var _userId = getUserFromCache(req.body.token);
    res.status(200).send(_userId);
});


app.listen(PORT, () => {
    console.log("Started on port ", PORT);
});

module.exports = { app };





