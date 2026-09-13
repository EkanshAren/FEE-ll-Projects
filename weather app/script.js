/*=========================================================
        WeatherPro
        script.js (Part 1)
=========================================================*/

/*==========================
      DOM ELEMENTS
===========================*/

const cityElement = document.getElementById("city");
const dateElement = document.getElementById("date");
const tempElement = document.getElementById("temperature");
const conditionElement = document.getElementById("condition");
const feelsLikeElement = document.getElementById("feelsLike");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const pressureElement = document.getElementById("pressure");
const visibilityElement = document.getElementById("visibility");
const sunriseElement = document.getElementById("sunrise");
const sunsetElement = document.getElementById("sunset");
const weatherIcon = document.getElementById("weatherIcon");

const hourlyContainer = document.getElementById("hourlyForecast");
const forecastContainer = document.getElementById("forecast");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const themeBtn = document.getElementById("themeBtn");
const unitBtn = document.getElementById("unitBtn");

const favoritesContainer = document.getElementById("favorites");


/*==========================
      GLOBAL VARIABLES
===========================*/

let currentCity = "Chandigarh";

let currentUnit = "metric";

let weatherData = null;

let forecastData = null;


/*==========================
      API URLS
===========================*/

function currentWeatherURL(city){

    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`;

}

function forecastURL(city){

    return `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${API_KEY}`;

}


/*==========================
      EVENT LISTENERS
===========================*/

searchBtn.addEventListener("click",()=>{

    searchWeather();

});


searchInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        searchWeather();

    }

});


locationBtn.addEventListener("click",()=>{

    getCurrentLocation();

});


/*==========================
      SEARCH WEATHER
===========================*/

function searchWeather(){

    const city = searchInput.value.trim();

    if(city===""){

        alert("Please enter a city.");

        return;

    }

    currentCity = city;

    fetchCurrentWeather(city);

}


/*==========================
      CURRENT LOCATION
===========================*/

function getCurrentLocation(){

    if(!navigator.geolocation){

        alert("Geolocation is not supported.");

        return;

    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        successLocation,

        errorLocation

    );

}


/*==========================
      LOCATION SUCCESS
===========================*/

function successLocation(position){

    const latitude = position.coords.latitude;

    const longitude = position.coords.longitude;

    fetchWeatherByCoordinates(

        latitude,

        longitude

    );

}


/*==========================
      LOCATION ERROR
===========================*/

function errorLocation(){

    hideLoading();

    alert("Unable to access your location.");

}


/*==========================
      LOADING
===========================*/

function showLoading(){

    document.body.classList.add("loading");

}


function hideLoading(){

    document.body.classList.remove("loading");

}


/*==========================
      FETCH WEATHER
===========================*/

async function fetchCurrentWeather(city){

    showLoading();

    try{

        const response = await fetch(

            currentWeatherURL(city)

        );

        if(!response.ok){

            throw new Error("City not found");

        }

        weatherData = await response.json();

        displayCurrentWeather(weatherData);

        fetchForecast(city);

    }

    catch(error){

        hideLoading();

        alert(error.message);

    }

}


/*==========================
      FETCH BY COORDINATES
===========================*/

async function fetchWeatherByCoordinates(lat,lon){

    showLoading();

    try{

        const url =

        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;

        const response = await fetch(url);

        weatherData = await response.json();

        currentCity = weatherData.name;

        displayCurrentWeather(weatherData);

        fetchForecast(currentCity);

    }

    catch(error){

        hideLoading();

        alert("Unable to fetch weather.");

    }

}


/*==========================
      DATE FORMAT
===========================*/

function formatDate(){

    const options={

        weekday:"long",

        year:"numeric",

        month:"long",

        day:"numeric"

    };

    return new Date().toLocaleDateString(

        "en-US",

        options

    );

}


/*==========================
      INITIALIZE
===========================*/

window.addEventListener("load",()=>{

    dateElement.textContent = formatDate();

    fetchCurrentWeather(currentCity);

});

/*=========================================================
        script.js (Part 2)
        Current Weather + Forecast
=========================================================*/


/*==========================
    DISPLAY CURRENT WEATHER
===========================*/

function displayCurrentWeather(data){

    hideLoading();

    cityElement.textContent = data.name;

    tempElement.textContent =
        Math.round(data.main.temp) +
        (currentUnit==="metric" ? "°C" : "°F");

    conditionElement.textContent =
        capitalizeWords(
            data.weather[0].description
        );

    feelsLikeElement.textContent =
        "Feels Like " +
        Math.round(data.main.feels_like) +
        (currentUnit==="metric" ? "°C" : "°F");

    humidityElement.textContent =
        data.main.humidity + "%";

    windElement.textContent =
        data.wind.speed +
        (currentUnit==="metric"
        ? " m/s"
        : " mph");

    pressureElement.textContent =
        data.main.pressure + " hPa";

    visibilityElement.textContent =
        (data.visibility/1000).toFixed(1) + " km";

    sunriseElement.textContent =
        formatTime(data.sys.sunrise);

    sunsetElement.textContent =
        formatTime(data.sys.sunset);

    weatherIcon.src =
        getWeatherIcon(
            data.weather[0].icon
        );

}


/*==========================
        FETCH FORECAST
===========================*/

async function fetchForecast(city){

    try{

        const response =
        await fetch(
            forecastURL(city)
        );

        if(!response.ok){

            throw new Error(
                "Forecast unavailable"
            );

        }

        forecastData =
        await response.json();

        displayHourlyForecast();

        displayFiveDayForecast();

        updateChart();

        updateMap();

    }

    catch(error){

        console.log(error);

    }

}


/*==========================
      HOURLY FORECAST
===========================*/

function displayHourlyForecast(){

    hourlyContainer.innerHTML="";

    const hourly =
    forecastData.list.slice(0,8);

    hourly.forEach(item=>{

        const card =
        document.createElement("div");

        card.className =
        "hourCard fadeIn";

        card.innerHTML=

        `
        <h3>
        ${formatHour(item.dt)}
        </h3>

        <img src="${getWeatherIcon(item.weather[0].icon)}">

        <p>
        ${capitalizeWords(item.weather[0].description)}
        </p>

        <h2>
        ${Math.round(item.main.temp)}
        ${currentUnit==="metric"?"°C":"°F"}
        </h2>
        `;

        hourlyContainer.appendChild(card);

    });

}


/*==========================
      FIVE DAY FORECAST
===========================*/

function displayFiveDayForecast(){

    forecastContainer.innerHTML="";

    const days=[];

    forecastData.list.forEach(item=>{

        if(item.dt_txt.includes("12:00:00")){

            days.push(item);

        }

    });

    days.slice(0,5).forEach(item=>{

        const card =
        document.createElement("div");

        card.className=
        "forecastCard fadeIn";

        card.innerHTML=

        `
        <h3>
        ${getDay(item.dt)}
        </h3>

        <img src="${getWeatherIcon(item.weather[0].icon)}">

        <h2>
        ${Math.round(item.main.temp)}
        ${currentUnit==="metric"?"°C":"°F"}
        </h2>

        <p>
        ${capitalizeWords(item.weather[0].description)}
        </p>
        `;

        forecastContainer.appendChild(card);

    });

}


/*==========================
        WEATHER ICONS
===========================*/

function getWeatherIcon(icon){

    return `https://openweathermap.org/img/wn/${icon}@4x.png`;

}


