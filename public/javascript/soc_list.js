$(document).ready(function() {
  // delete
  $("[id*=delete]").click(function() {
    var id = $(this).attr("id").split("_");

    $.get("/api/soc/delete/"+id[1], function() {
      $("#row_"+id[1]).fadeOut('slow', function() {});
    }).error(function() { alert("delete failed");});
  });
    $.extend( $.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
  } );

  $('#soc').dataTable({
    "bPaginate": false,
    "bFilter": false
    //don't want to sort the actions column
   // "aoColumnDefs": [
   //   { "bSortable": false, "aTargets": [ 5 ] },
   //   { "bSearchable": false, "aTargets": [ 5 ] }
   // ]
  });
});
