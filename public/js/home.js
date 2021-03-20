var _list;

function update_user_permissions(lst)
{
    if (!lst || !_list)
        return ;
    console.log(lst, typeof(lst));
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
        function(lst)
        {
            update_user_permissions(JSON.parse(lst));
        },
        function(err)
        {
            console.error(err);
        },
        function()
        {
            // remove loading
        });
}

document.addEventListener("DOMContentLoaded", function(event)
{
    console.log("Home loaded");
    _list = document.getElementById("permissions");
    load_user_permissions();
});