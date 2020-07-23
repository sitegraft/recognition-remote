require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

const posenet = require('@tensorflow-models/posenet');
const robot = require("robotjs");
const remote = require('electron').remote;
const WebCamera = require("webcamjs");
const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');
const url = require('url');

const curWin = remote.getCurrentWindow();

let app = remote.app;

document.getElementById("patreonButton").addEventListener("click", () => {
    require("electron").shell.openExternal("https://www.patreon.com/sitegraft");
});

window.addEventListener('DOMContentLoaded', (event) => {
    addWandH();
});

document.getElementById("showVideo").addEventListener("click", (event) => {
    console.log(document.getElementsByTagName("video")[0], document.getElementById("showVideo").checked);
    if (document.getElementById("showVideo").checked == true) {
        document.getElementsByTagName("video")[0].style.display = "block";
    } else {
        document.getElementsByTagName("video")[0].style.display = "none";
    }
});

let video;
let halfHeight;
let vidWidth;
let vidHeight;
let interval;

function addWandH() {
    video = document.getElementsByTagName("video")[0];
    video.width = parseInt(document.getElementsByTagName("video")[0].style.width);
    video.height = parseInt(document.getElementsByTagName("video")[0].style.height);
    vidWidth = video.width;
    vidHeight = video.height;
    halfHeight = video.height / 2 + 20;
    /*
    video.addEventListener('timeupdate', (event) => {
        getCurrentFrame();
    });
    */
    video.addEventListener('loadeddata', (event) => {
        interval = setInterval(() => {
            //console.log("test");
            getCurrentFrame();
        }, 75);
    })
}

let record = true;
let loading = true;

//AI MODEL
let net;
(async () => {
    // load the posenet model from a checkpoint
    net = await posenet.load();
})()

const screenSize = robot.getScreenSize();

let clickCounter = 0;

function convertFromVidSizeToScreenSize(rightShoulder, rightWrist, dimen) {
    let screenX = robot.getMousePos().x;
    let screenY = robot.getMousePos().y;

    let xFreeze = false;
    let yFreeze = false;

    if (rightShoulder.position.x + dimen < rightWrist.position.x) {
        screenX = screenX - 10;
    } else if (rightShoulder.position.x - dimen > rightWrist.position.x) {
        screenX = screenX + 10;
    } else {
        xFreeze = true;
    }

    if (rightShoulder.position.y - dimen > rightWrist.position.y) {
        screenY = screenY - 10;
    } else if (rightShoulder.position.y + dimen < rightWrist.position.y) {
        screenY = screenY + 10;
    } else {
        yFreeze = true;
    }

    if (xFreeze && yFreeze) {
        clickCounter = clickCounter + 1;
    }

    if (clickCounter > 40) {
        robot.mouseClick();
        clickCounter = 0;
    }

    return [screenX, screenY];
}

let keyboardToggle = false;

function getCurrentFrame() {
    let pose;
    (async () => {
        pose = await net.estimateSinglePose(document.getElementsByTagName("video")[0], {
            flipHorizontal: false
        });
        //document.getElementById("curAction").innerText = "Image recognition loaded";
        if (record) {
            let eyeLength = (pose.keypoints[1].position.x - pose.keypoints[2].position.x) * 1.5;
            //minimum 0.2 score confidence
            if (pose.keypoints[6].score > 0.50 && pose.keypoints[10].score > 0.50) {
                document.getElementById("shoulder").style.display = "none";
                document.getElementById("wrist").style.display = "none";
                //tracks dominant hand with sensitivity levels
                /*if (pose.keypoints[9].score > pose.keypoints[10].score) {
                    let screenPos = convertFromVidSizeToScreenSize(pose.keypoints[9].position.x, pose.keypoints[9].position.y, pose.keypoints[0].position.x, pose.keypoints[0].position.y,eyeLength);
                    robot.moveMouse(screenPos[0] + modifierX, screenPos[1] - modifierY);
                    //click sim
                } else if (pose.keypoints[9].score < pose.keypoints[10].score) {*/
                let screenPos = convertFromVidSizeToScreenSize(pose.keypoints[6], pose.keypoints[10], eyeLength);
                robot.moveMouse(screenPos[0], screenPos[1]);
                //click sim
                //}

            //ADD LEFT HAND SCROLL

            } else {
                if (pose.keypoints[6].score < 0.50) {
                    document.getElementById("shoulder").style.display = "block";
                }
                if (pose.keypoints[10].score < 0.50) {
                    document.getElementById("wrist").style.display = "block";
                }
            }
        }

        if (loading) {
            loading = false;
            document.getElementById("loading").style.display = "none";
            document.getElementById("loading1").style.display = "none";
        }

    })()
}





