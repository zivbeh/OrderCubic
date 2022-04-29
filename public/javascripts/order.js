var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 0;
canvas.height = 0;
var intensity;
var lastIntensity = 0;
var width;
var height;
var x;
var y;
var size;
var siteInput = document.getElementById('slctS')
var buildingInput = document.getElementById('slctB')
var floorInput = document.getElementById('slctF')
var timeInput = document.getElementById('time')
let list = document.getElementById('listWrapper')
var img;
let id;
var PositionObj;
var takenArray;
var isChosen = {};
var FilesPos;
var lastModifiedSelect;
var images = ['https://cdn-icons-png.flaticon.com/512/2778/2778273.png', 'https://cdn4.iconfinder.com/data/icons/diamond-colorful/512/Octagonal_Diamond-512.png', 'https://cdn-icons-png.flaticon.com/512/539/539043.png']
var EmptyGem = new Image()
EmptyGem.src = images[1]
var FullGem = new Image()
FullGem.src = images[2]
var MyGem = new Image()
MyGem.src = images[0]


// function loadImg(i) {
//     let imge = new Image()
//     imge.src = images[i]
//     window[`gem${i}`] = imge
//     imge.onload = () => {
//         if (i == images.length-1) {
//         } else {
//             loadImg(i+1)
//         }
//     }
// }

window.onload = async function() {
    await $.ajax({
        url: '/book/ReserveCubicleJSON',
        timeout: 2000,
        success: function(data){ 
            FilesPos = JSON.parse(data.fp)
            id = data.id
            // also get the user
            load()
        }
    });
}

async function FilesToImages() {
    /// All the time there will be only one image you just request it as Ajax from db at the time to make it faster
    //await ajax
    //get ID
    const valueS = siteInput.options[siteInput.selectedIndex].text;
    const valueB = buildingInput.options[buildingInput.selectedIndex].text;
    const valueF = floorInput.options[floorInput.selectedIndex].text;
    var ImageId = FilesPos[valueS][valueB][valueF];

    await $.ajax({
        url: '/book/ReserveCubicleJSON',
        type: "POST",
        data: { site: valueS, building: valueB, floor: valueF },
        timeout: 2000,
        success: function(data){ 
            // get data
            takenArray = data.t /// changes after initialization!!!
            PositionObj = JSON.parse(data.p);
            isChosen = data.c;
            // isChosen stuff
            // for (let date in takenArray) {
            //     const obj = takenArray[date];
            //     for (let ob in obj) {
            //         const arr = obj[ob];
            //         if (arr == "MyID") {
            //             isChosen[date] = ob
            //         }
            //     }
            // }
            // create img
            img = new Image();
            img.src = `${window.location.origin}/images/plan/${ImageId}.png`;

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                document.getElementById('canvasGrid').style.height = canvas.offsetHeight+'px';
                document.getElementById('listWrapper').style.height = canvas.offsetHeight+'px';
                restartList()
                document.getElementById('resetZoomButton').style.visibility = "visible"
                createImage(canvas.width/2,canvas.height/2,0)
            }
        }
    });
}

async function PostOnChange() {
    if (lastModifiedSelect.s == "Choose" || lastModifiedSelect.b == "Choose" || lastModifiedSelect.f == "Choose") {
        return false;
    }
    await $.ajax({
        url: '/book/ReserveCubicleChange',
        type: "POST",
        data: { isChosen: JSON.stringify(isChosen), s: lastModifiedSelect.s, b: lastModifiedSelect.b, f: lastModifiedSelect.f }, // need site building floor
        timeout: 2000,
        success: function(data){ 
            if (data != "Good") {
                alert(data)
                return true;
            }
            return false;
        }
    });
}

function ManageOptions(objectFilesPos, inputToAdd) {
    for (const key in objectFilesPos) {
        var opt = document.createElement('option');
        opt.innerHTML = key;
        inputToAdd.appendChild(opt);
    }
}

function load() {
    //loadImg(0)
    // make the choosing options
    ManageOptions(FilesPos, siteInput);
    // date stuff
    var dtToday = new Date();
    var tomorrow = new Date(dtToday)
    tomorrow.setDate(tomorrow.getDate() + 1)
    var dd = tomorrow.getDate();
    var mm = tomorrow.getMonth() + 1; //January is 0!
    var yyyy = tomorrow.getFullYear();
    
    if (dd < 10) {
       dd = '0' + dd;
    }
    
    if (mm < 10) {
       mm = '0' + mm;
    } 
        
    today = yyyy + '-' + mm + '-' + dd;

    var next = new Date(dtToday)
    next.setDate(next.getDate() + 30)
    var dd1 = next.getDate();
    var mm1 = next.getMonth() + 1;
    var yyyy1 = next.getFullYear();
    
    if (dd1 < 10) {
       dd1 = '0' + dd1;
    }
    
    if (mm1 < 10) {
       mm1 = '0' + mm1;
    } 
        
    today1 = yyyy1 + '-' + mm1 + '-' + dd1;

    timeInput.value = today
    timeInput.min = today
    timeInput.max = today1
}

