// Colormap for the results
var colormap = [ "#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7",
		"#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061" ];

/*
 * Other colormaps :
 * 
 * RdBu11 ->
 * ["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]
 * RdYlBu11 ->
 * ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"]
 * RdYlGn11 ->
 * ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]
 * YlOrRd9 ->
 * ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]
 * YlOrBr9 ->
 * ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
 * Reds9 ->
 * ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
 * Oranges9 ->
 * ["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"]
 * 
 * For more : https://github.com/mbostock/d3/tree/master/lib/colorbrewer
 */

// Translate expression value to color
function expressionToColor(expVal, minVal, maxVal) {
	var n = colormap.length - 1;
	var offset = (maxVal - minVal) / n;
	var i = Math.floor((expVal - minVal) / offset);
	color = colormap[n - i];

	return color;
}

// Draw a box to show the timeframe over the results
function addBox(divId) {
	var handlesSlider = $('#timeFrameSlider')[0];

	var h1 = handlesSlider.noUiSlider.get()[0] - 1;
	var h2 = handlesSlider.noUiSlider.get()[1];

	var svgContainer = d3.select(divId).selectAll("svg").append("g");
	var containerWidth = parseFloat(d3.select(divId).selectAll("svg").style(
			'width'));

	var xOffset = containerWidth / 198.75;
	var sizeFactor = containerWidth / 33.5;
	var boxX1 = (h1 * sizeFactor) - xOffset;
	var width = (h2 - h1) * sizeFactor - xOffset;
	var xInit = containerWidth / 6.0;

	svgContainer.append("rect").attr("x", xInit + (boxX1)).attr("y", 8).attr(
			"width", width).attr("height", 21).attr("stroke", "black").attr(
			"fill", "transparent").attr("rx", 6).attr("ry", 6);
}

