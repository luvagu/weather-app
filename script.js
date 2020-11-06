// TEST URLS
// https://api.openweathermap.org/data/2.5/onecall?lat=-0.10689522222222221&lon=-78.482827&units=metric&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee
// https://api.openweathermap.org/data/2.5/weather?q=quito&units=metric&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee

// ICON URL is http://openweathermap.org/img/wn/{iconcode}@2x.png

// API DOCS
// https://openweathermap.org/current

const displayLocation = document.querySelector('[data-coordinates]')
const displayError = document.querySelector('[data-errors]')
const searchInput = document.querySelector('[data-weather-query]')
const locationIcon = document.querySelector('[data-weather-current-location]')
const unitsCelsius = document.querySelector('[data-weather-celsius]') 
const unitsFahrenheit = document.querySelector('[data-weather-fahrenheit]')
const coordinatesBlock = document.getElementById('coordinatesBlock')
const latitudeText = document.querySelector('[data-latitude]')
const longitudeText = document.querySelector('[data-longitude]')

const apiKey = '7e3a8bbdc4b7590ed50d2f86fa3ebaee'
let lat = ''
let lon = ''
let city = ''
let actionType = 'location'

function toggleLoader(show) {
	const loaderOverlay = document.getElementById('loading')
	if (show) {
		loaderOverlay.style.display = 'flex'
	} else {
		loaderOverlay.style.display = 'none'
	}
}

function getLocation() {
	if (navigator.geolocation) {
        toggleLoader(true)
		navigator.geolocation.getCurrentPosition(getPosition, handleError)
	} else {
		toggleLoader()
		displayError.innerText = 'Geolocation is not supported by this browser.'
	}
}

function getPosition(position) {
	lat = position.coords.latitude
    lon = position.coords.longitude

    latitudeText.innerText = position.coords.latitude
    longitudeText.innerText = position.coords.longitude
    coordinatesBlock.style.display = 'block'

    // Once position is set, fetch the weather data
    fetchWeatherDataByCurrentLocation()
}

function excludeData(parts) {
	const excludeParts = {
		current: 'current',
		minutely: 'minutely',
		hourly: 'hourly',
		daily: 'daily',
		alerts: 'alerts',
	}
	return ''
}

async function fetchWeatherDataByCurrentLocation(units = 'metric') {
    console.log('lat >>>', lat)
    console.log('lon >>>', lon)
	try {
		if (apiKey == '') throw new Error('Missing API Key')
		//toggleLoader(true)
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}${excludeData()}&appid=${apiKey}`
		)
		const data = await response.json()
		console.log(data)
		toggleLoader()
	} catch (error) {
		displayError.innerText = `Failed to reach the API with error: ${error.message}`
	}
}

async function fetchWeatherDataByCity(query, units = 'metric') {
	try {
		if (apiKey == '') throw new Error('Missing API Key')
		toggleLoader(true)
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${units}&appid=${apiKey}`
		)
		const data = await response.json()
		console.log(data)
		toggleLoader()
	} catch (error) {
        displayError.innerText = `Failed to reach the API with error: ${error.message}`
	}
}

function handleError(error) {
    toggleLoader()
	switch (error.code) {
		case error.PERMISSION_DENIED:
			displayError.innerText = 'User denied the request for Geolocation.'
			break
		case error.POSITION_UNAVAILABLE:
			displayError.innerText = 'Location information is unavailable.'
			break
		case error.TIMEOUT:
			displayError.innerText =
				'The request to get user location timed out.'
			break
		case error.UNKNOWN_ERROR:
			displayError.innerText = 'An unknown error occurred.'
			break
	}
}

searchInput.addEventListener('keydown', (e) => {
	if (e.key == 'Enter') {
		city = e.target.value
		fetchWeatherDataByCity(city, units = 'metric')
		e.target.blur()
	}
})

locationIcon.addEventListener('click', getLocation)

