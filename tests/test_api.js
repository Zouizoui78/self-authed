const assert = require('assert').strict;

process.chdir(__dirname)

const sa_app = require("../private/js/app.js");
if (sa_app.init('./configurations/test_conf.json') == false)
    return 1;

var ret;

// Password too short
ret = sa_app.api.add_user("test", "12");
assert(ret && ret.good == false, ret.error);

// Password not string
ret = sa_app.api.add_user("test", 12);
assert(ret && ret.good == false, ret.error);

ret = sa_app.api.add_user("test", "password");
assert(ret && ret.good, ret.error);

// User already added
ret = sa_app.api.add_user("test", "password2");
assert(ret && ret.good == false, ret.error);

ret = sa_app.auth.validateCredentials("test", "password");
assert(ret && ret.good, ret.error);

// Credentials wrong
ret = sa_app.auth.validateCredentials("test", "password2");
assert(ret && ret.good == false, ret.error);

ret = sa_app.api.change_password("test", "password3");
assert(ret && ret.good, ret.error);

// Credentials wrong after password change
ret = sa_app.auth.validateCredentials("test", "password");
assert(ret && ret.good == false, ret.error);

ret = sa_app.auth.validateCredentials("test", "password3");
assert(ret && ret.good, ret.error);