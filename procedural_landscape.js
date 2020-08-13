function drawLake(posX, posY, width, height, contextLayer, ctx) {
    contextLayer.strokeStyle = "#000000";
    contextLayer.fillStyle = "#0000FF";

    var startX = posX - width;
    var endX = posX + width;
    var startY = posY - height;
    var endY = posY + height;

    // contextLayer.beginPath();
    // contextLayer.ellipse(posX, posY, width, height, 0, 0, 2 * Math.PI);
    // contextLayer.fill();

    contextLayer.strokeStyle = "#000000";

    for (var x = startX; x <= endX; x++) {
        for (var y = startY; y <= endY; y++) {
            var pixel = ctx.getImageData(x, startY - (y - startY) * 4, 1, 1);
            // contextLayer.fillStyle = "#FF000030";
            contextLayer.fillStyle = "rgba(" + pixel.data[0] + "," + pixel.data[1] + "," + (pixel.data[2] * 0.5 + 200) + "," + 0x80 + ")";
            contextLayer.fillRect(x, y, 1, 1);
            // contextLayer.fillStyle = "rgba(0, 0, 127, 127)"
            // contextLayer.fillRect(x, y, 1, 1);
        }
    }
}

function drawLeaves(posX, posY, radius, dirSun, numLeaves, ctx) {
    // ctx.fillStyle = "rgba(" + pixel.data[0] + "," + pixel.data[1] + "," + (pixel.data[2] * 0.5 + 200) + "," + 0x80 + ")"

    // var numLeaves = 15; // due to high number of branches in trees, this number can make, keep it low
    // the total amount of leaves explosive.

    for (var i = 0; i < numLeaves; i++) {
        var depth = 1 - (i / numLeaves);
        var offsetX = (Math.random() * 2 - 1) * radius / 2;
        var offsetY = (Math.random() * 2 - 1) * radius / 2;
        var posX = posX + offsetX;
        var posY = posY + offsetY;

        // are the leaves exposed to sunlight (with dirSun vector?)
        var exposed = ((offsetX * dirSun[0] + offsetY * dirSun[1]) > 0 ? 1 : 0.4);
        // var distFromCenter = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        // make leaves in the back, darker, as well as the unexposed ones to give depth
        ctx.fillStyle = "rgba(" + (15 + 15 * (1 - depth)) + "," + (80 + 80 * (1 - depth)) * exposed + "," + 0x0 + "," + 0xFF + ")"
        ctx.beginPath();
        //half elipse will make good enough leaves
        ctx.ellipse(posX, posY, radius / 3, radius / 10, Math.PI * Math.random(), 0, 2 * Math.PI);
        ctx.fill();
    }
}

