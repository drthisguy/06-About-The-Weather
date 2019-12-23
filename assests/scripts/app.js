$(document).ready( function() {

    var geo = navigator.geolocation
        googApiKey = 'AIzaSyCI3zv9mMZuVUPGueGVIYUyD3etz0VJK7I',
        weatherKey = '63df9b45298d8782d0474639d201179f',
        city= 'Philadelphia',
        country= 'PA',
        lat= '',
        lng = '';

    function GetUserPosition() {
        geo.getCurrentPosition(function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
    })};
    getCoordinates();
    getWeather();
    function getCoordinates() {
       
       $.ajax({
               url: "https://maps.googleapis.com/maps/api/geocode/json?address="+city+",+"+country+"&key="+googApiKey+"",
               method: "GET"
             })
               .then(function(response) {
                 console.log(response);
                 lat = response.results[0].geometry.location.lat; 
                 lng = response.results[0].geometry.location.lng;
           });
    }
    function getWeather() {
        $.ajax({
                url: "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lng+"&appid="+weatherKey+"",
                method: "GET"
              })
                .then(function(response) {
                  console.log(response);
                  
            });
    }

      function getPlaces() {
        var places;
        if (localStorage.getItem("places") === null) {
          GetUserPosition();
          places = [];
        } else {
          places = JSON.parse(localStorage.getItem("places"));
        }
      }
});