/*==========================
        FORMAT TIME
===========================*/

function formatTime(timestamp){

    return new Date(timestamp*1000)
    .toLocaleTimeString(
        "en-US",
        {

            hour:"numeric",

            minute:"2-digit"

        }

    );

}


/*==========================
        FORMAT HOUR
===========================*/

function formatHour(timestamp){

    return new Date(timestamp*1000)
    .toLocaleTimeString(
        "en-US",
        {

            hour:"numeric"

        }

    );

}


/*==========================
        DAY NAME
===========================*/

function getDay(timestamp){

    return new Date(timestamp*1000)
    .toLocaleDateString(

        "en-US",

        {

            weekday:"long"

        }

    );

}


/*==========================
      CAPITALIZE TEXT
===========================*/

function capitalizeWords(text){

    return text.replace(

        /\b\w/g,

        letter=>letter.toUpperCase()

    );

}

/*=========================================================
        script.js (Part 3)
        Charts + AQI + Leaflet Map
=========================================================*/


/*==========================
        GLOBAL VARIABLES
===========================*/

let tempChart = null;

let map = null;

let marker = null;


/*==========================
        UPDATE CHART
===========================*/

function updateChart(){

    const labels = [];

    const temps = [];

    forecastData.list.slice(0,8).forEach(item=>{

        labels.push(

            formatHour(item.dt)

        );

        temps.push(

            item.main.temp

        );

    });

    const ctx =
    document
    .getElementById("tempChart")
    .getContext("2d");

    if(tempChart){

        tempChart.destroy();

    }

    tempChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:labels,

            datasets:[{

                label:"Temperature",

                data:temps,

                borderColor:"#FFD54F",

                backgroundColor:"rgba(255,213,79,.2)",

                borderWidth:3,

                fill:true,

                tension:.4,

                pointRadius:5,

                pointBackgroundColor:"#ffffff"

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    labels:{

                        color:"#ffffff"

                    }

                }

            },

            scales:{

                x:{

                    ticks:{

                        color:"#ffffff"

                    }

                },

                y:{

                    ticks:{

                        color:"#ffffff"

                    }

                }

            }

        }

    });

}


