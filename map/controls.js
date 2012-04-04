/** Legend, search, and toggle controls
 */

function LegendControl(legendDiv) {
    legendDiv.innerHTML = '<table> <tr> <td bgcolor="black" width=15>  </td> <td> 0 parking spots </td> </tr> <tr> <td bgcolor="red" width=15>  </td> <td> 1-2 parking spots </td> </tr> <tr> <td bgcolor="#FFB900" width=15>  </td> <td> 3-6 parking spots </td> </tr> <tr> <td bgcolor="#20C900" width=15>  </td> <td> 7+ parking spots </td> </tr> </table>';
    legendDiv.style.backgroundColor = "white";
    legendDiv.style.border = "2px solid black";
    legendDiv.style.padding = "2px";
    legendDiv.style.textAlign = "center";
    legendDiv.style.cursor = "pointer";
}

// Search control
function SearchControl(searchDiv) {
    searchDiv.innerHTML = '<form onSubmit="findStation(window.map);return false"> <input id="search" size="35"> <input type="button" value="Go" onClick="findStation(window.map);return false"> </form>';
    searchDiv.style.backgroundColor = "white";
    searchDiv.style.border = "1px solid black";
    searchDiv.style.height = "28px";
    searchDiv.style.padding = "3px";
    searchDiv.style.textAlign = "left";
    //    searchDiv.style.width = "10em";
    searchDiv.style.cursor = "pointer";
}



//// Sets the proper CSS for the given button element.
//searchControl.prototype.setButtonStyle_ = function(button) {
//}



function BikeParkingToggle(bikeParkingDiv, bikeMarkers, parkingMarkers, map) {
    map.bikeMarkers = bikeMarkers;
    map.parkingMarkers = parkingMarkers;
    var container = bikeParkingDiv;

    var bikesDiv = document.createElement("div");
    this.setButtonStyle_(bikesDiv);
    container.appendChild(bikesDiv);
    bikesDiv.appendChild(document.createTextNode("Show bikes"));

    var parkingDiv = document.createElement("div");
    this.setButtonStyle_(parkingDiv);
    if (map.markertype == 'bike') {
        bikesDiv.style.backgroundColor = "lightblue";
        parkingDiv.style.backgroundColor = "white";
    } else {
        // bike is default type
        bikesDiv.style.backgroundColor = "white";
        parkingDiv.style.backgroundColor = "lightblue";
        map.markertype = 'parking';
    }
    container.appendChild(parkingDiv);

    google.maps.event.addDomListener(bikesDiv, "click", function() {
            bikesDiv.style.backgroundColor = "lightblue";
            parkingDiv.style.backgroundColor = "white";
            map.markertype = 'bike';
            for (id in map.bikeMarkers) {
            map.bikeMarkers[id].setVisible(true)
            map.parkingMarkers[id].setVisible(false)
            }
            tables = document.getElementsByTagName('td');
            for (var i = 0; i < tables.length; i++) {
            tables[i].innerHTML = tables[i].innerHTML.replace('parking spots', 'bikes');
            }
            });

    parkingDiv.appendChild(document.createTextNode("Show parking"));
    google.maps.event.addDomListener(parkingDiv, "click", function() {
            bikesDiv.style.backgroundColor = "white";
            parkingDiv.style.backgroundColor = "lightblue";
            map.markertype = 'parking';
            for (id in map.parkingMarkers) {
            map.parkingMarkers[id].setVisible(true)
            map.bikeMarkers[id].setVisible(false)
            }
            tables = document.getElementsByTagName('td');
            for (var i = 0; i < tables.length; i++) {
            tables[i].innerHTML = tables[i].innerHTML.replace('bikes', 'parking spots');
            }
            });
}


// Sets the proper CSS for the given button element.
BikeParkingToggle.prototype.setButtonStyle_ = function(button) {
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
