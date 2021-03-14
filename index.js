process.chdir(__dirname)

const fs = require('fs');
const crypto = require("crypto");
const express = require('express');

const app = express()
const server = require('http').createServer(app);

var bodyParser = require("body-parser");

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var session = require("express-session");

const port = 3002;

let userFilePath = "./passwords";
let users = loadUserFile(userFilePath);
if(users == undefined) {
    console.log("Cannot open " + userFilePath);
    return 1;
}
console.log(users);

passport.use(new LocalStrategy(
    function(username, password, done){
        console.log("Starting authentication of " + username);
        if(users[username] == undefined){
            console.log("Unknown user : " + username);
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!validPassword(username, password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, users[username]);
    }
));

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "ureghoelg" }));
app.use(passport.initialize());
app.use(passport.session());

// Rendering engine
app.set('view engine', 'pug');

app.post("/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login"
    })
);

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/", (req, res) => {
    res.render('index');
});

server.listen(port, () => {
    console.log(`App listening on port ${port}`)
});


function validPassword(username, passwordCandidate){
    let hash = crypto
        .createHash("sha256")
        .update(passwordCandidate)
        .digest("hex");
    if(users[username]["password"] == hash){
        console.log("Authenticated : " + username);
        return true;
    }
    else{
        console.log("Wrong password for " + username);
        return false;
    }
}

function loadUserFile(path)
{
    let users;
    users = fs.readFileSync(userFilePath, {encoding: "utf8"}).split('\n');
    if(users == "") { return undefined; }
    ret = {};
    for(line of users)
    {
        if(line != ""){
            split = line.split(':');
            if(split.length == 3)
            {
                ret[split[0]] = {
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