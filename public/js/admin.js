let _users = {};
let _services = {};

let _user_modal = {
    dom: {},
    bs: {}
}

let _service_modal = {
    dom: {},
    bs: {}
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
    load_users_and_services();
}

function remove_user_error(err)
{
    console.error("User not removed: " + err)
}

function remove_service_success(res, req)
{
    console.log("Service removed: " +  req.responseURL);
    load_users_and_services();
}

function remove_service_error(err)
{
    console.error("Service not removed: " + err)
}

function remove_service(service_name)
{
    ajax.delete(
        `/api/services/${service_name}`,
        remove_service_success,
        remove_service_error
    );
}

function load_users()
{
    ajax.get(
        "/api/users",
        null,
        load_users_success,
        load_users_err
    );
}

function load_users_success(res, req)
{
    if (typeof(res) === "string")
    {
        _users = JSON.parse(res);
    }
    load_user_table(_users);
    console.log("Loaded users table");
}

function load_users_err(err)
{
    console.error(err);
}

function load_user_table(users)
{
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

function load_services()
{
    ajax.get(
        "/api/services",
        null,
        load_services_success,
        load_services_err
    );
}

function load_services_success(res, req)
{
    if (typeof(res) === "string")
    {
        _services = JSON.parse(res);
    }

    load_service_table(_services);
    console.log("Loaded services table");
}

function load_services_err(err)
{
    console.error(err);
}

function load_users_and_services()
{
    console.log("Loading users and services...");
    ajax.get(
        "/api/users",
        null,
        (res, req) => {
            load_services();
            load_users_success(res, req);
        },
        load_users_err
    );
}

function load_service_table(services)
{
    let table_body = get_dom_node_by_id("service-table-body");
    if (!table_body)
        return;

    remove_dom_node_children(table_body);

    let keys = Object.keys(services).sort();
    for (i in keys)
    {
        let key = keys[i];
        let new_row = service_table_new_row(key, services[key]);
        table_body.appendChild(new_row);
    }
}

function user_modal_reset()
{
    console.log("User modal reset");
    _user_modal.dom.title.textContent = "TITLE PLACEHOLDER";
    _user_modal.new = false;
    _user_modal.dom.username.value = "";
    _user_modal.dom.password.value = "";
    _user_modal.dom.is_admin.checked = false;
}

function user_modal_set(user)
{
    console.log(`Showing user ${user.username} in modal`);
    _user_modal.dom.title.textContent = user.username;
    _user_modal.dom.username.value = user.username;
    _user_modal.dom.is_admin.checked = user.admin;
}

function user_modal_get()
{
    let user = {
        username: _user_modal.dom.username.value,
        password: _user_modal.dom.password.value,
        admin: _user_modal.dom.is_admin.checked,
        permissions: []
    };
    return user;
}

function user_modal_save()
{
    let user = user_modal_get();
    let method = _user_modal.new ? ajax.post : ajax.put;
    if (_user_modal.new)
        var username = user.username;
    else
        var username = _user_modal.dom.title.textContent

    method(
        "/api/users/" + username,
        user,
        user_modal_save_success,
        user_modal_save_error
    );
}

function user_modal_save_success()
{
    _user_modal.bs.hide();
    load_users_and_services();
}

function user_modal_save_error(err)
{
    console.error(err);
}

function service_modal_reset()
{
    console.log("Service modal reset");
    _service_modal.dom.title.textContent = "TITLE PLACEHOLDER";
    _service_modal.new = false;
    _service_modal.dom.name.value = "";
    _service_modal.dom.url.value = "";
}

function service_modal_set(name, url)
{
    console.log(`Showing service ${name} in modal`);
    _service_modal.dom.title.textContent = name;
    _service_modal.dom.name.value = name;
    _service_modal.dom.url.value = url;
}


function service_modal_save()
{
    let method = _service_modal.new ? ajax.post : ajax.put;
    if (_service_modal.new)
        var service_name = _service_modal.dom.name.value;
    else
        var service_name = _service_modal.dom.title.textContent

    method(
        "/api/services/" + service_name,
        {
            servicename: _service_modal.dom.name.value,
            serviceurl: _service_modal.dom.url.value
        },
        service_modal_save_success,
        service_modal_save_error
    );
}

function service_modal_save_success()
{
    _service_modal.bs.hide();
    load_services();
}

function service_modal_save_error(err)
{
    console.error(err);
}

document.addEventListener("DOMContentLoaded", function(event)
{
    load_users_and_services();

    // User modal
    // We use a tmp variale here to avoid overwriting
    // modal attributes with get_dom_node_by_id
    let user_modal_tmp = get_dom_node_by_id("user-modal");
    user_modal_tmp.addEventListener("hidden.bs.modal", user_modal_reset);

    _user_modal.dom.title = get_dom_node_by_id("user-modal-title");
    _user_modal.dom.username = get_dom_node_by_id("user-modal-username");
    _user_modal.dom.password = get_dom_node_by_id("user-modal-password");
    _user_modal.dom.is_admin = get_dom_node_by_id("user-modal-is-admin");

    _user_modal.dom.save_btn = get_dom_node_by_id("user-modal-save-btn");
    _user_modal.dom.save_btn.addEventListener("click", user_modal_save);

    let add_user_btn = get_dom_node_by_id("add-user-btn");
    add_user_btn.addEventListener("click", () => {
        console.log("New user");
        _user_modal.dom.title.textContent = "New user";
        _user_modal.new = true;
    });

    _user_modal.bs = new bootstrap.Modal("#user-modal");

    // Service modal
    let service_modal_tmp = get_dom_node_by_id("service-modal");
    service_modal_tmp.addEventListener("hidden.bs.modal", service_modal_reset);

    _service_modal.dom.title = get_dom_node_by_id("service-modal-title");
    _service_modal.dom.name = get_dom_node_by_id("service-modal-name");
    _service_modal.dom.url = get_dom_node_by_id("service-modal-url");

    _service_modal.dom.save_btn = get_dom_node_by_id("service-modal-save-btn");
    _service_modal.dom.save_btn.addEventListener("click", service_modal_save);

    let add_service_btn = get_dom_node_by_id("add-service-btn");
    add_service_btn.addEventListener("click", () => {
        console.log("New service");
        _service_modal.dom.title.textContent = "New service";
        _service_modal.new = true;
    });

    _service_modal.bs = new bootstrap.Modal("#service-modal");
});

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
    edit_btn.setAttribute("data-bs-target", "#user-modal");

    let remove_btn = document.createElement("button");
    remove_btn.classList = "btn btn-danger btn-sm fa fa-trash";

    let space = document.createElement("span");
    space.textContent = " ";

    buttons.appendChild(edit_btn);
    buttons.appendChild(space);
    buttons.appendChild(remove_btn);
    new_row.appendChild(buttons);

    edit_btn.addEventListener("click", () => {
        user_modal_set(user);
    });

    remove_btn.addEventListener("click", () => {
        remove_user(user.username);
    });

    return new_row;
}

