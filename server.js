/*jshint esversion: 6 */
var express = require('express');
var bodyParser = require('body-parser');
var cache = require('persistent-cache');

var mycache = cache({
    //duration: 1000 * 3600 * 24 //one day
    duration: 1000 * 3600 * 3 // 3 hour
});
var PORT = process.env.PORT || 4000;
var app = express();

app.use(bodyParser.json());

function updateCacheEntryTTL(token, id) {
    /* removeUserFromCache(token);
     addUserToCache(token, id);*/
    console.log("before delete", mycache.getSync(token));
    mycache.deleteSync(token);
    console.log("after delete", mycache.getSync(token));
    mycache.putSync(token, { "_userId": id });
    console.log("put", mycache.getSync(token));
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
    var value = mycache.getSync(token);
    if (value !== undefined) {
        updateCacheEntryTTL(token, value._userId);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(401);
    }
});

//Delete users/me/logout
app.post('/addUserToCache', (req, res) => {

    addUserToCache(req.body.token, req.body.id);
    res.sendStatus(200);

});

//Delete users/me/logout
app.post('/removeUserFromCache', (req, res) => {

    if (getUserFromCache(req.body.token) !== undefined) {

        removeUserFromCache(req.body.token);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }

});

//Delete users/me/logout
app.post('/updateUserInCache', (req, res) => {

    updateCacheEntryTTL(req.body.token, req.body.id);
    res.sendStatus(200);

});

//return userId
app.post('/getUserFromCache', (req, res) => {

    var _userId = getUserFromCache(req.body.token);
    res.status(200).send(_userId);
});

app.get('/ping', (req, res) => {
    res.send("cache service is up and running");
});

app.get('/showAll', (req, res) => {
    var keys = mycache.keysSync();
    var values = [];
    keys.forEach(element => {
        values.push({ element, "v": mycache.getSync(element) });
    })
    res.send(values);
});

app.get('/deleteAll', (req, res) => {
    var keys = mycache.keysSync();
    var values = [];
    keys.forEach(element => {
        mycache.deleteSync(element);
    })
    res.send(values);
});

app.listen(PORT, () => {
    console.log("Started on port ", PORT);
});

module.exports = { app };