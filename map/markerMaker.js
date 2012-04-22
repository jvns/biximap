// functions to make Google Maps markers

Biximap.createMarkers = function(stations, toggle, imagecreator, map) {
  markers = new Object();
  for (id in stations) {
    markers[id] = Biximap.createMarker(stations[id], toggle, imagecreator, map);
  }
  Biximap.state.tooltip = new Biximap.Tooltip({
     map: map,
     marker: markers[1],
     cssClass: 'tooltip'
  })
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

  google.maps.event.addListener(marker, "mouseover", function() {
    // We always use the same infowindow, just update it as necessary
    var contentString = "<b>" + station['name'] + "</b> <br>" + new
    String(station['nbBikes']) + " bikes" + ", " +new
    String(station['nbEmptyDocks']) + " parking spots";
    //Biximap.state.infowindow.setContent(contentString);
    //Biximap.state.infowindow.open(map, marker);
    var drawing = Biximap.bikesVisualization(station);
    Biximap.state.tooltip.updateOptions({marker: marker, content: contentString + "<br>" + drawing})
    Biximap.state.tooltip.draw()
    Biximap.state.tooltip.show()
  });
  google.maps.event.addListener(marker, "mouseout", function() {
    Biximap.state.tooltip.hide()
  });

  google.maps.event.addListener(marker, "mouseout", function() {
    // $('#infoBox').html('');
  });
  return marker;
}

Biximap.bikesVisualization = function(station) {
  var numBikes = station['nbBikes'];
  var numDocks = station['nbEmptyDocks'];
  var total = numBikes + numDocks;
  var bikebox = "<span class='bike'>&nbsp;</span> "
  var parking = "<span class='parking'>&nbsp;</span> "
  var html = "";
  for (i = 0; i < numBikes; i++) {
    html += bikebox;
  }
  for (i = 0; i < numDocks; i++) {
    html += parking;
  }
  return html;
};

Biximap.Tooltip = function(options) {
  this.div_ = document.createElement('DIV');
  this.updateOptions(options);
  this.setMap(this.map_);
}
// Now we extend google.maps.OverlayView()
Biximap.Tooltip.prototype = new google.maps.OverlayView();
Biximap.Tooltip.prototype.updateOptions = function(options) {
  this.marker_ = options.marker || this.marker_;
  this.content_ = options.content || this.content_;
  this.map_ = options.map || this.map_;
  this.cssClass_ = options.cssClass||this.cssClass_;
  this.updateDiv();
}
Biximap.Tooltip.prototype.updateDiv = function() {
  div = this.div_;
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  if(this.cssClass_)
    div.className  = this.cssClass_;
  div.innerHTML = this.content_;
  this.div_ = div;
};

Biximap.Tooltip.prototype.onAdd = function() {
  this.updateDiv();
  // We add an overlay to a map via one of the map's panes.
  // We'll add this overlay to the floatPane pane.
  var panes = this.getPanes();
  panes.floatPane.appendChild(this.div_ || $('<div>')[0]);
}
Biximap.Tooltip.prototype.draw = function() {
  // Position the overlay. We use the position of the marker
  // to peg it to the correct position, just northeast of the marker.
  // We need to retrieve the projection from this overlay to do this.
  var overlayProjection = this.getProjection();
  // Retrieve the coordinates of the marker
  // in latlngs and convert them to pixels coordinates.
  // We'll use these coordinates to place the DIV.
  var ne = overlayProjection.fromLatLngToDivPixel(this.marker_.getPosition());
  // Position the DIV.
  var div = this.div_;
  var leftBorder = ne.x;
  var topBorder = ne.y;
  div.style.left = leftBorder + 'px';
  div.style.top = topBorder + 'px';
  // Adjust the offset if it's outside the window's borders
  var actualLeft = $(div).offset().left;
  if (actualLeft + $(div).width() > $(window).width()) {
    var amountToFix = actualLeft + $(div).width() - $(window).width();
    leftBorder -= amountToFix;
    div.style.left = leftBorder + 'px';
  }
  var actualTop = $(div).offset().top;
  if (actualTop + $(div).height() > 0.95 * $(window).height()) {
    var amountToFix = actualTop + $(div).height() - 0.95 * $(window).height();
    topBorder -= amountToFix;
    div.style.top = topBorder + 'px';
  }
}
// We here implement onRemove
Biximap.Tooltip.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
}
// Note that the visibility property must be a string enclosed in quotes
Biximap.Tooltip.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.visibility = "hidden";
  }
}
Biximap.Tooltip.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = "visible";
  }
}