// Draw the expression squares for a gene. You can draw the age labels with
// enblLab = true.
function addGeneSquares(divId, gene, data, enblLab) {
	var svgContainer = d3.select(divId).append("svg").attr("width", "90%")
			.attr("height", 30);

	var containerWidth = parseFloat(svgContainer.style('width'));
	var nbDonors = data.length;
	var minExprValue = d3.min(data, function(d) {
		return d.expression;
	});
	var maxExprValue = d3.max(data, function(d) {
		return d.expression;
	});

	// Settings (size, position, color, ...) -> Dynamic width, fixed height
	var width = containerWidth / (2 * nbDonors + 5);
	var height = width;
	var xInit = containerWidth / 6.0;
	var yInit = 10;
	var xGap = 1.7 * width;
	var labelsAdjustment = width / 4;
	var strokeColor = d3.rgb(0, 0, 0);
	var expression;
	var color;
	var x;
	var yGeneLabelOffset = 12;
	var labelsYadjustment = 12;

	// We adjust size and position if we draw the labels
	if (enblLab) {
		svgContainer.attr("height", 100);
		yInit = 78;
	}

	for (i = 0; i < nbDonors; i++) {

		ageLabel = data[i].age_label;
		expression = data[i].expression;

		x = xInit + i * xGap;

		// If no expression level found
		if (!expression && expression !== 0.0) {
			// ONLY FOR THE DEMO
			color = '#b2182b';
			svgContainer.append("rect").attr("x", x).attr("y", yInit).attr(
					"width", width).attr("height", height).attr("fill", color)
					.attr("stroke", strokeColor).attr("title", ageLabel);

			// Draw empty square
			// color = '#f6f6f6'; // UI Background color is not pure white
			// svgContainer.append("rect").attr("x", x).attr("y", yInit).attr(
			// "width", width).attr("height", height).attr("fill",
			// color).attr("stroke", strokeColor);

			// FOR THE DEMO, WE DO NOT PRINT CROSSES
			// Draw cross
			// svgContainer.append("line").style("stroke", "black").attr("x1",
			// x).attr("y1", yInit).attr("x2", x+width).attr("y2",
			// yInit+height);
			// svgContainer.append("line").style("stroke", "black").attr("x1",
			// x).attr("y1", yInit+height).attr("x2", x+width).attr("y2",
			// yInit);
		} else // Standard case
		{
			// Draw square
			color = expressionToColor(expression, minExprValue, maxExprValue);
			svgContainer.append("rect").attr("x", x).attr("y", yInit).attr(
					"width", width).attr("height", height).attr("fill", color)
					.attr("stroke", strokeColor).attr("title", ageLabel);
		}

		if (enblLab) {
			// Add age label
			svgContainer.append("text").attr("x", x - labelsYadjustment).attr(
					"y", yInit).attr(
					"transform",
					"rotate(-90 " + (x - width / 2) + ","
							+ (yInit - height - labelsAdjustment) + ")").attr(
					"font-size", width * 0.6).text(ageLabel);
		}
	}

	// Add gene label
	svgContainer.append("text").attr("x", 0)
			.attr("y", yInit + yGeneLabelOffset).attr("font-size", width * 0.8)
			.text(gene);

	// Margin-top adjustment for the LDA button position
	var mt = 8;
	if (enblLab) {
		mt = 78;
	}
	/*$(divId).append('<button id="' + gene + '" style="margin-top:' + mt	+ 'px" title="Alzheimer subjects classification" class="checkButton"></button>');
	$('#' + gene).on('click', function(e) {
						var gene = e.target.id;
						$('.descrLDAText').text("LDA using " + gene	+ " gene expression on 718 ADNI subjects with Alzheimer (AD), Mild cognitive impairment (MCI) or healthy (NL) diagnose.");

						// Loading logo
						$('.modalImage').attr('src', "images/loader.gif");

						// Show LDA graph (simulate load time)
						if (gene == 'ENSG00000101337'
								|| gene == 'ENSG00000000001') {
							setTimeout(
									function() {
										$('.modalImage').attr('src',
												"images/LDA1.png");
									}, 2000);

						} else if (gene == 'ENSG00000114650') {
							setTimeout(
									function() {
										$('.modalImage').attr('src',
												"images/LDA2.png");
									}, 2000);
						} else if (gene == 'ENSG00000000000') {
							setTimeout(
									function() {
										$('.modalImage').attr('src',
												"images/LDA3.png");
									}, 2000);
						} else {
							setTimeout(
									function() {
										$('.modalImage').attr('src',
												"images/LDA4.png");
									}, 2000);
						}

						location.href = '#openModal';  // Open modal window for LDA
					});*/
}

// Generate expression UI
function geneExpressionUI(baseURL, gene, structure) {

	var dataURL = baseURL + "gene=" + gene + "&structure=" + structure;
	var divId = "#genExp";

	// d3.json("mockResources/geneExpression.json", function(error, data) {
	d3.json(dataURL, function(error, data) {
		dataGenExp = data;
		if (error)
			return console.warn(error);

		d3.select(divId).selectAll("svg").remove();
		//d3.select(divId).selectAll("button").remove();
		addGeneSquares(divId, gene, data, true);

	});
}

// Generate correlAll UI
function correlAllUI(baseURL, gene, structure) {
	var dataURL = baseURL + "gene=" + gene + "&structure=" + structure;
	var divId = "#genExp";

	// d3.json("mockResources/correlation.json", function(error, data) {
	d3.json(dataURL, function(error, data) {
		dataCorrelAll = data;
		var divId = "#correlAll";
		var nbGenes = data.length;
		d3.select(divId).selectAll("svg").remove();
		//d3.select(divId).selectAll("button").remove();
		for (var i = 0; i < nbGenes; i++) {
			gene = d3.keys(data[i]);
			addGeneSquares(divId, gene, data[i][gene]);
		}
	});

	// ONLY FOR THE DEMO
	d3.json(dataURL, function(error, data) {
		dataCorrelAll = data;
		var divId = "#correlAll";
		var nbGenes = data.length;
		for (var i = 0; i < nbGenes; i++) {
			gene = d3.keys(data[i]);
			addGeneSquares(divId, "ENSG00000114652", data[i][gene]);
		}
	});
}

