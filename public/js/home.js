var _dom = {};

function update_user_permissions(permissions)
{
    if (!permissions || !_dom.permissions)
        return ;
    if (typeof(permissions) == "string")
        permissions = JSON.parse(permissions);
    let perms_el = array_to_pretty_dom_el("div", permissions);
    _dom.permissions.appendChild(perms_el);
}

function load_user_permissions()
{
    if (!_dom.permissions)
        return ;
    ajax.get(
        `/api/users/${_dom.username.textContent}/permissions`,
        null,
        update_user_permissions,
        function(err)
        {
            console.error(err);
        }
    );
}

function password_check_same()
{
    if (_dom.password.value != _dom.password_repeat.value)
    {
        _dom.validation_password_repeat.innerHTML = "Passwords are not the same";
        _dom.password_repeat.classList.add("is-invalid");
        console.error("Passwords are not the same.");
        return false;
    }
    return true;
}

function password_clear_fields()
{
    _dom.password.value = "";
    _dom.password_repeat.value = "";
}

function password_clear_hints()
{
    _dom.valid_change.innerHTML = "";
    _dom.validation_password.innerHTML = "";
    _dom.validation_password_repeat.innerHTML = "";
    _dom.password.classList.remove("is-valid");
    _dom.password.classList.remove("is-invalid");
    _dom.password_repeat.classList.remove("is-valid");
    _dom.password_repeat.classList.remove("is-invalid");
}

function password_validate()
{
    password_clear_fields();
    password_clear_hints();
    _dom.valid_change.innerHTML = "Done";
    _dom.password.classList.add("is-valid");
    _dom.password_repeat.classList.add("is-valid");
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
    _dom.validation_password_repeat.innerHTML = data.error;
    _dom.password.classList.add("is-invalid");
    _dom.password_repeat.classList.add("is-invalid");
}

function password_change()
{
    if (!_dom.password || !_dom.validation_password
        || !_dom.password_repeat || !_dom.validation_password_repeat
        || !_dom.valid_change)
        return ;
    if (password_check_same())
    {
        ajax.put(
            `/api/users/${_dom.username.textContent}/password`,
            {
                password: _dom.password.value,
            },
            password_validate,
            password_error
        );
    }
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Home loaded");
    _dom.username = get_dom_node_by_id("username");
    _dom.permissions = get_dom_node_by_id("permissions");
    _dom.password = get_dom_node_by_id("password");
    _dom.validation_password = get_dom_node_by_id("validation-password");
    _dom.password_repeat = get_dom_node_by_id("password-repeat");
    _dom.validation_password_repeat = get_dom_node_by_id("validation-password-repeat");
    _dom.valid_change = get_dom_node_by_id("valid-change");
    var change_password_btn = get_dom_node_by_id("change-password-btn");
    if (change_password_btn)
        change_password_btn.addEventListener("click", password_change);
    load_user_permissions();
    //forms_add_validation();
});