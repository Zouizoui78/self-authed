process.chdir(__dirname)

const express = require('express');

const app = express();
const server = require('http').createServer(app);

const session = require('express-session');

const sa_app = require("./private/js/app.js");
const { read_configuration } = require('./private/js/tools.js');
if (sa_app.init('./conf.json') == false)
    return 1;

/* ************************************************************************* */
/* App */

// Middlewares
app.use(express.json()); // JSON body parsing

let config = sa_app.get_config()

let session_conf = {
    name: "session",
    secret: sa_app.auth.generate_token(100),
    saveUninitialized: false, // true -> deprecated
    resave: false, // true -> deprecated
    cookie: {
        maxAge: config.cookies.max_days * 24 * 3600 * 1000, // Cookie validity in milliseconds
        httpOnly: true
    }
};

if (!config.debug)
{
    // TODO : make secure cookies work
    // session_conf.proxy = true;
    // session_conf.cookie.secure = true; // https
    session_conf.cookie.domain = config.cookies.domain
}

// With this middleware enabled everything stored in req.session
// is saved *server-side* across requests
app.use(session(session_conf));

// Rendering engine
app.set("view engine", "pug");

// Serve static files
app.use(express.static('public'));

/* ************************************************************************* */
/* Routes */

var root = require('./routes/root')(sa_app);
app.use("/", root);

/* ************************************************************************* */
/* Start */

const port = config.port;
console.log("Starting app on port: " + port);
server.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});