/*==========================
      FETCH AIR QUALITY
===========================*/

async function fetchAQI(lat,lon){

    try{

        const url=

        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

        const response=

        await fetch(url);

        const data=

        await response.json();

        updateAQI(data);

    }

    catch(error){

        console.log(error);

    }

}


/*==========================
        UPDATE AQI
===========================*/

function updateAQI(data){

    const value=

    data.list[0].main.aqi;

    const aqiText=

    document.getElementById("aqi");

    const aqiValue=

    document.getElementById("aqiValue");

    const levels=[

        "",

        "Good",

        "Fair",

        "Moderate",

        "Poor",

        "Very Poor"

    ];

    const colors=[

        "",

        "#00e676",

        "#ffee58",

        "#ff9800",

        "#ff5252",

        "#8e24aa"

    ];

    aqiText.textContent=

    levels[value];

    aqiText.style.color=

    colors[value];

    aqiValue.textContent=

    "AQI : " + value;

}


/*==========================
        MAP
===========================*/

function initializeMap(lat,lon){

    if(map){

        map.remove();

    }

    map = L.map("map").setView(

        [lat,lon],

        11

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:

            "&copy; OpenStreetMap"

        }

    ).addTo(map);

    marker =

    L.marker([lat,lon])

    .addTo(map)

    .bindPopup(currentCity)

    .openPopup();

}


/*==========================
      UPDATE MAP
===========================*/

function updateMap(){

    if(!weatherData) return;

    const lat=

    weatherData.coord.lat;

    const lon=

    weatherData.coord.lon;

    initializeMap(lat,lon);

    fetchAQI(lat,lon);

}


/*==========================
        UPDATE MARKER
===========================*/

function moveMarker(lat,lon){

    if(!marker) return;

    marker.setLatLng([lat,lon]);

    map.setView([lat,lon],11);

}


/*==========================
        WEATHER COLORS
===========================*/

function weatherColor(){

    if(!weatherData) return "#4F8CFF";

    const main=

    weatherData.weather[0].main;

    switch(main){

        case "Rain":

            return "#4FC3F7";

        case "Clouds":

            return "#90A4AE";

        case "Snow":

            return "#ECEFF1";

        case "Thunderstorm":

            return "#7E57C2";

        case "Clear":

            return "#FFD54F";

        default:

            return "#4F8CFF";

    }

}


/*==========================
      UPDATE CHART COLOR
===========================*/

function refreshChartColor(){

    if(!tempChart) return;

    tempChart.data.datasets[0].borderColor=

    weatherColor();

    tempChart.update();

}


/*==========================
      WINDOW RESIZE
===========================*/

window.addEventListener(

    "resize",

    ()=>{

        if(tempChart){

            tempChart.resize();

        }

    }

);

/*=========================================================
        script.js (Part 4)
        Favorites + Search History
=========================================================*/


/*==========================
      LOCAL STORAGE KEYS
===========================*/

const FAVORITES_KEY = "weatherFavorites";

const HISTORY_KEY = "weatherHistory";


/*==========================
      LOAD FAVORITES
===========================*/

function loadFavorites(){

    const favorites =

    JSON.parse(

        localStorage.getItem(FAVORITES_KEY)

    ) || [];

    renderFavorites(favorites);

}


/*==========================
      RENDER FAVORITES
===========================*/

function renderFavorites(favorites){

    favoritesContainer.innerHTML = "";

    favorites.forEach(city=>{

        const btn =

        document.createElement("div");

        btn.className = "favorite fadeIn";

        btn.innerHTML =

        `
        <i class="fa-solid fa-location-dot"></i>
        ${city}
        `;

        btn.addEventListener("click",()=>{

            currentCity = city;

            fetchCurrentWeather(city);

        });

        favoritesContainer.appendChild(btn);

    });

}


