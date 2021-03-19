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

function readJson(path)
{
    try
    {
        let rawdata = fs.readFileSync(path);
        return JSON.parse(rawdata);
    }
    catch(err)
    {
        console.error(err.message);
        return null;
    }
}

console.log("Loading configuration...");

let configuration = readJson('./conf.json');
if (configuration == null)
    return 1;

const port = configuration.port == undefined ? 24080 : configuration.port;
const service_method = configuration.service_method == undefined ? "subdomain" : configuration.service_method;
const cookie_domain = configuration.cookie_domain;
if(cookie_domain == undefined)
{
    console.error("Required setting 'cookie_domain' not found in configuration.");
    return 1;
}

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
    let json = readJson(path);
    if (json == null)
        return null;
    let ret = {};
    for (var i = 0; i < json.length; ++i)
    {
        let user = json[i];
        ret[user.username] = {
            username: user.username,
            password: user.password,
            permissions: user.permissions,
            admin: user.admin
        };
    }
    return ret;
}

console.log("Loading user file...");

let users = loadUserFile(configuration.passwords);
if (users == null)
    return 1;
if (configuration.debug)
{
    console.log("Found users:");
    console.log(users);
}

/* ************************************************************************* */
/* Session validation */

function checkPermissions(user, service)
{
    var permissions = user.permissions;
    if (configuration.debug)
        console.log("Permissions for user: '" + user.username + "' -> " + user.permissions);
    if (permissions)
    {
        if (permissions.includes("all"))
            return true;
        if (permissions.includes(service))
            return true;
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

function getSubdomainFromDomain(url)
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
    if (configuration.debug)
        console.log("Origin URL: " + url);
    if (service_method == "subdomain")
        return getSubdomainFromDomain(url);
    else if (service_method == "list")
    {
        if (configuration.services)
            return configuration.services[url];
        console.error("No service list configured !");
    }
}

function getUserSession(req)
{
    return req.session != undefined ? users[req.session.user] : undefined;
}

function validateSession(req)
{
    var user = getUserSession(req);
    if (user != undefined)
    {
        if (configuration.debug)
            console.log("Found session for: " + user.username);
        var service = getServiceFromRequest(req);
        if (service != undefined && service != null)
        {
            if (configuration.debug)
                console.log("User '" + user.username + "' wants to use service: " + service);
            if (checkPermissions(user, service))
            {
                if (configuration.debug)
                    console.log("Permission accorded for: " + user.username);
                return true;
            }
            else
                console.error(user.username + " does not have permissions for service: " + service);
        }
        else
            console.error("Could not find service in request");
    }
    if (configuration.debug)
        console.log("No valid session found");
    return false;
}

/* ************************************************************************* */
/* App */

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // Forms request body parsing

// With this middleware enabled everything stored in req.session is saved across requests
app.use(session({
    name: "session",
    secret: generateToken(20),
    saveUninitialized: false, // true -> deprecated
    resave: false, // true -> deprecated
    cookie: {
        maxAge: 31 * 24 * 3600 * 1000, // Cookie validity in milliseconds
        domain: cookie_domain,
        httpOnly: true,
    }
}));

// Rendering engine
app.set("view engine", "pug");

/* ************************************************************************* */
/* Routes */

app.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let url = req.session.url;

    if (configuration.debug)
    {
        console.log("-> Log in post");
        console.log(req.session);
        console.log("url = " + url)
    }

    if (validateCredentials(username, password))
    {
        req.session.user = username;
        delete req.session.url;
        if(url == undefined)
            res.redirect('/');
        else
            res.redirect(url);
    }
    else
        res.redirect("/login");
});

app.get("/logout", function(req, res)
{
    if (configuration.debug)
        console.log("-> Log out");
    req.session.destroy(function(err)
    {
        res.redirect("/login");
    })
});

app.get("/login", (req, res) => {
    if (configuration.debug)
    {
        console.log("-> Log in get");
        console.log(req.session);
    }
    if(req.session.url == undefined)
        req.session.url = req.query.url;
    res.render("login");
});

app.get("/auth", (req, res) => {
    if (configuration.debug)
    {
        console.log("-> Authentication");
        console.log(req.session);
    }
    if (validateSession(req))
        res.sendStatus(200);
    else
        res.sendStatus(401);
});

app.get("/", (req, res) => {
    var user = getUserSession(req);
    if (user == undefined)
        res.redirect("/login");
    else
        res.render('home', {
            username: user.username,
            admin: user.admin,
            services: user.permissions
        })
});

function isAdmin(user)
{
    if (!user)
        return false;
    return user.admin == true;
}

app.get("/admin", (req, res) => {
    var user = getUserSession(req);
    if (user == undefined || !isAdmin(user))
        res.redirect("/login");
    else
        res.render('admin', {
            username: user.username,
            users: users
        })
});

/* ************************************************************************* */
/* Passport secure login */

function hash(toHash)
{
    return crypto
        .createHash("sha256")
        .update(toHash)
        .digest("hex");
}

function validateCredentials(username, passwordCandidate)
{
    let hashed = hash(passwordCandidate);
    if (users[username] == undefined)
    {
        console.error("Unknown user: " + username);
        return false;
    }
    if (users[username]["password"] == hashed)
    {
        if (configuration.debug)
            console.log("Valid password for: " + username);
        return true;
    }
    else
    {
        console.error("Wrong password for: " + username);
        return false;
    }
}

/* ************************************************************************* */
/* Start */

console.log("Starting app...");
server.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});
