var map;
var infowindow;
// get and parse the availability data
function updateMap(map) {
  var queryString = window.location.search.substring(1);
  $(document).ready( function() {
      jQuery.getJSON("getData.php?" + queryString, function(stations) {
        for (id in stations) {
        if (stations[id].installed === "false") {
        delete stations[id];
        }
        }
        updateMarkers(stations, map);
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


function initialize() {
  // initialize the map and markers
  var montreal = new google.maps.LatLng(45.50811761960114, -73.5747367143631);
  var mapOptions = {
zoom: 13,
      center: montreal,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  infowindow = new google.maps.InfoWindow();
  window.map = map;
  var legendDiv = document.createElement('DIV');
  var legendControl = new LegendControl(legendDiv);
  legendDiv.index = 2;
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legendDiv);
  var searchDiv = document.createElement('DIV');
  var searchControl = new SearchControl(searchDiv);
  searchDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchDiv);
  // keyboard shortcut: '/' => focus search box
  $(document).bind('keyup', '/', function() {search.focus()});
  // update the map once a minute
  self.setInterval(function() {updateMap(map)}, 300000); 
  updateMap(map);
}

function updateMarkers(stations, map) {
  map.stations = stations;
  var bikeMarkers = createMarkers(stations, 0, discreteColor, map);
  var parkingMarkers = createMarkers(stations, 1, discreteColor, map);
  map.bikeMarkers = bikeMarkers;
  map.parkingMarkers = parkingMarkers;
  bikeParkingDiv = document.createElement('DIV');
  bpt = new BikeParkingToggle(bikeParkingDiv, bikeMarkers, parkingMarkers, map);
  bpt.index = 2;
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(bikeParkingDiv);
  if (map.BikeParkingToggle) {
    // remove the control and overlays if it's already there
    map.removeControl(map.BikeParkingToggle);
    map.clearOverlays();
  }
  map.BikeParkingToggle = bpt;
  for (id in parkingMarkers) {
    parkingMarkers[id].setMap(map);
    bikeMarkers[id].setMap(map);
    if (map.markertype == 'parking') {
      bikeMarkers[id].setVisible(false);
    } else {
      parkingMarkers[id].setVisible(false);
    }
  }
}
