$(document).ready(function() {
  var datapoints = jQuery.get("/api/datapoint/", function (datapoints, textStatus, jqXHR) {
    console.log("Get resposne:");
    console.dir(datapoints);
    console.log(textStatus);
    console.dir(jqXHR);

    // return data in tabular format
    $.each(datapoints, function(key, value) {
      var d = new Date(value.modified);
      $('#datapoint')
      .find('tbody')
      .append($("<tr></tr>")
      .append($("<td></td>")
      .append($("<a></a>")
      .attr("href","/api/datapoint/"+value._id)
      .text(value.title)))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(value.soc)))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(value.Location.title)))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(value.tags[0])))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(getMonthText(d.getMonth() + 1) + " " + d.getDay() + ", " + d.getFullYear())))
      .append($("<td></td>")
      .append($("<a></a>")
      .attr("href","/api/datapoint/delete/"+value._id)
      .text("delete"))));
    });
  });
});
