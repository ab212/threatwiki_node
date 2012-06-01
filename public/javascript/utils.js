function ifInArray (array_n, value_n) {
  if (array_n == null || value_n == null)
    return false;

  for (var i = 0; i < array_n.length; i++) {
    if (array_n[i] == value_n) {
      return true;
    }
  }
  return false;
}

function getMonthText (monthNum) {
  switch (monthNum) {
  case 1:
    return "January";
    break;
  case 2:
    return "February";
    break;
  case 3:
    return "March";
    break;
  case 4:
    return "April";
    break;
  case 5:
    return "May";
    break;
  case 6:
    return "June";
    break;
  case 7:
    return "July";
    break;
  case 8:
    return "August";
    break;
  case 9:
    return "September";
    break;
  case 10:
    return "October";
    break;
  case 11:
    return "November";
    break;
  case 12:
    return "December";
    break;
  }
}
