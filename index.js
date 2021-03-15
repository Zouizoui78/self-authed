process.chdir(__dirname)

const fs = require('fs');
const crypto = require("crypto");
const express = require('express');

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");
const session = require('express-session');

const port = 24080;

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

function generateToken(length)
{
    return crypto.randomBytes(length).toString('hex');
}

function getSubdomainFromUrl(url)
{
    if (!url)
    {
        console.error("Origin unknown: '" + url + "' try adding Origin in http headers");
        return null;
    }
    var split = url.split('.');
    if (!split || !split[0])
    {
        console.error("Origin unknown: '" + url + "' try adding Origin in http headers");
        return null;
    }
    var regex = /:\/\/([^\/]+)/.exec(split[0]);
    if (regex == null)
        return split[0];
    console.log('regex', regex);
    var subdomain = regex[1];
    return subdomain;
}

function getServiceFromRequest(req)
{
    let origin = req.headers.origin;
    if (origin == undefined)
        origin = req.headers.referer;
    return getSubdomainFromUrl(origin);
}

function validateSession(req)
{
    var user = req.session != undefined ? users[req.session.user] : undefined;
    if (user != undefined)
    {
        console.log("Found session for : " + user.username);
        var service = getServiceFromRequest(req);
        if (service != undefined && service != null)
        {
            console.log(user.username + " requests usage of service: " + service);
            if (checkPermissions(user, service))
            {
                console.log("Permision OK : " + user.username + " authenticated");
                return true;
            }
            else
                console.error("User does not have permissions for service " + service);
        }
        else
            console.error("Could not find service in request");
    }
    console.log("No valid session found");
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

/* ************************************************************************* */
/* App */
// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // Forms request body parsing
app.use(bodyParser.json());

// With this middleware enabled everything stored in req.session in saved across requests
app.use(session({
    secret: generateToken(20),
    secure: true, // Require https
    proxy: true, // Trust reverse proxy
    saveUninitialized: false, // true -> deprecated
    resave: false, // true -> deprecated
    cookie: { maxAge: 31 * 24 * 3600 * 1000 } // Cookie validity in milliseconds
}))

// Rendering engine
app.set('view engine', 'pug');

/* ************************************************************************* */
/* Routes */

app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    if (validateCredentials(username, password))
    {
        req.session.user = username;
        res.redirect('/');
    }
    else
        res.redirect('/login');
});

app.get("/logout", function(req, res)
{
    console.log("Log out");
    req.session.destroy(function(err)
    {
        res.redirect('/login');
    })
});

app.get("/login", (req, res) => {
    console.log("Log in");
    console.log(req.headers);
    res.render('login');
});

app.get("/auth", (req, res) => {
    console.log("Authentication");
    if (validateSession(req))
        res.sendStatus(200);
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
    console.log(`App listening on port ${port}`);
});