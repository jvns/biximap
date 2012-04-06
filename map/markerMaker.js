// functions to make Google Maps markers

Biximap.createMarkers = function(stations, toggle, imagecreator, map) {
    markers = new Object();
    for (id in stations) {
        markers[id] = Biximap.createMarker(stations[id], toggle, imagecreator, map);
    }
    return markers;
}

Biximap.createMarker = function(station, toggle, imagecreator, map) {
    iconSize=new google.maps.Size(20,32); 
    iconAnchor=new google.maps.Point(10,32); 
    infoWindowAnchor=new google.maps.Point(10,3); 

    image = imagecreator(station, toggle, map);

    var marker = new google.maps.Marker({
        size: iconSize, 
        anchor: iconAnchor,
        icon: image,
        map: map,
        position: new google.maps.LatLng(station['latitude'], station['longitude']),
    });

    google.maps.event.addListener(marker, "click", function() {
        // We always use the same infowindow, just update it as necessary
        var contentString = "<b>" + station['name'] + "</b> <br>" + new
        String(station['nbBikes']) + " bikes" + ", " +new
        String(station['nbEmptyDocks']) + " parking spots";
        Biximap.state.infowindow.setContent(contentString);
        Biximap.state.infowindow.open(map, marker);
        });
    google.maps.event.addListener(marker, "mouseover", function() {
      var numBikes = station['nbBikes'];
      var numDocks = station['nbEmptyDocks'];
      var total = numBikes + numDocks;
      var bikebox = "<span class='bike'>&nbsp;&nbsp;</span>"
      var parking = "<span class='parking'>&nbsp;&nbsp;</span>"
      var html = "";
      for (i = 0; i < numBikes; i++) {
        html += bikebox;
      }
      for (i = 0; i < numDocks; i++) {
        html += parking;
      }
      $('#infoText').html(station['name']);
      $('#progressBar').html(html);
    });
    google.maps.event.addListener(marker, "mouseout", function() {
      // $('#infoBox').html('');
    });
    return marker;
}
