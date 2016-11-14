// LUT to match DB structures with Allen Brain Atlas structures
var structureLUT = new Array();
structureLUT[4133]='A1C';
structureLUT[4697]='CBC';
structureLUT[4181]='V1C';
structureLUT[4010]='M1C';
structureLUT[4071]='M1C';
structureLUT[4085]='S1C';
structureLUT[4125]='S1C';
// TODO: complete liste

// Initialization of the brain selector
function initBrainSelect() {
	colorHover = "blue";
	colorOut = "lightgrey";
	colorSelect = "green";

	svgDoc = $("#svgObj")[0].contentDocument;
	svgStructs = svgDoc.getElementsByClassName("svg_structure");  // DO NOT USE JQuery for that -> http://benfrain.com/selecting-svg-inside-tags-with-javascript/

	selected = null;
	clearSelect();

	for (var i = 0; i < svgStructs.length; i++) {
		svgStructs[i].addEventListener('click', select, false);
		svgStructs[i].addEventListener("mouseover", hover, false);
		svgStructs[i].addEventListener("mouseout", out, false);
	}
};

// Select a structure
function select(event) {
	if (selected) {
		for (var i = 0; i < svgStructs.length; i++) {
			if(svgStructs[i].getAttribute('structure_id') == selected.attr('structure_id'))
				{
				svgStructs[i].style.fill = colorOut
				}
		}
	}
	selected = $(event.currentTarget);
	for (var i = 0; i < svgStructs.length; i++) {
		if(svgStructs[i].getAttribute('structure_id') == selected.attr('structure_id'))
			{
			svgStructs[i].style.fill = colorSelect;
			}
	}
	//alert("id = " + $(event.currentTarget).attr('structure_id'));
	$("#editbox_search_structure_id").val(structureLUT[$(event.currentTarget).attr('structure_id')]);
};

// Clear selections
function clearSelect() {
	for (var i = 0; i < svgStructs.length; i++) {
		svgStructs[i].style.fill = colorOut;
	}
};

// Mouse over a structure
function hover(event) {
	var current = $(event.currentTarget);
	if (current != selected) {
		current.css("fill", colorHover);
	}
};

// Mouse out of a structure
function out(event) {
	var current = $(event.currentTarget);
	if (!selected
			|| current.attr('structure_id') != selected.attr('structure_id')) {
		current.css("fill", colorOut);
	} else {
		current.css("fill", colorSelect);
	}
};
