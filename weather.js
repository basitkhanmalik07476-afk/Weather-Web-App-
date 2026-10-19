/* =========================================================
   WEATHERNOW
   COMPLETE WEATHER APP
   Open-Meteo API
   ========================================================= */


/* =========================================================
   API
   ========================================================= */

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


/* =========================================================
   DOM
   ========================================================= */

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const searchResults =
    document.getElementById("searchResults");

const searchMessage =
    document.getElementById("searchMessage");

const locationBtn =
    document.getElementById("locationBtn");

const themeBtn =
    document.getElementById("themeBtn");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");


/* Current Weather */

const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const currentDate =
    document.getElementById("currentDate");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const windDirection =
    document.getElementById("windDirection");

const cloudCover =
    document.getElementById("cloudCover");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");


/* Forecast */

const hourlyForecast =
    document.getElementById("hourlyForecast");

const dailyForecast =
    document.getElementById("dailyForecast");


/* Details */

const precipitation =
    document.getElementById("precipitation");

const rainProbability =
    document.getElementById("rainProbability");

const uvIndex =
    document.getElementById("uvIndex");

const visibility =
    document.getElementById("visibility");


/* Footer */

const year =
    document.getElementById("year");


/* Chart */

const chartCanvas =
    document.getElementById("temperatureChart");


/* =========================================================
   VARIABLES
   ========================================================= */

let temperatureChart = null;

let currentLocation = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    /* Year */

    year.textContent =
        new Date().getFullYear();


    /* Load theme */

    loadTheme();


    /* Search */

    searchBtn.addEventListener(
        "click",
        searchCity
    );


    cityInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchCity();

            }

        }
    );


    /* Location */

    locationBtn.addEventListener(
        "click",
        useMyLocation
    );


    /* Theme */

    themeBtn.addEventListener(
        "click",
        toggleTheme
    );


    /* Load last city */

    loadLastCity();

}


/* =========================================================
   SEARCH CITY
   ========================================================= */

async function searchCity() {

    const city =
        cityInput.value.trim();


    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;

    }


    setLoading(true);

    searchResults.innerHTML = "";

    searchMessage.textContent =
        "Searching locations...";


    try {

        const url =
            `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=6&language=en&format=json`;


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Geocoding request failed."
            );

        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            searchMessage.textContent =
                "No city found. Try another name.";

            return;

        }


        searchMessage.textContent =
            "Select a location:";


        showSearchResults(
            data.results
        );

    }

    catch (error) {

        console.error(error);

        showError(
            "Could not search for this city."
        );

    }

    finally {

        setLoading(false);

    }

}


/* =========================================================
   SEARCH RESULTS
   ========================================================= */

