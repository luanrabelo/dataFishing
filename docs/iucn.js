/**
 * IUCN Red List API Integration
 */

class IucnAPI {
    constructor() {
        this.baseURL = 'https://api.iucnredlist.org/api/v4';
        this.apiKey = this.loadApiKey();
        this.maxRetries = 5;
        this.retryDelay = 2000;
        // Lista de proxies CORS para contornar restrições
        this.proxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?',
            'https://cors-proxy.fringe.zone/',
            'https://proxy.cors.sh/'
        ];
        console.log('🔴 IUCN API instance created');
    }

    loadApiKey() {
        // Tentar carregar chave do localStorage
        const savedKey = localStorage.getItem('iucn_api_key');
        if (savedKey) {
            console.log('🔴 IUCN - API key loaded from browser storage');
            return savedKey;
        }
        return null;
    }

    saveApiKey(apiKey) {
        if (apiKey && apiKey.trim()) {
            localStorage.setItem('iucn_api_key', apiKey.trim());
            this.apiKey = apiKey.trim();
            console.log('🔴 IUCN - API key saved to browser storage');
            return true;
        }
        return false;
    }

    clearApiKey() {
        localStorage.removeItem('iucn_api_key');
        this.apiKey = null;
        console.log('🔴 IUCN - API key cleared from browser storage');
    }

    promptForApiKey() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                    <div class="text-center">
                        <div class="mb-4">
                            <i class="fas fa-key text-red-600 text-4xl mb-2"></i>
                            <h3 class="text-base font-bold text-gray-800 mb-2">IUCN API Key Required</h3>
                            <p class="text-base text-gray-600 mb-4">Enter your IUCN Red List API token to access the database.</p>
                        </div>
                        
                        <div class="mb-4">
                            <label for="iucn-api-key-input" class="block text-base font-medium text-gray-700 mb-2">API Token:</label>
                            <input 
                                type="password" 
                                id="iucn-api-key-input" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                placeholder="Enter your IUCN API token..."
                            >
                            <small class="text-base text-gray-500 mt-1 block">
                                <i class="fas fa-info-circle mr-1"></i>
                                Your key will be saved securely in your browser
                            </small>
                        </div>
                        
                        <div class="flex gap-3">
                            <button id="iucn-api-cancel" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                                Cancel
                            </button>
                            <button id="iucn-api-save" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                Save & Continue
                            </button>
                        </div>
                        
                        <div class="mt-4 text-base text-gray-500">
                            <p><strong>Don't have an API key?</strong></p>
                            <p>Get one free at: <a href="https://apiv3.iucnredlist.org/api/v3/token" target="_blank" class="text-red-600 hover:underline">IUCN API Token</a></p>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const input = document.getElementById('iucn-api-key-input');
            const saveBtn = document.getElementById('iucn-api-save');
            const cancelBtn = document.getElementById('iucn-api-cancel');

            input.focus();

            const cleanup = () => {
                document.body.removeChild(modal);
            };

            saveBtn.addEventListener('click', () => {
                const apiKey = input.value.trim();
                if (apiKey) {
                    this.saveApiKey(apiKey);
                    cleanup();
                    resolve(apiKey);
                } else {
                    alert('Please enter a valid API key');
                }
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(null);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveBtn.click();
                }
            });
        });
    }

    async ensureApiKey() {
        if (!this.apiKey) {
            this.apiKey = await this.promptForApiKey();
        }
        return this.apiKey;
    }

    async makeApiRequest(url, useProxy = false, proxyIndex = 0) {
        let requestUrl = url;
        let fetchOptions = {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': this.apiKey
            }
        };

        if (useProxy && proxyIndex < this.proxies.length) {
            const proxy = this.proxies[proxyIndex];

            if (proxy.includes('allorigins')) {
                // AllOrigins precisa de URL encoding especial
                requestUrl = `${proxy}${encodeURIComponent(url)}`;
                fetchOptions.headers = {
                    'accept': 'application/json'
                };
            } else {
                // Outros proxies
                requestUrl = `${proxy}${encodeURIComponent(url)}`;
                fetchOptions.headers = {
                    'accept': 'application/json'
                };
            }
        }

        const response = await fetch(requestUrl, fetchOptions);

        if (useProxy && proxy.includes('allorigins') && response.ok) {
            // Para AllOrigins, extrair conteúdo do JSON
            const jsonResponse = await response.json();
            if (jsonResponse.contents) {
                // Simular resposta normal
                return {
                    ok: true,
                    status: 200,
                    json: async () => JSON.parse(jsonResponse.contents)
                };
            }
        }

        return response;
    }

    async iucnTaxa(species_name) {
        const genus_name = species_name.split(' ')[0];
        const species_epithet = species_name.split(' ')[1];

        if (!genus_name || !species_epithet) {
            return this.createNotFoundResult(species_name);
        }

        const data_dict = {
            'Tax ID': '-',
            'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 'Genus': genus_name,
            'Species Name': species_name, 'Scientific Name': '-', 'Authority': '-', 'Published Year': '-',
            'Assessment Date': '-', 'Category': '-', 'Criteria': '-', 'Population Trend': '-',
            'Marine System': '-', 'Freshwater System': '-', 'Terrestrial System': '-',
            'Assessor': '-', 'Reviewer': '-', 'AOO': '-', 'EOO': '-',
            'Elevation Lower': '-', 'Elevation Upper': '-', 'Depth Lower': '-', 'Depth Upper': '-',
            'Errata Flag': '-', 'Errata Reason': '-', 'Amended Flag': '-', 'Amended Reason': '-'
        };

        const targetUrl = `${this.baseURL}/taxa/scientific_name?genus_name=${encodeURIComponent(genus_name)}&species_name=${encodeURIComponent(species_epithet)}&token=${this.apiKey}`;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                console.log(`🔴 IUCN - ${species_name} Getting taxonomy from IUCN... (attempt ${attempt + 1}/${this.maxRetries})`);

                // Primeira tentativa: requisição direta
                if (attempt === 0) {
                    try {
                        const response = await this.makeApiRequest(targetUrl, false);

                        if (response.status === 401) {
                            console.error('🔴 IUCN - Invalid API key, prompting for new key...');
                            this.clearApiKey();
                            const newKey = await this.promptForApiKey();
                            if (!newKey) {
                                throw new Error('API key required for IUCN access');
                            }
                            continue;
                        }

                        if (response.ok) {
                            const data = await response.json();
                            return this.processIucnResponse(data, species_name, data_dict);
                        }
                    } catch (error) {
                        console.warn(`🔴 IUCN - ${species_name} Direct request failed:`, error.message);
                    }
                }

                // Tentar com proxies CORS
                for (let proxyIndex = 0; proxyIndex < this.proxies.length; proxyIndex++) {
                    try {
                        const proxyName = this.proxies[proxyIndex].includes('allorigins') ? 'AllOrigins' :
                            this.proxies[proxyIndex].includes('corsproxy') ? 'CORSProxy' :
                                this.proxies[proxyIndex].includes('fringe') ? 'Fringe' : 'CORS.sh';

                        console.log(`🔴 IUCN - ${species_name} Trying proxy: ${proxyName} (attempt ${attempt + 1}/${this.maxRetries})...`);

                        const response = await this.makeApiRequest(targetUrl, true, proxyIndex);

                        if (response.ok) {
                            const data = await response.json();
                            console.log(`🔴 IUCN - ${species_name} Successfully retrieved data via ${proxyName} proxy`);
                            return this.processIucnResponse(data, species_name, data_dict);
                        }
                    } catch (proxyError) {
                        console.warn(`🔴 IUCN - ${species_name} Proxy ${proxyIndex + 1} failed:`, proxyError.message);
                        continue;
                    }
                }

                if (attempt < this.maxRetries - 1) {
                    console.warn(`🔴 IUCN - ${species_name} All methods failed, retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                }

            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`🔴 IUCN - ${species_name} Request failed: ${error.message}. Retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                } else {
                    console.error(`🔴 IUCN - ${species_name} All attempts failed: ${error.message}`);
                    data_dict['Category'] = 'Error';
                    return data_dict;
                }
            }
        }

        // Se chegou aqui, todas as tentativas falharam
        console.error(`🔴 IUCN - ${species_name} All attempts failed after ${this.maxRetries} retries`);
        data_dict['Category'] = 'Error';
        return data_dict;
    }

    processIucnResponse(data, species_name, data_dict) {
        if (data && data.result && data.result.length > 0) {
            const result = data.result[0];

            // Extract all available fields based on Python implementation
            data_dict['Tax ID'] = String(result.taxonid || '-');
            data_dict['Kingdom'] = String(result.kingdom_name || '-');
            data_dict['Phylum'] = String(result.phylum_name || '-');
            data_dict['Class'] = String(result.class_name || '-');
            data_dict['Order'] = String(result.order_name || '-');
            data_dict['Family'] = String(result.family_name || '-');
            data_dict['Genus'] = String(result.genus_name || data_dict['Genus']);
            data_dict['Species Name'] = String(result.species_name || species_name);
            data_dict['Scientific Name'] = String(result.scientific_name || '-');
            data_dict['Authority'] = String(result.authority || '-');
            data_dict['Published Year'] = String(result.published_year || '-');
            data_dict['Assessment Date'] = String(result.assessment_date || '-');
            data_dict['Category'] = String(result.category || '-');
            data_dict['Criteria'] = String(result.criteria || '-');
            data_dict['Population Trend'] = String(result.population_trend || '-');
            data_dict['Marine System'] = String(result.marine_system ? 'true' : 'false');
            data_dict['Freshwater System'] = String(result.freshwater_system ? 'true' : 'false');
            data_dict['Terrestrial System'] = String(result.terrestrial_system ? 'true' : 'false');
            data_dict['Assessor'] = String(result.assessor || '-');
            data_dict['Reviewer'] = String(result.reviewer || '-');
            data_dict['AOO'] = String(result.aoo_km2 || '-');
            data_dict['EOO'] = String(result.eoo_km2 || '-');
            data_dict['Elevation Lower'] = String(result.elevation_lower || '-');
            data_dict['Elevation Upper'] = String(result.elevation_upper || '-');
            data_dict['Depth Lower'] = String(result.depth_lower || '-');
            data_dict['Depth Upper'] = String(result.depth_upper || '-');
            data_dict['Errata Flag'] = String(result.errata_flag ? 'true' : 'false');
            data_dict['Errata Reason'] = String(result.errata_reason || '-');
            data_dict['Amended Flag'] = String(result.amended_flag ? 'true' : 'false');
            data_dict['Amended Reason'] = String(result.amended_reason || '-');

            console.log(`🔴 IUCN - ${species_name} Found: ${data_dict['Category']}, ${data_dict['Population Trend']}`);
            return data_dict;
        } else {
            console.warn(`🔴 IUCN - ${species_name} No results found`);
            return data_dict;
        }
    }

    async iucnCommonNames(species_name) {
        const genus_name = species_name.split(' ')[0];
        const species_epithet = species_name.split(' ')[1];

        if (!genus_name || !species_epithet) {
            return '-';
        }

        try {
            const targetUrl = `${this.baseURL}/taxa/common_names?genus_name=${encodeURIComponent(genus_name)}&species_name=${encodeURIComponent(species_epithet)}&token=${this.apiKey}`;

            // Tentar requisição direta primeiro, depois proxies
            for (let proxyIndex = -1; proxyIndex < this.proxies.length; proxyIndex++) {
                try {
                    const response = await this.makeApiRequest(targetUrl, proxyIndex >= 0, proxyIndex);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.result && data.result.length > 0) {
                            return data.result.map(name => `${name.taxonname || name.name} (${name.language || 'Unknown'})`).join('; ');
                        }
                        return '-';
                    }
                } catch (error) {
                    if (proxyIndex === -1) {
                        console.debug(`🔴 IUCN - Error getting common names for ${species_name} (direct):`, error.message);
                    } else {
                        console.debug(`🔴 IUCN - Error getting common names for ${species_name} (proxy ${proxyIndex + 1}):`, error.message);
                    }
                    continue;
                }
            }
        } catch (error) {
            console.debug(`🔴 IUCN - Error getting common names for ${species_name}: ${error.message}`);
        }
        return '-';
    }

    async iucnSynonyms(species_name) {
        const genus_name = species_name.split(' ')[0];
        const species_epithet = species_name.split(' ')[1];

        if (!genus_name || !species_epithet) {
            return '-';
        }

        try {
            const targetUrl = `${this.baseURL}/taxa/synonyms?genus_name=${encodeURIComponent(genus_name)}&species_name=${encodeURIComponent(species_epithet)}&token=${this.apiKey}`;

            // Tentar requisição direta primeiro, depois proxies
            for (let proxyIndex = -1; proxyIndex < this.proxies.length; proxyIndex++) {
                try {
                    const response = await this.makeApiRequest(targetUrl, proxyIndex >= 0, proxyIndex);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.result && data.result.length > 0) {
                            return data.result.map(syn => syn.accepted_name || syn.synonym || syn.scientific_name).join('; ');
                        }
                        return '-';
                    }
                } catch (error) {
                    console.debug(`🔴 IUCN - Error getting synonyms for ${species_name} (attempt ${proxyIndex + 2}):`, error.message);
                    continue;
                }
            }
        } catch (error) {
            console.debug(`🔴 IUCN - Error getting synonyms for ${species_name}: ${error.message}`);
        }
        return '-';
    }

    async iucnCountryOccurrence(species_name) {
        const genus_name = species_name.split(' ')[0];
        const species_epithet = species_name.split(' ')[1];

        if (!genus_name || !species_epithet) {
            return '-';
        }

        try {
            const targetUrl = `${this.baseURL}/taxa/countries?genus_name=${encodeURIComponent(genus_name)}&species_name=${encodeURIComponent(species_epithet)}&token=${this.apiKey}`;

            // Tentar requisição direta primeiro, depois proxies
            for (let proxyIndex = -1; proxyIndex < this.proxies.length; proxyIndex++) {
                try {
                    const response = await this.makeApiRequest(targetUrl, proxyIndex >= 0, proxyIndex);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.result && data.result.length > 0) {
                            return data.result.map(country => `${country.country || country.name} (${country.presence || country.distribution_code || 'Unknown'})`).join('; ');
                        }
                        return '-';
                    }
                } catch (error) {
                    console.debug(`🔴 IUCN - Error getting country occurrence for ${species_name} (attempt ${proxyIndex + 2}):`, error.message);
                    continue;
                }
            }
        } catch (error) {
            console.debug(`🔴 IUCN - Error getting country occurrence for ${species_name}: ${error.message}`);
        }
        return '-';
    }

    async iucnThreats(species_name) {
        const genus_name = species_name.split(' ')[0];
        const species_epithet = species_name.split(' ')[1];

        if (!genus_name || !species_epithet) {
            return '-';
        }

        try {
            const targetUrl = `${this.baseURL}/taxa/threats?genus_name=${encodeURIComponent(genus_name)}&species_name=${encodeURIComponent(species_epithet)}&token=${this.apiKey}`;

            // Tentar requisição direta primeiro, depois proxies
            for (let proxyIndex = -1; proxyIndex < this.proxies.length; proxyIndex++) {
                try {
                    const response = await this.makeApiRequest(targetUrl, proxyIndex >= 0, proxyIndex);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.result && data.result.length > 0) {
                            return data.result.map(threat => threat.title || threat.name || threat.code).join('; ');
                        }
                        return '-';
                    }
                } catch (error) {
                    console.debug(`🔴 IUCN - Error getting threats for ${species_name} (attempt ${proxyIndex + 2}):`, error.message);
                    continue;
                }
            }
        } catch (error) {
            console.debug(`🔴 IUCN - Error getting threats for ${species_name}: ${error.message}`);
        }
        return '-';
    }

    async iucnHabitats(species_name) {
        const genus_name = species_name.split(' ')[0];
        const species_epithet = species_name.split(' ')[1];

        if (!genus_name || !species_epithet) {
            return '-';
        }

        try {
            const targetUrl = `${this.baseURL}/taxa/habitats?genus_name=${encodeURIComponent(genus_name)}&species_name=${encodeURIComponent(species_epithet)}&token=${this.apiKey}`;

            // Tentar requisição direta primeiro, depois proxies
            for (let proxyIndex = -1; proxyIndex < this.proxies.length; proxyIndex++) {
                try {
                    const response = await this.makeApiRequest(targetUrl, proxyIndex >= 0, proxyIndex);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.result && data.result.length > 0) {
                            return data.result.map(habitat => habitat.habitat || habitat.name || habitat.code).join('; ');
                        }
                        return '-';
                    }
                } catch (error) {
                    console.debug(`🔴 IUCN - Error getting habitats for ${species_name} (attempt ${proxyIndex + 2}):`, error.message);
                    continue;
                }
            }
        } catch (error) {
            console.debug(`🔴 IUCN - Error getting habitats for ${species_name}: ${error.message}`);
        }
        return '-';
    }

    createNotFoundResult(speciesName) {
        return {
            'Tax ID': '-',
            'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 'Genus': speciesName.split(' ')[0] || '-',
            'Species Name': speciesName, 'Scientific Name': '-', 'Authority': '-', 'Published Year': '-',
            'Assessment Date': '-', 'Category': 'Not Evaluated', 'Criteria': '-', 'Population Trend': '-',
            'Marine System': '-', 'Freshwater System': '-', 'Terrestrial System': '-',
            'Assessor': '-', 'Reviewer': '-', 'AOO': '-', 'EOO': '-',
            'Elevation Lower': '-', 'Elevation Upper': '-', 'Depth Lower': '-', 'Depth Upper': '-',
            'Errata Flag': '-', 'Errata Reason': '-', 'Amended Flag': '-', 'Amended Reason': '-'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        // Ensure API key is available before starting
        if (!await this.ensureApiKey()) {
            throw new Error('IUCN API key is required');
        }

        const results = [];
        const total = speciesList.length;

        console.log(`🔴 IUCN - Starting search for ${total} species using CORS proxy...`);
        console.log(`🔴 IUCN - Note: Using proxy servers to bypass browser CORS restrictions`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`🔴 IUCN - Processing ${species} (${i + 1}/${total})...`);

                // Get basic taxonomy data
                const taxonomyResult = await this.iucnTaxa(species);

                // Get additional data if species was found
                let additionalData = {};
                if (taxonomyResult['Category'] !== 'Error' && taxonomyResult['Tax ID'] !== '-') {
                    const [commonNames, synonyms, countries, threats, habitats] = await Promise.all([
                        this.iucnCommonNames(species),
                        this.iucnSynonyms(species),
                        this.iucnCountryOccurrence(species),
                        this.iucnThreats(species),
                        this.iucnHabitats(species)
                    ]);

                    additionalData = {
                        'Common Names': commonNames,
                        'Synonyms': synonyms,
                        'Country Occurrence': countries,
                        'Threats': threats,
                        'Habitats': habitats
                    };
                } else {
                    additionalData = {
                        'Common Names': '-',
                        'Synonyms': '-',
                        'Country Occurrence': '-',
                        'Threats': '-',
                        'Habitats': '-'
                    };
                }

                const result = { ...taxonomyResult, ...additionalData };
                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }

                // Rate limiting mais conservador devido ao uso de proxy
                if (i < speciesList.length - 1) {
                    await this.delay(2000); // 2 segundos entre requests
                }

            } catch (error) {
                console.error(`🔴 IUCN - Error processing ${species}:`, error);

                const errorResult = { ...this.createNotFoundResult(species), error: error.message };
                results.push(errorResult);

                if (onSpeciesComplete) {
                    onSpeciesComplete(errorResult, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }
            }
        }

        return results;
    }
}

