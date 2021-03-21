var _list;
var _password;
var _password_repeat;

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
    loading_add();
    ajax.get("/api/permissions", null,
        update_user_permissions,
        function(err)
        {
            console.error(err);
        },
        loading_remove);
}

function password_check_same()
{
    if (_password.value != _password_repeat.value)
    {
        console.error("Passwords are not the same");
        return false;
    }
    return true;
}

function passsword_clear_fields()
{
    _password.value = "";
    _password_repeat.value = "";
}

function password_validate()
{
    passsword_clear_fields();
    // TODO print done on form
}

function password_error(err)
{
    console.error(err);
    // TODO print error on form
}

function password_change()
{
    if (!_password)
        return ;
    loading_add();
    if (password_check_same())
    {
        ajax.post("/api/change_password", {
            password: _password.value,
        }, password_validate,
        password_error,
        loading_remove);
    }
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Home loaded");
    _list = document.getElementById("permissions");
    _password = document.getElementById("password");
    _password_repeat = document.getElementById("password-repeat");
    load_user_permissions();
    forms_add_validation();
});