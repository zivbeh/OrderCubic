function passwordShower() {
    var x = document.getElementById("exampleInputPassword1");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
}

var tiles = document.querySelector('html');
const a = document.getElementById('input');

a.addEventListener('input', function () {
  var filter = 'hue-rotate(xdeg)'.replace('x', a.value);
  tiles.style.filter = filter;
}, false);

window.onload = function(){
  size();
  tiles.style.filter = 'hue-rotate(150deg)';
  a.value = 152;

  const y = document.getElementById('send');
  y.style.display = "none";
  const x = document.getElementById('cons');
  x.style.display = "none";
  var z = document.getElementById('room-info-header');
  z.style.display = "none";
}

var BoleanLow = false;
var BoleanHigh = false;
function size(){
  var widt = $(window).width();
  if(widt<=768 && BoleanLow == false){
    const g = document.getElementById('gingi');
    g.style.display = "block";
    const er = document.getElementById('img');
    er.style.width = 300+'px';
    const f = document.getElementById('main');
    f.style.display = "block";
    
    const lg = document.getElementById('container');
    lg.style.gridTemplateColumns = "3fr 0fr";

    const n = document.getElementById('sidebar');
    n.style.display = "none";
    BoleanHigh = false;
    BoleanLow = true;
  } else if (widt>768 && BoleanHigh == false) {
      const lg = document.getElementById('container');
      lg.style.gridTemplateColumns = "3fr 7fr";

      const mainWidth = $('main').width();
      console.log(mainWidth)
      infoRoom.style.marginLeft = (mainWidth - 300) + 'px';

      const e = document.getElementById('gingi');
      e.style.display = "none";
      const d = document.getElementById('sidebar');
      d.style.width = "100%";
      d.style.display = "block";
      const x = document.getElementById('main');
      x.style.display = "block";
      const ern = document.getElementById('img');
      if((widt/2-20)>=360){
        ern.style.width = 300+'px';
      } else {
        ern.style.width = (widt/2-20)+'px';
      }
      BoleanLow = false;
      BoleanHigh = true;
  }
  if(widt<=370){
    const er = document.getElementById('img');
    er.style.width = 200+'px';
  }
}

document.getElementById("Back").addEventListener("click", function () {
  const e = document.getElementById('gingi');
  e.style.display = "none";
  const x = document.getElementById('main');
  x.style.display = "none";
  const d = document.getElementById('sidebar');
  d.style.display = "block";
  d.style.width = "100%";
}, false);

 $(window).on('resize', function() {
   size();
 });

var height = $(window).height();
if(height == 568){
  $('.messagon').each(function () {
    var str = $(this).html();
    var htmlfoo = str.match(/.{1,20}/g).join("<br/>");
    $(this).html(htmlfoo);
  });  
} else {
  $('.messagon').each(function () {
    var str = $(this).html();
    var htmlfoo = str.match(/.{1,46}/g).join("<br/>");
    $(this).html(htmlfoo);
  });
}

function closeRoomInfo() {
  var info = document.getElementById('infoRoom');
  info.style.display='none';
}

function copyLink() {
  var copyText = document.getElementById("roomLinkInput");
  copyText.select();
  copyText.setSelectionRange(0, 99999)
  document.execCommand("copy");
  console.log('text was copied successfuly')
}

(function () {
  const socket = io();
  socket.on('createRoom', App.createRoom);
  socket.on('message', App.newMessage);
  socket.on('deleteRoom', App.deleteRoom);
  socket.on('getRoomInfo', App.getRoomInfo);

  const server = {
      changeRoom(oldRoom, newRoom) {
          socket.emit('changeRoom', { oldRoom, newRoom });
      },

      sendMessage(text, id) {
          socket.emit('message', text, id);
      },

      deleteRoom(room) {
        socket.emit('deleteRoom', room);
      },

      createRoom(roomna) {
          socket.emit('createRoom', roomna);
      },

      getRoomInfo(roomId) {
        socket.emit('getRoomInfo', roomId);
      }
  };

  App.setServer(server);
}());