function shape (type, x, y, w, h, color = 'black', deg = 0) {
    const rad = -deg * Math.PI / 180
    ctx.fillStyle = color
    if (type == 'r') {
        x -= w/2
        y -= h/2
        ctx.save()
        ctx.translate(x + w/2, y + h/2);
        ctx.rotate(rad);
        ctx.fillRect(-w/2, -h/2, w, h)
        ctx.restore()
    } else if (type == 'e') {
        ctx.beginPath();
        ctx.ellipse(x, y, w/2, h/2, rad, 0, 2 * Math.PI);
        ctx.fill()
    } else if (type == 'img') {
        x -= w/2
        y -= h/2
        ctx.save()
        ctx.translate(x + w/2, y + h/2);
        ctx.rotate(rad);
        ctx.drawImage(color, -w/2, -h/2, w, h)
        ctx.restore()
    }
    ctx.fillStyle = 'black'
}

canvas.addEventListener("mousedown", function (e){
    if (checkAllInputChange()) {
        let mousePo = getMousePos(canvas, e)
        for (let key in PositionObj) {
            let obj = PositionObj[key];
            let newPos = getDrawPixels(obj.pos.x, obj.pos.y);
            if (mousePo.x <= newPos.x + size/2 && mousePo.x >= newPos.x - size/2) {
                if (mousePo.y <= newPos.y + size/2 && mousePo.y >= newPos.y - size/2) {
                    if (takenArray[timeInput.value] == undefined) {
                        takenArray[timeInput.value] = {}
                    }
                    if (takenArray[timeInput.value][key] == undefined) {
                        if (isChosen[timeInput.value]) {
                            delete takenArray[timeInput.value][isChosen[timeInput.value]]
                            let chosenElement = document.getElementsByClassName("listElementChosen");
                            if (chosenElement.length > 0) {
                                chosenElement[0].classList.remove("listElementChosen")
                            }
                        }
                        takenArray[timeInput.value][key] = []
                        isChosen[timeInput.value] = key
                        takenArray[timeInput.value][key] = id
                        let input = $('#listWrapper').find(`#${key}`)[0].firstChild;
                        input.classList.add("listElementChosen"); // e.target is canvas, find a way to find the list input with the actual name!!!!!
                    } else if (takenArray[timeInput.value][key] != undefined) {
                        if (takenArray[timeInput.value][key] == id) {
                            delete takenArray[timeInput.value][isChosen[timeInput.value]]
                            isChosen[timeInput.value] = -1    // what if instead of deleting, setting it to undefined? -> doesn't work -> set it to constant value of -1 !!!
                            let chosenElement = document.getElementsByClassName("listElementChosen");
                            if (chosenElement.length > 0) {
                                chosenElement[0].classList.remove("listElementChosen")
                            }
                        } else {
                            break; 
                        }
                    } else  {//// should come here!!!!!!!!!!!!!!!
                        console.error("should never come here!!!!!!!!!!!!!!!!!!!!!!!!" ) 
                        if (isChosen[timeInput.value]) {
                            delete takenArray[timeInput.value][isChosen[timeInput.value]]
                        }
                        isChosen[timeInput.value] = key
                        takenArray[timeInput.value][key] = id
                    }
                    let checker = PostOnChange();
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    printObj()
                    break;
                }
            }
        }
    }
});

function checkAllInputChange() {
    const valueS = siteInput.options[siteInput.selectedIndex].text;
    const valueB = buildingInput.options[buildingInput.selectedIndex].text;
    const valueF = floorInput.options[floorInput.selectedIndex].text;
    if (valueS != 'Choose' && valueB != 'Choose' && valueF != 'Choose') {
        return true;
    }
    return false;
}

function printObj() {
    if (!checkAllInputChange()) {
        return;
    }
    ctx.drawImage(img,x,y,width,height)

    for (let key in PositionObj) {
        const obj =  PositionObj[key];
        const newObj = getDrawPixels(obj.pos.x,obj.pos.y)
        if (takenArray[timeInput.value] == undefined || takenArray[timeInput.value][key] == undefined) {
            shape('img',newObj.x,newObj.y,size,size,MyGem); // green
        } else if (takenArray[timeInput.value][key] == id) {
            shape('img',newObj.x,newObj.y,size,size,EmptyGem); // purple
        } else if (takenArray[timeInput.value][key] != undefined){
            shape('img',newObj.x,newObj.y,size,size,FullGem); // red
        }
    }
}

