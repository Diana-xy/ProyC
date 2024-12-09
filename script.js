const API_KEY = 'f43cf20628e1a8b04f2b69a4f4f1da4d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

const cityInput = document.getElementById('city_input');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');

async function getCityCoordinates(city) {
    const response = await fetch(`${GEO_URL}?q=${city}&limit=1&appid=${API_KEY}`);
    const data = await response.json();
    if (data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
    } else {
        alert('Ciudad no encontrada');
        return null;
    }
}

async function getWeatherData(lat, lon) {
    const response = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await response.json();
    return data;
}

async function getForecastData(lat, lon) {
    const response = await fetch(`${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await response.json();
    return data;
}

async function getAirQualityData(lat, lon) {
    const response = await fetch(`${BASE_URL}air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const data = await response.json();
    return data;
}

function displayWeatherData(weatherData) {
    const tempElement = document.querySelector('.ubicacion-actual h2');
    const weatherElement = document.querySelector('.ubicacion-actual p:nth-of-type(2)');
    const iconElement = document.querySelector('.weather-icon img');

    tempElement.textContent = `${weatherData.main.temp}°C`;
    weatherElement.textContent = weatherData.weather[0].description;
    iconElement.src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

    document.getElementById('humidityVal').textContent = `${weatherData.main.humidity}%`;
    document.getElementById('pressureVal').textContent = `${weatherData.main.pressure} hPa`;
    document.getElementById('visibilityVal').textContent = `${(weatherData.visibility / 1000).toFixed(1)} Km`;
    document.getElementById('WindSpeedVal').textContent = `${weatherData.wind.speed} m/s`;
    document.getElementById('feelsVal').textContent = `${weatherData.main.feels_like}°C`;
}

function displayForecastData(forecastData) {
    const forecastContainer = document.querySelector('.day-forecast');
    forecastContainer.innerHTML = ''; 

    const dailyForecasts = forecastData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
    );

    dailyForecasts.forEach((day) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
        const temperature = Math.round(day.main.temp);
        const weatherIcon = day.weather[0].icon;
        const description = day.weather[0].description;

        const forecastHTML = `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${description}">
                    <span>${temperature}°C</span>
                </div>
                <p>${dayName}</p>
                <p>${description}</p>
            </div>
        `;
        forecastContainer.innerHTML += forecastHTML;
    });
}

function displayAirQualityData(airQualityData) {
    const airIndex = document.querySelector('.air-index');
    const pollutants = airQualityData.list[0].components;

    airIndex.textContent = getAirQualityDescription(airQualityData.list[0].main.aqi);
    document.querySelector('.air-indices .item:nth-of-type(1) h2').textContent = `${pollutants.pm2_5} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(2) h2').textContent = `${pollutants.pm10} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(3) h2').textContent = `${pollutants.so2} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(4) h2').textContent = `${pollutants.co} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(5) h2').textContent = `${pollutants.no} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(6) h2').textContent = `${pollutants.no2} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(7) h2').textContent = `${pollutants.nh3} µg/m³`;
    document.querySelector('.air-indices .item:nth-of-type(8) h2').textContent = `${pollutants.o3} µg/m³`;
}

function getAirQualityDescription(aqi) {
    const descriptions = ['Bueno', 'Moderado', 'Dañino', 'Muy Dañino', 'Peligroso'];
    return descriptions[aqi - 1];
}

async function getHourlyForecast(lat, lon) {
    const response = await fetch(`${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await response.json();
    return data.list; 
}

function displayHourlyForecast(hourlyData) {
    const hourlyContainer = document.querySelector('.hourly-forecast');
    hourlyContainer.innerHTML = ''; 


    for (let i = 0; i < 8; i++) {
        const forecast = hourlyData[i];
        const forecastTime = new Date(forecast.dt * 1000).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const forecastTemp = Math.round(forecast.main.temp);
        const forecastIcon = forecast.weather[0].icon;

        const forecastCard = `
            <div class="card">
                <p>${forecastTime}</p>
                <img src="https://openweathermap.org/img/wn/${forecastIcon}@2x.png" alt="Weather Icon">
                <p>${forecastTemp}&deg;C</p>
            </div>
        `;
        hourlyContainer.innerHTML += forecastCard;
    }
}

searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (city) {
        const coordinates = await getCityCoordinates(city);
        if (coordinates) {
            const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
            const forecastData = await getForecastData(coordinates.lat, coordinates.lon);
            const airQualityData = await getAirQualityData(coordinates.lat, coordinates.lon);

            const hourlyData = await getHourlyForecast(coordinates.lat, coordinates.lon);
            displayHourlyForecast(hourlyData);

            displayWeatherData(weatherData);
            displayForecastData(forecastData);
            displayAirQualityData(airQualityData);
        }
    } else {
        alert('Por favor, ingresa una ciudad.');
    }
});


locationBtn.addEventListener('click', () => {
    getUserLocation();
});

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const weatherData = await getWeatherData(lat, lon);
            const forecastData = await getForecastData(lat, lon);
            const airQualityData = await getAirQualityData(lat, lon);

            const hourlyData = await getHourlyForecast(lat, lon);
            displayHourlyForecast(hourlyData);

            displaySunriseSunset(weatherData); 

            displayWeatherData(weatherData);
            displayForecastData(forecastData);
            displayAirQualityData(airQualityData);
        }, () => {
            alert('No se pudo acceder a la ubicación.');
        });
    } else {
        alert('La geolocalización no está soportada en tu navegador.');
    }
}


function displaySunriseSunset(weatherData) {
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const sunriseElement = document.querySelector('.sunrise-sunset .item:nth-of-type(1) h2');
    const sunsetElement = document.querySelector('.sunrise-sunset .item:nth-of-type(2) h2');

    sunriseElement.textContent = sunriseTime;
    sunsetElement.textContent = sunsetTime;
}

searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (city) {
        const coordinates = await getCityCoordinates(city);
        if (coordinates) {
            const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
            const hourlyData = await getHourlyForecast(coordinates.lat, coordinates.lon);
            displayWeatherData(weatherData);
            displayHourlyForecast(hourlyData);
            displaySunriseSunset(weatherData);
        }
    } else {
        alert('Por favor, ingresa una ciudad.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const defaultCity = 'La Paz'; 
    const coordinates = await getCityCoordinates(defaultCity);
    if (coordinates) {
        const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
        const forecastData = await getForecastData(coordinates.lat, coordinates.lon);
        const airQualityData = await getAirQualityData(coordinates.lat, coordinates.lon);
        const hourlyData = await getHourlyForecast(coordinates.lat, coordinates.lon);

        displayWeatherData(weatherData);
        displayForecastData(forecastData);
        displayAirQualityData(airQualityData);
        displayHourlyForecast(hourlyData);
        displaySunriseSunset(weatherData);
    } else {
        console.error('No se pudo cargar los datos iniciales.');
    }
});