// kind of a L-system tree
function drawTrunk(startX, startY, angle, level, maxLevel, length, originalLength, randNumbers, endBranch, sunDir, localCtx) {
    if (level >= maxLevel) {
        localCtx.strokeStyle = "#000000";
        localCtx.fillStyle = "#FFFFFF"; //black trunks are good enough, but can be experimented
        localCtx.lineWidth = length / 15;

        localCtx.beginPath();
        localCtx.moveTo(startX, startY);
        localCtx.lineTo(startX + length * Math.sin(angle), startY + length * Math.cos(angle));
        localCtx.stroke();

        // if this is an end branch, draw the leaves
        if (endBranch === true) {
            var posEnd = [startX + length * Math.sin(angle), startY + length * Math.cos(angle)];

            // leaves circles
            // {
            //     localCtx.strokeStyle = "#000000";
            //     localCtx.fillStyle = "#00FF0080";
            //     localCtx.beginPath();
            //     localCtx.arc(posEnd[0], posEnd[1], original_length / 6, 0, 2 * Math.PI);
            //     localCtx.fill();
            // }

            // trees in the back will have less leaves
            var numLeaves = 10 + Math.ceil(0.2 * length);
            drawLeaves(posEnd[0], posEnd[1], originalLength / 4, sunDir, numLeaves, localCtx);
        }

        return;
    }

    // base trunk, unchanged, give it a level of 1000 to be drawn immediately
    var curAngle = angle;
    drawTrunk(startX, startY, angle, level + 1000, maxLevel, length, originalLength, randNumbers, false, sunDir, localCtx);
    var curPos = [startX + length * Math.sin(angle), startY + length * Math.cos(angle)];

    // branch at the top of the trunk
    {
        var newAngleIncrement = 3.1415 / 10 * randNumbers[0];
        var newAngle = curAngle + newAngleIncrement;
        // var newPos = [curPos[0] + length * Math.sin(newAngle), curPos[1] + length * Math.cos(newAngle)];
        drawTrunk(curPos[0], curPos[1], newAngle, level + 1, maxLevel, length * 0.8, originalLength, randNumbers, true, sunDir, localCtx);
    }

    // next two branches should be on the two sides of the trunk, enforce it with a variable
    var branchDir = 1;
    if (randNumbers < 0.5) {
        branchDir = -1;
    }

    // side trunk
    {
        var newAngleIncrement = 3.1415 / 3 * (randNumbers[1] / 2 + 0.5) * branchDir;
        var newAngle = curAngle + newAngleIncrement;
        var startLength = length * ((randNumbers[2] / 2 + 0.5) * 0.4 + 0.5)
        var curPos = [startX + startLength * Math.sin(angle), startY + startLength * Math.cos(angle)];
        // var newPos = [curPos[0] + length * Math.sin(newAngle), curPos[1] + length * Math.cos(newAngle)];
        drawTrunk(curPos[0], curPos[1], newAngle, level + 1, maxLevel, length * 0.6, originalLength, randNumbers, true, sunDir, localCtx);
    }

    // side trunk
    {
        var newAngleIncrement = 3.1415 / 2 * (randNumbers[3] / 2 + 0.5) * -branchDir;
        var newAngle = curAngle + newAngleIncrement;
        var startLength = length * ((randNumbers[4] / 2 + 0.5) * 0.3 + 0.5)
        var curPos = [startX + startLength * Math.sin(angle), startY + startLength * Math.cos(angle)];
        // var newPos = [curPos[0] + length * Math.sin(newAngle), curPos[1] + length * Math.cos(newAngle)];
        drawTrunk(curPos[0], curPos[1], newAngle, level + 1, maxLevel, length * 0.5, originalLength, randNumbers, true, sunDir, localCtx);
    }
}

function drawTree(startX, startY, angle, level, maxLevel, length, sunDir, localCtx) {
    var randNumbers = [];

    // prepare an array of random numbers in order to have self repeating branches
    // although we have a recursive algorithm, o/w tree would be only chaotic.
    for (var i = 0; i < 32; i++) {
        randNumbers[i] = Math.random() * 2 - 1;
    }

    drawTrunk(startX, startY, angle, level, maxLevel, length, length, randNumbers, true, sunDir, localCtx);
}

// simple blurry, half transparent dark ellipse (could be smarter)
function drawTreeShadow(startX, startY, length, sunDir, localCtx) {

    localCtx.fillStyle = "rgba(" + 0x00 + "," + 0x00 + "," + 0x00 + "," + 0.5 + ")"
    localCtx.filter = 'blur(' + 8 + 'px)';

    localCtx.beginPath();
    // provide a slight offset to the shadow in the x direction
    localCtx.ellipse(Math.floor(startX - (sunDir[0] * startX) * 0.05), startY, length, length / 8, 0, 0, 2 * Math.PI);
    localCtx.fill();

    localCtx.filter = 'blur(' + 0 + 'px)';

    // localCtx.ellipse(startX - length / 2, startY, length / 2, length / 8, 0, 0, 2 * Math.PI);
}

