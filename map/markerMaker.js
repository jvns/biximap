// functions to make Google Maps markers

function createMarkers(stations, toggle, imagecreator, map) {
    markers = new Object();
    for (id in stations) {
        markers[id] = createMarker(stations[id], toggle, imagecreator, map);
    }
    return markers;
}

function createMarker(station, toggle, imagecreator, map) {
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
             // make an info window
             var contentString = "<b>" + station['name'] + "</b> <br>" + new
                 String(station['nbBikes']) + " bikes" + ", " +new
                 String(station['nbEmptyDocks']) + " parking spots";
             infowindow.setContent(contentString);
             infowindow.open(map, marker);
     });
     return marker;

}
