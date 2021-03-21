let _app;

function init(app)
{
    _app = app;
}

function result(good, error_message)
{
    return {good: good, error: error_message};
}

const _crypto = require("crypto");

function generateToken(length)
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

function validateCredentials(username, passwordCandidate)
{
    let hashed = hash(passwordCandidate);
    let users = _app.get_users();
    if (users[username] == undefined)
    {
        return result(false, "Unknown user: " + username);
    }
    if (users[username]["password"] == hashed)
    {
        if (_app.get_config().debug)
            console.log("Valid password for: " + username);
        return result(true);
    }
    else
    {
        return result(false, "Wrong password for: " + username);
    }
}

module.exports = {
    "init": init,
    "generateToken": generateToken,
    "hash": hash,
    "validateCredentials": validateCredentials,
}