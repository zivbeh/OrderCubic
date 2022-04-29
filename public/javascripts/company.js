var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 0;
canvas.height = 0;
var PosiotionObj = {}
var intensity = 0
var filesObj = {}
var filesObjDB = {}
var highlightedGem = {};
var siteInput = document.getElementById('siteIn')
var buildingInput = document.getElementById('building')
var floorInput = document.getElementById('floor')
var checkBox = document.getElementById('checkbox')
var size;
var x;
var y;
var width;
var height;
var lastIntensity = 0;
var lastModifiedObj = {};
var lastListHieght = 0;
const gemImage = 'https://cdn4.iconfinder.com/data/icons/diamond-colorful/512/Octagonal_Diamond-512.png'
let gem = new Image()
gem.src = gemImage
const gem2Image = 'https://cdn-icons-png.flaticon.com/512/2778/2778273.png'
let gem2 = new Image()
gem2.src = gem2Image

var isDelteOk = false
function deleteCubic() {
    isDelteOk = !isDelteOk
}


// var ro = new ResizeObserver(entries => {
//     for (let entry of entries) {
//       const cr = entry.contentRect.height;

//         canvasList(cr)
//     }
// });

// window.onload = function () {
//     handlelist()
// }
// function handlelist() { /// call here every add
//     let cr = document.getElementById('listWrapper').offsetHeight
//     lastListHieght = cr;
// }

// function canvasList (h) {
//     let sty = document.getElementById('listWrapper')
//     if ( lastListHieght >= h ) {
//         sty.style.overflowY = 'scroll'
//     } else {
//         sty.style.overflowY = 'hidden'
//     }
//     sty.offsetHeight = h;
// }
  
// // Observe one or multiple elements
// ro.observe(canvas);

const deleteButton = document.getElementById('deleteButton')
deleteButton.addEventListener('click', deleteCubic)

document.getElementById('create').addEventListener('click', async function() {
    const Finput = document.getElementById('formGroupExampleInput').value.trim()
    if (Finput.length < 5) {
        return; // show the error
    }

    // ADD THE FILE
    const queryString = window.location.search;
    var data = {Name: Finput, filesPosition: JSON.stringify(filesObjDB), Positions: JSON.stringify(PosiotionObj) }
    $.ajax({
      type: 'POST',
      url: `/book/createCompany${queryString}`,
      dataType: "json",
      timeout: 2000,
      data: data,
    //   success: function(response){
    //       console.log(response,'l;l')
    //     window.location.href = '/users/ManageEmployment';
    //     },
      error: function(err) { // don't know why on error but ok!!!!!
        console.log(err)
        if (err.responseText == "response") {
            window.location.href = '/users/ManageEmployment';
        } else {
            window.location.href = err.responseText;
        }
      }
    });
});

function floornumberchecker () {
    if (floorInput.value >= 1 && floorInput.value <= 200) {
        return true;
    } else {
        floorInput.value = 1
        return false;
    }
}

function onlyCheck() {
    let Svalue = siteInput.value.trim();
    let Bvalue = buildingInput.value.trim();
    if (floornumberchecker() && buildingInput.value != '' && siteInput.value != '' && Svalue.length >= 2 && Bvalue.length >= 1) {
        return true
    }
    return false
}

function loadI() {
    intensity = 0
    lastIntensity = 0
    highlightedGem = undefined;
    isDelteOk = false
    createImage(canvas.width/2,canvas.height/2,0)
    document.getElementById('deleteButton').style.visibility = 'visible';
    document.getElementById('resetZoomButton').style.visibility = 'visible';

    restartList()
}

function restartList() {
    let list = document.getElementById('listWrapper')
    list.innerHTML = '';
    if (lastModifiedObj != undefined) {
        let s = lastModifiedObj.site
        let b = lastModifiedObj.building
        let f = lastModifiedObj.floor
        if (PosiotionObj[s] != undefined && PosiotionObj[s][b] != undefined && PosiotionObj[s][b][f] != undefined) {
            for (let key in PosiotionObj[s][b][f]) {
                const obj = PosiotionObj[s][b][f][key];
                addToList(key, obj.name)
            }
        }
        highlightedGem = {}
    }

}

