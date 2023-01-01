var _list;
var _password;
var _validation_password;
var _password_repeat;
var _validation_password_repeat;
var _valid_change;

function update_user_permissions(lst)
{
    if (!lst || !_list)
        return ;
    if (typeof(lst) == "string")
        lst = JSON.parse(lst);
    var innerHtml = "";
    for (var i = 0; i < lst.length; ++i)
    {
        innerHtml += "<li class='list-group-item list-group-item-action'>" + lst[i] + "</li>\n";
    }
    _list.innerHTML = innerHtml;
}

function load_user_permissions()
{
    if (!_list)
        return ;
    ajax.get("/api/permissions", null,
        update_user_permissions,
        function(err)
        {
            console.error(err);
        });
}

function password_check_same()
{
    if (_password.value != _password_repeat.value)
    {
        _validation_password_repeat.innerHTML = "Passwords are not the same";
        _password_repeat.classList.add("is-invalid");
        console.error("Passwords are not the same.");
        return false;
    }
    return true;
}

function password_clear_fields()
{
    _password.value = "";
    _password_repeat.value = "";
}

function password_clear_hints()
{
    _valid_change.innerHTML = "";
    _validation_password.innerHTML = "";
    _validation_password_repeat.innerHTML = "";
    _password.classList.remove("is-valid");
    _password.classList.remove("is-invalid");
    _password_repeat.classList.remove("is-valid");
    _password_repeat.classList.remove("is-invalid");
}

function password_validate()
{
    password_clear_fields();
    password_clear_hints();
    _valid_change.innerHTML = "Done";
    _password.classList.add("is-valid");
    _password_repeat.classList.add("is-valid");
    console.log("Password changed");
}

function password_error(err)
{
    var data = JSON.parse(err);
    // if (data.code == 1)
    // {
    //     _validation_username.innerHTML = data.error;
    //     _username.classList.add("is-invalid");
    // }
    // else if (data.code == 2)
    // {
    //     _validation_password.innerHTML = data.error;
    //     _password.classList.add("is-invalid");
    // }
    password_clear_hints();
    _validation_password_repeat.innerHTML = data.error;
    _password.classList.add("is-invalid");
    _password_repeat.classList.add("is-invalid");
}

function password_change()
{
    if (!_password || !_validation_password
        || !_password_repeat || !_validation_password_repeat
        || !_valid_change)
        return ;
    if (password_check_same())
    {
        ajax.post("/api/change_password", {
            password: _password.value,
        }, password_validate,
        password_error);
    }
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Home loaded");
    _list = get_dom_node_by_id("permissions");
    _password = get_dom_node_by_id("password");
    _validation_password = get_dom_node_by_id("validation-password");
    _password_repeat = get_dom_node_by_id("password-repeat");
    _validation_password_repeat = get_dom_node_by_id("validation-password-repeat");
    _valid_change = get_dom_node_by_id("valid-change");
    var change_password_btn = get_dom_node_by_id("change-password-btn");
    if (change_password_btn)
        change_password_btn.addEventListener("click", password_change);
    load_user_permissions();
    //forms_add_validation();
});