<?php
  $executionStartTime = microtime(true) / 1000;
 
 $url='https://restcountries.eu/rest/v2/alpha?codes=' . $_REQUEST['countryCode'];

 $ch = curl_init();
 curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
 curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
 curl_setopt($ch, CURLOPT_URL,$url);

 $resultCountryInfo = curl_exec($ch);
  $decode = json_decode($resultCountryInfo,true);
  

  curl_close($ch);

 $output['status']['code'] = "200";
 $output['status']['name'] = "ok";
 $output['status']['description'] = "mission saved";
 $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
 $output['data'] = $decode;

 header('Content-Type: application/json; charset=UTF-8');
 
 echo json_encode($output); 
  ?>