const fs = require('fs');
const { config } = require('process');

function result(good, error_message)
{
    return {good: good, error: error_message};
}

/* ************************************************************************* */
/* Configuration */

function read_json(path)
{
    try
    {
        let rawdata = fs.readFileSync(path);
        return JSON.parse(rawdata);
    }
    catch(err)
    {
        console.error(err.message);
        return null;
    }
}

function read_configuration(path)
{
    console.log("Loading configuration: " + path);

    let configuration = read_json(path);

    if (configuration == null)
        return null;

    if (configuration.port == undefined)
        configuration.port = 24080;

    if (configuration.service_method == undefined)
        configuration.service_method = "subdomain"

    if (configuration.password_min_length == undefined)
        configuration.password_min_length = 5;

    if(configuration.cookie_domain == undefined)
    {
        console.error("Required setting 'cookie_domain' not found in configuration.");
        return null;
    }

    console.log("Service retrieval from: " + configuration.service_method);
    if (configuration.service_method == "list" && !configuration.services)
    {
        console.error("No service list configured !");
        return null;
    }

    if (configuration.services)
    {
        const services = configuration.services;
        const _url_to_services = {};
        for (const service_name in services)
        {
            _url_to_services[services[service_name]] = service_name;
        }
        configuration._url_to_services = _url_to_services;
    }
    return configuration;
}

/* ************************************************************************* */
/* Users and tokens */

function read_users(path)
{
    console.log("Loading user file: " + path);
    let json = read_json(path);
    if (json == null)
        return {};
    let ret = {};
    for (var i = 0; i < json.length; ++i)
    {
        let user = json[i];
        ret[user.username] = {
            username: user.username,
            password: user.password,
            permissions: user.permissions,
            admin: user.admin
        };
    }
    return ret;
}

function write_json(data, path)
{
    try
    {
        let json_data = JSON.stringify(data, null, 2);
        fs.writeFileSync(path, json_data);
        return true;
    }
    catch (err)
    {
        console.error(err.message);
    }
    return false;
}

function update_object(toupdate, updater)
{
    // clear
    for (var key in toupdate)
    {
        if (toupdate.hasOwnProperty(key))
        {
            delete toupdate[key];
        }
    }
    for (var key in updater)
    {
        if (updater.hasOwnProperty(key))
        {
            toupdate[key] = updater[key];
        }
    }
}

function update_list(toupdate, updater)
{
    // clear
    toupdate.length = 0;
    for (var i = 0; i < updater.length; ++i)
    {
        toupdate.push(updater[i]);
    }
}

// http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
function get_domain_from_url(url)
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

function get_subdomain_from_domain(url)
{
    var split = url.split('.');
    if (split.length > 0)
        return split[0];
    return null;
}

module.exports = {
    "result": result,
    "update_object": update_object,
    "update_list": update_list,
    "read_json": read_json,
    "write_json": write_json,
    "read_users": read_users,
    "read_configuration": read_configuration,
    "get_subdomain_from_domain": get_subdomain_from_domain,
    "get_domain_from_url": get_domain_from_url,
}