// API Configuration
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Import WeatherAnimation
import WeatherAnimation from './animations/weatherAnimation.js';

// Weather code mapping
const WEATHER_CODES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
};

// Initialize Weather Animation
let weatherAnimation;

// DOM Elements
const currentLocation = document.getElementById('current-location');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const forecastContainer = document.getElementById('forecast-container');
const sidePanel = document.getElementById('side-panel');
const overlay = document.getElementById('overlay');
const addLocationBtn = document.getElementById('add-location');
const closePanelBtn = document.getElementById('close-panel');
const newLocationInput = document.getElementById('new-location');
const saveLocationBtn = document.getElementById('save-location');
const locationsList = document.getElementById('locations-list');
const searchSuggestions = document.getElementById('search-suggestions');
// const forecastScrollLeftBtn = document.getElementById('forecast-scroll-left');
// const forecastScrollRightBtn = document.getElementById('forecast-scroll-right');

// Weather Background Animation
const weatherBg = document.createElement('div');
weatherBg.className = 'weather-bg';
document.body.appendChild(weatherBg);

// State Management
let savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
let currentLocationData = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize weather animation
    weatherAnimation = new WeatherAnimation();

    if (addLocationBtn) addLocationBtn.addEventListener('click', toggleSidePanel);
    if (closePanelBtn) closePanelBtn.addEventListener('click', toggleSidePanel);
    if (overlay) overlay.addEventListener('click', toggleSidePanel);
    if (saveLocationBtn) saveLocationBtn.addEventListener('click', addNewLocation);
    
    // Scroll buttons for forecast (removed as forecast is now vertically scrollable)
    // if (forecastScrollLeftBtn && forecastScrollRightBtn && forecastContainer) {
    //     const scrollAmount = 300; // Adjust scroll distance as needed

    //     forecastScrollLeftBtn.addEventListener('click', () => {
    //         forecastContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    //     });

    //     forecastScrollRightBtn.addEventListener('click', () => {
    //         forecastContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    //     });

    //     const updateScrollButtonsVisibility = () => {
    //         // Buttons should be visible if content overflows, regardless of screen size
    //         const { scrollWidth, clientWidth, scrollLeft } = forecastContainer;

    //         if (scrollWidth > clientWidth) {
    //             // Show left button if not at the beginning
    //             if (scrollLeft > 0) {
    //                 forecastScrollLeftBtn.classList.add('visible');
    //             } else {
    //                 forecastScrollLeftBtn.classList.remove('visible');
    //             }

    //             // Show right button if not at the end
    //             if (scrollLeft + clientWidth < scrollWidth) {
    //                 forecastScrollRightBtn.classList.add('visible');
    //             } else {
    //                 forecastScrollRightBtn.classList.remove('visible');
    //             }
    //         } else {
    //             // Hide both if no scrollbar is needed
    //             forecastScrollLeftBtn.classList.remove('visible');
    //             forecastScrollRightBtn.classList.remove('visible');
    //         }
    //     };

    //     // Initial check and update on scroll/resize
    //     updateScrollButtonsVisibility();
    //     forecastContainer.addEventListener('scroll', updateScrollButtonsVisibility);
    //     window.addEventListener('resize', updateScrollButtonsVisibility);
    // }
    
    // Add event listener for location input to fetch suggestions
    if (newLocationInput) {
        let debounceTimeout;
        newLocationInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const query = newLocationInput.value.trim();
                if (query.length > 2) { // Start searching after 2 characters
                    fetchCitySuggestions(query);
                } else {
                    searchSuggestions.innerHTML = ''; // Clear suggestions if query is too short
                    searchSuggestions.style.display = 'none';
                }
            }, 300); // Debounce time
        });

        newLocationInput.addEventListener('focus', () => {
            if (newLocationInput.value.trim().length > 2) {
                searchSuggestions.style.display = 'block';
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (event) => {
            if (!sidePanel.contains(event.target) && !addLocationBtn.contains(event.target)) {
                searchSuggestions.innerHTML = '';
                searchSuggestions.style.display = 'none';
            }
        });

    }
    
    // Theme toggle logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    const setTheme = (isLight) => {
        document.body.classList.toggle('light-mode', isLight);
        if (themeIcon) {
            themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        }
    };
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setTheme(true);
    else setTheme(false);
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = !document.body.classList.contains('light-mode');
            setTheme(isLight);
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Initialize the app
    init();
});

