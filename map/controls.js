/** Legend, search, and toggle controls
 */

Biximap.LegendControl = function() {
    var legendDiv = $('<table id="legend"> <tr> <td bgcolor="black" width=15>  </td> <td> 0 bikes </td> </tr> <tr> <td bgcolor="red" width=15>  </td> <td> 1-2 bikes </td> </tr> <tr> <td bgcolor="#FFB900" width=15>  </td> <td> 3-6 bikes </td> </tr> <tr> <td bgcolor="#20C900" width=15>  </td> <td> 7+ bikes </td> </tr> </table>')[0];
    this.control = legendDiv;
}

Biximap.BikeParkingToggle = function() {
  var self = this;
  this.showBikesButton = $('<div class="bikeparking-button"> Show bikes </div>')[0];
  this.showParkingButton = $('<div class="bikeparking-button"> Show parking </div>')[0];
  this.control = $('<div>').append(this.showBikesButton)
                         .append(this.showParkingButton)[0];
  google.maps.event.addDomListener(this.showBikesButton, "click", this.activateBikesCallback());
  google.maps.event.addDomListener(this.showParkingButton, "click", this.activateParkingCallback());
  // Set 'bikes' active, to start
  this.activateBikesCallback().call(this);
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
    $('#legend td').each(function () {
      oldText = $(this).text();
      $(this).text(oldText.replace('parking spots', 'bikes'));
    });
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
