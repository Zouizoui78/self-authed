let express = require('express');
let router = express();

/* Utils */

function not_logged_in(res)
{
    let ret = sa_app.tools.result(false, "Not logged in", 11);
    res.status(401).send(ret);
}

function not_admin(res)
{
    let ret = sa_app.tools.result(false, "You are not admin", 10);
    res.status(401).send(ret);
}

function get_admin_user(req, res, sa_app)
{
    let user = sa_app.session.get_user_session(req);
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
        res.status(400).send("No API there");
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
        let user = sa_app.session.get_user_session(req);
        if (user)
        {
            let username = req.body.username;
            if (!username || sa_app.session.is_admin(user) == false)
                username = user.username;
            let password = req.body.password;
            let ret = sa_app.api.change_password(username, password);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret);
        }
        else
        {
            not_logged_in(res);
        }
    });

    /* Admin */

    router.get("/users", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(sa_app.get_users()));
        }
        else
        {
            not_logged_in(res);
        }
    });

    router.delete("/users/:user", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            let username = req.params.user;
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
        else
        {
            not_logged_in(res);
        }
    });

    router.get("/services", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(sa_app.get_config().services));
        }
        else
        {
            not_logged_in(res);
        }
    });

    router.post("/add_user", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            let username = req.body.username;
            let password = req.body.password;
            let ret = sa_app.api.add_user(username, password);
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

    router.post("/add_service", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            let name = req.body.servicename;
            let url = req.body.serviceurl;
            let ret = sa_app.api.add_service(name, url);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error)
        }
        else
        {
            not_logged_in(res);
        }
    });

    router.post("/remove_service", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            let name = req.body.servicename;
            let ret = sa_app.api.remove_service(name);
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error)
        }
        else
        {
            not_logged_in(res);
        }
    });

    router.post("/set_permissions", (req, res) => {
        let admin = get_admin_user(req, res, sa_app);
        if (admin)
        {
            let username = req.body.username;
            let permissions = req.body.permissions;
            let ret = sa_app.api.set_permissions(username, permissions.split(","));
            if (ret.good)
                res.status(200).send("Done");
            else
                res.status(400).send(ret.error)
        }
        else
        {
            not_logged_in(res);
        }
    });

    return router;
}
