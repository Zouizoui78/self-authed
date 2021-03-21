var express = require('express'),
    router = express();

module.exports = function(sa_app)
{
    router.post("/login", (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        //let url = req.session.url;

        if (sa_app.get_config().debug)
        {
            console.log("-> Log in post");
            //console.log(req.session);
        }
        if (sa_app.auth.validateCredentials(sa_app.get_users(), username, password))
        {
            req.session.user = username;
            /*
            delete req.session.url;
            if (url == undefined)
                res.redirect('/');
            else
                res.redirect(url);
            */
            res.status(200).send("okkkkkk");
        }
        else
            res.status(400).send("noopppe");
        /*
        else
            res.redirect("/login");
        */
    });

    router.get("/logout", function(req, res)
    {
        if (sa_app.get_config().debug)
            console.log("-> Log out");
        req.session.destroy(function(err)
        {
            res.redirect("/login");
        })
    });

    router.get("/login", (req, res) => {
        let url = req.query.url;
        if (sa_app.get_config().debug)
        {
            console.log("-> Log in get");
            //console.log(req.session);
            console.log("url = " + url)
        }
        /*
        if (req.session.url == undefined)
            req.session.url = req.query.url;
        */
        var user = sa_app.session.getUserSession(req);
        if (user == undefined)
            res.render("login");
        else
        {
            if (url == undefined)
                res.redirect('/');
            else
                res.redirect(url);
        }
    });

    router.get("/auth", (req, res) => {
        if (sa_app.get_config().debug)
        {
            console.log("-> Authentication");
            //console.log(req.session);
        }
        if (sa_app.session.validateSession(req))
            res.sendStatus(200);
        else
            res.sendStatus(401);
    });

    router.get("/", (req, res) => {
        var user = sa_app.session.getUserSession(req);
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
        var user = sa_app.session.getUserSession(req);
        if (user == undefined || !sa_app.session.isAdmin(user))
            res.redirect("/login");
        else
            res.render('admin', {
                username: user.username,
                users: sa_app.get_users()
            })
    });

    return router;
}
