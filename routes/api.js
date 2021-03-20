var express = require('express'),
    router = express();

function not_logged_in(res)
{
    res.status(401).send("Not logged in");
}

function not_admin(res)
{
    res.status(401).send("You are not admin");
}

function get_admin_user(req, res, sa_session)
{
    var user = sa_session.getUserSession(req);
    if (user)
    {
        if (sa_session.isAdmin(res))
        {
            return user;
        }
        else
            not_admin(res);
    }
    else
        not_logged_in(res);
}

module.exports = function(configuration, users)
{
    const sa_session = require("../private/js/session.js")
    sa_session.init(configuration, users);

    router.get("/", (req, res) => {
        res.send("prout");
    });

    router.get("/permissions", (req, res) => {
        var user = sa_session.getUserSession(req);
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
        var user = sa_session.getUserSession(req);
        if (user)
        {
            res.status(200).send('done');
        }
        else
        {
            not_logged_in(res);
        }
    });


    router.get("/users", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(users));
        }
    });

    router.get("/services", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(configuration.services));
        }
    });

    router.post("/add_user", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.status(200).send("Done");
        }
    });

    router.post("/remove_user", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.status(200).send("Done");
        }
    });

    router.post("/add_service", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.status(200).send("Done");
        }
    });

    router.post("/remove_service", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.status(200).send("Done");
        }
    });

    router.post("/set_permission", (req, res) => {
        var admin = get_admin_user(req, res, sa_session);
        if (admin)
        {
            res.status(200).send("Done");
        }
    });

    return router;
}
