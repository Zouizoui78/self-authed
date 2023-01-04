let express = require("express");
let router = express();

module.exports = function(sa_app)
{
    router.get("/", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (admin)
        {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(sa_app.get_config().services));
        }
        else
        {
            sa_app.tools.not_logged_in(res);
        }
    });

    router.get("/:service", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let service = sa_app.get_config().services[req.params.service];
        if (service)
            res.status(200).send(service);
        else
            res.status(400).send("Unknown service");
    })

    router.post("/:service", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let ret = sa_app.api.add_service(req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.put("/:service", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let ret = sa_app.api.update_service(req.params.service, req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.delete("/:service", (req, res) => {
        let admin = sa_app.tools.get_admin_user(req, res, sa_app);
        if (!admin)
        {
            sa_app.tools.not_logged_in(res);
            return;
        }

        let name = req.params.service;
        let ret = sa_app.api.remove_service(name);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    return router;
}