/*==========================
      ADD FAVORITE
===========================*/

function addFavorite(city){

    let favorites =

    JSON.parse(

        localStorage.getItem(FAVORITES_KEY)

    ) || [];

    if(favorites.includes(city)){

        alert("Already Added");

        return;

    }

    favorites.push(city);

    localStorage.setItem(

        FAVORITES_KEY,

        JSON.stringify(favorites)

    );

    renderFavorites(favorites);

}


/*==========================
      REMOVE FAVORITE
===========================*/

function removeFavorite(city){

    let favorites =

    JSON.parse(

        localStorage.getItem(FAVORITES_KEY)

    ) || [];

    favorites = favorites.filter(item=>item!==city);

    localStorage.setItem(

        FAVORITES_KEY,

        JSON.stringify(favorites)

    );

    renderFavorites(favorites);

}


/*==========================
      SAVE SEARCH HISTORY
===========================*/

function saveHistory(city){

    let history =

    JSON.parse(

        localStorage.getItem(HISTORY_KEY)

    ) || [];

    history = history.filter(item=>item!==city);

    history.unshift(city);

    if(history.length>8){

        history.pop();

    }

    localStorage.setItem(

        HISTORY_KEY,

        JSON.stringify(history)

    );

}


/*==========================
      GET HISTORY
===========================*/

function getHistory(){

    return JSON.parse(

        localStorage.getItem(HISTORY_KEY)

    ) || [];

}


/*==========================
      SHOW HISTORY
===========================*/

function showHistory(){

    const history = getHistory();

    console.log("Recent Searches:");

    history.forEach(city=>{

        console.log(city);

    });

}


/*==========================
      CLEAR HISTORY
===========================*/

function clearHistory(){

    localStorage.removeItem(HISTORY_KEY);

}


/*==========================
      ADD CURRENT CITY
===========================*/

function saveCurrentCity(){

    saveHistory(currentCity);

}


/*==========================
      FAVORITE BUTTON
===========================*/

const favoriteButton =

document.createElement("button");

favoriteButton.innerHTML =

`<i class="fa-solid fa-heart"></i>`;

favoriteButton.className =

"favoriteBtn";

document.querySelector("header")

.appendChild(favoriteButton);


favoriteButton.addEventListener(

"click",

()=>{

    addFavorite(currentCity);

}

);


/*==========================
      LOAD SAVED DATA
===========================*/

window.addEventListener(

"load",

()=>{

    loadFavorites();

    showHistory();

}

);


/*==========================
      AUTO SAVE SEARCH
===========================*/

const oldFetch = fetchCurrentWeather;

fetchCurrentWeather = async function(city){

    await oldFetch(city);

    saveHistory(city);

};


/*==========================
      DOUBLE CLICK REMOVE
===========================*/

favoritesContainer.addEventListener(

"dblclick",

(e)=>{

    if(

        e.target.classList.contains("favorite")

    ){

        removeFavorite(

            e.target.innerText.trim()

        );

    }

});


/*==========================
      EXPORT FAVORITES
===========================*/

function exportFavorites(){

    const favorites =

    JSON.parse(

        localStorage.getItem(FAVORITES_KEY)

    ) || [];

    console.log(

        JSON.stringify(

            favorites,

            null,

            2

        )

    );

}


/*==========================
      IMPORT FAVORITES
===========================*/

function importFavorites(data){

    localStorage.setItem(

        FAVORITES_KEY,

        JSON.stringify(data)

    );

    loadFavorites();

}

/*=========================================================
        script.js (Part 5)
        Theme + Unit Toggle + Dynamic Background
=========================================================*/


/*==========================
        LOCAL STORAGE KEYS
===========================*/

const THEME_KEY = "weatherTheme";
const UNIT_KEY = "weatherUnit";


/*==========================
        DARK MODE
===========================*/

function loadTheme(){

    const savedTheme =
    localStorage.getItem(THEME_KEY);

    if(savedTheme === "dark"){

        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";

    }else{

        document.body.classList.remove("dark");
        themeBtn.textContent = "🌙";

    }

}


themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        themeBtn.textContent="☀️";

        localStorage.setItem(
            THEME_KEY,
            "dark"
        );

    }else{

        themeBtn.textContent="🌙";

        localStorage.setItem(
            THEME_KEY,
            "light"
        );

    }

});


