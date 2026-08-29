const predictDisasterRisk = async (features) => {

    const mlServiceUrl = process.env.ML_SERVICE_URL;

    const payload = {
        rainfall: Number(features.rainfall) || 0,
        river_level: Number(features.river_level) || 0,
        humidity: Number(features.humidity) || 0,
        temperature: Number(features.temperature) || 0,
        previous_floods: Number(features.previous_floods) || 0
    };

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 3000);

    try {

        const response = await fetch(
            `${mlServiceUrl}/predict/disaster`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload),

                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `ML service HTTP error: ${response.status}`
            );
        }

        const data = await response.json();

        if (
            data &&
            data.success &&
            data.prediction
        ) {

            return {
                success: true,

                risk: String(
                    data.prediction.risk
                ),

                probability: Number(
                    data.prediction.probability
                ),

                mlStatus: "SUCCESS"
            };
        }

        throw new Error(
            "Invalid disaster ML response"
        );

    } catch (err) {

        clearTimeout(timeoutId);

        console.warn(
            "[Disaster ML Warning]",
            err.message
        );

        return {
            success: false,

            risk: "UNKNOWN",

            probability: null,

            mlStatus: "ML_UNAVAILABLE"
        };
    }
};

module.exports = predictDisasterRisk;