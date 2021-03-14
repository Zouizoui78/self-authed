process.chdir(__dirname)

const fs = require('fs');
const crypto = require("crypto");
const express = require('express');
var session = require("express-session");

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

const port = 3002;

/* ************************************************************************* */
/* Session validation */

function getUserId(id)
{
    for (var key in users)
    {
        if (users.hasOwnProperty(key))
        {
            var element = users[key];
            if (id == element["id"])
                return element;
        }
    }
    return null;
}

function getUserFromCookie(req)
{
    if (req.session.passport)
    {
        // Contains current auth session id
        var userId = req.session.passport.user;
        var element = getUserId(userId);
        return element;
    }
    return null;
}

function checkPermissions(user, service)
{
    var permissions = user["permissions"];
    if (permissions)
    {
        if (permissions == "all")
            return true;
        var lst = permissions.split(',');
        for (var perm in lst)
        {
            if (perm == service)
                return true;
        }
    }
    return false;
}

function getServiceFromRequest(req)
{
    return "all";
}

function validateSession(req)
{
    var user = getUserFromCookie(req);
    if (user != null)
    {
        console.log("User logged in: " + user['username']);
        var service = getServiceFromRequest(req);
        if (service != null)
        {
            console.log("Require usage of service: " + service);
            if (checkPermissions(user, service))
            {
                return true;
            }
            else
                console.error("User does not have permissions for service " + service);
        }
        else
            console.error("Could not find service in request");
    }
    return false;
}

function loadUserFile(path)
{
    let users;
    users = fs.readFileSync(path, {encoding: "utf8"}).split('\n');
    if (users == "")
    {
        console.log("Cannot open user file path: " + path);
        return null;
    }
    ret = {};
    for (line of users)
    {
        if (line != "")
        {
            split = line.split(':');
            if (split.length == 3)
            {
                ret[split[0]] = {
                    username: split[0],
                    password: split[1],
                    permissions: split[2]
                }
            }
            else
            {
                console.log("Failed to parser user line : " + line);
            }
        }
    }
    return ret;
}

/* ************************************************************************* */
/* Users */

let users = loadUserFile("./passwords");
if (users == null)
    return 1;

console.log("Found users:");
console.log(users);

/* ************************************************************************* */
/* App */

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "ureghoelg" }));
app.use(passport.initialize());
app.use(passport.session());

// Rendering engine
app.set('view engine', 'pug');

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
}));

app.get("/logout", function(req, res)
{
    console.log("Login out");
    req.session.destroy(function(err)
    {
        res.redirect('/');
    })
});

app.get("/", (req, res) => {
    if (validateSession(req))
        res.send(200);
    else
        res.render('login');
});

/* ************************************************************************* */
/* Passport secure login */

function validPassword(username, passwordCandidate)
{
    let hash = crypto
        .createHash("sha256")
        .update(passwordCandidate)
        .digest("hex");
    if (users[username]["password"] == hash)
    {
        console.log("Authenticated : " + username);
        return true;
    }
    else
    {
        console.log("Wrong password for " + username);
        return false;
    }
}

passport.use(new LocalStrategy(function(username, password, done)
{
    console.log("Starting authentication of " + username);
    if (users[username] == undefined)
    {
        console.log("Unknown user : " + username);
        return done(null, false, { message: 'Incorrect username.' });
    }
    if (!validPassword(username, password))
    {
        return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, users[username]);
}));


// https://stackoverflow.com/a/27637668
passport.serializeUser(function(user, done)
{
    var id = crypto.randomBytes(100).toString('hex');
    user.id = id;
    return done(null, user.id);
});

passport.deserializeUser(function(id, done)
{
    var element = getUserId(id);
    if (element)
        return done(null, element);
    return done(null, false);
});

/* ************************************************************************* */
/* Start */

console.log("Starting app");
server.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
