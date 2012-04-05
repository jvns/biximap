Biximap.makeShadow = function(id, stations) {
    // makes a shadow for station with id 
    // create the icon
    var baseIcon = new GIcon();
    baseIcon.iconSize=new GSize(20,32); 
    baseIcon.iconAnchor=new GPoint(5,32); 
    baseIcon.infoWindowAnchor=new GPoint(10,3); 
    var icon = new GIcon(baseIcon, "http://chart.apis.google.com/chart?chst=d_map_pin_shadow&chld=pin_star|%20|FFFFFF|0000FF|FFFFFF");

    var point = new google.maps.LatLng(stations[id]['latitude'], stations[id]['longitude']);
    var marker = createMarker(point, stations[id], 0, function () {return icon});
    return marker;
}
Biximap.findStation = function (map) {
  var stations = Biximap.state.stations;
  var text = document.getElementById('search').value;
  for (id in stations) {
    if (stations[id]['name'] == text) {
      // zoom to this station's location
      latitude = stations[id]['latitude'];
      longitude = stations[id]['longitude'];
      map.setCenter(new google.maps.LatLng(latitude, longitude));
      map.setZoom(16);
      marker = Biximap.state.bikeMarkers[id];
      marker.setAnimation(google.maps.Animation.BOUNCE);
      marker = Biximap.state.parkingMarkers[id];
      marker.setAnimation(google.maps.Animation.BOUNCE);
      break;
    }
  }
}
Biximap.highlight = function(value, term) {
    // Strip accents from 'term' for an accents-insensitive search
    term = stripAccents(term);

    var value_no_accents = stripAccents(value);
    var everything_except_term = value_no_accents.split(new RegExp(term,"gi"));
    var highlighted_value = '';
    var current_position = 0;

    for (var n in everything_except_term)
    {
        // Get the part with accents, since they were stripped to make the comparisson using RegExp, and add it to the final value
        var part_no_accents = everything_except_term[n];
        var part = value.substr(current_position, part_no_accents.length);  //--- this one with accents!!!
        highlighted_value += part;

        // Add the part length to the current position
        current_position += part.length;

        // If its not the last part, add the accented and highlighted  term to the final value
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
}

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
}
