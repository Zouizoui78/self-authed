let express = require('express');
let router = express();

module.exports = function(sa_app)
{
    router.use("/users", require('./users')(sa_app));
    router.use("/services", require('./services')(sa_app));

    return router;
}