// angle left should be negative
// angle ridge can be whatever but should between left and right
function drawMountain(posX, posY, angleLeft, angleRight, angleRidge, height, maxHeight, sunDir, localCtx) {
    localCtx.strokeStyle = "#000000";
    localCtx.fillStyle = "#DFDFDF";

    // multiplication to simulate crude gaussian
    var randomColVariation = (Math.random() * 2 - 1) * (Math.random() * 2 - 1);

    var grassRed = Math.floor(24 + 8 * randomColVariation)
    var grassGreen = Math.floor(140 + 36 * randomColVariation)
    var grassBlue = Math.floor(40 + 8 * randomColVariation)

    var snowHeight = height - 110 + 30 * Math.random();
    snowHeight = (snowHeight < 0) ? 0 : snowHeight;

    // provides variety, snow can be a bit gray
    var snowColor = 0xD0 + Math.random() * 0x2F;

    var leftMiddleAngle = (angleLeft + angleRidge) / 2;

    // subtract 90deg from the angle between left side and the ridge to get a normal vector
    var leftSideNormalAngle = leftMiddleAngle - Math.PI / 2;
    var leftSideNormalVector = [Math.cos(leftSideNormalAngle), Math.sin(leftSideNormalAngle)];
    var lightStrengthLeft = sunDir[0] * leftSideNormalVector[0] + sunDir[1] * leftSideNormalVector[1];
    if (lightStrengthLeft < 0.3) {
        lightStrengthLeft = 0.3; // don't make it completely dark in case it is hidden ==> simulates ambient light
    }
    var heightRatio = height / 150;
    heightRatio = (heightRatio > 1) ? 1 : heightRatio;
    lightStrengthLeft = heightRatio * lightStrengthLeft + (1 - heightRatio) * 0.5;

    // var colLeft = 0x010101 * Math.floor(lightStrengthLeft * 0xFF);
    var rgb = [Math.floor(grassBlue * lightStrengthLeft), Math.floor(grassGreen * lightStrengthLeft), Math.floor(grassRed * lightStrengthLeft)]
    var colLeft = rgb[0] + (rgb[1] << 8) + (rgb[2] << 16)
    var col = '#' + (colLeft & 0xffffff).toString(16).padStart(6, 0)
    localCtx.fillStyle = col;
    localCtx.strokeStyle = localCtx.fillStyle;

    localCtx.beginPath();
    localCtx.moveTo(posX, posY);
    localCtx.lineTo(posX + Math.tan(angleLeft) * height, posY + height);
    localCtx.lineTo(posX + Math.tan(angleRidge) * height, posY + height);
    localCtx.fill();

    var rightMiddleAngle = (angleRidge + angleRight) / 2

    // substract 90deg from the angle between left side and the ridge to get a normal vector
    var rigthSideNormalAngle = rightMiddleAngle - Math.PI / 2;
    var rightSideNormalVector = [Math.cos(rigthSideNormalAngle), Math.sin(rigthSideNormalAngle)];
    var lightStrengthRight = sunDir[0] * rightSideNormalVector[0] + sunDir[1] * rightSideNormalVector[1];
    if (lightStrengthRight < 0.3) {
        lightStrengthRight = 0.3; //dont make it completely dark in case it is hidden ==> simulates ambiant light
    }

    var heightRatio = height / 150;
    heightRatio = (heightRatio > 1) ? 1 : heightRatio;
    lightStrengthRight = heightRatio * lightStrengthRight + (1 - heightRatio) * 0.5;
    var rgb = [Math.floor(grassBlue * lightStrengthRight), Math.floor(grassGreen * lightStrengthRight), Math.floor(grassRed * lightStrengthRight)]

    var colLeft = rgb[0] + (rgb[1] << 8) + (rgb[2] << 16)
    var col = '#' + (colLeft & 0xffffff).toString(16).padStart(6, 0)
    localCtx.fillStyle = col;
    localCtx.strokeStyle = localCtx.fillStyle;

    localCtx.beginPath();
    localCtx.moveTo(posX, posY);
    localCtx.lineTo(posX + Math.tan(angleRidge) * height, posY + height);
    localCtx.lineTo(posX + Math.tan(angleRight) * height, posY + height);
    localCtx.fill();

    localCtx.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
    localCtx.clearRect(0, 0, sizeCanvas[0], posY + snowHeight);

    // snowtop left
    var red = Math.floor(snowColor * lightStrengthLeft)
    var green = Math.floor(snowColor * lightStrengthLeft)
    var blue = Math.floor(snowColor * lightStrengthLeft)
    var colLeft = blue + (green << 8) + (red << 16)
    var col = '#' + (colLeft & 0xffffff).toString(16).padStart(6, 0)
    localCtx.fillStyle = col;
    localCtx.strokeStyle = localCtx.fillStyle;

    localCtx.beginPath();
    localCtx.moveTo(posX, posY);
    localCtx.lineTo(posX + Math.tan(angleLeft) * snowHeight, posY + snowHeight);
    localCtx.lineTo(posX + Math.tan(angleRidge) * snowHeight, posY + snowHeight);
    localCtx.fill();

    // snowtop right
    var red = Math.floor(snowColor * lightStrengthLeft)
    var green = Math.floor(snowColor * lightStrengthLeft)
    var blue = Math.floor(snowColor * lightStrengthLeft)
    var col_left = blue + (green << 8) + (red << 16)
    var col = '#' + (colLeft & 0xffffff).toString(16).padStart(6, 0)
    localCtx.fillStyle = col;
    localCtx.strokeStyle = localCtx.fillStyle;

    localCtx.beginPath();
    localCtx.moveTo(posX, posY);
    localCtx.lineTo(posX + Math.tan(angleRidge) * snowHeight, posY + snowHeight);
    localCtx.lineTo(posX + Math.tan(angleRight) * snowHeight, posY + snowHeight);
    localCtx.fill();
}

