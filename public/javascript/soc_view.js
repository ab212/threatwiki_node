$(document).ready(function() {

  // #.put()
  //someone clicked Archive on the update form
  //TODO: Add confirmation dialog
  $("[id*=archive]").click(function(){
    var obj_id = $(this).attr("id").split("_");

    jQuery.ajax({
      url: "/api/datapoint/"+obj_id[1]+"/archive",
      data: "archive=true",
      type: 'PUT'
    }).done(function() {
      $("#row_"+obj_id[1]).fadeOut('slow', function() {});
    });
    return false;
  });

  $.extend( $.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
  } );
  $('#datapoint').dataTable({
//    "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
    "sPaginationType": "bootstrap",
    "bPaginate": false,
    //sort by Event date
    "aaSorting": [[ 5, "desc" ]]

  });
});
