process.chdir(__dirname)

const express = require('express');

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");
const session = require('express-session');
const { config } = require('process');

const sa_app = require("./private/js/app.js");
if (sa_app.init('./conf.json') == false)
    return 1;

/* ************************************************************************* */
/* App */

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // Forms request body parsing

// With this middleware enabled everything stored in req.session is saved across requests
app.use(session({
    name: "session",
    secret: sa_app.auth.generateToken(20),
    saveUninitialized: false, // true -> deprecated
    resave: false, // true -> deprecated
    cookie: {
        maxAge: 31 * 24 * 3600 * 1000, // Cookie validity in milliseconds
        domain: sa_app.get_config().cookie_domain,
        httpOnly: true,
    }
}));

// Rendering engine
app.set("view engine", "pug");

// Serve static files
app.use(express.static('public'));

/* ************************************************************************* */
/* Routes */

var root = require('./routes/root')(sa_app);
app.use("/", root);

var api = require('./routes/rest_api')(sa_app);
app.use("/api", api);

/* ************************************************************************* */
/* Start */

const port = sa_app.get_config().port;
console.log("Starting app on port: " + port);
server.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});
