
// Define the colors
var black = vec4(0.0, 0.0, 0.0, 1.0)
var red = vec4(1.0, 0.0, 0.0, 1.0)
var yellow = vec4(1.0, 1.0, 0.0, 1.0)
var green = vec4(0.0, 1.0, 0.0, 1.0)
var cyan = vec4(0.0, 1.0, 1.0, 1.0)
var blue = vec4(0.0, 0.0, 1.0, 1.0)
var magenta = vec4(1.0, 0.0, 1.0, 1.0)
var white = vec4(1.0, 1.0, 1.0, 1.0)

colors = [black, red, yellow, green, cyan, blue, magenta, white]


window.onload = function init() {
    // Get the canvas and the buttons
    var canvas = document.getElementById("gl-canvas");
    var clearButton = document.getElementById("clear-button");
    var pointButton = document.getElementById("point-button");
    var triangeButton = document.getElementById("triangle-button");
    var circleButton = document.getElementById("circle-button");
    var bezierButton = document.getElementById("quadratic-bezier-button");
    var clearColorSelector = document.getElementById("clear-color");
    var drawColorSelector = document.getElementById("draw-color");

    // Setup the WebGL context and clear the canvas
    var gl = WebGLUtils.setupWebGL(canvas);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    // Define the variables that will be used later
    var maxVerts = 1000000;
    var index = 0;     // how many vertices have been drawn
    var drawMode = 0; // 0 point, 1 triangle, 2 sphere, 3 bezier
    var pointSize = 0.02; // size of the points drawn
    var bezierPointSize = 0.005; // size of the points drawn for the bezier curve
    var circleSides = 50 // number of sides of the circle
    var prevPoints = [] // list that holds the previously clicked points for the current shape
    var prevPointsColors = []; // list that holds the colors of the previously clicked points for the current shape


    // Add event listeners to the buttons
    pointButton.addEventListener("click", function(event) {
        drawMode = 0;
        prevPoints = [];
        prevPointsColors = [];
    })

    triangeButton.addEventListener("click", function(event) {
        drawMode = 1;
        prevPoints = [];
        prevPointsColors = [];
    })

    circleButton.addEventListener("click", function(event) {
        drawMode = 2;
        prevPoints = [];
        prevPointsColors = [];
    })

    bezierButton.addEventListener("click", function(event) {
        drawMode = 3;
        prevPoints = [];
        prevPointsColors = [];
    })

    // Function that draws a point
    // It places two triangles that form a small square
    // basically adding two triangles to the vertex buffer
    function drawPoint(x, y, pointSize) {
        var bottomLeft = vec2(x - pointSize, y - pointSize);
        var topLeft = vec2(x - pointSize, y + pointSize);
        var bottomRight = vec2(x + pointSize, y - pointSize);
        var topRight = vec2(x + pointSize, y + pointSize);
        var points = [topLeft, bottomLeft, bottomRight, bottomRight, topRight, topLeft];
        var currentColor = colors[drawColorSelector.selectedIndex];
        var pointColors = []
        for (let index = 0; index < 6; index++) {
            pointColors.push(currentColor);       
        }
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec2"], flatten(points));
        gl.bufferSubData(gl.ARRAY_BUFFER, maxVerts * sizeof["vec2"] + index * sizeof["vec4"], flatten(pointColors));
        index += 6;
    }

    // Function that draws a triangle
    // It places three points in the vertex buffer
    function drawTriangle(x, y) {
        var currentColor = colors[drawColorSelector.selectedIndex];
        prevPoints.push(vec2(x, y));
        prevPointsColors.push(currentColor);

        if (prevPoints.length == 3) {
            gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec2"], flatten(prevPoints));
            gl.bufferSubData(gl.ARRAY_BUFFER, maxVerts * sizeof["vec2"] + index * sizeof["vec4"], flatten(prevPointsColors));
            index += 3;
            prevPoints = [];
            prevPointsColors = [];
        }
    }


    // Function that draws a circle
    // It calculates the points of the circle using the center and the radius
    // and then places them in the vertex buffer
    function drawCircle(x, y) {
        prevPoints.push(vec2(x, y));
        var currentColor = colors[drawColorSelector.selectedIndex];
        prevPointsColors.push(currentColor);
        if (prevPoints.length == 2) {
            var points = [];
            var pointsColors = [];
            var center = prevPoints[1];
            var radius = length(subtract(center, prevPoints[0]));
            var centerColor = prevPointsColors[1];
            var sideColor = prevPointsColors[0];
            var angle = 0.0;
            var angleChange = 2 * Math.PI / circleSides;
            for (let i = 0; i < circleSides; i++) {
                points.push(center);
                pointsColors.push(centerColor);
                var curPointX = center[0] + Math.cos(angle) * radius;
                var curPointY = center[1] + Math.sin(angle) * radius;
                angle += angleChange;
                var nextPointX = center[0] + Math.cos(angle) * radius;
                var nextPointY = center[1] + Math.sin(angle) * radius;
                points.push(vec2(curPointX, curPointY));
                pointsColors.push(sideColor);
                points.push(vec2(nextPointX, nextPointY));
                pointsColors.push(sideColor);
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof["vec2"], flatten(points));
            gl.bufferSubData(gl.ARRAY_BUFFER, maxVerts * sizeof["vec2"] + index * sizeof["vec4"], flatten(pointsColors));
            index += 3 * circleSides;
            prevPoints = [];
            prevPointsColors = [];
        }
    }

    // Function that draws a quadratic bezier curve
    // It calculates the points of the curve using the three points and t
    // the function quadraticBezier is defined at the end of the file as a parametric function to calculate the points
    // we use the function drawPoint to draw the points of the curve
    // which creates the illusion of a curve
    // it draws a lot of points though, so it is not very efficient
    // doing it with lines would be more efficient
    function drawQuadraticBezier(x, y) {
        prevPoints.push(vec2(x, y));
        var currentColor = colors[drawColorSelector.selectedIndex];
        prevPointsColors.push(currentColor);
        if (prevPoints.length == 3) {
            var pointsColors = [];
            var p0 = prevPoints[0];
            var p1 = prevPoints[1];
            var p2 = prevPoints[2];
            var p = quadraticBezier(0.0, p0, p1, p2);
            for (let t = 0.0; t <= 1.0; t += 0.003) {
                var nextP = quadraticBezier(t, p0, p1, p2);
                drawPoint(nextP[0], nextP[1], bezierPointSize);
            }
            prevPoints = [];
            prevPointsColors = [];
        }
    }

    // Add event listener to the canvas
    // When the canvas is clicked, it gets the coordinates of the click
    // and calls the appropriate function to draw the shape
    canvas.addEventListener("click", function (event) {
        var x = (event.clientX - canvas.width / 2) / (canvas.width / 2);
        var y = 1 - (event.clientY) / (canvas.width / 2);
        switch (drawMode) {
            case 0:
                drawPoint(x, y, pointSize);
                break;
            case 1:
                drawTriangle(x, y);
                break;
            case 2:
                drawCircle(x, y);
                break;
            case 3:
                drawQuadraticBezier(x, y);
                break;
            default:
                break;
        }
        console.log(index);

    })

    // Add event listener to the clear button
    clearButton.addEventListener("click", function (event) {
        gl.bufferData(gl.ARRAY_BUFFER,  maxVerts * (sizeof["vec2"] + sizeof["vec4"]), gl.STATIC_DRAW);
        index = 0;
        var selectedColor = colors[clearColorSelector.selectedIndex];
        gl.clearColor(selectedColor[0], selectedColor[1], selectedColor[2], selectedColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
    })
    
    // Initialize the shaders and the vertex buffer
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create a buffer for the vertex positions and colors
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVerts * (sizeof["vec2"] + sizeof["vec4"]), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, maxVerts * sizeof["vec2"]);
    gl.enableVertexAttribArray(vColor);
    
    // Render the scene
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, maxVerts);
    }

    // Main loop that calls itself all the time
    function update(){
        render();
        requestAnimationFrame(update);
    }

    update();
}

// Function that calculates the points of a quadratic bezier curve
// It uses the formula p = (1-t)^2 * p0 + 2 * (1-t) * t * p1 + t^2 * p2
function quadraticBezier(t, p0, p1, p2) {
    var u = 1 - t;
    var uu = u * u;
    var tt = t * t;
    var p = add(scale(uu, p0), scale(2 * u * t, p1));
    p = add(p, scale(tt, p2));
    return p;
}