let express = require("express");
let router = express();

let _user = null;

module.exports = function(sa_app)
{
    router.use("/", (req, res, next) => {
        let user = sa_app.session.get_user_session(req);
        if (!sa_app.session.is_admin(user))
        {
            _user = null;
            sa_app.tools.send_unauthorized(res);
            return;
        }
        _user = user;
        next();
    });

    router.get("/", (req, res) => {
        res.send(sa_app.get_config().services);
    });

    router.get("/:service", (req, res) => {
        let service = sa_app.get_config().services[req.params.service];
        if (service)
            res.status(200).send(service);
        else
            res.status(400).send("Unknown service");
    })

    router.post("/:service", (req, res) => {
        let ret = sa_app.api.add_service(req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.put("/:service", (req, res) => {
        let ret = sa_app.api.update_service(req.params.service, req.body);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    router.delete("/:service", (req, res) => {
        let ret = sa_app.api.remove_service(req.params.service);
        if (ret.good)
            res.status(200).send("Done");
        else
            res.status(400).send(ret.error);
    });

    return router;
}