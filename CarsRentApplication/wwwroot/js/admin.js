//#region elements
const mainGridArea = document.getElementById("main"); //main grid ~area of page(main content,center)
const container = document.getElementById("container"); //grid container
const rightGridArea = document.getElementsByClassName("right")[0];

//#region userEditForm
const idInput = document.getElementById("idInput");
const nameInput = document.getElementById("nameInput");
const surnameInput = document.getElementById("surnameInput");
const emailInput = document.getElementById("emailInput");
const roleUser = document.getElementById("roleUser");
const roleAdmin = document.getElementById("roleAdmin");
//#endregion

const closeEditUserAreaButton = document.getElementById("closeEditUserAreaButton");
const saveUserButton = document.getElementById("saveUserButton");

//#endregion

window.addEventListener('load', async () => {
    const response = await fetch("/admin/users", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const responseText = await response.json();
        var table_str = '<table><thead><tr><th>Name</th><th>Surname</th><th>Email</th><th>Role</th></tr></thead><tbody id=tbodyUsers>';
        responseText.forEach(user => {
            table_str += `<tr id=userId${user.id}><td>` //via id removes or updates values
                + user.name + '</td><td>'
                + user.surname + '</td><td>'
                + user.email + '</td><td>'
                + user.role + `</td><td><button id=getButton${user.id}>Edit</button> <button>Delete</button></td></tr>`;
        });
        table_str += '</tbody></table>'
        mainGridArea.innerHTML = table_str; //load table to client
        responseText.forEach(user => {
            document.getElementById(`getButton${user.id}`).addEventListener('click', async () => {
                const response = await fetch(`/admin/users/${user.id}`, {
                    method: "GET",
                    headers: { "Accept": "application/json" }
                });
                if (response.ok === true) {
                    const user = await response.json();
                    container.classList.add("containerRightOpen");
                    container.addEventListener("transitionstart", () => {
                        if (rightGridArea.classList.contains("hidden"))
                            rightGridArea.classList.remove("hidden");
                    });
                    idInput.value = user.id;
                    nameInput.value = user.name;
                    surnameInput.value = user.surname;
                    emailInput.value = user.email;
                    switch (user.role) {
                        case "Admin": roleAdmin.checked = true;
                            break;
                        case "User": roleUser.checked = true;
                            break;
                    }
                    console.log(user.role);
                }
            });//TODO divide block to 2 functions
        });
    }

}, false); //users load and user edit process preparing

//#region functions
let closeRightArea = () => {
    container.classList.remove("containerRightOpen"); //remove right grid area from grid template via class togle
    setTimeout(() => rightGridArea.classList.add("hidden"), 200); //set none value to display property of right grid area... don't work without timer, why??
}

let fetchUserSave = async () => {
    let role;
    if (roleAdmin.checked) role = "Admin";
    else role = "User"; //TODO refactor this
    const response = await fetch(`/admin/users`, {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: idInput.value,
            name: nameInput.value,
            surname: surnameInput.value,
            email: emailInput.value,
            role: role,
        })
    });
    if (response.ok === true) {
        const responseText = await response.json();
        const GetTr = document.getElementById(`userId${idInput.value}`);
        console.log(GetTr);
        const SetTr = document.createElement("tr");
        SetTr.id = `userId${responseText.id}`;
        SetTr.innerHTML = `<td>` //via id removes or updates values
            + responseText.name + `</td><td>`
            + responseText.surname + `</td><td>`
            + responseText.email + `</td><td>`
            + responseText.role + `</td><td><button id=getButton${responseText.id}>Edit</button> <button>Delete</button></td>`;
        GetTr.replaceWith(SetTr);
        document.getElementById(`getButton${responseText.id}`).addEventListener('click', async () => {
            const response = await fetch(`/admin/users/${responseText.id}`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            if (response.ok === true) {
                const user = await response.json();
                container.classList.add("containerRightOpen");
                container.addEventListener("transitionstart", () => {
                    if (rightGridArea.classList.contains("hidden"))
                        rightGridArea.classList.remove("hidden");
                });
                idInput.value = responseText.id;
                nameInput.value = responseText.name;
                surnameInput.value = responseText.surname;
                emailInput.value = responseText.email;
                switch (responseText.role) {
                    case "Admin": roleAdmin.checked = true;
                        break;
                    case "User": roleUser.checked = true;
                        break;
                }
                console.log(responseText.role);
            }//TODO divide block to 2 functions
        });
        alert("Succesfull");
    } else alert(responseText.message);
    // ${idInput.value}
}
//#endregion

//#region listeners
closeEditUserAreaButton.addEventListener("click", closeRightArea);
saveUserButton.addEventListener('click', fetchUserSave);
//#endregion