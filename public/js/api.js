var ajax = {};
ajax.req = function()
{
    if (typeof XMLHttpRequest !== 'undefined')
    {
        return new XMLHttpRequest();
    }
    var versions = [
        "MSXML2.XmlHttp.6.0",
        "MSXML2.XmlHttp.5.0",
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0",
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++)
    {
        try {
            xhr = new ActiveXObject(versions[i]);
            break;
        } catch (e) {
        }
    }
    return xhr;
};

ajax.send = function (url, method, data, async, onSuccess, onError, onEnd)
{
    if (async === undefined)
        async = true;
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function()
    {
        // XMLHttpRequest.DONE == 4
        if (x.readyState == XMLHttpRequest.DONE)
        {
            if (x.status >= 200 && x.status < 300)
            {
                console.log(x.responseText);
                console.log(x.statusText);
                console.log(x.getAllResponseHeaders());
                console.log(x.responseURL);
                onSuccess(x.responseText);
            }
            else if (x.status >= 400)
            {
                onError(x.responseText);
            }
            onEnd();
        }
    };
    if (method == 'POST')
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    x.send(data)
};

ajax.get = function (url, data, async, onSuccess, onError, onEnd)
{
    var query = [];
    for (var key in data)
    {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + (query.length ? '?' + query.join('&') : ''), 'GET',
                null, async, onSuccess, onError, onEnd);
};

ajax.post = function (url, data, async, onSuccess, onError, onEnd)
{
    var query = [];
    for (var key in data)
    {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, 'POST', query.join('&'), async, onSuccess, onError, onEnd);
};