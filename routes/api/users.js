let express = require("express");
let router = express();

let _user = null;

function is_allowed(user, target_username)
{
    return user && (user.username == target_username || user.admin);
}

module.exports = function(sa_app)
{
    router.get("/", (req, res) => {
        let user = sa_app.session.get_user_session(req);
        if (!sa_app.session.is_admin(user))
        {
            sa_app.tools.send_unauthorized(res);
            return;
        }
        res.send(sa_app.get_users());
    });

    router.use("/:username", (req, res, next) => {
        let user = sa_app.session.get_user_session(req);
        if (!is_allowed(user, req.params.username))
        {
            _user = null;
            sa_app.tools.send_unauthorized(res);
            return;
        }
        _user = user;
        next();
    });

    router.get("/:username", (req, res) => {
        let user = sa_app.get_user(req.params.username);
        if (user)
            res.status(200).send(user);
        else
            res.status(400).send("Unknown user");
    })

    router.post("/:username", (req, res) => {
        let ret = sa_app.api.add_user(req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.put("/:username", (req, res) => {
        let ret = sa_app.api.update_user(req.params.username, req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.delete("/:username", (req, res) => {
        let username = req.params.username;
        if (username == _user.username && _user.admin)
        {
            res.status(400).send("As an admin you cannot remove yourself");
        }

        let ret = sa_app.api.remove_user(username);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.put("/:username/password", (req, res) => {
        let ret = sa_app.api.change_password(req.params.username, req.body.password);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret);
    });

    router.get("/:username/permissions", (req, res) => {
        let user = sa_app.get_user(req.params.username);
        if (user)
            res.status(200).send(user.permissions);
        else
            res.status(400).send("Unknown user");
    });

    router.put("/:username/permissions", (req, res) => {
        let username = req.body.username;
        let permissions = req.body.permissions;
        let ret = sa_app.api.set_permissions(username, permissions);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    return router;
}