let _modal_dom = {};
let _modal_bs = {};

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

function remove_user(username)
{
    ajax.delete(
        `/api/users/${username}`,
        remove_user_success,
        remove_user_error
    );
}

function remove_user_success(res, req)
{
    console.log("User removed: " + req.responseURL);
    load_users();
}

function remove_user_error(err)
{
    console.error("User not removed: " + err)
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
    if (user.admin && user.admin === true)
    {
        admin.innerHTML = "<span class='fa fa-check'></span>";
    }
    new_row.appendChild(admin);

    let perms = array_to_pretty_dom_el("td", user.permissions);
    new_row.appendChild(perms);

    let buttons = document.createElement("td");
    buttons.classList.add("text-end");

    let edit_btn = document.createElement("button");
    edit_btn.classList = "btn btn-secondary btn-sm fa fa-edit";
    edit_btn.setAttribute("data-bs-toggle", "modal");
    edit_btn.setAttribute("data-bs-target", "#edit-modal");

    let remove_btn = document.createElement("button");
    remove_btn.classList = "btn btn-danger btn-sm fa fa-trash";

    let space = document.createElement("span");
    space.textContent = " ";

    buttons.appendChild(edit_btn);
    buttons.appendChild(space);
    buttons.appendChild(remove_btn);
    new_row.appendChild(buttons);

    edit_btn.addEventListener("click", () => {
        modal_load_user(user);
    });

    remove_btn.addEventListener("click", () => {
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

    let keys = Object.keys(users).sort();
    for (i in keys)
    {
        let key = keys[i];
        let new_row = user_table_new_row(users[key]);
        table_body.appendChild(new_row);
    }
}

function load_users_err(err)
{
    console.error(err);
}

function modal_reset()
{
    console.log("Modal reset");
    _modal_dom.title.textContent = "TITLE PLACEHOLDER";
    _modal_dom.new_user = false;
    _modal_dom.username.value = "";
    _modal_dom.password.value = "";
    _modal_dom.is_admin.checked = false;
}

function modal_load_user(user)
{
    console.log(`Loading user ${user.username} in modal`);
    _modal_dom.title.textContent = `${user.username}`;
    _modal_dom.username.value = user.username;
    _modal_dom.is_admin.checked = user.admin;
}

function modal_get_user()
{
    let user = {
        username: _modal_dom.username.value,
        password: _modal_dom.password.value,
        admin: _modal_dom.is_admin.checked,
        permissions: [ "placeholder" ]
    };
    return user;
}

function modal_save_user()
{
    let user = modal_get_user();
    let method = _modal_dom.new_user ? ajax.post : ajax.put;

    method(
        "/api/users/" + _modal_dom.title.textContent,
        user,
        modal_save_user_success,
        modal_save_user_error
    );
}

function modal_save_user_success()
{
    _modal_bs.hide();
    load_users();
}

function modal_save_user_error(err)
{
    console.error(err);
}

document.addEventListener("DOMContentLoaded", function(event)
{
    load_users();

    // We use a tmp variale here to avoid overwriting
    // modal attributes with get_dom_node_by_id
    let modal_tmp = get_dom_node_by_id("edit-modal");
    modal_tmp.addEventListener("hidden.bs.modal", modal_reset);

    _modal_dom.title = get_dom_node_by_id("edit-modal-title");
    _modal_dom.username = get_dom_node_by_id("edit-user-name");
    _modal_dom.password = get_dom_node_by_id("edit-user-password");
    _modal_dom.is_admin = get_dom_node_by_id("edit-user-is-admin");

    _modal_dom.save_btn = get_dom_node_by_id("edit-user-save-btn");
    _modal_dom.save_btn.addEventListener("click", modal_save_user);

    let add_user_btn = get_dom_node_by_id("add-user-btn");
    add_user_btn.addEventListener("click", () => {
        console.log("New user");
        _modal_dom.title.textContent = "New user";
        _modal_dom.new_user = true;
    });

    _modal_bs = new bootstrap.Modal("#edit-modal");
});
