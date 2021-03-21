var express = require('express'),
    router = express();

/* Utils */

function not_logged_in(res)
{
    res.status(401).send("Not logged in");
}

function not_admin(res)
{
    res.status(401).send("You are not admin");
}

function get_admin_user(req, res, sa_app)
{
    var user = sa_app.session.get_user_session(req);
    if (user)
    {
        if (sa_app.session.is_admin(user))
        {
            return user;
        }
        else
            not_admin(res);
    }
    else
        not_logged_in(res);
}

/* Routes */

module.exports = function(sa_app)
{
    router.get("/", (req, res) => {
        res.send("prout");
    });

    router.get("/permissions", (req, res) => {
        var user = sa_app.session.get_user_session(req);
        if (user)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(user.permissions));
        }
        else
        {
            not_logged_in(res);
        }
    });

    router.post("/change_password", (req, res) => {
        var user = sa_app.session.get_user_session(req);
        if (user)
        {
            let username = req.query.username;
            if (sa_app.session.isAdmin(user) == false)
                username = user.username;
            let password = req.query.password;
            let ret = sa_app.api.change_password(username, password);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error);
        }
        else
        {
            not_logged_in(res);
        }
    });

    /* Admin */

    router.get("/users", (req, res) => {
        var admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(sa_app.get_users()));
        }
    });

    router.get("/services", (req, res) => {
        var admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(sa_app.get_config().services));
        }
    });

    router.post("/add_user", (req, res) => {
        var admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            let username = req.query.username;
            let password = req.query.password;
            let ret = sa_app.api.add_user(username, password);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error);
        }
    });

    router.post("/remove_user", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            let username = req.query.username;
            if (username == admin.username)
                res.status(400).send("You cannot remove yourself");
            else
            {
                let ret = sa_app.api.remove_user(username);
                if (ret.good)
                    res.status(200).send("Done");
                else
                    res.status(400).send(ret.error)
            }
        }
    });

    router.post("/add_service", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            let name = req.query.servicename;
            let url = req.query.serviceurl;
            let ret = sa_app.api.add_service(name, url);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error)
        }
    });

    router.post("/remove_service", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            let name = req.query.servicename;
            let ret = sa_app.api.remove_service(name);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error)
        }
    });

    router.post("/set_permissions", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            let username = req.query.username;
            let permissions = req.query.permissions;
            let ret = sa_app.api.set_permissions(username, permissions);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error)
        }
    });

    return router;
}
