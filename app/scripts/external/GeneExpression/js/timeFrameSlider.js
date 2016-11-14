// Variable to check if the slider has been initialized yet
var isInit = false;

// Function that adds (or updates) the timeFrame slider
function addTimeFrameSlider() {
	// Initial handles position
	initStart = 11; // index
	initStop = 15; // index

	// Sliders values and labels
	var labels = [ '8 weeks', '9 weeks', '12 weeks', '13 weeks', '4 months',
			'17 weeks', '19 weeks', '21 weeks', '24 weeks', '25 weeks',
			'26 weeks', '10 months', '1 year', '2 years', '3 years', '4 years',
			'8 years', '13 years', '15 years', '18 years', '21 years',
			'23 years', '30 years', '36 years', '37 years', '40 years' ];
	var ages = [ 8, 9, 12, 13, 16, 17, 19, 21, 24, 25, 26, 40, 52, 104, 156,
			208, 416, 676, 780, 936, 1092, 1196, 1560, 1872, 1924, 2080 ];

	// Draw labels
	addPips(labels);

	// If the slider doesn't exist we create it
	if (!isInit) {
		isInit = true;

		var handlesSlider = $('#timeFrameSlider')[0];

		noUiSlider.create(handlesSlider, {
			start : [ initStart, initStop ],
			range : {
				'min' : [ 1 ],
				'max' : [ labels.length ],
			},
			step : 1,
			behaviour : 'tap-drag',
			connect : true
		});

		// Initial values
		$("#timeStart").text(ages[initStart - 1]);
		$("#timeStop").text(ages[initStop - 1]);

		// Add the change listener
		handlesSlider.noUiSlider.on('change', function(values, handle) {

			a1 = ages[Math.floor(values[0]) - 1];
			a2 = ages[Math.floor(values[1]) - 1];

			// Update values
			$("#timeStart").text(a1);
			$("#timeStop").text(a2);

		});
	}
};

// Add pips (labels) to the slider
function addPips(labels) {
	var svgContainer = d3.select('#timeFrameSliderPips').append("svg").attr(
			"width", "90%").attr("height", 100);

	var containerWidth = parseFloat(svgContainer.style('width'));
	var nbPips = labels.length;

	// Settings (size, position, color, ...) -> Dynamic width, fixed height
	var width = containerWidth / (2 * nbPips + 5);
	var height = width;
	var xInit = containerWidth / 6.0;
	var yInit = 78;
	var xGap = 1.7 * width;
	var labelsAdjustment = width / 4;
	var strokeColor = d3.rgb(0, 0, 0);
	var color = 'grey';
	var x;
	var yInitAdj = 21;
	var labelsYadjustment = 12;

	// Draw pips (squares and labels)
	for (i = 0; i < nbPips; i++) {
		x = xInit + i * xGap;

		svgContainer.append("rect").attr("x", x).attr("y", yInit).attr("width",
				width).attr("height", height).attr("fill", color);

		svgContainer.append("text").attr("x", x - labelsYadjustment).attr("y",
				yInit).attr(
				"transform",
				"rotate(-90 " + (x - width / 2) + ","
						+ (yInit - height - labelsAdjustment) + ")").attr(
				"font-size", width * 0.6).text(labels[i]);
	}
};

