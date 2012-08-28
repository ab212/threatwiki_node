$(document).ready(function() {
  // delete
  $("[id*=delete]").click(function() {
    var id = $(this).attr("id").split("_");
    $.get("/api/datapoint/delete/"+id[1], function() {
      $("#row_"+id[1]).fadeOut('slow', function() {});
    }).error(function() { alert("delete failed");});
  });

  $('#datapoint').dataTable({
    "bPaginate": false
  });
});
