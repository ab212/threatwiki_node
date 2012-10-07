$(document).ready(function() {

var already_included_soc = $('#soc').val();

  // get socs
  var socs = jQuery.get("/api/soc/", function (socs, textStatus, jqXHR) {
    $("#result").append("Loaded SOCs");
    console.log("Loaded SOCs");
    $.each(socs, function(key, value) {
      if ((already_included_soc!=value.title)) {
        $('#soc')
        .append($("<option></option>")
        .attr("value",value.title)
        .text(value.title));
      }
    });
  });

  // $.post()
  tag_form.submit(function(){
    jQuery.post("/api/tag", tag_form.serialize(), function (data, textStatus, jqXHR) {
      console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
      window.location=referringURL;
    });
    $("#status").html("posted");
    $('#result').html(tag_form.serialize());
    return false;
  });

  // #.put()
  tag_form_update.submit(function(){
    var obj_id = $("input[name=id]").val();
    jQuery.ajax({
      url: "/api/tag/"+obj_id,
      data: tag_form_update.serialize(),
      type: 'PUT'
    }).done(function() { 
      $("#status").html("posted");
      $('#result').html(tag_form.serialize());
      window.location=referringURL;
    });
    return false;
  });

  // $.get()
  $("#get").click(function() {
    $("#result").html('');
    $("#status").html('');
    $('#consumed_table').html('');

    var tags = jQuery.get("/api/tag/", function (tags, textStatus, jqXHR) {
      console.log("Get resposne:");
      console.dir(tags);
      console.log(textStatus);
      console.dir(jqXHR);

      $("#result").html(JSON.stringify(tags));
      // return data in tabular format
      $.each(tags, function(key, value) {
        $('#consumed_table')
        .append($("<tr></tr>")
        .append($("<td></td>")
        .append($("<a></a>")
        .attr("href","/api/tag/"+value._id)
        .text(value.title)))
        .append($("<td></td>")
        .append($("<a></a>")
        .attr("href","/api/tag/delete/"+value._id)
        .text("delete"))));
      });
    });

  $("#status").html("received");
  });
});
