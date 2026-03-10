/**
 * Catalogue of Life (ChecklistBank) API Integration
 * Uses the public ChecklistBank API at api.checklistbank.org
 * No CORS proxy needed (CORS supported), no API key required
 */

class ColAPI {
    constructor() {
        this.baseURL = 'https://api.checklistbank.org';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('COL API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch a ChecklistBank API endpoint with retry logic
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
                    console.warn(`COL - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the ChecklistBank API
     * Uses /dataset/3LR/nameusage/search endpoint for taxonomy data
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`COL - ${speciesName} Fetching data...`);

            const url = `${this.baseURL}/dataset/3LR/nameusage/search?q=${encodeURIComponent(speciesName.trim())}&rank=species&limit=5`;
            const data = await this.apiFetch(url);

            console.log(`COL - ${speciesName} Raw API response:`, data);

            if (!data || !data.result || data.result.length === 0) {
                console.warn(`COL - ${speciesName} No results found`);
                return this.createNotFoundResult(speciesName);
            }

            // Prefer exact name match, fall back to first result
            // usage.name is an object with { scientificName, authorship, ... }
            const nameLower = speciesName.trim().toLowerCase();
            const match = data.result.find(r => {
                const u = r.usage || r;
                const sciName = (u.name && u.name.scientificName) || u.label || '';
                return String(sciName).toLowerCase() === nameLower;
            }) || data.result[0];
            const usage = match.usage || match;
            const classification = match.classification || [];

            // Extract classification fields
            let kingdom = '-';
            let phylum = '-';
            let className = '-';
            let order = '-';
            let family = '-';
            let subfamily = '-';
            let genus = '-';

            for (const rank of classification) {
                const rankName = (rank.rank || '').toLowerCase();
                const name = rank.name || '';
                if (rankName === 'kingdom') kingdom = name;
                else if (rankName === 'phylum') phylum = name;
                else if (rankName === 'class') className = name;
                else if (rankName === 'order') order = name;
                else if (rankName === 'family') family = name;
                else if (rankName === 'subfamily') subfamily = name;
                else if (rankName === 'genus') genus = name;
            }

            // Also check direct usage fields as fallback
            if (kingdom === '-' && usage.kingdom) kingdom = usage.kingdom;
            if (phylum === '-' && usage.phylum) phylum = usage.phylum;
            if (className === '-' && usage.class) className = usage.class;
            if (order === '-' && usage.order) order = usage.order;
            if (family === '-' && usage.family) family = usage.family;
            if (genus === '-' && usage.genus) genus = usage.genus;

            const taxonId = String(usage.id || '-');
            const environments = (usage.environments && Array.isArray(usage.environments))
                ? usage.environments.join('; ')
                : '-';

            // usage.name is an object; scientificName and authorship live inside it
            const nameObj = usage.name || {};
            const scientificName = nameObj.scientificName || speciesName;
            const authorship = nameObj.authorship || '-';

            const result = {
                speciesName: speciesName,
                taxonId: taxonId,
                kingdom: kingdom,
                phylum: phylum,
                class: className,
                order: order,
                family: family,
                subfamily: subfamily,
                genus: genus,
                scientificName: scientificName,
                authorship: authorship,
                status: usage.status || '-',
                extinct: usage.extinct != null ? (usage.extinct ? 'Yes' : 'No') : '-',
                group: match.group || '-',
                scrutinizer: usage.scrutinizer || '-',
                scrutinizerDate: usage.scrutinizerDate ? usage.scrutinizerDate.split('T')[0] : '-',
                environments: environments,
                synonyms: '-'
            };

            // Optionally fetch synonyms
            if (options.fetchSynonyms && taxonId !== '-') {
                try {
                    console.log(`COL - ${speciesName} Fetching synonyms...`);
                    const synUrl = `${this.baseURL}/dataset/3LR/taxon/${taxonId}/synonyms`;
                    const synData = await this.apiFetch(synUrl);

                    console.log(`COL - ${speciesName} Synonyms response:`, synData);

                    if (synData && Array.isArray(synData) && synData.length > 0) {
                        const synNames = [];
                        for (const syn of synData) {
                            const synName = syn.name || syn.label || '';
                            if (synName) synNames.push(synName);
                        }
                        result.synonyms = synNames.length > 0 ? synNames.join('; ') : '-';
                    }
                } catch (synError) {
                    console.warn(`COL - ${speciesName} Could not fetch synonyms: ${synError.message}`);
                }
            }

            // Determine if species was found
            const found = result.taxonId !== '-' || result.family !== '-';

            if (found) {
                console.log(`COL - ${speciesName} Successfully found: Family=${result.family}, Status=${result.status}`);
            } else {
                console.warn(`COL - ${speciesName} No results found`);
            }

            return result;

        } catch (error) {
            console.error(`COL - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            taxonId: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            subfamily: '-',
            genus: speciesName.split(' ')[0] || '-',
            scientificName: speciesName,
            authorship: '-',
            status: '-',
            extinct: '-',
            group: '-',
            scrutinizer: '-',
            scrutinizerDate: '-',
            environments: '-',
            synonyms: '-'
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

        console.log(`COL - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`COL - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(500);
                }

            } catch (error) {
                console.error(`COL - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getCOL(apiKey = 'col') {
    console.log(`getCOL called with apiKey: ${apiKey}`);

    if (typeof window.colAPI === 'undefined' || !window.colAPI) {
        if (typeof ColAPI !== 'undefined') {
            window.colAPI = new ColAPI();
        } else {
            alert('Error: COL API is not loaded. Please reload the page.');
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

    console.log(`COL - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const colTaxonomyOpt = document.getElementById('coltaxonomyopt')?.checked ?? true;
    const colSubfamilyOpt = document.getElementById('colsubfamilyopt')?.checked ?? false;
    const colAuthorshipOpt = document.getElementById('colauthorshipopt')?.checked ?? true;
    const colStatusOpt = document.getElementById('colstatusopt')?.checked ?? true;
    const colExtinctOpt = document.getElementById('colextinctopt')?.checked ?? false;
    const colGroupOpt = document.getElementById('colgroupopt')?.checked ?? false;
    const colScrutinizerOpt = document.getElementById('colscrutinizeropt')?.checked ?? false;
    const colEnvironmentsOpt = document.getElementById('colenvironmentsopt')?.checked ?? false;
    const colSynonymsOpt = document.getElementById('colsynonymsopt')?.checked ?? false;

    // Build table
    const _colTable = document.createElement('table');
    _colTable.id = 'ColTable';
    _colTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('ColTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy (mandatory)
    if (colTaxonomyOpt) {
        addHeader('Kingdom');
        addHeader('Phylum');
        addHeader('Class');
        addHeader('Order');
        addHeader('Family');
        if (colSubfamilyOpt) addHeader('Subfamily');
    }

    addHeader('Species Name');
    addHeader('Scientific Name');

    // Authorship (mandatory)
    if (colAuthorshipOpt) {
        addHeader('Authorship');
    }

    // Status (mandatory)
    if (colStatusOpt) {
        addHeader('Status');
    }

    // Extinct (optional)
    if (colExtinctOpt) {
        addHeader('Extinct');
    }

    // Group (optional)
    if (colGroupOpt) {
        addHeader('Group');
    }

    // Scrutinizer (optional)
    if (colScrutinizerOpt) {
        addHeader('Scrutinizer');
        addHeader('Scrutinizer Date');
    }

    // Environments (optional)
    if (colEnvironmentsOpt) {
        addHeader('Environments');
    }

    // Synonyms (optional)
    if (colSynonymsOpt) {
        addHeader('Synonyms');
    }

    _colTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _colTableBody = _colTable.createTBody();
    _colTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _colTableWrapper = document.createElement('div');
    _colTableWrapper.classList.add("w-full", "table-wrapper");
    _colTableWrapper.appendChild(_colTable);

    const colResults = document.getElementById('tabPanel-col');
    colResults.appendChild(_colTableWrapper);

    try {
        const results = await window.colAPI.searchBatch(
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
                console.log(`COL - Completed ${current}/${total}: ${result.speciesName}`);
            },
            { fetchSynonyms: colSynonymsOpt }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _colTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Taxonomy
            if (colTaxonomyOpt) {
                addCell(result.kingdom || '-');
                addCell(result.phylum || '-');
                addCell(result.class || '-');
                addCell(result.order || '-');
                addCell(result.family || '-');
                if (colSubfamilyOpt) addCell(result.subfamily || '-');
            }

            // Species Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);

            // Scientific Name (always visible)
            addCell(`<i>${result.scientificName || '-'}</i>`);

            // Authorship
            if (colAuthorshipOpt) {
                addCell(result.authorship || '-');
            }

            // Status with color
            if (colStatusOpt) {
                const statusColorMap = {
                    'accepted': '#BACD92',
                    'synonym': '#FFE066',
                    'ambiguous synonym': '#FFE066',
                    'provisionally accepted': '#CCE2A3',
                    'bare name': '#D1D1C7',
                    'misapplied': '#FA7070'
                };
                const statusVal = result.status || '-';
                const statusCell = addCell(statusVal, "py-5 px-5 font-bold text-center");
                statusCell.style.backgroundColor = statusColorMap[statusVal.toLowerCase()] || '#D1D1C7';
            }

            // Extinct with color
            if (colExtinctOpt) {
                const extinctVal = result.extinct || '-';
                const extinctColor = extinctVal === 'Yes' ? '#FA7070' : extinctVal === 'No' ? '#5FC65A' : '#D1D1C7';
                const extinctCell = addCell(extinctVal, "py-5 px-5 font-bold text-center");
                extinctCell.style.backgroundColor = extinctColor;
            }

            // Group
            if (colGroupOpt) {
                addCell(result.group || '-', "py-5 px-5 text-center");
            }

            // Scrutinizer
            if (colScrutinizerOpt) {
                const scrCell = addCell(result.scrutinizer || '-');
                truncateCellText(scrCell, 80, 'Scrutinizer');
                addCell(result.scrutinizerDate || '-', "py-5 px-5 text-center");
            }

            // Environments
            if (colEnvironmentsOpt) {
                addCell(result.environments || '-', "py-5 px-5 text-center");
            }

            // Synonyms
            if (colSynonymsOpt) {
                const synCell = addCell(`<i>${result.synonyms || '-'}</i>`, "py-5 px-5 text-center");
                truncateCellText(synCell, 80, 'Synonyms');
            }

            // Statistics
            if (result.taxonId && result.taxonId !== '-') {
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
                            <strong>Success:</strong> Successfully accessed Catalogue of Life database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found with taxonomy data
                        </p>
                    </div>
                </div>
            `;
            colResults.insertBefore(successNotice, _colTableWrapper);
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
            colResults.insertBefore(errorNotice, _colTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="col-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in Catalogue of Life Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="col-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="col-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="col-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="col-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="col-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        colResults.insertBefore(controlsContainer, _colTableWrapper);

        createColumnFilters('ColTable', 'col-column-filters');

        const searchInput = document.getElementById('col-table-search');
        const clearButton = document.getElementById('col-search-clear');
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
                filterAndHighlightTable('ColTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('ColTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('ColTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('col-export-excel').addEventListener('click', function () {
            exportTableToExcel('ColTable');
        });

        document.getElementById('col-export-tsv').addEventListener('click', function () {
            exportTableToTSV('ColTable');
        });

        updateDataResults();

        console.log(`COL search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during COL search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.colAPI = new ColAPI();
    console.log('COL API loaded and instance created successfully');
    window.ColAPI = ColAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ColAPI;
    }
}
