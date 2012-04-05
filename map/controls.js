/** Legend, search, and toggle controls
 */

APP.LegendControl = function() {
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
APP.SearchControl = function() {
    var searchDiv = document.createElement('div');
    searchDiv.innerHTML = '<form onSubmit="APP.findStation(APP.state.map);return false"> <input id="search" size="35"> <input type="button" value="Go" onClick="APP.findStation(APP.state.map);return false"> </form>';
    searchDiv.style.backgroundColor = "white";
    searchDiv.style.border = "1px solid black";
    searchDiv.style.height = "28px";
    searchDiv.style.padding = "3px";
    searchDiv.style.textAlign = "left";
    //    searchDiv.style.width = "10em";
    searchDiv.style.cursor = "pointer";
    this.control = searchDiv;
}

APP.BikeParkingToggle = function() {
  var self = this;
  this.showBikesButton = $('<div> Show Bikes </div>')[0];
  this.showParkingButton = $('<div> Show Parking </div>')[0];
  this.control = $('<div>').append(this.showBikesButton)
                         .append(this.showParkingButton)[0];
  this.setButtonStyle_(this.showBikesButton);
  this.setButtonStyle_(this.showParkingButton);
  if (APP.markertype == 'bike') {
    this.showBikesButton.style.backgroundColor = "lightblue";
    this.showParkingButton.style.backgroundColor = "white";
  } else {
    APP.markertype = 'parking';
    this.showBikesButton.style.backgroundColor = "white";
    this.showParkingButton.style.backgroundColor = "lightblue";
  }
  google.maps.event.addDomListener(this.showBikesButton, "click", this.activateBikesCallback());
  google.maps.event.addDomListener(this.showParkingButton, "click", this.activateParkingCallback());
}


// Sets the proper CSS for the given button element.
APP.BikeParkingToggle.prototype.setButtonStyle_ = function(button) {
  button.style.textDecoration = "underline";
  button.style.color = "#000000";
  button.style.backgroundColor = "white";
  button.style.font = "small Arial";
  button.style.border = "1px solid black";
  button.style.padding = "2px";
  button.style.marginBottom = "3px";
  button.style.textAlign = "center";
  button.style.width = "6em";
  button.style.cursor = "pointer";
}

APP.BikeParkingToggle.prototype.activateBikesCallback = function() {
  var self = this;
  return function() {
    if (self.markertype === 'bike') {
      return;
    }
    self.showBikesButton.style.backgroundColor = "lightblue";
    self.showParkingButton.style.backgroundColor = "white";
    self.markertype = 'bike';
    for (id in APP.state.bikeMarkers) {
      APP.state.bikeMarkers[id].setVisible(true)
      APP.state.parkingMarkers[id].setVisible(false)
    }
    var tables = document.getElementsByTagName('td');
    for (var i = 0; i < tables.length; i++) {
      tables[i].innerHTML = tables[i].innerHTML.replace('parking spots', 'bikes');
    }
  };
}

APP.BikeParkingToggle.prototype.activateParkingCallback = function() {
  var self = this;
  return function() {
    if (self.markertype === 'parking') {
      return;
    }
    self.showBikesButton.style.backgroundColor = "white";
    self.showParkingButton.style.backgroundColor = "lightblue";
    self.markertype = 'parking';
    for (id in APP.state.parkingMarkers) {
      APP.state.bikeMarkers[id].setVisible(false)
      APP.state.parkingMarkers[id].setVisible(true)
    }
    var tables = document.getElementsByTagName('td');
    for (var i = 0; i < tables.length; i++) {
      tables[i].innerHTML = tables[i].innerHTML.replace('bikes', 'parking spots');
    }
  };
}