function handleInputChange (data, Svalue, Bvalue, c) {
    var image = new Image();

    if (!checkBox.checked) {
        if (c) {
            fileInput.files[0] = filesObj[Svalue][Bvalue][floorInput.value];
        }
        lastModifiedObj = { site: Svalue, building: Bvalue, floor: floorInput.value };
        if (filesObj[Svalue][Bvalue][floorInput.value] != undefined) {
            canvas.width = filesObj[Svalue][Bvalue][floorInput.value].width;
            canvas.height = filesObj[Svalue][Bvalue][floorInput.value].height;
            loadI();

        } else {
            loadI();

            document.getElementById('deleteButton').style.visibility = 'hidden';
            document.getElementById('resetZoomButton').style.visibility = 'hidden';
            // console.log('dasdada') ///////////////////////////////////////////////////////////////////
            // image.src = `/images/plan/${filesObjDB[lastModifiedObj.site][lastModifiedObj.building][lastModifiedObj.floor.value]}.png`;
            // filesObj[Svalue][Bvalue][floorInput.value] = image;
            // filesObjDB[Svalue][Bvalue][floorInput.value] = data;
            // canvas.width = image.width;
            // canvas.height = image.height;
        }
        // lastModifiedObj = { site: Svalue, building: Bvalue, floor: floorInput.value };
        // loadI();
        return true;
    } else {
        image.src = `/images/plan/${data}.png`;
        filesObj[Svalue][Bvalue][floorInput.value] = image;
        filesObjDB[Svalue][Bvalue][floorInput.value] = data;
        lastModifiedObj = { site: Svalue, building: Bvalue, floor: floorInput.value };
        image.onload = function (ev) {
            canvas.width = image.width;
            canvas.height = image.height;
            loadI();
            return true;
        };
    }
}

async function checkAllInputChange(c = false) {
    const Svalue = siteInput.value.trim();
    const Bvalue = buildingInput.value.trim();
    let file = fileInput.files[0];
    if (onlyCheck()) {
        if (fileInput.files.length > 0) {
            if (isFileImage(file)) {
                // var reader = new FileReader();
                // reader.readAsDataURL(file);
                // reader.onloadend = async function (e) {

                    //saving a static file in server
                    if (!filesObj[Svalue]) {
                        filesObj[Svalue] = {};
                        filesObjDB[Svalue] = {};
                    }
                    if (!filesObj[Svalue][Bvalue]) {
                        filesObj[Svalue][Bvalue] = {};
                        filesObjDB[Svalue][Bvalue] = {};
                    }              

                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams == undefined) { return false }; 
                    const myParam = urlParams.get('token');
                    if (myParam == undefined) { return false }; 

                    if (checkBox.checked) {
                        const formData = new FormData();
                        formData.append('myFile.png', file);
                        const response = await fetch(`/book/saveImage?token=${myParam}`, { method: 'POST', body: formData })
                        .then(responsew => responsew.text())
                        .then(async data => {
                            if (filesObjDB[Svalue][Bvalue][floorInput.value] == undefined) {
                                handleInputChange(data, Svalue, Bvalue, c)
                            } else {
                                let thePath = { path: filesObjDB[Svalue][Bvalue][floorInput.value] }
                                const respo = await fetch(`/book/deleteImage?token=${myParam}`, { method: 'POST', body: JSON.stringify(thePath), headers: {
                                    'Content-Type': 'application/json',
                                }, })
                                .then(responsew => responsew.text())
                                .then(res => {
                                    if (res == 'data') {
                                        handleInputChange(data, Svalue, Bvalue, c)
                                    }
                                });
                            }
                        }); 
                    } else {
                        handleInputChange(filesObjDB[Svalue][Bvalue][floorInput.value], Svalue, Bvalue, c)
                    }
                // };
            }
        } else if (filesObj[Svalue] != undefined && filesObj[Svalue][Bvalue] != undefined && filesObj[Svalue][Bvalue][floorInput.value] != undefined && file == undefined) {
            if (checkBox.checked) {
                // delete static file
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams == undefined) { return false }; 
                const myParam = urlParams.get('token');
                if (myParam == undefined) { return false };
                let body = { path: filesObjDB[Svalue][Bvalue][floorInput.value] }
                const response = await fetch(`/book/deleteImage?token=${myParam}`, { method: 'POST', body: JSON.stringify(body), headers: {
                    'Content-Type': 'application/json',
                  }, })
                  .then(responsew => responsew.text())
                  .then(data => {
                      if (data == 'data') {
                        // delete where those values are true
                        delete filesObj[Svalue][Bvalue][floorInput.value];
                        delete filesObjDB[Svalue][Bvalue][floorInput.value];
                        if (PosiotionObj[Svalue] != undefined && PosiotionObj[Svalue][Bvalue] != undefined && PosiotionObj[Svalue][Bvalue][floorInput.value] != undefined) {
                            delete PosiotionObj[Svalue][Bvalue][floorInput.value];
                        } else if (PosiotionObj[Svalue] != undefined && PosiotionObj[Svalue][Bvalue] != undefined) {
                            delete PosiotionObj[Svalue][Bvalue];
                        } else if (PosiotionObj[Svalue] != undefined) {
                            delete PosiotionObj[Svalue];
                        }
                        
                        if (Object.keys(filesObj[Svalue][Bvalue]).length == 0) {
                            delete filesObj[Svalue][Bvalue];
                            delete filesObjDB[Svalue][Bvalue];
                        }
                        if (Object.keys(filesObj[Svalue]).length == 0) {
                            delete filesObj[Svalue];
                            delete filesObjDB[Svalue];
                        }
                        lastModifiedObj = undefined;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        canvas.width = 0;
                        canvas.height = 0;
                        document.getElementById('deleteButton').style.visibility = 'hidden';
                        document.getElementById('resetZoomButton').style.visibility = 'hidden';
                        restartList();
                        return true; 
                      }
                  }); 
                
            } else {
                if (filesObj[Svalue][Bvalue][floorInput.value] != undefined) {
                    let image = filesObj[Svalue][Bvalue][floorInput.value];
                    canvas.width = image.width;
                    canvas.height = image.height; 
                }
                lastModifiedObj = { site: Svalue, building: Bvalue, floor: floorInput.value };
                loadI();
                return true;
            }
        } else {
            lastModifiedObj = { site: Svalue, building: Bvalue, floor: floorInput.value };
            loadI();
            document.getElementById('deleteButton').style.visibility = 'hidden';
            document.getElementById('resetZoomButton').style.visibility = 'hidden';
            return true;
        }
    }
    return false;
}

