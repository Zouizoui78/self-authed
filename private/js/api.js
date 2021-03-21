let _app

function init(app)
{
    _app = app;
}

function result(good, error_message)
{
    return {good: good, error: error_message};
}

function verif_password(password)
{
    if (typeof(password) != "string")
        return result(false, "Password is not a string");
    if (password.length <= _app.get_config("password_min_length"))
        return result(false, "Password must be longer than 5 char");
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
    return result(false, "No such user: " + username);
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
    return result(false, "User already exists: " + username);
   
}

module.exports = {
    init: init,
    add_user: add_user,
    change_password: change_password,
}