$(document).ready(function() {
  // delete
  $("[id*=delete]").click(function() {

    $.get("/api/soc/delete/"+id[1], function() {
      $("#row_"+id[1]).fadeOut('slow', function() {});
    }).error(function() { alert("delete failed");});
  });
});
