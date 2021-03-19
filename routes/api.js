var express = require('express'),
    router = express();

module.exports = function(configuration, users)
{
    router.get("/", (req, res) => {
        res.send("prout");
    })
    return router;
}
