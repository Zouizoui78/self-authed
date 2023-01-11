let express = require('express');
let router = express();

module.exports = function(sa_app)
{
    router.use("/api", require('./api/api')(sa_app));

    router.post("/login", (req, res) => {
        let username = req.body.name;
        let password = req.body.password;

        if (sa_app.get_config().debug)
            console.log(`POST::login username=${username}`);

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
            console.log("GET::logout");

        req.session.destroy(function(err)
        {
            res.redirect("/login");
        });
    });

    router.get("/login", (req, res) => {
        let url = req.query.url;
        if (sa_app.get_config().debug)
            console.log(`GET::login url=${url}`);

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
        if (sa_app.session.validate_session(req))
        {
            if (sa_app.get_config().debug)
                console.log("GET::auth success");
            res.sendStatus(200);
        }
        else
        {
            if (sa_app.get_config().debug)
                console.log("GET::auth failed");
            res.sendStatus(403);
        }
    });

    router.get("/", (req, res) => {
        let user = sa_app.session.get_user_session(req);

        if (user == undefined)
            res.redirect("/login");
        else
        {
            if (sa_app.get_config().debug)
                console.log(`GET::home render username=${user.name}`);

            res.render('home', {
                username: user.name,
                admin: user.admin,
                services: user.permissions
            })
        }
    });

    router.get("/admin", (req, res) => {
        let user = sa_app.session.get_user_session(req);

        if (user == undefined || !sa_app.session.is_admin(user))
        {
            if (sa_app.get_config().debug)
                console.warn(`GET::admin not an admin (${user ? user.name : "not a user"})`);

            res.redirect("/login");
        }
        else
        {
            if (sa_app.get_config().debug)
                console.log(`GET::admin render username=${user.name}`);

            res.render('admin', {
                username: user.name,
                users: sa_app.get_users()
            });
        }
    });

    return router;
}
