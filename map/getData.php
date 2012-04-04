<?php
if (time() - filemtime('dataCache.kml') < 3) {
    // can use cached data
    $data =  file_get_contents('dataCache.kml');
} else {
    // get new data
    $data = file_get_contents('https://profil.bixi.ca/data/bikeStations.xml');
    // save it to the cache
    $fh = fopen('dataCache.kml', 'w');
    fwrite($fh, $data);
}

// parse the XML

$document = new DOMDocument();
$document->loadXML($data);
$stationlist = $document->getElementsByTagName("station");
$stnlen = $stationlist->length;
$stations = array();

for ($i=0; $i < $stnlen; $i++) {
    $item = $stationlist->item($i);
//    $item = $item->childNodes;
    $ndlen = $item->length;
//    for ($j=0; $j < $ndlen; $j++) {
//        print $item->item($j)->nodeValue;
//        print("<br>");
//    }

    $name         = $item->getElementsByTagName("name")->item(0)->nodeValue;
    $nbBikes      = $item->getElementsByTagName("nbBikes")->item(0)->nodeValue;
    $nbEmptyDocks = $item->getElementsByTagName("nbEmptyDocks")->item(0)->nodeValue;
    $latitude     = $item->getElementsByTagName("lat")->item(0)->nodeValue;
    $longitude    = $item->getElementsByTagName("long")->item(0)->nodeValue;
    $temporary    = $item->getElementsByTagName("temporary")->item(0)->nodeValue;
    $locked       = $item->getElementsByTagName("locked")->item(0)->nodeValue;
    $installed    = $item->getElementsByTagName("installed")->item(0)->nodeValue;
    $id           = $item->getElementsByTagName("id")->item(0)->nodeValue;

    $stations[$id] = array( 'name' => $name,
                            'nbBikes' => $nbBikes,
                            'nbEmptyDocks' => $nbEmptyDocks,
                            'latitude' => $latitude,
                            'longitude' => $longitude,
                            'temporary' => $temporary,
                            'locked' => $locked,
                            'installed' => $installed,
                            'id' => $id,
    );
}

$displayedStations = array();
if (isset($_GET['stations'])) {
    // restrict the stations
    $ids = explode(',', $_GET['stations']);
    foreach($ids as $id) {
        if (isset($stations[$id])) {
            $displayedStations[$id] = $stations[$id];
        }
    }
} else {
    $displayedStations = $stations;
}
print json_encode($displayedStations);
