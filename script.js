// TEST URLS
// https://api.openweathermap.org/data/2.5/onecall?lat=-0.10689522222222221&lon=-78.482827&units=metric&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee
// https://api.openweathermap.org/data/2.5/weather?q=quito&units=metric&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee

// API DOCS
// https://openweathermap.org/current

const displayLocation = document.querySelector('[data-coordinates]')
const displayError = document.querySelector('[data-errors]')
let lat = ''
let lon = ''
const apiKey = '7e3a8bbdc4b7590ed50d2f86fa3ebaee'
const apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid={API key}'

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getPosition, handleError)
  } else { 
    displayError.innerText = 'Geolocation is not supported by this browser.'
  }
}

function getPosition(position) {
    lat = position.coords.latitude
    lon = position.coords.longitude
  displayLocation.innerText = 'Latitude: ' + position.coords.latitude + 
  '<br>Longitude: ' + position.coords.longitude
}

function excludeData(parts) {
    const excludeParts = {
        current: 'current',
        minutely: 'minutely',
        hourly: 'hourly',
        daily: 'daily',
        alerts: 'alerts'
    }
    return ''
}

async function fetchWeatherDataCurrentLocation() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric${excludeData()}&appid=${apiKey}`)
        const data = await response.json()
        console.log(data)
    } catch (error) {
        console.log(error)
        displayError.innerText = 'Failed to reach the API with error: ' + error.message
    }
}

async function fetchWeatherDataByCity(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        const data = await response.json()
        console.log(data)
    } catch (error) {
        console.log(error)
        displayError.innerText = 'Failed to reach the API with error: ' + error.message
    }
}

function handleError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            displayError.innerText = 'User denied the request for Geolocation.'
            break
        case error.POSITION_UNAVAILABLE:
            displayError.innerText = 'Location information is unavailable.'
            break
        case error.TIMEOUT:
            displayError.innerText = 'The request to get user location timed out.'
            break
        case error.UNKNOWN_ERROR:
            displayError.innerText = 'An unknown error occurred.'
            break
    }
}

getLocation()