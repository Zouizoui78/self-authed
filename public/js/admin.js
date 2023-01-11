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
    for (let key of keys)
    {
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
    for (let key of keys)
    {
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
    _user_modal.dom.all_permission.checked = false;
    remove_dom_node_children(_user_modal.dom.permissions);
}

function user_modal_set(user)
{
    console.log(`Showing user ${user.name} in modal`);

    _user_modal.dom.title.textContent = user.name;
    _user_modal.dom.username.value = user.name;
    _user_modal.dom.is_admin.checked = user.admin;

    let perms_list = user_modal_make_permissions_list(_services, user);
    _user_modal.dom.permissions.appendChild(perms_list);

    if (has_all_permissions(user))
    {
        _user_modal.dom.all_permission.click();
    }
}

function user_modal_get()
{
    let user = {
        name: _user_modal.dom.username.value,
        password: _user_modal.dom.password.value,
        admin: _user_modal.dom.is_admin.checked,
        permissions: user_modal_get_permissions_list()
    };
    return user;
}

function user_modal_save()
{
    let is_new_user = _user_modal.new;
    let ajax_method = is_new_user ? ajax.post : ajax.put;

    let user = user_modal_get();

    if (is_new_user)
        var username = user.name;
    else
        var username = _user_modal.dom.title.textContent;

    ajax_method(
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

function service_modal_get()
{
    return {
        name: _service_modal.dom.name.value,
        url: _service_modal.dom.url.value
    };
}

function service_modal_save()
{
    let is_new_service = _service_modal.new;
    let ajax_method = is_new_service ? ajax.post : ajax.put;

    let service = service_modal_get();

    if (is_new_service)
        var service_name = service.servicename;
    else
        var service_name = _service_modal.dom.title.textContent;

    ajax_method(
        "/api/services/" + service_name,
        service,
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
    _user_modal.dom.permissions = get_dom_node_by_id("user-modal-permissions");

    _user_modal.dom.all_permission = get_dom_node_by_id("user-modal-all-permission");
    _user_modal.dom.all_permission.addEventListener("change", () => {
        let items = _user_modal.dom.permissions.children[0].children;
        for (let item of items)
        {
            if (_user_modal.dom.all_permission.checked)
                item.classList.add("disabled");
            else
                item.classList.remove("disabled");

            let check = item.getElementsByTagName("input")[0];
            check.checked = false;
        }
    });

    _user_modal.dom.save_btn = get_dom_node_by_id("user-modal-save-btn");
    _user_modal.dom.save_btn.addEventListener("click", user_modal_save);

    let add_user_btn = get_dom_node_by_id("add-user-btn");
    add_user_btn.addEventListener("click", () => {
        console.log("New user");
        _user_modal.dom.title.textContent = "New user";
        _user_modal.new = true;

        let perms_list = user_modal_make_permissions_list(_services);
        _user_modal.dom.permissions.appendChild(perms_list);
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
    username.textContent = user.name;
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
        remove_user(user.name);
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

function user_modal_make_permissions_list(services, user)
{
    let service_list = Object.keys(services).sort();

    let ul = document.createElement("ul");
    ul.classList = "list-group";

    for (let service of service_list)
    {
        let li = document.createElement("li");
        li.classList = "list-group-item";

        let form = document.createElement("div");
        form.classList = "form-check";

        let check = document.createElement("input");
        check.id = `${service}-checkbox`;
        check.classList = "form-check-input";
        check.type = "checkbox";

        if (user)
            check.checked = user.permissions.includes(service);

        let label = document.createElement("label");
        label.classList = "form-check-label stretched-link";
        label.setAttribute("for", check.id);
        label.textContent = service;

        form.appendChild(check);
        form.appendChild(label);
        li.appendChild(form);
        ul.appendChild(li);
    }
    return ul;
}

function user_modal_get_permissions_list()
{
    if (_user_modal.dom.all_permission.checked)
        return ["all"];

    let ret = [];
    let items = _user_modal.dom.permissions.children[0].children;
    for (let item of items)
    {
        if (item.getElementsByTagName("input")[0].checked)
        {
            let service = item.getElementsByTagName("label")[0].textContent;
            ret.push(service);
        }
    }
    return ret;
}
