let countrySelected = null;
let countrySelectedOutline = null;
let countryWeather = null;
let countryLat = null;
let countryLng = null;
let countryObject = null;
let marker = null;
let markers = null;
let north = null;
let south = null;
let west = null;
let east = null;

////SETUP
$(document).ready(function () {
  ///Create picklist opf countries with value as ISO_A2 (e.g. "BA" - Bahamas)
  $.ajax({
    url: "./vendors/php/ISOCode.php",
    type: "GET",
    dataType: "json",

    success: function (result) {
      let countryArray = result["data"];
      countryArray.sort((a, b) =>
        a.properties.name > b.properties.name
          ? 1
          : a.properties.name < b.properties.name
          ? -1
          : 0
      );
      countryArray.forEach((element) => {
        $("#selCountry").append(
          $("<option>", {
            value: `${element["properties"]["iso_a2"]}`,
            text: `${element["properties"]["name"]}`,
          })
        );
      });
    },
  });

  ///Get users long and lat to display address
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      ///pass lon lat into function to return address
      geocode(lat + ", " + lon);
    });
  }
});

////ON PICKLIST CHANGE
$("#reset").on("click", function () {
  map.closePopup();
  if (countrySelectedOutline != null) {
    map.removeLayer(countrySelectedOutline);
  }
  map.setView([34.0, -111.8], 3);
  $("#sidebar").hide();
});
////ON PICKLIST CHANGE
$("#selCountry").on("change", function () {
  //country Info

  ///Remove outline if exists
  if (countrySelectedOutline != null) {
    map.removeLayer(countrySelectedOutline);
  }

  ///e.g. BA (Bahamas)
  let isoA2 = this.value;

  ///get long/lat of selected country
  let selectedCountry = geojson.find((o) => o.properties.iso_a2 === isoA2);
  console.log("selectedCountry", selectedCountry);

  ///define outline so it can be removed on change
  countrySelectedOutline = L.geoJSON(selectedCountry);
  countrySelectedOutline.addTo(map);

  

  //Country information
  $.ajax({
    url: "./vendors/php/CountryInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      country: isoA2,
    },
    success: function (result) {
      if (!result.data) {
        countrySelected = null;
        console.log("No data found for this country");
        return;
      }

      if (result.status.name == "ok") {
        let countryObject = result.data[0];

    north = countryObject.north
  south = countryObject.south
   east = countryObject.east
 west = countryObject.west

 console.log([north, south, east, west]);
        
        countrySelected = countryObject.countryName;

        console.log(countrySelected);

        $(".sidebar-title").html(countryObject.countryName);
        let countryHTML = `
                <li>Capital: ${countryObject["capital"]}</li>
                <li>Population: ${countryObject["population"]}</li>
                <li>Continent: ${countryObject["continentName"]}</li>
                </ul>`;

         let moreCountryInfo = `
                <li>Area in SqKm: ${countryObject["areaInSqKm"]}</li>
                <li>Country Code: ${countryObject["countryCode"]}</li>
                <li>Languages: ${countryObject["languages"]}</li>
                </ul>`;

        $("#countryInfo2").html(moreCountryInfo);

        let corner1 = L.latLng(countryObject.north, countryObject.west);
        let corner2 = L.latLng(countryObject.south, countryObject.east);
        let bounds = L.latLngBounds(corner1, corner2);

        map.flyToBounds(bounds);

        getCountryFlagAndSetModal(countryObject, countryHTML);
        capitalCities();
        $("#sidebar").show();
      }

    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error, please try again");
    },

  });
  

  
});

