/**
 * Eschmeyer's Catalog of Fishes API Integration
 */

class EschmeyerAPI {
    constructor() {
        this.baseURL = 'https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('🐟 EschmeyerAPI instance created');
    }

    parseResultText(text) {
        text = text.replace(/\s+/g, ' ').trim();
        
        const data = {
            originalEpithet: '-',
            originalGenus: '-',
            originalAuthorYear: '-',
            status: '-',
            acceptedName: '-',
            acceptedAuthorYear: '-',
            family: '-',
            subfamily: '-',
            typeLocality: '-',
            typeSpecimens: '-',
            habitat: '-',
            rawText: text
        };

        try {
            const originalMatch = text.match(/^([^,]+),\s+([A-Z][a-z]+(?:\s*\(.+?\))?)\s+(.*?)\s+(\d{4}):\d+/);
            if (originalMatch) {
                data.originalEpithet = originalMatch[1].trim();
                data.originalGenus = originalMatch[2].trim();
                data.originalAuthorYear = `${originalMatch[3].trim()} ${originalMatch[4].trim()}`;
            }

            const statusMatch = text.match(/Current status:\s*(.*?)\./);
            if (statusMatch) {
                const statusFull = statusMatch[1].trim();
                
                if (statusFull.includes('Synonym of')) {
                    data.status = 'Synonym';
                    const acceptedMatch = statusFull.match(/Synonym of\s+([A-Z][a-z]+\s+[a-z]+)\s+(\(.*?\d{4}\))/);
                    if (acceptedMatch) {
                        data.acceptedName = acceptedMatch[1].trim();
                        data.acceptedAuthorYear = acceptedMatch[2].trim();
                    }
                } else if (statusFull.includes('Valid as')) {
                    data.status = 'Valid';
                    const validMatch = statusFull.match(/Valid as\s+([A-Z][a-z]+\s+[a-z]+)\s+(\(.*?\d{4}\))/);
                    if (validMatch) {
                        data.acceptedName = validMatch[1].trim();
                        data.acceptedAuthorYear = validMatch[2].trim();
                    }
                } else {
                    data.status = 'Uncertain';
                }
            }

            const familyMatch = text.match(/([A-Z][a-z]+idae)(?::\s*([A-Z][a-z]+inae))?\./);
            if (familyMatch) {
                data.family = familyMatch[1];
                if (familyMatch[2]) {
                    data.subfamily = familyMatch[2];
                }
            }

            const habitatMatch = text.match(/Habitat:\s*(.*?)\./);
            if (habitatMatch) {
                data.habitat = habitatMatch[1].trim();
            }

            const tempText = text.replace(/^.*?ref\. \d+\]/, '');
            const localityMatch = tempText.match(/\]?\s*(.*?)\.\s*(Syntypes:|Holotype:|Lectotype:|Neotype:|Type catalog:|Based on)/);
            if (localityMatch) {
                const locality = localityMatch[1].trim();
                if (locality && !locality.startsWith('•') && !locality.includes('[')) {
                    data.typeLocality = locality;
                }
            }

