const fs = require('fs');

let _api = require("./api.js");
let _auth = require("./auth.js");
let _session = require("./session.js");

let _configuration;
let _users;

function get_config()
{
    return _configuration;
}

function get_users()
{
    return _users;
}

/* ************************************************************************* */
/* Configuration */

function readJson(path)
{
    try
    {
        let rawdata = fs.readFileSync(path);
        return JSON.parse(rawdata);
    }
    catch(err)
    {
        console.error(err.message);
        return null;
    }
}

function read_configuration(path)
{
    console.log("Loading configuration: " + path);

    let configuration = readJson(path);
    if (configuration == null)
        return null;

    if (configuration.port == undefined)
        configuration.port = 24080;

    if (configuration.service_method == undefined)
        configuration.service_method = "subdomain"

    if(configuration.cookie_domain == undefined)
    {
        console.error("Required setting 'cookie_domain' not found in configuration.");
        return null;
    }

    console.log("Service retrieval from: " + configuration.service_method);
    if (configuration.service_method == "list" && !configuration.services)
    {
        console.error("No service list configured !");
        return null;
    }
    return configuration;
}

/* ************************************************************************* */
/* Users and tokens */

function read_users(path)
{
    console.log("Loading user file: " + path);
    let json = readJson(path);
    if (json == null)
        return {};
    let ret = {};
    for (var i = 0; i < json.length; ++i)
    {
        let user = json[i];
        ret[user.username] = {
            username: user.username,
            password: user.password,
            permissions: user.permissions,
            admin: user.admin
        };
    }
    return ret;
}

function init(configuration_path)
{
    _configuration = read_configuration(configuration_path);
    if (_configuration != null)
    {
        _users = read_users(_configuration.passwords);
        if (_configuration.debug)
        {
            console.log("Found users:");
            console.log(_users);
        }
        _api.init(_configuration, _users);
        _auth.init(_configuration, _users);
        _session.init(_configuration, _users);
        return true;
    }
    return false;
}

module.exports = {
    init: init,
    get_users: get_users,
    get_config: get_config,
    api: _api,
    auth: _auth,
    session: _session,
}