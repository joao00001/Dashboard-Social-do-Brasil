// --- Chart Instances ---
const chartInstances = {};

// --- Utility Functions ---
function formatDate(dateObj, format = 'dd/MM/yyyy') {
    if (!dateObj) return 'N/D';
    // Se for string no formato YYYY-MM-DDTHH:mm:ss.sssZ (comum em APIs)
    if (typeof dateObj === 'string' && dateObj.includes('T') && dateObj.includes('Z')) {
        dateObj = new Date(dateObj);
    }
    // Se for string no formato YYYY-MM-DD (comum em APIs sem hora)
    else if (typeof dateObj === 'string' && dateObj.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const parts = dateObj.split('-');
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]); // Adiciona T00:00:00 para evitar problemas de fuso
    }
    // Se for string no formato YYYY (comum em IPEAData para dados anuais)
    else if (typeof dateObj === 'string' && dateObj.match(/^\d{4}$/)) {
        if (format === 'yyyy') return dateObj;
        return dateObj; // Retorna apenas o ano se for o caso
    }


    if (!(dateObj instanceof Date) || isNaN(dateObj)) return 'N/D';

    if (format === 'dd/MM/yyyy') return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (format === 'MM/yyyy') return dateObj.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
    if (format === 'yyyy') return String(dateObj.getFullYear()); // Garante que é string
    if (format === 'HH:mm') return dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return dateObj.toLocaleDateString('pt-BR');
}


function updateCurrentDateTime() {
    const now = new Date();
    const el = document.getElementById('currentDateTime');
    if (el) el.textContent = `Consulta em: ${formatDate(now)} ${formatDate(now, 'HH:mm')}`;
}

async function fetchData(url, cardIdForLoading = null, sourceName = "API") {
    let container = null;
    if (cardIdForLoading) {
        const cardElement = document.getElementById(cardIdForLoading);
        if (cardElement) {
            container = cardElement.querySelector('.loading-text') || cardElement.querySelector('.chart-container') || cardElement.querySelector('.table-container');
            if (container && !container.classList.contains('error-text')) {
                 if (!container.classList.contains('loading-text')) {
                    container.innerHTML = `<p class="loading-text">Carregando (${sourceName})...</p>`;
                 } else { container.textContent = `Carregando (${sourceName})...`; }
            }
        }
    }
    try {
        // console.log(`[fetchData:${sourceName}] URL: ${url}`);
        const response = await fetch(url);
        // console.log(`[fetchData:${sourceName}] URL: ${url} -- Status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[fetchData:${sourceName}] Erro HTTP ${response.status} ao buscar ${url}. Detalhe: ${errorText}`);
            throw new Error(`Erro HTTP ${response.status} (${sourceName})`);
        }
        const data = await response.json();
        // console.log(`[fetchData:${sourceName}] Dados crus recebidos de ${url}:`, data);
        if (container && container.classList.contains('loading-text')) {
            if (cardIdForLoading && (!cardIdForLoading.toLowerCase().includes('table') && !cardIdForLoading.toLowerCase().includes('display'))) {
                 container.innerHTML = '';
            } else if (container.classList.contains('loading-text')) { // Para table containers que são o próprio loading
                // Não limpa aqui, a função de renderização da tabela o fará
            }
        }
        return data;
    } catch (error) {
        console.error(`[fetchData:${sourceName}] Falha CRÍTICA ao buscar/processar dados de ${url}:`, error);
        if (container) {
            container.innerHTML = `<p class="error-text">Não foi possível carregar (${sourceName}). Verifique o console.</p>`;
            container.classList.remove('loading-text');
        }
        return null;
    }
}

