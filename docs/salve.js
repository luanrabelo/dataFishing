/**
 * ICMBio SALVE (Sistema de Avaliação do Risco de Extinção da Biodiversidade) API Integration
 * Uses the public search endpoint + fichaHtml detail sections from salve.icmbio.gov.br
 * CORS supported natively — no proxy needed
 */

class SalveAPI {
    constructor() {
        this.baseURL = 'https://salve.icmbio.gov.br/salve-api/public';
        this.maxRetries = 5;
        this.retryDelay = 2000;
        console.log('🇧🇷 SALVE API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Strip HTML tags from a string
     */
    stripHtml(html) {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').trim();
    }

    /**
     * Decode HTML entities
     */
    decodeHtmlEntities(text) {
        if (!text) return '';
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    /**
     * Clean text: strip HTML, decode entities, normalize whitespace
     */
    cleanText(text) {
        if (!text || typeof text !== 'string') return '';
        const stripped = this.stripHtml(this.decodeHtmlEntities(text));
        return stripped.replace(/\s+/g, ' ').trim();
    }

    /**
     * Fetch a SALVE API endpoint with retry logic
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
                    console.warn(`🇧🇷 SALVE - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Fetch a fichaHtml section for a given species card ID
     */
    async fetchFichaSection(fichaId, section) {
        try {
            const url = `${this.baseURL}/fichaHtml?idFicha=${fichaId}&section=${section}`;
            const response = await this.apiFetch(url);
            if (response && response.data && typeof response.data === 'object') {
                return response.data;
            }
            return null;
        } catch (e) {
            console.warn(`🇧🇷 SALVE - fetchFichaSection(${section}) error: ${e.message}`);
            return null;
        }
    }

    /**
     * Extract taxonomy tree from taxonomicClassification section
     * Maps Portuguese rank names to English
     */
    parseTaxonomyTree(tree) {
        const rankMap = {
            'Reino': 'kingdom',
            'Filo': 'phylum',
            'Classe': 'class',
            'Ordem': 'order',
            'Família': 'family'
        };

        const taxonomy = { kingdom: '-', phylum: '-', class: '-', order: '-', family: '-' };

        if (!Array.isArray(tree)) return taxonomy;

        for (const item of tree) {
            const rankName = this.cleanText(item.name);
            const englishKey = rankMap[rankName];
            if (englishKey) {
                taxonomy[englishKey] = this.cleanText(item.value) || '-';
            }
        }

        return taxonomy;
    }

    /**
     * Search for a species by name and fetch detail sections
     */
    async searchSpecies(speciesName, options = {}) {
        const url = `${this.baseURL}/search?q=${encodeURIComponent(speciesName.trim())}&paginationPageSize=10`;

        try {
            console.log(`🇧🇷 SALVE - ${speciesName} Fetching data...`);

            const data = await this.apiFetch(url);

            // Log raw API response
            console.log(`🇧🇷 SALVE - ${speciesName} Raw API response:`, data);

            if (data && data.data && data.data.length > 0) {
                    // Find best match
                    const nameLower = speciesName.toLowerCase().trim();
                    let record = data.data.find(r => {
                        const sci = this.cleanText(r.nm_cientifico_atual || r.nm_cientifico || '').toLowerCase();
                        return sci.startsWith(nameLower);
                    });

                    if (!record) {
                        record = data.data.find(r => !r.st_excluida) || data.data[0];
                    }

                    console.log(`🇧🇷 SALVE - ${speciesName} Matched record:`, record);

                    const scientificName = this.cleanText(record.nm_cientifico || '');
                    const currentName = this.cleanText(record.nm_cientifico_atual || '');
                    const previousName = this.cleanText(record.nm_cientifico_anterior || '');

                    const result = {
                        speciesName: speciesName,
                        scientificName: scientificName || '-',
                        currentScientificName: currentName || '-',
                        previousScientificName: previousName || '-',
                        authority: '',
                        commonNames: record.no_comum || '-',
                        categoryCode: record.cd_categoria_final || '-',
                        categoryFull: record.de_categoria_final_completa || '-',
                        taxonomicGroup: record.ds_grupo_salve || '-',
                        fichaId: record.id_ficha || '-',
                        excluded: record.st_excluida || false,
                        doi: '-',

                        // taxonomicClassification section
                        kingdom: '-', phylum: '-', class: '-', order: '-', family: '-', genus: '-',
                        oldNames: '-',
                        taxonomicNotes: '-',
                        morphologicalNotes: '-',

                        // population section
                        populationTrend: '-',
                        generationalTime: '-',
                        geneticCharacteristics: '-',
                        populationObservations: '-',

                        // header section
                        authorship: '-',
                        citation: '-',
                        justificative: '-',

                        // distribution section
                        statesFull: '-',
                        biomesFull: '-',
                        endemicOfBrazil: '-',
                        watersheds: '-',
                        globalDistribution: '-',
                        nationalDistribution: '-',

                        // naturalHistory section
                        naturalHistory: '-',
                        migratorySpecie: '-',

                        // uses section
                        uses: '-',

                        // threats section
                        threats: '-',

                        // conservation section
                        conservation: '-'
                    };

                    // Fetch detail sections in parallel if fichaId is available
                    if (result.fichaId && result.fichaId !== '-') {
                        const sectionPromises = [];

                        if (options.fetchTaxonomy) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'taxonomicClassification')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} taxonomicClassification:`, data);
                                            const taxonomy = this.parseTaxonomyTree(data.tree);
                                            result.kingdom = taxonomy.kingdom;
                                            result.phylum = taxonomy.phylum;
                                            result.class = taxonomy.class;
                                            result.order = taxonomy.order;
                                            result.family = taxonomy.family;
                                            
                                            // Extraemos o Gênero do Nome Científico ou da árvore se der
                                            if (result.scientificName !== '-') {
                                                result.genus = result.scientificName.split(' ')[0].replace(/<\/?i>/g, '').trim();
                                            }
                                            
                                            if (data.oldNames) result.oldNames = this.cleanText(Array.isArray(data.oldNames) ? data.oldNames.join(', ') : data.oldNames) || '-';
                                            if (data.commonNames && result.commonNames === '-') {
                                                result.commonNames = this.cleanText(Array.isArray(data.commonNames) ? data.commonNames.join(', ') : data.commonNames) || '-';
                                            }
                                            if (data.taxonomicNotes) result.taxonomicNotes = this.cleanText(data.taxonomicNotes) || '-';
                                            if (data.morphologicalNotes) result.morphologicalNotes = this.cleanText(data.morphologicalNotes) || '-';
                                        }
                                    })
                            );
                        }

                        if (options.fetchPopulation) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'population')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} population:`, data);
                                            result.populationTrend = this.cleanText(data.populationTrend) || '-';
                                            result.generationalTime = this.cleanText(data.generationalTime) || '-';
                                            result.geneticCharacteristics = this.cleanText(data.geneticCharacteristics) || '-';
                                            result.populationObservations = this.cleanText(data.populationObservations) || '-';
                                        }
                                    })
                            );
                        }

                        if (options.fetchHeader) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'header')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} header:`, data);
                                            result.authorship = this.cleanText(data.authorship) || '-';
                                            result.citation = this.cleanText(data.citation) || '-';
                                            result.justificative = this.cleanText(data.justificative) || '-';
                                            if (data.DOI) result.doi = data.DOI;
                                            // Extract authority from cientificName: <i>Name</i>&nbsp;<span>(Author)</span>
                                            if (data.cientificName) {
                                                const authorMatch = data.cientificName.match(/<span>\s*(.*?)\s*<\/span>/);
                                                if (authorMatch) {
                                                    result.authority = this.cleanText(authorMatch[1]) || '';
                                                }
                                            }
                                        }
                                    })
                            );
                        }

                        if (options.fetchDistribution) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'distribution')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} distribution:`, data);
                                            result.statesFull = this.cleanText(Array.isArray(data.states) ? data.states.join(', ') : data.states) || '-';
                                            result.biomesFull = this.cleanText(Array.isArray(data.biomes) ? data.biomes.join(', ') : data.biomes) || '-';
                                            result.endemicOfBrazil = this.cleanText(data.endemicOfBrazil) || '-';
                                            result.watersheds = this.cleanText(Array.isArray(data.watersheds) ? data.watersheds.join(', ') : data.watersheds) || '-';
                                            result.globalDistribution = this.cleanText(data.globalDistribution) || '-';
                                            result.nationalDistribution = this.cleanText(data.nationalDistribution) || '-';
                                        }
                                    })
                            );
                        }

                        if (options.fetchNaturalHistory) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'naturalHistory')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} naturalHistory:`, data);
                                            result.naturalHistory = this.cleanText(data.description || data.naturalHistory) || '-';
                                            result.migratorySpecie = this.cleanText(data.migratorySpecie) || '-';
                                        }
                                    })
                            );
                        }

                        if (options.fetchUses) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'uses')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} uses:`, data);
                                            if (data.description) {
                                                result.uses = this.cleanText(data.description) || '-';
                                            } else if (Array.isArray(data.table)) {
                                                const usesList = data.table.map(item => this.cleanText(item.description || item.name || '')).filter(u => u);
                                                result.uses = usesList.length > 0 ? usesList.join('; ') : '-';
                                            } else {
                                                result.uses = this.cleanText(data.uses) || '-';
                                            }
                                        }
                                    })
                            );
                        }

                        if (options.fetchThreats) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'threats')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} threats:`, data);
                                            const threatDetails = [];
                                            if (Array.isArray(data.table)) {
                                                for (const item of data.table) {
                                                    if (item.type && item.type.description) {
                                                        const typeDesc = this.cleanText(item.type.description);
                                                        const itemDesc = this.cleanText(item.description || '');
                                                        threatDetails.push(`${typeDesc}: ${itemDesc}`);
                                                    }
                                                }
                                            }
                                            result.threats = threatDetails.length > 0 ? threatDetails.join(' | ') : (this.cleanText(data.description) || '-');
                                        }
                                    })
                            );
                        }

                        if (options.fetchConservation) {
                            sectionPromises.push(
                                this.fetchFichaSection(result.fichaId, 'conservation')
                                    .then(data => {
                                        if (data) {
                                            console.log(`🇧🇷 SALVE - ${speciesName} conservation:`, data);
                                            result.conservation = this.cleanText(data.description) || '-';
                                        }
                                    })
                            );
                        }

                        await Promise.all(sectionPromises);
                    }

                    console.log(`🇧🇷 SALVE - ${speciesName} Successfully found: Category=${result.categoryCode}, Family=${result.family}, Trend=${result.populationTrend}`);
                    return result;
                } else {
                    console.warn(`🇧🇷 SALVE - ${speciesName} No results found`);
                    return this.createNotFoundResult(speciesName);
                }
            } catch (error) {
                console.error(`🇧🇷 SALVE - ${speciesName} All attempts failed: ${error.message}`);
                return this.createErrorResult(speciesName, error.message);
            }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            scientificName: '-', currentScientificName: '-', previousScientificName: '-',
            authority: '', doi: '-',
            commonNames: '-', categoryCode: '-', categoryFull: 'Not Found',
            taxonomicGroup: '-',
            fichaId: '-', excluded: false,

            kingdom: '-', phylum: '-', class: '-', order: '-', family: '-', genus: '-',
            oldNames: '-', taxonomicNotes: '-', morphologicalNotes: '-',

            populationTrend: '-', generationalTime: '-', geneticCharacteristics: '-', populationObservations: '-',

            authorship: '-', citation: '-', justificative: '-',

            statesFull: '-', biomesFull: '-', endemicOfBrazil: '-', watersheds: '-',
            globalDistribution: '-', nationalDistribution: '-',

            naturalHistory: '-', migratorySpecie: '-',

            uses: '-',
            threats: '-',
            conservation: '-'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        const result = this.createNotFoundResult(speciesName);
        result.categoryFull = 'Error';
        result.categoryCode = errorMessage;
        return result;
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`🇧🇷 SALVE - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`🇧🇷 SALVE - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                if (i < speciesList.length - 1) await this.delay(1000);

            } catch (error) {
                console.error(`🇧🇷 SALVE - Error processing ${species}:`, error);

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
 * Display SALVE modal details for long text fields
 * Supports: authorship, biomes, states, threats, conservation
 */
function showSalveDetail(index, field, title) {
    const result = window._salveResults && window._salveResults[index];
    if (!result) return showCellModal(title, '-');

    let text = result[field] || '-';

    // Old Names: display in italic (scientific names)
    if (field === 'oldNames') {
        ensureCellModal();
        document.getElementById('cellTextModalTitle').textContent = title;
        const body = document.getElementById('cellTextModalBody');
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        body.innerHTML = '<i>' + escaped + '</i>';
        const modal = document.getElementById('cellTextModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return;
    }

    // Natural History: don't convert ; to line breaks
    if (field === 'naturalHistory') {
        showCellModal(title, text, true);
        return;
    }

    showCellModal(title, text);
}

async function getSALVE(apiKey = 'salve') {
    console.log(`getSALVE called with apiKey: ${apiKey}`);

    if (typeof window.salveAPI === 'undefined' || !window.salveAPI) {
        if (typeof SalveAPI !== 'undefined') {
            window.salveAPI = new SalveAPI();
        } else {
            alert('Error: SALVE API is not loaded. Please reload the page.');
            return;
        }
    }

    const categoryColors = {
        'EX': '#000000', 'EW': '#542344', 'CR': '#D81E05', 'PE': '#D81E05',
        'EN': '#FC7F3F', 'VU': '#F9E79F', 'NT': '#CCE2A3',
        'LC': '#78C679', 'DD': '#D3D3D3', 'NE': '#FFFFFF',
        'Error': '#FA7070', 'Not Found': '#D1D1C7', '-': '#D1D1C7'
    };

    const trendColors = {
        'Declinando': '#FA7070', 'Declining': '#FA7070',
        'Estável': '#87CEEB', 'Stable': '#87CEEB',
        'Aumentando': '#5FC65A', 'Increasing': '#5FC65A',
        'Desconhecida': '#D1D1C7', 'Unknown': '#D1D1C7', '-': '#D1D1C7'
    };

    const progressModal = document.getElementById('progressModal');
    if (!progressModal) { console.error('Progress modal not found'); return; }
    progressModal.classList.remove('hidden');

    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n').filter(name => name.trim());

    if (speciesNames.length === 0) {
        alert('Please enter at least one species name.');
        progressModal.classList.add('hidden');
        return;
    }

    // Read optional field checkboxes
    const salveTaxoOpt = document.getElementById('salvetaxonomicclassificationopt')?.checked ?? false;
    const salveDistOpt = document.getElementById('salvedistributionopt')?.checked ?? false;
    const salveNatHistOpt = document.getElementById('salvenaturalhistoryopt')?.checked ?? false;
    const salvePopOpt = document.getElementById('salvepopulationopt')?.checked ?? false;
    const salveThreatsOpt = document.getElementById('salvethreatsopt')?.checked ?? false;
    const salveUsesOpt = document.getElementById('salveusesopt')?.checked ?? false;
    const salveConsOpt = document.getElementById('salveconservationopt')?.checked ?? false;
    const salveHeaderOpt = document.getElementById('salveheaderopt')?.checked ?? false;

    const fetchOptions = {
        fetchTaxonomy: salveTaxoOpt,
        fetchDistribution: salveDistOpt,
        fetchNaturalHistory: salveNatHistOpt,
        fetchPopulation: salvePopOpt,
        fetchThreats: salveThreatsOpt,
        fetchUses: salveUsesOpt,
        fetchConservation: salveConsOpt,
        fetchHeader: salveHeaderOpt
    };

    // Build table header dynamically
    const _salveTable = document.createElement('table');
    _salveTable.id = 'SalveTable';
    _salveTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('SalveTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy first (like IUCN)
    if (salveTaxoOpt) {
        addHeader('Kingdom');
        addHeader('Phylum');
        addHeader('Class');
        addHeader('Order');
        addHeader('Family');
        addHeader('Genus');
    }

    addHeader('Species Name');
    addHeader('Scientific Name');
    addHeader('Taxonomic Group');
    addHeader('Category');

    if (salveDistOpt) {
        addHeader('Endemic to Brazil');
    }

    if (salvePopOpt) {
        addHeader('Population Trend');
    }

    if (salveTaxoOpt) {
        addHeader('Common Names');
        addHeader('Old Names');
        addHeader('Taxonomic Notes');
        addHeader('Morphological Notes');
    }

    if (salveDistOpt) {
        addHeader('Global Distribution');
        addHeader('National Distribution');
        addHeader('States');
        addHeader('Biomes');
        addHeader('Watersheds');
    }

    if (salveNatHistOpt) {
        addHeader('Migratory Species');
        addHeader('Natural History');
    }

    if (salvePopOpt) {
        addHeader('Generational Time');
        addHeader('Genetic Characteristics');
        addHeader('Population Observations');
    }

    if (salveThreatsOpt) {
        addHeader('Threats');
    }

    if (salveUsesOpt) {
        addHeader('Uses');
    }

    if (salveConsOpt) {
        addHeader('Conservation');
    }

    if (salveHeaderOpt) {
        addHeader('Authorship');
        addHeader('Citation');
        addHeader('Justificative');
    }

    // Link column (no sort)
    headerCells += `<th scope="col" class="py-5 px-5">Link</th>`;

    _salveTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _salveTableBody = _salveTable.createTBody();
    _salveTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _salveTableWrapper = document.createElement('div');
    _salveTableWrapper.classList.add("w-full", "table-wrapper");
    _salveTableWrapper.appendChild(_salveTable);

    const salveResults = document.getElementById('tabPanel-salve');
    salveResults.appendChild(_salveTableWrapper);

    try {
        const results = await window.salveAPI.searchBatch(
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
                console.log(`🇧🇷 SALVE - Completed ${current}/${total}: ${result.speciesName} (${result.categoryFull})`);
            },
            fetchOptions
        );

        let successCount = 0;
        let errorCount = 0;

        // Store results globally for modal access
        window._salveResults = results;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const row = _salveTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const viewBtn = (field, title) =>
                `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showSalveDetail(${i}, '${field}', '${title}')"><i class="fa-solid fa-eye mr-2"></i>View</button>`;

            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                // For cells with View buttons, store actual data for Excel/TSV export
                if (typeof html === 'string') {
                    const btnMatch = html.match(/showSalveDetail\(\d+,\s*'(\w+)'/);
                    if (btnMatch) {
                        const fieldName = btnMatch[1];
                        cell.dataset.exportValue = result[fieldName] || '-';
                    }
                }
                return cell;
            };

            // Taxonomy first (like IUCN)
            if (salveTaxoOpt) {
                addCell(result.kingdom);
                addCell(result.phylum);
                addCell(result.class);
                addCell(result.order);
                addCell(result.family);
                addCell(`<i>${result.genus}</i>`);
            }

            // Species Name & Scientific Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);

            // Scientific Name: species name in italic, author in normal text
            const sciName = result.currentScientificName || result.scientificName || '-';
            const parenIdx = sciName.indexOf('(');
            if (parenIdx > 0) {
                const namePart = sciName.substring(0, parenIdx).trim();
                const authorPart = sciName.substring(parenIdx);
                addCell(`<i>${namePart}</i> ${authorPart}`);
            } else {
                addCell(`<i>${sciName}</i>`);
            }

            addCell(result.taxonomicGroup);

            // Category with color
            const catCode = result.categoryCode;
            const catColor = categoryColors[catCode] || '#D1D1C7';
            const catCell = addCell(result.categoryFull || '-', "py-5 px-5 font-bold");
            catCell.style.backgroundColor = catColor;
            catCell.style.color = ['#000000', '#542344', '#D81E05'].includes(catColor) ? 'white' : 'black';

            if (salveDistOpt) {
                addCell(result.endemicOfBrazil, "py-5 px-5 text-center");
            }

            if (salvePopOpt) {
                const trendText = result.populationTrend || '-';
                const trendColor = trendColors[trendText] || '#D1D1C7';
                const trendCell = addCell(trendText, "py-5 px-5 font-bold text-center");
                trendCell.style.backgroundColor = trendColor;
            }

            if (salveTaxoOpt) {
                addCell(result.commonNames && result.commonNames !== '-'
                    ? viewBtn('commonNames', 'Common Names') : '-', "py-5 px-5 text-center");
                addCell(result.oldNames && result.oldNames !== '-'
                    ? viewBtn('oldNames', 'Old Names') : '-', "py-5 px-5 text-center");
                addCell(result.taxonomicNotes && result.taxonomicNotes !== '-'
                    ? viewBtn('taxonomicNotes', 'Taxonomic Notes') : '-', "py-5 px-5 text-center");
                addCell(result.morphologicalNotes && result.morphologicalNotes !== '-'
                    ? viewBtn('morphologicalNotes', 'Morphological Notes') : '-', "py-5 px-5 text-center");
            }

            if (salveDistOpt) {
                addCell(result.globalDistribution && result.globalDistribution !== '-'
                    ? viewBtn('globalDistribution', 'Global Distribution') : '-', "py-5 px-5 text-center");
                addCell(result.nationalDistribution && result.nationalDistribution !== '-'
                    ? viewBtn('nationalDistribution', 'National Distribution') : '-', "py-5 px-5 text-center");
                addCell(result.statesFull && result.statesFull !== '-'
                    ? viewBtn('statesFull', 'States') : '-', "py-5 px-5 text-center");
                addCell(result.biomesFull && result.biomesFull !== '-'
                    ? viewBtn('biomesFull', 'Biomes') : '-', "py-5 px-5 text-center");
                addCell(result.watersheds && result.watersheds !== '-'
                    ? viewBtn('watersheds', 'Watersheds') : '-', "py-5 px-5 text-center");
            }

            if (salveNatHistOpt) {
                addCell(result.migratorySpecie, "py-5 px-5 text-center");
                addCell(result.naturalHistory && result.naturalHistory !== '-'
                    ? viewBtn('naturalHistory', 'Natural History') : '-', "py-5 px-5 text-center");
            }

            if (salvePopOpt) {
                addCell(result.generationalTime, "py-5 px-5 text-center");

                addCell(result.geneticCharacteristics && result.geneticCharacteristics !== '-'
                    ? viewBtn('geneticCharacteristics', 'Genetic Characteristics') : '-', "py-5 px-5 text-center");
                addCell(result.populationObservations && result.populationObservations !== '-'
                    ? viewBtn('populationObservations', 'Population Observations') : '-', "py-5 px-5 text-center");
            }

            if (salveThreatsOpt) {
                addCell(result.threats && result.threats !== '-'
                    ? viewBtn('threats', 'Threats') : '-', "py-5 px-5 text-center");
            }

            if (salveUsesOpt) {
                addCell(result.uses && result.uses !== '-'
                    ? viewBtn('uses', 'Uses') : '-', "py-5 px-5 text-center");
            }

            if (salveConsOpt) {
                addCell(result.conservation && result.conservation !== '-'
                    ? viewBtn('conservation', 'Conservation Actions') : '-', "py-5 px-5 text-center");
            }

            if (salveHeaderOpt) {
                addCell(result.authorship && result.authorship !== '-'
                    ? viewBtn('authorship', 'Authorship') : '-', "py-5 px-5 text-center");
                addCell(result.citation && result.citation !== '-'
                    ? viewBtn('citation', 'Citation') : '-', "py-5 px-5 text-center");
                addCell(result.justificative && result.justificative !== '-'
                    ? viewBtn('justificative', 'Justificative') : '-', "py-5 px-5 text-center");
            }

            // Link to SALVE ficha
            const linkCell = addCell('-', "py-5 px-5 text-center");
            const salveLink = result.doi && result.doi !== '-'
                ? `https://doi.org/${result.doi}`
                : '';
            if (salveLink) {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
                       href="${salveLink}"
                       target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                        View
                    </a>
                `;
            }

            if (result.categoryFull !== 'Not Found' && result.categoryFull !== 'Error') {
                successCount++;
            } else if (result.categoryFull === 'Error') {
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
                            <strong>Success:</strong> Successfully accessed ICMBio SALVE database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            salveResults.insertBefore(successNotice, _salveTableWrapper);
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
            salveResults.insertBefore(errorNotice, _salveTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="salve-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in ICMBio SALVE Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="salve-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="salve-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <div id="salve-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="salve-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="salve-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
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

        salveResults.insertBefore(controlsContainer, _salveTableWrapper);

        createColumnFilters('SalveTable', 'salve-column-filters');

        const searchInput = document.getElementById('salve-table-search');
        const clearButton = document.getElementById('salve-search-clear');
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
                filterAndHighlightTable('SalveTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('SalveTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('SalveTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('salve-export-excel').addEventListener('click', function () {
            exportTableToExcel('SalveTable');
        });

        document.getElementById('salve-export-tsv').addEventListener('click', function () {
            exportTableToTSV('SalveTable');
        });

        updateDataResults();

        console.log(`🇧🇷 SALVE search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during SALVE search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.salveAPI = new SalveAPI();
    console.log('🇧🇷 SALVE API loaded and instance created successfully');
    window.SalveAPI = SalveAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SalveAPI;
    }
}
