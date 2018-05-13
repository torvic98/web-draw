/**
 * @brief Web-Draw. JavaScript code.
 * @author Victor M. Batlle <victor.martinez.batlle@gmail.com>
 * @copyright GPL v3
 * @details Handles mouse events (click, up, down, move) over the
 *          elements of HTML code.
 */
context = document.getElementById('canvas').getContext("2d");

var mouseDown = false;
var current_draw = null;
var sketch = new Array();
var undone = new Array();
var BRUSH_MIN = 8;
var BRUSH_MAX = 32;
var BRUSH_STEPS = 3;
var brush_size = BRUSH_MIN;
var mode;

function rgb2hex(rgb){
	return "#" + rgb[0].toString(16).padStart(2,"0")
			   + rgb[1].toString(16).padStart(2,"0") 
			   + rgb[2].toString(16).padStart(2,"0");
}

function hex2rgb(hex) {
    var parse = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parse ? [
        parseInt(parse[1], 16),
        parseInt(parse[2], 16),
        parseInt(parse[3], 16),
        255
    ] : null;
}

function setCanvas () {
	context.canvas.width  = context.canvas.offsetWidth;
	context.canvas.height = context.canvas.offsetHeight;
	redraw(sketch);
}

function clearCanvas () {
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.fillStyle = 'white';
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
}

function getStyle () {
	var color = $("#picker").val();
	var size = $("#sizer").val();
	return {color:color,size:brush_size};
}

function setStyle (style) {
	context.lineJoin = "round";
	context.strokeStyle = style['color'];
	context.lineWidth = style['size'];
}

function draw (path,style) {
	
	setStyle(style);

	context.beginPath();
	context.moveTo(path[0]['x']-1, path[0]['y']);
	path.forEach(function(point){
		context.lineTo(point['x'], point['y']);
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(point['x'], point['y']);
	});
	context.closePath();
}

function redraw(sketch) {
	clearCanvas();
	sketch.forEach(function(action){
		if ( action['type'] === "brush" ) {
			draw(action.data['path'], action.data['style']);
		} else if ( action['type'] === "fill" ) {
			fill(action.data['mouse'], action.data['color']);
		}
	});
}

function newStroke (x,y) {
	undone = new Array();
	current_draw = new Array();

	// START DRAW
	setStyle(getStyle());

	context.beginPath();
	context.moveTo(x-1, y);
	// END DRAW
	addPoint(x,y);
}

function addPoint (x,y) {
	style=getStyle();
	current_draw.push({x:x,y:y});
	// START DRAW
	context.lineTo(x, y);
	context.closePath();
	context.stroke();
	context.beginPath();
	context.moveTo(x, y);
	// END DRAW
}

function saveBrush () {
	if (current_draw !== null) {
		var data = {path:current_draw,style:getStyle()};
		sketch.push({type:"brush", data:data});
		current_draw = null;
		// START DRAW
		context.closePath();
		// END DRAW
	}
}

function clear () {
	mouseDown = false;
	current_draw = null;
	sketch = new Array();
	undone = new Array();
	clearCanvas();
}

function undo () {
	if (sketch.length > 0) {
		undone.push(sketch.pop());
		redraw(sketch);
	}
}

function redo () {
	if (undone.length > 0) {
		sketch.push(undone.pop());
		redraw(sketch);
	}
}

function getIndex (x, y, width, size) {
	return (y * width + x) * size;
}

function checkColor (data, i, color) {
	return data[ i ] == color[0] &&
		   data[i+1] == color[1] &&
		   data[i+2] == color[2];
		//   data[i+3] == color[3];
}

function setColor (data, i, color) {
	data[ i ] = color[0];
	data[i+1] = color[1];
	data[i+2] = color[2];
}

var count = 0;

function replace (data, x, y, width, height, color, newColor) {

	if ( color[0] == newColor[0] &&
		 color[1] == newColor[1] &&
		 color[2] == newColor[2] ) {
		return;
	}

	var newPos, 
		x,
		y, 
		index, 
		reachLeft, 
		reachRight, 
		stack = [[x, y]];

	while (stack.length) {
		[x,y] = stack.pop();

		index = ( y * width + x ) * 4;

		while ( y >= 0 && checkColor(data, index, color) ) {
			y--;
			index -= width * 4;
		}
		setColor(data, index, newColor);
		index += width * 4;
 		++y;

		reachLeft = false;
		reachRight = false;

		while ( y <= height - 1 && checkColor(data, index, color) ) {
			y++;
			setColor(data, index, newColor);

			if ( x > 0 ) {
				if( checkColor(data, index - 4, color) ) {
					if( !reachLeft ){
						stack.push( [x - 1, y] );
						reachLeft = true;
					}
				} else {
					setColor(data, index - 4, newColor);
					reachLeft = false;
				}
			}

			if ( x < width - 1 ) {
				if ( checkColor(data, index + 4, color) ) {
					if ( !reachRight ) {
						stack.push( [x + 1, y] );
						reachRight = true;
					}
				} else {
					setColor(data, index + 4, newColor);
					reachRight = false;
				}
			}

			index += width * 4;
		}
		setColor(data, index, newColor);
	}
}

function fill (mouse,rgb) {
	var x = mouse.pageX - $("canvas").offset().left;
	var y =  mouse.pageY - $("canvas").offset().top;
	var alfa = context.getImageData(x, y, 1, 1).data;
	var data = context.getImageData(0, 0, context.canvas.offsetWidth, context.canvas.offsetHeight)
	var raw = data.data;
	replace (raw, x, y, context.canvas.offsetWidth, context.canvas.offsetHeight, alfa, rgb);
	context.putImageData(data, 0, 0);
}

