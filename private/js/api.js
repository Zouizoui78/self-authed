let _app;

function init(app)
{
    _app = app;
}

function _check_is_string(data)
{
    return typeof(data) == "string";
}

function _check_is_obj(data)
{
    return typeof(data) == 'object';
}

function _check_is_array(data)
{
    return _check_is_obj(data) && data.isArray();
}

function verif_password(password)
{
    if (typeof(password) != "string")
        return result(false, "Password is not a string");
    let password_min_length = _app.get_config("password_min_length");
    if (password.length <= password_min_length)
        return result(false, "Password must be longer than " + password_min_length + " chars");
    return result(true);
}

function change_password(username, password)
{
    var user = _app.get_users()[username];
    if (user)
    {
        var ret = verif_password(password);
        if (ret.good == true)
            user.password = _app.auth.hash(password);
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
        var ret = verif_password(password);
        if (ret.good == true)
        {
            users[username] = {
                username: username,
                password: _app.auth.hash(password),
                permissions: [],
            }
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
        return _app.tools.result(true);
    }
    return _app.tools.result(false, "No user named: " + username);
}

module.exports = {
    init: init,
    add_service: add_service,
    remove_service: remove_service,
    add_user: add_user,
    remove_user: remove_user,
    change_password: change_password,
    set_permissions: set_permissions,
}