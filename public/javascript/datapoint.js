$(document).ready(function() {
  // get socs
  var socs = jQuery.get("/api/soc/", function (socs, textStatus, jqXHR) {
    $("#result").append("Loaded SOCs");
    console.log("Loaded SOCs");
    $.each(socs, function(key, value){
      $('#soc')
      .append($("<option></option>")
      .attr("value",value.title)
      .text(value.title));
    });
  });

  // on soc change, refresh tags
  $("#soc").change(function(){
	var selected_soc = $("#soc option:selected").val();

    var tags = jQuery.get("/api/tag/soc/" + selected_soc, function (tags, textStatus, jqXHR) {
      $("#result").append("<br/>Loaded Tags");
      console.log("Loaded Tags");
      $.each(tags, function(key, value) {
        $('#tag_list')
        .empty()
        .append($("<option></option>")
        .attr("value",value._id)
        .text(value.title));
      });
    });
  });

  $("#status").html("received");

  // $.post()
  datapoint_form.submit(function(){
    jQuery.post("/api/datapoint", datapoint_form.serialize(), function (data, textStatus, jqXHR) {
      console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
    });
    $("#status").html("posted");
    $('#result').html(datapoint_form.serialize());
    return false;
  });

  // $.get()
  $("#get").click(function() {
    $("#result").html('');
    $("#status").html('');
    $('#consumed_table').html('');

    var datapoints = jQuery.get("/api/datapoint/", function (datapoints, textStatus, jqXHR) {
      console.log("Get resposne:");
      console.dir(datapoints);
      console.log(textStatus);
      console.dir(jqXHR);

      $("#result").html(JSON.stringify(datapoints));
      // return data in tabular format
      $.each(datapoints, function(key, value) {
        $('#consumed_table')
        .append($("<tr></tr>")
        .append($("<td></td>")
        .append($("<a></a>")
        .attr("href","/api/datapoint/"+value._id)
        .text(value.title)))
        .append($("<td></td>")
        .append($("<a></a>")
        .attr("href","/api/datapoint/delete/"+value._id)
        .text("delete"))));
      });

    });
  });
});
