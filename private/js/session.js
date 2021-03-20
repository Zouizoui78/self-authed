/* ************************************************************************* */
/* Session validation */

let _users = null;
let _configuration = null;

function init(configuration, users)
{
    _configuration = configuration;
    _users = users;
}

function checkPermissions(user, service)
{
    var permissions = user.permissions;
    if (_configuration.debug)
        console.log("Permissions for user: '" + user.username + "' -> " + user.permissions);
    if (permissions)
    {
        if (permissions.includes("all"))
            return true;
        if (permissions.includes(service))
            return true;
    }
    return false;
}

// http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
function getDomainFromUrl(url)
{
    if (!url)
        return "";
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0)
    {
        return match[2];
    }
    return url;
}

function getSubdomainFromDomain(url)
{
    var split = url.split('.');
    if (split.length > 0)
        return split[0];
    return null;
}

function getServiceFromRequest(req)
{
    let origin = req.headers.origin;
    if (origin == undefined)
        origin = req.headers.referer;
    let url = getDomainFromUrl(origin);
    if (!origin || !url)
    {
        console.error("Origin unknown: '" + origin + "' try adding Origin in http headers");
        return null;
    }
    if (_configuration.debug)
        console.log("Origin URL: " + url);
    if (_configuration.service_method == "subdomain")
        return getSubdomainFromDomain(url);
    else if (_configuration.service_method == "list")
    {
        if (_configuration.services)
            return _configuration.services[url];
        console.error("No service list configured !");
    }
}

function getUserSession(req)
{
    return req.session != undefined ? _users[req.session.user] : undefined;
}

function validateSession(req)
{
    var user = getUserSession(req);
    if (user != undefined)
    {
        if (_configuration.debug)
            console.log("Found session for: " + user.username);
        var service = getServiceFromRequest(req);
        if (service != undefined && service != null)
        {
            if (_configuration.debug)
                console.log("User '" + user.username + "' wants to use service: " + service);
            if (checkPermissions(user, service))
            {
                if (_configuration.debug)
                    console.log("Permission accorded for: " + user.username);
                return true;
            }
            else
                console.error(user.username + " does not have permissions for service: " + service);
        }
        else
            console.error("Could not find service in request");
    }
    if (_configuration.debug)
        console.log("No valid session found");
    return false;
}

module.exports = {
    "validateSession": validateSession,
    "getUserSession": getUserSession,
    "init": init,
}