async function getIUCN(apiKey = 'iucn') {
    console.log(`getIUCN called with apiKey: ${apiKey}`);

    // Verificar se o iucnAPI está disponível
    if (typeof window.iucnAPI === 'undefined' || !window.iucnAPI) {
        console.error('❌ iucnAPI is not available. Attempting to initialize...');

        if (typeof IucnAPI !== 'undefined') {
            window.iucnAPI = new IucnAPI();
            console.log('✅ iucnAPI initialized successfully');
        } else {
            console.error('❌ IucnAPI class not found. Please check if iucn.js is loaded.');
            alert('Erro: API do IUCN não está carregada. Por favor, recarregue a página e tente novamente.');
            return;
        }
    }

    // Ensure API key is available
    if (!await window.iucnAPI.ensureApiKey()) {
        alert('IUCN API key is required to search the database.');
        return;
    }

    const categoryColors = {
        'Extinct': '#000000',
        'Extinct in the Wild': '#542344',
        'Critically Endangered': '#D81E05',
        'Endangered': '#FC7F3F',
        'Vulnerable': '#F9E79F',
        'Near Threatened': '#CCE2A3',
        'Least Concern': '#78C679',
        'Data Deficient': '#D3D3D3',
        'Not Evaluated': '#FFFFFF',
        'Error': '#FA7070',
        'Not Found': '#D1D1C7'
    };

    const trendColors = {
        'Increasing': '#5FC65A',
        'Stable': '#87CEEB',
        'Decreasing': '#FA7070',
        'Unknown': '#D1D1C7',
        '-': '#D1D1C7'
    };

    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (!progressModal) {
        console.error('Progress modal not found');
        return;
    }

    progressModal.classList.remove('hidden');

    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n').filter(name => name.trim());

    if (speciesNames.length === 0) {
        alert('Please enter at least one species name.');
        progressModal.classList.add('hidden');
        return;
    }

    console.log(`🔴 IUCN - Starting search for ${speciesNames.length} species...`);

    // Verificar quais campos opcionais estão selecionados
    const iucnStatusOpt = document.getElementById('statusconservationopt')?.checked ?? true;
    const iucnTaxonomyOpt = document.getElementById('taxonomyopt')?.checked ?? true;
    const iucnCommonNamesOpt = document.getElementById('commonnamesopt')?.checked ?? true;
    const iucnThreatsOpt = document.getElementById('threatsopt')?.checked ?? true;
    const iucnHabitatsOpt = document.getElementById('habitatsopt')?.checked ?? true;
    const iucnSpeciesAuthorOpt = document.getElementById('speciesauthoropt')?.checked ?? true;

    // Criar tabela do IUCN
    const _iucnTable = document.createElement('table');
    _iucnTable.id = 'IucnTable';
    _iucnTable.classList.add(
        "text-base",
        "text-blue-800",
        "table-auto",
        "border-collapse",
        "w-full"
    );

    let headerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true" style="position: sticky; z-index: 20;">
        <tr>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 0)">
                Taxon ID <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 1)">
                Scientific Name <i class="fas fa-sort ml-2"></i>
            </th>
            ${iucnTaxonomyOpt ? `
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 2)">
                Kingdom <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 3)">
                Phylum <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 4)">
                Class <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 5)">
                Order <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 6)">
                Family <i class="fas fa-sort ml-2"></i>
            </th>` : ''}
            ${iucnStatusOpt ? `
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 7)">
                Conservation Status <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 8)">
                Population Trend <i class="fas fa-sort ml-2"></i>
            </th>` : ''}
            ${iucnCommonNamesOpt ? `
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 9)">
                Common Names <i class="fas fa-sort ml-2"></i>
            </th>` : ''}
            ${iucnSpeciesAuthorOpt ? `
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 10)">
                Authority <i class="fas fa-sort ml-2"></i>
            </th>` : ''}
            ${iucnThreatsOpt ? `
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 11)">
                Threats <i class="fas fa-sort ml-2"></i>
            </th>` : ''}
            ${iucnHabitatsOpt ? `
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', 12)">
                Habitats <i class="fas fa-sort ml-2"></i>
            </th>` : ''}
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _iucnTable.innerHTML = headerHTML;

    const _iucnTableBody = _iucnTable.createTBody();
    _iucnTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _iucnTableWrapper = document.createElement('div');
    _iucnTableWrapper.classList.add("w-full", "table-wrapper");
    _iucnTableWrapper.appendChild(_iucnTable);

    const iucnResults = document.getElementById('tabPanel-iucn');
    iucnResults.appendChild(_iucnTableWrapper);

    try {
        console.log('🔴 Using iucnAPI.searchBatch...');

        const results = await window.iucnAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;

                // Update per-API progress bar only (not main progress bar)
                const apiProgressBar = document.getElementById(`progressBar-${apiKey}`);
                const apiProgressText = document.getElementById(`progressText-${apiKey}`);
                if (apiProgressBar) apiProgressBar.style.width = progress + '%';
                if (apiProgressText) apiProgressText.textContent = Math.round(progress) + '%';

                // Also update global progress tracker
                if (typeof window.globalProgressTracker !== 'undefined') {
                    window.globalProgressTracker.updateApiProgress(apiKey, progress);
                }
            },
            (result, current, total) => {
                console.log(`🔴 IUCN - Completed ${current}/${total}: ${result['Species Name']} (${result['Category']})`);
            }
        );

        console.log(`🔴 IUCN search completed. Processing ${results.length} results...`);

        // Contar resultados com sucesso e erros
        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _iucnTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );

            let cellIndex = 0;

            // Taxon ID
            const taxonIdCell = row.insertCell(cellIndex++);
            taxonIdCell.innerHTML = result['Tax ID'] || '-';
            taxonIdCell.className = "py-5 px-5";

            // Scientific Name
            const scientificNameCell = row.insertCell(cellIndex++);
            scientificNameCell.innerHTML = `<i>${result['Scientific Name'] || result['Species Name']}</i>`;
            scientificNameCell.className = "py-5 px-5";

            // Taxonomy fields (if enabled)
            if (iucnTaxonomyOpt) {
                // Kingdom
                const kingdomCell = row.insertCell(cellIndex++);
                kingdomCell.innerHTML = result['Kingdom'] || '-';
                kingdomCell.className = "py-5 px-5";

                // Phylum
                const phylumCell = row.insertCell(cellIndex++);
                phylumCell.innerHTML = result['Phylum'] || '-';
                phylumCell.className = "py-5 px-5";

                // Class
                const classCell = row.insertCell(cellIndex++);
                classCell.innerHTML = result['Class'] || '-';
                classCell.className = "py-5 px-5";

                // Order
                const orderCell = row.insertCell(cellIndex++);
                orderCell.innerHTML = result['Order'] || '-';
                orderCell.className = "py-5 px-5";

                // Family
                const familyCell = row.insertCell(cellIndex++);
                familyCell.innerHTML = result['Family'] || '-';
                familyCell.className = "py-5 px-5";
            }

            // Conservation status fields (if enabled)
            if (iucnStatusOpt) {
                // Conservation Status
                const statusCell = row.insertCell(cellIndex++);
                const statusColor = categoryColors[result['Category']] || '#D1D1C7';
                statusCell.innerHTML = result['Category'] || '-';
                statusCell.className = "py-5 px-5 font-bold text-center";
                statusCell.style.backgroundColor = statusColor;
                statusCell.style.color = ['#000000', '#542344', '#D81E05'].includes(statusColor) ? 'white' : 'black';

                // Population Trend
                const trendCell = row.insertCell(cellIndex++);
                const trendColor = trendColors[result['Population Trend']] || '#D1D1C7';
                trendCell.innerHTML = result['Population Trend'] || '-';
                trendCell.className = "py-5 px-5 font-bold text-center";
                trendCell.style.backgroundColor = trendColor;
            }

            // Common Names (if enabled)
            if (iucnCommonNamesOpt) {
                const commonNamesCell = row.insertCell(cellIndex++);
                commonNamesCell.innerHTML = result['Common Names'] || '-';
                commonNamesCell.className = "py-5 px-5";
            }

            // Authority (if enabled)
            if (iucnSpeciesAuthorOpt) {
                const authorityCell = row.insertCell(cellIndex++);
                authorityCell.innerHTML = result['Authority'] || '-';
                authorityCell.className = "py-5 px-5";
            }

            // Threats (if enabled)
            if (iucnThreatsOpt) {
                const threatsCell = row.insertCell(cellIndex++);
                threatsCell.innerHTML = result['Threats'] || '-';
                threatsCell.className = "py-5 px-5";
            }

            // Habitats (if enabled)
            if (iucnHabitatsOpt) {
                const habitatsCell = row.insertCell(cellIndex++);
                habitatsCell.innerHTML = result['Habitats'] || '-';
                habitatsCell.className = "py-5 px-5";
            }

            // Link
            const linkCell = row.insertCell(cellIndex++);
            if (result['Tax ID'] && result['Tax ID'] !== '-') {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md" 
                       href="https://www.iucnredlist.org/species/${result['Tax ID']}" 
                       target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                        View
                    </a>
                `;
            } else {
                linkCell.innerHTML = '-';
            }
            linkCell.className = "py-5 px-5";

            // Contar estatísticas
            if (result['Category'] !== 'Error' && result['Category'] !== 'Not Found' && result['Tax ID'] !== '-') {
                successCount++;
            }
            if (result.error || result['Category'] === 'Error') {
                errorCount++;
            }
        }

        // Mostrar avisos de resultado
        if (successCount > 0) {
            const successNotice = document.createElement('div');
            successNotice.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4';
            successNotice.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">
                            <strong>Success:</strong> Successfully accessed IUCN Red List API using CORS proxy.
                        </p>
                        <p class="text-sm mt-2">
                            Results: ${successCount}/${results.length} species found with conservation data
                        </p>
                    </div>
                </div>
            `;
            iucnResults.insertBefore(successNotice, _iucnTableWrapper);
        }

        if (errorCount > 0) {
            const errorNotice = document.createElement('div');
            errorNotice.className = 'bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4';
            errorNotice.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">
                            <strong>Browser Notice:</strong> ${errorCount} of ${results.length} requests failed.
                        </p>
                        <p class="text-sm mt-2">
                            The IUCN API requires proxy servers for browser access due to CORS restrictions.
                        </p>
                        <p class="text-sm mt-2">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                        <p class="text-sm mt-2">
                            <i class="fas fa-lightbulb"></i> 
                            <strong>Tip:</strong> For better reliability with large datasets, consider using the Python version of dataFishing.
                        </p>
                    </div>
                </div>
            `;
            iucnResults.insertBefore(errorNotice, _iucnTableWrapper);
        }

        // Adicionar controles de busca e exportação
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="iucn-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in IUCN Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="iucn-table-search" 
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="iucn-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
                            <i class="fas fa-times text-gray-400 hover:text-gray-600 text-lg"></i>
                        </div>
                    </div>
                    <small class="text-gray-600 mt-2 block">
                        <i class="fas fa-info-circle mr-1"></i>
                        This search will filter and highlight results in the visible columns selected below.
                    </small>
                </div>
            </div>

            <!-- Column Filters -->
            <div class="px-4 py-4">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-columns mr-2"></i>Toggle Column Visibility
                </h4>
                <div id="iucn-column-filters" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="iucn-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="iucn-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>
                        Export to TSV
                    </button>
                </div>
                <p class="text-base text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results.
                </p>
            </div>
        `;

        // Inserir controles ANTES da tabela
        iucnResults.insertBefore(controlsContainer, _iucnTableWrapper);

        // Configurar funcionalidades dos controles
        createColumnFilters('IucnTable', 'iucn-column-filters');

        const searchInput = document.getElementById('iucn-table-search');
        const clearButton = document.getElementById('iucn-search-clear');
        let searchTimeout;

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm) {
                clearButton.classList.remove('hidden');
            } else {
                clearButton.classList.add('hidden');
            }
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAndHighlightTable('IucnTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('IucnTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('IucnTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('iucn-export-excel').addEventListener('click', function () {
            exportTableToExcel('IucnTable');
        });

        document.getElementById('iucn-export-tsv').addEventListener('click', function () {
            exportTableToTSV('IucnTable');
        });

        updateDataResults();

        console.log(`🔴 IUCN search completed: ${successCount} successful records`);

    } catch (error) {
        console.error('❌ Error during IUCN search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Add API key management to the page
document.addEventListener('DOMContentLoaded', function () {
    // Add API key management button to IUCN card if it exists
    const iucnCard = document.getElementById('iucnCard');
    if (iucnCard) {
        const manageKeyButton = document.createElement('button');
        manageKeyButton.className = 'mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm';
        manageKeyButton.innerHTML = '<i class="fas fa-key mr-2"></i>Manage API Key';
        manageKeyButton.onclick = function () {
            if (confirm('Would you like to update your IUCN API key?')) {
                window.iucnAPI.clearApiKey();
                window.iucnAPI.promptForApiKey();
            }
        };

        const cardBody = iucnCard.querySelector('.grid');
        if (cardBody) {
            cardBody.appendChild(manageKeyButton);
        }
    }
});

// Garantir que a instância global seja criada
if (typeof window !== 'undefined') {
    window.iucnAPI = new IucnAPI();
    console.log('🔴 IUCN API loaded and instance created successfully');
    window.IucnAPI = IucnAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = IucnAPI;
    }
}
