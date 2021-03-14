process.chdir(__dirname)

const fs = require('fs');
const crypto = require("crypto");
const express = require('express');
var session = require("express-session");

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const port = 3002;

/* ************************************************************************* */
/* Session validation */

function checkPermissions(user, service)
{
    var permissions = user.permissions;
    console.log(user.username + " has permission to access " + user.permissions);
    if (permissions)
    {
        if (permissions == "all")
            return true;
        var list = permissions.split(',');
        for (var perm in list)
        {
            if (perm == service)
                return true;
        }
    }
    return false;
}

function generateToken()
{
    return crypto.randomBytes(100).toString('hex');
}

function getServiceFromRequest(req)
{
    return "all";
}

function validateSession(req)
{
    if(req.cookies != undefined)
        var user = tokens[req.cookies.token];
    if (user != undefined)
    {
        console.log("Found session for : " + user.username);
        var service = getServiceFromRequest(req);
        if (service != null)
        {
            console.log(user.username + " requires usage of service: " + service);
            if (checkPermissions(user, service))
            {
                console.log("Permision OK : " + user.username + " logged in");
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
                console.log("Failed to parse user line : " + line);
            }
        }
    }
    return ret;
}

/* ************************************************************************* */
/* Users and tokens */

let users = loadUserFile("./passwords");
if (users == null)
    return 1;

console.log("Found users:");
console.log(users);

tokens = {};

/* ************************************************************************* */
/* App */

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // Forms request body parsing
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));

// Rendering engine
app.set('view engine', 'pug');

/* ************************************************************************* */
/* Routes */
app.post("/login", (req, res) => {
    let { username, password } = req.body;
    if(validateCredentials(username, password))
    {
        const token = generateToken();
        tokens[token] = users[username];
        res.cookie('token', token);
        res.redirect('/');
    }
    else
        res.redirect('/login');
});

app.get("/logout", function(req, res)
{
    console.log("Login out");
    req.session.destroy(function(err)
    {
        res.redirect('/');
    })
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/", (req, res) => {
    if (validateSession(req))
        res.end();
    else
        res.sendStatus(401);
});

/* ************************************************************************* */
/* Passport secure login */

function hashPassword(password)
{
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}

function validateCredentials(username, passwordCandidate)
{
    let hashed = hashPassword(passwordCandidate);
    if(users[username] == undefined)
    {
        console.log("Unknown user " + username);
        return false;
    }
    if (users[username]["password"] == hashed)
    {
        console.log("Valid password for : " + username);
        return true;
    }
    else
    {
        console.log("Wrong password for " + username);
        return false;
    }
}

/* ************************************************************************* */
/* Start */

console.log("Starting app");
server.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
