let express = require("express");
let router = express();

module.exports = function(sa_app)
{
    router.get("/", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(sa_app.get_users()));
    });

    router.get("/:username", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let user = sa_app.get_user(req.params.username);
        if (user)
            res.status(200).send(user);
        else
            res.status(400).send("Unknown user");
    })

    router.post("/:username", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let ret = sa_app.api.add_user(req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.put("/:username", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let ret = sa_app.api.update_user(req.params.username, req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.delete("/:username", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let username = req.params.username;
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
    });

    return router;
}