/*==========================
        UNIT TOGGLE
===========================*/

function loadUnit(){

    const savedUnit =
    localStorage.getItem(UNIT_KEY);

    if(savedUnit){

        currentUnit = savedUnit;

    }

    unitBtn.textContent =
    currentUnit==="metric"
    ? "°C"
    : "°F";

}


unitBtn.addEventListener("click",()=>{

    if(currentUnit==="metric"){

        currentUnit="imperial";

    }else{

        currentUnit="metric";

    }

    unitBtn.textContent=
    currentUnit==="metric"
    ? "°C"
    : "°F";

    localStorage.setItem(
        UNIT_KEY,
        currentUnit
    );

    fetchCurrentWeather(currentCity);

});


/*==========================
        AUTO REFRESH
===========================*/

setInterval(()=>{

    fetchCurrentWeather(currentCity);

},600000);


/*==========================
        BACKGROUND
===========================*/

function updateBackground(){

    if(!weatherData) return;

    const weather =
    weatherData.weather[0].main;

    switch(weather){

        case "Clear":

            document.body.style.background=
            "linear-gradient(135deg,#4facfe,#00f2fe)";
            break;

        case "Clouds":

            document.body.style.background=
            "linear-gradient(135deg,#8e9eab,#eef2f3)";
            break;

        case "Rain":

            document.body.style.background=
            "linear-gradient(135deg,#314755,#26a0da)";
            break;

        case "Snow":

            document.body.style.background=
            "linear-gradient(135deg,#e6dada,#274046)";
            break;

        case "Thunderstorm":

            document.body.style.background=
            "linear-gradient(135deg,#232526,#414345)";
            break;

        case "Mist":

        case "Fog":

            document.body.style.background=
            "linear-gradient(135deg,#bdc3c7,#2c3e50)";
            break;

        default:

            document.body.style.background=
            "linear-gradient(135deg,#4facfe,#00f2fe)";

    }

}


/*==========================
        CARD ANIMATION
===========================*/

function animateCards(){

    const cards =
    document.querySelectorAll(

        ".card,.forecastCard,.hourCard,.info"

    );

    cards.forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform="translateY(25px)";

        setTimeout(()=>{

            card.style.transition=".6s";

            card.style.opacity="1";

            card.style.transform="translateY(0)";

        },index*120);

    });

}


/*==========================
        SEARCH EFFECT
===========================*/

searchInput.addEventListener("focus",()=>{

    searchInput.style.boxShadow=
    "0 0 20px rgba(255,255,255,.6)";

});

searchInput.addEventListener("blur",()=>{

    searchInput.style.boxShadow="none";

});


/*==========================
        BUTTON RIPPLE
===========================*/

document.querySelectorAll("button")

.forEach(btn=>{

    btn.addEventListener("click",function(e){

        const ripple=
        document.createElement("span");

        ripple.className="ripple";

        ripple.style.left=
        e.offsetX+"px";

        ripple.style.top=
        e.offsetY+"px";

        this.appendChild(ripple);

        setTimeout(()=>{

            ripple.remove();

        },600);

    });

});


/*==========================
        WEATHER UPDATE
===========================*/

const oldDisplay =
displayCurrentWeather;

displayCurrentWeather=
function(data){

    oldDisplay(data);

    updateBackground();

    animateCards();

    refreshChartColor();

};


/*==========================
        INITIALIZE
===========================*/

window.addEventListener("load",()=>{

    loadTheme();

    loadUnit();

});

/*=========================================================
        script.js (Part 6)
        Voice Search + Notifications + Share + Weather Effects
=========================================================*/


/*==========================
      TOAST NOTIFICATION
===========================*/

function showToast(message){

    let toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(()=>{

        toast.classList.add("show");

    },100);

    setTimeout(()=>{

        toast.classList.remove("show");

        setTimeout(()=>{

            toast.remove();

        },500);

    },3000);

}


/*==========================
      WEATHER ANIMATION
===========================*/

