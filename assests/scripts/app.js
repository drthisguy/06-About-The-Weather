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
                 city.name = response.results[0].formatted_address;
                 city.country = response.results[0].address_components[response.results[0].address_components.length - 1].long_name; 

                 
                console.log(city.name, city.country);
                
            $.ajax({   
                    url: "http://api.openweathermap.org/data/2.5/forecast?q="+city.name+","+city.country+"&APPID="+weatherKey+"",
                    method: "GET"
                })
                    .then(function(weather) {
                        console.log(weather);
                    
                    paintWeather(weather);
                 });
                //set and get new city list
                setCityInLS(city);
                getCites(city);
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
      //replace the commas in response date before json stringifying
      city.name = city.name.replace(",", " \,");
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
  console.log(cities);

  //check for and remove duplicate cities
  for (var i = 0; i < cities.length - 1; i++) {
    if (cities[i].name == city.name) {
      cities.splice(i, 1);  
      console.log(cities[i].name, city.name);
      
    } 
  }
    
  
   
  
  console.log(cities);

  document.querySelector("#city-list").textContent = "";  //reset current list
  //generate list
  var container = document.getElementById("city-list"),
    currentCityEl = document.createElement("li"),
    clearBtn = document.createElement("button"),
    ul = document.createElement("ul");

  ul.className = "list-group";
  
   //set current city to the active class and append.
   currentCityEl.className = 
   "list-group-item list-group-item-action active mt-4";  
   currentCityEl.appendChild(document.createTextNode(cities[cities.length - 1].name));
   ul.appendChild(currentCityEl);
  
  //create clear button
  clearBtn.setAttribute('type', "button")
  clearBtn.className = 'btn btn-outline-warning';
  clearBtn.textContent = 'Clear History';

    //check for and remove duplicate cities
  for (var i = cities.length - 1; i >= 0; i--) {
    var a = document.createElement("a");
        
    a.className = "list-group-item list-group-item-action";
    a.setAttribute('data-country', cities[i].country);
    a.setAttribute('href', '#');
    a.appendChild(document.createTextNode(cities[i].name));
    
    ul.appendChild(a);
  }

  container.appendChild(ul);
  container.appendChild(clearBtn);
  cityClickListener();
}

function findDupes(arr) {
  var filtered = [];
    for (var i = 0; i < arr.length; i++) {
      var current = i,
          first = arr.indexOf(arr[i]);
      if (current !== first) {
        filtered.push(arr[i]);
      } }
    return filtered;
 };
function cityClickListener() {
    
      var listItems = document.querySelectorAll(".list-group-item");
    
      listItems.forEach(function (city) {
        city.addEventListener("click", function (event) {
          var click = event.currentTarget,
              cityObj = {
              name : click.textContent,
              country : click.getAttribute('data-country')
              } 
            getWeather(cityObj);
          })
        });
       };


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
  
        getWeather(city);
          
    })

    });