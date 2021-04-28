<?php 

$geocoder = new \OpenCage\Geocoder\Geocoder('e61037e658bd4c169a67a831cc01f84e');
$result = $geocoder->geocode('43.831,4.360'); # latitude,longitude (y,x)
print $result['results'][0]['formatted'];
# 3 Rue de Rivarol, 30020 Nîmes, France