function createWeatherEffect(type){

    const old = document.querySelector(".weather-effect");

    if(old){

        old.remove();

    }

    const container = document.createElement("div");

    container.className = "weather-effect";

    document.body.appendChild(container);

    if(type==="Rain"){

        for(let i=0;i<120;i++){

            let drop=document.createElement("span");

            drop.className="rain-drop";

            drop.style.left=Math.random()*100+"vw";

            drop.style.animationDuration=

            (0.5+Math.random())+"s";

            drop.style.animationDelay=

            Math.random()+"s";

            container.appendChild(drop);

        }

    }

    if(type==="Snow"){

        for(let i=0;i<80;i++){

            let snow=document.createElement("span");

            snow.className="snow";

            snow.innerHTML="❄";

            snow.style.left=Math.random()*100+"vw";

            snow.style.fontSize=

            10+Math.random()*20+"px";

            snow.style.animationDuration=

            5+Math.random()*5+"s";

            container.appendChild(snow);

        }

    }

}


/*==========================
      UPDATE WEATHER EFFECT
===========================*/

function updateWeatherEffect(){

    if(!weatherData) return;

    createWeatherEffect(

        weatherData.weather[0].main

    );

}


/*==========================
      BROWSER NOTIFICATION
===========================*/

function requestNotification(){

    if("Notification" in window){

        Notification.requestPermission();

    }

}


function sendNotification(title,body){

    if(Notification.permission==="granted"){

        new Notification(title,{

            body:body,

            icon:weatherIcon.src

        });

    }

}


/*==========================
      WEATHER ALERT
===========================*/

function weatherAlert(){

    if(!weatherData) return;

    const temp = weatherData.main.temp;

    const weather = weatherData.weather[0].main;

    if(temp>=40){

        showToast("🔥 Extreme Heat Warning");

        sendNotification(

            "Weather Alert",

            "High temperature detected."

        );

    }

    if(weather==="Thunderstorm"){

        showToast("⛈ Thunderstorm Expected");

    }

    if(weather==="Rain"){

        showToast("🌧 Carry an Umbrella");

    }

}


/*==========================
      VOICE SEARCH
===========================*/

const SpeechRecognition =

window.SpeechRecognition ||

window.webkitSpeechRecognition;

if(SpeechRecognition){

    const recognition =

    new SpeechRecognition();

    recognition.lang="en-US";

    recognition.continuous=false;

    recognition.interimResults=false;

    const micButton=

    document.createElement("button");

    micButton.innerHTML=

    '<i class="fa-solid fa-microphone"></i>';

    micButton.className="micBtn";

    document

    .querySelector(".search-box")

    .appendChild(micButton);

    micButton.addEventListener("click",()=>{

        recognition.start();

    });

    recognition.onresult=(event)=>{

        const text=

        event.results[0][0].transcript;

        searchInput.value=text;

        searchWeather();

    };

}


/*==========================
      SHARE WEATHER
===========================*/

async function shareWeather(){

    if(!navigator.share){

        showToast(

            "Sharing not supported."

        );

        return;

    }

    await navigator.share({

        title:"WeatherPro",

        text:

        `Weather in ${currentCity}: ${tempElement.textContent}, ${conditionElement.textContent}`,

        url:window.location.href

    });

}


const shareButton=

document.createElement("button");

shareButton.innerHTML=

'<i class="fa-solid fa-share-nodes"></i>';

shareButton.className="shareBtn";

document

.querySelector("header")

.appendChild(shareButton);

shareButton.addEventListener(

"click",

shareWeather

);


/*==========================
      DOWNLOAD REPORT
===========================*/

function downloadReport(){

    let report=`

Weather Report

City : ${currentCity}

Temperature : ${tempElement.textContent}

Condition : ${conditionElement.textContent}

Humidity : ${humidityElement.textContent}

Wind : ${windElement.textContent}

Pressure : ${pressureElement.textContent}

Visibility : ${visibilityElement.textContent}

`;

    const blob=

    new Blob([report],{

        type:"text/plain"

    });

    const link=

    document.createElement("a");

    link.href=

    URL.createObjectURL(blob);

    link.download=

    `${currentCity}-weather.txt`;

    link.click();

}


const downloadButton=

document.createElement("button");

downloadButton.innerHTML=

'<i class="fa-solid fa-download"></i>';

downloadButton.className=

"downloadBtn";

document

.querySelector("header")

.appendChild(downloadButton);

downloadButton.addEventListener(

"click",

downloadReport

);


/*==========================
      KEYBOARD SHORTCUTS
===========================*/

document.addEventListener(

"keydown",

(e)=>{

    if(e.ctrlKey && e.key==="l"){

        e.preventDefault();

        getCurrentLocation();

    }

    if(e.ctrlKey && e.key==="k"){

        e.preventDefault();

        searchInput.focus();

    }

});


/*==========================
      EXTEND WEATHER UPDATE
===========================*/

