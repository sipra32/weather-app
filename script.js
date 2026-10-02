const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");

const weatherCard = document.getElementById("weather-card");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("weather-description");

const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feels-like");

const forecast = document.getElementById("forecast");


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        return;
    }

    errorMessage.textContent = "";
    weatherCard.hidden = true;
    loading.hidden = false;

    try {

        // Step 1: Find city coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
            throw new Error("Unable to find the city.");
        }

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found.");
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Step 2: Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data.");
        }

        // Step 3: Convert response into JSON
        const weatherData = await weatherResponse.json();

        // Step 4: Display the data
        displayWeather(location, weatherData);

    } catch (error) {

        errorMessage.textContent = error.message;

    } finally {

        loading.hidden = true;
    }
});


function displayWeather(location, data) {

    cityName.textContent =
        `${location.name}, ${location.country}`;

    temperature.textContent =
        Math.round(data.current.temperature_2m);

    description.textContent =
        getWeatherDescription(data.current.weather_code);

    wind.textContent =
        `${data.current.wind_speed_10m} km/h`;

    humidity.textContent =
        `${data.current.relative_humidity_2m}%`;

    feelsLike.textContent =
        `${Math.round(data.current.apparent_temperature)}°C`;

    displayForecast(data);

    weatherCard.hidden = false;
}


function displayForecast(data) {

    forecast.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const date = new Date(data.daily.time[i]);

        const card = document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <strong>
                ${date.toLocaleDateString("en-US", {
                    weekday: "short"
                })}
            </strong>

            <p>
                ${getWeatherDescription(data.daily.weather_code[i])}
            </p>

            <p>
                ${Math.round(data.daily.temperature_2m_max[i])}°C
            </p>

            <p>
                ${Math.round(data.daily.temperature_2m_min[i])}°C
            </p>
        `;

        forecast.appendChild(card);
    }
}


function getWeatherDescription(code) {

    const weatherCodes = {

        0: "Clear sky",

        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",

        45: "Fog",
        48: "Rime fog",

        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",

        61: "Light rain",
        63: "Moderate rain",
        65: "Heavy rain",

        71: "Light snow",
        73: "Moderate snow",
        75: "Heavy snow",

        80: "Light rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",

        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherCodes[code] || "Unknown weather";
}