siteInput.addEventListener('change', function() {
    checkAllInputChange()
});
buildingInput.addEventListener('change', function() {
    checkAllInputChange()
});
floorInput.addEventListener('change', function() {
    checkAllInputChange()
});

checkBox.addEventListener('change', function() {
    checkAllInputChange(true)
});

document.getElementById('resetZoomButton').addEventListener('click', function () {
    intensity = 0
    lastIntensity = 0
    createImage(canvas.width/2,canvas.height/2,0)
});

var fileInput = document.getElementById('fileInput')
fileInput.addEventListener("change", function(ev){
    let label = document.getElementById('fileLabel')
    label.style.color = 'red';

    let xh = checkAllInputChange()
    if (xh) {
        label.style.color = 'green';
    }
});

function isFileImage(file) {
    return file && file['type'].split('/')[0] === 'image';
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

// function reOrderObject(obj) {
//     let i = 0
//     for (let key in obj[siteInput.value.trim()][buildingInput.value.trim()][floorInput.value]) {
//         PosiotionObj[siteInput.value.trim()][buildingInput.value.trim()][floorInput.value][i] = obj[siteInput.value.trim()][buildingInput.value.trim()][floorInput.value][key];
//         i++
//     }
//     delete PosiotionObj[siteInput.value.trim()][buildingInput.value.trim()][floorInput.value][i]
// }

function printObj() {
    // create a function that draws the image from file and call her here
    let s = lastModifiedObj.site
    let b = lastModifiedObj.building
    let f = lastModifiedObj.floor
    let img = undefined;
    if (filesObj[s] != undefined && filesObj[s][b] != undefined && filesObj[s][b][f] != undefined) {
        img = filesObj[s][b][f]
    }
    if (img == undefined) {
        document.getElementById('deleteButton').style.visibility = 'hidden';
        document.getElementById('resetZoomButton').style.visibility = 'hidden';
        canvas.width = 0;
        canvas.height = 0;
        return;
    } else {
        document.getElementById('deleteButton').style.visibility = 'visible';
        document.getElementById('resetZoomButton').style.visibility = 'visible';
    }
    ctx.drawImage(img,x,y,width,height)

    // go over the obj
    if(PosiotionObj[s] != undefined && PosiotionObj[s][b] != undefined && PosiotionObj[s][b][f] != undefined) {
        for (let key in PosiotionObj[s][b][f]) {
            const obj = PosiotionObj[s][b][f][key].pos;
            let pixels = getDrawPixels(obj.x,obj.y)
            if (pixels) {
                if (highlightedGem == key) {
                    shape('img',pixels.x,pixels.y,size,size,gem2); 
                } else {
                    shape('img',pixels.x,pixels.y,size,size,gem); 
                }
            }
        }
    }
}

function addToList(len, value = '') {
    let list = document.getElementById('listWrapper')
    const div = document.createElement('div')
    div.innerHTML = `<input type="text" class="nameInputForChangeName" placeholder="Name Cubic" value="${value}">`;
    div.id = len;
    div.className = 'inputWrapper';
//     let elem = `
//     <div id="${len}" class="inputWrapper">
//         <input type="text" class="nameInputForChangeName" placeholder="Name Cubic" value="${value}">
//     </div>
// `
    list.appendChild(div);
}

$('.canvasWrapper').on('click', '.inputWrapper', function(e) {
    let input = e.target;
    highlightedGem = input.parentNode.id
    let s = lastModifiedObj.site
    let b = lastModifiedObj.building
    let f = lastModifiedObj.floor
    let o = PosiotionObj[s][b][f][input.parentNode.id]
    let intens = o.intensity;
    lastIntensity = intens
    let p = getDrawPixels(o.posM.x, o.posM.y)
    createImage(p.x, p.y, intens)
})
$('.canvasWrapper').on('change', '.inputWrapper', function(e) {
    let input = e.target;
    let s = lastModifiedObj.site
    let b = lastModifiedObj.building
    let f = lastModifiedObj.floor
    PosiotionObj[s][b][f][input.parentNode.id].name = input.value
})

canvas.addEventListener("mouseup", function (e){
    mousePo = getMousePos(canvas, e)
    let Svalue = lastModifiedObj.site
    let Bvalue = lastModifiedObj.building
    let Fvalue = lastModifiedObj.floor
    if (onlyCheck()) {
        if (!isDelteOk) {
            let NewPos = whatPixelAmIAt(mousePo.x,mousePo.y);
            //let mid = findMid(mousePo.x,mousePo.y)
            if (!PosiotionObj[Svalue]){
                PosiotionObj[Svalue] = {}
            }
            if (!PosiotionObj[Svalue][Bvalue]) {
                PosiotionObj[Svalue][Bvalue] = {}
            }
            if (!PosiotionObj[Svalue][Bvalue][Fvalue]) {
                PosiotionObj[Svalue][Bvalue][Fvalue] = {}
                PosiotionObj[Svalue][Bvalue][Fvalue][0] = { pos: NewPos, posM: NewPos , name: '', intensity: lastIntensity}
            } else {
                PosiotionObj[Svalue][Bvalue][Fvalue][Object.keys(PosiotionObj[Svalue][Bvalue][Fvalue]).length] = { pos: NewPos, posM: NewPos, name: '', intensity: lastIntensity} // adding the point to obj  || Change here the key value!!!!
            }
            let len = Object.keys(PosiotionObj[Svalue][Bvalue][Fvalue]).length
            addToList(len-1)
            shape('img',mousePo.x,mousePo.y,size,size,gem);
        } else {
            for (let key in PosiotionObj[Svalue][Bvalue][Fvalue]) {
                let obj = getDrawPixels(PosiotionObj[Svalue][Bvalue][Fvalue][key].pos.x,PosiotionObj[Svalue][Bvalue][Fvalue][key].pos.y);
                if (mousePo.x <= obj.x + size/2 && mousePo.x >= obj.x - size/2) { // devide by 2
                    if (mousePo.y <= obj.y + size/2 && mousePo.y >= obj.y - size/2) {
                        // clear rect and remove and print
                        delete PosiotionObj[Svalue][Bvalue][Fvalue][key]
                        restartList()
                        //reOrderObject(PosiotionObj) // change here as well

                        ctx.clearRect(0, 0, canvas.width, canvas.height)

                        printObj()
                        break;
                    }
                }
            }  
        }
    }
});

function changeSize () {
    if (onlyCheck()) { // do i need to check here?
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
	createImage(mousePo.x, mousePo.y, intensity)
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

function whatPixelAmIAt(posX, posY) {
    const CratioX = width/canvas.width
    const CratioY = height/canvas.height
    return {
        x: ((Math.abs(x) + posX)/CratioX),
        y: ((Math.abs(y) + posY)/CratioY)
    }
}

function findMid(posX, posY) {
    const CratioX = width/canvas.width
    const CratioY = height/canvas.height // no need in this function anymore can't figure it out
    return {
        x: ((Math.abs(x) + posX)/CratioX),
        y: ((Math.abs(y) + posY)/CratioY)
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

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}