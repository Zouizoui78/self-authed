const _password_validator = require('password-validator');
const _crypto = require("crypto");

let _app;
let _password_schema;

function _set_default_password_schema(password_schema)
{
    password_schema
        .is().min(8)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().uppercase()                              // Must have uppercase letters
        .has().lowercase()                              // Must have lowercase letters
        .has().digits(2)                                // Must have at least 2 digits
        .has().not().spaces()                           // Should not have spaces
        .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values
}

function init(app)
{
    _app = app;
    _password_schema = new _password_validator();
    _set_default_password_schema(_password_schema);
}

function validate_password(password)
{
    let errors = _password_schema.validate(password, { details: true });

    var error_lst = []
    for (var error of errors)
    {
        error_lst.push(error.message.replace("string", "password"));
    }

    return {
        valid: errors.length == 0,
        errors: error_lst,
    };
}

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

function validate_credentials(username, password_candidate)
{
    let hashed = hash(password_candidate);
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
    "validate_password": validate_password,
    "validate_credentials": validate_credentials,
}