function saveFill (mouse, rgb) {
	undone = new Array();
	var data = {mouse:mouse,color:rgb};
	sketch.push({type:"fill", data:data});
}

$(window).resize(setCanvas);
setCanvas();


$('#canvas').mousedown(function(e){
	if (mode == "brush"){
		newStroke (e.pageX - $(this).offset().left, e.pageY - $(this).offset().top)
		mouseDown = true;
	}
});

$('#canvas').mousemove(function(e){
	if(mouseDown && mode == "brush"){
		addPoint (e.pageX - $(this).offset().left, e.pageY - $(this).offset().top);
	}
});

$('#canvas').mouseup(function(e){
	if (mode == "brush"){
		mouseDown = false;
		saveBrush();
	}
});

$('#canvas').mouseleave(function(e){
	if (mode == "brush"){
		mouseDown = false;
		saveBrush();
	}
});

// START MOBILE SUPPORT
context.canvas.addEventListener("touchstart", function(e){
	if (mode == "brush"){
		newStroke (e.changedTouches ? e.changedTouches[0].pageX : e.pageX - $(this).offset().left,
				 e.changedTouches ? e.changedTouches[0].pageY : e.pageY - $(this).offset().top);
		mouseDown = true;
		e.preventDefault();
	}
}, false);

context.canvas.addEventListener("touchmove", function(e){
	if(mouseDown && mode == "brush"){
		addPoint (e.changedTouches ? e.changedTouches[0].pageX : e.pageX - $(this).offset().left,
				  e.changedTouches ? e.changedTouches[0].pageY : e.pageY - $(this).offset().top);
	}
	e.preventDefault();
}, false);

context.canvas.addEventListener("touchend", function(e){
	if (mode == "brush"){
		mouseDown = false;
		saveBrush();
		e.preventDefault();	
	}
}, false);

context.canvas.addEventListener("touchcancel", function(e){
	if (mode == "brush"){
		mouseDown = false;
		current_draw = null;
		e.preventDefault();
	}
}, false);

$("#undo").click(function(e){
	console.log(undone);
	console.log(sketch);
	undo();
});

$("#redo").click(function(e){
	redo();
});

function switchBrush (){
	if (mode == "brush") {
		$("#brush").removeClass('active');
		$("#sizer").addClass('none');
	} else {
		$("#brush").addClass('active');
		$("#sizer").removeClass('none');
		$("canvas").removeClass('cross');
	}
}

function switchDropper (){
	if (mode == "dropper") {
		$("#colorize").removeClass('active');
		$("#canvas").removeClass('cross');
	} else {
		$("#colorize").addClass('active');
		$("canvas").addClass('cross');
	}
}

$("#colorize").click(function(e){
	setMode("dropper");
});

function switchFill (){
	if (mode == "fill") {
		$("#fill").removeClass('active');
		$("#canvas").removeClass('cross');
	} else {
		$("#fill").addClass('active');
		$("canvas").addClass('cross');
	}
}

function switchMode (mode) {
	switch (mode) {
		case "brush":
			switchBrush();
			break;
		case "dropper":
			switchDropper();
			break;
		case "fill":
			switchFill();
			break;
	}
}

function setMode (newMode) {
	if (newMode != mode) {
		switchMode(mode);
		switchMode(newMode);
		mode = newMode;
	}
}

$("#fill").click(function(e){
	setMode("fill");
});

$("#canvas").click(function(e){
	if (mode == "dropper"){
		var rgb = context.getImageData(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, 1, 1).data;
		$("#picker").val(rgb2hex(rgb));
	} else if (mode == "fill") {
		var rgb = hex2rgb(getStyle()['color']);
		fill(e, rgb);
		saveFill(e, rgb);
	}
});

$("#brush").click(function(e){
	setMode("brush");
});

function refreshBrushPreview () {
	brush_context = $("#sizer canvas")[0].getContext('2d');
	brush_context.canvas.width  = brush_context.canvas.offsetWidth;
	brush_context.canvas.height = brush_context.canvas.offsetHeight;
	brush_context.lineJoin = "round";
	brush_context.strokeStyle = "#000000";
	brush_context.lineWidth = brush_size;

	brush_context.clearRect(0, 0, brush_context.canvas.width, brush_context.canvas.height);

	x = brush_context.canvas.offsetHeight / 2;
	y = brush_context.canvas.offsetWidth / 2;

	brush_context.beginPath();
	brush_context.moveTo(x-1, y);
	brush_context.lineTo(x, y);
	brush_context.closePath();
	brush_context.stroke();
}

setMode("brush");
refreshBrushPreview();

$("#sizer").click(function(e) {
	stepSize = ((BRUSH_MAX - BRUSH_MIN) / BRUSH_STEPS);
	step = (brush_size - BRUSH_MIN) / stepSize;
	brush_size = ((step + 1) % BRUSH_STEPS) * stepSize + BRUSH_MIN;
	refreshBrushPreview();
});

$("#save").click(function(e){
	$("#download")[0].setAttribute("href", 
		$("canvas")[0].toDataURL("image/png").replace("image/png", "image/octet-stream")
	);
	d = new Date()
	name = 	String(d.getFullYear())    +
			String(d.getMonth() + 1)   + 
			String(d.getDate())        + 
			'_'                        + 
			String(d.getHours())       + 
			String(d.getMinutes())     +
			String(d.getSeconds())     +
			'_'                        +
			String(d.getMilliseconds());

	$("#download")[0].setAttribute("download", name+".png");
});

$("#delete").click(function(e){
	if (confirm("Are you sure you want to clear the whole canvas? Can't be undone.")) {
		clear();
	}
});