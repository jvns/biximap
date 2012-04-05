/** Legend, search, and toggle controls
 */

Biximap.LegendControl = function() {
    var legendDiv = document.createElement('div');
    legendDiv.innerHTML = '<table> <tr> <td bgcolor="black" width=15>  </td> <td> 0 parking spots </td> </tr> <tr> <td bgcolor="red" width=15>  </td> <td> 1-2 parking spots </td> </tr> <tr> <td bgcolor="#FFB900" width=15>  </td> <td> 3-6 parking spots </td> </tr> <tr> <td bgcolor="#20C900" width=15>  </td> <td> 7+ parking spots </td> </tr> </table>';
    legendDiv.style.backgroundColor = "white";
    legendDiv.style.border = "2px solid black";
    legendDiv.style.padding = "2px";
    legendDiv.style.textAlign = "center";
    legendDiv.style.cursor = "pointer";
    this.control = legendDiv;
}

// Search control
Biximap.SearchControl = function() {
    var searchDiv = document.createElement('div');
    searchDiv.innerHTML = '<form onSubmit="Biximap.findStation(Biximap.state.map);return false"> <input id="search" size="35"> <input type="button" value="Go" onClick="Biximap.findStation(Biximap.state.map);return false"> </form>';
    searchDiv.style.backgroundColor = "white";
    searchDiv.style.border = "1px solid black";
    searchDiv.style.height = "28px";
    searchDiv.style.padding = "3px";
    searchDiv.style.textAlign = "left";
    //    searchDiv.style.width = "10em";
    searchDiv.style.cursor = "pointer";
    this.control = searchDiv;
}

Biximap.BikeParkingToggle = function() {
  var self = this;
  this.showBikesButton = $('<div class="bikeparking-button"> Show bikes </div>')[0];
  this.showParkingButton = $('<div class="bikeparking-button"> Show parking </div>')[0];
  this.control = $('<div>').append(this.showBikesButton)
                         .append(this.showParkingButton)[0];
  // Set 'parking' active, to start
  this.activateBikesCallback().call(this);
  google.maps.event.addDomListener(this.showBikesButton, "click", this.activateBikesCallback());
  google.maps.event.addDomListener(this.showParkingButton, "click", this.activateParkingCallback());
}


Biximap.BikeParkingToggle.prototype.activateBikesCallback = function() {
  var self = this;
  return function() {
    if (Biximap.state.markertype === 'bike') {
      return;
    }
    $(self.showBikesButton).addClass('active');
    $(self.showParkingButton).removeClass('active');
    Biximap.state.markertype = 'bike';
    for (id in Biximap.state.bikeMarkers) {
      Biximap.state.bikeMarkers[id].setVisible(true)
      Biximap.state.parkingMarkers[id].setVisible(false)
    }
    var tables = document.getElementsByTagName('td');
    for (var i = 0; i < tables.length; i++) {
      tables[i].innerHTML = tables[i].innerHTML.replace('parking spots', 'bikes');
    }
  };
}

Biximap.BikeParkingToggle.prototype.activateParkingCallback = function() {
  var self = this;
  return function() {
    if (Biximap.state.markertype === 'parking') {
      return;
    }
    $(self.showBikesButton).removeClass('active');
    $(self.showParkingButton).addClass('active');
    Biximap.state.markertype = 'parking';
    for (id in Biximap.state.parkingMarkers) {
      Biximap.state.bikeMarkers[id].setVisible(false)
      Biximap.state.parkingMarkers[id].setVisible(true)
    }
    var tables = document.getElementsByTagName('td');
    for (var i = 0; i < tables.length; i++) {
      tables[i].innerHTML = tables[i].innerHTML.replace('bikes', 'parking spots');
    }
  };
}
