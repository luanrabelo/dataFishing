/**
 * OBIS (Ocean Biodiversity Information System) API Integration
 * Uses the public OBIS API v3 at api.obis.org
 * No CORS proxy needed (CORS supported), no API key required
 */

class ObisAPI {
    constructor() {
        this.baseURL = 'https://api.obis.org/v3';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('OBIS API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch an OBIS API endpoint with retry logic
     */
    async apiFetch(url) {
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
                    console.warn(`OBIS - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the OBIS API
     * Uses /taxon/{scientificname} endpoint for taxonomy and habitat data
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`OBIS - ${speciesName} Fetching data...`);

            const url = `${this.baseURL}/taxon/${encodeURIComponent(speciesName.trim())}`;
            const data = await this.apiFetch(url);

            console.log(`OBIS - ${speciesName} Raw API response:`, data);

            if (!data || !data.results || data.results.length === 0) {
                console.warn(`OBIS - ${speciesName} No results found`);
                return this.createNotFoundResult(speciesName);
            }

            const t = data.results[0];

            const result = {
                speciesName: speciesName,
                taxonID: String(t.taxonID || t.AphiaID || '-'),
                kingdom: t.kingdom || '-',
                phylum: t.phylum || '-',
                class: t.class || '-',
                order: t.order || '-',
                family: t.family || '-',
                genus: t.genus || speciesName.split(' ')[0] || '-',
                species: t.species || speciesName,
                isMarine: t.is_marine != null ? (t.is_marine ? 'Yes' : 'No') : '-',
                isBrackish: t.is_brackish != null ? (t.is_brackish ? 'Yes' : 'No') : '-',
                isFreshwater: t.is_freshwater != null ? (t.is_freshwater ? 'Yes' : 'No') : '-',
                isTerrestrial: t.is_terrestrial != null ? (t.is_terrestrial ? 'Yes' : 'No') : '-',
                aphiaID: t.AphiaID != null ? String(t.AphiaID) : '-',
                ncbiID: t.ncbiID != null ? String(t.ncbiID) : '-'
            };

            const found = result.taxonID !== '-' || result.family !== '-';

            if (found) {
                console.log(`OBIS - ${speciesName} Successfully found: Family=${result.family}, Marine=${result.isMarine}`);
            } else {
                console.warn(`OBIS - ${speciesName} No results found`);
            }

            return result;

        } catch (error) {
            console.error(`OBIS - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            taxonID: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            species: speciesName,
            isMarine: '-',
            isBrackish: '-',
            isFreshwater: '-',
            isTerrestrial: '-',
            aphiaID: '-',
            ncbiID: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        const result = this.createNotFoundResult(speciesName);
        result.error = errorMessage;
        return result;
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`OBIS - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`OBIS - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(500);
                }

            } catch (error) {
                console.error(`OBIS - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getOBIS(apiKey = 'obis') {
    console.log(`getOBIS called with apiKey: ${apiKey}`);

    if (typeof window.obisAPI === 'undefined' || !window.obisAPI) {
        if (typeof ObisAPI !== 'undefined') {
            window.obisAPI = new ObisAPI();
        } else {
            alert('Error: OBIS API is not loaded. Please reload the page.');
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

    console.log(`OBIS - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const obisTaxonomyOpt = document.getElementById('obistaxonomyopt')?.checked ?? true;
    const obisHabitatFlagsOpt = document.getElementById('obishabitatflagsopt')?.checked ?? false;
    const obisExternalIdsOpt = document.getElementById('obisexternalidsopt')?.checked ?? false;

    // Build table
    const _obisTable = document.createElement('table');
    _obisTable.id = 'ObisTable';
    _obisTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('ObisTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy (mandatory)
    if (obisTaxonomyOpt) {
        addHeader('Kingdom');
        addHeader('Phylum');
        addHeader('Class');
        addHeader('Order');
        addHeader('Family');
    }

    addHeader('Species Name');

    // Habitat Flags (optional)
    if (obisHabitatFlagsOpt) {
        addHeader('Marine');
        addHeader('Brackish');
        addHeader('Freshwater');
        addHeader('Terrestrial');
    }

    // External IDs (optional)
    if (obisExternalIdsOpt) {
        addHeader('AphiaID');
        addHeader('NCBI ID');
    }

    _obisTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _obisTableBody = _obisTable.createTBody();
    _obisTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _obisTableWrapper = document.createElement('div');
    _obisTableWrapper.classList.add("w-full", "table-wrapper");
    _obisTableWrapper.appendChild(_obisTable);

    const obisResults = document.getElementById('tabPanel-obis');
    obisResults.appendChild(_obisTableWrapper);

    try {
        const results = await window.obisAPI.searchBatch(
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
                console.log(`OBIS - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _obisTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Taxonomy
            if (obisTaxonomyOpt) {
                addCell(result.kingdom || '-');
                addCell(result.phylum || '-');
                addCell(result.class || '-');
                addCell(result.order || '-');
                addCell(result.family || '-');
            }

            // Species Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);

            // Habitat Flags
            if (obisHabitatFlagsOpt) {
                const habitatFields = [
                    { value: result.isMarine },
                    { value: result.isBrackish },
                    { value: result.isFreshwater },
                    { value: result.isTerrestrial }
                ];
                for (const hf of habitatFields) {
                    const val = hf.value || '-';
                    const color = val === 'Yes' ? '#5FC65A' : val === 'No' ? '#FA7070' : '#D1D1C7';
                    const cell = addCell(val, "py-5 px-5 font-bold text-center");
                    cell.style.backgroundColor = color;
                }
            }

            // External IDs
            if (obisExternalIdsOpt) {
                if (result.aphiaID && result.aphiaID !== '-') {
                    addCell(`<a href="https://www.marinespecies.org/aphia.php?p=taxdetails&id=${result.aphiaID}" target="_blank" class="text-blue-600 hover:underline">${result.aphiaID}</a>`);
                } else {
                    addCell('-');
                }
                addCell(result.ncbiID || '-');
            }

            // Statistics
            if (result.taxonID && result.taxonID !== '-') {
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
                            <strong>Success:</strong> Successfully accessed OBIS database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found with taxonomy data
                        </p>
                    </div>
                </div>
            `;
            obisResults.insertBefore(successNotice, _obisTableWrapper);
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
            obisResults.insertBefore(errorNotice, _obisTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="obis-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in OBIS Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="obis-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="obis-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="obis-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="obis-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="obis-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        obisResults.insertBefore(controlsContainer, _obisTableWrapper);

        createColumnFilters('ObisTable', 'obis-column-filters');

        const searchInput = document.getElementById('obis-table-search');
        const clearButton = document.getElementById('obis-search-clear');
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
                filterAndHighlightTable('ObisTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('ObisTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('ObisTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('obis-export-excel').addEventListener('click', function () {
            exportTableToExcel('ObisTable');
        });

        document.getElementById('obis-export-tsv').addEventListener('click', function () {
            exportTableToTSV('ObisTable');
        });

        updateDataResults();

        console.log(`OBIS search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during OBIS search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.obisAPI = new ObisAPI();
    console.log('OBIS API loaded and instance created successfully');
    window.ObisAPI = ObisAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ObisAPI;
    }
}
