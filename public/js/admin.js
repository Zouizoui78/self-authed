var _add_user = {}
var _add_service = {}
var _permissions = {}
var _remove = {}

function add_user_validate()
{
    console.log("User added: " + _add_user.username.value);
    _add_user.username.value = "";
    _add_user.password.value = "";
}

function add_user_error(err)
{
    console.error("User not added: " + err)
}

function add_user()
{
    if (!_add_user.username || !_add_user.password)
        return ;
    loading_add();
    ajax.post("/api/add_user", {
        username: _add_user.username.value,
        password: _add_user.password.value,
    },
    add_user_validate,
    add_user_error,
    loading_remove);
}

function set_permissions_validate()
{
    console.log("User permissions changed: " +  _permissions.username.value);
    _permissions.username.value = "";
    _permissions.list.value = "";
}

function set_permissions_error(err)
{
    console.error("User permissions not changed: " + err)
}

function set_permissions()
{
    if (!_permissions.username || !_permissions.list)
        return ;
    loading_add();
    ajax.post("/api/set_permissions", {
        username: _permissions.username.value,
        permissions: _permissions.list.value,
    },
    set_permissions_validate,
    set_permissions_error,
    loading_remove);
}

function add_service_validate()
{
    console.log("Service added: " +  _add_service.name.value);
    _add_service.name.value = "";
    _add_service.url.value = "";
}

function add_service_error(err)
{
    console.error("Service not added: " + err)
}

function add_service()
{
    if (!_add_service.name || !_add_service.url)
        return ;
    loading_add();
    ajax.post("/api/add_service", {
        name: _add_service.name.value,
        url: _add_service.url.value,
    },
    add_service_validate,
    add_service_error,
    loading_remove);
}

function remove_user_validate()
{
    console.log("User removed: " +  _remove.username.value);
    _remove.username.value = "";
}

function remove_user_error(err)
{
    console.error("User not removed: " + err)
}

function remove_user()
{
    if (!_remove.username)
        return ;
    loading_add();
    ajax.post("/api/remove_user", {
        username: _remove.username.value,
    },
    remove_user_validate,
    remove_user_error,
    loading_remove);
}

function remove_service_validate()
{
    console.log("Service removed: " +  _remove.service.value);
    _remove.service.value = "";
}

function remove_service_error(err)
{
    console.error("Service not removed: " + err)
}

function remove_service()
{
    if (!_remove.service)
        return ;
    loading_add();
    ajax.post("/api/remove_service", {
        username: _remove.service.value,
    },
    remove_service_validate,
    remove_service_error,
    loading_remove);
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Admin loaded");

    _add_user.username = get_doc_id("new-user-name");
    _add_user.password = get_doc_id("new-user-password");
    _add_user.validate = get_doc_id("new-user-validation-btn");
    if (_add_user.validate)
        _add_user.validate.addEventListener("click", add_user);

    _permissions.username = get_doc_id("permissions-user-name");
    _permissions.list = get_doc_id("permissions-services-names");
    _permissions.validate = get_doc_id("permissions-validation-btn");
    if (_permissions.validate)
        _permissions.validate.addEventListener("click", set_permissions);

    _add_service.name = get_doc_id("new-service-name");
    _add_service.url = get_doc_id("new-service-url");
    _add_service.validate = get_doc_id("new-service-validation-btn");
    if (_add_service.validate)
        _add_service.validate.addEventListener("click", add_service);

    _remove.username = get_doc_id("remove-user-name");
    _remove.validate_user = get_doc_id("remove-user-validation-btn");
    if (_remove.validate_user)
        _remove.validate_user.addEventListener("click", remove_user);

    _remove.service = get_doc_id("remove-service-name");
    _remove.validate_service = get_doc_id("remove-service-validation-btn");
    if (_remove.validate_service)
        _remove.validate_service.addEventListener("click", remove_service);

});