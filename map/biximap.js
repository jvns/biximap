var Biximap = {}; // global variable
Biximap.state = {};
// A bunch of globals for google & the DOM
var google, document, window, GIcon, GSize, GPoint;
(function ($) {
  "use strict";
  /**********************************
   * Init function for the map
   **********************************/
  Biximap.initialize = function() {
    // Initialize the map
    var montreal = new google.maps.LatLng(45.50811761960114, -73.5747367143631);
    var mapOptions = {
      zoom: 13,
      center: montreal,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions),
        legendControl,
        bikeParkingToggle;
    Biximap.state.map = map;
    // Initialize the legend control
    legendControl = new Biximap.LegendControl();
    Biximap.state.legendControl = legendControl;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legendControl.control);
    // Initialize the bike/parking toggle control
    bikeParkingToggle = new Biximap.BikeParkingToggle();
    Biximap.state.bikeParkingToggle = bikeParkingToggle;
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(bikeParkingToggle.control);
    // Set up keyboard shortcut: '/' => focus search box
    $(document).bind('keyup', '/', function() {$('#search').focus();});
    // Set callback to update the map once every five minutes
    window.setInterval(function() {Biximap.updateMap();}, 300000); 
    // Update the map for the first time
    Biximap.updateMap();
  };

  /**********************************
   * Update functions
   **********************************/
  // get and parse the availability data
  Biximap.updateMap = function() {
    var queryString;
    $('updateNotice').show('fast');
    queryString = window.location.search.substring(1);
    $(document).ready( function() {
      var station_names;
      $.getJSON("getData.php?" + queryString, function(stations) {
        Biximap.state.stations = stations;
        // Only show stations that have been installed
        for (var id in stations) {
          if (stations.hasOwnProperty(id)) {
            if (stations[id].installed === "false") {
              delete stations[id];
            }
          }
        }
        // Set up all the markers
        Biximap.updateMarkers();
        // Set up the autocomplete 
        station_names = [];
        for (id in stations) {
          if (stations.hasOwnProperty(id)) {
            station_names.push(stations[id].name);
          }
        }
        $("#search").autocomplete({
          matchContains: true, 
          mustMatch: false,
          source: function( request, response) {
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
            response( $.grep( station_names, function( value ) {
              value = value.responselabel || value.value || value;
              return matcher.test( value ) || matcher.test( Biximap.stripAccents( value ) );
            }) );
          }
        });
      }
     );
    });
  };

  // Does what it says on the tin
  Biximap.updateMarkers = function() {
    var stations = Biximap.state.stations,
        map = Biximap.state.map,
        oldBikeMarkers    = Biximap.state.bikeMarkers,
        oldParkingMarkers = Biximap.state.parkingMarkers,
        newBikeMarkers    = Biximap.createMarkers(stations, 'nbBikes', Biximap.discreteColor, map),
        newParkingMarkers = Biximap.createMarkers(stations, 'nbParking', Biximap.discreteColor, map),
        i;
    // Delete all the old markers
    // they're indexed by station ID
    for (var id in oldBikeMarkers) {
      oldBikeMarkers[id].setMap(null);
      oldParkingMarkers[id].setMap(null);
    }
    Biximap.state.bikeMarkers = newBikeMarkers;
    Biximap.state.parkingMarkers = newParkingMarkers;
    // Only show the appropriate markers
    for (id in newParkingMarkers) {
      if (Biximap.state.markertype === 'parking') {
        newBikeMarkers[id].setVisible(false);
      } else {
        newParkingMarkers[id].setVisible(false);
      }
    }
  };

/****************************************************
 * Legend, search, and bike parking toggle controls *
 ****************************************************/

  // Control for the legend
  Biximap.LegendControl = function() {
    var legendDiv = $('<table id="legend"> <tr> <td bgcolor="black" width=15>  </td> <td> 0 bikes </td> </tr> <tr> <td bgcolor="red" width=15>  </td> <td> 1-2 bikes </td> </tr> <tr> <td bgcolor="#FFB900" width=15>  </td> <td> 3-6 bikes </td> </tr> <tr> <td bgcolor="#20C900" width=15>  </td> <td> 7+ bikes </td> </tr> </table>')[0];
    this.control = legendDiv;
    this.control.index = 2;
  };

  // Control for the bike/parking toggle
  Biximap.BikeParkingToggle = function() {
    var self = this;
    this.showBikesButton = $('<div class="bikeparking-button"> Show bikes </div>')[0];
    this.showParkingButton = $('<div class="bikeparking-button"> Show parking </div>')[0];
    this.control = $('<div>').append(this.showBikesButton)
                             .append(this.showParkingButton)[0];
    this.control.index = 2;
    google.maps.event.addDomListener(this.showBikesButton, "click", this.activateBikesCallback());
    google.maps.event.addDomListener(this.showParkingButton, "click", this.activateParkingCallback());
    // Set 'bikes' active, to start
    this.activateBikesCallback().call(this);
  };

  Biximap.BikeParkingToggle.prototype.activateBikesCallback = function() {
    var self = this;
    return function() {
      if (Biximap.state.markertype === 'bike') {
        // Nothing to do
        return;
      }
      // Update the toggle control
      $(self.showBikesButton).addClass('active');
      $(self.showParkingButton).removeClass('active');
      // Set the state
      Biximap.state.markertype = 'bike';
      // Flip the visibility state of all the markers
      for (var id in Biximap.state.bikeMarkers) {
        Biximap.state.bikeMarkers[id].setVisible(true);
        Biximap.state.parkingMarkers[id].setVisible(false);
      }
      // Update the legend
      $('#legend td').each(function () {
        var oldText = $(this).text();
        $(this).text(oldText.replace('parking spots', 'bikes'));
      });
    };
  };

  Biximap.BikeParkingToggle.prototype.activateParkingCallback = function() {
    var self = this;
    return function() {
      if (Biximap.state.markertype === 'parking') {
        // Nothing to do
        return;
      }
      // Update the toggle control
      $(self.showBikesButton).removeClass('active');
      $(self.showParkingButton).addClass('active');
      // Set the state
      Biximap.state.markertype = 'parking';
      // Flip the visibility state of all the markers
      for (var id in Biximap.state.parkingMarkers) {
        Biximap.state.bikeMarkers[id].setVisible(false);
        Biximap.state.parkingMarkers[id].setVisible(true);
      }
      // Update the legend
      $('#legend td').each(function () {
        var oldText = $(this).text();
        $(this).text(oldText.replace('bikes', 'parking spots'));
      });
    };
  };

/***************************************** 
* Functions to make Google Maps markers  *
******************************************/

   /*
    * Parameters:
    *    stations: list of all the station
    *    imagecreator: a function that creates marker images
    *    toggle: gets passed to imagecreator. 'nbBikes'/'nbEmptyDocks'
    *    map: the Google map to attach markers to
    */
  Biximap.createMarkers = function (stations, toggle, imagecreator, map) {
    var markers = {};
    for (var id in stations) {
      markers[id] = Biximap.createMarker(stations[id], toggle, imagecreator, map);
    }
    Biximap.state.tooltip = Biximap.state.tooltip || new Biximap.Tooltip({
      map: map,
      marker: markers[1],
      cssClass: 'tooltip'
    });
    return markers;
  };

  Biximap.createMarker = function(station, toggle, imagecreator, map) {
    // Configuration for marker
    var iconSize = new google.maps.Size(20,32), 
        iconAnchor = new google.maps.Point(10,32), 
        infoWindowAnchor = new google.maps.Point(10,3), 
        image = imagecreator(station, toggle, map),
        marker = new google.maps.Marker({
          size: iconSize, 
          anchor: iconAnchor,
          icon: image,
          map: map,
          position: new google.maps.LatLng(station.latitude, station.longitude) 
        });

    // Add callback to show tooltip on mouseover
    google.maps.event.addListener(marker, "mouseover", function() {
      // Calculate the visualization of the bikes/parking spotes
      var heading = "<b>" + station.name + "</b> <br>" + station.nbBikes + " bikes" + ", " + station.nbEmptyDocks + " parking spots";
      var drawing = Biximap.bikesVisualization(station);
      // We just use one tooltip and update it as necessary
      Biximap.state.tooltip.updateOptions({marker: marker, content: heading + "<br>" + drawing});
      Biximap.state.tooltip.show();
    });
    // Add callback to hide tooltip on mouseout
    google.maps.event.addListener(marker, "mouseout", function() {
      Biximap.state.tooltip.hide();
    });
    return marker;
  };


  // Calculate visualization for a station
  Biximap.bikesVisualization = function(station) {
    var bikebox = "<span class='bike'>&nbsp;</span> ",
        parking = "<span class='parking'>&nbsp;</span> ",
        html = "",
        i;
    for (i = 0; i < station.nbBikes; i++) {
      html += bikebox;
    }
    for (i = 0; i < station.nbEmptyDocks; i++) {
      html += parking;
    }
    return html;
  };

  /*****************************************************
   * Tooltip class. Extends google.maps.OverlayView()    
   * Provides the tooltip popup describing each station  
   ***************************************************/
  Biximap.Tooltip = function(options) {
    this.div_ = document.createElement('DIV');
    this.updateOptions(options);
    this.setMap(this.map_);
  };
  Biximap.Tooltip.prototype = new google.maps.OverlayView();
  Biximap.Tooltip.prototype.updateOptions = function(options) {
    this.marker_ = options.marker || this.marker_;
    this.content_ = options.content || this.content_;
    this.map_ = options.map || this.map_;
    this.cssClass_ = options.cssClass||this.cssClass_;
    this.updateDiv();
  };

  Biximap.Tooltip.prototype.updateDiv = function() {
    var div = this.div_;
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
  };
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
    var leftBorder = ne.x,
        topBorder = ne.y,
        actualLeft,
        actualTop,
        amountToFix;

    div.style.left = leftBorder + 'px';
    div.style.top = topBorder + 'px';
    // Adjust the offset if it's outside the window's borders
    actualLeft = $(div).offset().left;
    if (actualLeft + $(div).width() > $(window).width()) {
      amountToFix = actualLeft + $(div).width() - $(window).width();
      leftBorder -= amountToFix;
      div.style.left = leftBorder + 'px';
    }
    actualTop = $(div).offset().top;
    if (actualTop + $(div).height() > 0.95 * $(window).height()) {
      amountToFix = actualTop + $(div).height() - 0.95 * $(window).height();
      topBorder -= amountToFix;
      div.style.top = topBorder + 'px';
    }
  };
  // We here implement onRemove
  Biximap.Tooltip.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
  };
  // Note that the visibility property must be a string enclosed in quotes
  Biximap.Tooltip.prototype.hide = function() {
    if (this.div_) {
      this.div_.style.visibility = "hidden";
    }
  };
  Biximap.Tooltip.prototype.show = function() {
    this.draw();
    if (this.div_) {
      this.div_.style.visibility = "visible";
    }
  };

  /********************************************
   * Helper functions for the search widget
   ********************************************/

  Biximap.makeShadow = function(id, stations) {
    // makes a shadow for station with id 
    // create the icon
    var baseIcon = new GIcon(),
        icon,
        point,
        marker;
    baseIcon.iconSize = new GSize(20,32); 
    baseIcon.iconAnchor = new GPoint(5,32); 
    baseIcon.infoWindowAnchor = new GPoint(10,3); 
    icon = new GIcon(baseIcon, "http://chart.apis.google.com/chart?chst=d_map_pin_shadow&chld=pin_star|%20|FFFFFF|0000FF|FFFFFF");
    point = new google.maps.LatLng(stations[id].latitude, stations[id].longitude);
    marker = Biximap.createMarker(point, stations[id], 0, function () {return icon;});
    return marker;
  };

  Biximap.findStation = function (map) {
    var stations = Biximap.state.stations,
        text = document.getElementById('search').value,
        latitude,
        longitude;
    for (var id in stations) {
      if (stations[id].name === text) {
        // zoom to this station's location
        latitude = stations[id].latitude;
        longitude = stations[id].longitude;
        map.setCenter(new google.maps.LatLng(latitude, longitude));
        map.setZoom(16);
        // marker = Biximap.state.bikeMarkers[id];
        // marker.setAnimation(google.maps.Animation.BOUNCE);
        // marker = Biximap.state.parkingMarkers[id];
        // marker.setAnimation(google.maps.Animation.BOUNCE);
        break;
      }
    }
  };

  Biximap.highlight = function (value, term) {
    // Strip accents from 'term' for an accents-insensitive search
    term = Biximap.stripAccents(term);

    var value_no_accents = Biximap.stripAccents(value);
    var everything_except_term = value_no_accents.split(new RegExp(term,"gi"));
    var highlighted_value = '';
    var current_position = 0;

    for (var n in everything_except_term) {
      // Get the part with accents, since they were stripped to make the comparisson using RegExp, and add it to the final value
      var part_no_accents = everything_except_term[n];
      var part = value.substr(current_position, part_no_accents.length);  //--- this one with accents!!!
      highlighted_value += part;

      // Add the part length to the current position
      current_position += part.length;

      // If its not the last part, add the accented and highlighted term to the final value
      if (n < everything_except_term.length - 1)
        {
          // Get the term with the original accentuation and add it highlighted to the final value
          var termo_local = value.substr(current_position, term.length);
          highlighted_value += "<strong>" + termo_local + "</strong>";

          // Update the current position
          current_position += term.length;
        }
    }

    return highlighted_value;
  };

  Biximap.stripAccents = function(str) {
    var rExps=[
      {re:/[\xC0-\xC6]/g, ch:'A'},
      {re:/[\xE0-\xE6]/g, ch:'a'},
      {re:/[\xC8-\xCB]/g, ch:'E'},
      {re:/[\xE8-\xEB]/g, ch:'e'},
      {re:/[\xCC-\xCF]/g, ch:'I'},
      {re:/[\xEC-\xEF]/g, ch:'i'},
      {re:/[\xD2-\xD6]/g, ch:'O'},
      {re:/[\xF2-\xF6]/g, ch:'o'},
      {re:/[\xD9-\xDC]/g, ch:'U'},
      {re:/[\xF9-\xFC]/g, ch:'u'},
      {re:/[\xD1]/g, ch:'N'},
      {re:/[\xF1]/g, ch:'n'} ];

      for(var i=0, len=rExps.length; i<len; i++)
      str=str.replace(rExps[i].re, rExps[i].ch);

      return str;
  };

/****************************************
* Helper function to color stations using 
* 4 colours    
****************************************/
  Biximap.discreteColor = function(station, toggle, map) {
    var attribute,
        url,
        color;
    if (toggle === 'nbBikes') {
      attribute = station.nbBikes;
    } else {
      attribute = station.nbEmptyDocks;
    }

    if (attribute < 1) {
      // black
      color = "000000";
    } else if (attribute < 3) {
      // red
      color = "FF0000";
    } else if (attribute < 7) {
      // orange
      color = "FFB900";
    } else {
      // green
      color = "20C900";
    }
    url = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%20|" + color + "|000000";
    console.log(attribute, url);

    var image = new google.maps.MarkerImage(
      url,
      new google.maps.Size(20, 32),
      new google.maps.Point(0,0),
      new google.maps.Point(0, 32)
    );
    return image;
};
})(jQuery);
