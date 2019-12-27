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
                getCites(city);
                setCityInLS(city);
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
              humidity.textContent = "Relative Humidity: "+weather.list[0].main.humidity+"%";
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
      city.country = city.country.replace(",", " \,");
      cities.push(city);  //set back in LS
      localStorage.setItem("cities", JSON.stringify(cities));
    }

  function getCites(city) {
  var cities;
  if (localStorage.getItem("cities") === null) {
    cities = [];
  } else {
    cities = JSON.parse(localStorage.getItem("cities"));
  }
  cities.push(city);
  console.log(cities);
  //check for and remove duplicate cities by creating a set which will eliminates dupes. then convert back to an array.
  
  cities = removeDupes(cities);
 
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
  
  
    //Create list for other cities
  cities.forEach(function (city) {
    var a = document.createElement("a");

    a.className = "list-group-item list-group-item-action";
    a.setAttribute('data-country', city.country);
    a.setAttribute('href', '#');
    a.appendChild(document.createTextNode(city.name));
    
    ul.appendChild(a);
  })
    //create clear button
    clearBtn.setAttribute('type', "button")
    clearBtn.className = 'btn btn-outline-warning clear';
    clearBtn.textContent = 'Clear History';


  container.appendChild(ul);
  container.appendChild(clearBtn);
  cityClickListener();
}
//ES6 magic used to remove dulicate objects from an array.
function removeDupes(arr) {
  var nameArr = [...(new Set(arr.map(({ name }) => name)))],
      countryArr = [...(new Set(arr.map(({ country }) => country)))];
 return reconstructor(nameArr, countryArr);
}
//Reestablish the original data format after removing duplicates.  
function reconstructor(nameArr, countryArr) {
  var arr = [];
    for (var i = 0; i < nameArr.length; i++) {
      var obj = { name : nameArr[i] , country : countryArr[i]};
      arr.push(obj);
    }
  return arr;
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
    //clear btn
  $('.clear').click(function() { 
    localStorage.clear();
    location.reload();
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