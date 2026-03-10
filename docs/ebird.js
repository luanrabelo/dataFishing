/**
 * eBird (Cornell Lab of Ornithology) API Integration
 * Uses the eBird API v2 at api.ebird.org
 * Requires an API key (x-ebirdapitoken header)
 * Taxonomy is fetched once and cached; species lookups are performed locally from the cache
 */

class EBirdAPI {
    constructor() {
        this.baseURL = 'https://api.ebird.org/v2';
        this.apiKey = '';
        this.taxonomyCache = null;
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('eBird API instance created');
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch an eBird API endpoint with retry logic
     */
    async apiFetch(url) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'x-ebirdapitoken': this.apiKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`eBird - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Load the full eBird taxonomy and cache it
     * Subsequent calls return the cached data immediately
     */
    async loadTaxonomy() {
        if (this.taxonomyCache) {
            return this.taxonomyCache;
        }

        console.log('eBird - Loading full taxonomy (this may take a moment)...');
        const url = `${this.baseURL}/ref/taxonomy/ebird?fmt=json`;
        const data = await this.apiFetch(url);

        this.taxonomyCache = data;
        console.log(`eBird - Taxonomy loaded: ${data.length} entries cached`);
        return this.taxonomyCache;
    }

    /**
     * Search for a species by scientific name in the cached taxonomy
     * First tries exact match on sciName, then partial (starts with)
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`eBird - ${speciesName} Searching in taxonomy...`);

            const taxonomy = await this.loadTaxonomy();
            const searchName = speciesName.trim().toLowerCase();

            // Try exact match on sciName (case-insensitive)
            let match = taxonomy.find(entry =>
                entry.sciName && entry.sciName.trim().toLowerCase() === searchName
            );

            // If no exact match, try partial match (starts with)
            if (!match) {
                match = taxonomy.find(entry =>
                    entry.sciName && entry.sciName.trim().toLowerCase().startsWith(searchName)
                );
            }

            if (!match) {
                console.warn(`eBird - ${speciesName} No results found in taxonomy`);
                return this.createNotFoundResult(speciesName);
            }

            const result = {
                speciesName: speciesName,
                speciesCode: match.speciesCode || '-',
                comName: match.comName || '-',
                sciName: match.sciName || '-',
                order: match.order || '-',
                familySciName: match.familySciName || '-',
                familyComName: match.familyComName || '-',
                category: match.category || '-'
            };

            console.log(`eBird - ${speciesName} Found: ${result.comName} (${result.speciesCode})`);
            return result;

        } catch (error) {
            console.error(`eBird - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            speciesCode: '-',
            comName: '-',
            sciName: '-',
            order: '-',
            familySciName: '-',
            familyComName: '-',
            category: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        const result = this.createNotFoundResult(speciesName);
        result.error = errorMessage;
        return result;
    }

    /**
     * Search a batch of species from the cached taxonomy
     * No real delay needed since all lookups are local after the initial taxonomy load
     */
    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`eBird - Starting search for ${total} species...`);

        // Ensure taxonomy is loaded before starting the batch
        await this.loadTaxonomy();

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`eBird - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Small yield for UI updates (data is local, no rate limiting needed)
                if (i < speciesList.length - 1) {
                    await this.delay(10);
                }

            } catch (error) {
                console.error(`eBird - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getEBird(apiKey = 'ebird') {
    console.log(`getEBird called with apiKey: ${apiKey}`);

    if (typeof window.ebirdAPI === 'undefined' || !window.ebirdAPI) {
        if (typeof EBirdAPI !== 'undefined') {
            window.ebirdAPI = new EBirdAPI();
        } else {
            alert('Error: eBird API is not loaded. Please reload the page.');
            return;
        }
    }

    // Check for API key input
    const apiKeyInput = document.getElementById('ebirdApiKey');
    if (!apiKeyInput || !apiKeyInput.value.trim()) {
        alert('Please enter your eBird API Key in the eBird configuration section.');
        return;
    }

    window.ebirdAPI.setApiKey(apiKeyInput.value.trim());

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

    console.log(`eBird - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const ebirdTaxonomyOpt = document.getElementById('ebirdtaxonomyopt')?.checked ?? true;
    const ebirdCommonNameOpt = document.getElementById('ebirdcommonnameopt')?.checked ?? true;

    // Build table
    const _ebirdTable = document.createElement('table');
    _ebirdTable.id = 'EBirdTable';
    _ebirdTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('EBirdTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy (mandatory)
    if (ebirdTaxonomyOpt) {
        addHeader('Order');
        addHeader('Family (Scientific)');
        addHeader('Family (Common)');
    }

    // Always visible
    addHeader('Species Name');

    // Common Name (mandatory)
    if (ebirdCommonNameOpt) {
        addHeader('Common Name');
    }

    addHeader('Species Code');
    addHeader('Category');

    // Link column (no sort)
    headerCells += `<th scope="col" class="py-5 px-5">Link</th>`;

    _ebirdTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true" style="position: sticky; z-index: 20;">
        <tr>${headerCells}</tr>
    </thead>`;

    const _ebirdTableBody = _ebirdTable.createTBody();
    _ebirdTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _ebirdTableWrapper = document.createElement('div');
    _ebirdTableWrapper.classList.add("w-full", "table-wrapper");
    _ebirdTableWrapper.appendChild(_ebirdTable);

    const ebirdResults = document.getElementById('tabPanel-ebird');
    ebirdResults.appendChild(_ebirdTableWrapper);

    try {
        const results = await window.ebirdAPI.searchBatch(
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
                console.log(`eBird - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _ebirdTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Taxonomy
            if (ebirdTaxonomyOpt) {
                addCell(result.order || '-');
                addCell(result.familySciName || '-');
                addCell(result.familyComName || '-');
            }

            // Species Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);

            // Common Name
            if (ebirdCommonNameOpt) {
                addCell(result.comName || '-');
            }

            addCell(result.speciesCode || '-');
            addCell(result.category || '-');

            // Link
            const linkCell = addCell('-');
            if (result.speciesCode && result.speciesCode !== '-') {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
                       href="https://ebird.org/species/${result.speciesCode}"
                       target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                        View
                    </a>
                `;
            }

            // Statistics
            if (result.speciesCode && result.speciesCode !== '-') {
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
                            <strong>Success:</strong> Successfully accessed eBird taxonomy database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found with taxonomy data
                        </p>
                    </div>
                </div>
            `;
            ebirdResults.insertBefore(successNotice, _ebirdTableWrapper);
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
            ebirdResults.insertBefore(errorNotice, _ebirdTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="ebird-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in eBird Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="ebird-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="ebird-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="ebird-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="ebird-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="ebird-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        ebirdResults.insertBefore(controlsContainer, _ebirdTableWrapper);

        createColumnFilters('EBirdTable', 'ebird-column-filters');

        const searchInput = document.getElementById('ebird-table-search');
        const clearButton = document.getElementById('ebird-search-clear');
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
                filterAndHighlightTable('EBirdTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('EBirdTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('EBirdTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('ebird-export-excel').addEventListener('click', function () {
            exportTableToExcel('EBirdTable');
        });

        document.getElementById('ebird-export-tsv').addEventListener('click', function () {
            exportTableToTSV('EBirdTable');
        });

        updateDataResults();

        console.log(`eBird search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during eBird search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.ebirdAPI = new EBirdAPI();
    console.log('eBird API loaded and instance created successfully');
    window.EBirdAPI = EBirdAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = EBirdAPI;
    }
}
