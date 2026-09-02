const predictShortage = async (features) => {
    const mlServiceUrl = process.env.ML_SERVICE_URL;

    const payload = {
        population: Number(features.population) || 0,
        current_stock: Number(features.currentStock) || 0,
        daily_consumption: Number(features.dailyConsumption) || 0,
        incoming_supply: Number(features.incomingSupply) || 0,
        people_per_unit: Number(features.peoplePerUnit) || 1
    };

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 3000);

    try {
        const response = await fetch(
            `${mlServiceUrl}/predict/shortage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(
                `ML Service HTTP error: ${response.status}`
            );
        }

        const data = await response.json();

        if (data && data.success && data.prediction) {

            return {
                success: true,

                hoursUntilShortage:
                    Number(data.prediction.hours_until_shortage),

                status:
                    String(data.prediction.status),

                mlStatus: 'SUCCESS'
            };
        }

        throw new Error('Invalid ML service response');
    }

    catch (err) {
        clearTimeout(timeoutId);

        console.warn(
            '[Shortage ML Warning]',
            err.message
        );

        // -----------------------------
        // MANUAL FALLBACK
        // -----------------------------

        const availableStock =
            payload.current_stock +
            payload.incoming_supply;

        let hoursUntilShortage;

        if (payload.daily_consumption <= 0) {
            hoursUntilShortage = 999;
        }
        else {
            const dailyRequirement = payload.daily_consumption;
            const days = availableStock / dailyRequirement;
            hoursUntilShortage = days * 24;
        }

        hoursUntilShortage = Math.max(0, hoursUntilShortage);

        let status;

        if (hoursUntilShortage <= 2) {
            status = 'CRITICAL';
        }
        else if (hoursUntilShortage <= 6) {
            status = 'WARNING';
        }
        else if (hoursUntilShortage <= 24) {
            status = 'MONITOR';
        }
        else {
            status = 'SAFE';
        }

        return {
            success: false,
            hoursUntilShortage: Math.round(hoursUntilShortage * 100) / 100,
            status,
            mlStatus: 'FALLBACK_MANUAL'
        };
    }
};

module.exports = predictShortage;