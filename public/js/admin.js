let _modal = {}

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
    ajax.post("/api/add_user", {
        username: _add_user.username.value,
        password: _add_user.password.value,
    },
    add_user_validate,
    add_user_error);
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
    ajax.post("/api/set_permissions", {
        username: _permissions.username.value,
        permissions: _permissions.list.value,
    },
    set_permissions_validate,
    set_permissions_error);
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
    ajax.post("/api/add_service", {
        servicename: _add_service.name.value,
        serviceurl: _add_service.url.value,
    },
    add_service_validate,
    add_service_error);
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

function remove_user(username)
{
    ajax.delete(
        `/api/users/${username}`,
        load_users,
        load_users_err
    );
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
    ajax.post("/api/remove_service", {
        servicename: _remove.service.value,
    },
    remove_service_validate,
    remove_service_error);
}

function load_users()
{
    ajax.get(
        "/api/users",
        null,
        load_user_table,
        load_users_err
    );
}

function user_table_new_row(user)
{
    let new_row = document.createElement("tr");

    let username = document.createElement("td");
    username.textContent = user.username;
    new_row.appendChild(username);

    let admin = document.createElement("td");
    admin.classList.add("text-center");
    if (user.admin)
    {
        admin.innerHTML = "<span class='fa fa-check'></span>";
    }
    new_row.appendChild(admin);

    let perms = document.createElement("td");
    for (let i = 0 ; i < user.permissions.length ; i++)
    {
        perms.innerHTML += `<span class='badge bg-primary'>${user.permissions[i]}</span><span> </span>`;
    }
    new_row.appendChild(perms);

    let buttons = document.createElement("td");
    buttons.classList.add("text-end");
    let edit_button = document.createElement("button");
    edit_button.classList = "btn btn-secondary btn-sm fa fa-edit";
    let remove_button = document.createElement("button");
    remove_button.classList = "btn btn-danger btn-sm fa fa-trash";
    let space = document.createElement("span");
    space.textContent = " ";
    buttons.appendChild(edit_button);
    buttons.appendChild(space);
    buttons.appendChild(remove_button);
    new_row.appendChild(buttons);

    remove_button.addEventListener("click", () => {
        remove_user(user.username);
    });

    return new_row;
}

function load_user_table(res, req)
{
    let users = {};
    if (typeof(res) === "string")
    {
        users = JSON.parse(res);
    }

    let table_body = get_dom_node_by_id("user-table-body");
    if (!table_body)
        return;

    remove_dom_node_children(table_body);

    for (key in users)
    {
        let new_row = user_table_new_row(users[key]);
        table_body.appendChild(new_row);
    }
}

function load_users_err(err)
{
    console.error(err);
}

function modal_init()
{
    _modal.username.value = "";
    _modal.password.value = "";
    _modal.is_admin.checked = false;
}

function modal_load_user(user)
{
    _modal.username.validate = user.username;
    _modal.password.value = user.password;
    _modal.is_admin.checked = user.admin;
}

function modal_get_user()
{
    console.log("Not implemented");
}

function modal_save_user()
{
    console.log("Not implemented");
}

document.addEventListener("DOMContentLoaded", function(event)
{
    load_users();
    _modal.username = get_dom_node_by_id("edit-user-name");
    _modal.password = get_dom_node_by_id("edit-user-password");
    _modal.is_admin = get_dom_node_by_id("edit-user-is-admin");
    _modal.save = get_dom_node_by_id("edit-user-save-btn");
    _modal.cancel = get_dom_node_by_id("edit-user-cancel-btn");

    if (_modal.save)
        _modal.save.addEventListener("click", modal_save_user);

    if (_modal.cancel)
        _modal.cancel.addEventListener("click", modal_init);
});
