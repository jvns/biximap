// coloring function with 4 colours
function discreteColor(station, toggle, map) {
    var attribute;
    if (toggle == 'nbBikes') {
        attribute = station['nbBikes'];
    } else {
        attribute = station['nbEmptyDocks'];
    }

    if (attribute == 0) {
        // black
        url = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%20|000000|000000";
    } else if (attribute < 3) {
        // red
        url = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%20|FF0000|000000";
    } else if (attribute < 7) {
        // orange
        url = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%20|FFB900|000000";
    } else {
        // green
        url = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%20|20C900|000000";
    }

    var image = new google.maps.MarkerImage(url,
      new google.maps.Size(20, 32),
      new google.maps.Point(0,0),
      new google.maps.Point(0, 32));

    return image;
}
