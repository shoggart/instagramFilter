// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg
var imgIn;
var pressed = false;
var filterVersion = 0;
var matrix = [
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64],
    [1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64, 1 / 64]
];

//horizontal edge detection / vertical lines
var matrixX = [ // in javascript format
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
];
//vertical edge detection / horizontal lines
var matrixY = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];

/////////////////////////////////////////////////////////////////
function preload() {
    imgIn = loadImage("assets/husky.jpg");
}
/////////////////////////////////////////////////////////////////
function setup() {
    createCanvas((imgIn.width * 2), imgIn.height);
}
/////////////////////////////////////////////////////////////////
function draw() {
    background(125);
    image(imgIn, 0, 0);
    if (filterVersion == 0) {
        image(earlyBirdFilter(imgIn), imgIn.width, 0);
    } else if (filterVersion == 1) {
        image(invertFilter(imgIn), imgIn.width, 0);
    } else if (filterVersion == 2) {
        image(greyscaleFilter(imgIn), imgIn.width, 0);
    } else if (filterVersion == 3) {
        image(edgeDetectionFilter(imgIn), imgIn.width, 0);
    }
    noLoop();
}
/////////////////////////////////////////////////////////////////
function mousePressed() {
    loop();
}
/////////////////////////////////////////////////////////////////
function earlyBirdFilter(img) {
    var resultImg = createImage(imgIn.width, imgIn.height);
    resultImg = sepiaFilter(imgIn);
    resultImg = darkCorners(resultImg);
    resultImg = radialBlurFilter(resultImg);
    resultImg = borderFilter(resultImg)
    return resultImg;
}

function sepiaFilter(img) {
    var imgOut = createImage(img.width, img.height);

    img.loadPixels();
    imgOut.loadPixels();

    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            //creates index for each pixel in original image
            var index = (y * img.width + x) * 4;

            //stores value of each color in given pixel of original image
            var oldRed = img.pixels[index];
            var oldGreen = img.pixels[index + 1];
            var oldBlue = img.pixels[index + 2];

            //converts each color from original image to new value
            var r = (oldRed * .393) + (oldGreen * .769) + (oldBlue * .189);
            var g = (oldRed * .349) + (oldGreen * .686) + (oldBlue * .168);
            var b = (oldRed * .272) + (oldGreen * .534) + (oldBlue * .131);

            //constrains range of each color in new image
            var newRed = constrain(r, 0, 255);
            var newGreen = constrain(g, 0, 255);
            var newBlue = constrain(b, 0, 255);

            //saves new colors to new image pixels array
            imgOut.pixels[index] = newRed;
            imgOut.pixels[index + 1] = newGreen;
            imgOut.pixels[index + 2] = newBlue;
            imgOut.pixels[index + 3] = 255;
        }
    }
    imgOut.updatePixels();
    return imgOut;
}

function darkCorners(img) {
    var maxDist = dist(0, 0, img.width / 2, img.height / 2);

    for (var x = 0; x < img.width; x++) {
        for (var y = 0; y < img.height; y++) {
            var index = (y * img.width + x) * 4;

            var pixelDist = dist(x, y, img.width / 2, img.height / 2);

            if (pixelDist >= 300 && pixelDist < 450) {
                var dynLum = map(pixelDist, 300, 450, 1, 0.4);
                dynLum = constrain(dynLum, 0.4, 1);
                img.pixels[index] *= dynLum;
                img.pixels[index + 1] *= dynLum;
                img.pixels[index + 2] *= dynLum;
            } else if (pixelDist >= 450) {
                var dynLum = map(pixelDist, 450, maxDist, 0.4, 0);
                dynLum = constrain(dynLum, 0, 0.4);
                img.pixels[index] *= dynLum;
                img.pixels[index + 1] *= dynLum;
                img.pixels[index + 2] *= dynLum;
            }
        }
    }
    img.updatePixels();
    return img;
}

function radialBlurFilter(img) {
    var imgOut = createImage(img.width, img.height);
    var matrixSize = matrix.length;

    imgOut.loadPixels();
    img.loadPixels();

    // read every pixel
    for (var x = 0; x < imgOut.width; x++) {
        for (var y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;
            var c = convolution(x, y, matrix, matrixSize, img);

            var dynBlur = map(dist(mouseX, mouseY, x, y), 100, 300, 0, 1);
            dynBlur = constrain(dynBlur, 0, 1);

            var r = img.pixels[index + 0];
            var g = img.pixels[index + 1];
            var b = img.pixels[index + 2];

            imgOut.pixels[index + 0] = c[0] * dynBlur + r * (1 - dynBlur);
            imgOut.pixels[index + 1] = c[1] * dynBlur + g * (1 - dynBlur);
            imgOut.pixels[index + 2] = c[2] * dynBlur + b * (1 - dynBlur);
            imgOut.pixels[index + 3] = 255;
        }
    }

    imgOut.updatePixels();
    return imgOut;
}
/////////////////////////////////////////////////////////////////////////
function convolution(x, y, matrix, matrixSize, img) {
    var totalRed = 0.0;
    var totalGreen = 0.0;
    var totalBlue = 0.0;
    var offset = floor(matrixSize / 2);

    // convolution matrix loop
    for (var i = 0; i < matrixSize; i++) {
        for (var j = 0; j < matrixSize; j++) {
            // Get pixel loc within convolution matrix
            var xloc = x + i - offset;
            var yloc = y + j - offset;
            var index = (xloc + img.width * yloc) * 4;
            // ensure we don't address a pixel that doesn't exist
            index = constrain(index, 0, img.pixels.length - 1);

            // multiply all values with the mask and sum up
            totalRed += img.pixels[index + 0] * matrix[i][j];
            totalGreen += img.pixels[index + 1] * matrix[i][j];
            totalBlue += img.pixels[index + 2] * matrix[i][j];
        }
    }
    // return the new color
    return [totalRed, totalGreen, totalBlue];
}

