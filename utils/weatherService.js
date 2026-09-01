const getCurrentWeather = async (latitude, longitude) => {
    try {
        if (
            latitude === undefined ||
            longitude === undefined ||
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude))
        ) {
            throw new Error("Valid latitude and longitude are required");
        }

        const lat = Number(latitude);
        const lon = Number(longitude);

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,rain` +
            `&hourly=precipitation` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Weather API returned ${response.status}`
            );
        }

        const data = await response.json();

        const current = data.current;

        if (!current) {
            throw new Error("Invalid weather API response");
        }

        return {
            temperature: Number(current.temperature_2m ?? 0),

            humidity: Number(
                current.relative_humidity_2m ?? 0
            ),

            // Current rain in mm
            rainfall: Number(current.rain ?? 0)
        };

    } catch (error) {

        console.error(
            "Weather service error:",
            error.message
        );

        throw error;
    }
};

module.exports = getCurrentWeather;