// document.getElementById('create').addEventListener('click', function() {
//     var data = {isChosen: JSON.stringify(isChosen)} //////////////////////////////////////////////////////////////////  Make here that every change
//     $.ajax({
//       type: 'POST',
//       url: '/book/ReserveCubicle',
//       dataType: "json",
//       timeout: 2000,
//       data: data,
//       error: function(err) { // don't know why on error but ok!!!!!
//         window.location.href = '/';
//       }
//     });
// });

function goodTime() {
    let a = new Date(timeInput.min)
    let b = new Date(timeInput.value)

    if (a.getTime() <= b.getTime()) {
        return true;
    }
    return false;
}

timeInput.addEventListener("change", function(){
    if (goodTime()) {
        //let checker = PostOnChange();
        if (checkAllInputChange()) {
            intensity = 0
            lastIntensity = 0
            createImage()
            restartList()
        }   
    }

});

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

function getDrawPixels(posX, posY) {
    const CratioX = width/canvas.width
    const CratioY = height/canvas.height

    const x1 =  ((posX)*CratioX - Math.abs(x))
    const y1 =  ((posY)*CratioY - Math.abs(y))
    return {
        x: x1,
        y: y1
    }
}

function changeSize () { // add a slider as well for percent !!!!!!!!!!!!!!!!!!!!!!!!!!!1
    if (checkAllInputChange()) { // do i need to check here?
        let w = window.innerWidth;
        let x = canvas.offsetWidth
        let percent = 33
        size  = canvas.width/(x/(w/percent))
    }
}

canvas.onwheel = (e) => {
    mousePo = getMousePos(canvas, e)
	if (e.deltaY < 0) {
		intensity = (intensity + e.deltaY > 0) ? intensity + e.deltaY : 0
	} else {
		intensity += e.deltaY
	}
    lastIntensity = intensity
	createImage(mousePo.x, mousePo.y, intensity) // it is zero invisible when using laptop only
}

function createImage(posX, posY, intensity = lastIntensity) {
    width = canvas.width + (intensity * (canvas.width / canvas.height))
	height = canvas.height + intensity
	x = 0 - (posX / canvas.width) * (width - canvas.width)
	y = 0 - (posY / canvas.height) * (height - canvas.height)
    changeSize()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    printObj()
}

canvas.onmouseover = () => {
	document.querySelector('body').style.overflow = 'hidden'
}

canvas.onmouseleave = () => {
	document.querySelector('body').style.overflow = 'visible'
}

canvas.onmousemove = (e) => {
    mousePo = getMousePos(canvas, e)
	createImage(mousePo.x,mousePo.y)
}

document.getElementById('resetZoomButton').addEventListener('click', function () {
    intensity = 0
    lastIntensity = 0
    createImage(canvas.width/2,canvas.height/2,0)
});

function Erase(input) {
    var length = input.options.length;
    for (i = length - 1; i >= 0; i--) {
        input.options[i] = null;
    }
    var opt = document.createElement('option');
    opt.innerHTML = "Choose";
    input.appendChild(opt);
}

siteInput.addEventListener('change', function(e) {  //// make when one changes it gives you the new options to choose, and also change it when page starts
    const valueS = siteInput.options[siteInput.selectedIndex].text;
    const valueB = buildingInput.options[buildingInput.selectedIndex].text;
    const valueF = floorInput.options[floorInput.selectedIndex].text;
    const FutureModifiedSelect = {s: valueS, b:valueB, f: valueF};
    Erase(buildingInput)
    Erase(floorInput)
    ManageOptions(FilesPos[valueS],buildingInput);
    //let checker = PostOnChange(); // don't want to return, always want to resetcanvas if he wats to return to his previus values he can do it by himself
    // if (checker = false) {
        // if (checkAllInputChange()) {
        //     FilesToImages() // supposed to happen only when floor has changed!!!
        // } else {
            resetCanvas(FutureModifiedSelect)
        //} 
    // } else {
    //     // change to prev value
    // }
});
buildingInput.addEventListener('change', function() {
    const valueS = siteInput.options[siteInput.selectedIndex].text;
    const valueB = buildingInput.options[buildingInput.selectedIndex].text;
    const valueF = floorInput.options[floorInput.selectedIndex].text;
    const FutureModifiedSelect = {s: valueS, b:valueB, f: valueF};
    Erase(floorInput)
    ManageOptions(FilesPos[valueS][valueB],floorInput);
    //let checker = PostOnChange(); // don't want to return, always want to resetcanvas if he wats to return to his previus values he can do it by himself
    // if (checkAllInputChange()) {
    //     FilesToImages()
    // } else {
        resetCanvas(FutureModifiedSelect)
    //}
});
floorInput.addEventListener('change', function() {
    const valueS = siteInput.options[siteInput.selectedIndex].text;
    const valueB = buildingInput.options[buildingInput.selectedIndex].text;
    const valueF = floorInput.options[floorInput.selectedIndex].text;
    const FutureModifiedSelect = {s: valueS, b:valueB, f: valueF};
    //let checker = PostOnChange(); // don't want to return, always want to resetcanvas if he wats to return to his previus values he can do it by himself
    if (checkAllInputChange()) {
        FilesToImages()
    } else {
        resetCanvas(FutureModifiedSelect)
    }
    lastModifiedSelect = FutureModifiedSelect; // change the position of this when going to use lastModifiedSelect in future
});