function borderFilter(img) {
    var buffer = createGraphics(img.width, img.height);
    buffer.image(img, 0, 0);
    buffer.noFill();
    buffer.stroke(255);
    buffer.strokeWeight(40);
    buffer.rect(0, 0, img.width, img.height, 50);
    return buffer;
}

function invertFilter(img) {
    imgOut = createImage(img.width, img.height);

    imgOut.loadPixels();
    img.loadPixels();

    for (var x = 0; x < imgOut.width; x++) {
        for (var y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;

            var r = 255 - img.pixels[index + 0];
            var g = 255 - img.pixels[index + 1];
            var b = 255 - img.pixels[index + 2];

            imgOut.pixels[index + 0] = r;
            imgOut.pixels[index + 1] = g;
            imgOut.pixels[index + 2] = b;
            imgOut.pixels[index + 3] = 255;
        }
    }
    imgOut.updatePixels();
    return imgOut;
}

function greyscaleFilter(img) {
    var imgOut = createImage(img.width, img.height);
    imgOut.loadPixels();
    img.loadPixels();

    for (x = 0; x < imgOut.width; x++) {
        for (y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;

            var r = img.pixels[index + 0];
            var g = img.pixels[index + 1];
            var b = img.pixels[index + 2];

            var gray = (r + g + b) / 3; // simple
            // var gray = r * 0.299 + g * 0.587 + b * 0.0114; // LUMA ratios

            imgOut.pixels[index + 0] = imgOut.pixels[index + 1] = imgOut.pixels[index + 2] = gray;
            imgOut.pixels[index + 3] = 255;
        }
    }
    imgOut.updatePixels();
    return imgOut;
}

function edgeDetectionFilter(img) {
    var imgOut = createImage(img.width, img.height);
    var matrixSize = matrixX.length;

    imgOut.loadPixels();
    img.loadPixels();

    // read every pixel
    for (var x = 0; x < imgOut.width; x++) {
        for (var y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;
            var cX = convolution2(x, y, matrixX, matrixSize, img);
            var cY = convolution2(x, y, matrixY, matrixSize, img);

            cX = map(abs(cX[0]), 0, 1020, 0, 255);
            cY = map(abs(cY[0]), 0, 1020, 0, 255);
            var combo = cX + cY;

            imgOut.pixels[index + 0] = combo;
            imgOut.pixels[index + 1] = combo;
            imgOut.pixels[index + 2] = combo;
            imgOut.pixels[index + 3] = 255;
        }
    }
    imgOut.updatePixels();
    return imgOut;
}
/////////////////////////////////////////////////////////////////////
function convolution2(x, y, matrix, matrixSize, img) {
    var totalRed = 0.0;
    var totalGreen = 0.0;
    var totalBlue = 0.0;
    var offset = floor(matrixSize / 2);

    // convolution matrix loop
    for (var i = 0; i < matrixSize; i++) {
        for (var j = 0; j < matrixSize; j++) {
            // Get pixel loc within convolution matrix
            var xloc = x + i - offset;
            var yloc = y + j - offset;
            var index = (xloc + img.width * yloc) * 4;
            // ensure we don't address a pixel that doesn't exist
            index = constrain(index, 0, img.pixels.length - 1);

            // multiply all values with the mask and sum up
            totalRed += img.pixels[index + 0] * matrix[i][j];
            totalGreen += img.pixels[index + 1] * matrix[i][j];
            totalBlue += img.pixels[index + 2] * matrix[i][j];
        }
    }
    // return the new color as an array
    return [totalRed, totalGreen, totalBlue];
}

function keyPressed() {
    if (keyCode == 39) { //right arrow
        filterVersion += 1;
    } else if (keyCode == 37) { //left arrow
        filterVersion -= 1;
    }
    if (filterVersion > 3) {
        filterVersion = 3;
    }
    if (filterVersion < 0) {
        filterVersion = 0;
    }
    draw();
}