// Initialize
async function init() {
    try {
        console.log('Initializing app...');
        
        // Get user's location
        const position = await getCurrentPosition();
        console.log('Position received:', position);
        const { latitude, longitude } = position.coords;
        console.log('Coordinates:', { latitude, longitude });
        
        // Get city name for current location
        const currentCityName = await getCityFromCoordinates(latitude, longitude);

        // Set current location data globally
        currentLocationData = {
            name: currentCityName,
            lat: latitude,
            lon: longitude,
            isCurrent: true // Mark as current location
        };

        // Check if current location is already in savedLocations
        const isCurrentLocationSaved = savedLocations.some(loc =>
            loc.lat === latitude && loc.lon === longitude && loc.isCurrent
        );

        if (!isCurrentLocationSaved) {
            // If not saved or not marked as current, ensure it's added/updated
            savedLocations = savedLocations.filter(loc => !loc.isCurrent);
            savedLocations.unshift(currentLocationData); // Add to the beginning
            localStorage.setItem('locations', JSON.stringify(savedLocations));
        }

        // Update weather with coordinates
        await updateWeather(latitude, longitude);
    } catch (error) {
        console.error('Error getting location:', error);
        if (currentLocation) currentLocation.textContent = 'Location access denied';
        const currentWeather = document.querySelector('.current-weather');
        if (currentWeather) {
            currentWeather.innerHTML = `
                <h1>--°</h1>
                <p>Please enable location access</p>
                <p>to see weather information</p>
            `;
        }
    }
    updateLocationsList();
}

// Get Current Position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        const options = {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Geolocation successful:', position);
                resolve(position);
            },
            (error) => {
                console.error('Geolocation error:', error);
                reject(new Error('Unable to get your location. Using default location.'));
            },
            options
        );
    });
}

// Add this function after the getCurrentPosition function
async function getCityFromCoordinates(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        
        // Extract city name from the response
        let cityName = '';
        
        if (data.address) {
            // Try different address components in order of preference
            cityName = data.address.city || 
                      data.address.town || 
                      data.address.village || 
                      data.address.municipality || 
                      data.address.county || 
                      data.address.state;
        }

        // If no city name found, use the display name
        if (!cityName) {
            cityName = data.display_name.split(',')[0];
        }

        return cityName;
    } catch (error) {
        console.error('Error getting city name:', error);
        return 'Unknown Location';
    }
}

// Add this function to get coordinates from city name
async function getCoordinatesFromCity(cityName) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch coordinates');
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error('Error getting coordinates:', error);
        throw error;
    }
}

// Update Weather
async function updateWeather(lat, lon, locationName = null) {
    try {
        const weatherData = await fetchWeatherData(lat, lon);
        
        // If no location name provided, get it from coordinates
        if (!locationName) {
            locationName = await getCityFromCoordinates(lat, lon);
        }
        
        updateUI(weatherData, locationName);
        await updateForecast(weatherData);
    } catch (error) {
        console.error('Error updating weather:', error);
        currentLocation.textContent = 'Error fetching weather data';
        document.querySelector('.current-weather').innerHTML = `
            <h1>--°</h1>
            <p>Unable to fetch weather data</p>
            <p>Please try again later</p>
        `;
    }
}

// Fetch Weather Data
async function fetchWeatherData(lat, lon) {
    const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code,apparent_temperature_max,apparent_temperature_min,wind_speed_10m_max,wind_gusts_10m_max&hourly=temperature_2m,apparent_temperature,weather_code,is_day&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Weather data fetch failed');
    }
    return response.json();
}

