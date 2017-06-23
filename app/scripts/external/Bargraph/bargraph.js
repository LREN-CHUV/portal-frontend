var data;

$.getJSON("/services/json/bargraph/query/", function(json) {
  data = json;
});

google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(drawChart);
function drawChart() {
  var stacked = $("#stacked");

  if (!data) {
    return;
  }

  var table = google.visualization.arrayToDataTable(data.counts);

  if (data.option == "diagnostic") {
    // removes column with total
    table.removeColumn(1);
    var options = {
      title: 'Diagnosis counts dist. keywords "' + data.keyword + '"',
      vAxis: { title: "Diagnosis" },
      hAxis: { title: "Counts" },
      chartArea: { left: 200, top: 50, width: "80%", height: "80%" },
      bar: { groupWidth: "85%" },
      legend: { position: "top", textStyle: { fontSize: 12 } },
      isStacked: stacked.val() == "on"
    };
    var chart = new google.visualization.BarChart($("#chart_div").get(0));
    chart.draw(table, options);
  } else {
    table.removeColumn(4);
    var options = {
      title: 'Diagnosis age dist. keywords "' + data.keyword + '"',
      vAxis: { title: "Diagnosis" },
      hAxis: { title: "Age" },
      chartArea: { left: 200, top: 50, width: "80%", height: "80%" },
      bar: { groupWidth: "85%" },
      legend: { position: "top", textStyle: { fontSize: 12 } },
      isStacked: stacked.val() == "on"
    };
    var chart = new google.visualization.ColumnChart($("#chart_div").get(0));
    chart.draw(table, options);
  }
}

function perform_query() {
  var keyword = $("#query_keyword").val();
  var select = $("#query_type").val();

  var baseURL = "/services/json/bargraph/query?";
  var dataURL = baseURL + "keyword=" + keyword + "&option=" + select;

  d3.json(dataURL, function(error, json) {
    if (error) {
      return console.warn(error);
    }

    data = json;
    drawChart();
  });
}

$("#query_keyword").keyup(function(event) {
  if (event.keyCode == 13) {
    perform_query();
  }
});

$("#stacked").mouseup(function(event) {
  drawChart();
});

$("#query_type").mouseup(function(event) {
  perform_query();
});
