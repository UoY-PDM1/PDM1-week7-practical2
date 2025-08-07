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
    if (actualImages.length < 2) {
        TestResults.addFail(`Expected two images. Found ${actualImages.length}.`);
    } else {
        TestResults.addPass("The sketch contains at least two images.")
    }
    if (actualImages.length >= 2) {
        // check same size and location
        const bgImg = actualImages[actualImages.length - 2];
        const topImg = actualImages[actualImages.length - 1];
        if (bgImg.x === topImg.x && bgImg.y === topImg.y) {
            TestResults.addPass("One image is drawn on top of the other.");
        } else {
            TestResults.addFail("Expected one image to be drawn on top of the other but the images have been drawn at different locations.");
        }
        // step ahead, check pixel alpha values
        advanceToFrame(frameCount + 1);
        if (canvasStatus.imageObjects.length > 0) {
            const topObj = canvasStatus.imageObjects[canvasStatus.imageObjects.length - 1];
            try {
                topObj.loadPixels();
                const alphas = topObj.pixels.filter((_, i) => i % 4 === 3);
                let faded = false;
                for (const alpha of alphas) {
                    if (alpha === 255) {
                        faded = false;
                        TestResults.addFail("The alpha values of the top image do not appear to change. Have you called <code>updatePixels()</code> on the image object after changing the pixel values?");
                        break;
                    } else {
                        faded = true;
                    }
                }
                if (faded) {
                    TestResults.addPass("The alpha values of the top image change.");
                    
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    TestResults.display(resultsDiv);
}


const loadTimer = setInterval(waitForP5, 500);
