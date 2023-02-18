const userTable = document.getElementById("usersTable");

document.getElementById("DownloadUsers").addEventListener("click", async () => {
    const response = await fetch("/admin/getAllUsers");
    if (response.ok === true) {
        const responseText = await response.json();
        userTable.innerHTML += "<tr>";
        responseText.forEach(element => {
            userTable.innerHTML += "<tr>";
            userTable.innerHTML += "<td>" + element.name + "</td>";
            userTable.innerHTML += "<td>" + element.name + "</td>";
            userTable.innerHTML += "<td>" + element.name + "</td>";
            userTable.innerHTML += "<td>" + element.name + "</td>";
            userTable.innerHTML += "</tr>";
            console.log(element.name);
        });
    }
})