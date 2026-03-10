/**
 * speciesLink (CRIA) API Integration
 * Uses the speciesLink API v1.0 at specieslink.net/ws/1.0
 * CORS supported natively — no proxy needed
 * API key required as URL parameter
 */

class SpeciesLinkAPI {
    constructor() {
        this.baseURL = 'https://specieslink.net/ws/1.0';
        this.apiKey = '';
        this.maxRetries = 5;
        this.retryDelay = 2000;
        console.log('speciesLink API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Fetch a speciesLink API endpoint with retry logic
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
                    console.warn(`speciesLink - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the speciesLink API
     * Properties in the GeoJSON response are all lowercase (e.g. yearcollected, collectioncode)
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`speciesLink - ${speciesName} Fetching data...`);

            const url = `${this.baseURL}/search?scientificname=${encodeURIComponent(speciesName.trim())}&apikey=${encodeURIComponent(this.apiKey)}&limit=100&offset=0`;
            const data = await this.apiFetch(url);

            console.log(`speciesLink - ${speciesName} RAW API RESPONSE:`, JSON.parse(JSON.stringify(data)));

            // Parse GeoJSON FeatureCollection — properties are all lowercase
            let records = [];
            if (data && data.features && Array.isArray(data.features)) {
                records = data.features.map(f => f.properties || f);
            } else if (data && data.result && Array.isArray(data.result)) {
                records = data.result;
            } else if (data && Array.isArray(data)) {
                records = data;
            }

            if (records.length === 0) {
                console.warn(`speciesLink - ${speciesName} No results found`);
                return this.createNotFoundResult(speciesName);
            }

            // Aggregation variables
            const collectionSet = new Set();
            const institutionSet = new Set();
            const countrySet = new Set();
            const stateSet = new Set();
            const basisSet = new Set();
            let earliestYear = Infinity;
            let latestYear = -Infinity;
            let typeSpecimenCount = 0;

            // Taxonomy from first record with non-empty values
            let kingdom = '-', phylum = '-', taxClass = '-', order = '-', family = '-', authorship = '-';

            for (const record of records) {
                // All GeoJSON property names are lowercase
                const collCode = record.collectioncode || '';
                const instCode = record.institutioncode || '';
                const year = parseInt(record.yearcollected || '');

                if (collCode) collectionSet.add(collCode);
                if (instCode) institutionSet.add(instCode);
                if (!isNaN(year) && year > 1700) {
                    if (year < earliestYear) earliestYear = year;
                    if (year > latestYear) latestYear = year;
                }

                // Taxonomy — use first non-empty value across sample records
                if (kingdom === '-' && record.kingdom) kingdom = record.kingdom;
                if (phylum === '-' && record.phylum) phylum = record.phylum;
                if (taxClass === '-' && record.class) taxClass = record.class;
                if (order === '-' && record.order) order = record.order;
                if (family === '-' && record.family) family = record.family;
                if (authorship === '-' && record.scientificnameauthorship) authorship = record.scientificnameauthorship;

                // Geography
                if (record.country) countrySet.add(record.country);
                if (record.stateprovince) stateSet.add(record.stateprovince);

                // Basis of record types
                if (record.basisofrecord) basisSet.add(record.basisofrecord);

                // Type specimens
                if (record.typestatus && String(record.typestatus).trim()) typeSpecimenCount++;
            }

            // Use numberMatched from GeoJSON response metadata for total count
            const totalRecords = data.numberMatched || data.totalRecords || data.total_records || records.length;

            const result = {
                speciesName: speciesName,
                occurrenceCount: String(totalRecords),
                kingdom: kingdom,
                phylum: phylum,
                class: taxClass,
                order: order,
                family: family,
                authorship: authorship,
                collections: collectionSet.size > 0 ? Array.from(collectionSet).join('; ') : '-',
                institutions: institutionSet.size > 0 ? Array.from(institutionSet).join('; ') : '-',
                firstRecord: earliestYear !== Infinity ? String(earliestYear) : '-',
                lastRecord: latestYear !== -Infinity ? String(latestYear) : '-',
                countries: countrySet.size > 0 ? Array.from(countrySet).join('; ') : '-',
                states: stateSet.size > 0 ? Array.from(stateSet).join('; ') : '-',
                basisOfRecord: basisSet.size > 0 ? Array.from(basisSet).join('; ') : '-',
                typeSpecimenCount: String(typeSpecimenCount),
                rawRecords: records  // Store raw records for map visualization
            };

            console.log(`speciesLink - ${speciesName} Successfully found: ${result.occurrenceCount} occurrences, Family=${result.family}`);
            return result;

        } catch (error) {
            console.error(`speciesLink - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            occurrenceCount: '0',
            kingdom: '-', phylum: '-', class: '-', order: '-', family: '-',
            authorship: '-',
            collections: '-',
            institutions: '-',
            firstRecord: '-',
            lastRecord: '-',
            countries: '-',
            states: '-',
            basisOfRecord: '-',
            typeSpecimenCount: '0',
            rawRecords: []
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

        console.log(`speciesLink - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`speciesLink - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(1500);
                }

            } catch (error) {
                console.error(`speciesLink - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

/**
 * Display SpeciesLink modal details for aggregated data
 * Supports: collections, institutions, countries, states
 */
function showSpeciesLinkDetail(index, field, title) {
    const result = window._speciesLinkResults && window._speciesLinkResults[index];
    if (!result) return showCellModal(title, '-');

    let text = result[field] || '-';

    // Display as-is, showCellModal handles formatting
    showCellModal(title, text);
}

/**
 * Display occurrence data in a simple table format
 * Shows specimen collection points with coordinates
 */
function showOccurrencesMap(index, title) {
    console.log(`speciesLink - showOccurrencesMap called with index=${index}`);

    const result = window._speciesLinkResults && window._speciesLinkResults[index];
    if (!result || !result.rawRecords || result.rawRecords.length === 0) {
        console.warn(`speciesLink - No raw records found for index ${index}`);
        return showCellModal(title, 'No occurrence data available');
    }

    // Aggregate coordinates and collect specimen info
    const coordinateMap = new Map();  // Key: "lng,lat", Value: {lng, lat, count, records}

    for (const record of result.rawRecords) {
        const lng = parseFloat(record.decimallongitude);
        const lat = parseFloat(record.decimallatitude);

        // Filter: exclude [0,0], NaN, and unrealistic values
        if (lng === 0 && lat === 0) continue;
        if (isNaN(lng) || isNaN(lat)) continue;
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) continue;

        const key = `${lng.toFixed(4)},${lat.toFixed(4)}`;
        if (!coordinateMap.has(key)) {
            coordinateMap.set(key, { lng, lat, count: 0, records: [] });
        }
        coordinateMap.get(key).count += 1;
        coordinateMap.get(key).records.push(record);
    }

    const aggregatedPoints = Array.from(coordinateMap.values());
    console.log(`speciesLink - Aggregated ${aggregatedPoints.length} unique locations from ${result.rawRecords.length} total records`);

    if (aggregatedPoints.length === 0) {
        console.warn(`speciesLink - No valid coordinates after filtering`);
        return showCellModal(title, 'No valid coordinates available');
    }

    try {
        // Ensure cell modal exists
        ensureCellModal();
        console.log(`speciesLink - Modal ensured`);

        const body = document.getElementById('cellTextModalBody');
        const titleEl = document.getElementById('cellTextModalTitle');

        if (!body || !titleEl) {
            console.error('speciesLink - Modal elements not found');
            return;
        }

        titleEl.textContent = title;

        // Create container
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.padding = '0';

        // Add count summary
        const summary = document.createElement('div');
        summary.style.padding = '10px';
        summary.style.textAlign = 'center';
        summary.style.fontSize = '14px';
        summary.style.backgroundColor = '#e8f5e9';
        summary.style.borderBottom = '1px solid #4caf50';
        summary.innerHTML = `<strong>${aggregatedPoints.length} unique collection locations | ${result.rawRecords.length} total records</strong>`;
        container.appendChild(summary);

        // Create table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';

        // Create header
        const thead = document.createElement('thead');
        thead.style.backgroundColor = '#1f2937';
        thead.style.color = 'white';
        const headerRow = document.createElement('tr');

        const headers = ['Species', 'Latitude', 'Longitude', 'Specimens'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.style.padding = '10px';
            th.style.textAlign = 'left';
            th.style.borderBottom = '2px solid #4caf50';
            th.style.fontWeight = 'bold';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        aggregatedPoints.forEach((point, idx) => {
            const row = document.createElement('tr');
            row.style.backgroundColor = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
            row.style.borderBottom = '1px solid #e5e7eb';

            // Species name cell
            const specCell = document.createElement('td');
            specCell.textContent = result.speciesName;
            specCell.style.padding = '10px';
            specCell.style.fontStyle = 'italic';
            row.appendChild(specCell);

            // Latitude cell
            const latCell = document.createElement('td');
            latCell.textContent = point.lat.toFixed(6);
            latCell.style.padding = '10px';
            latCell.style.fontFamily = 'monospace';
            row.appendChild(latCell);

            // Longitude cell
            const lngCell = document.createElement('td');
            lngCell.textContent = point.lng.toFixed(6);
            lngCell.style.padding = '10px';
            lngCell.style.fontFamily = 'monospace';
            row.appendChild(lngCell);

            // Specimen count cell
            const countCell = document.createElement('td');
            countCell.textContent = point.count;
            countCell.style.padding = '10px';
            countCell.style.textAlign = 'center';
            row.appendChild(countCell);

            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        container.appendChild(table);
        body.innerHTML = '';
        body.appendChild(container);
        body.style.overflow = 'auto';
        body.style.maxHeight = '500px';

        console.log(`speciesLink - Table created with ${aggregatedPoints.length} rows`);

    } catch (error) {
        console.error(`speciesLink - Error in showOccurrencesMap: ${error.message}`, error);
        return showCellModal(title, `Error: ${error.message}`);
    }

    const modal = document.getElementById('cellTextModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log(`speciesLink - Modal displayed`);
}

async function getSpeciesLink(apiKey = 'specieslink') {
    console.log(`getSpeciesLink called with apiKey: ${apiKey}`);

    if (typeof window.specieslinkAPI === 'undefined' || !window.specieslinkAPI) {
        if (typeof SpeciesLinkAPI !== 'undefined') {
            window.specieslinkAPI = new SpeciesLinkAPI();
        } else {
            alert('Error: speciesLink API is not loaded. Please reload the page.');
            return;
        }
    }

    // Read API key from UI
    const apiKeyInput = document.getElementById('specieslinkApiKey');
    if (!apiKeyInput || !apiKeyInput.value.trim()) {
        alert('Please enter your speciesLink API Key in the speciesLink configuration section.');
        return;
    }
    window.specieslinkAPI.setApiKey(apiKeyInput.value.trim());

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

    console.log(`speciesLink - Starting search for ${speciesNames.length} species...`);

    // Read optional field checkboxes (all now mandatory for speciesLink)
    const specieslinkOccurrencesOpt = document.getElementById('specieslinkoccurrencesopt')?.checked ?? true;
    const specieslinkClassificationOpt = document.getElementById('specieslinkclassificationopt')?.checked ?? true;
    const specieslinkAuthorshipOpt = document.getElementById('specieslinkauthorshipopt')?.checked ?? true;
    const specieslinkCollectionOpt = document.getElementById('specieslinkcollectionmetadataopt')?.checked ?? true;
    const specieslinkGeographyOpt = document.getElementById('specieslinkgeographyopt')?.checked ?? true;
    const specieslinkBasisOpt = document.getElementById('specieslinkbasisofrecordopt')?.checked ?? true;
    const specieslinkTypestatusOpt = document.getElementById('specieslinkspecimensopt')?.checked ?? true;

    // Build table
    const _specieslinkTable = document.createElement('table');
    _specieslinkTable.id = 'SpeciesLinkTable';
    _specieslinkTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('SpeciesLinkTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Classification columns (optional)
    if (specieslinkClassificationOpt) {
        addHeader('Kingdom');
        addHeader('Phylum');
        addHeader('Class');
        addHeader('Order');
        addHeader('Family');
    }

    addHeader('Species Name');

    // Authorship (optional)
    if (specieslinkAuthorshipOpt) {
        addHeader('Authorship');
    }

    // Occurrence count (mandatory)
    if (specieslinkOccurrencesOpt) {
        addHeader('Occurrences');
    }

    // Collection metadata (optional)
    if (specieslinkCollectionOpt) {
        addHeader('Collections');
        addHeader('Institutions');
        addHeader('First Record');
        addHeader('Last Record');
    }

    // Geography (optional)
    if (specieslinkGeographyOpt) {
        addHeader('Countries');
        addHeader('States/Provinces');
    }

    // Basis of record (optional)
    if (specieslinkBasisOpt) {
        addHeader('Basis of Record');
    }

    // Type status (optional)
    if (specieslinkTypestatusOpt) {
        addHeader('Type Specimens');
        addHeader('Occurrence Map');
    }

    _specieslinkTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _specieslinkTableBody = _specieslinkTable.createTBody();
    _specieslinkTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _specieslinkTableWrapper = document.createElement('div');
    _specieslinkTableWrapper.classList.add("w-full", "table-wrapper");
    _specieslinkTableWrapper.appendChild(_specieslinkTable);

    const specieslinkResults = document.getElementById('tabPanel-specieslink');
    specieslinkResults.appendChild(_specieslinkTableWrapper);

    try {
        const results = await window.specieslinkAPI.searchBatch(
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
                console.log(`speciesLink - Completed ${current}/${total}: ${result.speciesName}`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        // Store results globally for modal access
        window._speciesLinkResults = results;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const row = _specieslinkTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                return cell;
            };

            // Classification
            if (specieslinkClassificationOpt) {
                addCell(result.kingdom || '-');
                addCell(result.phylum || '-');
                addCell(result.class || '-');
                addCell(result.order || '-');
                addCell(result.family || '-');
            }

            addCell(`<i>${result.speciesName}</i>`);

            // Authorship
            if (specieslinkAuthorshipOpt) {
                addCell(result.authorship || '-');
            }

            // Occurrences
            if (specieslinkOccurrencesOpt) {
                addCell(result.occurrenceCount || '0');
            }

            // Collection metadata
            if (specieslinkCollectionOpt) {
                addCell(
                    result.collections && result.collections !== '-'
                        ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showSpeciesLinkDetail(${i}, 'collections', 'Collections')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                        : '-',
                    "py-5 px-5 text-center"
                );
                addCell(
                    result.institutions && result.institutions !== '-'
                        ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showSpeciesLinkDetail(${i}, 'institutions', 'Institutions')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                        : '-',
                    "py-5 px-5 text-center"
                );
                addCell(result.firstRecord || '-');
                addCell(result.lastRecord || '-');
            }

            // Geography
            if (specieslinkGeographyOpt) {
                addCell(
                    result.countries && result.countries !== '-'
                        ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showSpeciesLinkDetail(${i}, 'countries', 'Countries')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                        : '-',
                    "py-5 px-5 text-center"
                );
                addCell(
                    result.states && result.states !== '-'
                        ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showSpeciesLinkDetail(${i}, 'states', 'States/Provinces')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                        : '-',
                    "py-5 px-5 text-center"
                );
            }

            // Basis of record
            if (specieslinkBasisOpt) {
                addCell(result.basisOfRecord || '-');
            }

            // Type specimens
            if (specieslinkTypestatusOpt) {
                addCell(result.typeSpecimenCount || '0');
                addCell(
                    result.rawRecords && result.rawRecords.length > 0
                        ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showOccurrencesMap(${i}, 'Occurrence Map')"><i class="fa-solid fa-map mr-2"></i>Map</button>`
                        : '-',
                    "py-5 px-5 text-center"
                );
            }

            // Statistics
            if (parseInt(result.occurrenceCount) > 0) {
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
                            <strong>Success:</strong> Successfully accessed speciesLink (CRIA) database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found with occurrence data
                        </p>
                    </div>
                </div>
            `;
            specieslinkResults.insertBefore(successNotice, _specieslinkTableWrapper);
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
            specieslinkResults.insertBefore(errorNotice, _specieslinkTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="specieslink-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in speciesLink Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="specieslink-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="specieslink-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="specieslink-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="specieslink-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="specieslink-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        specieslinkResults.insertBefore(controlsContainer, _specieslinkTableWrapper);

        createColumnFilters('SpeciesLinkTable', 'specieslink-column-filters');

        const searchInput = document.getElementById('specieslink-table-search');
        const clearButton = document.getElementById('specieslink-search-clear');
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
                filterAndHighlightTable('SpeciesLinkTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('SpeciesLinkTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('SpeciesLinkTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('specieslink-export-excel').addEventListener('click', function () {
            exportTableToExcel('SpeciesLinkTable');
        });

        document.getElementById('specieslink-export-tsv').addEventListener('click', function () {
            exportTableToTSV('SpeciesLinkTable');
        });

        updateDataResults();

        console.log(`speciesLink search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during speciesLink search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.specieslinkAPI = new SpeciesLinkAPI();
    console.log('speciesLink API loaded and instance created successfully');
    window.SpeciesLinkAPI = SpeciesLinkAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SpeciesLinkAPI;
    }
}
