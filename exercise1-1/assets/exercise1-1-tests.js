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

async function runTests(canvas) {
    canvas.style.pointerEvents = "none";
    const resultsDiv = document.getElementById("results");
    checkCanvasSize(512, 410);
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
    const imgOnLoad = new TestImage(width / 2, height / 2, width, height, 1024, 820, CENTER);
    checkImageProperties(imgOnLoad, [...getShapes()]);
    imgOnLoad.x -= 0.5;
    imgOnLoad.y -= 0.5;
    imgOnLoad.w++;
    imgOnLoad.h++;
    advanceToFrame(frameCount+1);
    checkImageProperties(imgOnLoad, [...getShapes()]);
    advanceToFrame(1000);
    imgOnLoad.x = width / 2 - 922 / 2;
    imgOnLoad.y = height / 2 - 820 / 2;
    imgOnLoad.w = 922;
    imgOnLoad.h = 820;
    checkImageProperties(imgOnLoad, [...getShapes()]);
    TestResults.display(resultsDiv);
}


const loadTimer = setInterval(waitForP5, 500);