function renderGenericChart(canvasId, chartConfig) {
    const chartContainer = document.getElementById(canvasId)?.parentElement;
    if (!chartContainer) {
        console.error(`Container para o gráfico ${canvasId} não encontrado.`);
        return;
    }
    if (!chartConfig || !chartConfig.data || !chartConfig.data.datasets || chartConfig.data.datasets.length === 0 || chartConfig.data.datasets.every(ds => ds.data.length ===0) ) {
        chartContainer.innerHTML = `<p class="error-text">Dados insuficientes ou indisponíveis para exibir o gráfico ${chartConfig.options?.plugins?.title?.text || canvasId}.</p>`;
        return;
    }

    chartContainer.innerHTML = `<canvas id="${canvasId}"></canvas>`;
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    chartInstances[canvasId] = new Chart(ctx, chartConfig);
}

// --- Segurança Pública (BrasilAPI) ---
const BRASIL_API_BASE = 'https://brasilapi.com.br/api';

async function loadHomicidiosEstaduais() {
    const cardId = 'homicidiosEstaduaisCard';
    // BrasilAPI não tem um endpoint direto para taxas comparativas de homicídios de todos estados de uma vez.
    // Ela tem /seguranca-publica/v1/{UF}, que traz vários dados, incluindo homicídio doloso.
    // Para este gráfico, vamos pegar alguns estados representativos e o último ano disponível.
    // O ideal seria um endpoint que já desse esses dados agregados ou taxas.
    // Vamos simular com dados de exemplo, e indicar a fonte ideal.
    console.warn("[loadHomicidiosEstaduais] Usando dados simulados. Para dados reais, seria necessário múltiplas chamadas à BrasilAPI por estado ou um endpoint agregado.");
    
    const estados = ['SP', 'RJ', 'MG', 'BA', 'AM', 'RS']; // Exemplo
    const homicidiosData = [];
    const anoReferencia = new Date().getFullYear() -1; // Ano anterior como referência

    // Simulando a busca (em um caso real, faria um loop com fetchData para cada estado)
    // Exemplo de estrutura que a API /seguranca-publica/v1/{UF} retornaria (simplificado):
    // { "estado": "SP", "ano": 2023, "mes": 12, "homicidio_doloso": 250, ... }
    // Para este exemplo, vou colocar dados fictícios para o gráfico.
    const dadosFicticios = {
        'SP': Math.floor(Math.random() * 3000) + 2000, // Homicídios no ano
        'RJ': Math.floor(Math.random() * 4000) + 3000,
        'MG': Math.floor(Math.random() * 2500) + 1500,
        'BA': Math.floor(Math.random() * 3500) + 2500,
        'AM': Math.floor(Math.random() * 800) + 400,
        'RS': Math.floor(Math.random() * 1500) + 1000,
    };
    estados.forEach(uf => homicidiosData.push({ estado: uf, valor: dadosFicticios[uf] }));


    if (homicidiosData.length === 0) {
        document.getElementById('homicidiosEstaduaisChart').parentElement.innerHTML = `<p class="error-text">Dados de homicídios não disponíveis.</p>`;
        return;
    }

    renderGenericChart('homicidiosEstaduaisChart', {
        type: 'bar',
        data: {
            labels: homicidiosData.map(d => d.estado),
            datasets: [{
                label: `Homicídios Dolosos Registrados (${anoReferencia})`,
                data: homicidiosData.map(d => d.valor),
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Barras horizontais para melhor leitura dos estados
            scales: { x: { beginAtZero: true, title: { display: true, text: 'Número de Ocorrências' } }, y: {} },
            plugins: { title: { display: true, text: `Homicídios Dolosos por Estado (${anoReferencia} - Simulado)` } }
        }
    });
}


async function loadRoubosFurtos() {
    // Similar ao de homicídios, a BrasilAPI é por estado.
    // Para um gráfico de tendência, precisaríamos de dados históricos de um estado ou do Brasil (se existir endpoint).
    // Vamos simular uma tendência para SP como exemplo.
    console.warn("[loadRoubosFurtos] Usando dados simulados para tendência de roubo/furto de veículos em SP.");
    const cardId = 'roubosFurtosCard';
    const anos = [2020, 2021, 2022, 2023, 2024]; // Dados até o ano anterior ao atual
    const dadosSimuladosSP = [
        Math.floor(Math.random() * 5000) + 80000,
        Math.floor(Math.random() * 5000) + 78000,
        Math.floor(Math.random() * 5000) + 82000,
        Math.floor(Math.random() * 5000) + 85000,
        Math.floor(Math.random() * 5000) + 83000,
    ];

    renderGenericChart('roubosFurtosChart', {
        type: 'line',
        data: {
            labels: anos.map(String),
            datasets: [{
                label: 'Roubo/Furto de Veículos - SP (Simulado)',
                data: dadosSimuladosSP,
                borderColor: 'rgba(255, 193, 7, 1)',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            scales: { y: { beginAtZero: false, title: { display: true, text: 'Número de Ocorrências' } }, x: {title: {display: true, text: 'Ano'}} },
            plugins: { title: { display: true, text: 'Tendência Roubo/Furto Veículos - SP (Simulado)' } }
        }
    });
}


async function loadOcorrenciasTable() {
    const container = document.getElementById('ocorrenciasTableContainer');
    const estadosParaTabela = ['SP', 'RJ', 'MG']; // Exemplo
    const anoRecente = new Date().getFullYear() - 1; // Ano anterior
    let tableHtml = `<table><thead><tr><th>Estado</th><th>Ano</th><th>Homicídio Doloso</th><th>Roubo de Veículo</th><th>Furto de Veículo</th></tr></thead><tbody>`;
    let allDataFetched = true;

    // Simulando, pois exigiria múltiplas chamadas à BrasilAPI
    console.warn("[loadOcorrenciasTable] Usando dados simulados. Implementação real exigiria múltiplas chamadas por estado.");
    for (const uf of estadosParaTabela) {
        // const dataUF = await fetchData(`${BRASIL_API_BASE}/seguranca-publica/v1/${uf}?ano=${anoRecente}`, null, `BrasilAPI/SINESP-${uf}`);
        // if (dataUF && dataUF.length > 0) {
        //     const anoData = dataUF.find(d => d.ano === anoRecente); // Supondo que a API retorne um array por ano
        //     const homicidio = anoData?.homicidio_doloso || 'N/D';
        //     const roubo_veiculo = anoData?.roubo_veiculo || 'N/D';
        //     const furto_veiculo = anoData?.furto_veiculo || 'N/D';
        //     tableHtml += `<tr><td>${uf}</td><td>${anoRecente}</td><td>${homicidio}</td><td>${roubo_veiculo}</td><td>${furto_veiculo}</td></tr>`;
        // } else {
        //     allDataFetched = false;
        //     tableHtml += `<tr><td>${uf}</td><td>${anoRecente}</td><td colspan="3" class="error-text">Dados não disponíveis</td></tr>`;
        // }
        // Dados Fictícios para a tabela:
        tableHtml += `<tr>
                        <td>${uf}</td>
                        <td>${anoRecente}</td>
                        <td>${(Math.floor(Math.random()*2000)+1000).toLocaleString('pt-BR')}</td>
                        <td>${(Math.floor(Math.random()*15000)+10000).toLocaleString('pt-BR')}</td>
                        <td>${(Math.floor(Math.random()*30000)+20000).toLocaleString('pt-BR')}</td>
                      </tr>`;
    }
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
    container.classList.remove('loading-text');
}


// --- Qualidade de Vida (IPEAData e Estático) ---
const IPEADATA_API_BASE = 'http://www.ipeadata.gov.br/api/odata4/ValoresSerie';

async function loadIdhRegioes() {
    // Fonte: Atlas do Desenvolvimento Humano no Brasil 2013 (dados de 2010) - PNUD Brasil, Ipea e FJP
    // Como uma API simples para estes dados pode não existir, usamos dados estáticos representativos.
    console.warn("[loadIdhRegioes] Usando dados estáticos para IDHM (2010). Fonte: Atlas Brasil.");
    const idhData = [
        { regiao: 'Norte', valor: 0.667 },
        { regiao: 'Nordeste', valor: 0.663 },
        { regiao: 'Sudeste', valor: 0.766 },
        { regiao: 'Sul', valor: 0.754 },
        { regiao: 'Centro-Oeste', valor: 0.757 }
    ];
    renderGenericChart('idhRegioesChart', {
        type: 'bar',
        data: {
            labels: idhData.map(d => d.regiao),
            datasets: [{
                label: 'IDHM (2010)',
                data: idhData.map(d => d.valor),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: { x: { beginAtZero: true, max: 1, title: {display: true, text: "IDHM"} }, y:{} },
            plugins: { title: { display: true, text: 'IDHM por Grandes Regiões (2010)' } }
        }
    });
}

async function loadIpeaSerie(serieCode, canvasId, chartTitle, yLabel, chartType = 'line', cardId, dataProcessor) {
    // Ex: BM_TXANalf15S (Taxa de Analfabetismo)
    // Ex: SP_EXTVIDA (Expectativa de Vida)
    // O IPEAData pode ser lento ou instável às vezes.
    const url = `${IPEADATA_API_BASE}(SERCODIGO='${serieCode}')?$select=VALDATA,VALVALOR`;
    const rawData = await fetchData(url, cardId, true, `IPEAData-${serieCode}`);

    if (!rawData || !rawData.value || rawData.value.length === 0) {
        document.getElementById(canvasId).parentElement.innerHTML = `<p class="error-text">Dados de '${chartTitle}' não disponíveis no IPEAData (Série: ${serieCode}).</p>`;
        return;
    }
    
    let processedData;
    if (dataProcessor) {
        processedData = dataProcessor(rawData.value);
    } else {
        processedData = rawData.value.map(d => ({
            // VALDATA no IPEA pode ser "YYYY-MM-DDTHH:mm:ss-03:00" ou apenas "YYYY" como string
            // Chart.js time adapter lida bem com ISO strings. Para apenas ano, precisamos converter.
            data: (String(d.VALDATA).length === 4 && !isNaN(parseInt(d.VALDATA))) ? new Date(parseInt(d.VALDATA), 0, 1) : new Date(d.VALDATA),
            valor: parseFloat(d.VALVALOR)
        })).filter(d => d.data instanceof Date && !isNaN(d.data) && !isNaN(d.valor))
           .sort((a,b) => a.data - b.data);
    }
    
    if (processedData.length === 0) {
        document.getElementById(canvasId).parentElement.innerHTML = `<p class="error-text">Dados de '${chartTitle}' (Série: ${serieCode}) insuficientes após processamento.</p>`;
        return;
    }

    renderGenericChart(canvasId, {
        type: chartType,
        data: {
            // labels: processedData.map(d => d.data), // Chart.js time scale uses data points directly
            datasets: [{
                label: chartTitle,
                data: processedData.map(d => ({x: d.data, y: d.valor})), // Formato {x,y} para time scale
                borderColor: '#5e72e4',
                backgroundColor: 'rgba(94, 114, 228, 0.2)',
                fill: chartType === 'line',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: { type: 'time', time: { unit: processedData.length > 20 ? 'year' : 'year' /* ou 'month' se dados mensais */ } , title: {display:true, text: "Ano"}}, // Ajustar unidade
                y: { beginAtZero: false, title: { display: true, text: yLabel } }
            },
            plugins: { title: { display: true, text: chartTitle } }
        }
    });
}

async function loadRendaPobrezaTable() {
    const container = document.getElementById('rendaPobrezaTableContainer');
    // Exemplo de códigos de série do IPEAData para o Brasil
    // RENDA_PPC (Renda média domiciliar per capita) - PNAD Contínua (IBGE) - Anual
    // POBREZA_PNAD (Percentagem de pessoas abaixo da linha de pobreza) - PNAD (IBGE) - Anual (pode estar descontinuada ou ter outra sigla)
    // Vamos usar códigos representativos, verificar disponibilidade no IPEAData.
    // IPEAData: PNAD C Anual - Rendimento médio mensal domiciliar per capita (R$) - Brasil - (PNADC12_RDPCAP)
    // IPEAData: PNAD Contínua Anual - Proporção de pobres (%) - Brasil - (PNADC12_POBREZARP)
    const series = [
        { nome: 'Renda Média Domiciliar per Capita (R$)', codigo: 'PNADC12_RDPCAP', currentYearOnly: true },
        { nome: '% Pessoas Abaixo da Linha de Pobreza', codigo: 'PNADC12_POBREZARP', currentYearOnly: true }
    ];
    let tableHtml = `<table><thead><tr><th>Indicador</th><th>Valor (Ano Mais Recente)</th><th>Ano</th></tr></thead><tbody>`;
    let hasError = false;

    for (const serie of series) {
        const url = `${IPEADATA_API_BASE}(SERCODIGO='${serie.codigo}')?$select=VALDATA,VALVALOR&$orderby=VALDATA desc&$top=1`; // Pega só o mais recente
        const rawData = await fetchData(url, null, true, `IPEAData-${serie.codigo}`);
        if (rawData && rawData.value && rawData.value.length > 0) {
            const item = rawData.value[0];
            const ano = String(item.VALDATA).substring(0,4); // VALDATA pode ser YYYY-MM-DD...
            tableHtml += `<tr>
                            <td>${serie.nome}</td>
                            <td>${parseFloat(item.VALVALOR).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>${ano}</td>
                          </tr>`;
        } else {
            hasError = true;
            tableHtml += `<tr><td>${serie.nome}</td><td colspan="2" class="error-text">Dado indisponível (${serie.codigo})</td></tr>`;
        }
    }
    tableHtml += '</tbody></table>';
    container.innerHTML = tableHtml;
    container.classList.remove('loading-text');
}

// --- Outros Fatores Sociais (IPEAData) ---
async function loadPopFaixaEtaria() {
    // IPEAData: População residente por situação do domicílio, sexo e grupo de idade - Brasil (POPSEXFAIXA)
    // Esta série pode ser muito detalhada. Vamos simplificar para grandes grupos.
    // Alternativa: Usar dados estáticos de uma projeção populacional recente do IBGE por faixas etárias.
    console.warn("[loadPopFaixaEtaria] Usando dados simulados para estrutura etária. API IPEAData pode ser complexa para este detalhe.");
    const cardId = 'popFaixaEtariaCard';
    const dataSimulada = {
        labels: ['0-14 anos', '15-64 anos', '65+ anos'],
        datasets: [{
            label: 'População por Faixa Etária (Estimativa %)',
            data: [21, 67, 12], // Exemplo de percentuais
            backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 159, 64, 0.7)']
        }]
    };
     renderGenericChart('popFaixaEtariaChart', {
        type: 'pie',
        data: dataSimulada,
        options: {
            plugins: { title: { display: true, text: 'Distribuição Etária da População (Brasil - Estimativa %)' }, legend: {position: 'bottom'} }
        }
    });
}

async function loadSaneamento() {
    // IPEAData: SNIS - População total atendida com abastecimento de água (%) - Brasil (SNIS_AGUAATEND)
    // IPEAData: SNIS - População total atendida com esgotamento sanitário (%) - Brasil (SNIS_ESGOTOATEND)
    const serieAgua = 'SNIS_AGUAATEND';
    const serieEsgoto = 'SNIS_ESGOTOATEND';
    const cardId = 'saneamentoCard';

    const dataAguaRaw = await fetchData(`${IPEADATA_API_BASE}(SERCODIGO='${serieAgua}')?$select=VALDATA,VALVALOR&$orderby=VALDATA asc`, cardId, true, `IPEAData-${serieAgua}`);
    const dataEsgotoRaw = await fetchData(`${IPEADATA_API_BASE}(SERCODIGO='${serieEsgoto}')?$select=VALDATA,VALVALOR&$orderby=VALDATA asc`, null, true, `IPEAData-${serieEsgoto}`); // No cardId for second call to avoid overwrite

    if (!dataAguaRaw || !dataAguaRaw.value || !dataEsgotoRaw || !dataEsgotoRaw.value) {
        document.getElementById(canvasId).parentElement.innerHTML = `<p class="error-text">Dados de saneamento não disponíveis.</p>`;
        return;
    }

    const processIpeaAnual = (rawData) => rawData.value.map(d => ({
        data: new Date(parseInt(String(d.VALDATA).substring(0,4)), 0, 1), // Ano
        valor: parseFloat(d.VALVALOR)
    })).filter(d => !isNaN(d.valor) && d.data instanceof Date && !isNaN(d.data))
       .sort((a,b) => a.data - b.data);

    const dataAgua = processIpeaAnual(dataAguaRaw);
    const dataEsgoto = processIpeaAnual(dataEsgotoRaw);
    
    // Sincronizar anos para o gráfico
    const allYears = [...new Set([...dataAgua.map(d=>d.data.getFullYear()), ...dataEsgoto.map(d=>d.data.getFullYear())])].sort();
    
    const aguaDataset = {
        label: '% Pop. Atendida com Água',
        data: allYears.map(year => {
            const entry = dataAgua.find(d => d.data.getFullYear() === year);
            return entry ? {x: new Date(year,0,1), y: entry.valor} : {x: new Date(year,0,1), y: null};
        }),
        borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', fill:true, tension:0.1
    };
    const esgotoDataset = {
        label: '% Pop. Atendida com Esgoto',
        data: allYears.map(year => {
            const entry = dataEsgoto.find(d => d.data.getFullYear() === year);
            return entry ? {x: new Date(year,0,1), y: entry.valor} : {x: new Date(year,0,1), y: null};
        }),
        borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill:true, tension:0.1
    };

    renderGenericChart('saneamentoChart', {
        type: 'line',
        data: { datasets: [aguaDataset, esgotoDataset] },
        options: {
            scales: { x: { type: 'time', time: { unit: 'year' }, title:{display:true, text:"Ano"} }, y: { beginAtZero: true, max: 100, title: { display: true, text: '% da População' } } },
            plugins: { title: { display: true, text: 'Acesso a Água e Esgotamento Sanitário (Brasil)' }, legend: {position: 'bottom'} },
            showLegend: true
        }
    });
}


// --- Initialize Dashboard ---
document.addEventListener('DOMContentLoaded', () => {
    // Segurança Pública
    loadHomicidiosEstaduais(); // Simulado
    loadRoubosFurtos(); // Simulado
    loadOcorrenciasTable(); // Simulado

    // Qualidade de Vida
    loadIdhRegioes(); // Estático
    loadIpeaSerie('BM_TXANalf15S', 'analfabetismoChart', 'Taxa de Analfabetismo (15+ anos)', '%', 'line', 'analfabetismoCard');
    loadIpeaSerie('SP_EXTVIDA', 'expectativaVidaChart', 'Expectativa de Vida ao Nascer', 'Anos', 'line', 'expectativaVidaCard');
    loadRendaPobrezaTable();


    // Outros Fatores Sociais
    loadPopFaixaEtaria(); // Simulado
    // IPEAData: PNAD Contínua Trimestral - Taxa de desocupação (%) - Brasil (PNADC_TX_DESOCUP عادة)
    loadIpeaSerie('PNADC_TX_DESOCUP', 'desocupacaoChart', 'Taxa de Desocupação (PNAD Cont.)', '%', 'line', 'desocupacaoCard');
    loadSaneamento();
    
    updateCurrentDateTime();
    setInterval(updateCurrentDateTime, 60000);
});
