//#region HTML elements
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
    let usersCount = await getUsersCountAsync();
    console.log(usersCount);
    const users = await getUsersAsync(); //gets all users from data base
    await printUsersTableAsync(mainGridArea, users); //prints table with all users from data base
    try {
        users.forEach(user => {
            document.getElementById(`getUserButton${user.id}`).addEventListener('click', () => { //Edit buttons handlers
                fillUserFormWithValuesFromFetch(user);
                openArea(container, rightGridArea);
            });
            document.getElementById(`deleteUserButton${user.id}`).addEventListener('click', async () => { removeUserAsync(user) });
        });
    } catch (exception) {
        console.log(exception);
    }

}, false); //users load and user edit process preparing

//#region functions
let closeRightArea = (parent, area) => {//on this area user update form located
    parent.classList.remove("containerRightOpen"); //remove right grid area from grid template via class togle
    setTimeout(() => area.classList.add("hidden"), 200); //set none value to display property of right grid area... don't work without timer, why??
}

let userUpdate = async () => { //TODO name should be update/put or save
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
        const user = await response.json();
        const GetTr = document.getElementById(`userId${idInput.value}`);
        const SetTr = document.createElement("tr");
        replaceUserDataIntoTR(GetTr, SetTr, user);
        document.getElementById(`getUserButton${user.id}`).addEventListener('click', async () => { updateVisualUserFormAndUsersTable(user) });
        document.getElementById(`deleteUserButton${user.id}`).addEventListener('click', async () => { removeUserAsync(user) }); //TODO hide functions to parametr(delegate)
        alert(`${user.email} succesful updated`)
    } else alert(user.message);
}

let getUsersAsync = async () => {
    const response = await fetch("/admin/users", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const responseText = await response.json();
        return responseText;
    } else {
        console.log(response.status);
        alert(`cannot load users with status: ${response.status}`)
    }
}

let printUsersTableAsync = async (parentToPrint, users) => {
    var table_str = '<table><thead><tr><th>Name</th><th>Surname</th><th>Email</th><th>Role</th></tr></thead><tbody id=tbodyUsers>';
    users.forEach(user => {
        table_str += `<tr id=userId${user.id}><td>` //via id removes or updates values
            + user.name + '</td><td>'
            + user.surname + '</td><td>'
            + user.email + '</td><td>'
            + user.role + `</td><td><button id=getUserButton${user.id}>Edit</button> <button id=deleteUserButton${user.id}>Delete</button></td></tr>`;
    });
    table_str += '</tbody></table>'
    parentToPrint.innerHTML = table_str; //load table to client
}

let replaceUserDataIntoTR = (SetTr, GetTr, user) => {
    SetTr.id = `userId${user.id}`;
    SetTr.innerHTML = `<td>` //via id removes or updates values
        + user.name + `</td><td>`
        + user.surname + `</td><td>`
        + user.email + `</td><td>`
        + user.role + `</td><td><button id=getUserButton${user.id}>Edit</button><button id=deleteUserButton${user.id}>Delete</button></td>`;
    GetTr.replaceWith(SetTr);
}

let getUsersCountAsync = async () => {
    const response = await fetch(`/admin/users/count`, {
        method: "GET",
        header: {
            "ACCEPT": "application/json",
        },
    });
    if (response.ok === true) {
        let countOBJ;
        const usersCount = await response.json();
        countOBJ = JSON.parse(usersCount);
        return countOBJ.Count;
    };
    console.log("Error " + response.status);
}
let getUserAsync = async (user) => {//not used yet
    const response = await fetch(`/admin/users/${user.id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const user = await response.json();
        return user;
    }
    console.log(response.status);
    alert(`cannot load user with status: ${response.status}`)
}

let openArea = (parent, area) => {
    parent.classList.add("containerRightOpen");
    parent.addEventListener("transitionstart", () => {
        if (area.classList.contains("hidden"))
            area.classList.remove("hidden");
    })
}

let fillUserFormWithValuesFromFetch = (user) => {
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
}

let removeUserAsync = async (user) => {
    let result = confirm(`Are you sure you want to delete ${user.name} ${user.surname} ${user.email}?`)
    if (result) {
        const response = await fetch("/admin/users", {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: user.id,
            })
        });
        if (response.ok === true) {
            alert(`${user.name} ${user.surname} ${user.email} deleted!`);
            document.getElementById(`userId${user.id}`).remove();
        }
        else {
            alert("error: " + response.status);
            console.log(response.status);
        }
    }
}

let updateVisualUserFormAndUsersTable = async (user) => {
    const response = await fetch(`/admin/users/${user.id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        fillUserFormWithValuesFromFetch(response.json());
        openArea(container, rightGridArea);
        alert("Succesfull updated");
    }
}

//#endregion

//#region listeners on static html elements
closeEditUserAreaButton.addEventListener('click', function () { closeRightArea(container, rightGridArea) });
saveUserButton.addEventListener('click', userUpdate);
//#endregion