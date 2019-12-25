$(document).ready( function() {

    var geo = navigator.geolocation
        googApiKey = 'AIzaSyCI3zv9mMZuVUPGueGVIYUyD3etz0VJK7I',
        weatherKey = '63df9b45298d8782d0474639d201179f',
        

    function GetUserPosition() {
        geo.getCurrentPosition(function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;

        // url: "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lng+"&appid="+weatherKey+"",
    })};
    // getWeather();
    function getWeather(city) {


       //get location specifics from google first. This will allow for more definite results. Users can misspell input, use state or country OR neither.  They can also use abbreviations.. (e.g. 'philly'), etc. 
       $.ajax({       
               url: "https://maps.googleapis.com/maps/api/geocode/json?address="+city.name+",+"+city.country+"&key="+googApiKey+"",
               method: "GET"
             })
               .then(function(response) {
                 console.log(response);
                 var city = response.results[0].address_components[0].long_name;
                 var country = response.results[0].address_components[2].long_name; 
                 
   
            $.ajax({    //use coordinates to get weather from openweather.
                    url: "http://api.openweathermap.org/data/2.5/forecast?q="+city+","+country+"&APPID="+weatherKey+"",
                    method: "GET"
                })
                    .then(function(weather) {
                        console.log(weather);
                        
                    console.log(city, country);
                    paintWeather(weather)
                 });
                
          })
        
    };

        function paintWeather(weather) {
          var temp = document.querySelector('.temp'),
              location = document.querySelector('.location'),
              description = document.querySelector('.description'),
              high = document.querySelector('.high'),
              humidity = document.querySelector('.humidity'),
              icon = document.querySelector('.icon'),
              wind = document.querySelector('.wind');

              location.textContent = ""+weather.city.name+", "+weather.city.country+"";
              description.textContent = weather.list[0].weather[0].description;
              temp.textContent = convertKelvin(JSON.parse(weather.list[0].main.temp));
              icon.setAttribute('src', "http://openweathermap.org/img/w/"+weather.list[0].weather[0].icon+".png");
         };


    
    //convert kelvin to Fahrenheit and Celcius 
    function convertKelvin (kelvin) {
      var cTemp = Math.round(kelvin-273.15),
          fTemp = Math.round(cTemp*9/5 +32),
          output = `${fTemp}\xB0F  (${cTemp}\xB0C)`;
    return output;
    }

    function setCityInLS(city) {
      var cities;
      if (localStorage.getItem("cities") === null) {
        cities = [];
      } else {
        cities = JSON.parse(localStorage.getItem("cities"));
      }
      cities.push(city);  //set back in LS
      localStorage.setItem("cities", JSON.stringify(cities));
    }

      function getCites(city) {
  var cities;
  if (localStorage.getItem("cities") === null) {
    GetUserPosition();
    cities = [];
    cities.push(city);
  } else {
    cities = JSON.parse(localStorage.getItem("cities"));
  }
  
  document.querySelector("#city-list").textContent = "";  //reset current list
  //generate list
  var container = document.getElementById("city-list"),
    currentCityEl = document.createElement("li"),
    ul = document.createElement("ul");

  ul.className = "list-group";
  //set current city to the active class
  currentCityEl.className = 
  "list-group-item list-group-item-action active";
  console.log(cities);
  
  currentCityEl.appendChild(document.createTextNode(cities[cities.length - 1].name));

  ul.appendChild(currentCityEl);
  for (var i = 0; i < cities.length - 1; i++) {
    //create and append list items
    var li = document.createElement("li");
    li.className = "list-group-item list-group-item-action";
    li.appendChild(document.createTextNode(city));
    ul.appendChild(li);
  }

  container.appendChild(ul);
}


      $('#search-btn').click(function() {
          var city = $(this).siblings('#city-field').val().trim(),
              country = $(this).siblings('#country-field').val().trim();
              city = {
                name : city,
                country : country
              }
              //clear fields
              $(this).siblings('#city-field').val('');
              $(this).siblings('#country-field').val('');
     
      setCityInLS(city);
          getCites(city);
          getWeather(city);
            
      })

    });