function showSearchResults(results) {

    searchResults.innerHTML = "";


    results.forEach(
        (location, index) => {

            const card =
                document.createElement("div");


            card.className =
                "result-card";


            const state =
                location.admin1
                    ? `${location.admin1}, `
                    : "";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(location.name)}
                </h3>

                <p>
                    ${escapeHTML(state)}
                    ${escapeHTML(
                        location.country || ""
                    )}
                </p>

                <p>
                    ${Number(
                        location.latitude
                    ).toFixed(2)},
                    ${Number(
                        location.longitude
                    ).toFixed(2)}
                </p>

                <button>
                    Select Location
                </button>

            `;


            const button =
                card.querySelector("button");


            button.addEventListener(
                "click",
                function () {

                    selectCity(
                        location
                    );

                }
            );


            searchResults.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SELECT CITY
   ========================================================= */

function selectCity(location) {

    currentLocation = {

        name: location.name,

        country:
            location.country || "",

        state:
            location.admin1 || "",

        latitude:
            Number(location.latitude),

        longitude:
            Number(location.longitude)

    };


    searchResults.innerHTML = "";

    searchMessage.textContent =
        "";


    cityInput.value =
        location.name;


    saveLastCity(
        currentLocation
    );


    getWeather(
        currentLocation
    );

}


/* =========================================================
   GET WEATHER
   ========================================================= */

async function getWeather(location) {

    setLoading(true);


    try {

        const params =
            new URLSearchParams({

                latitude:
                    location.latitude,

                longitude:
                    location.longitude,

                current:
                    [
                        "temperature_2m",
                        "relative_humidity_2m",
                        "apparent_temperature",
                        "weather_code",
                        "wind_speed_10m",
                        "wind_direction_10m",
                        "cloud_cover",
                        "precipitation"
                    ].join(","),

                hourly:
                    [
                        "temperature_2m",
                        "precipitation_probability",
                        "precipitation",
                        "weather_code",
                        "visibility",
                        "uv_index"
                    ].join(","),

                daily:
                    [
                        "weather_code",
                        "temperature_2m_max",
                        "temperature_2m_min",
                        "precipitation_sum",
                        "precipitation_probability_max",
                        "uv_index_max",
                        "sunrise",
                        "sunset"
                    ].join(","),

                timezone: "auto",

                forecast_days: 7

            });


        const response =
            await fetch(
                `${WEATHER_API}?${params.toString()}`
            );


        if (!response.ok) {

            throw new Error(
                "Weather request failed."
            );

        }


        const data =
            await response.json();


        console.log(
            "Weather API:",
            data
        );


        updateCurrentWeather(
            data,
            location
        );


        updateHourlyForecast(
            data
        );


        updateDailyForecast(
            data
        );


        updateDetails(
            data
        );


        updateChart(
            data
        );


        updateWeatherBackground(
            data.current.weather_code
        );


        searchMessage.textContent =
            `Weather updated for ${location.name}.`;


    }

    catch (error) {

        console.error(error);

        showError(
            "Unable to load weather data."
        );

    }

    finally {

        setLoading(false);

    }

}


/* =========================================================
   CURRENT WEATHER
   ========================================================= */

function updateCurrentWeather(
    data,
    location
) {

    const current =
        data.current;


    cityName.textContent =
        location.name;


    countryName.textContent =
        location.state
            ? `${location.state}, ${location.country}`
            : location.country;


    currentDate.textContent =
        formatDate(
            new Date()
        );


    temperature.textContent =
        Math.round(
            current.temperature_2m
        );


    feelsLike.textContent =
        Math.round(
            current.apparent_temperature
        );


    humidity.textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;


    wind.textContent =
        Math.round(
            current.wind_speed_10m
        );


    windDirection.textContent =
        getWindDirection(
            current.wind_direction_10m
        );


    cloudCover.textContent =
        Math.round(
            current.cloud_cover
        );


    weatherDescription.textContent =
        getWeatherDescription(
            current.weather_code
        );


    weatherIcon.textContent =
        getWeatherIcon(
            current.weather_code
        );


    const today =
        data.daily;


    sunrise.textContent =
        formatTime(
            today.sunrise[0]
        );


    sunset.textContent =
        formatTime(
            today.sunset[0]
        );

}


/* =========================================================
   HOURLY FORECAST
   ========================================================= */

function updateHourlyForecast(data) {

    hourlyForecast.innerHTML = "";


    const hourly =
        data.hourly;


    const start =
        findCurrentHour(
            hourly.time
        );


    const end =
        Math.min(
            start + 12,
            hourly.time.length
        );


    for (
        let i = start;
        i < end;
        i++
    ) {

        const card =
            document.createElement("div");


        card.className =
            "hour-card";


        card.innerHTML = `

            <small>
                ${formatHour(
                    hourly.time[i]
                )}
            </small>

            <span class="icon">
                ${getWeatherIcon(
                    hourly.weather_code[i]
                )}
            </span>

            <strong>
                ${Math.round(
                    hourly.temperature_2m[i]
                )}°C
            </strong>

        `;


        hourlyForecast.appendChild(
            card
        );

    }

}


/* =========================================================
   DAILY FORECAST
   ========================================================= */

function updateDailyForecast(data) {

    dailyForecast.innerHTML = "";


    const daily =
        data.daily;


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const card =
            document.createElement("div");


        card.className =
            "day-card";


        card.innerHTML = `

            <small>
                ${getDayName(
                    daily.time[i],
                    i
                )}
            </small>

            <span class="icon">
                ${getWeatherIcon(
                    daily.weather_code[i]
                )}
            </span>

            <span class="max">
                ${Math.round(
                    daily.temperature_2m_max[i]
                )}°
            </span>

            <span class="min">
                ${Math.round(
                    daily.temperature_2m_min[i]
                )}°
            </span>

        `;


        dailyForecast.appendChild(
            card
        );

    }

}


/* =========================================================
   ADDITIONAL DETAILS
   ========================================================= */

function updateDetails(data) {

    const current =
        data.current;

    const hourly =
        data.hourly;

    const daily =
        data.daily;


    /* Precipitation */

    precipitation.textContent =
        `${Number(
            current.precipitation || 0
        ).toFixed(1)} mm`;


    /* Rain probability */

    rainProbability.textContent =
        Math.round(
            daily
                .precipitation_probability_max[0]
            || 0
        );


    /* UV */

    uvIndex.textContent =
        Number(
            daily.uv_index_max[0] || 0
        ).toFixed(1);


    /* Visibility */

    const hour =
        findCurrentHour(
            hourly.time
        );


    if (
        hourly.visibility &&
        hourly.visibility[hour] !== undefined
    ) {

        visibility.textContent =
            (
                hourly.visibility[hour]
                / 1000
            ).toFixed(1);

    }

}


/* =========================================================
   CHART
   ========================================================= */

function updateChart(data) {

    if (
        typeof Chart === "undefined"
    ) {

        return;

    }


    const hourly =
        data.hourly;


    const start =
        findCurrentHour(
            hourly.time
        );


    const end =
        Math.min(
            start + 12,
            hourly.time.length
        );


    const labels = [];

    const temperatures = [];


    for (
        let i = start;
        i < end;
        i++
    ) {

        labels.push(
            formatHour(
                hourly.time[i]
            )
        );


        temperatures.push(
            Math.round(
                hourly.temperature_2m[i]
            )
        );

    }


    if (temperatureChart) {

        temperatureChart.destroy();

    }


    const dark =
        document.body.classList.contains(
            "dark"
        );


    temperatureChart =
        new Chart(
            chartCanvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            data:
                                temperatures,

                            borderColor:
                                "#2563eb",

                            backgroundColor:
                                "rgba(37,99,235,0.12)",

                            borderWidth: 3,

                            fill: true,

                            tension: 0.4,

                            pointBackgroundColor:
                                "#2563eb",

                            pointBorderColor:
                                "#ffffff",

                            pointBorderWidth: 2,

                            pointRadius: 4,

                            pointHoverRadius: 7

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                color:
                                    dark
                                        ? "#94a3b8"
                                        : "#64748b"

                            }

                        },

                        y: {

                            ticks: {

                                color:
                                    dark
                                        ? "#94a3b8"
                                        : "#64748b",

                                callback:
                                    value =>
                                        `${value}°`

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   MY LOCATION
   ========================================================= */

function useMyLocation() {

    if (
        !navigator.geolocation
    ) {

        showError(
            "Your browser does not support location."
        );

        return;

    }


    setLoading(true);


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            currentLocation = {

                name: "My Location",

                country: "",

                state: "",

                latitude: latitude,

                longitude: longitude

            };


            cityInput.value =
                "My Location";


            getWeather(
                currentLocation
            );

        },

        function (error) {

            setLoading(false);


            if (
                error.code ===
                error.PERMISSION_DENIED
            ) {

                showError(
                    "Location permission was denied. Please allow location access."
                );

            }

            else {

                showError(
                    "Unable to determine your location."
                );

            }

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 300000

        }

    );

}


/* =========================================================
   WEATHER CODES
   ========================================================= */

function getWeatherDescription(code) {

    const weather = {

        0: "Clear Sky",

        1: "Mainly Clear",

        2: "Partly Cloudy",

        3: "Overcast",

        45: "Foggy",

        48: "Rime Fog",

        51: "Light Drizzle",

        53: "Moderate Drizzle",

        55: "Heavy Drizzle",

        56: "Freezing Drizzle",

        57: "Heavy Freezing Drizzle",

        61: "Light Rain",

        63: "Moderate Rain",

        65: "Heavy Rain",

        66: "Freezing Rain",

        67: "Heavy Freezing Rain",

        71: "Light Snow",

        73: "Moderate Snow",

        75: "Heavy Snow",

        77: "Snow Grains",

        80: "Light Rain Showers",

        81: "Rain Showers",

        82: "Heavy Rain Showers",

        85: "Light Snow Showers",

        86: "Heavy Snow Showers",

        95: "Thunderstorm",

        96: "Thunderstorm with Hail",

        99: "Heavy Thunderstorm"

    };


    return (
        weather[code] ||
        "Unknown Weather"
    );

}


function getWeatherIcon(code) {

    if (code === 0) {

        return "☀️";

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return "🌤️";

    }


    if (code === 3) {

        return "☁️";

    }


    if (
        code === 45 ||
        code === 48
    ) {

        return "🌫️";

    }


    if (
        code >= 51 &&
        code <= 57
    ) {

        return "🌦️";

    }


    if (
        code >= 61 &&
        code <= 67
    ) {

        return "🌧️";

    }


    if (
        code >= 71 &&
        code <= 77
    ) {

        return "❄️";

    }


    if (
        code >= 80 &&
        code <= 82
    ) {

        return "🌦️";

    }


    if (
        code >= 85 &&
        code <= 86
    ) {

        return "🌨️";

    }


    if (code >= 95) {

        return "⛈️";

    }


    return "🌡️";

}


/* =========================================================
   DYNAMIC WEATHER BACKGROUND
   ========================================================= */

function updateWeatherBackground(code) {

    const weather =
        document.getElementById(
            "currentWeather"
        );


    if (!weather) return;


    let background;


    if (code === 0) {

        background =
            "linear-gradient(135deg,#f59e0b,#ef4444)";

    }

    else if (
        code === 1 ||
        code === 2
    ) {

        background =
            "linear-gradient(135deg,#2563eb,#06b6d4)";

    }

    else if (code === 3) {

        background =
            "linear-gradient(135deg,#475569,#64748b)";

    }

    else if (
        code >= 51 &&
        code <= 67
    ) {

        background =
            "linear-gradient(135deg,#1e40af,#475569)";

    }

    else if (
        code >= 71 &&
        code <= 86
    ) {

        background =
            "linear-gradient(135deg,#60a5fa,#64748b)";

    }

    else if (code >= 95) {

        background =
            "linear-gradient(135deg,#312e81,#111827)";

    }

    else {

        background =
            "linear-gradient(135deg,#2563eb,#06b6d4)";

    }


    weather.style.background =
        background;

}


/* =========================================================
   WIND DIRECTION
   ========================================================= */

function getWindDirection(degrees) {

    if (
        degrees === null ||
        degrees === undefined
    ) {

        return "--";

    }


    const directions = [

        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"

    ];


    const index =
        Math.round(
            degrees / 45
        ) % 8;


    return directions[index];

}


/* =========================================================
   CURRENT HOUR
   ========================================================= */

function findCurrentHour(times) {

    const now =
        new Date();


    let closest =
        0;

    let difference =
        Infinity;


    times.forEach(
        (time, index) => {

            const date =
                new Date(time);


            const diff =
                Math.abs(
                    date.getTime()
                    -
                    now.getTime()
                );


            if (diff < difference) {

                difference = diff;

                closest = index;

            }

        }
    );


    return closest;

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(date) {

    return date.toLocaleDateString(
        undefined,
        {

            weekday: "long",

            month: "short",

            day: "numeric"

        }
    );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(value) {

    if (!value) return "--";


    const date =
        new Date(value);


    return date.toLocaleTimeString(
        undefined,
        {

            hour: "numeric",

            minute: "2-digit"

        }
    );

}


/* =========================================================
   FORMAT HOUR
   ========================================================= */

function formatHour(value) {

    const date =
        new Date(value);


    return date.toLocaleTimeString(
        undefined,
        {

            hour: "numeric",

            minute: "2-digit"

        }
    );

}


/* =========================================================
   DAY NAME
   ========================================================= */

function getDayName(
    dateString,
    index
) {

    if (index === 0) {

        return "Today";

    }


    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    return date.toLocaleDateString(
        undefined,
        {
            weekday: "short"
        }
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(show) {

    if (show) {

        loading.classList.add(
            "active"
        );

    }

    else {

        loading.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    errorMessage.textContent =
        message;


    errorMessage.classList.add(
        "show"
    );


    setTimeout(
        function () {

            errorMessage.classList.remove(
                "show"
            );

        },
        4500
    );

}


/* =========================================================
   DARK MODE
   ========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    themeBtn.textContent =
        dark
            ? "☀️"
            : "🌙";


    localStorage.setItem(
        "weather-theme",
        dark
            ? "dark"
            : "light"
    );


    if (temperatureChart) {

        updateChartTheme();

    }

}


/* =========================================================
   LOAD THEME
   ========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            "weather-theme"
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeBtn.textContent =
            "☀️";

    }

}


/* =========================================================
   UPDATE CHART THEME
   ========================================================= */

function updateChartTheme() {

    const dark =
        document.body.classList.contains(
            "dark"
        );


    temperatureChart.options.scales.x.ticks.color =
        dark
            ? "#94a3b8"
            : "#64748b";


    temperatureChart.options.scales.y.ticks.color =
        dark
            ? "#94a3b8"
            : "#64748b";


    temperatureChart.update();

}


/* =========================================================
   SAVE LAST CITY
   ========================================================= */

function saveLastCity(location) {

    localStorage.setItem(
        "weather-last-location",
        JSON.stringify(location)
    );

}


/* =========================================================
   LOAD LAST CITY
   ========================================================= */

function loadLastCity() {

    const saved =
        localStorage.getItem(
            "weather-last-location"
        );


    if (!saved) {

        return;

    }


    try {

        const location =
            JSON.parse(saved);


        currentLocation =
            location;


        cityInput.value =
            location.name;


        getWeather(
            location
        );

    }

    catch (error) {

        console.error(
            "Could not load saved location.",
            error
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    const element =
        document.createElement("div");


    element.textContent =
        value ?? "";


    return element.innerHTML;

}