// Update UI
function updateUI(data, locationName) {
    currentLocationData = data;
    currentLocation.textContent = locationName || 'Current Location';

    // Update current weather
    temperature.textContent = `${Math.round(data.current.temperature_2m)}°`;
    
    // Use current weather_code, or fallback to today's daily weather_code, or 'Clear'
    let weatherCode = data.current.weather_code;
    if (weatherCode === undefined && data.daily && data.daily.weather_code && data.daily.weather_code.length > 0) {
        weatherCode = data.daily.weather_code[0];
    }
    const weatherDesc = WEATHER_CODES[weatherCode] || 'Clear';
    weatherDescription.textContent = weatherDesc;

    // Update weather animation with wind speed and direction
    weatherAnimation.setWeather(
        weatherDesc,
        data.current.temperature_2m,
        data.current.wind_speed_10m || 0,
        data.current.wind_direction_10m || 0
    );

    feelsLike.textContent = `Feels like ${Math.round(data.current.apparent_temperature)}°`;

    // Wind speed, direction, and gusts (if available)
    const windSpeedElem = document.getElementById('wind-speed');
    const windDirectionElem = document.getElementById('wind-direction');
    const humidityElem = document.getElementById('humidity');

    if (windSpeedElem && data.current && data.current.wind_speed_10m !== undefined) {
        windSpeedElem.textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
    }

    if (windDirectionElem && data.current && data.current.wind_direction_10m !== undefined) {
        windDirectionElem.textContent = getCardinalDirection(data.current.wind_direction_10m);
    }

    let humidity = '--';
    if (data.current && data.current.relative_humidity_2m !== undefined) {
        humidity = Math.round(data.current.relative_humidity_2m);
    }
    if (humidityElem) {
        humidityElem.textContent = `${humidity}%`;
    }

    // Update sunrise and sunset times
    const sunrise = new Date(data.daily.sunrise[0]);
    const sunset = new Date(data.daily.sunset[0]);
    document.getElementById('sunrise-time').textContent = 
        sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset-time').textContent = 
        sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Helper to get cardinal direction from degrees
function getCardinalDirection(angle) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((angle % 360) / 22.5);
    return directions[index];
}

