process.chdir(__dirname)

const fs = require('fs');
const crypto = require("crypto");
const express = require('express');

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");
const session = require('express-session');

/* ************************************************************************* */
/* Configuration */

function readConfigurationFile(path)
{
    try
    {
        let rawdata = fs.readFileSync(path);
        return JSON.parse(rawdata);
    }
    catch(err)
    {
        console.error(err.message);
        return {};
    }
}

console.log("Loading configuration...");

let configuration = readConfigurationFile('./conf.json');

const port = configuration.port == undefined ? 3002 : configuration.port;
const service_method = configuration.service_method == undefined ? "subdomain" : configuration.service_method;

console.log("Service retrieval from: " + service_method);
if (service_method == "list" && !configuration.services)
{
    console.error("No service list configured !");
    return 1;
}

/* ************************************************************************* */
/* Users and tokens */

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
                console.log("Failed to parse user line: " + line);
            }
        }
    }
    return ret;
}

console.log("Loading user file...");

let users = loadUserFile("./passwords");
if (users == null)
    return 1;

console.log("Found users:");
console.log(users);

/* ************************************************************************* */
/* Session validation */

function checkPermissions(user, service)
{
    var permissions = user.permissions;
    console.log("Permissions for user: '" + user.username + "' -> " + user.permissions);
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

// http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
function getDomainFromUrl(url)
{
    if (!url)
        return "";
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0)
    {
        return match[2];
    }
    return url;
}

function getSubdomainFromUrl(url)
{
    var split = url.split('.');
    if (split.length > 0)
        return split[0];
    return null;
}

function getServiceFromRequest(req)
{
    let origin = req.headers.origin;
    if (origin == undefined)
        origin = req.headers.referer;
    let url = getDomainFromUrl(origin);
    if (!origin || !url)
    {
        console.error("Origin unknown: '" + origin + "' try adding Origin in http headers");
        return null;
    }
    console.log("Origin URL: " + url);
    if (service_method == "subdomain")
        return getSubdomainFromUrl(url);
    else if (service_method == "list")
    {
        if (configuration.services)
            return configuration.services[url];
        console.error("No service list configured !");
    }
}

function validateSession(req)
{
    var user = req.session != undefined ? users[req.session.user] : undefined;
    if (user != undefined)
    {
        console.log("Found session for: " + user.username);
        var service = getServiceFromRequest(req);
        if (service != undefined && service != null)
        {
            console.log("User '" + user.username + "' wants to use service: " + service);
            if (checkPermissions(user, service))
            {
                console.log("Permission accorded for: " + user.username);
                return true;
            }
            else
                console.error("User does not have permissions for service: " + service);
        }
        else
            console.error("Could not find service in request");
    }
    console.log("No valid session found");
    return false;
}

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
    console.log("-> Log out");
    req.session.destroy(function(err)
    {
        res.redirect('/login');
    })
});

app.get("/login", (req, res) => {
    console.log("-> Log in");
    console.log(req.headers);
    res.render('login');
});

app.get("/auth", (req, res) => {
    console.log("-> Authentication");
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
        console.log("Unknown user: " + username);
        return false;
    }
    if (users[username]["password"] == hashed)
    {
        console.log("Valid password for: " + username);
        return true;
    }
    else
    {
        console.log("Wrong password for: " + username);
        return false;
    }
}

/* ************************************************************************* */
/* Start */

console.log("Starting app...");
server.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});