// Generate correlAge UI
function correlAgeUI(baseURL, gene, structure, timeFrame) {
	var dataURL = baseURL + "gene=" + gene + "&structure=" + structure
			+ "&timeframe=[" + timeFrame + "]";
	var divId = "#correlTime";

	// d3.json("mockResources/correlationTime.json", function(error, data) {
	d3.json(dataURL, function(error, data) {
		dataCorrelTime = data;
		var nbGenes = data.length;
		d3.select(divId).selectAll("svg").remove();
		//d3.select(divId).selectAll("button").remove();

		for (var i = 0; i < nbGenes; i++) {
			gene = d3.keys(data[i]);
			addGeneSquares(divId, gene, data[i][gene]);
		}
		addBox(divId);
	});
}

// Update UI to show results (with auto-scroll)
function updateUI() {
	var gene = $("#editbox_search_gene_id").val();
	var structure = $("#editbox_search_structure_id").val();
	var timeFrame = [ $("#timeStart").text(), $("#timeStop").text() ];

	if (!(gene == '' || structure == '')) {

		currentGene = gene;

		var baseURLGeneExpr = "http://hbps4.chuv.ch:8080/services-gensign/gene_expression/query?";
		var baseURLCorrelAll = "http://hbps4.chuv.ch:8080/services-gensign/correlation_all/query?";
		var baseURLCorrelAge = "http://hbps4.chuv.ch:8080/services-gensign/correlation_timeframe/query?";

		$('.outputDiv').show();
		$('html,body').animate({
			scrollTop : $(".outputDiv").offset().top
		}, 'slow');

		geneExpressionUI(baseURLGeneExpr, gene, structure);
		correlAllUI(baseURLCorrelAll, gene, structure);
		correlAgeUI(baseURLCorrelAge, gene, structure, timeFrame);
	}
}

// Resize UI for a responsive design
function resizeUI() {
	rtime = new Date();
	if (timeout === false) {
		timeout = true;
		setTimeout(resizeend, delta);
	}
}

// Called by resizeUI
function resizeend() {
	if (new Date() - rtime < delta) {
		setTimeout(resizeend, delta);
	} else {
		timeout = false;
		var newWidth = $(document).width();
		
		if (browserWidth != newWidth) {	
			browserWidth = newWidth;
			
			var svgDoc = document.getElementById("svgObj").contentDocument;
			
			var scale = browserWidth / 1760; // max size = 1760 pixels
			if (scale > 1) {
				scale = 1;
			}

			// Resize brain atals
			svgDoc.getElementById("brain_schematic_svg").setAttribute(
					"transform", "scale(" + scale + ")");  // DO NOT USE JQuery for that -> http://benfrain.com/selecting-svg-inside-tags-with-javascript/

			// Resize timeframe selector
			d3.select("#timeFrameSliderPips").selectAll("svg").remove();
			addTimeFrameSlider();

			// Resize gene expression results
			var divId = "#genExp";
			d3.select(divId).selectAll("svg").remove();
			addGeneSquares(divId, currentGene, dataGenExp, true);

			// Resize correlAll results
			divId = "#correlAll";
			var nbGenes = dataCorrelAll.length;
			d3.select(divId).selectAll("svg").remove();
			for (var i = 0; i < nbGenes; i++) {
				gene = d3.keys(dataCorrelAll[i]);
				addGeneSquares(divId, gene, dataCorrelAll[i][gene]);
			}

			// Resize correlTime results
			divId = "#correlTime";
			var nbGenes = dataCorrelTime.length;
			d3.select(divId).selectAll("svg").remove();
			for (var i = 0; i < nbGenes; i++) {
				gene = d3.keys(dataCorrelTime[i]);
				addGeneSquares(divId, gene, dataCorrelTime[i][gene]);
			}
			addBox(divId);
		}
	}
}
