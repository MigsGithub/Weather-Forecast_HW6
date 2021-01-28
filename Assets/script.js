//Setup
var apiKey = "ef2f6c11b4cdca1e4cdd9fc046cc5ecf";
var today = moment().format('L');

//CurrentWeather

function currentWeather(city) {

    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(apiResponse) {
        
        $("#weatherInfo").css("display", "block");
        $("#cityDetails").empty();
        
        var iconCode = apiResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        var currentCity = $(`
            <h2 id="currentCity">
                ${apiResponse.name} ${today} <img src="${iconURL}" alt="${apiResponse.weather[0].description}" />
            </h2>
            <p>Temperature: ${apiResponse.main.temp} °F</p>
            <p>Feels like: ${apiResponse.main.feels_like} °F</p>
            <p>Humidity: ${apiResponse.main.humidity}\%</p>
            <p>Wind Speed: ${apiResponse.wind.speed} MPH</p>
        `);

        $("#cityDetails").append(currentCity);

        var lat = apiResponse.coord.lat;
        var lon = apiResponse.coord.lon;
        var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: uviQueryURL,
            method: "GET"
        }).then(function(uviResponse) {
            console.log(uviResponse);

            var uvIndex = uviResponse.value;
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="p-1">${uvIndex}</span>
                </p>
            `);

            $("#cityDetails").append(uvIndexP);

            futureWeather(lat, lon);

            if (uvIndex >= 0 && uvIndex <= 2.9) {
                $("#uvIndexColor").css("background-color", "#228B22").css("color", "white");
            } else if (uvIndex >= 3 && uvIndex <= 5.9) {
                $("#uvIndexColor").css("background-color", "#FFFF00");
            } else if (uvIndex >= 6 && uvIndex <= 7.9) {
                $("#uvIndexColor").css("background-color", "#FF8C00");
            } else if (uvIndex >= 8 && uvIndex <= 10.9) {
                $("#uvIndexColor").css("background-color", "#8B0000").css("color", "white");
            } else {
                $("#uvIndexColor").css("background-color", "#9400D3").css("color", "white"); 
            };  
        });
    });
}

//Future 5-Day Forcast

function futureWeather(lat, lon) {

    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function(futureResponse) {
        console.log(futureResponse);
        $("#fiveDay").empty();
        
        for (let i = 1; i < 6; i++) {
            var cityInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                humidity: futureResponse.daily[i].humidity
            };

            var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

            var futureCard = $(`
                <div class="p-1">
                    <div class="card p-2 m-2 bg-info text-dark">
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            $("#fiveDay").append(futureCard);
        }
    }); 
}


var searchHistoryList = [];

// add on click event listener 
$("#searchBtn").on("click", function(event) {
    event.preventDefault();

    var city = $("#searchCity").val().trim();
    currentWeather(city);
    if (!searchHistoryList.includes(city)) {
        searchHistoryList.push(city);
        var searchedCity = $(`
            <li class="list-group-item">${city}</li>
            `);
        $("#searchedCities").append(searchedCity);
    };
    
    localStorage.setItem("city", JSON.stringify(searchHistoryList));
    console.log(searchHistoryList);
});

$(document).on("click", ".list-group-item", function() {
    var listCity = $(this).text();
    currentWeather(listCity);
});

$(document).ready(function() {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentWeather(lastSearchedCity);
        console.log(`Searched cities: ${lastSearchedCity}`);
    }
});

//theEnd