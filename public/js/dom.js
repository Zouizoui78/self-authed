function get_dom_node_by_id(id)
{
    var ret = document.getElementById(id);
    if (!ret)
        console.error("Could not find id: " + id);
    return ret;
}

function remove_dom_node_children(node)
{
    node.innerHTML = "";
}