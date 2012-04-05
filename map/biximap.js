var Biximap = {}; // global variable
Biximap.state = {};
// get and parse the availability data
Biximap.updateMap = function() {
  var queryString = window.location.search.substring(1);
  $(document).ready( function() {
    jQuery.getJSON("getData.php?" + queryString, function(stations) {
        Biximap.state.stations = stations;
        for (id in stations) {
          if (stations[id].installed === "false") {
            delete stations[id];
          }
        }
        Biximap.updateMarkers();
        // set up autocomplete (todo: put this somewhere better)
        var station_names = [];
        for (id in stations) {
          station_names.push(stations[id]['name'])
        }
        $("#search").autocomplete(station_names, {matchContains: true, mustMatch: false});
      }
    );
  });
}


Biximap.initialize = function() {
  // initialize the map
  var montreal = new google.maps.LatLng(45.50811761960114, -73.5747367143631);
  var mapOptions = {
      zoom: 13,
      center: montreal,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  Biximap.state.map = map;
  // Add an infowindow 
  Biximap.state.infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(Biximap.state.map, 'click', function() {Biximap.state.infowindow.close()});
  // Initialize the controls
  var legendControl = new Biximap.LegendControl();
  legendControl.control.index = 2;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legendControl.control);
  var bikeParkingToggle = new Biximap.BikeParkingToggle();
  Biximap.state.bikeParkingToggle = bikeParkingToggle;
  bikeParkingToggle.control.index = 2;
  // Initialize the search widget
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(bikeParkingToggle.control);
  // keyboard shortcut: '/' => focus search box
  $(document).bind('keyup', '/', function() {search.focus()});
  // update the map once a minute
  self.setInterval(function() {Biximap.updateMap(map)}, 300000); 
  // Update the map for the first time
  Biximap.updateMap();
}

Biximap.updateMarkers = function() {
  var stations = Biximap.state.stations;
  var map = Biximap.state.map;
  var bikeMarkers    = Biximap.createMarkers(stations, 'nbBikes', Biximap.discreteColor, map);
  var parkingMarkers = Biximap.createMarkers(stations, 'nbParking', Biximap.discreteColor, map);
  Biximap.state.bikeMarkers = bikeMarkers;
  Biximap.state.parkingMarkers = parkingMarkers;
  for (id in parkingMarkers) {
    if (Biximap.state.markertype == 'parking') {
      bikeMarkers[id].setVisible(false);
    } else {
      parkingMarkers[id].setVisible(false);
    }
  }
}
