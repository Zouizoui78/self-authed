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
    if (users[username] == undefined)
    {
        return _app.tools.result(false, "Unknown user: " + username);
    }
    if (users[username]["password"] == hashed)
    {
        if (_app.get_config().debug)
            console.log("Valid password for: " + username);
        return _app.tools.result(true);
    }
    else
    {
        return _app.tools.result(false, "Wrong password for: " + username);
    }
}

module.exports = {
    "init": init,
    "hash": hash,
    "generate_token": generate_token,
    "validate_credentials": validate_credentials,
}