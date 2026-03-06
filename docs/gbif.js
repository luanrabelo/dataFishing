/**
 * GBIF (Global Biodiversity Information Facility) API Integration
 */

class GbifAPI {
    constructor() {
        this.baseURL = 'https://api.gbif.org/v1/species';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('🌍 GBIF API instance created');
    }

    async searchSpecies(speciesName) {
        const url = `${this.baseURL}?name=${encodeURIComponent(speciesName)}`;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                console.log(`🌍 GBIF - ${speciesName} Attempting request (attempt ${attempt + 1}/${this.maxRetries})...`);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data && data.results && data.results.length > 0) {
                        // Procurar primeiro um registro aceito
                        let acceptedRecord = data.results.find(record => record.taxonomicStatus === 'ACCEPTED');

                        // Se não encontrar aceito, usar o primeiro registro
                        const record = acceptedRecord || data.results[0];

                        const result = {
                            speciesName: speciesName,
                            key: record.key || '-',
                            kingdom: record.kingdom || '-',
                            phylum: record.phylum || '-',
                            class: record.class || '-',
                            order: record.order || '-',
                            family: record.family || '-',
                            genus: record.genus || speciesName.split(' ')[0],
                            species: record.species || speciesName,
                            scientificName: record.scientificName || '-',
                            canonicalName: record.canonicalName || '-',
                            authorship: record.authorship || '-',
                            taxonomicStatus: record.taxonomicStatus || '-',
                            taxonRank: record.rank || '-',
                            synonym: record.synonym || false,
                            confidence: record.confidence || '-',
                            matchType: record.matchType || '-'
                        };

                        console.log(`🌍 GBIF - ${speciesName} Successfully found: Key=${result.key}, Status=${result.taxonomicStatus}, Family=${result.family}`);
                        return result;
                    } else {
                        console.warn(`🌍 GBIF - ${speciesName} No results found`);
                        return this.createNotFoundResult(speciesName);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`🌍 GBIF - ${speciesName} Request failed: ${error.message}. Retrying in ${this.retryDelay}ms... (Attempt ${attempt + 1}/${this.maxRetries})`);
                    await this.delay(this.retryDelay);
                } else {
                    console.error(`🌍 GBIF - ${speciesName} All attempts failed: ${error.message}`);
                    return this.createErrorResult(speciesName, error.message);
                }
            }
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            key: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName,
            scientificName: '-',
            canonicalName: '-',
            authorship: '-',
            taxonomicStatus: 'Not Found',
            taxonRank: '-',
            synonym: false,
            confidence: '-',
            matchType: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        return {
            speciesName: speciesName,
            key: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName,
            scientificName: '-',
            canonicalName: '-',
            authorship: '-',
            taxonomicStatus: 'Error',
            taxonRank: '-',
            synonym: false,
            confidence: '-',
            matchType: errorMessage
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;

        console.log(`🌍 GBIF - Starting search for ${total} species...`);
        console.log(`🌍 GBIF - Note: GBIF API allows direct access without CORS restrictions`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`🌍 GBIF - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species);
                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }

                // Rate limiting respeitoso
                if (i < speciesList.length - 1) {
                    await this.delay(1000); // 1 segundo entre requests
                }

            } catch (error) {
                console.error(`🌍 GBIF - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
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

async function getGBIF(apiKey = 'gbif') {
    console.log(`getGBIF called with apiKey: ${apiKey}`);

    // Verificar se o gbifAPI está disponível
    if (typeof window.gbifAPI === 'undefined' || !window.gbifAPI) {
        console.error('❌ gbifAPI is not available. Attempting to initialize...');

        if (typeof GbifAPI !== 'undefined') {
            window.gbifAPI = new GbifAPI();
            console.log('✅ gbifAPI initialized successfully');
        } else {
            console.error('❌ GbifAPI class not found. Please check if gbif.js is loaded.');
            alert('Erro: API do GBIF não está carregada. Por favor, recarregue a página e tente novamente.');
            return;
        }
    }

    const statusColor = {
        'ACCEPTED': '#BACD92',
        'SYNONYM': '#FFE066',
        'DOUBTFUL': '#FFE066',
        'Not Found': '#D1D1C7',
        'Error': '#FA7070'
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

    console.log(`🌍 GBIF - Starting search for ${speciesNames.length} species...`);

    // Verificar quais campos opcionais estão selecionados
    const gbifBasionymOpt = document.getElementById('basionymopt')?.checked ?? true;
    const gbifVernacularOpt = document.getElementById('vernacular_nameopt')?.checked ?? true;
    const gbifTaxonomicStatusOpt = document.getElementById('taxonomic_statusopt')?.checked ?? true;

    // Criar tabela do GBIF similar às outras APIs
    const _gbifTable = document.createElement('table');
    _gbifTable.id = 'GbifTable';
    _gbifTable.classList.add(
        "text-base",
        "text-blue-800",
        "table-auto",
        "border-collapse",
        "w-full"
    );

    let headerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true" style="position: sticky; z-index: 20;">
        <tr>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 0)">
                Key <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 1)">
                Kingdom <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 2)">
                Phylum <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 3)">
                Class <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 4)">
                Order <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 5)">
                Family <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 6)">
                Genus <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 7)">
                Species Name <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 8)">
                Scientific Name <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 9)">
                Canonical Name <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 10)">
                Authorship <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', 11)">
                Taxonomic Status <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _gbifTable.innerHTML = headerHTML;

    const _gbifTableBody = _gbifTable.createTBody();
    _gbifTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _gbifTableWrapper = document.createElement('div');
    _gbifTableWrapper.classList.add("w-full", "table-wrapper");
    _gbifTableWrapper.appendChild(_gbifTable);

    const gbifResults = document.getElementById('tabPanel-gbif');
    gbifResults.appendChild(_gbifTableWrapper);

    try {
        console.log('🌍 Using gbifAPI.searchBatch...');

        const results = await window.gbifAPI.searchBatch(
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
                console.log(`🌍 GBIF - Completed ${current}/${total}: ${result.speciesName} (${result.taxonomicStatus})`);
            }
        );

        console.log(`🌍 GBIF search completed. Processing ${results.length} results...`);

        // Contar resultados com sucesso e erros
        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _gbifTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );

            let cellIndex = 0;

            // Key
            const keyCell = row.insertCell(cellIndex++);
            keyCell.innerHTML = result.key;
            keyCell.className = "py-5 px-5";

            // Kingdom
            const kingdomCell = row.insertCell(cellIndex++);
            kingdomCell.innerHTML = result.kingdom;
            kingdomCell.className = "py-5 px-5";

            // Phylum
            const phylumCell = row.insertCell(cellIndex++);
            phylumCell.innerHTML = result.phylum;
            phylumCell.className = "py-5 px-5";

            // Class
            const classCell = row.insertCell(cellIndex++);
            classCell.innerHTML = result.class;
            classCell.className = "py-5 px-5";

            // Order
            const orderCell = row.insertCell(cellIndex++);
            orderCell.innerHTML = result.order;
            orderCell.className = "py-5 px-5";

            // Family
            const familyCell = row.insertCell(cellIndex++);
            familyCell.innerHTML = result.family;
            familyCell.className = "py-5 px-5";

            // Genus
            const genusCell = row.insertCell(cellIndex++);
            genusCell.innerHTML = `<i>${result.genus}</i>`;
            genusCell.className = "py-5 px-5";

            // Species Name
            const speciesCell = row.insertCell(cellIndex++);
            speciesCell.innerHTML = `<i>${result.speciesName}</i>`;
            speciesCell.className = "py-5 px-5";

            // Scientific Name
            const sciNameCell = row.insertCell(cellIndex++);
            sciNameCell.innerHTML = `<i>${result.scientificName}</i>`;
            sciNameCell.className = "py-5 px-5";

            // Canonical Name
            const canonicalCell = row.insertCell(cellIndex++);
            canonicalCell.innerHTML = `<i>${result.canonicalName}</i>`;
            canonicalCell.className = "py-5 px-5";

            // Authorship
            const authorshipCell = row.insertCell(cellIndex++);
            authorshipCell.innerHTML = result.authorship;
            authorshipCell.className = "py-5 px-5";

            // Taxonomic Status
            const statusCell = row.insertCell(cellIndex++);
            const statusColor = result.taxonomicStatus === 'ACCEPTED' ? '#BACD92' :
                result.taxonomicStatus === 'SYNONYM' ? '#FFE066' :
                    result.taxonomicStatus === 'DOUBTFUL' ? '#FFE066' :
                        result.taxonomicStatus === 'Error' ? '#FA7070' : '#D1D1C7';
            statusCell.innerHTML = result.taxonomicStatus;
            statusCell.className = "py-5 px-5 font-bold";
            statusCell.style.backgroundColor = statusColor;

            // Link
            const linkCell = row.insertCell(cellIndex++);
            if (result.key !== '-') {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md" 
                       href="https://www.gbif.org/species/${result.key}" 
                       target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                        View
                    </a>
                `;
            } else {
                linkCell.innerHTML = '-';
            }
            linkCell.className = "py-5 px-5";

            // Contar status para estatísticas
            if (result.taxonomicStatus === 'ACCEPTED' || result.taxonomicStatus === 'SYNONYM') {
                successCount++;
            } else if (result.taxonomicStatus === 'Error') {
                errorCount++;
            }
        }

        // Mostrar aviso de sucesso
        if (successCount > 0) {
            const successNotice = document.createElement('div');
            successNotice.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            successNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-check-circle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-base font-semibold text-black mb-1">
                            <strong>Success:</strong> Successfully accessed Global Biodiversity Information Facility database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            gbifResults.insertBefore(successNotice, _gbifTableWrapper);
        } else if (errorCount > 0) {
            const errorNotice = document.createElement('div');
            errorNotice.className = 'bg-red-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            errorNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-exclamation-triangle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-base font-semibold text-black mb-1">
                            <strong>Notice:</strong> ${errorCount} of ${results.length} requests had issues.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                    </div>
                </div>
            `;
            gbifResults.insertBefore(errorNotice, _gbifTableWrapper);
        }

        // Adicionar controles similares às outras APIs
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="gbif-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in Global Biodiversity Information Facility Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="gbif-table-search" 
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="gbif-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="gbif-column-filters" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="gbif-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="gbif-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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
        gbifResults.insertBefore(controlsContainer, _gbifTableWrapper);

        // Configurar funcionalidades dos controles
        createColumnFilters('GbifTable', 'gbif-column-filters');

        const searchInput = document.getElementById('gbif-table-search');
        const clearButton = document.getElementById('gbif-search-clear');
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
                filterAndHighlightTable('GbifTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('GbifTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('GbifTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('gbif-export-excel').addEventListener('click', function () {
            exportTableToExcel('GbifTable');
        });

        document.getElementById('gbif-export-tsv').addEventListener('click', function () {
            exportTableToTSV('GbifTable');
        });

        updateDataResults();

        console.log(`🌍 GBIF search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('❌ Error during GBIF search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Garantir que a instância global seja criada
if (typeof window !== 'undefined') {
    window.gbifAPI = new GbifAPI();
    console.log('🌍 GBIF API loaded and instance created successfully');
    window.GbifAPI = GbifAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GbifAPI;
    }
}
