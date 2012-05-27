$(document).ready(function() {
  var socs = jQuery.get("/api/soc/", function (socs, textStatus, jqXHR) {
    console.log("Get response:");
    console.dir(socs);
    console.log(textStatus);
    console.dir(jqXHR);

    // return data in tabular format
    $.each(socs, function(key, value) {
      var d = new Date(value.modified);
      $('#soc')
      .find('tbody')
      .append($("<tr></tr>")
      .append($("<td></td>")
      .append($("<a></a>")
      .attr("href","/api/soc/"+value._id)
      .text(value.title)))
      .append($("<td></td>")
      .append($("<a></a>")
      .text(getMonthText(d.getMonth() + 1) + " " + d.getDate() + ", " + d.getFullYear())))
      .append($("<td></td>")
      .append($("<a></a>")
      .attr("href","/api/soc/delete/"+value._id)
      .text("delete"))));
    });
  });
});
