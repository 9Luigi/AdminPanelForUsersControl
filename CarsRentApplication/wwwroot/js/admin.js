const mainGrid = document.getElementById("main"); //main grid ~area of page

document.getElementById("DownloadUsers").addEventListener("click", async () => {
    const response = await fetch("/admin/getAllUsers");
    if (response.ok === true) {
        const responseText = await response.json();
        var table_str = '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>';
        responseText.forEach(user => {
            table_str += '<tr><td>'
                + user.name + '</td><td>'
                + user.email + '</td><td>'
                + user.role + `</td><td><button id=getButton${user.id}>Edit</button> <button>Delete</button></td></tr>`;
        });
        table_str += '</tbody></table>'
        mainGrid.innerHTML = table_str; //load table to client
        responseText.forEach(user => {
            document.getElementById(`getButton${user.id}`).addEventListener('click', async () => {
                const response = await fetch(`/admin/getUser/${user.id}`);
                if (response.ok === true) {
                    console.log(user);
                }
            });
        });
    }
})



