let express = require('express');
let router = express();

module.exports = function(sa_app)
{
    router.use("/users", require('./users')(sa_app));
    router.use("/services", require('./services')(sa_app));

    router.get("/", (req, res) => {
        res.status(400).send("No API there");
    });

    return router;
}
