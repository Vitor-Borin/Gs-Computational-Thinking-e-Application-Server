import { apiCarboninterface, apiNewsapi } from './api.js';

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
                'Authorization': `Bearer ${apiKey}`,
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
            throw new Error(`Falha ao calcular a pegada de carbono: ${response.status}`);
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

document.querySelector('#carbon-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const distance = document.querySelector('#distance').value;
    const vehicle = document.querySelector('#vehicle').value;
    const resultDiv = document.querySelector('#carbon-result');

    try {
        if (isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) {
            throw new Error('Por favor, insira uma distância válida.');
        }

        const carbonFootprint = await calculateCarbon(distance, vehicle);
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3>Resultado do Cálculo</h3>
                <p>Sua pegada de carbono estimada para ${vehicle} é de aproximadamente <strong>${carbonFootprint.toFixed(2)} kg de CO2</strong>.</p>
                <p>Distância: ${distance} km</p>
                <p class="note">Este cálculo é uma estimativa ajustada baseada no tipo de veículo selecionado.</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error-card">
                <p>Erro: ${error.message}</p>
                <p>Por favor, tente novamente ou selecione um veículo diferente.</p>
            </div>
        `;
        console.error('Erro detalhado:', error);
    }
});

async function fetchNews() {
    const apiKey = apiNewsapi;
    const url = `https://newsapi.org/v2/everything?q=energia+renovável&language=pt&apiKey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Falha ao buscar notícias');
        }
        const data = await response.json();
        return data.articles.slice(0, 6);
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}

function displayNews(articles) {
    const newsContainer = document.querySelector('#news-container');
    newsContainer.innerHTML = '';

    const chunkedArticles = [];
    for (let i = 0; i < articles.length; i += 3) {
        chunkedArticles.push(articles.slice(i, i + 3));
    }

    chunkedArticles.forEach(group => {
        const row = document.createElement('div');
        row.classList.add('news-row');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = 'repeat(3, 1fr)';
        row.style.gap = '20px';
        row.style.marginBottom = '20px';

        group.forEach(article => {
            const newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            newsItem.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <a href="${article.url}" target="_blank">Leia mais</a>
            `;
            row.appendChild(newsItem);
        });

        newsContainer.appendChild(row);
    });
}

document.querySelector('#newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const resultDiv = document.querySelector('#newsletter-result');

    setTimeout(() => {
        resultDiv.innerHTML = `Obrigado por se inscrever! Um e-mail de confirmação foi enviado para ${email}.`;
    }, 1000);
});

window.addEventListener('load', async () => {
    try {
        const articles = await fetchNews();
        displayNews(articles);
    } catch (error) {
        document.querySelector('#news-container').innerHTML = 'Não foi possível carregar as notícias. Por favor, tente novamente mais tarde.';
    }
});