let _configuration;
let _users;

function init(configuration, users)
{
    _configuration = configuration;
    _users = users;
}

module.exports = {
    init: init,
}