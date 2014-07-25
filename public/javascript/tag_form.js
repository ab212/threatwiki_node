$(document).ready(function() {

  //setup the form data validator
  $('.tag_form').parsley({
      successClass: 'success',
      errorClass: 'error',
      classHandler: function(el) {
        return el.$element.closest('.control-group');
      },
      errorsWrapper: '<span class=\"help-inline\"></span>',
      errorTemplate: '<span></span>'
  });

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

  // create tag
  tag_form.submit(function(){
    jQuery.post("/api/tag", tag_form.serialize(), function (data, textStatus, jqXHR) {
      console.log("Post response:"); console.dir(data); console.log(textStatus); console.dir(jqXHR);
      window.location=referringURL;
    });
    return false;
  });

  // update tag
  tag_form_update.submit(function(){
    var obj_id = $("input[name=id]").val();
    jQuery.ajax({
      url: "/api/tag/"+obj_id,
      data: tag_form_update.serialize(),
      type: 'PUT'
    }).done(function() { 
      window.location=referringURL;
    });
    return false;
  });

  //someone clicked Archive on the update form
  //TODO: Add confirmation dialog
  $("#archive").click(function(){
    var obj_id = $("input[name=id]").val();
    var soc_name = $("input[name=socname]").val();

    jQuery.ajax({
      url: "/api/tag/"+obj_id+"/archive",
      data: "archive=true",
      type: 'PUT'
    }).done(function() {
      //redirect to previous page after successful form submission
      window.location='/soc/view?soc='+soc_name;
    });
    return false;
  });

});
