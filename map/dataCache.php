<?php
header("Content-type: text/xml"); 
print file_get_contents("https://profil.bixi.ca/data/bikeStations.xml");
?>
