/**
 * OpenDataBio (INPA) API Integration
 * Uses a Cloudflare Worker as CORS reverse proxy to call opendatabio.inpa.gov.br
 * The Worker URL is configured in the constructor
 */

class OpenDataBioAPI {
    constructor() {
        this.workerUrl = 'https://cold-silence-ea90.luan-rabelo.workers.dev';
        this.token = '';
        this.maxRetries = 5;
        this.retryDelay = 2000;
        console.log('OpenDataBio API (Cloudflare Worker Proxy) instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setWorkerUrl(url) {
        this.workerUrl = url.replace(/\/+$/, '');
    }

    /**
     * Set the API authentication token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Fetch an OpenDataBio API endpoint through the Worker proxy with retry logic
     * @param {string} endpoint - e.g. /opendatabio/api/v0/taxons?name=Panthera%20tigris&limit=5
     */
    async apiFetch(endpoint) {
        const url = `${this.workerUrl}${endpoint}`;

        const headers = { 'Accept': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: headers
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`OpenDataBio - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the OpenDataBio API
     * Uses /taxons endpoint with name filter
     */
    async searchSpecies(speciesName, options = {}) {
        const endpoint = `/opendatabio/api/v0/taxons?name=${encodeURIComponent(speciesName.trim())}&limit=5`;

        try {
            console.log(`OpenDataBio - ${speciesName} Fetching data...`);

            const data = await this.apiFetch(endpoint);

            console.log(`OpenDataBio - ${speciesName} Raw API response:`, data);

                // Parse response: data may be at root level or inside a data property
                let records = [];
                if (data && Array.isArray(data.data)) {
                    records = data.data;
                } else if (data && Array.isArray(data)) {
                    records = data;
                }

                if (records.length > 0) {
                    // Find best match by name
                    const nameLower = speciesName.toLowerCase().trim();
                    let record = records.find(r => {
                        const fullname = (r.fullname || r.scientificName || r.taxonName || '').toLowerCase();
                        return fullname === nameLower || fullname.startsWith(nameLower);
                    });

                    if (!record) {
                        record = records[0];
                    }

                    console.log(`OpenDataBio - ${speciesName} Matched record:`, record);

                    // Extract taxonomy from parent taxons if available
                    let family = '-';
                    let order = '-';
                    let className = '-';

                    if (record.parent && Array.isArray(record.parent)) {
                        for (const parent of record.parent) {
                            const level = (parent.level || parent.rank || '').toString().toLowerCase();
                            const parentName = parent.fullname || parent.taxonName || parent.name || '';
                            if (level === 'family' || level === '120') family = parentName || family;
                            if (level === 'order' || level === '90') order = parentName || order;
                            if (level === 'class' || level === '60') className = parentName || className;
                        }
                    } else if (record.parentName) {
                        family = record.family || record.parentName || '-';
                    }

                    // Also check direct fields
                    if (family === '-' && record.family) family = record.family;
                    if (order === '-' && record.order) order = record.order;
                    if (className === '-' && record.class) className = record.class;

                    const result = {
                        speciesName: speciesName,
                        taxonId: String(record.id || '-'),
                        scientificName: record.fullname || record.scientificName || record.taxonName || '-',
                        author: record.scientificNameAuthorship || record.author || record.taxonAuthors || '-',
                        level: record.levelName || record.rank || record.level || '-',
                        family: family,
                        order: order,
                        class: className,
                        status: record.valid || record.status || record.taxonomicStatus || '-'
                    };

                    console.log(`OpenDataBio - ${speciesName} Successfully found: Family=${result.family}, Status=${result.status}`);
                    return result;
                } else {
                    console.warn(`OpenDataBio - ${speciesName} No results found`);
                    return this.createNotFoundResult(speciesName);
                }
        } catch (error) {
            console.error(`OpenDataBio - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            taxonId: '-',
            scientificName: '-',
            author: '-',
            level: '-',
            family: '-',
            order: '-',
            class: '-',
            status: 'Not Found'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        const result = this.createNotFoundResult(speciesName);
        result.status = 'Error';
        result.error = errorMessage;
        return result;
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`OpenDataBio - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`OpenDataBio - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(1000);
                }

            } catch (error) {
                console.error(`OpenDataBio - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getOpenDataBio(apiKey = 'opendatabio') {
    console.log(`getOpenDataBio called with apiKey: ${apiKey}`);

    if (typeof window.opendatabioAPI === 'undefined' || !window.opendatabioAPI) {
        if (typeof OpenDataBioAPI !== 'undefined') {
            window.opendatabioAPI = new OpenDataBioAPI();
        } else {
            alert('Error: OpenDataBio API is not loaded. Please reload the page.');
            return;
        }
    }

    // Read Token from UI input (optional)
    const tokenInput = document.getElementById('opendatabioApiToken');
    if (tokenInput && tokenInput.value.trim()) {
        window.opendatabioAPI.setToken(tokenInput.value.trim());
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

    console.log(`OpenDataBio - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const opendatabioTaxonomyOpt = document.getElementById('opendatabiotaxonomyopt')?.checked ?? true;

    // Build table
    const _opendatabioTable = document.createElement('table');
    _opendatabioTable.id = 'OpenDataBioTable';
    _opendatabioTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('OpenDataBioTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    addHeader('Species Name');
    addHeader('Scientific Name');
    addHeader('Author');
    addHeader('Family');
    addHeader('Status');

    _opendatabioTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _opendatabioTableBody = _opendatabioTable.createTBody();
    _opendatabioTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _opendatabioTableWrapper = document.createElement('div');
    _opendatabioTableWrapper.classList.add("w-full", "table-wrapper");
    _opendatabioTableWrapper.appendChild(_opendatabioTable);

    const opendatabioResults = document.getElementById('tabPanel-opendatabio');
    opendatabioResults.appendChild(_opendatabioTableWrapper);

    try {
        const results = await window.opendatabioAPI.searchBatch(
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
                console.log(`OpenDataBio - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _opendatabioTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Species Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);

            // Scientific Name
            addCell(`<i>${result.scientificName || '-'}</i>`);

            // Author
            addCell(result.author || '-');

            // Family
            addCell(result.family || '-');

            // Status
            addCell(result.status || '-');

            // Statistics
            if (result.status !== 'Not Found' && result.status !== 'Error') {
                successCount++;
            } else if (result.status === 'Error') {
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
                            <strong>Success:</strong> Successfully accessed OpenDataBio INPA database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            opendatabioResults.insertBefore(successNotice, _opendatabioTableWrapper);
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
            opendatabioResults.insertBefore(errorNotice, _opendatabioTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="opendatabio-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in OpenDataBio Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="opendatabio-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="opendatabio-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="opendatabio-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="opendatabio-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="opendatabio-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        opendatabioResults.insertBefore(controlsContainer, _opendatabioTableWrapper);

        createColumnFilters('OpenDataBioTable', 'opendatabio-column-filters');

        const searchInput = document.getElementById('opendatabio-table-search');
        const clearButton = document.getElementById('opendatabio-search-clear');
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
                filterAndHighlightTable('OpenDataBioTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('OpenDataBioTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('OpenDataBioTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('opendatabio-export-excel').addEventListener('click', function () {
            exportTableToExcel('OpenDataBioTable');
        });

        document.getElementById('opendatabio-export-tsv').addEventListener('click', function () {
            exportTableToTSV('OpenDataBioTable');
        });

        updateDataResults();

        console.log(`OpenDataBio search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during OpenDataBio search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.opendatabioAPI = new OpenDataBioAPI();
    console.log('OpenDataBio API (Cloudflare Worker Proxy) loaded and instance created successfully');
    window.OpenDataBioAPI = OpenDataBioAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = OpenDataBioAPI;
    }
}
