const assert = require('assert').strict;

process.chdir(__dirname)

const tools = require("../private/js/tools.js");
assert(tools.write_json({}, "./configurations/test_users.json"));
assert(tools.write_json({
    debug: true,
    port: 1337,
    users: "./configurations/test_users.json",
    cookies: {
        domain: ".domain.ovh",
        max_days: 1
    },
    service_from_subdomain: true,
    services: {}
}, "./configurations/test_conf.json"));

const sa_app = require("../private/js/app.js");
assert(sa_app.init('./configurations/test_conf.json'));

var ret;

function look_for_error(result, expected_error_code)
{
    assert(result, result.error);
    assert(result.good === false, result.error);
    assert(result.code === expected_error_code, result.error);
}

//
// Add user
//

// Password too short
ret = sa_app.api.add_user({
    name: "test",
    password: "12"
});
look_for_error(ret, 2);

// Password not string
ret = sa_app.api.add_user({
    name: "test",
    password: 12
});
look_for_error(ret, 1);

ret = sa_app.api.add_user({
    name: "test",
    password: "password"
});
assert(ret && ret.good, ret.error);

// User already added
ret = sa_app.api.add_user({
    name: "test",
    password: "password"
});
look_for_error(ret, 1);

//
// User password
//

ret = sa_app.auth.validate_credentials("test", "password");
assert(ret && ret.good, ret.error);

// Credentials wrong
ret = sa_app.auth.validate_credentials("test", "password2");
look_for_error(ret, 2);

ret = sa_app.api.change_password("test", "password3");
assert(ret && ret.good, ret.error);

// Credentials wrong after password change
ret = sa_app.auth.validate_credentials("test", "password");
look_for_error(ret, 2);

ret = sa_app.auth.validate_credentials("test", "password3");
assert(ret && ret.good, ret.error);

//
// Remove user
//

ret = sa_app.api.remove_user("test");
assert(ret && ret.good === true, ret.error);

ret = sa_app.auth.validate_credentials("test", "password");
look_for_error(ret, 1);

ret = sa_app.api.change_password("test", "password3");
look_for_error(ret, 1);

//
// Service adding
//

ret = sa_app.api.add_user({
    name: "test",
    password: "password"
});
assert(ret && ret.good, ret.error);

ret = sa_app.api.add_user({
    name: "test2",
    password: "password2"
});

ret = sa_app.api.add_user({
    name: "test3",
    password: "password3"
});
assert(ret && ret.good, ret.error);

ret = sa_app.api.add_service({
    name: "service",
    url: "domain.com"
});
assert(ret && ret.good, ret.error);

ret = sa_app.api.add_service({
    name: "service2",
    url: "domain2.com"
});
assert(ret && ret.good, ret.error);

ret = sa_app.api.add_service({
    name: "service3",
    url: "domain3.com"
});
assert(ret && ret.good, ret.error);

ret = sa_app.api.update_service(
    "service",
    {
        name: "service",
        url: "renamed.domain.com"
    }
);
assert(ret && ret.good, ret.error);

//
// Permissions
//

ret = sa_app.api.set_permissions("test", ["service", "service2"]);
assert(ret && ret.good, ret.error);

ret = sa_app.api.check_permissions("test", "service");
assert(ret && ret.good, ret.error);

ret = sa_app.api.check_permissions("test2", "service");
look_for_error(ret, 1);

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
look_for_error(ret, 1);

assert(sa_app.get_user('test3').permissions.length == 0);