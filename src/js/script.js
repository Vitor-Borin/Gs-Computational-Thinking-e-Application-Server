const emissionAdjustments = {
    'Carro Pequeno': 1.0,
    'Carro Médio': 1.3,
    'Carro Grande': 1.6,
    'Moto': 0.6,
    'Ônibus': 0.4, 
    'Metrô': 0.2 
};

async function calculateCarbon(distance, vehicle) {
    const apiKey = apiCarboninterface;
    const url = 'https://www.carboninterface.com/api/v1/estimates';

    const vehicleModelId = '7268a9b7-17e8-4c8d-acca-57059252afe9';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': Bearer ${apiKey},
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'vehicle',
                distance_unit: 'km',
                distance_value: parseFloat(distance),
                vehicle_model_id: vehicleModelId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta da API:', errorText);
            throw new Error(Falha ao calcular a pegada de carbono: ${response.status});
        }

        const data = await response.json();
        const baseCarbon = data.data.attributes.carbon_kg;
        const adjustmentFactor = emissionAdjustments[vehicle] || 1.0;
        return baseCarbon * adjustmentFactor;
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}