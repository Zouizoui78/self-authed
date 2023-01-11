var ajax = {};

ajax.x = function()
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

ajax.send = function(url, method, data, onSuccess, onError, onEnd, async)
{
    if (async === undefined)
        async = true;

    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function()
    {
        if (x.readyState == XMLHttpRequest.DONE)
        {
            if (x.status >= 200 && x.status < 300)
            {
                if (onSuccess)
                    onSuccess(x.responseText, x);
            }
            else if (x.status >= 400)
            {
                if (onError)
                    onError(x.responseText, x);
            }
            if (onEnd)
                onEnd(x);
        }
    };
    if (method == 'POST' || method == 'PUT')
        x.setRequestHeader('Content-type', 'application/json');

    if (!data)
        data = "";
    x.send(data);
};

ajax.get = function(url, data, onSuccess, onError, onEnd, async)
{
    ajax.send(url, 'GET', null, onSuccess, onError, onEnd, async);
};

ajax.post = function(url, data, onSuccess, onError, onEnd, async)
{
    ajax.send(url, 'POST', JSON.stringify(data), onSuccess, onError, onEnd, async);
};

ajax.put = function(url, data, onSuccess, onError, onEnd, async)
{
    ajax.send(url, 'PUT', JSON.stringify(data), onSuccess, onError, onEnd, async);
};

ajax.delete = function(url, onSuccess, onError, onEnd, async)
{
    ajax.send(url, 'DELETE', null, onSuccess, onError, onEnd, async);
};