function service_table_new_row(name, url)
{
    let tr = document.createElement("tr");

    let name_td = document.createElement("td");
    name_td.textContent = name;
    tr.appendChild(name_td);

    let url_td = document.createElement("td");
    url_td.textContent = url;
    tr.appendChild(url_td);

    let users_list = list_service_users(_users, name);
    let users_td = array_to_pretty_dom_el("td", users_list);
    tr.appendChild(users_td);

    let buttons = document.createElement("td");
    buttons.classList.add("text-end");

    let edit_btn = document.createElement("button");
    edit_btn.classList = "btn btn-secondary btn-sm fa fa-edit";
    edit_btn.setAttribute("data-bs-toggle", "modal");
    edit_btn.setAttribute("data-bs-target", "#service-modal");

    let remove_btn = document.createElement("button");
    remove_btn.classList = "btn btn-danger btn-sm fa fa-trash";

    let space = document.createElement("span");
    space.textContent = " ";

    buttons.appendChild(edit_btn);
    buttons.appendChild(space);
    buttons.appendChild(remove_btn);
    tr.appendChild(buttons);

    edit_btn.addEventListener("click", () => {
        service_modal_set(name, url);
    });

    remove_btn.addEventListener("click", () => {
        remove_service(name);
    });

    return tr;
}