//ON SELECT OF COVID TAB
$("#covid").click(function () {
  $("#covidInfo").toggle()
  

  $.ajax({
    url: "./vendors/php/Covid.php",
    type: "GET",
    dataType: "json",
    data: {
      LATEST: $("#selCountry").val(),
    },

    success: function (result) {
      console.log(result);

      const countryInfo = result.data.find(
        (country) => country.country === countrySelected
      );
      
      console.log(countryInfo);

      // we couldn't find the country
      if (!countryInfo) {
        const noResults =  `<div ".covidModal"  tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title" >No Results</h2>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
          <p>Could not find Coronavirus information for ${countrySelected}.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;

        $("#covidInfo").html(noResults);
                
      }

      if (result.status.name == "ok") {
        const covidHTML = `<div ".covidModal" "tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Latest Covid update for ${countrySelected}:</h2>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
      <ul>
              <li> Infected: ${countryInfo["infected"]}</li>
              <li> Tested: ${countryInfo["tested"]}</li>
              <li> Deceased: ${countryInfo["deceased"]}</li>
              <li> Recovered: ${countryInfo["recovered"]}</li>
              <ul>
              <br>
              <h6>Information correct as of ${countryInfo["lastUpdatedApify"]}</h6>
      </ul>
      </div>
      <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;

        $("#covidInfo").html(covidHTML);
        
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error, please try again");
    },
  });
});


$("#weather").click(function () {
  $("#weatherInfo").toggle();

  $.ajax({
    url: "./vendors/php/Weather.php",
    type: "GET",
    dataType: "json",
    data: {
      lat: countryLat,
      lng: countryLng,
    },
    success: function (result) {
      console.log(result);

      if (result.status.name == "ok") {
        const weatherInfo = result.data.current.weather[0];
        console.log(weatherInfo);

        $("#weatherInfo").html("");

        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const date = new Date(result.data.daily[0].dt * 1000);
        const dayOFWeek = days[date.getDay()];
        const icon = result.data.daily[0].weather[0].icon;
        const title = result.data.daily[0].weather[0].main;
        const description = result.data.daily[0].weather[0].description;
        const tempDay = result.data.daily[0].temp.day;
        const tempEve = result.data.daily[0].temp.eve;
        const tempMax = result.data.daily[0].temp.max;
        const tempMin = result.data.daily[0].temp.min;
        const humidity = result.data.daily[0].humidity;
        const cloudiness = result.data.daily[0].clouds;
        const pressure = result.data.daily[0].pressure;
        const windSpeed = result.data.daily[0].wind_speed;
        const rainProb = result.data.daily[0].pop;

        const modal =   `<div class= "modal-dialog-scrollable" ".weatherModal" tabindex="-1" role="dialog">
        <div class= "modal-dialog" role="document">
          <div class="modal-content" >
            <div class="modal-header">
            <h4 class="text-info" class="modal-title">${dayOFWeek}</h4>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <img src="http://openweathermap.org/img/wn/${icon}.png" class="card-img-top" alt="icon-weather" style="height: 100px; width: 100px;"></img>
            <div class="modal-body">
                          <h5 class="card-title text-secondary  ">${title}</h5>
                          <h6 class="card-title text-info font-weight-light text-capitalize font-italic">${description}</h6>
                          <ul class="list-group list-group-flush">
                          <li class="list-group-item "><i class="fas fa-temperature-low text-warning font-weight-bold"></i> Max: ${tempMax} &#8451</i></li>
                                  <li class="list-group-item "><i class="fas fa-temperature-low text-warning font-weight-bold"></i> Min: ${tempMin} &#8451</li>
                                  <li class="list-group-item "><i class="fas fa-temperature-low text-warning font-weight-bold"></i> Day: ${tempDay} &#8451</li>
                                  <li class="list-group-item "><i class="fas fa-temperature-low text-warning font-weight-bold"></i> Evening: ${tempEve} &#8451</li>
                                  <li class="list-group-item ">Humidity: ${humidity}%</li>
                                  <li class="list-group-item ">Cloudiness: ${cloudiness}%</li>
                                  <li class="list-group-item ">Wind Speed: ${windSpeed} m/s</li>
                                  <li class="list-group-item ">Pressure: ${pressure} hPa</li>
                                  <li class="list-group-item ">Prob Rain: ${rainProb}%</li>
                            </ul>
              
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>`;

        $("#weatherInfo").append(modal);
      }
      
    },
  });
});

$("#news").click(function () {
  $("#newsInfo").toggle();
  
  $.ajax({
    url: "./vendors/php/news.php",
    type: "GET",
    dataType: "json",
    data: {
      country: $("#selCountry").val(),
    },

    success: function (result) {
      console.log(result);
       $("#newsInfo").html("");

      if (result.data.articles <= 0) {
        const noNews = `
        <div ".newsModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
      <div class="modal-content">
      <div class="modal-header">
      <h2 class="text-info">No results</h2>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
        <div class="modal-body">
                <p class="text-info">Could not find news articles for ${countrySelected}.</p>
        </div>
        <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
              </div>`;
        $("#newsInfo").html(noNews);
      }

      if (result.status.name == "ok") {
        const newsData = result.data.articles[0];

        const newsSource = newsData["source"]["name"];
        const newsLink = newsData["url"];
        const description = newsData["description"];
        const title = newsData["title"];
        const newsImg = newsData["urlToImage"];

        $("#newsInfo").html("");

        const newsHTML = `<div ".newsModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
      <a href="${newsLink}" target="blank"><img src="${newsImg}" class="modal-title" class="mr-3 mb-5 rounded d-none d-md-block" alt="Image Article" width="300px"></a>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
      <a href="${newsLink}" target="blank" class="text-decoration-none"><h5 class="text-dark mt-0 mb-3">${title}</h5></a>
      <p>${description}</p>
          <p>by ${newsSource}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;
        
        $("#newsInfo").append(newsHTML);
      }
    },

    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error, please try again");
    },
  });
});




//HELPER//
function geocode(query) {
  $.ajax({
    url: "https://api.opencagedata.com/geocode/v1/json",
    method: "GET",
    data: {
      key: "e61037e658bd4c169a67a831cc01f84e",
      q: query,
      no_annotations: 1,
    },
    dataType: "json",
    statusCode: {
      200: function (response) {
        console.log(response.results[0].formatted);
        $("#yourAddress").html(response.results[0].formatted);
        
      },
      402: function () {
        console.log("hit free trial daily limit");
        console.log("become a customer: https://opencagedata.com/pricing");
      },
    },
  });
}

function capitalCities(){
  $.ajax({
    url: "./vendors/php/cities.php",
    type: "GET",
    dataType: "json",
    data: {
      north: north,
      south: south,
      east: east,
      west: west
      
    },
    success: function (result) {
      console.log(result);
    
    if (result.status.name == "ok") {

        const cityData = result.data;
        console.log(cityData);

        const capitalCity = result.data['0'];
        console.log(capitalCity);
   
        const capitalCityIcon = L.icon({
          iconUrl: "./images/capitalCityIcon.png", 
          iconSize: [30, 40],
          iconAnchor: [9, 5],
        
        });
  
     markers = new L.layerGroup(); 

     const markerIcon = L.icon({
      iconUrl: "./images/markerIcon.png", 
      iconSize: [15, 25],
      iconAnchor: [9, 5],
       
    });

    
    if (markers) {
      map.removeLayer(markers); 
  }

      for(var i = 1; i < cityData.length; i++) {

        if(capitalCity) {
          const cityMarker = new L.marker([capitalCity["lat"], capitalCity["lng"]], {icon: capitalCityIcon})
          .bindPopup(capitalCity["name"] + ", population: " + capitalCity["population"]).addTo(markers);
          markers.addTo(map);
        }
        
   marker = L.marker([cityData[i]["lat"], cityData[i]["lng"]], {icon: markerIcon})
   .bindPopup(cityData[i]["name"] + ", <br> For more info click " + `<a href="${cityData[i]["wikipedia"]}">${cityData[i]["name"]}</a>`).addTo(markers);
   markers.addTo(map);
        
    }
  
  }

}
  });
}

function getCountryFlagAndSetModal(countryObject, countryHTML) {
  $.ajax({
    url: "./vendors/php/restCountries.php",
    type: "POST",
    dataType: "json",
    data: {
      countryCode: $("#selCountry").val(),
    },

    success: function (result) {
      const countryData = result.data;

      const countryFlag = countryData.find(
        (country) => country.name === countryObject.countryName
      );

      // if no flag available
      if (!countryFlag) {
        console.log("No flag found for " + countryObject.countryName);
      }

      if (result.status.name == "ok") {
        const flagResults = `<img class="national-flag" src='${countryData[0]["flag"]}' alt='${countryData[0]["name"]}'s national flag'>`;

        countryLat = countryData[0].latlng[0];
        countryLng = countryData[0].latlng[1];

        $("#flag").html(flagResults);

        L.popup()
          .setLatLng([countryLat, countryLng])
          .setContent(
            `<h1>${countryObject.countryName}</h1>` + countryHTML + flagResults
          )
          .openOn(map);
      }
    },
  });
}
