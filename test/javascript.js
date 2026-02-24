const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let lastTime = performance.now();

// looping frame
function loop(currentTime) {
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    update(delta);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// update frame
function update(delta) { // actual stuff
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveCameraWithSmoothing(delta);
    zoomWithSmoothing(delta);
    checkKeys(delta);
    drawObjects();
    drawFPS(delta);
    drawCameraPos();
}







// actual game stuff
const rect = canvas.getBoundingClientRect();

// draw fps from average
let storedfps = [];

function drawFPS(delta) {
    const fps = Math.floor(1/delta);
    storedfps.unshift(fps);
    if (storedfps.length > 20) {
        storedfps.pop();
    }
    
    let avFPSAdd = 0;
    
    for (const localfps of storedfps) {
        avFPSAdd += localfps;
    }
    
    const averageFPS = Math.floor(avFPSAdd/storedfps.length);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "20px Arial";
    ctx.lineWidth = 5;
    ctx.strokeText(averageFPS + " FPS", 10, canvas.height-10);
    ctx.fillText(averageFPS + " FPS", 10, canvas.height-10);
    //ctx.strokeText(fps, 0, canvas.height-10);
}

// draw camera position
function drawCameraPos() {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "20px Arial";
    ctx.lineWidth = 5;
    ctx.strokeText(Math.floor(camera.x) + ", " + Math.floor(camera.y) + ", " + Math.floor(camera.zoom*10)/10, 10, canvas.height-40);
    ctx.fillText(Math.floor(camera.x) + ", " + Math.floor(camera.y) + ", " + Math.floor(camera.zoom*10)/10, 10, canvas.height-40);
}

//testing camera move
const keysPressed = {};
document.addEventListener("keydown", (event) => {
    keysPressed[event.code] = true;
});
document.addEventListener("keyup", (event) => {
    delete keysPressed[event.code];
});


document.addEventListener("wheel", (event) => {
    camera.targetZoom += (-event.deltaY/1000)*camera.targetZoom;

});

function checkKeys(delta) {
    const speed = keysPressed.ShiftLeft ? 5000 : 1000;
    
    if (keysPressed.KeyD) camera.xTarget += speed * delta;
    if (keysPressed.KeyA) camera.xTarget -= speed * delta;
    if (keysPressed.KeyW) camera.yTarget -= speed * delta;
    if (keysPressed.KeyS) camera.yTarget += speed * delta;
}

let camera = {
    x: 0,
    y: 0,
    xTarget: 0,
    yTarget: 0,
    targetZoom: 1,
    zoom: 1,
    smoothing: 8,
    zoomSmoothing: 4
};

function moveCameraWithSmoothing(delta) {
    const t = 1 - Math.exp(-camera.smoothing * delta);
    camera.x += (camera.xTarget - camera.x) * t;
    camera.y += (camera.yTarget - camera.y) * t;
}

function zoomWithSmoothing(delta) {
    const t = 1 - Math.exp(-camera.zoomSmoothing * delta);
    camera.zoom += (camera.targetZoom - camera.zoom) * t;
}

let objects = [];
// draw objects
function drawObjects() {
    for (const object of objects) {
        object.type = object.type || "rect";
        if (object.type === "rect") {
            object.x = object.x || 0;
            object.y = object.y || 0;
            object.ySize = object.ySize || 10;
            object.xSize = object.xSize || 10;
            object.color = object.color || "black";
            object.strokeType = object.strokeType || "none";
            object.strokeThickness = object.strokeThickness || 5;
            object.rotation = object.rotation || 0;
            // center the rect
            const PosFixed = {
                x: object.x - object.xSize / 2,
                y: object.y - object.ySize / 2
            };

            // calculate screen position relative to camera and zoom
            const screenX = (PosFixed.x - camera.x) * camera.zoom + canvas.width / 2;
            const screenY = (PosFixed.y - camera.y) * camera.zoom + canvas.height / 2;

            ctx.fillStyle = object.color;
            ctx.strokeStyle = object.strokeColor;
            ctx.lineWidth = object.strokeThickness*camera.zoom;
            
            if (object.strokeType == "none") {
                ctx.fillRect(
                    screenX,
                    screenY,
                    object.xSize * camera.zoom,
                    object.ySize * camera.zoom
                );
            } else if (object.strokeType == "bottom") {
                ctx.strokeRect(
                    screenX,
                    screenY,
                    object.xSize * camera.zoom,
                    object.ySize * camera.zoom
                );
                ctx.fillRect(
                    screenX,
                    screenY,
                    object.xSize * camera.zoom,
                    object.ySize * camera.zoom
                );
            } else if (object.strokeType == "top") {
                ctx.fillRect(
                    screenX,
                    screenY,
                    object.xSize * camera.zoom,
                    object.ySize * camera.zoom
                );
                ctx.strokeRect(
                    screenX,
                    screenY,
                    object.xSize * camera.zoom,
                    object.ySize * camera.zoom
                );
            }
        }
    }
}

// function to add an object
function addObject(list) {
    let objinfo = {};
    for (const [key, value] of Object.entries(list)) {
        objinfo[key] = value;
    }
    
    objects.push(objinfo);
}

addObject(
    {
        type: "rect",
        x: 0,
        y: 0,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);

addObject(
    {
        type: "rect",
        x: 100,
        y: 100,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);

addObject(
    {
        type: "rect",
        x: 200,
        y: 100,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);
addObject(
    {
        type: "rect",
        x: 300,
        y: 100,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);
addObject(
    {
        type: "rect",
        x: 400,
        y: 0,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);
addObject(
    {
        type: "rect",
        x: 300,
        y: -200,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);
addObject(
    {
        type: "rect",
        x: 100,
        y: -200,
        xSize: 100,
        ySize: 100,
        rotation: 0,
        color: "#555555",
        strokeColor: "#000000",
        strokeThickness: 5,
        strokeType: "top"
    }
);
