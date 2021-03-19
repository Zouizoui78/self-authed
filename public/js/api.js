function updateScriptList(lst)
{
    console.log(lst);
}

function getScriptList()
{
    ajax.get("/script_list", null, updateScriptList,
                            function(e) { console.error(e); },
                            function() {})
}

function test()
{
    ajax.get("/login", null, function(w) { console.log(w); },
                                function(e) { console.error(e); },
                                function() { console.log("ended"); });
    ajax.get("/error", null, function(w) { console.log(w); },
                                function(e) { console.error(e); },
                                function() { console.log("ended"); });
    ajax.get("/auth", null, function(w) { console.log(w); },
                                function(e) { console.error(e); },
                                function() { console.log("ended"); });
}