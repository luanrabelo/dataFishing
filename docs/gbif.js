/**
 * GBIF (Global Biodiversity Information Facility) API Integration
 * Enhanced with additional endpoints for vernacular names, occurrences, and distributions
 */

class GbifAPI {
    constructor() {
        this.baseURL = 'https://api.gbif.org/v1';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('🌍 GBIF API instance created');
    }

    /**
     * Use the /species/match endpoint for better species name matching
     */
    async matchSpecies(speciesName) {
        const url = `${this.baseURL}/species/match?name=${encodeURIComponent(speciesName)}&verbose=true`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return response.json();
    }

    /**
     * Fetch full species details by usageKey
     */
    async fetchSpeciesDetail(key) {
        try {
            const url = `${this.baseURL}/species/${key}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) return null;
            return response.json();
        } catch (e) {
            console.warn(`🌍 GBIF - fetchSpeciesDetail error: ${e.message}`);
            return null;
        }
    }

    /**
     * Fetch vernacular (common) names for a species key
     */
    async fetchVernacularNames(key) {
        try {
            const url = `${this.baseURL}/species/${key}/vernacularNames?limit=20`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) return '-';
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                // Deduplicate and prioritize English names
                const seen = new Set();
                const names = [];
                // English first
                for (const r of data.results) {
                    if (r.vernacularName && r.language === 'eng' && !seen.has(r.vernacularName.toLowerCase())) {
                        seen.add(r.vernacularName.toLowerCase());
                        names.push(r.vernacularName);
                    }
                }
                // Then other languages
                for (const r of data.results) {
                    if (r.vernacularName && !seen.has(r.vernacularName.toLowerCase())) {
                        seen.add(r.vernacularName.toLowerCase());
                        names.push(r.vernacularName);
                    }
                }
                return names.slice(0, 10).join('; ') || '-';
            }
            return '-';
        } catch (e) {
            console.warn(`🌍 GBIF - fetchVernacularNames error: ${e.message}`);
            return '-';
        }
    }

    /**
     * Fetch occurrence count for a taxon key
     */
    async fetchOccurrenceCount(key) {
        try {
            const url = `${this.baseURL}/occurrence/count?taxonKey=${key}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) return '-';
            const count = await response.json();
            return typeof count === 'number' ? count.toLocaleString() : '-';
        } catch (e) {
            console.warn(`🌍 GBIF - fetchOccurrenceCount error: ${e.message}`);
            return '-';
        }
    }

    /**
     * Fetch distributions for a species key
     */
    async fetchDistributions(key) {
        try {
            const url = `${this.baseURL}/species/${key}/distributions?limit=50`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) return '-';
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const seen = new Set();
                const locations = [];
                for (const d of data.results) {
                    const loc = d.locality || d.country || d.area || '';
                    if (loc && !seen.has(loc.toLowerCase())) {
                        seen.add(loc.toLowerCase());
                        locations.push(loc);
                    }
                }
                return locations.join('; ') || '-';
            }
            return '-';
        } catch (e) {
            console.warn(`🌍 GBIF - fetchDistributions error: ${e.message}`);
            return '-';
        }
    }

    /**
     * Fetch descriptions for a species key
     */
    async fetchDescriptions(key) {
        try {
            const url = `${this.baseURL}/species/${key}/descriptions?limit=5`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) return '-';
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                // Get the first non-empty description, prefer English
                let desc = data.results.find(d => d.description && d.language === 'eng');
                if (!desc) desc = data.results.find(d => d.description);
                if (desc && desc.description) {
                    // Strip HTML tags and truncate
                    const text = desc.description.replace(/<[^>]*>/g, '').trim();
                    return text.length > 300 ? text.substring(0, 300) + '...' : text;
                }
            }
            return '-';
        } catch (e) {
            console.warn(`🌍 GBIF - fetchDescriptions error: ${e.message}`);
            return '-';
        }
    }

    async searchSpecies(speciesName, options = {}) {
        const url = `${this.baseURL}/species?name=${encodeURIComponent(speciesName)}`;

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
                        let acceptedRecord = data.results.find(record => record.taxonomicStatus === 'ACCEPTED');
                        const record = acceptedRecord || data.results[0];

                        const result = {
                            speciesName: speciesName,
                            key: record.key || '-',
                            nubKey: record.nubKey || record.key || '-',
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
                            publishedIn: record.publishedIn || '-',
                            synonym: record.synonym || false,
                            confidence: record.confidence || '-',
                            matchType: record.matchType || '-',
                            vernacularNames: '-',
                            occurrenceCount: '-',
                            distributions: '-',
                            descriptions: '-'
                        };

                        // Fetch additional data in parallel if options enabled and key is valid
                        if (result.key !== '-') {
                            const extraPromises = [];

                            if (options.vernacularNames) {
                                extraPromises.push(
                                    this.fetchVernacularNames(result.key)
                                        .then(v => { result.vernacularNames = v; })
                                );
                            }
                            if (options.occurrences) {
                                extraPromises.push(
                                    this.fetchOccurrenceCount(result.key)
                                        .then(c => { result.occurrenceCount = c; })
                                );
                            }
                            if (options.distributions) {
                                extraPromises.push(
                                    this.fetchDistributions(result.key)
                                        .then(d => { result.distributions = d; })
                                );
                            }
                            if (options.descriptions) {
                                extraPromises.push(
                                    this.fetchDescriptions(result.key)
                                        .then(d => { result.descriptions = d; })
                                );
                            }

                            // Fetch publishedIn from detail endpoint if not in search results
                            if (result.publishedIn === '-') {
                                extraPromises.push(
                                    this.fetchSpeciesDetail(result.key)
                                        .then(detail => {
                                            if (detail) {
                                                if (detail.publishedIn) result.publishedIn = detail.publishedIn;
                                                if (!result.authorship || result.authorship === '-') {
                                                    result.authorship = detail.authorship || '-';
                                                }
                                            }
                                        })
                                );
                            }

                            if (extraPromises.length > 0) {
                                await Promise.all(extraPromises);
                            }
                        }

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
            nubKey: '-',
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
            publishedIn: '-',
            synonym: false,
            confidence: '-',
            matchType: '-',
            vernacularNames: '-',
            occurrenceCount: '-',
            distributions: '-',
            descriptions: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        return {
            speciesName: speciesName,
            key: '-',
            nubKey: '-',
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
            publishedIn: '-',
            synonym: false,
            confidence: '-',
            matchType: errorMessage,
            vernacularNames: '-',
            occurrenceCount: '-',
            distributions: '-',
            descriptions: '-'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`🌍 GBIF - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`🌍 GBIF - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }

                if (i < speciesList.length - 1) {
                    await this.delay(1000);
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

    if (typeof window.gbifAPI === 'undefined' || !window.gbifAPI) {
        if (typeof GbifAPI !== 'undefined') {
            window.gbifAPI = new GbifAPI();
        } else {
            alert('Error: GBIF API is not loaded. Please reload the page.');
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

    // Read optional field checkboxes
    const gbifOccurrencesOpt = document.getElementById('gbifoccurrencesopt')?.checked ?? false;
    const gbifDistributionsOpt = document.getElementById('gbifdistributionsopt')?.checked ?? false;
    const gbifDescriptionsOpt = document.getElementById('gbifdescriptionsopt')?.checked ?? false;

    const fetchOptions = {
        vernacularNames: true,  // always fetch (mandatory field)
        occurrences: gbifOccurrencesOpt,
        distributions: gbifDistributionsOpt,
        descriptions: gbifDescriptionsOpt
    };

    // Build table header dynamically based on selected options
    const _gbifTable = document.createElement('table');
    _gbifTable.id = 'GbifTable';
    _gbifTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('GbifTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    addHeader('Key');
    addHeader('Kingdom');
    addHeader('Phylum');
    addHeader('Class');
    addHeader('Order');
    addHeader('Family');
    addHeader('Genus');
    addHeader('Species Name');
    addHeader('Scientific Name');
    addHeader('Canonical Name');
    addHeader('Authorship');
    addHeader('Published In');
    addHeader('Taxonomic Status');
    addHeader('Vernacular Names');
    if (gbifOccurrencesOpt) addHeader('Occurrences');
    if (gbifDistributionsOpt) addHeader('Distributions');
    if (gbifDescriptionsOpt) addHeader('Descriptions');
    // Link column (no sort)
    headerCells += `<th scope="col" class="py-5 px-5">Link</th>`;

    _gbifTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true" style="position: sticky; z-index: 20;">
        <tr>${headerCells}</tr>
    </thead>`;

    const _gbifTableBody = _gbifTable.createTBody();
    _gbifTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _gbifTableWrapper = document.createElement('div');
    _gbifTableWrapper.classList.add("w-full", "table-wrapper");
    _gbifTableWrapper.appendChild(_gbifTable);

    const gbifResults = document.getElementById('tabPanel-gbif');
    gbifResults.appendChild(_gbifTableWrapper);

    try {
        const results = await window.gbifAPI.searchBatch(
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
                console.log(`🌍 GBIF - Completed ${current}/${total}: ${result.speciesName} (${result.taxonomicStatus})`);
            },
            fetchOptions
        );

        let successCount = 0;
        let errorCount = 0;

        // Store results globally for modal access
        window._gbifResults = results;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const row = _gbifTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            addCell(result.key);
            addCell(result.kingdom);
            addCell(result.phylum);
            addCell(result.class);
            addCell(result.order);
            addCell(result.family);
            addCell(`<i>${result.genus}</i>`);
            addCell(`<i>${result.speciesName}</i>`);

            // Scientific Name: species name italic, author normal
            const fullSci = result.scientificName || '-';
            const canon = result.canonicalName || '';
            if (canon && canon !== '-' && fullSci.startsWith(canon)) {
                const authorPart = fullSci.substring(canon.length).trim();
                addCell(`<i>${canon}</i>${authorPart ? ' ' + authorPart : ''}`);
            } else {
                const parenIdx = fullSci.indexOf('(');
                if (parenIdx > 0) {
                    const namePart = fullSci.substring(0, parenIdx).trim();
                    const authorPart = fullSci.substring(parenIdx);
                    addCell(`<i>${namePart}</i> ${authorPart}`);
                } else {
                    addCell(`<i>${fullSci}</i>`);
                }
            }

            addCell(`<i>${result.canonicalName}</i>`);
            addCell(result.authorship);

            // Published In - View button
            const viewBtn = (field, title) =>
                `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showGbifDetail(${i}, '${field}', '${title}')"><i class="fa-solid fa-eye mr-2"></i>View</button>`;

            const piCell = addCell(result.publishedIn && result.publishedIn !== '-'
                ? viewBtn('publishedIn', 'Published In') : '-', "py-5 px-5 text-center");
            if (result.publishedIn && result.publishedIn !== '-') piCell.dataset.exportValue = result.publishedIn;

            // Taxonomic Status with color
            const statusColorMap = {
                'ACCEPTED': '#BACD92',
                'SYNONYM': '#FFE066',
                'DOUBTFUL': '#FFE066',
                'Error': '#FA7070'
            };
            const statusCell = addCell(result.taxonomicStatus, "py-5 px-5 font-bold");
            statusCell.style.backgroundColor = statusColorMap[result.taxonomicStatus] || '#D1D1C7';

            // Vernacular Names - View button
            const vnCell = addCell(result.vernacularNames && result.vernacularNames !== '-'
                ? viewBtn('vernacularNames', 'Vernacular Names') : '-', "py-5 px-5 text-center");
            if (result.vernacularNames && result.vernacularNames !== '-') vnCell.dataset.exportValue = result.vernacularNames;

            if (gbifOccurrencesOpt) addCell(result.occurrenceCount || '-', "py-5 px-5 text-center");
            if (gbifDistributionsOpt) {
                const distCell = addCell(result.distributions && result.distributions !== '-'
                    ? viewBtn('distributions', 'Distributions') : '-', "py-5 px-5 text-center");
                if (result.distributions && result.distributions !== '-') distCell.dataset.exportValue = result.distributions;
            }
            if (gbifDescriptionsOpt) {
                const descCell = addCell(result.descriptions && result.descriptions !== '-'
                    ? viewBtn('descriptions', 'Descriptions') : '-', "py-5 px-5 text-center");
                if (result.descriptions && result.descriptions !== '-') descCell.dataset.exportValue = result.descriptions;
            }

            // Link
            const linkCell = addCell('-', "py-5 px-5");
            if (result.key !== '-') {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
                       href="https://www.gbif.org/species/${result.key}"
                       target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                        View
                    </a>
                `;
            }

            if (result.taxonomicStatus === 'ACCEPTED' || result.taxonomicStatus === 'SYNONYM') {
                successCount++;
            } else if (result.taxonomicStatus === 'Error') {
                errorCount++;
            }
        }

        // Status notice
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

        // Controls (search, column filters, export)
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
                <div id="gbif-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
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

        gbifResults.insertBefore(controlsContainer, _gbifTableWrapper);

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
        console.error('Error during GBIF search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

/**
 * Display GBIF modal details for long text fields
 */
function showGbifDetail(index, field, title) {
    const result = window._gbifResults && window._gbifResults[index];
    if (!result) return showCellModal(title, '-');
    const text = result[field] || '-';
    showCellModal(title, text);
}

// Create global instance
if (typeof window !== 'undefined') {
    window.gbifAPI = new GbifAPI();
    console.log('🌍 GBIF API loaded and instance created successfully');
    window.GbifAPI = GbifAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GbifAPI;
    }
}
