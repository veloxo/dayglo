let fallbackPosition = { coords: { latitude: 47.6, longitude: -122.5 } }; // Seattle

function createHourBars() {
    const container = document.getElementById("progress-bar-container");
    for (let i = 0; i < 24; i++) {
        const hourBar = document.createElement("div");
        hourBar.className = "hour-bar";
        hourBar.id = `hour-bar-${i}`;
        hourBar.innerHTML = `
            <div class="progress-bar" id="progress-bar-${i}"></div>
            <span class="hour-label hour-label-left">${convertTo12HourFormat(i)}</span>
            <span class="hour-label hour-label-right">${i.toString().padStart(2, "0")}</span>
        `;
        container.appendChild(hourBar);
    }
}

function convertTo12HourFormat(hour) {
    const period = hour < 12 ? "" : "pm";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour} ${period}`;
}

function updateProgress() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    for (let i = 0; i < 24; i++) {
        const progressBar = document.getElementById(`progress-bar-${i}`);
        if (i < currentHour) {
            progressBar.style.width = "100%";
        } else if (i === currentHour) {
            const percentElapsed = ((currentMinute * 60 + currentSecond) / 3600) * 100;
            progressBar.style.width = percentElapsed + "%";
        } else {
            progressBar.style.width = "0%";
        }
    }
}

function updatePositionSunTimes() {
    const options = {
        enableHighAccuracy: false,
        timeout: 10 * 60 * 1000, // 10 minutes
        maximumAge: Infinity,
    };
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(colorSunTimes, handlePositionError, options);
    } else {
        console.log("Geolocation is not supported by this browser");
    }
}

function colorSunTimes(position) {
    fallbackPosition = position;
    const today = new Date();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // call SunCalc from suncalc.js
    const sunTimes = SunCalc.getTimes(today, latitude, longitude);
    const sunriseHour = sunTimes.sunrise.getHours();
    const sunsetHour = sunTimes.sunset.getHours();

    // color progress bars for daylight hours
    for (let i = 0; i < 24; i++) {
        const hourBar = document.getElementById(`hour-bar-${i}`);
        const progressBar = document.getElementById(`progress-bar-${i}`);

        if (i === sunriseHour) {
            hourBar.classList.add("hour-bar-dayshift");
            progressBar.classList.add("progress-bar-dayshift");
        } else if (i === sunsetHour) {
            hourBar.classList.add("hour-bar-nightshift");
            progressBar.classList.add("progress-bar-nightshift");
        } else if (sunriseHour < i && i < sunsetHour) {
            hourBar.classList.add("hour-bar-daylight");
            progressBar.classList.add("progress-bar-daylight");
        } else {
            hourBar.classList.remove("hour-bar-dayshift");
            hourBar.classList.remove("hour-bar-nightshift");
            hourBar.classList.remove("hour-bar-daylight");
            progressBar.classList.remove("progress-bar-dayshift");
            progressBar.classList.remove("progress-bar-nightshift");
            progressBar.classList.remove("progress-bar-daylight");
        }
    }
}

function handlePositionError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the location request");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information unavailable");
            break;
        case error.TIMEOUT:
            console.log("Location request timed out");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred requesting location");
            break;
    }
    colorSunTimes(fallbackPosition);
}

createHourBars();
updateProgress();
colorSunTimes(fallbackPosition);
updatePositionSunTimes();

setInterval(updateProgress, 1 * 1000); // 1 sec
setInterval(updatePositionSunTimes, 1 * 60 * 60 * 1000); // 1 hour

if ("serviceWorker" in navigator) {
    window.onload = () => {
        navigator.serviceWorker.register("/sw.js");
    };
}
