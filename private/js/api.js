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
        return _app.tools.result(false, "Password is not a string", 1);
    let password_min_length = _app.get_config("password_min_length");
    if (password.length <= password_min_length)
        return _app.tools.result(false, "Password must be longer than " + password_min_length + " chars", 2);
    return _app.tools.result(true);
}

function change_password(username, password)
{
    var user = _app.get_users()[username];
    if (user)
    {
        var ret = _verif_password(password);
        if (ret.good == true)
        {
            user.password = _app.auth.hash(password);
            _app.write_users();
        }
        return ret;
    }
    return _app.tools.result(false, "No such user", 3);
}

function set_user(username, new_user, overwrite = true)
{
    let users = _app.get_users();

    if (!overwrite && users[username]
        || username != new_user.username && users[new_user.username])
    {
        return _app.tools.result(false, `Cannot set user '${username}' : '${new_user.username}' already exists`, 3);
    }

    if (new_user.password)
    {
        let pasword_check = _verif_password(new_user.password);
        if (!pasword_check.good)
            return pasword_check;
        new_user.password = _app.auth.hash(new_user.password);
    }
    else
    {
        new_user.password = users[username].password;
    }

    delete users[username];
    users[new_user.username] = new_user;
    _app.write_users();
    return _app.tools.result(true);
}

function add_user(new_user)
{
    return set_user(new_user.username, new_user, false);
}

function update_user(username, new_user)
{
    return set_user(username, new_user, true);
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
    return _app.tools.result(false, "User does not exist");
}

function set_service(name, new_service, overwrite = true)
{
    let config = _app.get_config();
    let new_name = new_service.servicename;
    let new_url = new_service.serviceurl;

    if (_check_is_string(name) == false)
        return _app.tools.result(false, "Service name is not a string", 1);
    if (_check_is_string(new_name) == false)
        return _app.tools.result(false, "Service new name is not a string", 2);
    if (_check_is_string(new_url) == false)
        return _app.tools.result(false, "Service url is not a string", 3);
    if (name == "all" || new_name == "all")
        return _app.tools.result(false, "Cannot have a service named 'all'", 4);

    if (!overwrite && config.services[name]
        || name != new_name && config.services[new_name])
    {
        return _app.tools.result(false, `Cannot set service '${name}' : '${new_name}' already exists`, 5);
    }

    config.services[name] = new_url;
    config._url_to_services[new_url] = name;
    _app.write_config();
    return _app.tools.result(true);
}

function add_service(new_service)
{
    return set_service(new_service.servicename, new_service, false);
}

function update_service(service_name, new_service)
{
    return set_service(service_name, new_service, true);
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
        return _app.tools.result(false, "Service name is not a string", 1);
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
        return _app.tools.result(false, "Service does not exist", 2);
    }
    return _app.tools.result(false, "No services", 3);
}

function set_permissions(username, permissions)
{
    if (_check_is_string(username) == false)
        return _app.tools.result(false, "Username is not a string", 1);
    if (_check_is_array(permissions) == false)
        return _app.tools.result(false, "Permissions is not an array", 2);
    var users = _app.get_users();
    var user = users[username];
    if (user)
    {
        user.permissions = permissions;
        _app.write_users();
        return _app.tools.result(true);
    }
    return _app.tools.result(false, "No such user", 3);
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
        return _app.tools.result(false, "Permission denied", 1);
    }
    return _app.tools.result(false, "No such user", 2);
}

module.exports = {
    init: init,
    set_service: set_service,
    add_service: add_service,
    update_service: update_service,
    remove_service: remove_service,
    set_user: set_user,
    add_user: add_user,
    update_user: update_user,
    remove_user: remove_user,
    change_password: change_password,
    set_permissions: set_permissions,
    check_permissions: check_permissions,
}