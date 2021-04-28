<?php

include("openCage.php");


$main = array_merge($opencage_response, $geonames_response);


$main["lat"] = $lat;
$main["lon"] = $lon;
$main["formatted"] = $formatted;
if (isset($currency_name)) {
    $main["currency_name"] = $currency_name;
}


echo json_encode($main);