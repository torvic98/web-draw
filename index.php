<!--
 @brief Web-Draw. CSS code.
 @author Victor M. Batlle <victor.martinez.batlle@gmail.com>
 @copyright GPL v3
-->
<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
		<meta content="Draw 2.0" name="title">
		<title>Draw 2.0</title>

		<link rel="stylesheet" type="text/css" href="main.css" />
		
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	</head>
	<body>
		<div id="content">
			<div id="sketch">
				<canvas id="canvas"></canvas>
			</div>
			<div id="controls_wrapper">
				<div id="controls">
					<div class="button" id="undo"><i class="material-icons">undo</i></div class="button">
					<div class="button" id="redo"><i class="material-icons">redo</i></div class="button">
					<input type="color" id="picker" value="#000000">
					<div class="button" id="brush"><i class="material-icons">brush</i></div class="button">
					<div class="button" id="sizer"><canvas id="preview" class="material-icons"></canvas></div class="button">
					<div class="button" id="colorize"><i class="material-icons">colorize</i></div class="button">
					<div class="button" id="fill"><i class="material-icons">format_color_fill</i></div class="button">
					<a id="download" download="image.png"><div class="button" id="save"><i class="material-icons">save</i></div class="button"></a>
					<div class="button" id="delete"><i class="material-icons">delete</i></div class="button">
				</div>
			</div>
		</div>
		<script src="jquery.js"></script>
	</body>
</html>