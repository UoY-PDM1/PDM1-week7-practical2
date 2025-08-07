import { TestResults, advanceToFrame, getShapes, canvasStatus, testSettingIsCalled, LOAD_IMAGE, checkCanvasSize, TestImage } from "../../lib/test-utils.js";

/**
 * A hacky solution to wait for p5js to load the canvas. Include in all exercise test files.
 */
function waitForP5() {
    const canvases = document.getElementsByTagName("canvas");
    if (canvases.length > 0) {
        clearInterval(loadTimer);
        runTests(canvases[0]);
    }
}

function testFunction(x, y) {
    const res = (y * width + x) * 4;
    if (getIndexOfPixel(x, y) === res) {
        TestResults.addPass(`<code>getIndexOfPixel(${x}, ${y})</code> returns ${res}.`);
    } else {
        TestResults.addFail(`<code>getIndexOfPixel(${x}, ${y})</code> should return ${res}. It returns ${getIndexOfPixel(x, y)} instead.`);
    }
}

async function runTests(canvas) {
    canvas.style.pointerEvents = "none";
    const resultsDiv = document.getElementById("results");
    for (const e of canvasStatus.errors) {
        TestResults.addFail(`In frame ${frameCount}, ${e}`);
    }
    const loadInPreload = testSettingIsCalled(LOAD_IMAGE, false, false, true);
    const loadInSetup = testSettingIsCalled(LOAD_IMAGE, true, false, false);
    const loadInDraw = testSettingIsCalled(LOAD_IMAGE, false, true, false);
    if (loadInPreload) {
        TestResults.addPass("<code>loadImage()</code> is called in <code>preload()</code>.");
    }
    if (loadInSetup) {
        TestResults.addWarning("<code>loadImage()</code> is called in <code>setup()</code>. Although this can work, it should only be called in <code>preload()</code> to ensure the image is fully loaded before any other code is run.");
    }
    if (loadInDraw) {
        TestResults.addFail("<code>loadImage()</code> should not be called in <code>draw()</code> because it will repeatedly load the image.");
    }
    if (!loadInPreload && !loadInSetup && !loadInDraw) {
        TestResults.addWarning("<code>loadImage()</code> does not appear to be called (this test will not detect usage of <code>loadImage()</code> outside <code>preload()</code>, <code>setup()</code>, or <code>draw()</code>).");
    }
    let actualImages = [...getShapes()].filter(s => s.type === IMAGE);
    if (actualImages.length < 1) {
        TestResults.addFail(`Expected at least three images. Found ${actualImages.length}.`);
    } else {
        TestResults.addPass("The sketch contains at least one image.")
    }
    if (window.hasOwnProperty("getIndexOfPixel")) {
        TestResults.addPass("The sketch contains a function called <code>getIndexOfPixel()</code>.");
        if (getIndexOfPixel.length === 2) {
            TestResults.addPass("<code>getIndexOfPixel()</code> takes two arguments.");
            testFunction(0, 0);
            testFunction(width - 1, 0);
            testFunction(0, 1);
            testFunction(1, 2);
            testFunction(width - 1, height - 1);
        } else {
            TestResults.addFail(`Expected <code>getIndexOfPixel()</code> to take two arguments. Found ${getIndexOfPixel.length}. Not running any more tests.`);
        }
    } else {
        TestResults.addWarning("The sketch does not contain a function called <code>getIndexOfPixel()</code>. Unable to run tests.");
    }
    TestResults.display(resultsDiv);
    const para = document.createElement("p");
    para.innerHTML = "These tests focus on the <code>getIndexOfPixel()</code> function, not your wipes. The tests assume that the function has the exact parameters described in the instructions and that the image is the same width as the canvas.";
    resultsDiv.prepend(para);
}


const loadTimer = setInterval(waitForP5, 500);
