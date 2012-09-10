$(document).ready(function() {
  // delete
  $("[id*=delete]").click(function() {
    var id = $(this).attr("id").split("_"); 

    $.get("/api/tag/delete/"+id[1], function() {
      $("#row_"+id[1]).fadeOut('slow', function() {});
    }).error(function() { alert("delete failed");});
  });
  $.extend( $.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
  } );
    $('#tag').dataTable({
    "bPaginate": false,
    //don't want to sort or search the actions column
    "aoColumnDefs": [
      { "bSortable": false, "aTargets": [ 6 ] },
      { "bSearchable": false, "aTargets": [ 6 ] }
    ]
  });
});
