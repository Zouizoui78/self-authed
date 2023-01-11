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

/**
 * Create a node containing badges listing the elements of the given array.
 * @param {string} tag Tag of the new container node
 * @param {Array} strs Array of strings to create spans for
 * @param {bool} sort Sort the array or not
 * @returns DOM element of the given tag containing a badge for each string from the array
 */
function array_to_pretty_dom_el(tag, strs, sort = true)
{
    if (sort)
        strs.sort()

    let el = document.createElement(tag);
    for (let str of strs)
    {
        el.innerHTML += `<span class='badge bg-primary me-1'>${str}</span>`;
    }

    return el;
}

function add_loading()
{
    get_dom_node_by_id("loader").style.display = "block";
    get_dom_node_by_id("grey_screen").style.display = "block";
}

function end_loading()
{
    get_dom_node_by_id("loader").style.display = "none";
    get_dom_node_by_id("grey_screen").style.display = "none";
}