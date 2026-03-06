/**
 * NCBI (National Center for Biotechnology Information) API Integration
 * Uses NCBI E-Utilities REST API for taxonomy data and genomic record counts
 */

/**
 * Build a clickable NCBI URL for a given database and query
 */
function buildNcbiUrl(db, query) {
    const dbPaths = {
        'nucleotide': 'nuccore',
        'assembly': 'assembly',
        'sra': 'sra',
        'popset': 'popset',
        'snp': 'snp'
    };
    return `https://www.ncbi.nlm.nih.gov/${dbPaths[db] || db}/?term=${encodeURIComponent(query)}`;
}

class NcbiAPI {
    constructor() {
        this.esearchURL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
        this.efetchURL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
        this.maxRetries = 5;
        this.retryDelay = 2000;
        this.email = '';
        this.apiKey = '';
        console.log('NCBI API instance created');
    }

    setEmail(email) {
        this.email = email;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    getRateDelay() {
        return this.apiKey ? 250 : 500;
    }

    buildParams(params) {
        const allParams = { ...params };
        if (this.email) allParams.tool = 'dataFishing';
        if (this.email) allParams.email = this.email;
        if (this.apiKey) allParams.api_key = this.apiKey;
        return new URLSearchParams(allParams).toString();
    }

    async searchSpecies(speciesName) {
        // Step 1: esearch to get TaxID
        const searchParams = this.buildParams({
            db: 'taxonomy',
            term: speciesName,
            retmode: 'json',
            retmax: '1'
        });

        const searchUrl = `${this.esearchURL}?${searchParams}`;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                console.log(`NCBI - ${speciesName} Attempting esearch (attempt ${attempt + 1}/${this.maxRetries})...`);

                const searchResponse = await fetch(searchUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (!searchResponse.ok) {
                    throw new Error(`HTTP ${searchResponse.status}: ${searchResponse.statusText}`);
                }

                const searchData = await searchResponse.json();
                const idList = searchData?.esearchresult?.idlist;

                if (!idList || idList.length === 0) {
                    console.warn(`NCBI - ${speciesName} No results found`);
                    return this.createNotFoundResult(speciesName);
                }

                const taxId = idList[0];
                console.log(`NCBI - ${speciesName} Found TaxID: ${taxId}`);

                // Rate limiting between esearch and efetch
                await this.delay(this.getRateDelay());

                // Step 2: efetch to get full taxonomy
                const fetchParams = this.buildParams({
                    db: 'taxonomy',
                    id: taxId,
                    retmode: 'xml'
                });

                const fetchUrl = `${this.efetchURL}?${fetchParams}`;
                const fetchResponse = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/xml' }
                });

                if (!fetchResponse.ok) {
                    throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
                }

                const xmlText = await fetchResponse.text();
                const result = this.parseXmlTaxonomy(xmlText, speciesName, taxId);

                console.log(`NCBI - ${speciesName} Successfully found: TaxID=${result.taxId}, Kingdom=${result.kingdom}, Family=${result.family}`);
                return result;

            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`NCBI - ${speciesName} Request failed: ${error.message}. Retrying in ${this.retryDelay}ms... (Attempt ${attempt + 1}/${this.maxRetries})`);
                    await this.delay(this.retryDelay);
                } else {
                    console.error(`NCBI - ${speciesName} All attempts failed: ${error.message}`);
                    return this.createErrorResult(speciesName, error.message);
                }
            }
        }
    }

    parseXmlTaxonomy(xmlText, speciesName, taxId) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');

        const result = {
            speciesName: speciesName,
            taxId: taxId || '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            scientificName: '-',
            division: '-',
            lineage: '-',
            status: 'Found'
        };

        const taxon = doc.querySelector('Taxon');
        if (!taxon) return result;

        const sciName = taxon.querySelector(':scope > ScientificName');
        if (sciName) result.scientificName = sciName.textContent || '-';

        const divisionEl = taxon.querySelector(':scope > Division');
        if (divisionEl) result.division = divisionEl.textContent || '-';

        const lineageEl = taxon.querySelector(':scope > Lineage');
        if (lineageEl) result.lineage = lineageEl.textContent || '-';

        // Parse LineageEx for taxonomy ranks
        const lineageItems = taxon.querySelectorAll('LineageEx > Taxon');
        lineageItems.forEach(item => {
            const itemRank = item.querySelector('Rank')?.textContent?.toLowerCase() || '';
            const itemName = item.querySelector('ScientificName')?.textContent || '';

            if (itemRank === 'kingdom') result.kingdom = itemName;
            else if (itemRank === 'phylum') result.phylum = itemName;
            else if (itemRank === 'class') result.class = itemName;
            else if (itemRank === 'order') result.order = itemName;
            else if (itemRank === 'family') result.family = itemName;
            else if (itemRank === 'genus') result.genus = itemName;
        });

        return result;
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            taxId: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            scientificName: '-',
            division: '-',
            lineage: '-',
            status: 'Not Found'
        };
    }

    createErrorResult(speciesName, errorMessage) {
        return {
            speciesName: speciesName,
            taxId: '-',
            kingdom: '-',
            phylum: '-',
            class: '-',
            order: '-',
            family: '-',
            genus: speciesName.split(' ')[0] || '-',
            scientificName: '-',
            division: '-',
            lineage: '-',
            status: 'Error'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Count records in an NCBI database using esearch with rettype=count
     * Uses POST to handle long query strings (e.g., gene synonym queries)
     */
    async countRecords(db, term) {
        const params = {
            db: db,
            term: term,
            rettype: 'count',
            retmode: 'json'
        };
        if (this.email) { params.tool = 'dataFishing'; params.email = this.email; }
        if (this.apiKey) params.api_key = this.apiKey;

        const body = new URLSearchParams(params).toString();

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(this.esearchURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return parseInt(data?.esearchresult?.count || '0', 10);
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    await this.delay(this.retryDelay);
                } else {
                    console.error(`countRecords failed for db=${db}: ${error.message}`);
                    return '-';
                }
            }
        }
    }

    // --- Query builders ---

    buildMitoGenomeQuery(speciesName) {
        return `"${speciesName}"[Organism] AND mitochondrion[Filter] AND ("complete genome"[Title] OR "complete mitochondrial"[Title])`;
    }

    buildNuclearGenomeQuery(speciesName, level) {
        return `"${speciesName}"[Organism] AND "${level}"[Assembly Level]`;
    }

    buildTranscriptomeQuery(speciesName) {
        return `"${speciesName}"[Organism] AND "rna seq"[Strategy]`;
    }

    buildPopSetQuery(speciesName) {
        return `"${speciesName}"[Organism]`;
    }

    buildSnpQuery(speciesName) {
        return `"${speciesName}"[Organism]`;
    }

    buildGeneQuery(speciesName, geneName, synonyms) {
        const parts = synonyms.map(s => `"${s}"[Title]`);
        parts.push(`"${geneName}"[Gene Name]`);
        return `"${speciesName}"[Organism] AND (${parts.join(' OR ')})`;
    }

    /**
     * Build a shorter gene query for web links (avoids "Quoted phrase not found" error)
     * The full synonym query is used for counting via POST, but the web URL uses this shorter version
     */
    buildGeneWebQuery(speciesName, geneName) {
        return `"${speciesName}"[Organism] AND "${geneName}"[Gene Name]`;
    }

    /**
     * Calculate the number of API calls needed per species
     */
    calculateCallsPerSpecies(options) {
        let calls = 2; // esearch + efetch for taxonomy
        if (options.mitoGenomes) calls += 1;
        if (options.nuclearGenomes) calls += 3; // 3 assembly levels (Scaffold, Contig, Chromosome)
        if (options.transcriptomes) calls += 1;
        if (options.popSet) calls += 1;
        if (options.snp) calls += 1;
        if (options.selectedMitoGenes) calls += options.selectedMitoGenes.length;
        if (options.selectedChloroGenes) calls += options.selectedChloroGenes.length;
        return calls;
    }

    /**
     * Search for genomic data (genomes, transcriptomes, gene counts) for a species
     * Returns data with queries for building clickable links
     */
    async searchGenomicData(speciesName, options, onCallComplete) {
        const data = {};
        const queries = {};

        if (options.mitoGenomes) {
            const query = this.buildMitoGenomeQuery(speciesName);
            queries.mitoGenomes = { db: 'nucleotide', query: query };
            data.mitoGenomes = await this.countRecords('nucleotide', query);
            console.log(`NCBI - ${speciesName} Mitochondrial Genome: ${data.mitoGenomes}`);
            if (onCallComplete) onCallComplete();
            await this.delay(this.getRateDelay());
        }

        if (options.nuclearGenomes) {
            const levels = ['Scaffold', 'Contig', 'Chromosome'];
            data.nuclearGenomes = {};
            queries.nuclearGenomes = {};
            for (const level of levels) {
                const query = this.buildNuclearGenomeQuery(speciesName, level);
                queries.nuclearGenomes[level] = { db: 'assembly', query: query };
                data.nuclearGenomes[level] = await this.countRecords('assembly', query);
                console.log(`NCBI - ${speciesName} Genome (${level}): ${data.nuclearGenomes[level]}`);
                if (onCallComplete) onCallComplete();
                await this.delay(this.getRateDelay());
            }
        }

        if (options.transcriptomes) {
            const query = this.buildTranscriptomeQuery(speciesName);
            queries.transcriptomes = { db: 'sra', query: query };
            data.transcriptomes = await this.countRecords('sra', query);
            console.log(`NCBI - ${speciesName} Transcriptomes: ${data.transcriptomes}`);
            if (onCallComplete) onCallComplete();
            await this.delay(this.getRateDelay());
        }

        if (options.popSet) {
            const query = this.buildPopSetQuery(speciesName);
            queries.popSet = { db: 'popset', query: query };
            data.popSet = await this.countRecords('popset', query);
            console.log(`NCBI - ${speciesName} PopSet: ${data.popSet}`);
            if (onCallComplete) onCallComplete();
            await this.delay(this.getRateDelay());
        }

        if (options.snp) {
            const query = this.buildSnpQuery(speciesName);
            queries.snp = { db: 'snp', query: query };
            data.snp = await this.countRecords('snp', query);
            console.log(`NCBI - ${speciesName} SNP: ${data.snp}`);
            if (onCallComplete) onCallComplete();
            await this.delay(this.getRateDelay());
        }

        if (options.selectedMitoGenes && options.selectedMitoGenes.length > 0 && typeof MitochondrialGenes !== 'undefined') {
            data.mitoGenes = {};
            queries.mitoGenes = {};
            for (const gene of options.selectedMitoGenes) {
                const synonyms = MitochondrialGenes[gene] || [];
                if (synonyms.length === 0) continue;
                const query = this.buildGeneQuery(speciesName, gene, synonyms);
                const webQuery = this.buildGeneWebQuery(speciesName, gene);
                queries.mitoGenes[gene] = { db: 'nucleotide', query: query, webQuery: webQuery };
                data.mitoGenes[gene] = await this.countRecords('nucleotide', query);
                console.log(`NCBI - ${speciesName} Mito Gene ${gene}: ${data.mitoGenes[gene]}`);
                if (onCallComplete) onCallComplete();
                await this.delay(this.getRateDelay());
            }
        }

        if (options.selectedChloroGenes && options.selectedChloroGenes.length > 0 && typeof ChloroplastGenes !== 'undefined') {
            data.chloroGenes = {};
            queries.chloroGenes = {};
            for (const gene of options.selectedChloroGenes) {
                const synonyms = ChloroplastGenes[gene] || [];
                if (synonyms.length === 0) continue;
                const query = this.buildGeneQuery(speciesName, gene, synonyms);
                const webQuery = this.buildGeneWebQuery(speciesName, gene);
                queries.chloroGenes[gene] = { db: 'nucleotide', query: query, webQuery: webQuery };
                data.chloroGenes[gene] = await this.countRecords('nucleotide', query);
                console.log(`NCBI - ${speciesName} Chloro Gene ${gene}: ${data.chloroGenes[gene]}`);
                if (onCallComplete) onCallComplete();
                await this.delay(this.getRateDelay());
            }
        }

        data.queries = queries;
        return data;
    }

    async searchBatch(speciesList, options, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;
        const callsPerSpecies = this.calculateCallsPerSpecies(options);
        const totalCalls = total * callsPerSpecies;
        let completedCalls = 0;

        console.log(`NCBI - Starting search for ${total} species (${callsPerSpecies} API calls per species, ${totalCalls} total)...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`NCBI - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species);
                completedCalls += 2; // esearch + efetch for taxonomy
                if (onProgress) onProgress(completedCalls, totalCalls);

                // Genomic data (if any optional fields selected)
                const hasOptionalFields = options.mitoGenomes || options.nuclearGenomes ||
                    options.transcriptomes || options.popSet || options.snp ||
                    (options.selectedMitoGenes && options.selectedMitoGenes.length > 0) ||
                    (options.selectedChloroGenes && options.selectedChloroGenes.length > 0);

                if (hasOptionalFields) {
                    await this.delay(this.getRateDelay());
                    const genomicData = await this.searchGenomicData(species, options, () => {
                        completedCalls++;
                        if (onProgress) onProgress(completedCalls, totalCalls);
                    });
                    result.genomicData = genomicData;
                }

                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                // Rate limiting between species
                if (i < speciesList.length - 1) {
                    await this.delay(this.getRateDelay());
                }

            } catch (error) {
                console.error(`NCBI - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) {
                    onSpeciesComplete(errorResult, i + 1, total);
                }

                completedCalls = (i + 1) * callsPerSpecies;
                if (onProgress) {
                    onProgress(completedCalls, totalCalls);
                }
            }
        }

        return results;
    }
}

async function getNcbi(apiKey = 'ncbi') {
    console.log(`getNcbi called with apiKey: ${apiKey}`);

    if (typeof window.ncbiAPI === 'undefined' || !window.ncbiAPI) {
        if (typeof NcbiAPI !== 'undefined') {
            window.ncbiAPI = new NcbiAPI();
        } else {
            alert('Error: NCBI API is not loaded. Please reload the page.');
            return;
        }
    }

    // Get email and API key from form fields
    const emailInput = document.getElementById('ncbiEmail');
    const apiKeyInput = document.getElementById('ncbiApiKey');

    if (emailInput && emailInput.value.trim()) {
        window.ncbiAPI.setEmail(emailInput.value.trim());
    } else {
        alert('NCBI requires an email address. Please enter your email in the NCBI configuration section.');
        return;
    }

    if (apiKeyInput && apiKeyInput.value.trim()) {
        window.ncbiAPI.setApiKey(apiKeyInput.value.trim());
    }

    // Check which optional fields are selected (individual checkboxes)
    const wantMitoGenomes = document.getElementById('ncbimitochondrialgenomeopt')?.checked || false;
    const wantNuclearGenomes = document.getElementById('ncbinucleargenomesopt')?.checked || false;
    const wantTranscriptomes = document.getElementById('ncbitranscriptomesopt')?.checked || false;
    const wantPopSet = document.getElementById('ncbipopsetopt')?.checked || false;
    const wantSnp = document.getElementById('ncbisnpopt')?.checked || false;

    // Check individual mitochondrial genes
    const selectedMitoGenes = [];
    const mitoGeneIds = {
        'COI': 'ncbicoiopt',
        'CYTB': 'ncbicytbopt',
        '16S': 'ncbi16sopt',
        '12S': 'ncbi12sopt',
        'COII': 'ncbicoiiopt',
        'ND2': 'ncbind2opt',
        'CR': 'ncbicropt'
    };
    for (const [gene, elemId] of Object.entries(mitoGeneIds)) {
        if (document.getElementById(elemId)?.checked) {
            selectedMitoGenes.push(gene);
        }
    }

    // Check individual chloroplast genes
    const selectedChloroGenes = [];
    const chloroGeneIds = {
        'matK': 'ncbimatkopt',
        'rbcL': 'ncbirbclopt'
    };
    for (const [gene, elemId] of Object.entries(chloroGeneIds)) {
        if (document.getElementById(elemId)?.checked) {
            selectedChloroGenes.push(gene);
        }
    }

    const options = {
        mitoGenomes: wantMitoGenomes,
        nuclearGenomes: wantNuclearGenomes,
        transcriptomes: wantTranscriptomes,
        popSet: wantPopSet,
        snp: wantSnp,
        selectedMitoGenes: selectedMitoGenes,
        selectedChloroGenes: selectedChloroGenes
    };

    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (!progressModal) {
        console.error('Progress modal not found');
        return;
    }

    progressModal.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    const speciesNames = document.getElementById('speciesNames').value.split('\n').filter(name => name.trim());

    if (speciesNames.length === 0) {
        alert('Please enter at least one species name.');
        progressModal.classList.add('hidden');
        return;
    }

    console.log(`NCBI - Starting search for ${speciesNames.length} species...`);

    const tableId = 'NcbiTable';

    // Build dynamic column definitions (no Rank, no Link)
    const columns = [
        { name: 'Taxon ID', key: 'taxId' },
        { name: 'Kingdom', key: 'kingdom' },
        { name: 'Phylum', key: 'phylum' },
        { name: 'Class', key: 'class' },
        { name: 'Order', key: 'order' },
        { name: 'Family', key: 'family' },
        { name: 'Genus', key: 'genus' },
        { name: 'Species Name', key: 'speciesName' },
        { name: 'Scientific Name', key: 'scientificName' },
        { name: 'Division', key: 'division' }
    ];

    if (wantMitoGenomes) {
        columns.push({ name: 'Mitochondrial Genome', key: 'mitoGenomes' });
    }
    if (wantNuclearGenomes) {
        columns.push({ name: 'Genome (Scaffold)', key: 'nuclearScaffold' });
        columns.push({ name: 'Genome (Contig)', key: 'nuclearContig' });
        columns.push({ name: 'Genome (Chromosome)', key: 'nuclearChromosome' });
    }
    if (wantTranscriptomes) {
        columns.push({ name: 'Transcriptomes', key: 'transcriptomes' });
    }
    if (wantPopSet) {
        columns.push({ name: 'PopSet', key: 'popSet' });
    }
    if (wantSnp) {
        columns.push({ name: 'SNP', key: 'snp' });
    }
    // Individual mitochondrial genes
    for (const gene of selectedMitoGenes) {
        columns.push({ name: gene, key: `mitoGene_${gene}` });
    }
    // Individual chloroplast genes
    for (const gene of selectedChloroGenes) {
        columns.push({ name: gene, key: `chloroGene_${gene}` });
    }

    // Build table
    const _ncbiTable = document.createElement('table');
    _ncbiTable.id = tableId;
    _ncbiTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    // Build header dynamically with sticky positioning at page level
    let headerHTML = `<thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true" style="position: sticky; z-index: 20;"><tr>`;
    columns.forEach((col, idx) => {
        headerHTML += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('${tableId}', ${idx})">${col.name} <i class="fas fa-sort ml-2"></i></th>`;
    });
    headerHTML += '</tr></thead>';
    _ncbiTable.innerHTML = headerHTML;

    const _ncbiTableBody = _ncbiTable.createTBody();
    _ncbiTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _ncbiTableWrapper = document.createElement('div');
    _ncbiTableWrapper.classList.add("w-full", "table-wrapper");
    _ncbiTableWrapper.appendChild(_ncbiTable);

    // Target the tab panel if tabs exist, otherwise use Results div
    const ncbiPanel = document.getElementById('tabPanel-ncbi');
    const ncbiResults = ncbiPanel || document.getElementById('Results');
    ncbiResults.innerHTML = '';
    ncbiResults.appendChild(_ncbiTableWrapper);

    try {
        const results = await window.ncbiAPI.searchBatch(
            speciesNames,
            options,
            (current, total) => {
                const progress = (current / total) * 100;

                // Update per-API progress bar only (not main progress bar)
                const apiProgressBar = document.getElementById(`progressBar-${apiKey}`);
                const apiProgressText = document.getElementById(`progressText-${apiKey}`);
                if (apiProgressBar) apiProgressBar.style.width = progress + '%';
                if (apiProgressText) apiProgressText.textContent = Math.round(progress) + '%';

                // Also update global progress tracker
                if (typeof window.globalProgressTracker !== 'undefined') {
                    window.globalProgressTracker.updateApiProgress(apiKey, progress);
                }
            },
            (result, current, total) => {
                console.log(`NCBI - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
            }
        );

        console.log(`NCBI search completed. Processing ${results.length} results...`);

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _ncbiTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            const gd = result.genomicData || {};
            const gq = gd.queries || {};

            for (const col of columns) {
                const cell = row.insertCell();
                cell.className = "py-5 px-5";

                switch (col.key) {
                    case 'taxId':
                        cell.innerHTML = result.taxId;
                        break;
                    case 'kingdom':
                        cell.innerHTML = result.kingdom;
                        break;
                    case 'phylum':
                        cell.innerHTML = result.phylum;
                        break;
                    case 'class':
                        cell.innerHTML = result.class;
                        break;
                    case 'order':
                        cell.innerHTML = result.order;
                        break;
                    case 'family':
                        cell.innerHTML = result.family;
                        break;
                    case 'genus':
                        cell.innerHTML = `<i>${result.genus}</i>`;
                        break;
                    case 'speciesName':
                        cell.innerHTML = `<i>${result.speciesName}</i>`;
                        break;
                    case 'scientificName':
                        cell.innerHTML = `<i>${result.scientificName}</i>`;
                        break;
                    case 'division':
                        cell.innerHTML = result.division;
                        break;
                    case 'mitoGenomes': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.mitoGenomes;
                        if (val !== undefined && val !== '-') {
                            const q = gq.mitoGenomes;
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    case 'nuclearScaffold': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.nuclearGenomes?.['Scaffold'];
                        if (val !== undefined && val !== '-') {
                            const q = gq.nuclearGenomes?.['Scaffold'];
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    case 'nuclearContig': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.nuclearGenomes?.['Contig'];
                        if (val !== undefined && val !== '-') {
                            const q = gq.nuclearGenomes?.['Contig'];
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    case 'nuclearChromosome': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.nuclearGenomes?.['Chromosome'];
                        if (val !== undefined && val !== '-') {
                            const q = gq.nuclearGenomes?.['Chromosome'];
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    case 'transcriptomes': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.transcriptomes;
                        if (val !== undefined && val !== '-') {
                            const q = gq.transcriptomes;
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    case 'popSet': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.popSet;
                        if (val !== undefined && val !== '-') {
                            const q = gq.popSet;
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    case 'snp': {
                        cell.className = "py-5 px-5 text-center";
                        const val = gd.snp;
                        if (val !== undefined && val !== '-') {
                            const q = gq.snp;
                            if (q) {
                                const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                            } else {
                                cell.innerHTML = val;
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                    }
                    default:
                        // Handle gene columns
                        if (col.key.startsWith('mitoGene_')) {
                            cell.className = "py-5 px-5 text-center";
                            const gene = col.key.replace('mitoGene_', '');
                            const val = gd.mitoGenes?.[gene];
                            if (val !== undefined && val !== '-') {
                                const q = gq.mitoGenes?.[gene];
                                if (q) {
                                    const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                    cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                                } else {
                                    cell.innerHTML = val;
                                }
                            } else {
                                cell.innerHTML = '-';
                            }
                        } else if (col.key.startsWith('chloroGene_')) {
                            cell.className = "py-5 px-5 text-center";
                            const gene = col.key.replace('chloroGene_', '');
                            const val = gd.chloroGenes?.[gene];
                            if (val !== undefined && val !== '-') {
                                const q = gq.chloroGenes?.[gene];
                                if (q) {
                                    const url = buildNcbiUrl(q.db, q.webQuery || q.query);
                                    cell.innerHTML = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline font-semibold" title="Click to view results on NCBI">${val}</a>`;
                                } else {
                                    cell.innerHTML = val;
                                }
                            } else {
                                cell.innerHTML = '-';
                            }
                        } else {
                            cell.innerHTML = '-';
                        }
                        break;
                }
            }

            if (result.status === 'Found') {
                successCount++;
            } else if (result.status === 'Error') {
                errorCount++;
            }
        }

        // Success/error notice
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
                            <strong>Success:</strong> Successfully accessed NCBI database.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            ncbiResults.insertBefore(successNotice, _ncbiTableWrapper);
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
            ncbiResults.insertBefore(errorNotice, _ncbiTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="ncbi-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in NCBI Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="ncbi-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="ncbi-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
                            <i class="fas fa-times text-gray-400 hover:text-gray-600 text-lg"></i>
                        </div>
                    </div>
                    <small class="text-gray-600 mt-2 block">
                        <i class="fas fa-info-circle mr-1"></i>
                        This search will filter and highlight results in the visible columns selected below.
                    </small>
                </div>
            </div>
            <div class="px-4 py-4">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-columns mr-2"></i>Toggle Column Visibility
                </h4>
                <div id="ncbi-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="ncbi-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="ncbi-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>
                        Export to TSV
                    </button>
                </div>
                <p class="text-base text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results.
                </p>
                <p class="text-base text-gray-600 mt-2">
                    <i class="fas fa-external-link-alt mr-1"></i>
                    Click on any number in the genomic/gene columns to view the corresponding results directly on the NCBI website.
                </p>
            </div>
        `;

        ncbiResults.insertBefore(controlsContainer, _ncbiTableWrapper);

        // Setup controls
        createColumnFilters(tableId, 'ncbi-column-filters');

        const searchInput = document.getElementById('ncbi-table-search');
        const clearButton = document.getElementById('ncbi-search-clear');
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
                filterAndHighlightTable(tableId, searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable(tableId, '');
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable(tableId, '');
            }
        });

        document.getElementById('ncbi-export-excel').addEventListener('click', function () {
            exportTableToExcel(tableId);
        });

        document.getElementById('ncbi-export-tsv').addEventListener('click', function () {
            exportTableToTSV(tableId);
        });

        updateDataResults();

        // Initialize Tippy.js tooltips on new NCBI table elements
        if (typeof tippy !== 'undefined') {
            tippy('#' + tableId + ' [title]', {
                placement: 'top',
                arrow: true,
                animation: 'fade',
                duration: [200, 150],
                delay: [200, 0],
                theme: 'light-border',
                onShow(instance) {
                    const title = instance.reference.getAttribute('title');
                    if (title) {
                        instance.setContent(title);
                        instance.reference.removeAttribute('title');
                        instance.reference.dataset.tippyContent = title;
                    }
                }
            });
        }

        console.log(`NCBI search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during NCBI search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.ncbiAPI = new NcbiAPI();
    console.log('NCBI API loaded and instance created successfully');
    window.NcbiAPI = NcbiAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NcbiAPI;
    }
}
