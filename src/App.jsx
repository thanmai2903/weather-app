import { useState, useEffect } from "react";
const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("metric");

  // Fetch weather by city
  const getWeather = async (cityName) => {
    if (!cityName) return;
    try {
      setLoading(true);
      setError("");
      setWeather(null);
      setForecast([]);

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      const data = await res.json();
      if (data.cod != 200) {
        setError("City not found ❌");
        setLoading(false);
        return;
      }
      setWeather(data);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`
      );
      const forecastData = await forecastRes.json();
      const dailyForecast = forecastData.list.filter((f) =>
        f.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast);

      setLoading(false);
    } catch {
      setError("Something went wrong ⚠️");
      setLoading(false);
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const data = await res.json();
      setCity(data.name);
      setWeather(data);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );
      const forecastData = await forecastRes.json();
      const dailyForecast = forecastData.list.filter((f) =>
        f.dt_txt.includes("12:00:00")
      );
      setForecast(dailyForecast);
    } catch {
      setError("Geolocation failed ⚠️");
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => console.log("Geolocation denied. Enter city manually.")
      );
    }
  }, [unit]);

  // Only nature backgrounds
  // Only nature backgrounds (fixed, no dynamic change)
const getBackgroundStyle = () => {
  return {
    backgroundImage: `url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80)`, // fixed nature background
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    transition: "all 0.7s ease-in-out",
  };
};

  const getIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={getBackgroundStyle()}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg p-4 space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg text-center">
          Weather App 🌿
        </h1>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Enter city..."
            className="flex-1 p-2 rounded-lg outline-none bg-white/80 focus:ring-2 focus:ring-blue-500"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getWeather(city)}
          />
          <button
            onClick={() => getWeather(city)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:scale-105 hover:bg-gray-800 transition-all"
          >
            Search
          </button>
        </div>

        {loading && (
          <div className="mt-6 animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
        )}

        {error && (
          <div className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg shadow-lg animate-bounce text-center">
            {error}
          </div>
        )}

        {/* Current Weather */}
        {weather && (
          <div className="mt-6 backdrop-blur-lg bg-white/30 p-6 rounded-2xl shadow-2xl text-center w-full text-white animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold">{weather.name}</h2>
            <img
              src={getIcon(weather.weather[0].icon)}
              alt="weather icon"
              className="mx-auto"
            />
            <p className="capitalize text-lg sm:text-xl">{weather.weather[0].description}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold my-2">
              {weather.main.temp}°{unit === "metric" ? "C" : "F"}
            </h1>

            <div className="flex flex-wrap justify-between mt-4 text-sm sm:text-base gap-2">
              <p>💧 Humidity: {weather.main.humidity}%</p>
              <p>🌬 Wind: {weather.wind.speed} {unit === "metric" ? "km/h" : "mph"}</p>
              <p>🌡 Feels Like: {weather.main.feels_like}°{unit === "metric" ? "C" : "F"}</p>
              <p>☀️ Pressure: {weather.main.pressure} hPa</p>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => { setUnit("metric"); if(city) getWeather(city); }}
                className={`px-4 py-2 rounded-lg ${unit === "metric" ? "bg-blue-600 text-white" : "bg-white/40 text-black"}`}
              >
                °C
              </button>
              <button
                onClick={() => { setUnit("imperial"); if(city) getWeather(city); }}
                className={`px-4 py-2 rounded-lg ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-white/40 text-black"}`}
              >
                °F
              </button>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="mt-6 w-full grid grid-cols-2 sm:grid-cols-5 gap-4">
            {forecast.map((day) => (
              <div
                key={day.dt}
                className="backdrop-blur-lg bg-white/30 p-4 rounded-xl shadow-lg text-center text-white animate-fadeIn"
              >
                <p className="font-bold">
                  {new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <img
                  src={getIcon(day.weather[0].icon)}
                  alt="icon"
                  className="mx-auto w-16 h-16"
                />
                <p className="capitalize">{day.weather[0].description}</p>
                <p>{day.main.temp.toFixed(0)}°{unit === "metric" ? "C" : "F"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;