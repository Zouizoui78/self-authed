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
    var ret = _app.auth.validate_password(password);
    var good = ret.valid;
    var ret_code = ret.valid ? 0 : 1;
    var error_str = ret.errors.join("\n");

    return _app.tools.result(good, error_str, ret_code);
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
    return _app.tools.result(false, "No such user", 1);
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

function set_user(username, user_conf, overwrite = true)
{
    let users = _app.get_users();
    let new_name = user_conf.name;

    // error code starts at 3 because of passwords error codes
    if (_check_is_string(username) == false)
        return _app.tools.result(false, "User name is not a string", 3);
    if (_check_is_string(new_name) == false)
        return _app.tools.result(false, "User new name is not a string", 4);

    let actual_name = overwrite ? new_name : username;

    let user_exists = users[actual_name];
    let changing_user_name = username != new_name;

    if (user_exists)
    {
        if (overwrite == false)
            return _app.tools.result(false, `User '${username}' already exists`, 5);
        if (changing_user_name)
            return _app.tools.result(false, `Cannot change user name '${username}' to '${new_name}' - already exists`, 6);
    }

    if (!overwrite && !user_conf.password)
        return _app.tools.result(false, "New user needs a password", 7);

    if (user_conf.password)
    {
        // send error codes
        let password_check = _verif_password(user_conf.password);
        if (!password_check.good)
            return password_check;
        user_conf.password = _app.auth.hash(user_conf.password);
    }
    else
    {
        user_conf.password = users[username].password;
    }

    if (overwrite && changing_user_name)
        remove_user(username);

    users[actual_name] = {
        name: user_conf.name,
        password: user_conf.password,
        permissions: user_conf.permissions,
        admin: user_conf.admin
    };

    _app.write_users();

    return _app.tools.result(true);
}

function add_user(user_conf)
{
    return set_user(user_conf.name, user_conf, false);
}

function update_user(username, user_conf)
{
    return set_user(username, user_conf, true);
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

function set_service(name, service_conf, overwrite = true)
{
    let config = _app.get_config();
    let new_name = service_conf.name;
    let new_url = service_conf.url;

    if (_check_is_string(name) == false)
        return _app.tools.result(false, "Service name is not a string", 1);
    if (_check_is_string(new_name) == false)
        return _app.tools.result(false, "Service new name is not a string", 2);
    if (_check_is_string(new_url) == false)
        return _app.tools.result(false, "Service url is not a string", 3);
    if (name == "all" || new_name == "all")
        return _app.tools.result(false, "Cannot have a service named 'all'", 4);

    let actual_name = overwrite ? new_name : name;

    let service_exists = config.services[actual_name];
    let changing_service_name = name != new_name;

    if (service_exists)
    {
        if (overwrite == false)
            return _app.tools.result(false, `Service '${name}' already exists`, 5);
        if (changing_service_name)
            return _app.tools.result(false, `Cannot change service '${name}' to '${new_name}' - already exists`, 6);
    }

    if (overwrite && changing_service_name)
        remove_service(name);

    config.services[actual_name] = new_url;
    config._url_to_services[new_url] = actual_name;

    _app.write_config();

    return _app.tools.result(true);
}

function add_service(service_conf)
{
    return set_service(service_conf.name, service_conf, false);
}

function update_service(service_name, service_conf)
{
    return set_service(service_name, service_conf, true);
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
