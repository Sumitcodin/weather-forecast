import RainyAnimation from './rainy.js';
import SunnyAnimation from './sunny.js';
import WindyAnimation from './windy.js';
import CloudyAnimation from './cloudy.js';
import SnowyAnimation from './snowy.js';
import ThunderstormAnimation from './thunderstorm.js';

class WeatherAnimation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.currentAnimation = null;

        // Define weather condition patterns
        this.weatherPatterns = {
            thunderstorm: [
                'thunderstorm', 'thunder', 'storm', 'lightning', 'thunder and lightning',
                'thunderstorm with', 'thunder with', 'electrical storm'
            ],
            snowy: [
                'snow', 'sleet', 'snowy', 'snowing', 'snowfall', 'snow showers',
                'snow grains', 'snow flurries', 'blizzard', 'snowstorm'
            ],
            rainy: [
                'rain', 'rainy', 'raining', 'drizzle', 'drizzling', 'showers',
                'rain showers', 'light rain', 'moderate rain', 'heavy rain',
                'rainfall', 'precipitation'
            ],
            sunny: [
                'sunny', 'clear', 'clear sky', 'sunshine', 'sun', 'fair',
                'mostly clear', 'mainly clear', 'partly sunny'
            ],
            windy: [
                'wind', 'windy', 'breeze', 'breezy', 'gusty', 'wind gusts',
                'strong wind', 'high wind', 'windy conditions'
            ],
            cloudy: [
                'cloud', 'cloudy', 'overcast', 'partly cloudy', 'mostly cloudy',
                'cloud cover', 'cloudy conditions', 'fog', 'foggy', 'mist',
                'haze', 'hazy'
            ]
        };
    }

    matchesWeatherPattern(description, pattern) {
        const normalizedDesc = description.toLowerCase().trim();
        return this.weatherPatterns[pattern].some(term => 
            normalizedDesc.includes(term.toLowerCase())
        );
    }

    getTimeBasedColors(hour) {
        // Night colors (10 PM to 5 AM)
        if (hour >= 22 || hour < 5) {
            return {
                background: '#0a1128',
                text: '#ffffff'
            };
        }
        // Dawn colors (5 AM to 7 AM)
        else if (hour < 7) {
            return {
                background: '#1a237e',
                text: '#ffffff'
            };
        }
        // Morning colors (7 AM to 10 AM)
        else if (hour < 10) {
            return {
                background: '#3949ab',
                text: '#ffffff'
            };
        }
        // Day colors (10 AM to 4 PM)
        else if (hour < 16) {
            return {
                background: '#64b5f6',
                text: '#000000'
            };
        }
        // Evening colors (4 PM to 7 PM)
        else if (hour < 19) {
            return {
                background: '#5c6bc0',
                text: '#ffffff'
            };
        }
        // Dusk colors (7 PM to 10 PM)
        else {
            return {
                background: '#283593',
                text: '#ffffff'
            };
        }
    }

    getWeatherBasedColors(weatherType, temperature) {
        const baseColors = this.getTimeBasedColors(new Date().getHours());
        
        // Adjust colors based on weather type
        switch(weatherType) {
            case 'thunderstorm':
                return {
                    background: '#36454F',
                    text: '#ffffff'
                };
            case 'snowy':
                return {
                    background: '#e3f2fd',
                    text: '#000000'
                };
            case 'rainy':
                return {
                    background: this.adjustColor(baseColors.background, -20),
                    text: baseColors.text
                };
            case 'cloudy':
                return {
                    background: this.adjustColor(baseColors.background, -10),
                    text: baseColors.text
                };
            default:
                return baseColors;
        }
    }

    adjustColor(color, amount) {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Adjust each component
        const newR = Math.max(0, Math.min(255, r + amount));
        const newG = Math.max(0, Math.min(255, g + amount));
        const newB = Math.max(0, Math.min(255, b + amount));

        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    setWeather(weatherDescription, temperature, windSpeed, windDirection) {
        // Stop current animation if exists
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        // Clear canvas
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Determine weather type
        let weatherType = 'sunny';
        if (this.matchesWeatherPattern(weatherDescription, 'thunderstorm')) weatherType = 'thunderstorm';
        else if (this.matchesWeatherPattern(weatherDescription, 'snowy')) weatherType = 'snowy';
        else if (this.matchesWeatherPattern(weatherDescription, 'rainy')) weatherType = 'rainy';
        else if (this.matchesWeatherPattern(weatherDescription, 'cloudy')) weatherType = 'cloudy';
        else if (this.matchesWeatherPattern(weatherDescription, 'windy')) weatherType = 'windy';

        // Get colors based on time and weather
        const colors = this.getWeatherBasedColors(weatherType, temperature);
        
        // Apply colors
        document.body.style.backgroundColor = colors.background;
        document.body.style.color = colors.text;

        // Set animation based on weather description
        if (weatherType === 'thunderstorm') {
            this.currentAnimation = new ThunderstormAnimation(this.canvas);
        } else if (weatherType === 'snowy') {
            this.currentAnimation = new SnowyAnimation(this.canvas);
        } else if (weatherType === 'rainy') {
            this.currentAnimation = new RainyAnimation(this.canvas);
        } else if (weatherType === 'sunny') {
            this.currentAnimation = new SunnyAnimation(this.canvas);
        } else if (weatherType === 'windy') {
            this.currentAnimation = new WindyAnimation(this.canvas, windSpeed, windDirection);
        } else if (weatherType === 'cloudy') {
            this.currentAnimation = new CloudyAnimation(this.canvas);
        } else {
            // Default to cloudy for unknown weather conditions
            console.log('Unknown weather condition:', weatherDescription, '- defaulting to cloudy');
            this.currentAnimation = new CloudyAnimation(this.canvas);
        }
    }

    stop() {
        if (this.currentAnimation) {
            this.currentAnimation.stop();
            this.currentAnimation = null;
        }
    }
}

export default WeatherAnimation; 