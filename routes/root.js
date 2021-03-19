var express = require('express'),
    router = express();

const sa_auth = require("../private/js/auth.js");
const sa_session = require("../private/js/session.js");

function isAdmin(user)
{
    if (!user)
        return false;
    return user.admin == true;
}

module.exports = function(configuration, users)
{
    sa_auth.setConf(configuration);
    sa_session.setConf(configuration);

    router.post("/login", (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let url = req.session.url;

        if (configuration.debug)
        {
            console.log("-> Log in post");
            console.log(req.session);
            console.log("url = " + url)
        }

        if (sa_auth.validateCredentials(users, username, password))
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

    router.get("/logout", function(req, res)
    {
        if (configuration.debug)
            console.log("-> Log out");
        req.session.destroy(function(err)
        {
            res.redirect("/login");
        })
    });

    router.get("/login", (req, res) => {
        if (configuration.debug)
        {
            console.log("-> Log in get");
            console.log(req.session);
        }
        if(req.session.url == undefined)
            req.session.url = req.query.url;
        res.render("login");
    });

    router.get("/auth", (req, res) => {
        if (configuration.debug)
        {
            console.log("-> Authentication");
            console.log(req.session);
        }
        if (sa_session.validateSession(req))
            res.sendStatus(200);
        else
            res.sendStatus(401);
    });

    router.get("/", (req, res) => {
        var user = sa_session.getUserSession(req);
        if (user == undefined)
            res.redirect("/login");
        else
            res.render('home', {
                username: user.username,
                admin: user.admin,
                services: user.permissions
            })
    });

    router.get("/admin", (req, res) => {
        var user = sa_session.getUserSession(req);
        if (user == undefined || !isAdmin(user))
            res.redirect("/login");
        else
            res.render('admin', {
                username: user.username,
                users: users
            })
    });

    return router;
}