function resetCanvas(futureModify) {
    lastModifiedSelect = futureModify;
    PositionObj = undefined;
    takenArray = undefined;
    isChosen = {};
    canvas.width = 0;
    canvas.height = 0;
    document.getElementById('canvasGrid').style.height = canvas.offsetHeight+'px';
    document.getElementById('listWrapper').style.height = canvas.offsetHeight+'px';
    document.getElementById('resetZoomButton').style.visibility = "hidden"
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    restartList()
}

$('.canvasWrapper').on('click', '.inputWrapper', function(e) {
    let input = e.target;
    if (takenArray[timeInput.value] == undefined) {
        takenArray[timeInput.value] = {};
    }
    if (takenArray[timeInput.value][input.parentNode.id] == undefined) {
        let chosenElement = document.getElementsByClassName("listElementChosen");
        if (chosenElement.length > 0) {
            delete takenArray[timeInput.value][chosenElement[0].parentNode.id];
            chosenElement[0].classList.remove("listElementChosen")
        }
        takenArray[timeInput.value][input.parentNode.id] = id;
        isChosen[timeInput.value] = input.parentNode.id;
        input.classList.add("listElementChosen");
        let checker = PostOnChange();
    } else if (takenArray[timeInput.value][input.parentNode.id] == id){
        input.classList.remove("listElementChosen")
        delete takenArray[timeInput.value][isChosen[timeInput.value]]
        isChosen[timeInput.value] = -1; // set it to constant imposible value -1!
        let checker = PostOnChange();
    }
    let o = PositionObj[input.parentNode.id]
    let intens = o.intensity;
    lastIntensity = intens
    let p = getDrawPixels(o.posM.x, o.posM.y)
    createImage(p.x, p.y, intens)
})

function addToList(len, value = '') {
    const div = document.createElement('div')
    let classToAdd = "nameInputForChangeName";
    if ( takenArray[timeInput.value] != undefined && takenArray[timeInput.value][len] == id ) {
        classToAdd += " listElementChosen";
    }
    let htmlString = `<input type="text" class="${classToAdd}" placeholder="Name Cubic" disabled value="${value}">`;
    if (takenArray[timeInput.value] != undefined && takenArray[timeInput.value][len] != undefined && takenArray[timeInput.value][len] != id) {
        htmlString = `<input type="text" class="${classToAdd}" placeholder="Name Cubic" disabled value="${value} , (${takenArray[timeInput.value][len]})">`;
    }
    div.innerHTML = htmlString;
    div.id = len;
    div.className = 'inputWrapper';
//     let elem = `
//     <div id="${len}" class="inputWrapper">
//         <input type="text" class="nameInputForChangeName" placeholder="Name Cubic" value="${value}">
//     </div>
// `
    list.appendChild(div);
}

function restartList() {
    list.innerHTML = '';
    const s = siteInput.options[siteInput.selectedIndex].text;
    const b = buildingInput.options[buildingInput.selectedIndex].text;
    const f = floorInput.options[floorInput.selectedIndex].text;
    //if (PositionObj[s] != undefined && PositionObj[s][b] != undefined && PositionObj[s][b][f] != undefined) {
        for (let key in PositionObj) {
            const obj = PositionObj[key];
            addToList(key, obj.name)
        }
    //}
    // if (isChosen[timeInput.value]) {
       //  delete takenArray[timeInput.value][isChosen[timeInput.value]]
    // }
    doFilterList();
}

let searchInput = document.getElementById('Searchlist');
searchInput.addEventListener('keyup', function () {
    doFilterList();
});

function doFilterList() {
    var filter, div, input, i, txtValue;
    filter = searchInput.value.toUpperCase();
    div = list.getElementsByTagName('div');
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < div.length; i++) {
      input = div[i].getElementsByTagName("input")[0];
      txtValue = input.value;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        div[i].style.display = "";
      } else {
        div[i].style.display = "none";
      }
    }
}

function loadI() {
    intensity = 0
    lastIntensity = 0
    createImage(canvas.width/2,canvas.height/2,0)

    restartList()
}