            const typeMatch = text.match(/(Syntypes:|Holotype:|Lectotype:|Neotype:)\s*(.*?)\./);
            if (typeMatch) {
                data.typeSpecimens = typeMatch[2].trim();
            }

        } catch (error) {
            console.error('Error parsing Eschmeyer result text:', error);
        }

        return data;
    }

    async searchSpecies(speciesName) {
        const parts = speciesName.split(' ');
        if (parts.length < 2) {
            throw new Error('Invalid species name format. Must contain genus and species.');
        }

        const genus = parts[0];
        const species = parts[1];

        // URL da API do Eschmeyer
        const targetUrl = `${this.baseURL}?tbl=species&genus=${encodeURIComponent(genus)}&species=${encodeURIComponent(species)}`;

        // Lista de proxies CORS que funcionam com o Eschmeyer
        const proxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?',
            'https://cors-proxy.fringe.zone/',
            'https://proxy.cors.sh/'
        ];

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            // Primeiro, tentar requisição direta (pode funcionar em alguns casos)
            if (attempt === 0) {
                try {
                    console.log(`🐟 Eschmeyer - ${speciesName} Trying direct request (attempt ${attempt + 1}/${this.maxRetries})...`);
                    
                    const response = await fetch(targetUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (response.ok) {
                        const htmlContent = await response.text();
                        return this.parseHTML(htmlContent, speciesName);
                    }
                } catch (error) {
                    console.warn(`🐟 Eschmeyer - ${speciesName} Direct request failed:`, error.message);
                }
            }

            // Tentar com proxies CORS
            for (const proxy of proxies) {
                try {
                    console.log(`🐟 Eschmeyer - ${speciesName} Trying proxy: ${proxy.includes('allorigins') ? 'AllOrigins' : proxy.includes('corsproxy') ? 'CORSProxy' : proxy.includes('fringe') ? 'Fringe' : 'CORS.sh'} (attempt ${attempt + 1}/${this.maxRetries})...`);
                    
                    let proxyUrl;
                    let fetchOptions = {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                        }
                    };

                    if (proxy.includes('allorigins')) {
                        // AllOrigins retorna JSON com a propriedade 'contents'
                        proxyUrl = proxy + encodeURIComponent(targetUrl);
                    } else {
                        // Outros proxies retornam HTML diretamente
                        proxyUrl = proxy + encodeURIComponent(targetUrl);
                    }

                    const response = await fetch(proxyUrl, fetchOptions);

                    if (response.ok) {
                        let htmlContent;
                        
                        if (proxy.includes('allorigins')) {
                            // Para AllOrigins, extrair conteúdo do JSON
                            const jsonResponse = await response.json();
                            htmlContent = jsonResponse.contents;
                        } else {
                            // Para outros proxies, usar texto diretamente
                            htmlContent = await response.text();
                        }

                        if (htmlContent && htmlContent.length > 100) {
                            console.log(`🐟 Eschmeyer - ${speciesName} Successfully retrieved data via proxy`);
                            return this.parseHTML(htmlContent, speciesName);
                        }
                    }
                } catch (proxyError) {
                    console.warn(`🐟 Eschmeyer - ${speciesName} Proxy failed:`, proxyError.message);
                    continue;
                }
            }

            if (attempt < this.maxRetries - 1) {
                console.warn(`🐟 Eschmeyer - ${speciesName} All methods failed, retrying in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
            }
        }

        // Se todas as tentativas falharam
        console.error(`🐟 Eschmeyer - ${speciesName} All attempts failed after ${this.maxRetries} retries`);
        return {
            speciesName: speciesName,
            status: 'Error',
            acceptedName: '-',
            acceptedAuthorYear: '-',
            originalGenus: '-',
            originalEpithet: '-',
            originalAuthorYear: '-',
            family: '-',
            subfamily: '-',
            habitat: '-',
            typeLocality: '-',
            typeSpecimens: '-',
            synonymsCount: '0',
            rawText: 'Unable to access Eschmeyer database - CORS restrictions'
        };
    }

    parseHTML(htmlContent, speciesName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const resultElements = doc.querySelectorAll('p.result');

        if (resultElements.length === 0) {
            return {
                speciesName: speciesName,
                status: 'Not Found',
                acceptedName: '-',
                acceptedAuthorYear: '-',
                originalGenus: '-',
                originalEpithet: '-',
                originalAuthorYear: '-',
                family: '-',
                subfamily: '-',
                habitat: '-',
                typeLocality: '-',
                typeSpecimens: '-',
                synonymsCount: '0',
                rawText: 'No results found'
            };
        }

        const allResults = [];
        let validEntry = null;
        let synonymsCount = 0;

        for (const element of resultElements) {
            const textContent = element.textContent || element.innerText;
            const parsedData = this.parseResultText(textContent);
            allResults.push(parsedData);

            if (parsedData.status === 'Valid') {
                validEntry = parsedData;
            } else if (parsedData.status === 'Synonym') {
                synonymsCount++;
            }
        }

        if (!validEntry && allResults.length > 0) {
            validEntry = allResults[0];
            synonymsCount = allResults.length - 1;
        }

        if (validEntry) {
            return {
                speciesName: speciesName,
                status: validEntry.status,
                acceptedName: validEntry.acceptedName || '-',
                acceptedAuthorYear: validEntry.acceptedAuthorYear || '-',
                originalGenus: validEntry.originalGenus || '-',
                originalEpithet: validEntry.originalEpithet || '-',
                originalAuthorYear: validEntry.originalAuthorYear || '-',
                family: validEntry.family || '-',
                subfamily: validEntry.subfamily || '-',
                habitat: validEntry.habitat || '-',
                typeLocality: validEntry.typeLocality || '-',
                typeSpecimens: validEntry.typeSpecimens || '-',
                synonymsCount: synonymsCount.toString(),
                rawText: validEntry.rawText.substring(0, 200) + (validEntry.rawText.length > 200 ? '...' : '')
            };
        }

        return {
            speciesName: speciesName,
            status: 'Error',
            acceptedName: '-',
            acceptedAuthorYear: '-',
            originalGenus: '-',
            originalEpithet: '-',
            originalAuthorYear: '-',
            family: '-',
            subfamily: '-',
            habitat: '-',
            typeLocality: '-',
            typeSpecimens: '-',
            synonymsCount: '0',
            rawText: 'Error parsing results'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;

        console.log(`🐟 Eschmeyer - Starting search for ${total} species using CORS proxy`);
        console.log(`🐟 Eschmeyer - Note: Using proxy servers to bypass browser CORS restrictions`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];
            
            try {
                console.log(`🐟 Eschmeyer - Processing ${species} (${i + 1}/${total})...`);
                
                const result = await this.searchSpecies(species);
                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }

                // Rate limiting mais conservador devido ao uso de proxies
                if (i < speciesList.length - 1) {
                    await this.delay(2000); // 2 segundos entre requests
                }

            } catch (error) {
                console.error(`🐟 Eschmeyer - Error processing ${species}:`, error);
                
                results.push({
                    speciesName: species,
                    status: 'Error',
                    acceptedName: '-',
                    acceptedAuthorYear: '-',
                    originalGenus: '-',
                    originalEpithet: '-',
                    originalAuthorYear: '-',
                    family: '-',
                    subfamily: '-',
                    habitat: '-',
                    typeLocality: '-',
                    typeSpecimens: '-',
                    synonymsCount: '0',
                    rawText: `Error: ${error.message}`
                });

                if (onSpeciesComplete) {
                    onSpeciesComplete(results[results.length - 1], i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }
            }
        }

        return results;
    }
}

// Garantir que a instância global seja criada imediatamente
if (typeof window !== 'undefined') {
    // Criar instância global imediatamente
    window.eschmeyerAPI = new EschmeyerAPI();
    console.log('🐟 Eschmeyer API loaded and instance created successfully');
    
    // Também disponibilizar a classe globalmente para compatibilidade
    window.EschmeyerAPI = EschmeyerAPI;
} else {
    // Para ambientes não-browser (Node.js)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = EschmeyerAPI;
    }
}

/**
 * Exibe os resultados da busca do Eschmeyer em uma tabela e mostra um aviso de status.
 * @param {Array} results - A lista de resultados da API.
 */
function displayEschmeyerResults(results) {
    const eschmeyerResults = document.getElementById('eschmeyer-results');
    const _eschmeyerTableWrapper = document.getElementById('eschmeyer-table-wrapper');
    const eschmeyerTableBody = document.getElementById('eschmeyer-table-body');

    // Limpa resultados anteriores
    eschmeyerTableBody.innerHTML = '';
    const existingNotice = eschmeyerResults.querySelector('.bg-gray-200, .bg-red-200');
    if (existingNotice) {
        existingNotice.remove();
    }

    if (!results || results.length === 0) {
        _eschmeyerTableWrapper.classList.add('hidden');
        return;
    }

    let successCount = 0;
    results.forEach(result => {
        if (result.status !== 'Error' && result.status !== 'Not Found') {
            successCount++;
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border px-4 py-2">${result.speciesName}</td>
            <td class="border px-4 py-2">${result.status}</td>
            <td class="border px-4 py-2">${result.acceptedName}</td>
            <td class="border px-4 py-2">${result.family}</td>
            <td class="border px-4 py-2">${result.habitat}</td>
        `;
        eschmeyerTableBody.appendChild(row);
    });

    _eschmeyerTableWrapper.classList.remove('hidden');

    // Adiciona o aviso padronizado
    displayEschmeyerNotice(results, successCount, eschmeyerResults, _eschmeyerTableWrapper);
}

