let _configuration = null;

function init(configuration)
{
    _configuration = configuration;
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

function validateCredentials(users, username, passwordCandidate)
{
    let hashed = hash(passwordCandidate);
    if (users[username] == undefined)
    {
        console.error("Unknown user: " + username);
        return false;
    }
    if (users[username]["password"] == hashed)
    {
        if (_configuration.debug)
            console.log("Valid password for: " + username);
        return true;
    }
    else
    {
        console.error("Wrong password for: " + username);
        return false;
    }
}

module.exports = {
    "init": init,
    "generateToken": generateToken,
    "hash": hash,
    "validateCredentials": validateCredentials,
}