// Update Forecast
async function updateForecast(data) {
    const dailyData = data.daily;
    forecastContainer.innerHTML = '';
    const rainData = dailyData.precipitation_sum || dailyData.precipitation_probability || [];

    for (let i = 0; i < dailyData.time.length; i++) {
        const date = new Date(dailyData.time[i]);
        const maxTemp = dailyData.temperature_2m_max[i];
        const minTemp = dailyData.temperature_2m_min[i];
        const weatherCode = dailyData.weather_code[i];
        const sunrise = new Date(dailyData.sunrise[i]);
        const sunset = new Date(dailyData.sunset[i]);
        const rain = rainData[i] || 0;

        // Determine temperature class for fallback
        const tempClass = getTemperatureClass(maxTemp);

        // Dynamic gradient based on temperature
        let colorStart, colorEnd;
        if (maxTemp <= 5) {
            colorStart = 'rgba(41,128,185,0.45)'; // cold blue
            colorEnd = 'rgba(109,33,79,0.35)';
        } else if (maxTemp <= 10) {
            colorStart = 'rgba(52,152,219,0.45)';
            colorEnd = 'rgba(41,128,185,0.35)';
        } else if (maxTemp <= 20) {
            colorStart = 'rgba(46,204,113,0.45)';
            colorEnd = 'rgba(52,152,219,0.35)';
        } else if (maxTemp <= 25) {
            colorStart = 'rgba(241,196,15,0.45)';
            colorEnd = 'rgba(46,204,113,0.35)';
        } else if (maxTemp <= 30) {
            colorStart = 'rgba(230,126,34,0.45)';
            colorEnd = 'rgba(241,196,15,0.35)';
        } else {
            colorStart = 'rgba(231,76,60,0.45)'; // hot red
            colorEnd = 'rgba(230,126,34,0.35)';
        }

        // If rain is present, overlay a blue tint
        let rainOverlay = '';
        if (rain > 0) {
            rainOverlay = ', rgba(31, 75, 103, 0.18) 80%';
        }

        const gradient = `linear-gradient(135deg, ${colorStart}, ${colorEnd}${rainOverlay})`;

        const forecastElement = document.createElement('div');
        forecastElement.className = `forecast-item ${tempClass}`;
        forecastElement.style.background = gradient;
        forecastElement.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="weather-icon">${getWeatherIcon(weatherCode)}</div>
            <div class="forecast-temp">
                <span class="max">${Math.round(maxTemp)}°</span>
                <span class="min">${Math.round(minTemp)}°</span>
            </div>
            <div class="forecast-desc">${WEATHER_CODES[weatherCode] || 'Unknown'}</div>
            <div class="forecast-details">
                <div class="forecast-detail">
                    <span>Sunrise</span>
                    <span>${sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="forecast-detail">
                    <span>Sunset</span>
                    <span>${sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="forecast-detail">
                    <span>Feels Like</span>
                    <span>${Math.round(dailyData.apparent_temperature_max[i])}°</span>
                </div>
            </div>
        `;
        forecastElement.addEventListener('click', () => {
            displayDayDetails(dailyData, i);
        });
        forecastContainer.appendChild(forecastElement);
    }
}

// New function to display detailed information for a selected day
function displayDayDetails(dailyData, index) {
    const dayData = {
        temperature_2m: dailyData.temperature_2m_max[index], // Using max for main display
        weather_code: dailyData.weather_code[index],
        apparent_temperature: dailyData.apparent_temperature_max[index],
        wind_speed_10m: dailyData.wind_speed_10m_max[index],
        wind_direction_10m: dailyData.wind_direction_10m_dominant[index],
        relative_humidity_2m: dailyData.relative_humidity_2m_max[index],
        sunrise: dailyData.sunrise[index],
        sunset: dailyData.sunset[index]
    };

    // Update main weather display elements
    if (temperature) {
        temperature.textContent = `${Math.round(dayData.temperature_2m)}°`;
    }
    if (weatherDescription) {
        weatherDescription.textContent = WEATHER_CODES[dayData.weather_code] || 'Unknown';
    }
    if (feelsLike) {
        feelsLike.textContent = `Feels like ${Math.round(dayData.apparent_temperature)}°`;
    }

    const windSpeedElement = document.getElementById('wind-speed');
    const windDirectionElement = document.getElementById('wind-direction');
    const humidityElement = document.getElementById('humidity');
    const sunriseTimeElement = document.getElementById('sunrise-time');
    const sunsetTimeElement = document.getElementById('sunset-time');

    if (windSpeedElement) {
        windSpeedElement.textContent = `${dayData.wind_speed_10m} km/h`;
    }
    if (windDirectionElement) {
        windDirectionElement.textContent = getCardinalDirection(dayData.wind_direction_10m);
    }
    if (humidityElement) {
        humidityElement.textContent = `${dayData.relative_humidity_2m}%`;
    }

    if (sunriseTimeElement) {
        const sunrise = new Date(dayData.sunrise);
        sunriseTimeElement.textContent = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (sunsetTimeElement) {
        const sunset = new Date(dayData.sunset);
        sunsetTimeElement.textContent = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Update background animation
    if (weatherAnimation) {
        weatherAnimation.setWeather(WEATHER_CODES[dayData.weather_code]);
    }
}

// Get temperature class for gradient
function getTemperatureClass(temp) {
    if (temp <= 5) return 'temp-cold';
    if (temp <= 10) return 'temp-cool';
    if (temp <= 20) return 'temp-mild';
    if (temp <= 25) return 'temp-warm';
    if (temp <= 30) return 'temp-hot';
    return 'temp-very-hot';
}

// Get weather icon based on weather code
function getWeatherIcon(code) {
    const icons = {
        0: '☀️', // Clear sky
        1: '🌤️', // Mainly clear
        2: '⛅', // Partly cloudy
        3: '☁️', // Overcast
        45: '🌫️', // Foggy
        48: '🌫️', // Depositing rime fog
        51: '🌦️', // Light drizzle
        53: '🌦️', // Moderate drizzle
        55: '🌦️', // Dense drizzle
        61: '🌧️', // Slight rain
        63: '🌧️', // Moderate rain
        65: '🌧️', // Heavy rain
        71: '🌨️', // Slight snow
        73: '🌨️', // Moderate snow
        75: '🌨️', // Heavy snow
        77: '🌨️', // Snow grains
        80: '🌧️', // Slight rain showers
        81: '🌧️', // Moderate rain showers
        82: '🌧️', // Violent rain showers
        85: '🌨️', // Slight snow showers
        86: '🌨️', // Heavy snow showers
        95: '⛈️', // Thunderstorm
        96: '⛈️', // Thunderstorm with slight hail
        99: '⛈️'  // Thunderstorm with heavy hail
    };
    return icons[code] || '❓';
}

// Toggle Side Panel
function toggleSidePanel() {
    sidePanel.classList.toggle('active');
    overlay.classList.toggle('active');
}

// New function to fetch city suggestions
async function fetchCitySuggestions(query) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=7`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch city suggestions');
        }

        const data = await response.json();
        displayCitySuggestions(data);
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        searchSuggestions.innerHTML = '<div class="suggestion-item">Error fetching suggestions</div>';
        searchSuggestions.style.display = 'block';
    }
}

// Function to display city suggestions
function displayCitySuggestions(suggestions) {
    searchSuggestions.innerHTML = '';
    if (suggestions.length === 0) {
        searchSuggestions.innerHTML = '<div class="suggestion-item no-results">No results found</div>';
        searchSuggestions.style.display = 'block';
        return;
    }

    suggestions.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = item.display_name;
        suggestionItem.addEventListener('click', () => {
            newLocationInput.value = item.display_name;
            newLocationInput.dataset.lat = item.lat; // Store lat/lon for later use
            newLocationInput.dataset.lon = item.lon;
            searchSuggestions.innerHTML = '';
            searchSuggestions.style.display = 'none';
        });
        searchSuggestions.appendChild(suggestionItem);
    });
    searchSuggestions.style.display = 'block';
}

