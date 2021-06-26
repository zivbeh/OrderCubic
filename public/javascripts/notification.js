
var toginput = document.getElementById('toggle');
var toginput1 = document.getElementById('toggle1');
toginput.addEventListener('change', (event) => {
if (event.currentTarget.checked) {
    toginput1.checked = true;
    console.log('checked the second')
    handlePermissions('granted')
} else {
    toginput1.checked = false;
    console.log('uchecked the second')
    handlePermissions('denied')
}
})
toginput1.addEventListener('change', (event) => {
if (event.currentTarget.checked) {
    toginput.checked = true;
    console.log('checked the first')
    handlePermissions('granted')
} else {
    toginput.checked = false;
    console.log('uchecked the first')
    handlePermissions('denied')
}
})


function handlePermissions(expect) {
    var permission = Notification.permission;
    console.log(permission)
    if(expect == permission){
        console.log('same');
        return;
    }
    if (permission == 'denied') {
        alert("If you want to use notification u have to allow in your browser to send notifications")
        return;
    }
    if(permission == 'default') {
        reqPrem();
        return;
    }
    // change from granted to defualt
    Notification.permissions.revoke(); // doesn't work
     
    console.log(Notification.permission)
}


function reqPrem() {
    Notification.requestPermission(function (status) {
        // If the user said okay
        console.log(status)
        if (status == "granted") {
            var n = new Notification("Hi! ", {tag: 'soManyNotification'});
        }
    });
}
