// CONSTANTS

GENETIC_COLOR = "rgb(255,255,128)";  // #FFFF80
BRAIN_ANATOMY_COLOR = "rgb(128,255,128)";  // #80FF80
BRAIN_METABOLISM_COLOR = "rgb(255,153,0)";  // #809900
AD_COLOR = "rgb(255,128,128)";  // #FF8080
CONTROL_COLOR = "rgb(0,102,255)";  // #0066FF
CSF_PROTEIN_COLOR = "rgb(0,204,204)";  // #00CCCC
BLOOD_PROTEIN_COLOR = "rgb(204,0,255)";  // #CC00FF


// MAIN PROCESS

var container = document.getElementById('network');

var data = null;

var parserOptions = {
  edges: {
    inheritColors: false
  },
  nodes: {
    fixed: true,
    parseColor: false
  }
}

var options = {
  "nodes": {
    "shape": "box",
    "font": {
      "color": "black"
    }
  },
  "edges": {
    "font": {
      "color": "white",
  	  "strokeWidth": 0
  	}
  },
  "interaction": {
    "hover": true
  },
  "physics": {
    "stabilization": {
      "enabled": false
    }
  }
}

$.getJSON("data/rules.json", function( gephiJSON ) {
	
	var parsed = vis.network.convertGephi(gephiJSON, parserOptions);

	data = {
	  nodes: parsed.nodes,
	  edges: parsed.edges
	};

	var network = new vis.Network(container, data, options);
	network.on("selectNode", handleSelectNode);
});


// FUNCTIONS

handleSelectNode = function( obj ) {
	nodeId = obj.nodes[0];
	node = getNode(nodeId);
	label = node.label;
	color = node.color.background;
	
	$("#node-info-init").remove();
	$("#node-info-content").empty();

    var url = undefined;
    var cat = undefined;

    if(color == GENETIC_COLOR)
    {
    	cat = "Genetic"
        url = 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + encodeURIComponent(label.match("\\[(.*)\\]")[1]);
    }
    else if (color == BRAIN_ANATOMY_COLOR)
    {
    	cat = "Brain Anatomy"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);
    }
    else if (color == BRAIN_METABOLISM_COLOR)
    {
    	cat = "Brain Metabolism"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);
    }
    else if (color == AD_COLOR)
    {
    	cat = "AD"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);
    }
    else if (color == CONTROL_COLOR)
    {
    	cat = "Control"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);
    }
    else if (color == CSF_PROTEIN_COLOR)
    {
    	cat = "CSF Protein"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);
    }
    else if (color == BLOOD_PROTEIN_COLOR)
    {
    	cat = "Blood Protein"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);
    }
    else
    {
    	cat = "Unknown"
        url = 'http://google.com/search?q=' + encodeURIComponent(label);   
    }

    $("#node-info-content").append("Name: "+label+"<br/>")
    .append("Category: "+cat+"<br/>")
    .append("<a target=\"_blank\" href=\""+url+"\">More...<a/>");
}

getNode = function( nodeId ) {
	for(var i=0, l=data.nodes.length; i<l; i++) {
		if(data.nodes[i].id == nodeId) {
			return data.nodes[i];
		}
	}
}
