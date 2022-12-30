var _new_user = {}
var _new_service = {}
var _permissions = {}
var _remove = {}

function new_user()
{
}

function set_permissions()
{
}

function new_service()
{
}

function remove_user()
{
}

function remove_service()
{
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Admin loaded");

    _new_user.login = get_doc_id("new-user-name");
    _new_user.password = get_doc_id("new-user-password");
    _new_user.validate = get_doc_id("new-user-validation-btn");
    if (_new_user.validate)
        _new_user.validate.addEventListener("click", new_user);

    _permissions.user = get_doc_id("permissions-user-name");
    _permissions.list = get_doc_id("permissions-services-names");
    _permissions.validate = get_doc_id("permissions-validation-btn");
    if (_permissions.validate)
        _permissions.validate.addEventListener("click", set_permissions);

    _new_service.name = get_doc_id("new-service-name");
    _new_service.url = get_doc_id("new-service-url");
    _new_service.validate = get_doc_id("new-service-validation-btn");
    if (_new_service.validate)
        _new_service.validate.addEventListener("click", new_service);

    _remove.user = get_doc_id("remove-user-name");
    _remove.validate_user = get_doc_id("remove-user-validation-btn");
    if (_remove.validate_user)
        _remove.validate_user.addEventListener("click", remove_user);

    _remove.service = get_doc_id("remove-service-name");
    _remove.validate_service = get_doc_id("remove-service-validation-btn");
    if (_remove.validate_service)
        _remove.validate_service.addEventListener("click", remove_service);

});