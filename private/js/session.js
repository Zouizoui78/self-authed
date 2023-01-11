/* ************************************************************************* */
/* Session validation */

let _app;

function init(app)
{
    _app = app;
}

function _get_service_from_request(req)
{
    let config = _app.get_config();
    let origin = req.headers.origin;
    if (origin == undefined)
        origin = req.headers.referer;
    let url = _app.tools.get_domain_from_url(origin);
    if (!origin || !url)
    {
        console.error("Origin unknown: '" + origin + "' try adding Origin in http headers");
        return null;
    }
    if (config.debug)
        console.log("Origin URL: " + url);
    if (config.service_from_subdomain)
        return _app.tools.get_subdomain_from_domain(url);
    else
    {
        if (config.services)
            return config._url_to_services[url];
        console.error("No service list configured !");
    }
}

function get_user_session(req)
{
    return req.session != undefined ? _app.get_users()[req.session.user] : undefined;
}

function validate_session(req)
{
    let config = _app.get_config();
    let user = get_user_session(req);

    if (user != undefined)
    {
        let username = user.name;
        if (config.debug)
            console.log("Found session for: " + username);
        let service = _get_service_from_request(req);
        if (service != undefined && service != null)
        {
            if (config.debug)
                console.log("User '" + username + "' wants to use service: " + service);
            let ret = _app.api.check_permissions(username, service);
            if (ret.good)
            {
                if (config.debug)
                    console.log("Permission accorded for: " + username);
                return true;
            }
            else
                console.error(ret.error);
        }
        else
            console.error("Could not find service in request");
    }
    if (config.debug)
        console.log("No valid session found");
    return false;
}

function is_admin(user)
{
    return user && user.admin == true;
}

module.exports = {
    "validate_session": validate_session,
    "get_user_session": get_user_session,
    "is_admin": is_admin,
    "init": init,
}