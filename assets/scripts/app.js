$(document).ready( function() {
var geo = navigator.geolocation;
  googApiKey = "AIzaSyCI3zv9mMZuVUPGueGVIYUyD3etz0VJK7I",
  weatherKey = "63df9b45298d8782d0474639d201179f";

setMapCanvas();
loadCites();

//Main event
$('#search-btn').click(function() {
var city = $(this).siblings('#city-field').val().trim(),
    country = $(this).siblings('#country-field').val().trim();
    unit = document.getElementById('customSwitch1').checked ? 'fahrenheit' : 'celsius',
    city = {
      id : '',
      name : city,
      country : country,
      unit : unit
    };
    //clear fields
    $(this).siblings('#city-field').val('');
    $(this).siblings('#country-field').val('');

getWeather(city);    
});

//listen for toggle switch event.
$("#customSwitch1").prop("checked", false);
$("#customSwitch1").change(function() {
var unit = document.getElementById("customSwitch1").checked
    ? "fahrenheit"
    : "celsius",
  currentCityEl = document.querySelector("li.active"),
  country = currentCityEl.getAttribute("data-country"),
  name = currentCityEl.textContent,
  city = {
    id : '',
    name: name,
    country: country,
    unit: unit
  };
getWeather(city);
});

//listen for local weather search event
$(".locale").click(function() {
  setUsersCurrentPosition();
});

//listen for the enter key from search fields.
$("input").keyup(function(event) {
  if (event.keyCode === 13) {
    $(this).siblings('#search-btn').click();
  }
});

//load city history with DOM.
function loadCites() {
  var cities =[];
  if (localStorage.getItem("cities") === null) {
    setUsersCurrentPosition();
  } else {
    cities = JSON.parse(localStorage.getItem("cities"));
    getWeather(cities[cities.length-1]);
}}
  
//set user's current position and weather when LS is empty
function setUsersCurrentPosition() {
  geo.getCurrentPosition(function(position) {
  lat = position.coords.latitude;
  lng = position.coords.longitude;
//next, set their weather
  $.ajax({   
    url: "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lng+"&appid="+weatherKey+"",
    method: "GET"
  })
    .then(function(weather) {
        //working with what we have..
        var coords = { lat, lng },
            city = {id : weather.city.id.toString(),
                   name : weather.city.name, 
                   country : weather.city.country,
                   unit : 'fahrenheit'};
          initMap(coords);
          paintWeather(weather, city);
          getCites(city);
          setCityInLS(city);
  })})}

function setMapCanvas() {
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.src =
    "https://maps.googleapis.com/maps/api/js?callback=initMap&key=" +
    googApiKey +
    "";
  document.getElementsByTagName("head")[0].appendChild(script);
}

function initMap(coords) {
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center: coords,
      disableDefaultUI: true
    }),
    marker = new google.maps.Marker({ position: coords, map });
}
      
function getWeather(city) {
  //get location specifics from google first to allow for more ambiguous results. Users can misspell input, use state or country OR neither, abbreviations.. (e.g. 'philly'), etc. 
  $.ajax({       
  url: "https://maps.googleapis.com/maps/api/geocode/json?address="+city.name+",+"+city.country+"&key="+googApiKey+"",
  method: "GET"
  })
  .then(function({ results }) {
    var [ place ] = results;
    city.name = place.formatted_address;
    city.country = place.address_components[place.address_components.length - 1].long_name; 
    var coords = place.geometry.location,
        { lat, lng } = coords;

  initMap(coords);

  $.ajax({   
      url: "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lng+"&appid="+weatherKey+"",
      method: "GET"
  })
      .then(function(weather) { 
      
      city.id = weather.city.id.toString(); //set city id

      paintWeather(weather, city);
      getCites(city);
      setCityInLS(city);
    }); 
});}  

 //load cites from LS and generate list items.
 function getCites(city) {
  var cities;
  if (localStorage.getItem("cities") === null) {
    cities = [];
  } else {
    cities = JSON.parse(localStorage.getItem("cities"));
  }
  cities.push(city);
  
  //reset current list
  document.querySelector("#city-list").textContent = "";  

  //start new list
  var container = document.getElementById("city-list"),
    currentCityEl = document.createElement("li"),
    clearBtn = document.createElement("button"),
    ul = document.createElement("ul");

    ul.className = "list-group";
  
   //set current city to active class and append.
   currentCityEl.className = 
   "list-group-item list-group-item-action active mt-4";  
   currentCityEl.appendChild(document.createTextNode(cities[cities.length - 1].name));
   currentCityEl.setAttribute('data-country', cities[cities.length - 1].country);
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
  }});
  //create clear button
  clearBtn.setAttribute('type', "button");
  clearBtn.className = 'btn btn-outline-warning clear';
  clearBtn.textContent = 'Clear History';

  container.appendChild(ul);
  container.appendChild(clearBtn);
  cityClickListener();
}

