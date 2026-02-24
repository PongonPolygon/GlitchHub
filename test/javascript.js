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
    moveCameraWithSmoothing();
    zoomWithSmoothing();
    checkKeys();
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
    keysPressed[event.key] = true;
});
document.addEventListener("keyup", (event) => {
    delete keysPressed[event.key];
});


document.addEventListener("wheel", (event) => {
    camera.targetZoom += (-event.deltaY/1000)*camera.targetZoom;

});

function checkKeys() {
    if (keysPressed.ArrowRight) {
        camera.xTarget += 20;
    }
    if (keysPressed.ArrowLeft) {
        camera.xTarget -= 20;
    }
    if (keysPressed.ArrowUp) {
        camera.yTarget -= 20;
    }
    if (keysPressed.ArrowDown) {
        camera.yTarget += 20;
    }
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

function moveCameraWithSmoothing() {
    camera.x += (camera.xTarget - camera.x)/camera.smoothing;
    camera.y += (camera.yTarget - camera.y)/camera.smoothing;
}

function zoomWithSmoothing() {
    camera.zoom += (camera.targetZoom - camera.zoom)/camera.zoomSmoothing;
}

let objects = [];
// draw objects
function drawObjects() {
    for (const object of objects) {
        if (object.type === "rect") {
            // center the rect
            const PosFixed = {
                x: object.xPosition - object.xSize / 2,
                y: object.yPosition - object.ySize / 2
            };

            // calculate screen position relative to camera and zoom
            const screenX = (PosFixed.x - camera.x) * camera.zoom + canvas.width / 2;
            const screenY = (PosFixed.y - camera.y) * camera.zoom + canvas.height / 2;

            ctx.fillStyle = object.color;
            ctx.strokeStyle = object.outlineColor;
            ctx.lineWidth = object.outlineThickness;
            
            if (object.outlineMode == "none") {
                ctx.fillRect(
                    screenX,
                    screenY,
                    object.xSize * camera.zoom,
                    object.ySize * camera.zoom
                );
            } else if (object.outlineMode == "bottom") {
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
            } else if (object.outlineMode == "top") {
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
function addObject(type, xPosition, yPosition, xSize, ySize, rotation, id, color, outlineMode, outlineThicknes, outlineColor) {
    let objinfo = {
        type: type,
        xPosition: xPosition,
        yPosition: yPosition,
        xSize: xSize,
        ySize: ySize,
        rotation: rotation,
        color: color,
        outlineMode: outlineMode || "none",
        outlineColor: outlineColor || "black",
        outlineThickness: outlineThicknes || "0",
        id: id
    };
    
    objects.push(objinfo);
}

function getReturnedQuardsToMiddle(xSize, ySize) {
    return {
        middleX: xSize/2,
        middleY: ySize/2
    };
}

addObject("rect", 0, 0, 250, 250, 0, "OBJECT", "#FFFFFF", "top", "5", "#000000");
