let cityInput = document.getElementById('city_input'),
searchBtn = document.getElementById('searchBtn'),
api_key = '764c3760beb7b8c8544dbda49a38c34b';

function getCityCoordinates(){
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if(!cityName) return;
    let GEOCODING_API_URL = `http://api.openweathermap.org/data/2.5/forecast?q={cityName}&appid={api_key}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {console.log(data);
    }).catch(() => {
        alert('Failed to fetch coordinates of ${cityName}');
    })
}

searchBtn.addEventListener('click', getCityCoordinates);