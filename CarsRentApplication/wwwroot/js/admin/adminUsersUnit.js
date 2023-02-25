//#region HTML elements
const mainGridArea = document.getElementById("main"); //main grid ~area of page(main content,center)
const container = document.getElementById("container"); //grid container
const rightGridArea = document.getElementsByClassName("right")[0];

const divForUsersTable = document.getElementById('divForUsersTable');
const divForNavigateButtons = document.getElementById('divForNavigateButtons');

const divForUsersSearch = document.getElementById('divForUsersSearch');
const inputSearchByEmail = document.getElementById('inputSearchByEmail');

//#region leftGridArea
const adminsMenu = document.getElementById("leftMenu"); //menu
const adminMenuUsers = document.getElementById("adminMenuUsers"); //first menu item
const adminMenuSettings = document.getElementById("adminMenuSettings");
//#endregion
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

const navigateButtons = document.getElementsByClassName("navigateButtonsOnUsers");
//#endregion

//TODO variables for all color in code by symantic

//#region variables/params
let usersCount;
let users;
let usersLimit = 15;
let usersOffset = 0;
//don't set this value > 14 because of container margins with parent value 800px, #divForNavigateButtons in index.css
let navigateOnUsersTableButtonsOnRowCount = 14;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let navigateOnUsersTableButtonsOnRowWidth = 50;
//#endregion

window.addEventListener('load', () => {
    for (let i = 0; i < adminsMenu.children.length; i++) {
        adminsMenu.children[i].addEventListener("click", function () {
            for (let j = 0; j < adminsMenu.children.length; j++) {
                if (adminsMenu.children[j] == adminsMenu.children[i]) {
                    adminsMenu.children[j].classList = "active";
                }
                else {
                    if (adminsMenu.children[j].classList.contains("active"))
                        adminsMenu.children[j].classList.remove("active");
                }
            }
        });
    }
})//menu visual control

window.addEventListener('load', () => {
    adminMenuUsers.click();
})

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

let getUsersAsync = async (limit, offset) => {
    const response = await fetch(`/admin/users/${limit}/${offset}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
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
    var table_str = '<table style="table-layout: auto"><thead><tr><th>Name</th><th>Surname</th><th>Email</th><th>Password</th><th>Phone number</th><th>Role</th><th>Buttons</th></tr></thead><tbody id=tbodyUsers>';
    users.forEach(user => {
        table_str += `<tr id=userId${user.id}><td>` //via id removes or updates values
            + user.name + '</td><td>'
            + user.surname + '</td><td>'
            + user.email + '</td><td>'
            + user.password + '</td><td>'
            + user.phoneNumber + '</td><td>'
            + user.role + `</td><td><button id=getUserButton${user.id}>Edit</button> <button id=deleteUserButton${user.id}>Delete</button></td></tr>`;
    });
    table_str += '</tbody></table>'
    parentToPrint.innerHTML = table_str; //load table to client
    try {
        users.forEach(user => {
            document.getElementById(`getUserButton${user.id}`).addEventListener('click', () => { //Edit buttons handlers
                fillUserFormWithValuesFromFetch(user);
                openArea(container, rightGridArea);
            });
            document.getElementById(`deleteUserButton${user.id}`).addEventListener('click', async () => { removeUserAsync(user) });
        });
    } catch (exception) {
        alert(exception);
        console.log(exception);
    };
}

let replaceUserDataIntoTR = (SetTr, GetTr, user) => {
    SetTr.id = `userId${user.id}`;
    SetTr.innerHTML = `<td>` //via id removes or updates values
        + user.name + `</td><td>`
        + user.surname + `</td><td>`
        + user.email + `</td><td>`
        + user.role + `</td><td><button id=getUserButton${user.id}>Edit</button> <button id=deleteUserButton${user.id}>Delete</button></td>`;
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
    alert("Error " + response.status);
    console.log("Error " + response.status);
}
let getUsersByEmailAsync = async (email) => {//not used yet
    const response = await fetch(`/admin/users/${email}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const users = await response.json();
        return users;
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

let printNavigateButtonsForUsersList = (parentToPrint, numberOfButtons = 0, buttonsOnRow = 10, widthOfButtons = 50) => {
    for (let i = 1; i <= numberOfButtons; i++) {
        if (i == 1) { parentToPrint.innerHTML += `<button class='navigateButtonsOnUsers' id='navigateButtonOnUsers${i}' style='width:${widthOfButtons}px;background-color:#6CDAFF'>${i}</button> `; }
        else { parentToPrint.innerHTML += `<button class='navigateButtonsOnUsers' id='navigateButtonOnUsers${i}' style='width:${widthOfButtons}px;background-color:#2385A6'>${i}</button> `; }
        if (i % buttonsOnRow == 0) {
            parentToPrint.innerHTML += `<br>`;
        }
    }
}

let markCurrentNavigateButton = (buttons, current) => {
    Array.from(buttons).forEach(button => {
        if (button == current) button.style.backgroundColor = "#6CDAFF";
        else button.style.backgroundColor = "#2385A6";
    });
}

let displayONSearchInputs = () => {
    divForUsersSearch.style.setProperty('display', 'block');
}

let onUsersAdminPanelClick = async () => {//users unit for admin load on function call, get table of users, search user, navigate panel etc
    resetContainerHTML(divForNavigateButtons);
    resetContainerHTML(divForUsersTable);
    usersCount = await getUsersCountAsync();
    users = await getUsersAsync(usersLimit, usersOffset); //gets users(offset,limit) from database
    displayONSearchInputs();
    printNavigateButtonsForUsersList(divForNavigateButtons, usersCount / usersLimit, navigateOnUsersTableButtonsOnRowCount, navigateOnUsersTableButtonsOnRowWidth);
    //1. where print, 2. how much , 3. how much in a row, 4. button width
    await printUsersTableAsync(divForUsersTable, users); //prints table with all users from data base
    for (let i = 1; i <= navigateButtons.length; i++) {
        let button = document.getElementById(`navigateButtonOnUsers${i}`);
        button.addEventListener('click', async () => {
            markCurrentNavigateButton(navigateButtons, button);
            const users = await getUsersAsync(usersLimit, i * usersLimit - usersLimit);
            await printUsersTableAsync(divForUsersTable, users); //prints table with all users from data base
        })
    };
}

let resetContainerHTML = (container) => {
    container.innerHTML = "";
}

let searchByEmail = async () => {
    if (inputSearchByEmail.value.length > 4) {
        resetContainerHTML(divForNavigateButtons);
        resetContainerHTML(divForUsersTable);
        users = await getUsersByEmailAsync(inputSearchByEmail.value); //gets users(offset,limit) from database
        displayONSearchInputs();
        await printUsersTableAsync(divForUsersTable, users); //prints table with all users from data base
        for (let i = 1; i <= navigateButtons.length; i++) {
            let button = document.getElementById(`navigateButtonOnUsers${i}`);
            button.addEventListener('click', async () => {
                markCurrentNavigateButton(navigateButtons, button);
                const users = await getUsersAsync(usersLimit, i * usersLimit - usersLimit);
                await printUsersTableAsync(divForUsersTable, users); //prints table with all users from data base
            })
        };
    } else if (divForNavigateButtons.innerHTML == "") {
        onUsersAdminPanelClick();
    }

}
//#endregion

//#region listeners on static html elements
closeEditUserAreaButton.addEventListener('click', function () { closeRightArea(container, rightGridArea) });
saveUserButton.addEventListener('click', userUpdate);
adminMenuUsers.addEventListener('click', onUsersAdminPanelClick);
inputSearchByEmail.addEventListener('input', searchByEmail);
//#endregion