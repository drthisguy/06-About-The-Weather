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
                //get and set new city list
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

    var highs = getHighTemps(weather),
        lows = getLowTemps(weather);
      console.log(highs, lows);
      $('.day-1').text(moment().add(1, 'days').format('dddd'));
      $('.day-2').text(moment().add(2, 'days').format('dddd'));
      $('.day-3').text(moment().add(3, 'days').format('dddd'));
      $('.day-4').text(moment().add(4, 'days').format('dddd'));
      $('.day-5').text(moment().add(5, 'days').format('dddd'));
      
      $('.high-1').text('High: '+highs[0]);
      $('.high-2').text('High: '+highs[1]);
      $('.high-3').text('High: '+highs[2]);
      $('.high-4').text('High: '+highs[3]);
      $('.high-5').text('High: '+highs[4]);

      $('.low-1').text('Low: '+lows[0]);
      $('.low-2').text('Low: '+lows[1]);
      $('.low-3').text('Low: '+lows[2]);
      $('.low-4').text('Low: '+lows[3]);
      $('.low-5').text('Low: '+lows[4]);
    }

function getHighTemps(weather) {
  
  var now = new Date(),
  sunTemps = [], monTemps = [], tueTemps = [], wedTemps = [],
  thurTemps = [], friTemps = [], satTemps = [];
      
  weather.list.forEach( function(timeOfDay) {
    var future  = new Date(timeOfDay.dt*1000);
        
    if (future.getDay() !== now.getDay()) {
        switch (future.getDay()) {
          case 0:
            sunTemps.push(timeOfDay.main.temp);
            break;
          case 1:
            monTemps.push(timeOfDay.main.temp);
            break;
          case 2:
            tueTemps.push(timeOfDay.main.temp);
            break;
          case 3:
            wedTemps.push(timeOfDay.main.temp);
            break;
          case 4:
            thurTemps.push(timeOfDay.main.temp);
            break;
          case 5:
            friTemps.push(timeOfDay.main.temp);      
            break;             
          case 6:
            satTemps.push(timeOfDay.main.temp);
        }                
      } 
  });
  var highs = [sunHigh  = Math.max.apply(null, sunTemps),
              monHigh  = Math.max.apply(null, monTemps),
              tueHigh  = Math.max.apply(null, tueTemps),
              wedHigh  = Math.max.apply(null, wedTemps),
              thurHigh  = Math.max.apply(null, thurTemps),
              friHigh  = Math.max.apply(null, friTemps),
              satHigh  = Math.max.apply(null, satTemps)],
              fiveDayHighs = [];
    
      highs.forEach(function(high) {
        if (isFinite(high))
        fiveDayHighs.push(high);
      })
      return fiveDayHighs;
      
  };

  function getLowTemps(weather) {
      
  var now = new Date(),
  sunTemps = [], monTemps = [], tueTemps = [], wedTemps = [],
  thurTemps = [], friTemps = [], satTemps = [];
      
  weather.list.forEach( function(timeOfDay) {
    var future  = new Date(timeOfDay.dt*1000);
        
    if (future.getDay() !== now.getDay()) {
        switch (future.getDay()) {
          case 0:
            sunTemps.push(timeOfDay.main.temp);
            break;
          case 1:
            monTemps.push(timeOfDay.main.temp);
            break;
          case 2:
            tueTemps.push(timeOfDay.main.temp);
            break;
          case 3:
            wedTemps.push(timeOfDay.main.temp);
            break;
          case 4:
            thurTemps.push(timeOfDay.main.temp);
            break;
          case 5:
            friTemps.push(timeOfDay.main.temp);      
            break;             
          case 6:
            satTemps.push(timeOfDay.main.temp);

        }                
      } 
  });
  var lows = [sunHigh  = Math.min.apply(null, sunTemps),
              monHigh  = Math.min.apply(null, monTemps),
              tueHigh  = Math.min.apply(null, tueTemps),
              wedHigh  = Math.min.apply(null, wedTemps),
              thurHigh  = Math.min.apply(null, thurTemps),
              friHigh  = Math.min.apply(null, friTemps),
              satHigh  = Math.min.apply(null, satTemps)],
              fiveDayLows = [];
    
  lows.forEach(function(low) {
    if (isFinite(low))
    fiveDayLows.push(low);
  })
  return fiveDayLows;   
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
      cities.push(city); 
      //check for and remove duplicate cities.
      cities = removeDupes(cities);
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

  document.querySelector("#city-list").textContent = "";  //reset current list
  //generate new list
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
    if (city.name !== currentCityEl.textContent){
    ul.appendChild(a);
    }
  });
    //create clear button
    clearBtn.setAttribute('type', "button")
    clearBtn.className = 'btn btn-outline-warning clear';
    clearBtn.textContent = 'Clear History';


  container.appendChild(ul);
  container.appendChild(clearBtn);
  cityClickListener();
}

function removeDupes(arr) {
//ES6 magic used to remove dulicate objects from the array.
  var nameArr = [...(new Set(arr.map(({ name }) => name)))],
      countryArr = [...(new Set(arr.map(({ country }) => country)))],
      purgedArray = [];
 
//Reestablish the original object format from the data sets.  
    for (var i = 0; i < nameArr.length; i++) {
      var obj = { name : nameArr[i] , country : countryArr[i]};
      purgedArray.push(obj);
    }
  return purgedArray;
 };

 //event listener for city list
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
    //clear btn~
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