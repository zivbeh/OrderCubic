const $roomName = $('.roomName1');
const container = $('.container');
const button = document.getElementById('create');;
const cont = document.getElementById('container');
var chance = false;
$roomName.on('keydown', function (ev) {
    const messageText = $roomName.val();
    console.log(cont.childNodes[0]);

    if(messageText.length === 25 || messageText.length < 4){
        if(chance){
            console.log('  fsdfsrds')
        } else {
            container.append(`<div class="alert alert-danger" role="alert">
            <h4 class="alert1" id="alert">Your RoomName need to be lees then 25 Charcters and bigger then 3 Charcters</h4>
            </div>`
            );
        }
        button.disabled = true;
        
        console.log(messageText, '   to much words')
        chance = true;
    } else if (messageText.length <= 24 && messageText.length >= 4){
        if(chance){
            cont.removeChild(cont.childNodes[0]);
            cont.removeChild(cont.lastElementChild);
        }
        button.disabled = false;
        chance = false;
    }
});