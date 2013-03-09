$(document).ready(function() {
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
