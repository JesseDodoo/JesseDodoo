<?php

include("openCage.php");
include("openweathermap.php");


$main = $openweather_response;

// $main["currency_rate"] = $rate;
// $main["news"] = $news_response;
$main["timezone"] = $geonames_response_timezone;

echo json_encode($main);