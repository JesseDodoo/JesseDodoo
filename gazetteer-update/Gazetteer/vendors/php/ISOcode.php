<?php

    // $covid = './vendors/json/countryBorders.geo.json';
    $jsondata = file_get_contents('../json/countryBorders.geo.json');

    $decode = json_decode($jsondata, true);
    
    $output['data'] = $decode['features'];

    echo json_encode($output);

?>