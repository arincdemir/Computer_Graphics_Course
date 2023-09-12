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
    var canvas = document.getElementById("gl-canvas");
    var clearButton = document.getElementById("clear-button");
    var pointButton = document.getElementById("point-button");
    var triangeButton = document.getElementById("triangle-button");
    var circleButton = document.getElementById("circle-button");
    var clearColorSelector = document.getElementById("clear-color");
    var drawColorSelector = document.getElementById("draw-color");

    var gl = WebGLUtils.setupWebGL(canvas);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    var maxVerts = 10000;
    var index = 0;
    var numPoints = 0;
    var drawMode = 0; // 0 point, 1 triangle, 2 sphere
    var pointSize = 0.02;
    var circleSides = 20
    var prevPoints = []
    var prevPointsColors = [];

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

    function drawPoint(x, y) {
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

    function drawCircle(x, y) {

    }

    canvas.addEventListener("click", function (event) {
        var x = (event.clientX - canvas.width / 2) / (canvas.width / 2);
        var y = 1 - (event.clientY) / (canvas.width / 2);
        switch (drawMode) {
            case 0:
                drawPoint(x, y);
                break;
            case 1:
                drawTriangle(x, y);
            default:
                break;
        }

    })

    clearButton.addEventListener("click", function (event) {
        gl.bufferData(gl.ARRAY_BUFFER,  maxVerts * (sizeof["vec2"] + sizeof["vec4"]), gl.STATIC_DRAW);
        index = 0;
        numPoints = 0;
        var selectedColor = colors[clearColorSelector.selectedIndex];
        gl.clearColor(selectedColor[0], selectedColor[1], selectedColor[2], selectedColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
    })
    
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxVerts * (sizeof["vec2"] + sizeof["vec4"]), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, maxVerts * sizeof["vec2"]);
    gl.enableVertexAttribArray(vColor);
    
    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, maxVerts);
    }

    
    function update(){
        render();
        requestAnimationFrame(update);
    }

    update();
}