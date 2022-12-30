let _app;

function init(app)
{
    _app = app;
}

const _crypto = require("crypto");

function generate_token(length)
{
    return _crypto.randomBytes(length).toString('hex');
}

function hash(toHash)
{
    return _crypto
        .createHash("sha256")
        .update(toHash)
        .digest("hex");
}

function validate_credentials(username, passwordCandidate)
{
    let hashed = hash(passwordCandidate);
    let users = _app.get_users();
    let debug = _app.get_config().debug;
    if (debug)
        console.log("Validating credentials for user: " + username);
    if (users[username] == undefined)
    {
        if (debug)
            console.error("Unknown user: " + username);
        return _app.tools.result(false, "Unknown user", 1);
    }
    if (users[username]["password"] == hashed)
    {
        if (debug)
            console.log("Credentials validated");
        return _app.tools.result(true);
    }
    else
    {
        if (debug)
            console.error("Wrong password");
        return _app.tools.result(false, "Wrong password", 2);
    }
}

module.exports = {
    "init": init,
    "hash": hash,
    "generate_token": generate_token,
    "validate_credentials": validate_credentials,
}