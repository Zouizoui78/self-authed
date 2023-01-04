let express = require('express');
let router = express();

module.exports = function(sa_app)
{
    router.use("/users", require('./users')(sa_app));
    router.use("/services", require('./services')(sa_app));

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
            sa_app.tools.not_logged_in(res);
        }
    });

    router.post("/set_permissions", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
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
            sa_app.tools.not_logged_in(res);
        }
    });

    return router;
}
