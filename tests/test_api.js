const assert = require('assert').strict;

process.chdir(__dirname)

const tools = require("../private/js/tools.js");
assert(tools.write_json({}, "./configurations/test_passwords.json"));
assert(tools.write_json({
    debug: true,
    port: 1337,
    passwords: "./configurations/test_passwords.json",
    cookie_domain: ".domain.ovh",
    service_method: "subdomain",
    services: {}
}, "./configurations/test_conf.json"));

const sa_app = require("../private/js/app.js");
assert(sa_app.init('./configurations/test_conf.json'));

var ret;

//
// Add user
//

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

//
// User password
//

ret = sa_app.auth.validate_credentials("test", "password");
assert(ret && ret.good, ret.error);

// Credentials wrong
ret = sa_app.auth.validate_credentials("test", "password2");
assert(ret && ret.good == false, ret.error);

ret = sa_app.api.change_password("test", "password3");
assert(ret && ret.good, ret.error);

// Credentials wrong after password change
ret = sa_app.auth.validate_credentials("test", "password");
assert(ret && ret.good == false, ret.error);

ret = sa_app.auth.validate_credentials("test", "password3");
assert(ret && ret.good, ret.error);

//
// Remove user
//

ret = sa_app.api.remove_user("test");
assert(ret && ret.good, ret.error);

ret = sa_app.auth.validate_credentials("test", "password");
assert(ret && ret.good == false, ret.error);

ret = sa_app.api.change_password("test", "password3");
assert(ret && ret.good == false, ret.error);

//
// Service adding 
//

ret = sa_app.api.add_user("test", "password");
assert(ret && ret.good, ret.error);
ret = sa_app.api.add_user("test2", "password");
assert(ret && ret.good, ret.error);
ret = sa_app.api.add_user("test3", "password");
assert(ret && ret.good, ret.error);

ret = sa_app.api.add_service("service", "service.domain.com");
assert(ret && ret.good, ret.error);
ret = sa_app.api.add_service("service2", "other.domain.com");
assert(ret && ret.good, ret.error);
ret = sa_app.api.add_service("service3", "another.domain.com");
assert(ret && ret.good, ret.error);

ret = sa_app.api.add_service("service", "renamed.domain.com");
assert(ret && ret.good, ret.error);

//
// Permissions
//

ret = sa_app.api.set_permissions("test", ["service", "service2"]);
assert(ret && ret.good, ret.error);

ret = sa_app.api.check_permissions("test", "service");
assert(ret && ret.good, ret.error);

ret = sa_app.api.check_permissions("test2", "service");
assert(ret && ret.good == false, ret.error);
sa_app.get_user('test2').permissions = ["all"];
ret = sa_app.api.check_permissions("test2", "service");
assert(ret && ret.good, ret.error);

//
// Service removal
//

sa_app.api.set_permissions("test3", ["service3"]);
ret = sa_app.api.check_permissions("test3", "service3");
assert(ret && ret.good, ret.error);

ret = sa_app.api.remove_service("service3");
assert(ret && ret.good, ret.error);
ret = sa_app.api.check_permissions("test3", "service3");
assert(ret && ret.good == false, ret.error);
assert(sa_app.get_user('test3').permissions.length == 0);