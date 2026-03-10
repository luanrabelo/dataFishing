/**
 * BirdLife International (CSV) Integration
 * No HTTP calls - user uploads a BirdLife CSV file and data is searched locally
 * Parses CSV following RFC 4180, handles quoted fields with commas
 */

class BirdLifeAPI {
    constructor() {
        this.csvData = null;
        this.csvHeaders = null;
        console.log('BirdLife API instance created (CSV-based, no HTTP calls)');
    }

    /**
     * RFC 4180 CSV parser handling quoted fields with commas
     * Returns array of arrays (rows of cells)
     */
    parseCSV(text) {
        const rows = [];
        let current = '';
        let inQuotes = false;
        let row = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (inQuotes) {
                if (ch === '"' && text[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    row.push(current.trim());
                    current = '';
                } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
                    row.push(current.trim());
                    current = '';
                    if (ch === '\r') i++; // skip \n
                    if (row.length > 1 || row[0] !== '') rows.push(row);
                    row = [];
                } else {
                    current += ch;
                }
            }
        }

        if (current || row.length > 0) {
            row.push(current.trim());
            rows.push(row);
        }

        return rows;
    }

    /**
     * Load and parse CSV content
     * Stores header row and data rows separately
     * Returns count of loaded data records
     */
    loadCSV(fileContent) {
        const parsedRows = this.parseCSV(fileContent);

        if (parsedRows.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }

        this.csvHeaders = parsedRows[0];
        this.csvData = parsedRows.slice(1);

        console.log(`BirdLife - CSV loaded: ${this.csvHeaders.length} columns, ${this.csvData.length} records`);
        console.log(`BirdLife - Headers: ${this.csvHeaders.join(', ')}`);

        return this.csvData.length;
    }

    /**
     * Find a column index by header name (case-insensitive partial match)
     */
    getColumnIndex(headerName) {
        if (!this.csvHeaders) return -1;

        const search = headerName.trim().toLowerCase();

        // Try exact match first
        let idx = this.csvHeaders.findIndex(h => h.trim().toLowerCase() === search);
        if (idx !== -1) return idx;

        // Try partial match (contains)
        idx = this.csvHeaders.findIndex(h => h.trim().toLowerCase().includes(search));
        return idx;
    }

    /**
     * Get cell value from a row by column header name
     */
    getCellValue(row, headerName) {
        const idx = this.getColumnIndex(headerName);
        if (idx === -1 || idx >= row.length) return '-';
        const val = row[idx];
        return (val !== undefined && val !== null && val.toString().trim() !== '') ? val.trim() : '-';
    }

    /**
     * Search for a species in the loaded CSV data by scientific name
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            if (!this.csvData) {
                return this.createErrorResult(speciesName, 'No CSV file loaded');
            }

            console.log(`BirdLife - ${speciesName} Searching in CSV data...`);

            const sciNameIdx = this.getColumnIndex('Scientific name');
            if (sciNameIdx === -1) {
                return this.createErrorResult(speciesName, 'Scientific name column not found in CSV');
            }

            const searchName = speciesName.trim().toLowerCase();

            // Linear scan for matching row
            const matchRow = this.csvData.find(row => {
                if (sciNameIdx >= row.length) return false;
                return row[sciNameIdx].trim().toLowerCase() === searchName;
            });

            if (!matchRow) {
                console.warn(`BirdLife - ${speciesName} Not found in CSV data`);
                return this.createNotFoundResult(speciesName);
            }

            const result = {
                speciesName: speciesName,
                sisId: this.getCellValue(matchRow, 'SIS ID'),
                family: this.getCellValue(matchRow, 'Family'),
                scientificName: this.getCellValue(matchRow, 'Scientific name'),
                commonName: this.getCellValue(matchRow, 'Common name'),
                rlCategory: this.getCellValue(matchRow, 'RL Category'),
                pe: this.getCellValue(matchRow, 'PE'),
                pew: this.getCellValue(matchRow, 'PEW'),
                seabird: this.getCellValue(matchRow, 'Seabird'),
                waterbird: this.getCellValue(matchRow, 'Waterbird'),
                landbird: this.getCellValue(matchRow, 'Landbird'),
                migratoryStatus: this.getCellValue(matchRow, 'Migratory status'),
                ecosystemTerrestrial: this.getCellValue(matchRow, 'Ecosystem - Terrestrial'),
                ecosystemFreshwater: this.getCellValue(matchRow, 'Ecosystem - Freshwater'),
                ecosystemMarine: this.getCellValue(matchRow, 'Ecosystem - Marine'),
                rlAoo: this.getCellValue(matchRow, 'RL AOO'),
                criteriaMet: this.getCellValue(matchRow, 'Criteria met at highest level'),
                rlEoo: this.getCellValue(matchRow, 'RL EOO'),
                populationSize: this.getCellValue(matchRow, 'Population size (mature individuals)'),
                populationSizeDerivation: this.getCellValue(matchRow, 'Population size derivation'),
                populationTrend: this.getCellValue(matchRow, 'Current population trend'),
                populationTrendDerivation: this.getCellValue(matchRow, 'Current population trend derivation')
            };

            console.log(`BirdLife - ${speciesName} Found: ${result.commonName}, RL Category=${result.rlCategory}`);
            return result;

        } catch (error) {
            console.error(`BirdLife - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            sisId: '-',
            family: '-',
            scientificName: '-',
            commonName: '-',
            rlCategory: '-',
            pe: '-',
            pew: '-',
            seabird: '-',
            waterbird: '-',
            landbird: '-',
            migratoryStatus: '-',
            ecosystemTerrestrial: '-',
            ecosystemFreshwater: '-',
            ecosystemMarine: '-',
            rlAoo: '-',
            criteriaMet: '-',
            rlEoo: '-',
            populationSize: '-',
            populationSizeDerivation: '-',
            populationTrend: '-',
            populationTrendDerivation: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        const result = this.createNotFoundResult(speciesName);
        result.error = errorMessage;
        return result;
    }

    /**
     * Search a batch of species from the loaded CSV data
     * No delay needed since all lookups are local; 1ms yield for UI updates
     */
    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`BirdLife - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`BirdLife - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Minimal yield for UI updates (data is local)
                if (i < speciesList.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }

            } catch (error) {
                console.error(`BirdLife - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getBirdLife(apiKey = 'birdlife') {
    console.log(`getBirdLife called with apiKey: ${apiKey}`);

    if (typeof window.birdlifeAPI === 'undefined' || !window.birdlifeAPI) {
        if (typeof BirdLifeAPI !== 'undefined') {
            window.birdlifeAPI = new BirdLifeAPI();
        } else {
            alert('Error: BirdLife API is not loaded. Please reload the page.');
            return;
        }
    }

    // Auto-load CSV from csv/BirdLife.csv if not already loaded
    if (!window.birdlifeAPI.csvData) {
        const statusEl = document.getElementById('birdlifeCsvStatus');
        if (statusEl) {
            statusEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Loading <strong>csv/BirdLife.csv</strong>...';
            statusEl.className = 'text-base text-gray-600';
        }
        try {
            const response = await fetch('csv/BirdLife.csv');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const csvText = await response.text();
            window.birdlifeAPI.loadCSV(csvText);
            if (statusEl) {
                statusEl.innerHTML = `<i class="fas fa-check-circle mr-1 text-green-700"></i> <strong>csv/BirdLife.csv</strong> loaded — ${window.birdlifeAPI.csvData.length} species.`;
                statusEl.className = 'text-base text-gray-700';
            }
        } catch (err) {
            if (statusEl) {
                statusEl.innerHTML = `<i class="fas fa-exclamation-triangle mr-1 text-red-600"></i> Could not load csv/BirdLife.csv: ${err.message}`;
                statusEl.className = 'text-base text-red-700';
            }
            progressModal.classList.add('hidden');
            return;
        }
    }

    const rlCategoryColors = {
        'EX': '#000000',
        'EW': '#542344',
        'CR': '#D81E05',
        'EN': '#FC7F3F',
        'VU': '#F9E79F',
        'NT': '#CCE2A3',
        'LC': '#78C679',
        'DD': '#D3D3D3',
        'NE': '#FFFFFF'
    };

    const trendColors = {
        'increasing': '#5FC65A',
        'stable': '#87CEEB',
        'decreasing': '#FA7070',
        'unknown': '#D1D1C7',
        '-': '#D1D1C7'
    };

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

    console.log(`BirdLife - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes
    const birdlifeTaxonomyOpt = document.getElementById('birdlifetaxonomyopt')?.checked ?? true;
    const birdlifeConservationOpt = document.getElementById('birdlifeconservationopt')?.checked ?? true;
    const birdlifeEcosystemOpt = document.getElementById('birdlifeecosystemopt')?.checked ?? true;
    const birdlifeMigrationOpt = document.getElementById('birdlifemigrationopt')?.checked ?? true;
    const birdlifePopulationOpt = document.getElementById('birdlifepopulationopt')?.checked ?? true;

    // Build table
    const _birdlifeTable = document.createElement('table');
    _birdlifeTable.id = 'BirdLifeTable';
    _birdlifeTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('BirdLifeTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy (mandatory)
    if (birdlifeTaxonomyOpt) {
        addHeader('Family');
    }

    // Always visible
    addHeader('Species Name');
    addHeader('Common Name');

    // Conservation (mandatory)
    if (birdlifeConservationOpt) {
        addHeader('RL Category');
        addHeader('PE');
        addHeader('PEW');
    }

    // Ecosystem (optional)
    if (birdlifeEcosystemOpt) {
        addHeader('Terrestrial');
        addHeader('Freshwater');
        addHeader('Marine');
        addHeader('Seabird');
        addHeader('Waterbird');
        addHeader('Landbird');
    }

    // Migration (optional)
    if (birdlifeMigrationOpt) {
        addHeader('Migratory Status');
    }

    // Population (optional)
    if (birdlifePopulationOpt) {
        addHeader('Population Size');
        addHeader('Population Trend');
        addHeader('Criteria');
    }

    _birdlifeTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _birdlifeTableBody = _birdlifeTable.createTBody();
    _birdlifeTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _birdlifeTableWrapper = document.createElement('div');
    _birdlifeTableWrapper.classList.add("w-full", "table-wrapper");
    _birdlifeTableWrapper.appendChild(_birdlifeTable);

    const birdlifeResults = document.getElementById('tabPanel-birdlife');
    birdlifeResults.appendChild(_birdlifeTableWrapper);

    try {
        const results = await window.birdlifeAPI.searchBatch(
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
                console.log(`BirdLife - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _birdlifeTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Taxonomy
            if (birdlifeTaxonomyOpt) {
                addCell(result.family || '-');
            }

            // Species Name and Common Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);
            addCell(result.commonName || '-');

            // Conservation
            if (birdlifeConservationOpt) {
                const rlCat = (result.rlCategory || '-').trim().toUpperCase();
                const catColor = rlCategoryColors[rlCat] || '#D1D1C7';
                const catCell = addCell(result.rlCategory || '-', "py-5 px-5 font-bold text-center");
                catCell.style.backgroundColor = catColor;
                catCell.style.color = ['#000000', '#542344', '#D81E05'].includes(catColor) ? 'white' : 'black';

                const peVal = result.pe || '-';
                const peColor = peVal === 'True' ? '#5FC65A' : peVal === 'False' ? '#FA7070' : '#D1D1C7';
                const peCell = addCell(peVal, "py-5 px-5 font-bold text-center");
                peCell.style.backgroundColor = peColor;

                const pewVal = result.pew || '-';
                const pewColor = pewVal === 'True' ? '#5FC65A' : pewVal === 'False' ? '#FA7070' : '#D1D1C7';
                const pewCell = addCell(pewVal, "py-5 px-5 font-bold text-center");
                pewCell.style.backgroundColor = pewColor;
            }

            // Ecosystem
            if (birdlifeEcosystemOpt) {
                const ecoFields = [
                    result.ecosystemTerrestrial,
                    result.ecosystemFreshwater,
                    result.ecosystemMarine,
                    result.seabird,
                    result.waterbird,
                    result.landbird
                ];
                for (const val of ecoFields) {
                    const v = val || '-';
                    const color = v === 'True' ? '#5FC65A' : v === 'False' ? '#FA7070' : '#D1D1C7';
                    const cell = addCell(v, "py-5 px-5 font-bold text-center");
                    cell.style.backgroundColor = color;
                }
            }

            // Migration
            if (birdlifeMigrationOpt) {
                addCell(result.migratoryStatus || '-');
            }

            // Population
            if (birdlifePopulationOpt) {
                addCell(result.populationSize || '-');

                const trendText = (result.populationTrend || '-').trim();
                const trendKey = trendText.toLowerCase();
                const trendColor = trendColors[trendKey] || '#D1D1C7';
                const trendCell = addCell(trendText, "py-5 px-5 font-bold");
                trendCell.style.backgroundColor = trendColor;

                addCell(result.criteriaMet || '-');
            }

            // Statistics
            if (result.scientificName && result.scientificName !== '-' && !result.error) {
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
                            <strong>Success:</strong> Successfully searched BirdLife CSV data.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found in the uploaded CSV
                        </p>
                    </div>
                </div>
            `;
            birdlifeResults.insertBefore(successNotice, _birdlifeTableWrapper);
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
                            <strong>Notice:</strong> ${errorCount} of ${results.length} lookups had issues.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                    </div>
                </div>
            `;
            birdlifeResults.insertBefore(errorNotice, _birdlifeTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="birdlife-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in BirdLife Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="birdlife-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="birdlife-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="birdlife-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="birdlife-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="birdlife-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        birdlifeResults.insertBefore(controlsContainer, _birdlifeTableWrapper);

        createColumnFilters('BirdLifeTable', 'birdlife-column-filters');

        const searchInput = document.getElementById('birdlife-table-search');
        const clearButton = document.getElementById('birdlife-search-clear');
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
                filterAndHighlightTable('BirdLifeTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('BirdLifeTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('BirdLifeTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('birdlife-export-excel').addEventListener('click', function () {
            exportTableToExcel('BirdLifeTable');
        });

        document.getElementById('birdlife-export-tsv').addEventListener('click', function () {
            exportTableToTSV('BirdLifeTable');
        });

        updateDataResults();

        console.log(`BirdLife search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during BirdLife search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.birdlifeAPI = new BirdLifeAPI();
    console.log('BirdLife API loaded and instance created successfully');
    window.BirdLifeAPI = BirdLifeAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BirdLifeAPI;
    }
}
