/* ************************************************************************* */
/* Session validation */

let _app;

function init(app)
{
    _app = app;
}

function _get_service_from_request(req)
{
    let origin = req.headers.origin;
    if (origin == undefined)
        origin = req.headers.referer;
    let url = _app.tools.getDomainFromUrl(origin);
    if (!origin || !url)
    {
        console.error("Origin unknown: '" + origin + "' try adding Origin in http headers");
        return null;
    }
    if (_app.get_config().debug)
        console.log("Origin URL: " + url);
    if (_app.get_config().service_method == "subdomain")
        return _app.tools.getSubdomainFromDomain(url);
    else if (_app.get_config().service_method == "list")
    {
        if (_app.get_config().services)
            return _app.get_config()._url_to_services[url];
        console.error("No service list configured !");
    }
}

function get_user_session(req)
{
    return req.session != undefined ? _app.get_users()[req.session.user] : undefined;
}

function validate_session(req)
{
    var user = get_user_session(req);
    if (user != undefined)
    {
        var username = user.username;
        if (_app.get_config().debug)
            console.log("Found session for: " + username);
        var service = _get_service_from_request(req);
        if (service != undefined && service != null)
        {
            if (_app.get_config().debug)
                console.log("User '" + username + "' wants to use service: " + service);
            var ret = _app.api.check_permissions(username, service);
            if (ret.good)
            {
                if (_app.get_config().debug)
                    console.log("Permission accorded for: " + username);
                return true;
            }
            else
                console.error(ret.error);
        }
        else
            console.error("Could not find service in request");
    }
    if (_app.get_config().debug)
        console.log("No valid session found");
    return false;
}

function is_admin(user)
{
    if (!user)
        return false;
    return user.admin == true;
}

module.exports = {
    "validate_session": validate_session,
    "get_user_session": get_user_session,
    "is_admin": is_admin,
    "init": init,
}