// sine based cloud, give large clouds through the sky (not that realistic)
function drawCloudsSine(localCtx, sunDir) {
    var randOrientationX = Math.random() * 10 - 5
    var randOrientationY = Math.random() * 10 - 5
    var totalOrientations = Math.sqrt(randOrientationX * randOrientationX + randOrientationY * randOrientationY)
    randOrientationX /= totalOrientations
    randOrientationY /= totalOrientations

    localCtx.beginPath();
    for (var x = 0; x < sizeCanvas[0]; x += 12) {
        for (var y = 0; y < 400; y += 12) {
            var probCloud = ((Math.sin((randOrientationX * x + randOrientationY * y) / 100)) * 0.5 + 0.5) * 2;
            if (Math.random() > probCloud) {
                var gradientX = randOrientationX / 100 * (Math.cos((randOrientationX * x + randOrientationY * y) / 100));
                var gradientY = randOrientationY / 100 * (Math.cos((randOrientationX * x + randOrientationY * y) / 100));
                var gradLength = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                var gradient = [gradientX / gradLength, gradientY / gradLength];

                // var cloudBrightness = 1;
                var cloudBrightness = 1;
                var dotProd = gradient[0] * sunDir[0] + gradient[1] * sunDir[1];

                if (dotProd < 0) {
                    cloudBrightness -= Math.random() * 0.4 * Math.abs(dotProd);
                }


                // cloudBrightness = (gradient[0]*sunDir[0]+gradient[1]*sunDir[1])/2+0.5;
                var blue_tint = 0x10 * Math.random();

                localCtx.strokeStyle = "rgba(" + (0xFF * cloudBrightness) + "," + (0xFF * cloudBrightness) + "," + (0xFF * cloudBrightness) + "," + 0xff + ")"
                // localCtx.strokeStyle = "#FFFFFF"; // white
                localCtx.fillStyle = localCtx.strokeStyle; // white
                localCtx.arc(x, y, 12, 0, 2 * Math.PI);
            }
        }
    }
    localCtx.fill();
}

function drawClouds(localCtx, sunDir, scale) {
    var probArray = improvedPerlinNoiseRecursive(1600, 400, 600 * scale, 3);
    // var probArray = improvedPerlinNoise(1600, 400, 100);

    for (var x = 0; x < sizeCanvas[0]; x += 8) {
        for (var y = 0; y < 400; y += 8) {
            if ((probArray[x][y] * 10 - 5) > Math.random()) {

                var gradientX = probArray[x - 1 >= 0 ? x - 1 : 0][y] - probArray[x + 1][y];
                var gradientY = probArray[x][y - 1 >= 0 ? y - 1 : 0] - probArray[x][y + 1];
                var grad_length = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                var gradient = [gradientX / grad_length, gradientY / grad_length];

                // var cloudBrightness = (probArray[x][y]);
                var cloudBrightness = (gradient[0] * sunDir[0] + gradient[1] * sunDir[1]) * 0.2 + 0.8;

                localCtx.strokeStyle = "rgba(" + (0xFF * cloudBrightness) + "," + (0xFF * cloudBrightness) + "," + (0xFF * cloudBrightness) + "," + 1.0 + ")"
                // localCtx.strokeStyle = "#FFFFFF"; //white
                localCtx.fillStyle = localCtx.strokeStyle;
                localCtx.beginPath();
                localCtx.arc(x, y, 10 * scale, 0, 2 * Math.PI);
                localCtx.fill();
            }
        }
    }
}

