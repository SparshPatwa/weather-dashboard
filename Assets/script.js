function main() {
    const debug = 1;
    // Parse user inputs from HTML page
    const inputEl           = document.getElementById("city-input");
    const searchEl          = document.getElementById("search-button");
    const clearEl           = document.getElementById("clear-history");
    const nameEl            = document.getElementById("city-name");
    const currentPicEl      = document.getElementById("current-pic");
    const currentTempEl     = document.getElementById("temperature");
    const currentHumidityEl = document.getElementById("humidity");4
    const currentWindEl     = document.getElementById("wind-speed");
    const currentUVEl       = document.getElementById("UV-index");
    const historyEl         = document.getElementById("history");
    let searchHistory       = JSON.parse(localStorage.getItem("search")) || [];
    
    if(debug){
        console.log(searchHistory);
    }
    
    // patwa.sparsh@gmail.com Weather API APIKEY
    const APIKey = "2b81bb7e7304c087f86432e2bd29e93e";
    
    function getWeather(cityName) {
        // API call using city name from user
        let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        fetch(queryURL)

        // Parse weather data from API call made using city name
        .then(function(response) { return response.json() })
        .then(function(data){
            // Parse data
            const currentDate   = new Date(data.dt*1000);
            const day           = currentDate.getDate();
            const month         = currentDate.getMonth() + 1;
            const year          = currentDate.getFullYear();
            let weatherPic      = data.weather[0].icon;
            let lat             = data.coord.lat;
            let lon             = data.coord.lon;

            // Debug
            if(debug){
                console.log(data);
                console.log(currentDate);
            }
            
            // Set HTML elemets based on API data
            currentPicEl.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
            currentPicEl.setAttribute("alt",data.weather[0].description);
            nameEl.innerHTML            = data.name + " (" + month + "/" + day + "/" + year + ") ";
            currentTempEl.innerHTML     = "Temperature: " + convertToF(data.main.temp) + " &#176F";
            currentHumidityEl.innerHTML = "Humidity: " + data.main.humidity + "%";
            currentWindEl.innerHTML     = "Wind Speed: " + data.wind.speed + " MPH";
            
            // API call using city coordinates to get UV index
            let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
            fetch(UVQueryURL)
            .then(function(response) { return response.json() })
            .then(function(data){
                // Parse UV data and set HTML element
                let UVIndex             = document.createElement("span");
                UVIndex.setAttribute("class","badge badge-danger");
                UVIndex.innerHTML       = data[0].value;
                currentUVEl.innerHTML   = "UV Index: ";
                currentUVEl.append(UVIndex);
            });
            
            // API call using cityid to get 5 day forecast
            let cityID = data.id;
            let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
            fetch(forecastQueryURL)
            .then(function(response) { return response.json() })
            .then(function(data){
                if(debug) {
                    console.log(data);
                }
                
                // Generate 5 day forecast
                const forecastEls = document.querySelectorAll(".forecast");
                for (i=0; i<forecastEls.length; i++) {

                    forecastEls[i].innerHTML    = "";
                    const forecastIndex         = i*8 + 4;
                    const forecastDate          = new Date(data.list[forecastIndex].dt * 1000);
                    const forecastDay           = forecastDate.getDate();
                    const forecastMonth         = forecastDate.getMonth() + 1;
                    const forecastYear          = forecastDate.getFullYear();

                    const forecastDateEl    = document.createElement("p");
                    forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                    
                    forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                    forecastEls[i].append(forecastDateEl);
                    
                    const forecastWeatherEl = document.createElement("img");
                    forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + data.list[forecastIndex].weather[0].icon + "@2x.png");
                    forecastWeatherEl.setAttribute("alt",data.list[forecastIndex].weather[0].description);
                    forecastEls[i].append(forecastWeatherEl);
                    
                    const forecastTempEl        = document.createElement("p");
                    forecastTempEl.innerHTML    = "Temp: " + convertToF(data.list[forecastIndex].main.temp) + " &#176F";
                    forecastEls[i].append(forecastTempEl);

                    const forecastHumidityEl        = document.createElement("p");
                    forecastHumidityEl.innerHTML    = "Humidity: " + data.list[forecastIndex].main.humidity + "%";
                    forecastEls[i].append(forecastHumidityEl);
                }
            })
        });  
    }

    searchEl.addEventListener("click",function() {
        const searchTerm = inputEl.value;
        getWeather(searchTerm);
        if(searchHistory.includes(searchTerm) == false) {
            searchHistory.push(searchTerm);
        }
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    clearEl.addEventListener("click",function() {
        searchHistory = [];
        localStorage.setItem("search",JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    function convertToF(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    function renderSearchHistory() {
        historyEl.innerHTML = "";
        for (let i=0; i<searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click",function() {
                getWeather(historyItem.value);
            })
            historyEl.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}


main();