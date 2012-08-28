$(document).ready(function() {
  // delete
  $("[id*=delete]").click(function() {
    var id = $(this).attr("id").split("_");

    $.get("/api/soc/delete/"+id[1], function() {
      $("#row_"+id[1]).fadeOut('slow', function() {});
    }).error(function() { alert("delete failed");});
  });

  $('#soc').dataTable({
    "bPaginate": false
  });
});
