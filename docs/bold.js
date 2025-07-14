/**
 * BOLD Systems (Barcode of Life Data Systems) API Integration
 */

class BoldAPI {
    constructor() {
        this.baseURL = 'http://v3.boldsystems.org/index.php/API_Tax/TaxonSearch';
        this.sequenceURL = 'http://v3.boldsystems.org/index.php/API_Public/sequence';
        this.taxonomyURL = 'http://v3.boldsystems.org/index.php/API_Tax/TaxonData';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('🧬 BOLD API instance created');
    }

    async get_BOLD_Systems_data(taxid) {
        const apiUrl = `http://v3.boldsystems.org/index.php/API_Tax/TaxonData?taxId=${taxid}&dataTypes=basic&includeTree=true`;
        const proxyUrl = `https://corsproxy.io/?${apiUrl}`;
        const tax_data = {};
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            if (json) {
                Object.keys(json).forEach(key => {
                    const value = json[key];
                    tax_data[value.tax_rank] = value.taxon;
                });
                return tax_data;
            }
        } catch (error) {
            return false;
        }
    }

    async getSequenceCount(speciesName) {
        try {
            const apiUrl = `${this.sequenceURL}?taxon=${encodeURIComponent(speciesName)}&format=json`;
            const proxyUrl = `https://corsproxy.io/?${apiUrl}`;
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const textContent = await response.text();
                
                if (!textContent || textContent === "[]" || textContent.trim() === "") {
                    return 0;
                }

                try {
                    const data = JSON.parse(textContent);
                    return Array.isArray(data) ? data.length : 0;
                } catch (jsonError) {
                    // Se não for JSON, pode ser FASTA
                    if (textContent.startsWith(">")) {
                        return this.countFastaSequences(textContent);
                    }
                    return 0;
                }
            }
        } catch (error) {
            console.warn(`🧬 BOLD - Error getting sequence count for ${speciesName}:`, error.message);
        }

        return 0;
    }

    countFastaSequences(fastaText) {
        try {
            const lines = fastaText.split('\n');
            return lines.filter(line => line.startsWith('>')).length;
        } catch (error) {
            console.error('Error counting FASTA sequences:', error);
            return 0;
        }
    }

    async downloadSequences(speciesName) {
        try {
            const apiUrl = `${this.sequenceURL}?taxon=${encodeURIComponent(speciesName)}&format=json`;
            const proxyUrl = `https://corsproxy.io/?${apiUrl}`;
            
            const response = await fetch(proxyUrl);
            if (response.ok) {
                const textContent = await response.text();
                
                if (!textContent || textContent === "[]" || textContent.trim() === "") {
                    throw new Error('No sequences available for download');
                }

                let filename, content, mimeType;

                try {
                    const data = JSON.parse(textContent);
                    if (Array.isArray(data) && data.length > 0) {
                        // Converter JSON para FASTA
                        let fastaContent = '';
                        const sequencesByMarker = {};
                        
                        data.forEach(record => {
                            const marker = record.markercode || 'Unknown';
                            if (!sequencesByMarker[marker]) {
                                sequencesByMarker[marker] = [];
                            }
                            
                            if (record.nucleotides) {
                                const header = `>${record.processid || 'Unknown'}|${record.sampleid || 'Unknown'}|${speciesName}|${marker}|${record.country || 'Unknown'}`;
                                sequencesByMarker[marker].push(`${header}\n${record.nucleotides}`);
                            }
                        });

                        // Criar FASTA combinado
                        for (const marker in sequencesByMarker) {
                            fastaContent += `>Marker: ${marker}\n`;
                            fastaContent += sequencesByMarker[marker].join('\n') + '\n';
                        }

                        filename = `${speciesName.replace(' ', '_')}_BOLD_sequences.fasta`;
                        content = fastaContent;
                        mimeType = 'text/plain';
                    } else {
                        throw new Error('No valid sequence data found');
                    }
                } catch (jsonError) {
                    // Se não for JSON válido, assumir que é FASTA
                    if (textContent.startsWith(">")) {
                        filename = `${speciesName.replace(' ', '_')}_BOLD_sequences.fasta`;
                        content = textContent;
                        mimeType = 'text/plain';
                    } else {
                        throw new Error('Invalid sequence format');
                    }
                }

                // Fazer download
                const blob = new Blob([content], { type: mimeType });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                console.log(`🧬 BOLD - Successfully downloaded sequences for ${speciesName}`);
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`🧬 BOLD - Error downloading sequences for ${speciesName}:`, error);
            alert(`Error downloading sequences for ${speciesName}: ${error.message}`);
            return false;
        }
    }

    async searchSpecies(speciesName) {
        const apiUrl = `${this.baseURL}?taxName=${encodeURIComponent(speciesName)}`;
        const proxyUrl = `https://corsproxy.io/?${apiUrl}`;
        
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                console.log(`🧬 BOLD - ${speciesName} Attempting request via proxy (attempt ${attempt + 1}/${this.maxRetries})...`);
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && Object.keys(data).length > 0) {
                        // Extrair o taxid da resposta
                        let taxid = null;
                        for (const key in data) {
                            if (data[key] && data[key].taxid) {
                                taxid = data[key].taxid;
                                break;
                            }
                        }
                        
                        if (taxid) {
                            // Buscar dados detalhados da taxonomia usando a função que funcionava
                            const taxonomyData = await this.get_BOLD_Systems_data(taxid);
                            
                            // Buscar contagem de sequências
                            const sequenceCount = await this.getSequenceCount(speciesName);
                            
                            const result = {
                                speciesName: speciesName,
                                taxID: taxid,
                                kingdom: taxonomyData && taxonomyData['kingdom'] ? taxonomyData['kingdom'] : '-',
                                phylum: taxonomyData && taxonomyData['phylum'] ? taxonomyData['phylum'] : '-',
                                class: taxonomyData && taxonomyData['class'] ? taxonomyData['class'] : '-',
                                order: taxonomyData && taxonomyData['order'] ? taxonomyData['order'] : '-',
                                family: taxonomyData && taxonomyData['family'] ? taxonomyData['family'] : '-',
                                genus: taxonomyData && taxonomyData['genus'] ? taxonomyData['genus'] : speciesName.split(' ')[0],
                                species: taxonomyData && taxonomyData['species'] ? taxonomyData['species'] : speciesName,
                                sequencesCount: sequenceCount
                            };

                            console.log(`🧬 BOLD - ${speciesName} Successfully found: TaxID=${result.taxID}, Family=${result.family}, Sequences=${result.sequencesCount}`);
                            return result;
                        } else {
                            console.warn(`🧬 BOLD - ${speciesName} No taxonomy ID found`);
                            return this.createNotFoundResult(speciesName);
                        }
                    } else {
                        console.warn(`🧬 BOLD - ${speciesName} No results found`);
                        return this.createNotFoundResult(speciesName);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`🧬 BOLD - ${speciesName} Request failed: ${error.message}. Retrying in ${this.retryDelay}ms... (Attempt ${attempt + 1}/${this.maxRetries})`);
                    await this.delay(this.retryDelay);
                } else {
                    console.error(`🧬 BOLD - ${speciesName} All attempts failed: ${error.message}`);
                    return this.createErrorResult(speciesName, error.message);
                }
            }
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            taxID: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName,
            sequencesCount: 0
        };
    }

    createErrorResult(speciesName, errorMessage) {
        return {
            speciesName: speciesName,
            taxID: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName,
            sequencesCount: 0,
            error: errorMessage
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;

        console.log(`🧬 BOLD - Starting search for ${total} species using CORS proxy...`);
        console.log(`🧬 BOLD - Note: Using proxy server to bypass browser CORS restrictions`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];
            
            try {
                console.log(`🧬 BOLD - Processing ${species} (${i + 1}/${total})...`);
                
                const result = await this.searchSpecies(species);
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
                console.error(`🧬 BOLD - Error processing ${species}:`, error);
                
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

async function getBOLD() {
    console.log('getBOLD called');
    
    // Verificar se o boldAPI está disponível
    if (typeof window.boldAPI === 'undefined' || !window.boldAPI) {
        console.error('❌ boldAPI is not available. Attempting to initialize...');
        
        if (typeof BoldAPI !== 'undefined') {
            window.boldAPI = new BoldAPI();
            console.log('✅ boldAPI initialized successfully');
        } else {
            console.error('❌ BoldAPI class not found. Please check if bold.js is loaded.');
            alert('Erro: API do BOLD não está carregada. Por favor, recarregue a página e tente novamente.');
            return;
        }
    }

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

    console.log(`🧬 BOLD - Starting search for ${speciesNames.length} species...`);

    // Criar tabela do BOLD
    const _boldTable = document.createElement('table');
    _boldTable.id = 'TableResults';
    _boldTable.classList.add(
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
                TaxID <i class="fas fa-sort ml-2"></i>
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
                Sequences Count <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5">Download Sequences</th>
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _boldTable.innerHTML = headerHTML;

    const _boldTableBody = _boldTable.createTBody();
    _boldTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _boldTableWrapper = document.createElement('div');
    _boldTableWrapper.classList.add(
        "w-full",
        "overflow-x-auto",
        "overflow-y-auto",
        "mx-auto"
    );
    _boldTableWrapper.appendChild(_boldTable);

    const boldResults = document.getElementById('Results');
    boldResults.innerHTML = '';
    boldResults.appendChild(_boldTableWrapper);

    try {
        console.log('🧬 Using boldAPI.searchBatch...');
        
        const results = await window.boldAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
            },
            (result, current, total) => {
                console.log(`🧬 BOLD - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        console.log(`🧬 BOLD search completed. Processing ${results.length} results...`);

        // Contar resultados com sucesso e erros
        let successCount = 0;
        let errorCount = 0;
        let totalSequences = 0;

        for (const result of results) {
            const row = _boldTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );
            
            let cellIndex = 0;

            // TaxID
            const taxIdCell = row.insertCell(cellIndex++);
            taxIdCell.innerHTML = result.taxID || '-';
            taxIdCell.className = "py-5 px-5";

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

            // Sequences Count
            const sequencesCell = row.insertCell(cellIndex++);
            const sequenceCount = result.sequencesCount || 0;
            const sequenceColor = sequenceCount > 0 ? '#BACD92' : '#D1D1C7';
            sequencesCell.innerHTML = sequenceCount;
            sequencesCell.className = "py-5 px-5 font-bold text-center";
            sequencesCell.style.backgroundColor = sequenceColor;

            // Download Sequences
            const downloadCell = row.insertCell(cellIndex++);
            if (sequenceCount > 0) {
                downloadCell.innerHTML = `
                    <button class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md download-sequences-btn" 
                            onclick="downloadBoldSequences('${result.speciesName}')" 
                            title="Download sequences for ${result.speciesName}">
                        <i class="fas fa-download mr-2 text-lg"></i>
                        Download
                    </button>
                `;
            } else {
                downloadCell.innerHTML = '-';
            }
            downloadCell.className = "py-5 px-5";

            // Link
            const linkCell = row.insertCell(cellIndex++);
            if (result.taxID && result.taxID !== '-') {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md" 
                       href="http://v3.boldsystems.org/index.php/Taxbrowser_Taxonpage?taxid=${result.taxID}" 
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
            if (result.taxID && result.taxID !== '-') {
                successCount++;
            }
            if (result.error) {
                errorCount++;
            }
            totalSequences += sequenceCount;
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
                            <strong>Success:</strong> Successfully accessed BOLD Systems database using CORS proxy.
                        </p>
                        <p class="text-sm mt-2">
                            Results: ${successCount}/${results.length} species found with taxonomy data
                        </p>
                    </div>
                </div>
            `;
            boldResults.insertBefore(successNotice, _boldTableWrapper);
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
                            The BOLD Systems database requires proxy servers for browser access.
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
            boldResults.insertBefore(errorNotice, _boldTableWrapper);
        }

        // Remover o botão "Download All Sequences" dos controles se existir
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="bold-table-search" class="text-lg font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in BOLD Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="bold-table-search" 
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="bold-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="bold-column-filters" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="bold-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="bold-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>
                        Export to TSV
                    </button>
                </div>
                <p class="text-sm text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results. Use individual download buttons for sequences.
                </p>
            </div>
        `;

        // Inserir controles ANTES da tabela
        boldResults.insertBefore(controlsContainer, _boldTableWrapper);

        // Configurar funcionalidades dos controles
        createColumnFilters('TableResults', 'bold-column-filters');

        const searchInput = document.getElementById('bold-table-search');
        const clearButton = document.getElementById('bold-search-clear');
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

        document.getElementById('bold-export-excel').addEventListener('click', function() {
            exportTableToExcel('TableResults');
        });

        document.getElementById('bold-export-tsv').addEventListener('click', function() {
            exportTableToTSV('TableResults');
        });

        setTimeout(() => {
            progressModal.classList.add('hidden');
        }, 1000);

        updateDataResults();

        console.log(`🧬 BOLD search completed: ${successCount} successful, ${totalSequences} total sequences available`);

    } catch (error) {
        console.error('❌ Error during BOLD search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Garantir que a instância global seja criada
if (typeof window !== 'undefined') {
    window.boldAPI = new BoldAPI();
    console.log('🧬 BOLD API loaded and instance created successfully');
    window.BoldAPI = BoldAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BoldAPI;
    }
}

// Função global para download de sequências
window.downloadBoldSequences = async function(speciesName) {
    if (window.boldAPI) {
        await window.boldAPI.downloadSequences(speciesName);
    } else {
        alert('BOLD API not available');
    }
};

// Garantir que a instância global seja criada
if (typeof window !== 'undefined') {
    window.boldAPI = new BoldAPI();
    console.log('🧬 BOLD API loaded and instance created successfully');
    window.BoldAPI = BoldAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BoldAPI;
    }
}