const previousDisplay =

displayCurrentWeather;

displayCurrentWeather = function(data){

    previousDisplay(data);

    updateWeatherEffect();

    weatherAlert();

};


/*==========================
      INITIALIZE
===========================*/

window.addEventListener(

"load",

()=>{

    requestNotification();

});

/*=========================================================
        script.js (Part 7)
        Advanced Features
=========================================================*/


/*==========================
        AUTOCOMPLETE
===========================*/

const popularCities = [

    "New York",
    "London",
    "Delhi",
    "Mumbai",
    "Chandigarh",
    "Tokyo",
    "Paris",
    "Sydney",
    "Dubai",
    "Singapore",
    "Berlin",
    "Toronto",
    "Moscow",
    "Beijing",
    "Bangkok"

];

const suggestionBox = document.createElement("div");
suggestionBox.className = "suggestions";

searchInput.parentElement.appendChild(suggestionBox);

searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    suggestionBox.innerHTML = "";

    if (value.length === 0) return;

    const matches = popularCities.filter(city =>
        city.toLowerCase().startsWith(value)
    );

    matches.forEach(city => {

        const item = document.createElement("div");

        item.className = "suggestion-item";

        item.textContent = city;

        item.onclick = () => {

            searchInput.value = city;

            suggestionBox.innerHTML = "";

            fetchCurrentWeather(city);

        };

        suggestionBox.appendChild(item);

    });

});


/*==========================
        SEARCH HISTORY UI
===========================*/

function displayHistory(){

    const history = getHistory();

    console.log("Recent Searches");

    history.forEach(city=>{

        console.log(city);

    });

}


/*==========================
        LANGUAGE SUPPORT
===========================*/

const language = {

    en:{
        humidity:"Humidity",
        wind:"Wind",
        pressure:"Pressure",
        visibility:"Visibility"
    },

    hi:{
        humidity:"आर्द्रता",
        wind:"हवा",
        pressure:"दबाव",
        visibility:"दृश्यता"
    }

};

let currentLanguage = "en";

function changeLanguage(lang){

    currentLanguage = lang;

    console.log(

        "Language Changed:",

        lang

    );

}


/*==========================
        UV INDEX
===========================*/

function estimateUV(){

    if(!weatherData) return;

    const uv =

    Math.floor(

        Math.random()*11

    );

    console.log(

        "Estimated UV:",

        uv

    );

}


/*==========================
        WIND DIRECTION
===========================*/

function windDirection(deg){

    const directions=[

        "N",

        "NE",

        "E",

        "SE",

        "S",

        "SW",

        "W",

        "NW"

    ];

    return directions[

        Math.round(

            deg/45

        )%8

    ];

}


/*==========================
        SHOW WIND
===========================*/

function updateWindDirection(){

    if(!weatherData) return;

    console.log(

        "Direction:",

        windDirection(

            weatherData.wind.deg

        )

    );

}


/*==========================
        NETWORK STATUS
===========================*/

window.addEventListener(

"offline",

()=>{

    showToast(

        "⚠ You're Offline"

    );

});


window.addEventListener(

"online",

()=>{

    showToast(

        "✅ Back Online"

    );

});


/*==========================
        CACHE LAST WEATHER
===========================*/

function cacheWeather(){

    if(weatherData){

        localStorage.setItem(

            "lastWeather",

            JSON.stringify(weatherData)

        );

    }

}


function loadCachedWeather(){

    const cache =

    localStorage.getItem(

        "lastWeather"

    );

    if(cache){

        weatherData =

        JSON.parse(cache);

        displayCurrentWeather(

            weatherData

        );

    }

}


/*==========================
        PAGE VISIBILITY
===========================*/

document.addEventListener(

"visibilitychange",

()=>{

    if(document.hidden){

        console.log(

            "Tab Hidden"

        );

    }else{

        fetchCurrentWeather(

            currentCity

        );

    }

});


/*==========================
        PERFORMANCE TIMER
===========================*/

console.time("Weather Load");

window.addEventListener(

"load",

()=>{

    console.timeEnd(

        "Weather Load"

    );

});


/*==========================
        SAVE CACHE
===========================*/

const oldDisplayWeather =

displayCurrentWeather;

displayCurrentWeather = function(data){

    oldDisplayWeather(data);

    cacheWeather();

    estimateUV();

    updateWindDirection();

};


/*==========================
        INITIALIZE
===========================*/

