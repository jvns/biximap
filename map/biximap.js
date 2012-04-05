var APP = {}; // global variable
APP.state = {};
// get and parse the availability data
APP.updateMap = function() {
  var queryString = window.location.search.substring(1);
  $(document).ready( function() {
    jQuery.getJSON("getData.php?" + queryString, function(stations) {
        APP.state.stations = stations;
        for (id in stations) {
          if (stations[id].installed === "false") {
            delete stations[id];
          }
        }
        APP.updateMarkers();
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


APP.initialize = function() {
  // initialize the map
  var montreal = new google.maps.LatLng(45.50811761960114, -73.5747367143631);
  var mapOptions = {
      zoom: 13,
      center: montreal,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  APP.state.map = map;
  // Add an infowindow 
  APP.infowindow = new google.maps.InfoWindow();
  // Initialize the controls
  var legendControl = new APP.LegendControl();
  legendControl.control.index = 2;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legendControl.control);
  var searchControl = new APP.SearchControl();
  searchControl.control.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchControl.control);
  var bikeParkingToggle = new APP.BikeParkingToggle();
  APP.state.bikeParkingToggle = bikeParkingToggle;
  bikeParkingToggle.control.index = 2;
  // Initialize the search widget
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(bikeParkingToggle.control);
  // keyboard shortcut: '/' => focus search box
  $(document).bind('keyup', '/', function() {search.focus()});
  // update the map once a minute
  self.setInterval(function() {APP.updateMap(map)}, 300000); 
  // Update the map for the first time
  APP.updateMap();
}

APP.updateMarkers = function() {
  var stations = APP.state.stations;
  var map = APP.state.map;
  var bikeMarkers    = APP.createMarkers(stations, 'nbBikes', APP.discreteColor, map);
  var parkingMarkers = APP.createMarkers(stations, 'nbParking', APP.discreteColor, map);
  APP.state.bikeMarkers = bikeMarkers;
  APP.state.parkingMarkers = parkingMarkers;
  for (id in parkingMarkers) {
    if (APP.state.markertype == 'parking') {
      bikeMarkers[id].setVisible(false);
    } else {
      parkingMarkers[id].setVisible(false);
    }
  }
}
