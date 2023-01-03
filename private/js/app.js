let _api = require("./api.js");
let _auth = require("./auth.js");
let _session = require("./session.js");
let _tools = require("./tools.js");

let _configuration;
let _configuration_path;
let _users;

function get_config(id)
{
    if (id != undefined)
        return _configuration[id];
    return _configuration;
}

function get_users()
{
    return _users;
}

function get_user(name)
{
    return _users[name];
}

function init(configuration_path)
{
    _configuration_path = configuration_path;
    _configuration = _tools.read_configuration(configuration_path);
    if (_configuration != null)
    {
        _users = _tools.read_users(_configuration.users);
        if (_configuration.debug)
        {
            console.log("Found users:");
            console.log(_users);
        }
        _api.init(this);
        _auth.init(this);
        _session.init(this);
        return true;
    }
    return false;
}

function write_users()
{
    _tools.write_json(_users, _configuration.users);
}

function write_config()
{
    const clone_conf = Object.assign({}, _configuration);
    delete clone_conf._url_to_services;
    _tools.write_json(clone_conf, _configuration_path);
}

module.exports = {
    init: init,
    get_users: get_users,
    get_user: get_user,
    get_config: get_config,
    write_users: write_users,
    write_config: write_config,
    api: _api,
    auth: _auth,
    session: _session,
    tools: _tools,
}