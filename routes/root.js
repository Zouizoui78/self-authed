let express = require('express');
let router = express();

module.exports = function(sa_app)
{
    let api = require('./rest_api')(sa_app);
    router.use("/api", api);

    router.post("/login", (req, res) => {
        let username = req.body.username;
        let password = req.body.password;

        if (sa_app.get_config().debug)
        {
            console.log("-> Log in post");
        }
        let ret = sa_app.auth.validate_credentials(username, password);
        if (ret.good)
        {
            req.session.user = username;
            res.status(200).send("ok");
        }
        else
            res.status(400).send(ret);
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
            console.log("url = " + url)
        }

        let user = sa_app.session.get_user_session(req);
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
        }
        if (sa_app.session.validate_session(req))
            res.sendStatus(200);
        else
            res.sendStatus(401);
    });

    router.get("/", (req, res) => {
        let user = sa_app.session.get_user_session(req);
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
        let user = sa_app.session.get_user_session(req);
        if (user == undefined || !sa_app.session.is_admin(user))
            res.redirect("/login");
        else
            res.render('admin', {
                username: user.username,
                users: sa_app.get_users()
            })
    });

    return router;
}
