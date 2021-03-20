var express = require('express'),
    router = express();

function not_logged_in(res)
{
    res.status(401).send("Not logged in");
}

module.exports = function(configuration, users)
{
    const sa_session = require("../private/js/session.js")
    sa_session.init(configuration, users);

    router.get("/", (req, res) => {
        res.send("prout");
    })

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
    })

    return router;
}
