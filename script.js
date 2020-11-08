// TEST URLS
// https://api.openweathermap.org/data/2.5/onecall?lat=-0.11&lon=-78.48&units=metric&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee
// https://api.openweathermap.org/data/2.5/weather?q=quito&units=metric&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee
// https://api.openweathermap.org/data/2.5/forecast/daily?q=london&cnt=7&appid=7e3a8bbdc4b7590ed50d2f86fa3ebaee

// ICON URL is http://openweathermap.org/img/wn/{iconcode}@2x.png

// API DOCS
// https://openweathermap.org/api

const displayLocation = document.querySelector('[data-coordinates]')
const displayError = document.querySelector('[data-errors]')
const searchInput = document.querySelector('[data-weather-query]')
const locationIcon = document.querySelector('[data-weather-current-location]')
const unitsCelsius = document.querySelector('[data-weather-celsius]') 
const unitsFahrenheit = document.querySelector('[data-weather-fahrenheit]')
const coordinatesBlock = document.querySelector('[data-coordinates]')
const latitudeText = document.querySelector('[data-latitude]')
const longitudeText = document.querySelector('[data-longitude]')
const weatherWidget = document.querySelector('[data-weather-widget]')

const apiKey = '7e3a8bbdc4b7590ed50d2f86fa3ebaee'
let lat = ''
let lon = ''
let city = ''
let actionType = 'location'
let unitsType = 'metric'

function toggleLoader(show) {
	const loaderOverlay = document.getElementById('loading')
	if (show) {
		loaderOverlay.classList.remove('hidden')
	} else {
		loaderOverlay.classList.add('hidden')
	}
}

function toggleError(show) {
	if (show) {
		displayError.classList.remove('hidden')
	} else {
		displayError.classList.add('hidden')
	}
}

function toggleCoordinatesBlock(show) {
	if (show) {
		coordinatesBlock.classList.remove('hidden')
	} else {
		coordinatesBlock.classList.add('hidden')
	}
}

function toggleUnitActive(show) {
	if (show) {
		unitsFahrenheit.classList.add('active')
		unitsCelsius.classList.remove('active')
	} else {
		unitsFahrenheit.classList.remove('active')
		unitsCelsius.classList.add('active')
	}
}

function toggleWeatherWidget(show) {
	if (show) {
		weatherWidget.classList.remove('hidden')
	} else {
		weatherWidget.classList.add('hidden')
	}
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition, handleError)
	} else {
		toggleError(true)
		displayError.innerText = 'Geolocation is not supported by this browser.'
	}
}

function getPosition(position) {
	lat = position.coords.latitude
	lon = position.coords.longitude
	
	// Reset the search input
	searchInput.value = ''

    latitudeText.innerText = Number(position.coords.latitude).toFixed(2)
    longitudeText.innerText = Number(position.coords.longitude).toFixed(2)
	toggleCoordinatesBlock(true)
	
	actionType = 'location'

    // Once position is set, fetch the weather data
    fetchWeatherDataByCurrentLocation()
}

// @ToDo
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

function getDayShortName(timestamp) {
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	const date = new Date(timestamp * 1000)

	return days[date.getDay()]
}

function widgetTemplate(data) {
	const { name } = data
	const { temp, feels_like }  = data.main ? data.main : data.current ? data.current : undefined
	const temp_min = data.main ? data.main.temp_min : undefined
	const temp_max = data.main ? data.main.temp_max : undefined
	const weather = data.weather ? data.weather : data.current ? data.current.weather : []
	const { id, icon, main, description } = weather[0] ? weather[0] : undefined
	const daily = data.daily ? data.daily : []

	const limit = 3

	const html = `
		<div class="left_widget">
			<div class="place">
				<svg class="svg_location_icon">
					<path fill="#ffffff" d="M12,2a8,8,0,0,0-8,8c0,5.4,7.05,11.5,7.35,11.76a1,1,0,0,0,1.3,0C13,21.5,20,15.4,20,10A8,8,0,0,0,12,2Zm0,17.65c-2.13-2-6-6.31-6-9.65a6,6,0,0,1,12,0C18,13.34,14.13,17.66,12,19.65ZM12,6a4,4,0,1,0,4,4A4,4,0,0,0,12,6Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,12Z" />
				</svg>
				<span class="place_name">${name ? name : 'Current Location'}</span>
			</div>
			<div class="icon_degs">
				<span class="icon"><i class="wi wi-owm-${icon.includes('d') ? 'day' : 'night'}-${id}"></i></span>
				<div class="degs_desc">
					<span class="degs">${temp}&deg;</span>
					<span class="main">${main}</span>
				</div>
			</div>
		</div>
		<div class="right_widget">
			<div class="forcast">
			${daily.length 
				? daily.map((e, i) => {
					if (i >= limit) return
					return (`
						<div class="daily">
							<span><i class="wi wi-owm-${e.weather[0].icon.includes('d') ? 'day' : 'night'}-${e.weather[0].id}"></i></span>
							<span>${getDayShortName(e.dt)}</span>
						</div>
					`)
					}).join('')
				: ''
			}
			${temp_min && temp_max
				? (`
					<div class="city_info">
						<span class="description">${description}</span>
						<span>${temp_max}&deg; / ${temp_min}&deg;</span>
						<span>Feels like ${feels_like}&deg;</span>
					</div>
				`)
				: ''
			}
			</div>
			<div class="date_updated">Updated ${new Date().toLocaleString('en-GB')}</div>
		</div>
	`

	return html
}

function renderWidget(data) {
	const html = widgetTemplate(data)

	weatherWidget.innerHTML = ''
	weatherWidget.insertAdjacentHTML('beforeend', html)
	toggleWeatherWidget(true)
}

async function fetchWeatherDataByCurrentLocation() {
	try {
		if (apiKey == '') throw new Error('Missing API Key')

		toggleError()
		toggleLoader(true)

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${unitsType}${excludeData()}&appid=${apiKey}`
		)
		const data = await response.json()

		renderWidget(data)
		toggleLoader()
	} catch (error) {
		toggleError(true)
		displayError.innerText = `Failed to reach the API with error: ${error.message}`
		toggleLoader()
	}
}

async function fetchWeatherDataByCity(query) {
	try {
		if (apiKey == '') throw new Error('Missing API Key')

		toggleError()
		toggleLoader(true)

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${unitsType}&appid=${apiKey}`
		)
		const data = await response.json()
		
		if (data.cod && data.cod !== 200) {
			throw new Error(data.message)
		} else {
			renderWidget(data)
		}
		
		toggleLoader()
	} catch (error) {
		toggleError(true)
		displayError.innerText = `Failed to reach the API with error: ${error.message}`
		toggleLoader()
	}
}

function handleError(error) {
	toggleLoader()
	toggleError(true)
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
		actionType = 'city'

		city = e.target.value
		fetchWeatherDataByCity(city)
		e.target.blur()
		toggleCoordinatesBlock()
	}
})

locationIcon.addEventListener('click', getLocation)

unitsCelsius.addEventListener('click', () => {
	unitsType = 'metric'

	if (actionType == 'location') {
		if (!lat && !lon) return
		fetchWeatherDataByCurrentLocation()
	} else {
		if (!city) return
		fetchWeatherDataByCity(city)
	}

	toggleUnitActive()
})

unitsFahrenheit.addEventListener('click', () => {
	unitsType = 'imperial'

	if (actionType == 'location') {
		if (!lat && !lon) return
		fetchWeatherDataByCurrentLocation()
	} else {
		if (!city) return
		fetchWeatherDataByCity(city)
	}

	toggleUnitActive(true)
})