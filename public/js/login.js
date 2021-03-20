var _username;
var _password;

function do_login()
{
    ajax.post("/login", {
        username: _username.value,
        password: _password.value
    }, function(e)
    {
        document.location.reload();
    },
    function(err)
    {
        console.error(err);
    });
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Loaded login");
    var log_btn = document.getElementById("log-btn");
    if (log_btn)
        log_btn.addEventListener("click", do_login);
    _username = document.getElementById("username");
    _password = document.getElementById("password");
});