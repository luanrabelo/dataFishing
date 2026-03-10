/**
 * BHL (Biodiversity Heritage Library) API Integration
 * Uses the BHL API v3 at biodiversitylibrary.org/api3
 * API key required as URL parameter
 */

class BhlAPI {
    constructor() {
        this.baseURL = 'https://www.biodiversitylibrary.org/api3';
        this.apiKey = '';
        this.maxRetries = 5;
        this.retryDelay = 2000;
        console.log('BHL API instance created');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Fetch a BHL API endpoint with retry logic
     */
    async apiFetch(endpoint) {
        const url = `${this.baseURL}${endpoint}&apikey=${encodeURIComponent(this.apiKey)}&format=json`;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return await response.json();
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`BHL - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using the BHL API
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`BHL - ${speciesName} Fetching data...`);

            const data = await this.apiFetch(`?op=GetNameMetadata&name=${encodeURIComponent(speciesName.trim())}`);

            console.log(`BHL - ${speciesName} Raw API response:`, data);

            if (!data || data.Status !== 'ok' || !data.Result || data.Result.length === 0) {
                console.warn(`BHL - ${speciesName} No results found`);
                return this.createNotFoundResult(speciesName);
            }

            const nameResult = data.Result[0];
            const titles = nameResult.Titles || [];

            // Build complete publications list (no limit)
            let publicationsList = '-';
            if (titles.length > 0) {
                const pubEntries = titles.map(t => {
                    const shortTitle = t.ShortTitle || t.FullTitle || 'Unknown Title';
                    const year = t.PublicationDate || '';
                    return year ? `${shortTitle} (${year})` : shortTitle;
                });
                publicationsList = pubEntries.join('; ');
            }

            const result = {
                speciesName: speciesName,
                nameFound: nameResult.NameFound || nameResult.NameConfirmed || '-',
                publicationsCount: String(titles.length),
                publicationsList: publicationsList,
                titlesData: titles,
                pageCitationsCount: '-',
                literatureLinks: '-'
            };

            // Count page citations across all titles
            let totalPages = 0;
            const linkSet = new Set();
            for (const title of titles) {
                if (title.Items && Array.isArray(title.Items)) {
                    for (const item of title.Items) {
                        if (item.Pages && Array.isArray(item.Pages)) {
                            totalPages += item.Pages.length;
                        }
                        if (item.ItemUrl) {
                            linkSet.add(item.ItemUrl);
                        }
                    }
                }
            }
            result.pageCitationsCount = String(totalPages);

            if (linkSet.size > 0) {
                const linksArr = Array.from(linkSet);
                result.literatureLinks = linksArr.join('; ');
            }

            console.log(`BHL - ${speciesName} Successfully found: ${titles.length} publications, ${totalPages} page citations`);
            return result;

        } catch (error) {
            console.error(`BHL - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    createNotFoundResult(speciesName) {
        return {
            speciesName: speciesName,
            nameFound: '-',
            publicationsCount: '0',
            publicationsList: '-',
            titlesData: [],
            pageCitationsCount: '0',
            literatureLinks: '-'
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

        console.log(`BHL - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`BHL - Processing ${species} (${i + 1}/${total})...`);

                const result = await this.searchSpecies(species, options);
                results.push(result);

                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
                if (onProgress) onProgress(i + 1, total);

                // Rate limiting
                if (i < speciesList.length - 1) {
                    await this.delay(1500);
                }

            } catch (error) {
                console.error(`BHL - Error processing ${species}:`, error);

                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);

                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
                if (onProgress) onProgress(i + 1, total);
            }
        }

        return results;
    }
}

async function getBHL(apiKey = 'bhl') {
    console.log(`getBHL called with apiKey: ${apiKey}`);

    if (typeof window.bhlAPI === 'undefined' || !window.bhlAPI) {
        if (typeof BhlAPI !== 'undefined') {
            window.bhlAPI = new BhlAPI();
        } else {
            alert('Error: BHL API is not loaded. Please reload the page.');
            return;
        }
    }

    // Read API key from UI
    const apiKeyInput = document.getElementById('bhlApiKey');
    if (!apiKeyInput || !apiKeyInput.value.trim()) {
        alert('Please enter your BHL API Key in the BHL configuration section.');
        return;
    }
    window.bhlAPI.setApiKey(apiKeyInput.value.trim());

    const progressModal = document.getElementById('progressModal');
    if (!progressModal) { console.error('Progress modal not found'); return; }
    progressModal.classList.remove('hidden');

    const speciesNames = document.getElementById('speciesNames').value.split('\n').filter(n => n.trim());
    if (speciesNames.length === 0) {
        alert('Please enter at least one species name.');
        progressModal.classList.add('hidden');
        return;
    }

    // Read optional field checkboxes
    const bhlPageCitationsOpt = document.getElementById('bhlpagecitationsopt')?.checked ?? false;

    // ── Build table ──────────────────────────────────────────────────────────
    const _bhlTable = document.createElement('table');
    _bhlTable.id = 'BhlTable';
    _bhlTable.classList.add('text-base', 'text-blue-800', 'table-auto', 'border-collapse', 'w-full');

    let colIdx = 0;
    let headerCells = '';
    const addHeader = (label, center = false, sortable = true) => {
        const idx = colIdx++;
        let classes = 'py-5 px-5';
        let onclick = '';
        let icon = '';

        if (sortable) {
            classes += ' cursor-pointer hover:bg-gray-700';
            onclick = ` onclick="sortTable('BhlTable', ${idx})"`;
            icon = ' <i class="fas fa-sort ml-2"></i>';
        }
        if (center) classes += ' text-center';

        headerCells += `<th scope="col" class="${classes}"${onclick}>${label}${icon}</th>`;
    };

    addHeader('Species Name');
    addHeader('Name Found');
    addHeader('Publications Count', true);
    addHeader('Article Metadata', true, false);
    if (bhlPageCitationsOpt) addHeader('Page Citations', true);

    _bhlTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true">
        <tr>${headerCells}</tr>
    </thead>`;

    const _bhlTableBody = _bhlTable.createTBody();
    _bhlTableBody.classList.add('text-left', 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _bhlTableWrapper = document.createElement('div');
    _bhlTableWrapper.classList.add('w-full', 'table-wrapper');
    _bhlTableWrapper.appendChild(_bhlTable);

    const bhlResults = document.getElementById('tabPanel-bhl');
    bhlResults.appendChild(_bhlTableWrapper);

    // ── Controls (search / column filters / export) ── built before batch ───
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'bg-white rounded mb-4 mx-1';
    controlsContainer.innerHTML = `
        <div class="mt-6 mb-6 px-4">
            <div class="w-full mx-auto">
                <label for="bhl-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                    <i class="fas fa-search mr-2"></i>Search in BHL Results
                </label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i class="fas fa-search text-gray-400"></i>
                    </div>
                    <input type="text" id="bhl-table-search"
                        class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                        placeholder="Type to search in visible columns..." autocomplete="off">
                    <div id="bhl-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
            <div id="bhl-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
        </div>
        <div class="px-4 py-4 border-t">
            <h4 class="text-base font-semibold text-gray-800 mb-3">
                <i class="fas fa-download mr-2"></i>Export Results
            </h4>
            <div class="flex flex-wrap gap-3">
                <button id="bhl-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                    <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>Export to Excel
                </button>
                <button id="bhl-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                    <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>Export to TSV
                </button>
            </div>
            <p class="text-base text-gray-600 mt-3">
                <i class="fas fa-info-circle mr-1"></i>
                Export will include only the currently visible columns and filtered results.
            </p>
        </div>`;

    bhlResults.insertBefore(controlsContainer, _bhlTableWrapper);
    createColumnFilters('BhlTable', 'bhl-column-filters');

    const searchInput  = document.getElementById('bhl-table-search');
    const clearButton  = document.getElementById('bhl-search-clear');
    let searchTimeout;
    searchInput.addEventListener('input', function () {
        const term = this.value.toLowerCase().trim();
        clearButton.classList.toggle('hidden', !term);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterAndHighlightTable('BhlTable', term), 300);
    });
    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        clearButton.classList.add('hidden');
        filterAndHighlightTable('BhlTable', '');
        updateSearchResultsCounter('', 0);
        searchInput.focus();
    });
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('BhlTable', '');
            updateSearchResultsCounter('', 0);
        }
    });
    document.getElementById('bhl-export-excel').addEventListener('click', () => exportTableToExcel('BhlTable'));
    document.getElementById('bhl-export-tsv').addEventListener('click',   () => exportTableToTSV('BhlTable'));

