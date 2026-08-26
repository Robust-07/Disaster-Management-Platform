const predictShortage = async(features) => {
    const mlServiceUrl = process.env.ML_SERVICE_URL;
    const payload = {
        population: Number(features.population),
        current_stock: Number(features.currentstock),
        daily_consumption: Number(features.dailycnsumption),
        incoming_supply: Number(features.incomingsupply),
        people_per_unit: Number(features.peopleperunit)
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    },3000);

    try{
        const respomse = await fetch(
            `${mlServiceUrl}/predict/shortage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application-json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            }
        );
        clearTimeout(timeoutId);

        if (!response.ok){
            throw new Error(
                `ML Service HTTP error: ${response.status}`
            );
        }
        const data = await response.json();
        if (data && data.success && data.prediction){
            return{
                success: true,
                hoursUntilShortage: Number(data.prediction.hours_unitl_shortage),
                status: String(data.prediction.status),
                mlStatus: "Success"
            };
        }
        throw new Error("Invalid ML service response");

    }
    catch(err){
        clearTimeout(timeoutId);
        console.warn('[Shoratge ML Warning]',
            err.message
        );
        const availableStock = payload.current_stock + payload.incoming_supply;
        let hoursUntilShortage;
        if (payload.daily_consumption<=0){
            hoursUntilShortage = 999;
        }
        else{
            const dailyRequirement = payload.daily_consumption;
            const days = availableStock / dailyRequirement;
            hursUntilShortage = days * 24;
        }
        hoursUntilShortage = Math.max(0, hoursUntilShortage);
        let status;
        if (hoursUntilShortage<=2){
            status = 'Critical';
        }
        else if(hoursUntilShortage<=6){
            status = 'Warning';
        }
        else if(hoursUntilShortage<=24){
            status = 'Monitor'
        }
        else {
            status = 'Safe';
        }
        return {
            success: false,
            hoursUntilShortage: Math.round(hoursUntilShortage * 100)/100,
            status,
            mlStatus: 'Fallback_Manual'
        };
    }
};

module.exports = predictShortage;