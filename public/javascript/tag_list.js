$(document).ready(function() {
  var tags = jQuery.get("/api/tag/", function (tags, textStatus, jqXHR) {
    console.log("Get resposne:");
    console.dir(tags);
    console.log(textStatus);
    console.dir(jqXHR);

    // return data in tabular format
    $.each(tags, function(key, value) {
      var d = new Date(value.modified);
      $('#tag')
      .find('tbody')
      .append($("<tr></tr>")
      .append($("<td></td>")
      .append($("<a></a>")
      .attr("href","/api/tag/"+value._id)
      .text(value.title)))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(value.soc)))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(getMonthText(d.getMonth() + 1) + " " + d.getDate() + ", " + d.getFullYear())))
      .append($("<td></td>")
      .append($("<a></a>")
      .attr("href","/api/tag/delete/"+value._id)
      .text("delete"))));
    });
  });
});