    // ── Row builder (called progressively for each species) ─────────────────
    let successCount = 0;
    let errorCount   = 0;

    const addResultRow = (result) => {
        const row = _bhlTableBody.insertRow();
        row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

        let ci = 0;
        const addCell = (html, cls = 'py-5 px-5') => {
            const cell = row.insertCell(ci++);
            cell.innerHTML = html;
            cell.className = cls;
            return cell;
        };

        // Species Name
        addCell(`<i>${result.speciesName}</i>`);

        // Name Found: first two words italic (species epithet), rest plain (authors)
        const nf = result.nameFound || '-';
        let nameFoundHtml = nf;
        if (nf !== '-') {
            const parts = nf.trim().split(/\s+/);
            if (parts.length >= 2) {
                const sp   = parts[0] + ' ' + parts[1];
                const auth = parts.slice(2).join(' ');
                nameFoundHtml = `<i>${sp}</i>${auth ? ' ' + auth : ''}`;
            } else {
                nameFoundHtml = `<i>${nf.trim()}</i>`;
            }
        }
        addCell(nameFoundHtml);

        // Publications Count
        addCell(result.publicationsCount || '0', 'py-5 px-5 text-center');

        // Article Metadata — icon opens rich metadata cards
        const metaCell = row.insertCell(ci++);
        metaCell.className = 'py-5 px-5';
        metaCell.style.textAlign = 'center';

        if (result.titlesData && result.titlesData.length > 0) {
                const metaHtml = result.titlesData.map(t => {
                    // Correct field names per BHL API v3 docs
                    const fullTitle  = t.FullTitle  || t.ShortTitle || 'Unknown Title';
                    const shortTitle = (t.ShortTitle && t.ShortTitle !== fullTitle) ? t.ShortTitle : '';
                    const doi        = t.Doi        || '';          // Title/Doi
                    const bhlHref    = t.TitleURL   || (t.TitleID ? `https://www.biodiversitylibrary.org/bibliography/${t.TitleID}` : '');

                    // Authors (Author/Name + Author/Dates)
                    let authors = '';
                    if (Array.isArray(t.Authors) && t.Authors.length > 0) {
                        authors = t.Authors.map(a => {
                            const name  = a.Name || '';
                            const dates = a.Dates ? ` (${a.Dates})` : '';
                            return name + dates;
                        }).filter(Boolean).join('; ');
                    }

                    // Subjects (Subject/SubjectText)
                    let subjects = '';
                    if (Array.isArray(t.Subjects) && t.Subjects.length > 0) {
                        subjects = t.Subjects.map(s => s.SubjectText || '').filter(Boolean).join('; ');
                    }

                    // Identifiers (ISSN, ISBN, etc. — avoid re-showing DOI already in t.Doi)
                    const identifierLines = [];
                    if (Array.isArray(t.Identifiers)) {
                        for (const id of t.Identifiers) {
                            const n = (id.IdentifierName || '').toLowerCase();
                            if (n === 'doi') continue; // shown separately
                            if (id.IdentifierValue) {
                                identifierLines.push(`${id.IdentifierName.toUpperCase()}: ${id.IdentifierValue}`);
                            }
                        }
                    }

                    // Publisher and place combined
                    const publisher = [t.PublisherName, t.PublisherPlace].filter(Boolean).join(', ');

                    // Item links from Items array (Item/ItemUrl + Volume + Year)
                    const itemLinkParts = [];
                    if (Array.isArray(t.Items) && t.Items.length > 0) {
                        t.Items.forEach(item => {
                            if (item.ItemUrl) {
                                const parts = [];
                                if (item.Volume) parts.push(`Vol. ${item.Volume}`);
                                if (item.Year)   parts.push(item.Year);
                                const label = parts.length > 0 ? parts.join(', ') : 'View Item';
                                itemLinkParts.push(`<a href="${item.ItemUrl}" target="_blank" style="color:#2563eb;text-decoration:underline;margin-right:6px;">${label}</a>`);
                            }
                        });
                    }

                    const fieldRow = (icon, label, value) =>
                        value ? `<div style="display:flex;align-items:baseline;gap:6px;margin:4px 0;font-size:13px;color:#1f2937;">
                            <span style="flex-shrink:0;min-width:140px;font-weight:600;"><i class="fas ${icon} mr-1" style="width:14px;text-align:center;"></i>${label}:</span>
                            <span style="color:#374151;">${value}</span>
                        </div>` : '';

                    const doiBlock = doi
                        ? `<div style="display:flex;align-items:baseline;gap:6px;margin:4px 0;font-size:13px;color:#1f2937;">
                            <span style="flex-shrink:0;min-width:140px;font-weight:600;"><i class="fas fa-fingerprint mr-1" style="width:14px;text-align:center;"></i>DOI:</span>
                            <span style="word-break:break-all;"><a href="https://doi.org/${doi}" target="_blank" style="color:#2563eb;text-decoration:underline;">${doi}</a></span>
                           </div>`
                        : '';
                    const bhlBlock = bhlHref
                        ? `<div style="display:flex;align-items:baseline;gap:6px;margin:4px 0;font-size:13px;color:#1f2937;">
                            <span style="flex-shrink:0;min-width:140px;font-weight:600;"><i class="fas fa-external-link-alt mr-1" style="width:14px;text-align:center;"></i>BHL Link:</span>
                            <span><a href="${bhlHref}" target="_blank" style="color:#2563eb;text-decoration:underline;">View on BHL</a></span>
                           </div>`
                        : '';
                    const idBlock = identifierLines.length > 0
                        ? fieldRow('fa-barcode', 'Identifiers', identifierLines.join(' | '))
                        : '';
                    const itemLinksBlock = itemLinkParts.length > 0
                        ? `<div style="display:flex;align-items:baseline;gap:6px;margin:4px 0;font-size:13px;color:#1f2937;">
                            <span style="flex-shrink:0;min-width:140px;font-weight:600;"><i class="fas fa-link mr-1" style="width:14px;text-align:center;"></i>Literature Links:</span>
                            <span style="flex-wrap:wrap;display:flex;gap:4px;">${itemLinkParts.join('')}</span>
                           </div>`
                        : '';

                    return `<div class="meta-card" style="background:#e5e7eb;border-left:4px solid #1f2937;padding:14px 16px;margin-bottom:10px;border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,0.07);">
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                            <i class="fas fa-book fa-lg" style="color:#1f2937;flex-shrink:0;"></i>
                            <span style="font-weight:700;font-size:14px;color:#111827;line-height:1.4;">${fullTitle}</span>
                        </div>
                        <div>
                            ${shortTitle ? fieldRow('fa-text-width', 'Short Title', shortTitle) : ''}
                            ${fieldRow('fa-user-edit',    'Authors',          authors)}
                            ${fieldRow('fa-layer-group',  'Genre',            t.Genre)}
                            ${fieldRow('fa-cube',         'Material Type',    t.MaterialType)}
                            ${fieldRow('fa-calendar-alt', 'Publication Date', t.PublicationDate)}
                            ${fieldRow('fa-building',     'Publisher',        publisher)}
                            ${fieldRow('fa-clone',        'Edition',          t.Edition)}
                            ${fieldRow('fa-list',         'Subjects',         subjects)}
                            ${idBlock}${doiBlock}${bhlBlock}${itemLinksBlock}
                        </div>
                    </div>`;
                }).join('');

                const metaBtn = document.createElement('button');
                metaBtn.title = 'View Article Metadata';
                metaBtn.className = 'inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md';
                metaBtn.innerHTML = '<i class="fa-solid fa-eye mr-2"></i>View';
                metaBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    ensureCellModal();
                    document.getElementById('cellTextModalTitle').innerHTML = 'Article Metadata — <i>' + result.speciesName + '</i>';

                    // Put cards directly in the scrollable body (no sticky needed)
                    document.getElementById('cellTextModalBody').innerHTML = metaHtml;

                    // Insert search bar between modal header and body (outside overflow area)
                    const modalBody   = document.getElementById('cellTextModalBody');
                    const modalDialog = modalBody.parentElement;
                    const existing    = modalDialog.querySelector('.bhl-modal-search');
                    if (existing) existing.remove();

                    const searchId   = 'bhl-meta-search-' + Date.now();
                    const clearBtnId = 'bhl-meta-clear-' + Date.now();
                    const searchBar  = document.createElement('div');
                    searchBar.className = 'bhl-modal-search';
                    searchBar.style.cssText = 'padding:10px 20px 14px;background:#1f2937;flex-shrink:0;';
                    searchBar.innerHTML = `
                        <div style="display:flex;gap:8px;align-items:center;">
                            <div style="position:relative;flex:1;">
                                <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:13px;pointer-events:none;"></i>
                                <input type="text" id="${searchId}" placeholder="Search publications..."
                                    style="width:100%;padding:9px 36px 9px 34px;border:1px solid #4b5563;border-radius:6px;font-size:14px;box-sizing:border-box;background:#ffffff;color:#111827;">
                            </div>
                            <button id="${clearBtnId}" style="background:none;border:none;color:#d1d5db;cursor:pointer;padding:8px;font-size:18px;display:none;line-height:1;" title="Clear search">
                                <i class="fas fa-times-circle"></i>
                            </button>
                        </div>`;
                    modalDialog.insertBefore(searchBar, modalBody);

                    const searchInput    = document.getElementById(searchId);
                    const clearBtn       = document.getElementById(clearBtnId);
                    const originalHtml   = metaHtml;

                    const performSearch = () => {
                        const term = searchInput.value.toLowerCase().trim();
                        clearBtn.style.display = term ? 'inline-block' : 'none';

                        // Restore original cards before re-highlighting
                        modalBody.innerHTML = originalHtml;

                        document.querySelectorAll('#cellTextModal .meta-card').forEach(card => {
                            const visible = !term || card.textContent.toLowerCase().includes(term);
                            card.style.display = visible ? '' : 'none';

                            if (term && visible) {
                                const highlightMatches = (node) => {
                                    if (node.nodeType === 3) {
                                        const text = node.textContent;
                                        if (text.toLowerCase().includes(term)) {
                                            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                                            const span = document.createElement('span');
                                            span.innerHTML = text.replace(regex, '<mark style="background:#fbbf24;padding:1px 3px;border-radius:3px;">$1</mark>');
                                            node.parentNode.replaceChild(span, node);
                                        }
                                    } else if (node.nodeType === 1 && node.tagName !== 'MARK') {
                                        Array.from(node.childNodes).forEach(highlightMatches);
                                    }
                                };
                                highlightMatches(card);
                            }
                        });
                    };

                    searchInput.addEventListener('input', performSearch);
                    clearBtn.addEventListener('click', () => {
                        searchInput.value = '';
                        clearBtn.style.display = 'none';
                        searchInput.focus();
                        performSearch();
                    });
                    searchInput.focus();

                    const modal = document.getElementById('cellTextModal');
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                });
                metaCell.appendChild(metaBtn);
                metaCell.dataset.exportValue = result.publicationsList || '-';
            } else {
                metaCell.textContent = '-';
            }

        if (bhlPageCitationsOpt) {
            addCell(result.pageCitationsCount || '0', 'py-5 px-5 text-center');
        }

        if (parseInt(result.publicationsCount) > 0) successCount++;
        if (result.error) errorCount++;
    };

    // ── Run batch (rows appear progressively as each species completes) ──────
    try {
        await window.bhlAPI.searchBatch(
            speciesNames,
            (current, total) => {
                const pct = (current / total) * 100;
                const bar  = document.getElementById(`progressBar-${apiKey}`);
                const txt  = document.getElementById(`progressText-${apiKey}`);
                if (bar) bar.style.width = pct + '%';
                if (txt) txt.textContent  = Math.round(pct) + '%';
                if (typeof window.globalProgressTracker !== 'undefined') {
                    window.globalProgressTracker.updateApiProgress(apiKey, pct);
                }
            },
            (result) => addResultRow(result)
        );

        // ── Post-batch: status notices (inserted above controls) ────────────
        if (successCount > 0) {
            const successNotice = document.createElement('div');
            successNotice.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            successNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0"><i class="fas fa-2x fa-check-circle text-black"></i></div>
                    <div class="ml-5">
                        <p class="text-base font-semibold text-black mb-1">
                            <strong>Success:</strong> Successfully accessed Biodiversity Heritage Library.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${speciesNames.length} species found with publication data
                        </p>
                    </div>
                </div>`;
            bhlResults.insertBefore(successNotice, controlsContainer);
        }

        if (errorCount > 0) {
            const errorNotice = document.createElement('div');
            errorNotice.className = 'bg-red-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            errorNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0"><i class="fas fa-2x fa-exclamation-triangle text-black"></i></div>
                    <div class="ml-5">
                        <p class="text-base font-semibold text-black mb-1">
                            <strong>Notice:</strong> ${errorCount} of ${speciesNames.length} requests had issues.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Successfully processed: ${successCount}/${speciesNames.length} species
                        </p>
                    </div>
                </div>`;
            bhlResults.insertBefore(errorNotice, controlsContainer);
        }

        updateDataResults();
        console.log(`BHL search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during BHL search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.bhlAPI = new BhlAPI();
    console.log('BHL API loaded and instance created successfully');
    window.BhlAPI = BhlAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BhlAPI;
    }
}
