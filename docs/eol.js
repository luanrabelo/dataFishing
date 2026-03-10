/**
 * Encyclopedia of Life (EOL) API Integration
 * Uses the EOL API v1.0 at eol.org/api
 * CORS supported natively — no proxy needed
 */

class EolAPI {
    constructor() {
        this.baseURL = 'https://eol.org/api';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('EOL API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch an EOL API endpoint with retry logic
     */
    async apiFetch(url) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`EOL - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the EOL API
     * Step 1: Search for the species to get the EOL page ID
     * Step 2: Fetch page details including vernacular names and media
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`EOL - ${speciesName} Fetching data...`);

            // Step 1: Search for the species
            const searchUrl = `${this.baseURL}/search/1.0.json?q=${encodeURIComponent(speciesName.trim())}&page=1&key=`;
            const searchData = await this.apiFetch(searchUrl);

                console.log(`EOL - ${speciesName} Search response:`, searchData);

                if (!searchData || !searchData.results || searchData.results.length === 0) {
                    console.warn(`EOL - ${speciesName} No results found`);
                    return this.createNotFoundResult(speciesName);
                }

                // Find the best matching result
                const nameLower = speciesName.toLowerCase().trim();
                let matchedResult = searchData.results.find(r => {
                    const title = (r.title || '').toLowerCase();
                    return title === nameLower || title.startsWith(nameLower);
                });

                if (!matchedResult) {
                    matchedResult = searchData.results[0];
                }

                const eolId = matchedResult.id;
                if (!eolId) {
                    console.warn(`EOL - ${speciesName} No EOL ID found in search results`);
                    return this.createNotFoundResult(speciesName);
                }

                // Step 2: Fetch page details
                const detailsUrl = `${this.baseURL}/pages/1.0/${eolId}.json?details=true&vernaculars=true&images=1`;
                const detailsData = await this.apiFetch(detailsUrl);

                console.log(`EOL - ${speciesName} Details response:`, detailsData);

                if (!detailsData) {
                    console.warn(`EOL - ${speciesName} No details data found`);
                    return this.createNotFoundResult(speciesName);
                }

                // Extract scientific name from taxonConcepts
                let scientificName = '-';
                let canonicalForm = '-';
                const taxonConcepts = detailsData.taxonConcepts || [];
                if (taxonConcepts.length > 0) {
                    scientificName = taxonConcepts[0].scientificName || '-';
                    canonicalForm = taxonConcepts[0].canonicalForm || scientificName;
                }

                // Extract vernacular names
                const vernacularNames = detailsData.vernacularNames || [];
                let commonNames = '-';
                if (vernacularNames.length > 0) {
                    const namesList = [];
                    for (const vn of vernacularNames) {
                        const name = vn.vernacularName || '';
                        const language = vn.language || '';
                        if (name) {
                            const nameStr = language ? `${name} (${language})` : name;
                            namesList.push(nameStr);
                        }
                    }
                    commonNames = namesList.length > 0 ? namesList.join('; ') : '-';
                }

                // Extract richness score / media count
                const richnessScore = detailsData.richness_score != null ? String(detailsData.richness_score) : '-';

                const result = {
                    speciesName: speciesName,
                    eolId: String(eolId),
                    scientificName: canonicalForm !== '-' ? canonicalForm : scientificName,
                    commonNames: commonNames,
                    mediaCount: richnessScore
                };

                console.log(`EOL - ${speciesName} Successfully found: ID=${result.eolId}, Scientific=${result.scientificName}`);
                return result;

        } catch (error) {
            console.error(`EOL - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            eolId: '-',
            scientificName: '-',
            commonNames: '-',
            mediaCount: '-'
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

        console.log(`EOL - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`EOL - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(1000);
                }

            } catch (error) {
                console.error(`EOL - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getEOL(apiKey = 'eol') {
    console.log(`getEOL called with apiKey: ${apiKey}`);

    if (typeof window.eolAPI === 'undefined' || !window.eolAPI) {
        if (typeof EolAPI !== 'undefined') {
            window.eolAPI = new EolAPI();
        } else {
            alert('Error: EOL API is not loaded. Please reload the page.');
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

    console.log(`EOL - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const eolScientificNameOpt = document.getElementById('eolscientificnameopt')?.checked ?? true;
    const eolCommonNamesOpt = document.getElementById('eolcommonnamesopt')?.checked ?? false;
    const eolMediaOpt = document.getElementById('eolmediaopt')?.checked ?? false;

    // Build table
    const _eolTable = document.createElement('table');
    _eolTable.id = 'EolTable';
    _eolTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('EolTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Always visible
    addHeader('Species Name');

    // Scientific Name (mandatory)
    if (eolScientificNameOpt) {
        addHeader('Scientific Name');
    }

    addHeader('EOL ID');

    // Common Names (optional)
    if (eolCommonNamesOpt) {
        addHeader('Common Names');
    }

    // Media Count (optional)
    if (eolMediaOpt) {
        addHeader('Media Count');
    }

    _eolTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _eolTableBody = _eolTable.createTBody();
    _eolTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _eolTableWrapper = document.createElement('div');
    _eolTableWrapper.classList.add("w-full", "table-wrapper");
    _eolTableWrapper.appendChild(_eolTable);

    const eolResults = document.getElementById('tabPanel-eol');
    eolResults.appendChild(_eolTableWrapper);

    try {
        const results = await window.eolAPI.searchBatch(
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
                console.log(`EOL - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _eolTableBody.insertRow();
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
            if (eolScientificNameOpt) {
                addCell(`<i>${result.scientificName || '-'}</i>`);
            }

            // EOL ID
            addCell(result.eolId || '-');

            // Common Names
            if (eolCommonNamesOpt) {
                const cnCell = addCell(result.commonNames || '-');
                truncateCellText(cnCell, 80, 'Common Names');
            }

            // Media Count
            if (eolMediaOpt) {
                addCell(result.mediaCount || '-');
            }

            // Statistics
            if (result.eolId && result.eolId !== '-') {
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
                            <strong>Success:</strong> Successfully accessed Encyclopedia of Life database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            eolResults.insertBefore(successNotice, _eolTableWrapper);
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
            eolResults.insertBefore(errorNotice, _eolTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="eol-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in Encyclopedia of Life Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="eol-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="eol-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="eol-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="eol-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="eol-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        eolResults.insertBefore(controlsContainer, _eolTableWrapper);

        createColumnFilters('EolTable', 'eol-column-filters');

        const searchInput = document.getElementById('eol-table-search');
        const clearButton = document.getElementById('eol-search-clear');
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
                filterAndHighlightTable('EolTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('EolTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('EolTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('eol-export-excel').addEventListener('click', function () {
            exportTableToExcel('EolTable');
        });

        document.getElementById('eol-export-tsv').addEventListener('click', function () {
            exportTableToTSV('EolTable');
        });

        updateDataResults();

        console.log(`EOL search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during EOL search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.eolAPI = new EolAPI();
    console.log('EOL API loaded and instance created successfully');
    window.EolAPI = EolAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = EolAPI;
    }
}
