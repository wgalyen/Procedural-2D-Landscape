var array = [];

function randomNoise(array, sizeX, sizeY, sizeSub) {
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
            array[i][j] = Math.random();
        }
    }
}

function bilinMix(x, y, a) {
    return (1 - a) * x + a * y;
}

// -3x^3+2x^2
function cubicMix(x, y, a) {
    var ia = (1.0 - a);
    var ret = (-2.0 * ia * ia * ia + 3.0 * ia * ia) * x + (-2.0 * a * a * a + 3.0 * a * a) * y;
    return ret;
}

// alternate form of cubic mix (6x^5-15x^4+10x^3)
function easeMix(x, y, a) {
    var ia = (1.0 - a);
    var ret = (6.0 * Math.pow(ia, 5) - 15.0 * Math.pow(ia, 4) + 10.0 * Math.pow(ia, 3)) * x + (6.0 * Math.pow(a, 5) - 15.0 * Math.pow(a, 4) + 10.0 * Math.pow(a, 3)) * y;
    return ret;
}

function interpNoise(sizeX, sizeY, sizeSub, mixFunction) {
    var coarseArray = [];
    var retArray = [];
    if (sizeSub === 0) // avoid div by 0
        sizeSub = 1;

    // dimensions for the coarse lattice containing points
    var subSizeX = Math.floor(sizeX / sizeSub);
    var subSizeY = Math.floor(sizeY / sizeSub);

    for (var i = 0; i < subSizeX + 2; i++) {
        coarseArray[i] = [];
        for (var j = 0; j < subSizeY + 2; j++) {
            coarseArray[i][j] = Math.random();
        }
    }

    for (var i = 0; i < sizeX; i++) {
        retArray[i] = [];
        for (var j = 0; j < sizeY; j++) {
            var latticeX = Math.floor(i / sizeSub);
            var latticeY = Math.floor(j / sizeSub);
            var xRatio = (i % sizeSub) / sizeSub;
            var yRatio = (j % sizeSub) / sizeSub;
            var topVal = mixFunction(coarseArray[latticeX][latticeY], coarseArray[latticeX + 1][latticeY], xRatio);
            var bottomVal = mixFunction(coarseArray[latticeX][latticeY + 1], coarseArray[latticeX + 1][latticeY + 1], xRatio);
            retArray[i][j] = mixFunction(topVal, bottomVal, yRatio);
        }
    }
    return retArray;
}

function dot(x, y) {
    return x[0] * y[0] + x[1] * y[1];
}

function perlinNoise(sizeX, sizeY, sizeSub) {
    var gradientsLattice = [];
    var subSizeX = Math.floor(sizeX / sizeSub);
    var subSizeY = Math.floor(sizeY / sizeSub);

    for (var i = 0; i < subSizeX + 2; i++) {
        gradientsLattice[i] = [];
        for (var j = 0; j < subSizeY + 2; j++) {
            var gradientVec = [Math.random() * 2 - 1.0, Math.random() * 2 - 1.0];
            var gradVecSize = Math.sqrt(gradientVec[0] * gradientVec[0] + gradientVec[1] * gradientVec[1]);
            gradientsLattice[i][j] = [gradientVec[0] / gradVecSize, gradientVec[1] / gradVecSize]; // normalize
        }
    }

    return gradientNoise(sizeX, sizeY, sizeSub, gradientsLattice);
}

function improvedPerlinNoise(sizeX, sizeY, sizeSub) {
    var gradientsLattice = [];
    var subSizeX = Math.floor(sizeX / sizeSub);
    var subSizeY = Math.floor(sizeY / sizeSub);

    for (var i = 0; i < subSizeX + 2; i++) {
        gradientsLattice[i] = [];
        for (var j = 0; j < subSizeY + 2; j++) {
            var gradientVec = [0, 0];
            var randVar = Math.floor(Math.random() * 3.9999);
            switch (randVar) {
                case 0:
                    gradientVec = [1, 0];
                    break;
                case 1:
                    gradientVec = [0, 1];
                    break;
                case 2:
                    gradientVec = [-1, 0];
                    break;
                case 3:
                    gradientVec = [0, -1];
                    break;
            }
            gradientsLattice[i][j] = gradientVec; // normalize
        }
    }

    return gradientNoise(sizeX, sizeY, sizeSub, gradientsLattice);
}

function improvedPerlinNoiseRecursive(sizeX, sizeY, sizeSub, numRecursions) {
    var arrayRet = [];

    for (var i = 0; i < numRecursions; i++) {
        arrayRet[i] = improvedPerlinNoise(sizeX, sizeY, Math.ceil(sizeSub / (i + 1)));
    }

    // var value = 0;
    // for (var i = 0; i < params.numRecursions; i++) {
    //     value += 1 / (i + 1) * (array[i][x][y] * 2 - 1);
    // }
    // value = value * 0.5 + 0.5;

    for (var x = 0; x < arrayRet[0].length; x++) {
        for (var y = 0; y < arrayRet[0][x].length; y++) {
            for (var i = 1; i < numRecursions; i++) {
                arrayRet[0][x][y] += 1 / (i + 1) * (arrayRet[i][x][y] * 2 - 1);
            }
            arrayRet[0][x][y] = arrayRet[0][x][y];
        }
    }

    return arrayRet[0];
}

function gradientNoise(sizeX, sizeY, sizeSub, gradientsLattice) {
    var array = [];

    for (var i = 0; i < sizeX; i++) {
        array[i] = []
        for (var j = 0; j < sizeY; j++) {
            var latticeX = Math.floor(i / sizeSub);
            var latticeY = Math.floor(j / sizeSub);
            var xRatio = (i % sizeSub) / sizeSub;
            var yRatio = (j % sizeSub) / sizeSub;
            var topLeft = dot([xRatio, yRatio], gradientsLattice[latticeX][latticeY]);
            var topRight = dot([-(1 - xRatio), yRatio], gradientsLattice[latticeX + 1][latticeY]);
            var botLeft = dot([xRatio, -(1 - yRatio)], gradientsLattice[latticeX][latticeY + 1]);
            var botRight = dot([-(1 - xRatio), -(1 - yRatio)], gradientsLattice[latticeX + 1][latticeY + 1]);
            var top = cubicMix(topLeft, topRight, xRatio);
            var bot = cubicMix(botLeft, botRight, xRatio);
            array[i][j] = cubicMix(top, bot, yRatio) * 0.5 + 0.5; // must be in [0, 1]
        }
    }

    return array;;
}