function drawGround(ctx) {
    var width = 1600;
    var height = 450;
    var startX = 0;
    var startY = 450;
    ctx.strokeStyle = "rgba(" + 0x20 + "," + 0xAF + "," + 0x30 + "," + 0xFF + ")"
    ctx.fillStyle = ctx.strokeStyle;

    // make the perlin noise higher than the actual texture as it will be squished
    var noise = improvedPerlinNoiseRecursive(1600, height * 4, 30, 2);
    var imagedata = ctx.createImageData(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var idx = (y * width + x) * 4;
            var ratioY = 1 - (y / height);
            //give it a fake perspective by using a sqrt, power is chosen as it seemed to look good
            var yNonlinear = Math.ceil(Math.pow(ratioY, 1.41) * height * 4);
            imagedata.data[idx] = 0x20 * (noise[x][yNonlinear] * 0.5 + 0.5); //red
            imagedata.data[idx + 1] = 0xAF * (noise[x][yNonlinear] * 0.5 + 0.5); //green
            imagedata.data[idx + 2] = 0x30 * (noise[x][yNonlinear] * 0.5 + 0.5); //blue
            imagedata.data[idx + 3] = 255; //alpha
        }
    }
    ctx.putImageData(imagedata, 0, startY);
}

// TODO: without killing performance
function distortImage(context, canvasSize) {
    var canvasDistort = document.createElement('canvas');
    canvasDistort.width = canvasSize[0];
    canvasDistort.height = canvasSize[1];
    var contextDistort = canvasDistort.getContext('2d');
    contextDistort.fillStyle = 'rgba(0,0,0,0)'; //maxe context transparent (create a layer)
    contextDistort.fillRect(0, 0, canvasSize[0], canvasSize[1]);

    for (var x = 0; x < canvasSize[0]; x++) {
        for (var y = 0; y < canvasSize[1]; y++) {
            var pixel = context.getImageData(x, y, 1, 1);
            contextDistort.fillStyle = "rgba(" + pixel.data[0] + "," + pixel.data[1] + "," + pixel.data[2] + "," + pixel.data[3] + ")"
            contextDistort.fillRect(x, y, 1, 1);
            Math.sin(x * y) * 2
        }
    }

    return canvasDistort
}

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

sizeCanvas = [1600, 900];
sunAngle = (Math.random() * 2 - 1) * (Math.PI / 3) - Math.PI / 2; // +- 60 degrees around up vector
sunDir = [Math.cos(sunAngle), Math.sin(sunAngle)];
// sunDir = [0, -1]; // sun at the top

// sky
ctx.strokeStyle = "#50A0FF"; // light blue
ctx.fillStyle = ctx.strokeStyle;
ctx.fillRect(0, 0, 1600, 450);

// grass
{
    var canvasLayer = document.createElement('canvas');
    canvasLayer.width = sizeCanvas[0];
    canvasLayer.height = sizeCanvas[1];
    var contextLayer = canvasLayer.getContext('2d');
    contextLayer.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
    contextLayer.fillRect(0, 0, sizeCanvas[0], sizeCanvas[1]);

    drawGround(contextLayer);

    ctx.drawImage(canvasLayer, 0, 0);
}

// clouds
var maxClouds = 1
for (var i = maxClouds - 1; i >= 0; i--) {
    var canvasLayer = document.createElement('canvas');
    canvasLayer.width = sizeCanvas[0];
    canvasLayer.height = sizeCanvas[1];
    var contextLayer = canvasLayer.getContext('2d');
    contextLayer.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
    contextLayer.fillRect(0, 0, sizeCanvas[0], sizeCanvas[1]);
    var scale = 1 / ((i + 1)); // make clouds smaller (and blurrier)
    drawClouds(contextLayer, sunDir, scale);
    ctx.filter = 'blur(' + (10) + 'px)';

    // due to the post drawing blur, some artifacts can appear on the borders of the image
    // avoid that by drawing the image out of bounds and widen it a little
    ctx.drawImage(canvasLayer, -10, -10, sizeCanvas[0] + 20, sizeCanvas[1]);
    ctx.filter = 'blur(' + (0) + 'px)';
}