window.addEventListener(

"load",

()=>{

    loadCachedWeather();

    displayHistory();

});

/*=========================================================
        script.js (Part 8)
        Final Initialization & Utility Functions
=========================================================*/


/*==========================
      SMOOTH SCROLL
===========================*/

document.querySelectorAll('a[href^="#"]').forEach(link=>{

    link.addEventListener("click",e=>{

        e.preventDefault();

        const target=document.querySelector(

            link.getAttribute("href")

        );

        if(target){

            target.scrollIntoView({

                behavior:"smooth"

            });

        }

    });

});


/*==========================
      PAGE LOADER
===========================*/

window.addEventListener("load",()=>{

    document.body.classList.remove("loading");

});


/*==========================
      CLOCK
===========================*/

function updateClock(){

    const now=new Date();

    const time=now.toLocaleTimeString(

        "en-US",

        {

            hour:"2-digit",

            minute:"2-digit",

            second:"2-digit"

        }

    );

    console.log(

        "Current Time:",

        time

    );

}

setInterval(updateClock,1000);


/*==========================
      RANDOM WEATHER TIP
===========================*/

const weatherTips=[

"☀ Wear sunglasses on sunny days.",

"🌧 Carry an umbrella today.",

"💧 Stay hydrated during hot weather.",

"🧥 Wear warm clothes in cold weather.",

"⚡ Avoid open areas during thunderstorms.",

"🌬 Strong winds expected, secure loose items.",

"🚶 Perfect weather for a walk!"

];

function showWeatherTip(){

    const tip=

    weatherTips[

        Math.floor(

            Math.random()*

            weatherTips.length

        )

    ];

    showToast(tip);

}


/*==========================
      REFRESH BUTTON
===========================*/

const refreshButton=

document.createElement("button");

refreshButton.className=

"refreshBtn";

refreshButton.innerHTML=

'<i class="fa-solid fa-rotate"></i>';

document

.querySelector("header")

.appendChild(refreshButton);

refreshButton.addEventListener(

"click",

()=>{

    fetchCurrentWeather(

        currentCity

    );

    showToast(

        "Weather Updated"

    );

});


/*==========================
      COPY WEATHER
===========================*/

function copyWeather(){

    const text=`

City : ${currentCity}

Temperature : ${tempElement.textContent}

Condition : ${conditionElement.textContent}

Humidity : ${humidityElement.textContent}

Wind : ${windElement.textContent}

Pressure : ${pressureElement.textContent}

`;

    navigator.clipboard.writeText(text);

    showToast(

        "Weather copied."

    );

}

const copyButton=

document.createElement("button");

copyButton.className=

"copyBtn";

copyButton.innerHTML=

'<i class="fa-solid fa-copy"></i>';

document

.querySelector("header")

.appendChild(copyButton);

copyButton.onclick=

copyWeather;


/*==========================
      FULLSCREEN
===========================*/

const fullscreenButton=

document.createElement("button");

fullscreenButton.className=

"fullscreenBtn";

fullscreenButton.innerHTML=

'<i class="fa-solid fa-expand"></i>';

document

.querySelector("header")

.appendChild(fullscreenButton);

fullscreenButton.onclick=()=>{

    if(!document.fullscreenElement){

        document.documentElement.requestFullscreen();

    }

    else{

        document.exitFullscreen();

    }

};


/*==========================
      ESC SHORTCUT
===========================*/

document.addEventListener(

"keydown",

e=>{

    if(e.key==="Escape"){

        suggestionBox.innerHTML="";

    }

});


/*==========================
      APP VERSION
===========================*/

const APP={

    name:"WeatherPro",

    version:"1.0.0",

    author:"Your Name"

};

console.table(APP);


/*==========================
      APP INITIALIZATION
===========================*/

async function initializeApp(){

    try{

        loadTheme();

        loadUnit();

        loadFavorites();

        loadCachedWeather();

        dateElement.textContent=

        formatDate();

        await fetchCurrentWeather(

            currentCity

        );

        updateClock();

        showWeatherTip();

        console.log(

            "WeatherPro Initialized"

        );

    }

    catch(error){

        console.error(

            error

        );

    }

}


/*==========================
      START APP
===========================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeApp();

});


/*==========================
      DEBUG MODE
===========================*/

function debug(){

    console.log({

        city:currentCity,

        unit:currentUnit,

        weatherData,

        forecastData

    });

}

// Call debug() in console if needed.