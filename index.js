process.chdir(__dirname)

const fs = require('fs');
const express = require('express');

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");
const session = require('express-session');
const { config } = require('process');

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

if (configuration.port == undefined)
    configuration.port = 24080;

if (configuration.service_method == undefined)
    configuration.service_method = "subdomain"

const cookie_domain = configuration.cookie_domain;
if(cookie_domain == undefined)
{
    console.error("Required setting 'cookie_domain' not found in configuration.");
    return 1;
}

console.log("Service retrieval from: " + configuration.service_method);
if (configuration.service_method == "list" && !configuration.services)
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

const sa_auth = require("./private/js/auth.js")
sa_auth.init(configuration);

/* ************************************************************************* */
/* App */

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // Forms request body parsing

// With this middleware enabled everything stored in req.session is saved across requests
app.use(session({
    name: "session",
    secret: sa_auth.generateToken(20),
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

// Serve static files
app.use(express.static('public'));

/* ************************************************************************* */
/* Routes */

var root = require('./routes/root')(configuration, users);
app.use("/", root);

var api = require('./routes/api')(configuration, users);
app.use("/api", api);

/* ************************************************************************* */
/* Start */

console.log("Starting app...");
server.listen(configuration.port, () => {
    console.log(`App listening on port: ${configuration.port}`);
});
