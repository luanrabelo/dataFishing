// WoRMS - World Register of Marine Species Functions

// This function fetches data from WoRMS for the given species
async function getWoRMS() {
    console.log('getWoRMS called');
    
    // Verificar se o wormsAPI está disponível
    if (typeof window.wormsAPI === 'undefined' || !window.wormsAPI) {
        console.error('❌ wormsAPI is not available. Attempting to initialize...');
        
        if (typeof WormsAPI !== 'undefined') {
            window.wormsAPI = new WormsAPI();
            console.log('✅ wormsAPI initialized successfully');
        } else {
            console.error('❌ WormsAPI class not found. Please check if worms.js is loaded.');
            alert('Erro: API do WoRMS não está carregada. Por favor, recarregue a página e tente novamente.');
            return;
        }
    }

    const statusColor = {
        'accepted': '#BACD92',
        'unaccepted': '#FA7070',
        'synonym': '#FFE066',
        'uncertain': '#D1D1C7',
        'Not Found': '#D1D1C7',
        'Error': '#FA7070'
    };

    const environmentColors = {
        'Yes': '#5FC65A',
        'No': '#FA7070',
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

    console.log(`🌊 WoRMS - Starting search for ${speciesNames.length} species...`);

    // Verificar quais campos opcionais estão selecionados
    const wormsAuthorityOpt = document.getElementById('authorityopt')?.checked ?? true;
    const wormsValidSpeciesOpt = document.getElementById('valid_species_nameopt')?.checked ?? true;
    const wormsValidAuthorityOpt = document.getElementById('valid_authorityopt')?.checked ?? true;
    const wormsMarineOpt = document.getElementById('marine_environmentopt')?.checked ?? true;
    const wormsBrackishOpt = document.getElementById('brackish_environmentopt')?.checked ?? true;
    const wormsFreshwaterOpt = document.getElementById('freshwater_environmentopt')?.checked ?? true;
    const wormsTerrestrialOpt = document.getElementById('terrestrial_environmentopt')?.checked ?? true;
    const wormsExtinctOpt = document.getElementById('extinct_statusopt')?.checked ?? true;
    const wormsMatchTypeOpt = document.getElementById('match_typeopt')?.checked ?? true;
    const wormsModifiedOpt = document.getElementById('modified_dateopt')?.checked ?? true;
    const wormsCitationOpt = document.getElementById('citationopt')?.checked ?? true;

    // Criar tabela do WoRMS similar ao Eschmeyer
    const _wormsTable = document.createElement('table');
    _wormsTable.id = 'TableResults';
    _wormsTable.classList.add(
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
                AphiaID <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 1)">
                Kingdom <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 2)">
                Phylum <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 3)">
                Class <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 4)">
                Order <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 5)">
                Family <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 6)">
                Genus <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 7)">
                Species Name <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 8)">
                Authority <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 9)">
                Valid Species Name <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 10)">
                Valid Authority <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 11)">
                Status <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 12)">
                Marine <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 13)">
                Brackish <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 14)">
                Freshwater <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 15)">
                Terrestrial <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 16)">
                Extinct <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 17)">
                Match Type <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 18)">
                Modified <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _wormsTable.innerHTML = headerHTML;

    const _wormsTableBody = _wormsTable.createTBody();
    _wormsTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _wormsTableWrapper = document.createElement('div');
    _wormsTableWrapper.classList.add(
        "w-full",
        "overflow-x-auto",
        "overflow-y-auto",
        "mx-auto"
    );
    _wormsTableWrapper.appendChild(_wormsTable);

    const wormsResults = document.getElementById('Results');
    wormsResults.innerHTML = '';
    wormsResults.appendChild(_wormsTableWrapper);

    try {
        console.log('🌊 Using wormsAPI.searchBatch...');
        
        const results = await window.wormsAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
            },
            (result, current, total) => {
                console.log(`🌊 WoRMS - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
            }
        );

        console.log(`🌊 WoRMS search completed. Processing ${results.length} results...`);

        // Contar resultados com sucesso e erros
        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _wormsTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );
            
            let cellIndex = 0;

            // AphiaID
            const aphiaIdCell = row.insertCell(cellIndex++);
            aphiaIdCell.innerHTML = result.aphiaID || '-';
            aphiaIdCell.className = "py-5 px-5";

            // Kingdom
            const kingdomCell = row.insertCell(cellIndex++);
            kingdomCell.innerHTML = result.kingdom || '-';
            kingdomCell.className = "py-5 px-5";

            // Phylum
            const phylumCell = row.insertCell(cellIndex++);
            phylumCell.innerHTML = result.phylum || '-';
            phylumCell.className = "py-5 px-5";

            // Class
            const classCell = row.insertCell(cellIndex++);
            classCell.innerHTML = result.class || '-';
            classCell.className = "py-5 px-5";

            // Order
            const orderCell = row.insertCell(cellIndex++);
            orderCell.innerHTML = result.order || '-';
            orderCell.className = "py-5 px-5";

            // Family
            const familyCell = row.insertCell(cellIndex++);
            familyCell.innerHTML = result.family || '-';
            familyCell.className = "py-5 px-5";

            // Genus
            const genusCell = row.insertCell(cellIndex++);
            genusCell.innerHTML = `<i>${result.genus || '-'}</i>`;
            genusCell.className = "py-5 px-5";

            // Species Name
            const speciesCell = row.insertCell(cellIndex++);
            speciesCell.innerHTML = `<i>${result.speciesName}</i>`;
            speciesCell.className = "py-5 px-5";

            // Authority
            const authorityCell = row.insertCell(cellIndex++);
            authorityCell.innerHTML = result.authority || '-';
            authorityCell.className = "py-5 px-5";

            // Valid Species Name
            const validSpeciesCell = row.insertCell(cellIndex++);
            validSpeciesCell.innerHTML = `<i>${result.validName || '-'}</i>`;
            validSpeciesCell.className = "py-5 px-5";

            // Valid Authority
            const validAuthorityCell = row.insertCell(cellIndex++);
            validAuthorityCell.innerHTML = result.validAuthority || '-';
            validAuthorityCell.className = "py-5 px-5";

            // Status
            const statusCell = row.insertCell(cellIndex++);
            const statusColor = result.status === 'accepted' ? '#BACD92' : 
                               result.status === 'synonym' ? '#FFE066' : 
                               result.status === 'unaccepted' ? '#FA7070' : 
                               result.status === 'uncertain' ? '#D1D1C7' : '#D1D1C7';
            statusCell.innerHTML = result.status || '-';
            statusCell.className = "py-5 px-5 font-bold";
            statusCell.style.backgroundColor = statusColor;

            // Marine
            const marineCell = row.insertCell(cellIndex++);
            const marineValue = result.isMarine === '1' ? 'Yes' : result.isMarine === '0' ? 'No' : '-';
            const marineColor = marineValue === 'Yes' ? '#5FC65A' : marineValue === 'No' ? '#FA7070' : '#D1D1C7';
            marineCell.innerHTML = marineValue;
            marineCell.className = "py-5 px-5 font-bold text-center";
            marineCell.style.backgroundColor = marineColor;

            // Brackish
            const brackishCell = row.insertCell(cellIndex++);
            const brackishValue = result.isBrackish === '1' ? 'Yes' : result.isBrackish === '0' ? 'No' : '-';
            const brackishColor = brackishValue === 'Yes' ? '#5FC65A' : brackishValue === 'No' ? '#FA7070' : '#D1D1C7';
            brackishCell.innerHTML = brackishValue;
            brackishCell.className = "py-5 px-5 font-bold text-center";
            brackishCell.style.backgroundColor = brackishColor;

            // Freshwater
            const freshwaterCell = row.insertCell(cellIndex++);
            const freshwaterValue = result.isFreshwater === '1' ? 'Yes' : result.isFreshwater === '0' ? 'No' : '-';
            const freshwaterColor = freshwaterValue === 'Yes' ? '#5FC65A' : freshwaterValue === 'No' ? '#FA7070' : '#D1D1C7';
            freshwaterCell.innerHTML = freshwaterValue;
            freshwaterCell.className = "py-5 px-5 font-bold text-center";
            freshwaterCell.style.backgroundColor = freshwaterColor;

            // Terrestrial
            const terrestrialCell = row.insertCell(cellIndex++);
            const terrestrialValue = result.isTerrestrial === '1' ? 'Yes' : result.isTerrestrial === '0' ? 'No' : '-';
            const terrestrialColor = terrestrialValue === 'Yes' ? '#5FC65A' : terrestrialValue === 'No' ? '#FA7070' : '#D1D1C7';
            terrestrialCell.innerHTML = terrestrialValue;
            terrestrialCell.className = "py-5 px-5 font-bold text-center";
            terrestrialCell.style.backgroundColor = terrestrialColor;

            // Extinct
            const extinctCell = row.insertCell(cellIndex++);
            const extinctValue = result.isExtinct === '1' ? 'Yes' : result.isExtinct === '0' ? 'No' : '-';
            const extinctColor = extinctValue === 'Yes' ? '#FA7070' : extinctValue === 'No' ? '#5FC65A' : '#D1D1C7';
            extinctCell.innerHTML = extinctValue;
            extinctCell.className = "py-5 px-5 font-bold text-center";
            extinctCell.style.backgroundColor = extinctColor;

            // Match Type
            const matchTypeCell = row.insertCell(cellIndex++);
            matchTypeCell.innerHTML = result.matchType || '-';
            matchTypeCell.className = "py-5 px-5";

            // Modified
            const modifiedCell = row.insertCell(cellIndex++);
            modifiedCell.innerHTML = result.modified || '-';
            modifiedCell.className = "py-5 px-5";

            // Link
            const linkCell = row.insertCell(cellIndex++);
            if (result.aphiaID && result.aphiaID !== '-') {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md" 
                       href="https://www.marinespecies.org/aphia.php?p=taxdetails&id=${result.aphiaID}" 
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
            if (result.status === 'accepted' || result.status === 'synonym') {
                successCount++;
            } else if (result.status === 'Error') {
                errorCount++;
            }
        }

        // Mostrar aviso de sucesso (WoRMS geralmente não tem problemas de CORS)
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
                            <strong>Success:</strong> Successfully accessed World Register of Marine Species database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            wormsResults.insertBefore(successNotice, _wormsTableWrapper);
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
            wormsResults.insertBefore(errorNotice, _wormsTableWrapper);
        }

        // Adicionar controles similares ao Eschmeyer
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="worms-table-search" class="text-xl font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in World Register of Marine Species Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="worms-table-search" 
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="worms-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="worms-column-filters" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="worms-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="worms-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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
        wormsResults.insertBefore(controlsContainer, _wormsTableWrapper);

        // Configurar funcionalidades dos controles (similar ao Eschmeyer)
        createColumnFilters('TableResults', 'worms-column-filters');

        const searchInput = document.getElementById('worms-table-search');
        const clearButton = document.getElementById('worms-search-clear');
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

        document.getElementById('worms-export-excel').addEventListener('click', function() {
            exportTableToExcel('TableResults');
        });

        document.getElementById('worms-export-tsv').addEventListener('click', function() {
            exportTableToTSV('TableResults');
        });

        setTimeout(() => {
            progressModal.classList.add('hidden');
        }, 1000);

        updateDataResults();

        console.log(`🌊 WoRMS search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('❌ Error during WoRMS search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

/**
 * WoRMS (World Register of Marine Species) API Integration
 * Based on the Python implementation with emojis
 */

class WormsAPI {
    constructor() {
        this.baseURL = 'https://www.marinespecies.org/rest/AphiaRecordsByName';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('🌊 WoRMS API instance created');
    }

    async searchSpecies(speciesName) {
        const url = `${this.baseURL}/${encodeURIComponent(speciesName)}?like=false&marine_only=false`;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                console.log(`🌊 WoRMS - ${speciesName} Attempting direct request (attempt ${attempt + 1}/${this.maxRetries})...`);
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && data.length > 0) {
                        // Procurar primeiro um registro aceito
                        let acceptedRecord = data.find(record => record.status === 'accepted');
                        
                        // Se não encontrar aceito, usar o primeiro registro
                        const record = acceptedRecord || data[0];
                        
                        const result = {
                            speciesName: speciesName,
                            aphiaID: record.AphiaID || '-',
                            url: record.url || '-',
                            scientificName: record.scientificname || '-',
                            authority: record.authority || '-',
                            status: record.status || '-',
                            unacceptReason: record.unacceptreason || '-',
                            taxonRankID: record.taxonRankID || '-',
                            rank: record.rank || '-',
                            validAphiaID: record.valid_AphiaID || '-',
                            validName: record.valid_name || '-',
                            validAuthority: record.valid_authority || '-',
                            parentNameUsageID: record.parentNameUsageID || '-',
                            kingdom: record.kingdom || '-',
                            phylum: record.phylum || '-',
                            class: record.class || '-',
                            order: record.order || '-',
                            family: record.family || '-',
                            genus: record.genus || '-',
                            citation: record.citation || '-',
                            lsid: record.lsid || '-',
                            isMarine: record.isMarine !== null ? (record.isMarine ? 'Yes' : 'No') : '-',
                            isBrackish: record.isBrackish !== null ? (record.isBrackish ? 'Yes' : 'No') : '-',
                            isFreshwater: record.isFreshwater !== null ? (record.isFreshwater ? 'Yes' : 'No') : '-',
                            isTerrestrial: record.isTerrestrial !== null ? (record.isTerrestrial ? 'Yes' : 'No') : '-',
                            isExtinct: record.isExtinct !== null ? (record.isExtinct ? 'Yes' : 'No') : '-',
                            matchType: record.match_type || '-',
                            modified: record.modified || '-'
                        };

                        console.log(`🌊 WoRMS - ${speciesName} Successfully found: AphiaID=${result.aphiaID}, Status=${result.status}, Family=${result.family}`);
                        return result;
                    } else {
                        console.warn(`🌊 WoRMS - ${speciesName} No results found`);
                        return this.createNotFoundResult(speciesName);
                    }
                } else if (response.status === 204) {
                    // Status 204 significa "No Content" - não há dados para esta espécie
                    console.warn(`🌊 WoRMS - ${speciesName} No data available (HTTP 204)`);
                    return this.createNotFoundResult(speciesName);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`🌊 WoRMS - ${speciesName} Request failed: ${error.message}. Retrying in ${this.retryDelay}ms... (Attempt ${attempt + 1}/${this.maxRetries})`);
                    await this.delay(this.retryDelay);
                } else {
                    console.error(`🌊 WoRMS - ${speciesName} All attempts failed: ${error.message}`);
                    return this.createErrorResult(speciesName, error.message);
                }
            }
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            aphiaID: '-',
            url: '-',
            scientificName: '-',
            authority: '-',
            status: 'Not Found',
            unacceptReason: '-',
            taxonRankID: '-',
            rank: '-',
            validAphiaID: '-',
            validName: '-',
            validAuthority: '-',
            parentNameUsageID: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            citation: '-',
            lsid: '-',
            isMarine: '-',
            isBrackish: '-',
            isFreshwater: '-',
            isTerrestrial: '-',
            isExtinct: '-',
            matchType: '-',
            modified: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        return {
            speciesName: speciesName,
            aphiaID: '-',
            url: '-',
            scientificName: '-',
            authority: '-',
            status: 'Error',
            unacceptReason: errorMessage,
            taxonRankID: '-',
            rank: '-',
            validAphiaID: '-',
            validName: '-',
            validAuthority: '-',
            parentNameUsageID: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            citation: '-',
            lsid: '-',
            isMarine: '-',
            isBrackish: '-',
            isFreshwater: '-',
            isTerrestrial: '-',
            isExtinct: '-',
            matchType: '-',
            modified: '-'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;

        console.log(`🌊 WoRMS - Starting search for ${total} species...`);
        console.log(`🌊 WoRMS - Note: WoRMS API typically allows direct access without CORS restrictions`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];
            
            try {
                console.log(`🌊 WoRMS - Processing ${species} (${i + 1}/${total})...`);
                
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
                    await this.delay(1500); // 1.5 segundos entre requests
                }

            } catch (error) {
                console.error(`🌊 WoRMS - Error processing ${species}:`, error);
                
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

// Create global instance
const wormsAPI = new WormsAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WormsAPI;
}

// Garantir que a instância global seja criada
if (typeof window !== 'undefined') {
    window.wormsAPI = new WormsAPI();
    console.log('🌊 WoRMS API loaded and instance created successfully');
    window.WormsAPI = WormsAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = WormsAPI;
    }
}
