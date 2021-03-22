var _username;
var _password;

var _validation_username;
var _validation_password;

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
        var data = JSON.parse(err);
        console.error(data);
        if (data.code == 1)
        {
            _validation_username.innerHTML = data.error;
            _username.classList.add("is-invalid");
        }
        else if (data.code == 2)
        {
            _validation_password.innerHTML = data.error;
            _password.classList.add("is-invalid");
        }
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
    _validation_username = document.getElementById("validation_username");
    _validation_password = document.getElementById("validation_password");
});