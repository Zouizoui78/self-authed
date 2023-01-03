function forms_add_validation()
{
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation');

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function(form)
    {
        form.addEventListener('submit', function(event)
        {
            if (!form.checkValidity())
            {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
        }, false);
    });
}

function array_equals(arr1, arr2)
{
    if (arr1.length != arr2.length)
        return false;

    for (i in arr1)
    {
        if (!arr1.includes(arr2[i]) || !arr2.includes(arr1[i]))
        return false;
    }
    return true;
}

function list_service_users(users, service_name)
{
    let ret = [];
    for (key in users)
    {
        let user = users[key];
        if (array_equals(user.permissions, ["all"])
            || user.permissions.includes(service_name))
        {
            ret.push(key);
        }
    }
    return ret.sort();
}