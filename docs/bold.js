/**
 * BOLD Systems (Barcode of Life Data Systems) API Integration
 * Uses the new BOLD Portal API at portal.boldsystems.org
 * Taxonomy-only — uses /api/taxonomy/hierarchy endpoint
 */

class BoldAPI {
    constructor() {
        this.baseURL = 'https://portal.boldsystems.org';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('BOLD API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch a BOLD Portal API endpoint with retry logic
     */
    async apiFetch(endpoint) {
        const url = `${this.baseURL}${endpoint}`;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`BOLD - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the BOLD Portal API
     * Uses only /api/taxonomy/hierarchy for taxonomy data
     */
    async searchSpecies(speciesName) {
        try {
            console.log(`BOLD - ${speciesName} Fetching data...`);

            // Get taxonomy hierarchy
            let hierarchyData = null;
            try {
                hierarchyData = await this.apiFetch(
                    `/api/taxonomy/hierarchy?name=${encodeURIComponent(speciesName)}&rank=species`
                );
                console.log(`BOLD - ${speciesName} Taxonomy hierarchy:`, hierarchyData);
            } catch (e) {
                console.warn(`BOLD - ${speciesName} Could not fetch taxonomy hierarchy: ${e.message}`);
            }

            // Extract taxid from species-level hierarchy entry
            let boldTaxId = '-';
            if (hierarchyData && Array.isArray(hierarchyData.species) && hierarchyData.species.length > 0) {
                boldTaxId = String(hierarchyData.species[0].taxid || '-');
            }

            // Build result
            const result = {
                speciesName: speciesName,
                taxID: boldTaxId,
                phylum: '-',
                class: '-',
                order: '-',
                family: '-',
                genus: speciesName.split(' ')[0],
                species: speciesName
            };

            // Extract taxonomy from hierarchy response
            if (hierarchyData) {
                const extractFirst = (arr) => {
                    if (Array.isArray(arr) && arr.length > 0) {
                        const first = arr[0];
                        if (typeof first === 'object' && first !== null) {
                            return first.taxon || '-';
                        }
                        if (typeof first === 'string') return first;
                    }
                    return '-';
                };

                if (hierarchyData.phylum) result.phylum = extractFirst(hierarchyData.phylum);
                if (hierarchyData.class) result.class = extractFirst(hierarchyData.class);
                if (hierarchyData.order) result.order = extractFirst(hierarchyData.order);
                if (hierarchyData.family) result.family = extractFirst(hierarchyData.family);
                if (hierarchyData.genus) result.genus = extractFirst(hierarchyData.genus);
                if (hierarchyData.species) result.species = extractFirst(hierarchyData.species);
            }

            // Determine if species was found
            const found = hierarchyData && Object.keys(hierarchyData).length > 0;

            if (found) {
                console.log(`BOLD - ${speciesName} Successfully found: Family=${result.family}`);
            } else {
                console.warn(`BOLD - ${speciesName} No results found`);
            }

            return result;

        } catch (error) {
            console.error(`BOLD - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            taxID: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName
        };
    }

    createErrorResult(speciesName, errorMessage) {
        return {
            speciesName: speciesName,
            taxID: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName,
            error: errorMessage
        };
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;

        console.log(`BOLD - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`BOLD - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species);
                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(1000);
                }

            } catch (error) {
                console.error(`BOLD - Error processing ${species}:`, error);

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

async function getBOLD(apiKey = 'bold') {
    console.log(`getBOLD called with apiKey: ${apiKey}`);

    if (typeof window.boldAPI === 'undefined' || !window.boldAPI) {
        if (typeof BoldAPI !== 'undefined') {
            window.boldAPI = new BoldAPI();
        } else {
            alert('Error: BOLD API is not loaded. Please reload the page.');
            return;
        }
    }

    const progressModal = document.getElementById('progressModal');

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

    console.log(`BOLD - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const boldTaxonomyOpt = document.getElementById('boldtaxonomyopt')?.checked ?? true;

    // Build table
    const _boldTable = document.createElement('table');
    _boldTable.id = 'BoldTable';
    _boldTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('BoldTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy (mandatory)
    if (boldTaxonomyOpt) {
        addHeader('TaxID');
        addHeader('Phylum');
        addHeader('Class');
        addHeader('Order');
        addHeader('Family');
        addHeader('Genus');
    }

    addHeader('Species Name');

    _boldTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _boldTableBody = _boldTable.createTBody();
    _boldTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _boldTableWrapper = document.createElement('div');
    _boldTableWrapper.classList.add("w-full", "table-wrapper");
    _boldTableWrapper.appendChild(_boldTable);

    const boldResults = document.getElementById('tabPanel-bold');
    boldResults.appendChild(_boldTableWrapper);

    try {
        const results = await window.boldAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;

                const apiProgressBar = document.getElementById(`progressBar-${apiKey}`);
                const apiProgressText = document.getElementById(`progressText-${apiKey}`);
                if (apiProgressBar) apiProgressBar.style.width = progress + '%';
                if (apiProgressText) apiProgressText.textContent = Math.round(progress) + '%';

                if (typeof window.globalProgressTracker !== 'undefined') {
                    window.globalProgressTracker.updateApiProgress(apiKey, progress);
                }
            },
            (result, current, total) => {
                console.log(`BOLD - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _boldTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Taxonomy
            if (boldTaxonomyOpt) {
                addCell(result.taxID || '-');
                addCell(result.phylum || '-');
                addCell(result.class || '-');
                addCell(result.order || '-');
                addCell(result.family || '-');
                addCell(`<i>${result.genus || '-'}</i>`);
            }

            // Species Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);

            // Statistics
            if (result.taxID && result.taxID !== '-') {
                successCount++;
            }
            if (result.error) {
                errorCount++;
            }
        }

        // Status notices
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
                            <strong>Success:</strong> Successfully accessed BOLD Systems database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found with taxonomy data
                        </p>
                    </div>
                </div>
            `;
            boldResults.insertBefore(successNotice, _boldTableWrapper);
        }

        if (errorCount > 0) {
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
            boldResults.insertBefore(errorNotice, _boldTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="bold-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
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
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-columns mr-2"></i>Toggle Column Visibility
                </h4>
                <div id="bold-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
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
                <p class="text-base text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results.
                </p>
            </div>
        `;

        boldResults.insertBefore(controlsContainer, _boldTableWrapper);

        createColumnFilters('BoldTable', 'bold-column-filters');

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
                filterAndHighlightTable('BoldTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('BoldTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('BoldTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('bold-export-excel').addEventListener('click', function () {
            exportTableToExcel('BoldTable');
        });

        document.getElementById('bold-export-tsv').addEventListener('click', function () {
            exportTableToTSV('BoldTable');
        });

        updateDataResults();

        console.log(`BOLD search completed: ${successCount} successful`);

    } catch (error) {
        console.error('Error during BOLD search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.boldAPI = new BoldAPI();
    console.log('BOLD API loaded and instance created successfully');
    window.BoldAPI = BoldAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BoldAPI;
    }
}