//Event listeners for the city list
function cityClickListener() {
  var listItems = document.querySelectorAll(".list-group-item"),
      unit = document.getElementById('customSwitch1').checked ? 'fahrenheit' : 'celsius';

  listItems.forEach(function (city) {
    city.addEventListener("click", function (event) {
      var click = event.currentTarget,
          cityObj = {
          id : '',
          name : click.textContent,
          country : click.getAttribute('data-country'),
          unit : unit
          }; 
        getWeather(cityObj);
      });});
  //clear btn
  $('.clear').click(function() { 
    var confirmation = confirm('Sure you wanna reset the search history?');
    if (confirmation) {
    localStorage.clear();
    location.reload();
    }
  });};

//save the city.
function setCityInLS(city) {
    var cities;
    if (localStorage.getItem("cities") === null) {
      cities = [];
    } else {
      cities = JSON.parse(localStorage.getItem("cities"));
    }
    
    //replace the commas in response date before json.
    city.name = city.name.replace(",", " \,");
    city.country = city.country.replace(",", " \,");
    cities.push(city); 
    //check for and remove duplicate cities.
    cities = removeDupes(cities);
    localStorage.setItem("cities", JSON.stringify(cities));
}

//An over eager method to remove dupes.  But works ok, i guess. 
function removeDupes(arr) {
  //ES6 magic used to remove duplicate objects from the array.
    var nameArr = [...(new Set(arr.map(({ name }) => name)))],
        countryArr = [...(new Set(arr.map(({ country }) => country)))],
        unitArr = [...(new Set(arr.map(({ unit }) => unit)))],
        idArr = [...(new Set(arr.map(({ id }) => id)))],

  //Reestablish the original object format from the data sets.  
      purgedArray = [];
      for (var i = 0; i < nameArr.length; i++) {
        var obj = { id : idArr[i],
                    name : nameArr[i] , 
                    country : countryArr[i], 
                    unit : unitArr[i]};
        purgedArray.push(obj);
      }
    return purgedArray;
   }

//UI.
function paintWeather(weather, city) {
  var temp, highs = [], lows = [],
      kHighs = getHighTemps(weather),
      kLows = getLowTemps(weather),
      indices = getMiddayIndices(weather),
      wind = metricToImperial(weather.list[0].wind.speed);

  //done separately and not async.
  getUltraViolet(weather.city.coord);

  if (city.unit === "fahrenheit") {
  $("#customSwitch1").prop("checked", true);
  temp = convertFahrenheit(JSON.parse(weather.list[0].main.temp));
  kHighs.forEach(function(high) {
    highs.push(convertFahrenheit(high));
  });
  kLows.forEach(function(low) {
    lows.push(convertFahrenheit(low));
  });
} else { //celsius
  $("#customSwitch1").prop("checked", false);
  temp = convertCelsius(JSON.parse(weather.list[0].main.temp));
  kHighs.forEach(function(high) {
    highs.push(convertCelsius(high));
  });
  kLows.forEach(function(low) {
    lows.push(convertCelsius(low));
  });
}
//hide day 5 when data is insufficient
 if (indices.length < 5) {
  $(".no-info").hide();
  indices.push(weather.list.length - 1);
}


  //current weather information
  $('.temp').text(temp);
  $('.location').text(""+city.name+"");
  $('.description').text(weather.list[0].weather[0].description);
  $('.humidity').text("Relative Humiddity "+weather.list[0].main.humidity+"%");
  $('.wind').text(wind);
  $('.icon').attr('src', "https://openweathermap.org/img/w/"+weather.list[0].weather[0].icon+".png");   

  //day of week for extended forecast
  $('.day-1').text(moment().add(1, 'days').format('dddd'));
  $('.day-2').text(moment().add(2, 'days').format('dddd'));
  $('.day-3').text(moment().add(3, 'days').format('dddd'));
  $('.day-4').text(moment().add(4, 'days').format('dddd'));
  $('.day-5').text(moment().add(5, 'days').format('dddd'));
  //high temp for extended forecast
  $('.high-1').text('High: '+highs[0]);
  $('.high-2').text('High: '+highs[1]);
  $('.high-3').text('High: '+highs[2]);
  $('.high-4').text('High: '+highs[3]);
  $('.high-5').text('High: '+highs[4]);
  //low temp for extended forecast
  $('.low-1').text('Low: '+lows[0]);
  $('.low-2').text('Low: '+lows[1]);
  $('.low-3').text('Low: '+lows[2]);
  $('.low-4').text('Low: '+lows[3]);
  $('.low-5').text('Low: '+lows[4]);
  //icons for extended forecast
  $('.icon-1').attr('src', "https://openweathermap.org/img/w/"+weather.list[indices[0]].weather[0].icon+".png");
  $('.icon-2').attr('src', "https://openweathermap.org/img/w/"+weather.list[indices[1]].weather[0].icon+".png");
  $('.icon-3').attr('src', "https://openweathermap.org/img/w/"+weather.list[indices[2]].weather[0].icon+".png");
  $('.icon-4').attr('src', "https://openweathermap.org/img/w/"+weather.list[indices[3]].weather[0].icon+".png");
  $('.icon-5').attr('src', "https://openweathermap.org/img/w/"+weather.list[indices[4]].weather[0].icon+".png");
  //descriptions for extended forecast
  $('.descript-1').text(weather.list[indices[0]].weather[0].description);
  $('.descript-2').text(weather.list[indices[1]].weather[0].description);
  $('.descript-3').text(weather.list[indices[2]].weather[0].description);
  $('.descript-4').text(weather.list[indices[3]].weather[0].description);
  $('.descript-5').text(weather.list[indices[4]].weather[0].description);
}