/**
 * Cria e exibe um aviso de sucesso ou erro com base nos resultados da busca.
 * @param {Array} results - A lista completa de resultados.
 * @param {number} successCount - O número de buscas bem-sucedidas.
 * @param {HTMLElement} container - O elemento onde o aviso será inserido.
 * @param {HTMLElement} tableWrapper - O elemento da tabela para posicionar o aviso.
 */
function displayEschmeyerNotice(results, successCount, container, tableWrapper) {
    const errorCount = results.length - successCount;

    if (successCount > 0) {
        const successNotice = document.createElement('div');
        successNotice.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
        successNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-check-circle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-lg font-semibold text-black mb-1">
                            <strong>Success:</strong> Successfully accessed Eschmeyer's Catalog of Fishes.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
        container.insertBefore(successNotice, tableWrapper);
    } else if (errorCount > 0) {
        const errorNotice = document.createElement('div');
        errorNotice.className = 'bg-red-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
        errorNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-exclamation-triangle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-lg font-semibold text-black mb-1">
                            <strong>Notice:</strong> ${errorCount} of ${results.length} requests had issues. 
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                    </div>
                </div>
            `;
        container.insertBefore(errorNotice, tableWrapper);
    }
}

/**
 * Lida com o processo de busca no Eschmeyer.
 */
async function handleEschmeyerSearch() {
    const speciesInput = document.getElementById('species-input').value.trim();
    if (!speciesInput) {
        alert('Please enter at least one species name.');
        return;
    }
    const speciesList = speciesInput.split('\n').map(s => s.trim()).filter(s => s);

    const searchButton = document.getElementById('search-eschmeyer-btn');
    const progressBar = document.getElementById('eschmeyer-progress-bar');
    const progressContainer = document.getElementById('eschmeyer-progress-container');

    searchButton.disabled = true;
    searchButton.classList.add('opacity-50');
    progressContainer.classList.remove('hidden');
    progressBar.style.width = '0%';

    const results = await window.eschmeyerAPI.searchBatch(speciesList, (current, total) => {
        const percentage = (current / total) * 100;
        progressBar.style.width = `${percentage}%`;
    });

    displayEschmeyerResults(results);

    searchButton.disabled = false;
    searchButton.classList.remove('opacity-50');
    progressContainer.classList.add('hidden');
}


async function getEschmeyer() {
    console.log('getEschmeyer called');
    
    // Verificar se o eschmeyerAPI está disponível
    if (typeof window.eschmeyerAPI === 'undefined' || !window.eschmeyerAPI) {
        console.error('❌ eschmeyerAPI is not available. Attempting to initialize...');
        
        if (typeof EschmeyerAPI !== 'undefined') {
            window.eschmeyerAPI = new EschmeyerAPI();
            console.log('✅ eschmeyerAPI initialized successfully');
        } else {
            console.error('❌ EschmeyerAPI class not found. Please check if eschmeyer.js is loaded.');
            alert('Erro: API do Eschmeyer não está carregada. Por favor, recarregue a página e tente novamente.');
            return;
        }
    }

    const statusColor = {
        'Valid': '#BACD92',
        'Synonym': '#FFE066',
        'Error': '#FA7070',
        'Not Found': '#D1D1C7'
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

    console.log(`🐟 Starting Eschmeyer search for ${speciesNames.length} species...`);
    console.log(`🐟 Note: Using CORS proxy servers to access Eschmeyer database from browser`);

    // Verificar quais campos opcionais estão selecionados
    const eschmeyerStatusOpt = document.getElementById('statusopt')?.checked ?? true;
    const eschmeyerAcceptedNameOpt = document.getElementById('accepted_nameopt')?.checked ?? true;
    const eschmeyerFamilyOpt = document.getElementById('familyopt')?.checked ?? true;
    const eschmeyerSynonymsOpt = document.getElementById('synonymsopt')?.checked ?? true;

    const _eschmeyerTable = document.createElement('table');
    _eschmeyerTable.id = 'TableResults';
    _eschmeyerTable.classList.add(
        "text-base",
        "text-blue-800",
        "table-auto",
        "border-collapse",
        "w-full"
    );

    let headerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap">
        <tr>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 0)">
                Species Name <i class="fas fa-sort ml-2"></i>
            </th>
            ${eschmeyerStatusOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${1})">Status <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${eschmeyerAcceptedNameOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${1 + (eschmeyerStatusOpt ? 1 : 0)})">Accepted Name <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${1 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0)})">
                Authority <i class="fas fa-sort ml-2"></i>
            </th>
            ${eschmeyerFamilyOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${2 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0)})">Family <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${2 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0) + (eschmeyerFamilyOpt ? 1 : 0)})">
                Habitat <i class="fas fa-sort ml-2"></i>
            </th>
            ${eschmeyerSynonymsOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${3 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0) + (eschmeyerFamilyOpt ? 1 : 0)})">Synonyms Count <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _eschmeyerTable.innerHTML = headerHTML;

    const _eschmeyerTableBody = _eschmeyerTable.createTBody();
    _eschmeyerTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _eschmeyerTableWrapper = document.createElement('div');
    _eschmeyerTableWrapper.classList.add(
        "w-full",
        "overflow-x-auto",
        "overflow-y-auto",
        "mx-auto"
    );
    _eschmeyerTableWrapper.appendChild(_eschmeyerTable);

    const eschmeyerResults = document.getElementById('Results');
    eschmeyerResults.innerHTML = '';
    eschmeyerResults.appendChild(_eschmeyerTableWrapper);

    try {
        console.log('🐟 Using eschmeyerAPI.searchBatch...');
        
        const results = await window.eschmeyerAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
            },
            (result, current, total) => {
                console.log(`🐟 Eschmeyer - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
            }
        );

        console.log(`🐟 Eschmeyer search completed. Processing ${results.length} results...`);

        // Contar resultados com sucesso e erros
        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _eschmeyerTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );
            
            let cellIndex = 0;

            // Species Name
            const speciesCell = row.insertCell(cellIndex++);
            speciesCell.innerHTML = `<i>${result.speciesName}</i>`;
            speciesCell.className = "py-5 px-5";

            // Status (if enabled)
            if (eschmeyerStatusOpt) {
                const statusCell = row.insertCell(cellIndex++);
                const statusColor = result.status === 'Valid' ? '#BACD92' : 
                                   result.status === 'Synonym' ? '#FFE066' : 
                                   result.status === 'Error' ? '#FA7070' : '#D1D1C7';
                statusCell.innerHTML = result.status;
                statusCell.className = "py-5 px-5 font-bold";
                statusCell.style.backgroundColor = statusColor;
            }

            // Accepted Name (if enabled)
            if (eschmeyerAcceptedNameOpt) {
                const acceptedNameCell = row.insertCell(cellIndex++);
                acceptedNameCell.innerHTML = `<i>${result.acceptedName}</i>`;
                acceptedNameCell.className = "py-5 px-5";
            }

            // Authority
            const authorityCell = row.insertCell(cellIndex++);
            authorityCell.innerHTML = result.acceptedAuthorYear;
            authorityCell.className = "py-5 px-5";

            // Family (if enabled)
            if (eschmeyerFamilyOpt) {
                const familyCell = row.insertCell(cellIndex++);
                familyCell.innerHTML = result.family;
                familyCell.className = "py-5 px-5";
            }

            // Habitat
            const habitatCell = row.insertCell(cellIndex++);
            habitatCell.innerHTML = result.habitat;
            habitatCell.className = "py-5 px-5";

            // Synonyms Count (if enabled)
            if (eschmeyerSynonymsOpt) {
                const synonymsCell = row.insertCell(cellIndex++);
                synonymsCell.innerHTML = result.synonymsCount;
                synonymsCell.className = "py-5 px-5 text-center";
            }

            // Link
            const linkCell = row.insertCell(cellIndex++);
            linkCell.innerHTML = `
                <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md" 
                   href="https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?tbl=species&genus=${encodeURIComponent(result.speciesName.split(' ')[0])}&species=${encodeURIComponent(result.speciesName.split(' ')[1])}" 
                   target="_blank">
                    <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                    View
                </a>
            `;
            linkCell.className = "py-5 px-5";

            // Contar status para estatísticas
            if (result.status === 'Valid' || result.status === 'Synonym') {
                successCount++;
            } else if (result.status === 'Error') {
                errorCount++;
            }
        }

        // Mostrar aviso sobre o uso de proxy se houve erros
        if (errorCount > 0) {
            const corsNotice = document.createElement('div');
            corsNotice.className = 'bg-red-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            corsNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-check-circle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-sm">
                            <strong>Browser Notice:</strong> ${errorCount} of ${results.length} requests failed. 
                            The Eschmeyer database requires special CORS proxy servers for browser access.
                        </p>
                        <p class="text-lg font-semibold text-black mb-1">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            <i class="fas fa-lightbulb"></i> 
                            <strong>Tip:</strong> For better reliability with large datasets, consider using the Python version of dataFishing.
                        </p>
                    </div>
                </div>
            `;
            eschmeyerResults.insertBefore(corsNotice, _eschmeyerTableWrapper);
        } else if (successCount > 0) {
            // Mostrar notice de sucesso
            const successNotice = document.createElement('div');
            successNotice.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            successNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-check-circle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-lg font-semibold text-black mb-1">
                            <strong>Success:</strong> Successfully accessed Eschmeyer database using CORS proxy servers.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            eschmeyerResults.insertBefore(successNotice, _eschmeyerTableWrapper);
        }

        // Adicionar controles de filtro, busca e exportação ANTES da tabela
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="eschmeyer-table-search" class="text-lg font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in Eschmeyer Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="eschmeyer-table-search" 
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="eschmeyer-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <h4 class="text-lg font-semibold text-gray-800 mb-3">
                    <i class="fas fa-columns mr-2"></i>Toggle Column Visibility
                </h4>
                <div id="eschmeyer-column-filters" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="eschmeyer-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="eschmeyer-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>
                        Export to TSV
                    </button>
                </div>
                <p class="text-sm text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results.
                </p>
            </div>
        `;

        // Inserir controles ANTES da tabela
        eschmeyerResults.insertBefore(controlsContainer, _eschmeyerTableWrapper);

        // Configurar funcionalidades dos controles

        // 1. Criar filtros de coluna
        createColumnFilters('TableResults', 'eschmeyer-column-filters');

        // 2. Configurar busca na tabela
        const searchInput = document.getElementById('eschmeyer-table-search');
        const clearButton = document.getElementById('eschmeyer-search-clear');
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
                filterAndHighlightTable('TableResults', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('TableResults', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('TableResults', '');
                updateSearchResultsCounter('', 0);
            }
        });

        // 3. Configurar botões de exportação
        document.getElementById('eschmeyer-export-excel').addEventListener('click', function() {
            exportTableToExcel('TableResults');
        });

        document.getElementById('eschmeyer-export-tsv').addEventListener('click', function() {
            exportTableToTSV('TableResults');
        });

        setTimeout(() => {
            progressModal.classList.add('hidden');
        }, 1000);

        updateDataResults();

        console.log(`🐟 Eschmeyer search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('❌ Error during Eschmeyer search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}