// Update the addNewLocation function to use stored lat/lon if available
async function addNewLocation() {
    const locationInput = newLocationInput.value.trim();
    const lat = newLocationInput.dataset.lat;
    const lon = newLocationInput.dataset.lon;
    const displayName = newLocationInput.value.trim(); // Use the displayed name

    if (!locationInput) {
        alert('Please enter a location');
        return;
    }

    try {
        // Show loading state
        saveLocationBtn.disabled = true;
        saveLocationBtn.textContent = 'Adding...';

        let locationData;
        if (lat && lon) {
            locationData = { lat: parseFloat(lat), lon: parseFloat(lon), displayName: displayName };
        } else {
            // Fallback to fetching coordinates if not selected from suggestions
            locationData = await getCoordinatesFromCity(locationInput);
        }
        
        // Check if location already exists (excluding current location data for comparison)
        const isDuplicate = savedLocations.some(loc => 
            loc.name.toLowerCase() === locationData.displayName.toLowerCase() && !loc.isCurrent
        );

        if (isDuplicate) {
            alert('This location is already saved');
            return;
        }

        // Add new location
        const newLocation = {
            name: locationData.displayName,
            lat: locationData.lat,
            lon: locationData.lon,
            isCurrent: false // Explicitly mark as not current
        };

        savedLocations.push(newLocation);
        localStorage.setItem('locations', JSON.stringify(savedLocations));

        // Update UI
        updateLocationsList();
        toggleSidePanel();
        newLocationInput.value = '';
        delete newLocationInput.dataset.lat; // Clear stored data
        delete newLocationInput.dataset.lon;
        searchSuggestions.innerHTML = ''; // Clear suggestions
        searchSuggestions.style.display = 'none';

        // Update weather for the new location
        await updateWeather(locationData.lat, locationData.lon, locationData.displayName);

    } catch (error) {
        console.error('Error adding location:', error);
        alert('Could not find the location. Please check the spelling and try again.');
    } finally {
        // Reset button state
        saveLocationBtn.disabled = false;
        saveLocationBtn.textContent = 'Save Location';
    }
}

// Update the updateLocationsList function
function updateLocationsList() {
    if (!locationsList) return;

    locationsList.innerHTML = '';
    
    savedLocations.forEach(location => {
        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        if (location.isCurrent) {
            locationItem.classList.add('current-location-item'); // Add class for styling
        }
        
        const locationName = document.createElement('span');
        locationName.textContent = location.name;
        locationName.addEventListener('click', () => {
            updateWeather(location.lat, location.lon, location.name);
            toggleSidePanel();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.className = 'delete-location';

        if (location.isCurrent) {
            deleteBtn.style.display = 'none'; // Hide delete button for current location
        } else {
            deleteBtn.addEventListener('click', () => deleteLocation(location.name));
        }

        locationItem.appendChild(locationName);
        locationItem.appendChild(deleteBtn);
        locationsList.appendChild(locationItem);
    });
}

// Delete Location
function deleteLocation(locationName) {
    // Filter out the location to be deleted
    savedLocations = savedLocations.filter(loc => 
        loc.name !== locationName && !loc.isCurrent // Prevent deleting current location
    );
    localStorage.setItem('locations', JSON.stringify(savedLocations));
    updateLocationsList();
}

// Initialize the app
init(); 