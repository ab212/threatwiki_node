$(document).ready(function() {
  $(function() {
    $('#location').autoGeocoder();
  });
  var already_included_soc = $('#soc').val();

  // get socs
  var socs = jQuery.get("/api/soc/", function (socs, textStatus, jqXHR) {
    $("#result").append("Loaded SOCs");
    console.log("Loaded SOCs");
    $.each(socs, function(key, value){
      // TODO: this is a very inefficient way of checking if the tag is already loaded, brainstorm and improve this.
      // one idea: add all tags. then iterate through entire list and delete repetitions
      if ((already_included_soc!=value.title)) {
        $('#soc')
        .append($("<option></option>")
        .attr("value",value.title)
        .text(value.title));
       }
    });
  });

  // get tags for selected soc
  $(function() {
    var selected_soc;

    var socs = jQuery.get("/api/soc/", function (socs, textStatus, jqXHR) {
      var selected_soc = $("#soc").val();
      var already_included_tags = $('#tag_list').val();

      var tags = jQuery.get("/api/tag/soc/" + selected_soc, function (tags, textStatus, jqXHR) {
        $("#result").append("<br/>Loaded Initial Tags");
        console.log("Loaded initial tags");
        $.each(tags, function(key, value) {
              // TODO: this is a very inefficient way of checking if the tag is already loaded, brainstorm and improve this.
              // one idea: add all tags. then iterate through entire list and delete repetitions
          if (!ifInArray(already_included_tags, value._id)) {
            $('#tag_list')
            .append($("<option></option>")
            .attr("value",value._id)
            .text(value.title));
          }
        });
      });
    });
  });

  // on soc change, refresh tags
  var refresh_tags = $("#soc").change(function(){
  var selected_soc = $("#soc option:selected").val();

    var tags = jQuery.get("/api/tag/soc/" + selected_soc, function (tags, textStatus, jqXHR) {
        $("#result").append("<br/>Loaded Tags");
        console.log("Loaded Tags");
        //empty list of tags before the foreach, in case there is no tag in that SOC
        $('#tag_list').empty();
        $.each(tags, function(key, value) {
          $('#tag_list')
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
      //redirect to previous page after successful form submission
      window.location=referringURL;
    });
    $("#status").html("posted");
    $('#result').html(datapoint_form.serialize());
    return false;
  });

  // #.put()
  datapoint_form_update.submit(function(){
    var obj_id = $("input[name=id]").val();

    jQuery.ajax({
      url: "/api/datapoint/"+obj_id,
      data: datapoint_form_update.serialize(),
      type: 'PUT'
    }).done(function() { 
      $("#status").html("posted");
      $('#result').html(datapoint_form_update.serialize());
      //redirect to previous page after successful form submission
      window.location=referringURL;
    });
    return false;
  });

  // #.put()
  //someone clicked Archive on the update form
  //TODO: Add confirmation dialog
  $("#archive").click(function(){
    var obj_id = $("input[name=id]").val();

    jQuery.ajax({
      url: "/api/datapoint/"+obj_id+"/archive",
      data: "archive=true",
      type: 'PUT'
    }).done(function() {
     // $("#status").html("posted");
      //$('#result').html(datapoint_form_update.serialize());
      //redirect to previous page after successful form submission
      window.location=referringURL;
    });
    return false;
  });

  // $.get()
  $("#get").click(function() {
    $("#result").html('');
    $("#status").html('');
    $('#consumed_table').html('');

    var datapoints = jQuery.get("/api/datapoint/", function (datapoints, textStatus, jqXHR) {
      console.log("Get response:");
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