//CONTROLS

function closeWindow() {
    curWin.close();
    childWindow.close();
}

function minimizeWindow() {
    curWin.minimize();
}

function toggleScreenControl() {
    /*
    if (record) {
        document.getElementById("startbut").innerText = "Start remote control";
        document.getElementById("startbut").style.backgroundColor = "rgb(50,205,50)";
    } else {
        document.getElementById("startbut").innerText = "Stop remote control";
        document.getElementById("startbut").style.backgroundColor = "rgb(179, 54, 54)";
    }*/
    record = !record;
}

// A flag to know when to start or stop the camera
let enabled = false;

enabled = true;
WebCamera.attach('#camdemo');

document.getElementById("start").addEventListener('click', function () {
    if (!enabled) { // Start the camera !
        enabled = true;
        WebCamera.attach('#camdemo');
        addWandH();
        curWin.setSize(210, 210);
        document.getElementsByClassName("copyright")[0].style.display = "block";
        document.getElementById("camdemo").style.pointerEvents = "none";
        document.getElementById("camdemo").style.touchAction = "none";
        document.getElementById("showDiv").style.display = "block";
        toggleScreenControl();
    } else { // Disable the camera !
        enabled = false;
        WebCamera.reset();
        document.getElementsByClassName("copyright")[0].style.display = "none";
        document.getElementById("camdemo").style.pointerEvents = "auto";
        document.getElementById("camdemo").style.touchAction = "auto";
        document.getElementById("camdemo").innerHTML = '<div onclick="minimizeWindow();" id="minimize2" style="cursor:pointer;background-color: #FFBD44;display: inline-block;font-size: 50%;left:20px;top:80px;transform: rotate(-90deg);" class="menu-item"><i style="transform: rotate(-90deg);display: block;margin-top: 5px;margin-left: -2px;" class="fa fa-window-minimize"></i></div><div onclick="closeWindow()" id="close2" style="cursor:pointer;background-color: red;display: inline-block;font-size: 50%;left:60px;top:80px;" class="menu-item"><i style="transform: rotate(-90deg);" class="fa fa-times"></i></div>'
        document.getElementById("camdemo").innerHTML += '\n <p style="color:red;margin-top:95px;pointer-events:none;touch-action:none;">Disconnected from camera.</p>';
        toggleScreenControl();

        document.getElementById("showDiv").style.display = "none";
        clearInterval(interval);
        curWin.setSize(100, 110);
        for (let i = 0; i < document.getElementsByClassName("warning").length; i++) {
            document.getElementsByClassName("warning")[i].style.display = "none";
        }
    }
}, false);

/*
document.addEventListener("click", (event) => {
    if (event.target + "" == "[object HTMLHtmlElement]") {
        curWin.setIgnoreMouseEvents(true);
        robot.mouseClick();
        curWin.setIgnoreMouseEvents(false);
    };
}) */

let childWindow;

document.getElementById("keyboardBut").addEventListener("click", (event) => {
    childWindow = new BrowserWindow({
        alwaysOnTop: true,
        resizable: true,
        width: 800,
        height: 330,
        titleBarStyle: "none",
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false
        },
        x: screenSize.width/2 - 550,
        y: screenSize.height - 600,
        frame: false
    });
    childWindow.setFocusable(false);
    childWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'keyboard.html'),
        protocol: 'file:',
        slashes: true
    }));

    childWindow.setAlwaysOnTop(true, 'screen');
    childWindow.removeMenu();
    //childWindow.webContents.openDevTools()
});

//KEYBOARD

function execKey(key){
    robot.keyTap(key);
}