$(document).ready(function() {
  // delete
  $("[id*=delete]").click(function() {
    var id = $(this).attr("id").split("_");
    $.get("/api/datapoint/delete/"+id[1], function() {
      $("#row_"+id[1]).fadeOut('slow', function() {});
    }).error(function() { alert("delete failed");});
  });
  $.extend( $.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
  } );
  $('#datapoint').dataTable({
//    "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
    "sPaginationType": "bootstrap",
    "bPaginate": false,
    //don't want to sort the actions column
    "aoColumnDefs": [
      { "bSortable": false, "aTargets": [ 7 ] },
      { "bSearchable": false, "aTargets": [ 7 ] }
    ]
  });
});
