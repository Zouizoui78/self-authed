var _username;
var _password;

var _validation_username;
var _validation_password;

function clear_login_validation()
{
    _validation_username.innerHTML = "";
    _validation_password.innerHTML = "";
    _username.classList.remove("is-invalid");
    _password.classList.remove("is-invalid");
}

function do_login()
{
    clear_login_validation();
    ajax.post("/login", {
        name: _username.value,
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
    var log_btn = get_dom_node_by_id("log-btn");
    if (log_btn)
        log_btn.addEventListener("click", do_login);
    _username = get_dom_node_by_id("username");
    _validation_username = get_dom_node_by_id("validation-username");
    _password = get_dom_node_by_id("password");
    _validation_password = get_dom_node_by_id("validation-password");
});