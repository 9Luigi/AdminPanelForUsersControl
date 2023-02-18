const mainGrid = document.getElementById("main");

document.getElementById("DownloadUsers").addEventListener("click", async () => {
    const response = await fetch("/admin/getAllUsers");
    if (response.ok === true) {
        const responseText = await response.json();
        var table_str = '<table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>';
        responseText.forEach(user => {
            table_str += '<tr><td>' + user.name + '</td><td>' + user.email + '</td></tr>';
        });
        table_str += '</tbody></table>'
        mainGrid.innerHTML = table_str;
    }
})