//convert kelvin to Fahrenheit and Celsius
function convertFahrenheit(kelvin) {
  fTemp = Math.round((kelvin-273.15)*9/5 +32);
  return ""+fTemp+"\xB0F";
}
function convertCelsius (kelvin) {
  var cTemp = Math.round(kelvin-273.15);
  return ""+cTemp+"\xB0C";
}

//get ultra violet index
function getUltraViolet({ lat, lon }) {
  $.ajax({   
    url: "https://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+weatherKey+"",
    method: "GET"
})
    .then(function(uv) { 
      $('.uv').text("UV Index: "+uv.value+"");
    });
}

//convert wind speeds from metric to imperial.
function metricToImperial(speed) {
    var converted = speed*(3600/1609.344),
        rounded = Math.round(converted);
    return "Wind Speed: "+rounded+"Mph";
}

//get the indices of each midday point for extended forecast icons and descriptions.
function getMiddayIndices(weather) {
  var now = new Date(),
      indices = [];

  weather.list.forEach(function(timeOfDay) {
    var future  = new Date(timeOfDay.dt*1000);  

    if (future.getDay() !== now.getDay() && (future.getHours() >= 12 && future.getHours() <= 14)) {
        indices.push(weather.list.indexOf(timeOfDay));
    }})
  //returns only times between 12 & 2pm. of which, are mutually exclusive from these data sets.
  return indices;     
}

//get daily high temperatures
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
    }}});
  var highs = [sunHigh  = Math.max.apply(null, sunTemps),
          monHigh  = Math.max.apply(null, monTemps),
          tueHigh  = Math.max.apply(null, tueTemps),
          wedHigh  = Math.max.apply(null, wedTemps),
          thurHigh  = Math.max.apply(null, thurTemps),
          friHigh  = Math.max.apply(null, friTemps),
          satHigh  = Math.max.apply(null, satTemps)],
          fiveDayHighs = [];

      //sort out the duds
      highs.forEach(function(high) {
        if (isFinite(high))
        fiveDayHighs.push(high);
      })
  return fiveDayHighs;
  }

  //get daily low temperatures
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
      }}});
  var lows = [sunLow  = Math.min.apply(null, sunTemps),
            monLow  = Math.min.apply(null, monTemps),
            tueLow  = Math.min.apply(null, tueTemps),
            wedLow  = Math.min.apply(null, wedTemps),
            thurLow  = Math.min.apply(null, thurTemps),
            friLow  = Math.min.apply(null, friTemps),
            satLow  = Math.min.apply(null, satTemps)],
            fiveDayLows = [];

      //sort out the duds
      lows.forEach(function(low) {
      if (isFinite(low))
      fiveDayLows.push(low);
      })
  return fiveDayLows;   
  }
});