var maxMountains = 100;
// draw far away mountains first
for (var i = 0; i < maxMountains; i++) {
    var canvasLayer = document.createElement('canvas');
    canvasLayer.width = sizeCanvas[0];
    canvasLayer.height = sizeCanvas[1];
    var contextLayer = canvasLayer.getContext('2d');
    contextLayer.fillStyle = 'rgba(0,0,0,0)'; //maxe context transparent (create a layer)
    contextLayer.fillRect(0, 0, sizeCanvas[0], sizeCanvas[1]);

    var farthest = 1 - (i / maxMountains); // how far away a moutain is
    var posX = 1600 * Math.random();

    //angle of mountains is narrower the farther away it is
    var maxAngle = -3.1415 / 2.2 + farthest * 3.1415 / 4.8
    var ridgeRandom = Math.random();
    var ridgeAngle = -maxAngle * (1 - ridgeRandom) + maxAngle * ridgeRandom

    //fake perspective, draw more mountains far away than near
    //if farthness is [0, 1] then pow(farthness, 1/8) will have more values >0.75 than <0.75
    var posY = 700 - 400 * Math.pow(farthest, 1 / 8);
    //draw mountain in a layer
    drawMountain(posX, posY, maxAngle, -maxAngle, ridgeAngle, (farthest + 0.75) * 100, (1 + 0.75) * 100, sunDir, contextLayer);

    // var canvas_layer_distorted = distort_image(context_layer, sizeCanvas)

    // ctx.filter = 'blur('+(farthest)+'px)'; // give a depth of field (not that great)
    ctx.drawImage(canvasLayer, 0, 0);
    // ctx.filter = 'blur('+(0)+'px)';
}

// draw all the trees in a single context, not that great
// var canvasLayer = document.createElement('canvas');
// canvasLayer.width = sizeCanvas[0];
// canvasLayer.height = sizeCanvas[1];
// var contextLayer = canvasLayer.getContext('2d');
// contextLayer.fillStyle = 'rgba(0,0,0,0)'; //maxe context transparent (create a layer)
// contextLayer.fillRect(0,0,sizeCanvas[0], sizeCanvas[1]);

// var canvasLayerTreeShadow = document.createElement('canvas');
// canvasLayerTreeShadow.width = sizeCanvas[0];
// canvasLayerTreeShadow.height = sizeCanvas[1];
// var contextLayerTreeShadow = canvasLayerTreeShadow.getContext('2d');
// contextLayerTreeShadow.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
// contextLayerTreeShadow.fillRect(0,0,sizeCanvas[0], sizeCanvas[1]);

var maxTrees = 100;
for (var i = 0; i < maxTrees; i++) {

    var canvasLayer = document.createElement('canvas');
    canvasLayer.width = sizeCanvas[0];
    canvasLayer.height = sizeCanvas[1];
    var contextLayer = canvasLayer.getContext('2d');
    contextLayer.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
    contextLayer.fillRect(0, 0, sizeCanvas[0], sizeCanvas[1]);

    var farthest = 1 - (i / maxTrees);
    var posX = 1600 * Math.random();
    var posY = 900 - 180 * Math.pow(farthest, 1 / 2) * 2;
    var treeSize = (1 - farthest) * 60 + 20;
    drawTree(posX, posY, 3.1415, 0, 4, treeSize, sunDir, contextLayer);

    ctx.drawImage(canvasLayer, 0, 0);

    // draw tree shadow on different layer (should it be before the tree?)
    var canvasLayer = document.createElement('canvas');
    canvasLayer.width = sizeCanvas[0];
    canvasLayer.height = sizeCanvas[1];
    var contextLayer = canvasLayer.getContext('2d');
    contextLayer.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
    contextLayer.fillRect(0, 0, sizeCanvas[0], sizeCanvas[1]);

    drawTreeShadow(posX, posY, treeSize, sunDir, contextLayer);

    ctx.drawImage(canvasLayer, 0, 0);
}

// ctx.drawImage(canvasLayer, 0, 0);
// ctx.drawImage(canvasLayerTreeShadow, 0, 0);

// TODO: Lake
{
    var canvasLayer = document.createElement('canvas');
    canvasLayer.width = sizeCanvas[0];
    canvasLayer.height = sizeCanvas[1];
    var contextLayer = canvasLayer.getContext('2d');
    contextLayer.fillStyle = 'rgba(0,0,0,0)'; // make context transparent (create a layer)
    contextLayer.fillRect(0, 0, sizeCanvas[0], sizeCanvas[1]);

    var width = 100
    var height = 25
    //drawLake(810, 800, width, height, contextLayer, ctx);

    ctx.drawImage(canvasLayer, 0, 0);
}