$(document).ready(function() {
  //setup the form data validator
  $('.datapoint_form').parsley({
      successClass: 'success',
      errorClass: 'error',
      classHandler: function(el) {
        return el.$element.closest('.control-group');
      },
      errorsWrapper: '<span class=\"help-inline\"></span>',
      errorTemplate: '<span></span>'
  });
  $('#event_date').datepicker();
  $('#tag_list').select2({
      width: 'resolve',
      placeholder: "Select Tags"
       });
  //After someone finished the "Add new tag" inside a datapoint
  $('#tag_form').submit(function(){
    jQuery.post("/api/tag", $('#tag_form').serialize(), function (data, textStatus, jqXHR) {
      console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
      //Empty title and description after the tag has been saved in case someone wants to add a second tag     
      $('#tagtitle').val("");
      $('#tagdescription').val("");
      //New tag just got created, hiding the modal dialog and adding new tag to the list of tags available in the datapoint
      $('#myModal').modal('toggle');
      var selected_soc = $("#soc").val();
      var already_included_tags=[];
      //Get list of existing tags in the select
      $("#tag_list option").each(function(key,value){
        already_included_tags.push(value.value);
      });
      var tags = jQuery.get("/api/tag/soc/" + selected_soc, function (tags, textStatus, jqXHR) {
        $("#result").append("<br/>Loaded Initial Tags");
        console.log("Loaded initial tags");
        $.each(tags, function(key, value) {
          //We call all the tags from the API, we compare with the ones already present in the select, if not there, we add it
          if (!ifInArray(already_included_tags, value._id)) {
            $('#tag_list')
            .append($("<option></option>")
            .attr("value",value._id)
            .text(value.title));
          }
        });
      });

    });
    return false;
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
  
  // submit new datapoint (POST)
  datapoint_form.submit(function(){
    
    jQuery.post("/api/datapoint", datapoint_form.serialize(), function (data, textStatus, jqXHR) {
      //console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
      //redirect to previous page after successful form submission

      window.location=referringURL;
    });
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
      //redirect to previous page after successful form submission
      window.location=referringURL;
    });
    return false;
  });

  //When clicking on add button, adding a new line to add more sources
  $("#addbutton").click(function(){
    var lastInput = $("#sourcelist").find("input").eq(-2);
    var lastId = lastInput.nextAll("input[type=hidden]").first();
    var lastSelect = $("#sourcelist").find("select").eq(-1);
    //Make a copy of the inputURL on the next line
    lastSelect.nextAll("br").first().after(lastInput.clone().removeAttr('data-parsley-id'));
    var newInput =  $("#sourcelist").find("input").eq(-1);
    //Add a copy of the last Select menu after the new inputURL
    newInput.after('<span class="help-inline"></span>',lastSelect.clone().removeAttr('data-parsley-id'),'<br/>');
    newInput.after(lastId.clone());
    //Make sure those new elements are empty
    newInput.val("");
    newInput.next().val("");
    $("#sourcelist").find("select").eq(-1).val("");
  });
  //setup the google map geocoder
  $(function() {
    $('#location').autoGeocoder({position:'before'});
  });
});
