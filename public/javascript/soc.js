$(document).ready(function() {
  // $.post()
  soc_form.submit(function(){
    jQuery.post("/api/soc", soc_form.serialize(), function (data, textStatus, jqXHR) {
      console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
    });
    $("#status").html("posted");
    $('#result').html(soc_form.serialize());
    return false;
  });

  // #.put()
  soc_form_update.submit(function(){
    var obj_id = $("input[name=id]").val();
    jQuery.ajax({
      url: "/api/soc/"+obj_id,
      data: soc_form_update.serialize(),
      type: 'PUT'
    }).done(function() { 
      $("#status").html("posted");
      $('#result').html(soc_form.serialize());
    });
    return false;
  });

  // $.get()
  $("#get").click(function() {
    $("#result").html('');
    $("#status").html('');
    $('#consumed_table').html('');

    var socs = jQuery.get("/api/soc/", function (socs, textStatus, jqXHR) {
      console.log("Get resposne:");
      console.dir(socs);
      console.log(textStatus);
      console.dir(jqXHR);

      $("#result").html(JSON.stringify(socs));
        // return data in tabular format
        $.each(socs, function(key, value) {
          $('#consumed_table')
          .append($("<tr></tr>")
          .append($("<td></td>")
          .append($("<a></a>")
          .attr("href","/api/soc/"+value._id)
          .text(value.title)))
          .append($("<td></td>")
          .append($("<a></a>")
          .attr("href","/api/soc/delete/"+value._id)
          .text("delete"))));
        });
    });

    $("#status").append("received");
    // consume JSON
    $("#status").append("<br/>consumed");
  });
});
