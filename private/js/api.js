let _app;

function init(app)
{
    _app = app;
}

function _check_is_string(data)
{
    return typeof(data) == "string";
}

function _check_is_array(data)
{
    return Array.isArray(data);
}

function _verif_password(password)
{
    if (typeof(password) != "string")
        return _app.tools.result(false, "Password is not a string");
    let password_min_length = _app.get_config("password_min_length");
    if (password.length <= password_min_length)
        return _app.tools.result(false, "Password must be longer than " + password_min_length + " chars");
    return _app.tools.result(true);
}

function change_password(username, password)
{
    var user = _app.get_users()[username];
    if (user)
    {
        var ret = _verif_password(password);
        if (ret.good == true)
            user.password = _app.auth.hash(password);
        _app.write_users();
        return ret;
    }
    return _app.tools.result(false, "No such user: " + username);
}

function add_user(username, password)
{
    var users = _app.get_users();
    var user = users[username];
    if (!user)
    {
        var ret = _verif_password(password);
        if (ret.good == true)
        {
            users[username] = {
                username: username,
                password: _app.auth.hash(password),
                permissions: [],
            }
            _app.write_users();
        }
        return ret;
    }
    return _app.tools.result(false, "User already exist: " + username);
}

function remove_user(username)
{
    var users = _app.get_users();
    var user = users[username];
    if (user)
    {
        delete users[username];
        _app.write_users();
        return _app.tools.result(true);
    }
    return _app.tools.result(false, "User does not exist: " + username);
}

function add_service(name, url)
{
    if (_check_is_string(name) == false)
        return _app.tools.result(false, "Service name is not a string");
    if (_check_is_string(url) == false)
        return _app.tools.result(false, "Service url is not a string");
    var config = _app.get_config();
    if (name == "all")
        return _app.tools.result(false, "Cannot have a service named 'all'");
    config.services[name] = url;
    config._url_to_services[url] = name;
    _app.write_config();
    return _app.tools.result(true);
}

function _remove_service_from_users(name)
{
    var users = _app.get_users();
    for (var key in users)
    {
        if (users.hasOwnProperty(key))
        {
            var user = users[key];
            const permissions = user.permissions;
            const index = permissions.indexOf(name);
            if (index > -1)
            {
                permissions.splice(index, 1);
            }
        }
    }
}

function remove_service(name)
{
    if (_check_is_string(name) == false)
        return _app.tools.result(false, "Service name is not a string");
    var config = _app.get_config();
    if (config.services)
    {
        var url = config.services[name];
        if (url != undefined)
        {
            delete config._url_to_services[url];
            delete config.services[name];
            _remove_service_from_users(name);
            _app.write_users();
            _app.write_config();
            return _app.tools.result(true);
        }
        return _app.tools.result(false, "Service does not exist: " + name);
    }
    return _app.tools.result(false, "No services");
}

function set_permissions(username, permissions)
{
    if (_check_is_string(username) == false)
        return _app.tools.result(false, "Username is not a string");
    if (_check_is_array(permissions) == false)
        return _app.tools.result(false, "Permissions is not an array");
    var users = _app.get_users();
    var user = users[username];
    if (user)
    {
        user.permissions = permissions;
        _app.write_users();
        return _app.tools.result(true);
    }
    return _app.tools.result(false, "No such user: " + username);
}

function check_permissions(username, service)
{
    var user = _app.get_user(username);
    if (user)
    {
        var permissions = user.permissions;
        if (_app.get_config("debug"))
            console.log("Permission check for " + username + "[" + user.permissions + "] -> " + service);
        if (permissions && (permissions.includes("all") || permissions.includes(service)))
            return _app.tools.result(true);
        return _app.tools.result(false, "User '" + username + '" cannot access: ' + service);
    }
    return _app.tools.result(false, "No such user: " + username);
}

module.exports = {
    init: init,
    add_service: add_service,
    remove_service: remove_service,
    add_user: add_user,
    remove_user: remove_user,
    change_password: change_password,
    set_permissions: set_permissions,
    check_permissions: check_permissions,
}