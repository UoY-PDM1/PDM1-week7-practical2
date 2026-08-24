import { TestResults, advanceToFrame, getShapes, canvasStatus, testSettingIsCalled, LOAD_IMAGE, checkCanvasSize, TestImage, SHAPE } from "https://cdn.jsdelivr.net/gh/Supportive-IDE/p5js-testing-demo@latest/p5jsTestingLibrary.js";

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
    const actualImgs = actualShapes.filter(s => s.type === SHAPE.IMAGE);
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
    const loadInSetup = testSettingIsCalled(LOAD_IMAGE.re, true, false, false);
    const loadInDraw = testSettingIsCalled(LOAD_IMAGE.re, false, true, false);
    if (loadInSetup) {
        TestResults.addPass("<code>loadImage()</code> is called in <code>setup()</code>.");
    }
    if (loadInDraw) {
        TestResults.addFail("<code>loadImage()</code> should not be called in <code>draw()</code> because it will repeatedly load the image.");
    }
    if (!loadInSetup && !loadInDraw) {
        TestResults.addWarning("<code>loadImage()</code> does not appear to be called (this test will not detect usage of <code>loadImage()</code> outside <code>setup()</code> or <code>draw()</code>).");
    }
    const imgOnLoad = new TestImage(width / 2, height / 2, width, height, 1024, 820, CENTER);
    const imgOnLoadIncFirst = new TestImage(width / 2, height / 2, width + 1, height + 1, 1024, 820, CENTER);
    const actualShapesOnLoad = getShapes();
    const firstImg = actualShapesOnLoad[actualShapesOnLoad.length - 1];
    if (firstImg.type === SHAPE.IMAGE) {
        TestResults.addPass("When the sketch first loads, there is an image on the canvas.");
    } else {
        TestResults.addFail("When the sketch first loads, there should be an image in the centre of the canvas that is the same size as the canvas. You can achieve this by setting <code>imageMode(CENTER)</code>, positioning the image at width / 2, height / 2, and giving it a width of 512 and a height of 410 (use variables!).")
    }
    await advanceToFrame(frameCount + 1);
    const actualShapesNextFrame = getShapes();
    const secondImg = actualShapesNextFrame[actualShapesNextFrame.length - 1];
    if (firstImg.type === IMAGE && secondImg.type === SHAPE.IMAGE) {
        const firstLoc = [(imgOnLoad.x + imgOnLoad.w) / 2, (imgOnLoad.y + imgOnLoad.h) / 2]; //secondImg.getLocationInMode(CENTER);
        const secondLoc = [(secondImg.x + secondImg.w) / 2, (secondImg.y + secondImg.h) / 2]; //secondImg.getLocationInMode(CENTER);
        if (firstLoc[0] === secondLoc[0] && firstLoc[1] === secondLoc[1] && firstLoc[0] === width / 2 && firstLoc[1] === height / 2) {
            TestResults.addPass("At frame 2, the image is in the centre of the canvas.");
        }
        if (secondImg.w - firstImg.w === 1 && secondImg.h - firstImg.h) {
            TestResults.addPass("The image grows by 1 pixel (width and height) each frame.");

            await advanceToFrame(2000);
            const actualShapesStop = getShapes();
            const lastImg = actualShapesStop[actualShapesStop.length - 1];
            if (lastImg.h === 820) {
                TestResults.addPass("Your image stops growing when it reaches the height of the original image (820px).");
            } else {
                TestResults.addFail(`The image should stop growing once its height reaches the height of the original image (820px). After 2000 frames, your image is ${lastImg.h} pixels tall.`);
            }
        } else {
            TestResults.addFail(`Expected the image to grow by 1 pixel per frame along the width and height. Your image width grows by ${secondImg.w - firstImg.w} and the height grows by ${secondImg.h - firstImg.h}.`);
        }
    } else {
        TestResults.addFail("The image does not appear to be drawn at frame 2.");
    }

    // checkImageProperties(imgOnLoad, [...getShapes()]);
    // imgOnLoad.x -= 0.5;
    // imgOnLoad.y -= 0.5;
    // imgOnLoad.w++;
    // imgOnLoad.h++;
    // advanceToFrame(frameCount+1);
    // checkImageProperties(imgOnLoad, [...getShapes()]);
    // advanceToFrame(1000);
    // imgOnLoad.x = width / 2 - 922 / 2;
    // imgOnLoad.y = height / 2 - 820 / 2;
    // imgOnLoad.w = 922;
    // imgOnLoad.h = 820;
    // checkImageProperties(imgOnLoad, [...getShapes()]);
    TestResults.display(resultsDiv);
}


const loadTimer = setInterval(waitForP5, 500);
