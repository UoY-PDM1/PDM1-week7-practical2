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

function checkImageProperties(expectedImg, actualShapes) {
    const actualImgs = actualShapes.filter(s => s.type === IMAGE);
    if (actualImgs.length === 0) {
        TestResults.addFail(`At frame ${frameCount}, no images were found on the canvas.`);
    } else {
        const lastImg = actualImgs[actualImgs.length - 1];
        if (expectedImg.isEqualTo(lastImg)) {
            TestResults.addPass(`At frame ${frameCount}, the image is displayed in the centre with a width of ${lastImg.w} and a height of ${lastImg.h}.`);
        } else {
            TestResults.addFail(`At frame ${frameCount}, expected the image to be displayed in the centre with a width of ${expectedImg.w} and a height of ${expectedImg.h}. Found an image at ${lastImg.x}, ${lastImg.y} (coordinates converted to CORNER mode), with a width of ${lastImg.w} and a height of ${lastImg.h}.`);
        }
    }
}

function checkPlaneImages(actualImages) {
    const planeWidths = new Set();
    const planeXs = new Set();
    for (let p of actualImages) {
        planeWidths.add(p.w);
        planeXs.add(p.x);
    }
    if (planeWidths.size > 1) {
        TestResults.addPass("The images drawn above the background are different sizes.");
    } else {
        TestResults.addFail("The images drawn above the background are the same size (or there is only one image).");
    }
    if (planeXs.size > 1) {
        TestResults.addPass("The images drawn above the background are at different x locations.");
    } else {
        TestResults.addFail("The images drawn above the background are at the same x location (or there is only one image).");
    }
}

async function runTests(canvas) {
    canvas.style.pointerEvents = "none";
    const resultsDiv = document.getElementById("results");
    checkCanvasSize(800, 600);
    advanceToFrame(frameCount + 1);
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
    if (actualImages.length < 3) {
        TestResults.addFail(`Expected at least three images (one sky and two planes). Found ${actualImages.length}.`);
    } else {
        TestResults.addPass("The sketch contains at least three images.")
    }
    if (actualImages.length > 0) {
        const skyImg = new TestImage(0, 0, 800, 600, 800, 600);
        if (actualImages[0].isEqualTo(skyImg, true)) {
            TestResults.addPass("The first image drawn on the canvas takes up the full size of the canvas.");
        } else {
            TestResults.addFail(`Expected the first image drawn to fill the canvas. Found an image at ${actualImages[0].x}, ${actualImages[0].y} with a width of ${actualImages[0].w} and a height of ${actualImages[0].h}.`);
        }
        checkPlaneImages(actualImages.slice(1));
    }
    TestResults.display(resultsDiv);
}


const loadTimer = setInterval(waitForP5, 500);
