var usersList;
let list = document.getElementById('toAdd')

// get the users list with ajax
window.onload = async function() {
    await $.ajax({
        url: '/users/employeesJSON',
        timeout: 2000,
        success: function(data){ 
            usersList = data
            loadUsersClient()
        }
    });
}

// function to draw all users
function loadUsersClient () {
    for (let i = 0; i < usersList.length; i++) {
        const values = usersList[i];
        createList(values.Email, values.Name, values.Admin)
    }
}

function createList(email, name, admin) {
    var newRow = list.insertRow();
    var newCell = newRow.insertCell();
    var newText = document.createTextNode(email);
    newCell.appendChild(newText);
    var newCell1 = newRow.insertCell();
    var newText1 = document.createTextNode(name);
    newCell1.appendChild(newText1);
    var newCell2 = newRow.insertCell();
    var newText2 = document.createTextNode(admin);
    newCell2.appendChild(newText2);
}


// when add file clicked
function isFileJSON(file) {
    return file && file['type'] === 'application/json';
}
var fileInput = document.getElementById('file-upload')
fileInput.addEventListener("change", async function(ev){
    let file = fileInput.files[0];
    if (fileInput.files.length > 0 && isFileJSON(file)) {
        const formData = new FormData();
        formData.append('myFile.json', file);
    
        const response = await fetch('/book/saveEmployees', { method: 'POST', body: formData })
        .then(responsew => responsew.text())
        .then(data => {
            if (data == 'data') {
                // work
                window.location.reload();
            } else {
                // failed, show the error
            }
        });
    }
});

const modal = document.querySelector(".modal");
const trigger = document.querySelector(".trigger");
const closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);


let addOne = document.getElementById('AddOne');
addOne.addEventListener('click', async function (e) {
    NameField = document.getElementById('formGroupExampleInput').value
    EmailField = document.getElementById('exampleInputEmail1').value
    AdminField = document.getElementById('exampleCheck1').checked
    let data = {
        Name: NameField,
        Email: EmailField,
        Admin: AdminField
    }
    const rawResponse = await fetch('/users/addSingleEmployee', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
	.then(dat => {
        if (dat != 'response') {
            alert(dat)
        } else {
            createList(data.Email, data.Name, data.Admin)
        }
        toggleModal()
    })
});