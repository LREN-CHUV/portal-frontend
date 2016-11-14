// Variables to store current data
var currentGene;
var dataGenExp;
var dataCorrelAll;
var dataCorrelTime;

// Variables for browser resize management
var rtime;
var timeout = false;
var delta = 200;
var browserWidth;

window.onload = function() {
	
	// Initialize selectors
	initBrainSelect();
	addTimeFrameSlider();
	
	// Add listeners
	$("#searchButton").click(updateUI);
	$(window).resize(function(){ resizeUI(); });
	// ONLY FOR THE DEMO
	$("#correlAllButton").on('click', function() {
		$('.descrLDAText').text("LDA using genes correlated across all ages on 718 ADNI subjects with Alzheimer (AD), Mild cognitive impairment (MCI) or healthy (NL) diagnose.");
		// Loading logo
		$('.modalImage').attr('src', "images/loader.gif");
		setTimeout(function(){ $('.modalImage').attr('src', "images/LDA1.png"); }, 2000);
		location.href = '#openModal';  // Open modal window for LDA
	});

	$("#correlAgeButton").on('click', function() {
		$('.descrLDAText').text("LDA using genes correlated over a specific time frame on 718 ADNI subjects with Alzheimer (AD), Mild cognitive impairment (MCI) or healthy (NL) diagnose.");
		// Loading logo
		$('.modalImage').attr('src', "images/loader.gif");
		setTimeout(function(){ $('.modalImage').attr('src', "images/LDA2.png"); }, 2000);
		location.href = '#openModal';  // Open modal window for LDA
	});
	
	// Get initial browser width
	browserWidth = $(document).width();
	
};

