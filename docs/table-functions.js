// Funções de Tabela e Filtros

/**
 * Calculate the sticky top offset for table headers (below page header + tip container)
 */
function getStickyTop() {
    const header = document.querySelector('header.bg-gray-800');
    const tipContainer = document.querySelector('.tip-container');
    let top = 0;
    if (header) top += header.offsetHeight;
    if (tipContainer && tipContainer.style.display !== 'none') top += tipContainer.offsetHeight;
    return top;
}

/**
 * Update sticky header positioning.
 * The resultsHeader uses CSS sticky (it is NOT inside an overflow wrapper).
 * Table theads use JS-based cloning because .table-wrapper has overflow-x:auto
 * which breaks CSS position:sticky.
 */
function updateStickyHeaders() {
    const stickyTop = getStickyTop();

    // Results header - CSS sticky works (not inside overflow container)
    const resultsHeader = document.getElementById('resultsHeader');
    if (resultsHeader) {
        resultsHeader.style.top = stickyTop + 'px';
    }

    // Table theads - JS clone approach (inside overflow-x:auto wrapper)
    const resultsHeaderHeight = resultsHeader ? resultsHeader.offsetHeight : 0;
    const headerOffset = stickyTop + resultsHeaderHeight;

    document.querySelectorAll('.table-wrapper').forEach(wrapper => {
        const table = wrapper.querySelector('table');
        const thead = table?.querySelector('thead[data-sticky="true"]');
        if (!thead || !table) return;

        // Only process visible wrappers (visible tab panel)
        if (wrapper.offsetParent === null) {
            // Hidden - remove clone if exists
            if (wrapper._stickyClone) {
                wrapper._stickyClone.style.display = 'none';
            }
            return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const theadHeight = thead.offsetHeight;
        const bottomLimit = wrapperRect.bottom - theadHeight;

        const shouldStick = wrapperRect.top < headerOffset && bottomLimit > headerOffset;

        let clone = wrapper._stickyClone;

        if (shouldStick) {
            if (!clone) {
                clone = document.createElement('div');
                clone.className = 'sticky-thead-clone';
                clone.style.cssText = 'position:fixed; z-index:25; overflow:hidden; pointer-events:auto; background:#1f2937; box-shadow:0 2px 4px rgba(0,0,0,0.15);';

                const cloneTable = document.createElement('table');
                cloneTable.className = table.className;
                cloneTable.style.borderCollapse = 'collapse';
                const cloneThead = thead.cloneNode(true);
                cloneThead.style.backgroundColor = '#1f2937';
                cloneThead.querySelectorAll('th').forEach(th => th.removeAttribute('onclick'));
                cloneTable.appendChild(cloneThead);
                clone.appendChild(cloneTable);

                // Delegate click events for sorting
                clone.addEventListener('click', (e) => {
                    const th = e.target.closest('th');
                    if (th) {
                        const idx = Array.from(th.parentElement.children).indexOf(th);
                        const origTh = thead.querySelectorAll('th')[idx];
                        if (origTh) origTh.click();
                        // Refresh clone after sort (icons change)
                        setTimeout(() => {
                            const newCloneThead = thead.cloneNode(true);
                            newCloneThead.style.backgroundColor = '#1f2937';
                            newCloneThead.querySelectorAll('th').forEach(th => th.removeAttribute('onclick'));
                            const oldCloneThead = clone.querySelector('thead');
                            clone.querySelector('table').replaceChild(newCloneThead, oldCloneThead);
                        }, 50);
                    }
                });

                document.body.appendChild(clone);
                wrapper._stickyClone = clone;
            }

            // Position clone
            clone.style.top = headerOffset + 'px';
            clone.style.left = wrapperRect.left + 'px';
            clone.style.width = wrapperRect.width + 'px';

            // Sync horizontal scroll
            const cloneTable = clone.querySelector('table');
            cloneTable.style.transform = `translateX(${-wrapper.scrollLeft}px)`;
            cloneTable.style.width = table.offsetWidth + 'px';

            // Sync column widths
            const origThs = thead.querySelectorAll('th');
            const cloneThs = clone.querySelectorAll('th');
            origThs.forEach((th, i) => {
                if (cloneThs[i]) {
                    const w = th.getBoundingClientRect().width;
                    cloneThs[i].style.width = w + 'px';
                    cloneThs[i].style.minWidth = w + 'px';
                    cloneThs[i].style.maxWidth = w + 'px';
                    // Sync visibility
                    cloneThs[i].style.display = th.style.display;
                }
            });

            clone.style.display = 'block';
        } else if (clone) {
            clone.style.display = 'none';
        }
    });
}

/**
 * Clean up stale sticky clones (call when tab changes or tables are removed)
 */
function cleanupStickyClones() {
    document.querySelectorAll('.sticky-thead-clone').forEach(clone => {
        clone.remove();
    });
    document.querySelectorAll('.table-wrapper').forEach(wrapper => {
        wrapper._stickyClone = null;
    });
}

// Initialize sticky header updates when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => updateStickyHeaders(), 100);

    window.addEventListener('resize', () => {
        cleanupStickyClones();
        updateStickyHeaders();
    });

    const tipContainer = document.querySelector('.tip-container');
    if (tipContainer) {
        const observer = new MutationObserver(updateStickyHeaders);
        observer.observe(tipContainer, { attributes: true, subtree: true });
    }

    const resultsContainer = document.getElementById('Results');
    if (resultsContainer) {
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                // Attach horizontal scroll listener to new table-wrappers
                document.querySelectorAll('.table-wrapper').forEach(wrapper => {
                    if (!wrapper._scrollListenerAdded) {
                        wrapper.addEventListener('scroll', updateStickyHeaders, { passive: true });
                        wrapper._scrollListenerAdded = true;
                    }
                });
                updateStickyHeaders();
            }, 50);
        });
        observer.observe(resultsContainer, { childList: true, subtree: true });
    }

    window.addEventListener('scroll', updateStickyHeaders, { passive: true });
});


// ========== Modal for long text ==========

/**
 * Create the modal element (once) for displaying long cell text
 */
function ensureCellModal() {
    if (document.getElementById('cellTextModal')) return;

    const modal = document.createElement('div');
    modal.id = 'cellTextModal';
    modal.className = 'hidden';
    modal.style.cssText = 'position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center;';
    modal.innerHTML = `
        <div id="cellTextModalBackdrop" style="position:absolute; inset:0; background:rgba(0,0,0,0.5);"></div>
        <div style="position:relative; background:white; border-radius:12px; max-width:1100px; width:95%; max-height:90vh; display:flex; flex-direction:column; box-shadow:0 25px 50px rgba(0,0,0,0.25);">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid #e5e7eb; background:#1f2937; border-radius:12px 12px 0 0;">
                <h3 id="cellTextModalTitle" style="font-size:16px; font-weight:600; color:white; margin:0;"></h3>
                <button id="cellTextModalClose" style="background:none; border:none; color:white; font-size:32px; cursor:pointer; padding:8px 12px; line-height:1; display:flex; align-items:center; justify-content:center; width:48px; height:48px;">&times;</button>
            </div>
            <div id="cellTextModalBody" style="padding:20px; overflow-y:auto; font-size:14px; line-height:1.7; color:#1f2937; text-align:justify;"></div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cellTextModalBackdrop').addEventListener('click', closeCellModal);
    document.getElementById('cellTextModalClose').addEventListener('click', closeCellModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCellModal();
    });
}

function showCellModal(title, text, noBreak) {
    ensureCellModal();
    // Remove any BHL modal search bar that may have been injected previously
    const bhlSearch = document.querySelector('#cellTextModal .bhl-modal-search');
    if (bhlSearch) bhlSearch.remove();
    document.getElementById('cellTextModalTitle').textContent = title;
    const body = document.getElementById('cellTextModalBody');
    // Escape HTML entities, then replace ; with line breaks for readability (unless noBreak)
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    body.innerHTML = noBreak ? escaped : escaped.replace(/;\s*/g, ';<br>');
    const modal = document.getElementById('cellTextModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCellModal() {
    const modal = document.getElementById('cellTextModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        // Remove any BHL modal search bar
        const bhlSearch = modal.querySelector('.bhl-modal-search');
        if (bhlSearch) bhlSearch.remove();
    }
    document.body.style.overflow = '';
}

/**
 * Truncate cell text and add expand icon if text exceeds maxLength.
 * @param {HTMLElement} cell - The table cell element
 * @param {number} maxLength - Maximum characters to show before truncating
 * @param {string} title - Column header name for the modal title
 */
function truncateCellText(cell, maxLength, title) {
    const fullText = cell.textContent.trim();
    if (!fullText || fullText === '-') return;

    // Check if this column should show icon-only (from column-icons.js)
    const table = cell.closest('table');
    if (table && typeof IconColumns !== 'undefined') {
        const tableIdToApi = {
            'BhlTable': 'bhl', 'BirdLifeTable': 'birdlife', 'BoldTable': 'bold',
            'ColTable': 'col', 'EBirdTable': 'ebird', 'EolTable': 'eol',
            'EschmeyerTable': 'eschmeyer', 'GbifTable': 'gbif', 'IucnTable': 'iucn',
            'NcbiTable': 'ncbi', 'ObisTable': 'obis', 'OpenDataBioTable': 'opendatabio',
            'SalveTable': 'salve', 'SpeciesLinkTable': 'specieslink', 'WormsTable': 'worms'
        };
        const apiKey = tableIdToApi[table.id];
        if (apiKey && IconColumns[apiKey] && IconColumns[apiKey].includes(title)) {
            cell.dataset.fullText = fullText;
            cell.dataset.columnTitle = title;
            cell.innerHTML = `
                <button class="cell-icon-btn" title="${title}: Click to view"
                        style="background:none; border:none; cursor:pointer; padding:4px 8px;">
                    <i class="fas fa-eye text-gray-500 hover:text-gray-800 text-lg transition-colors duration-200"></i>
                </button>
            `;
            cell.style.textAlign = 'center';
            cell.querySelector('.cell-icon-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showCellModal(title, fullText);
            });
            return;
        }
    }

    // For non-icon columns, only truncate if text exceeds maxLength
    if (fullText.length <= maxLength) return;

    const truncated = fullText.substring(0, maxLength) + '...';
    cell.dataset.fullText = fullText;
    cell.dataset.columnTitle = title;
    cell.style.cursor = 'pointer';
    cell.innerHTML = `
        <span class="cell-truncated-text" style="cursor:pointer;" title="Click to view full text">${truncated}</span>
        <button class="cell-expand-btn" title="View full text" style="background:none; border:1px solid #9ca3af; border-radius:6px; color:#374151; cursor:pointer; padding:2px 6px; margin-left:6px; font-size:12px; vertical-align:middle; transition:all 0.2s;"
                onmouseover="this.style.background='#1f2937'; this.style.color='white'; this.style.borderColor='#1f2937';"
                onmouseout="this.style.background='none'; this.style.color='#374151'; this.style.borderColor='#9ca3af';">
            <i class="fas fa-expand-alt"></i>
        </button>
    `;

    cell.querySelector('.cell-expand-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showCellModal(title, fullText);
    });

    cell.querySelector('.cell-truncated-text').addEventListener('click', (e) => {
        e.stopPropagation();
        showCellModal(title, fullText);
    });
}


// ========== Table helper functions ==========

function createSearchInput(tableId, cardBody) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mt-6 mb-6';
    searchContainer.innerHTML = `
        <div class="w-full mx-auto">
            <label for="table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                <i class="fas fa-search mr-2"></i>Search in Table Results
            </label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i class="fas fa-search text-gray-400"></i>
                </div>
                <input
                    type="text"
                    id="table-search"
                    class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    placeholder="Type to search in visible columns..."
                    autocomplete="off"
                >
                <div id="search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
                    <i class="fas fa-times text-gray-400 hover:text-gray-600 text-lg"></i>
                </div>
            </div>
            <small class="text-gray-600 mt-2 block">
                <i class="fas fa-info-circle mr-1"></i>
                This search will filter and highlight results in the visible columns selected above.
            </small>
        </div>
    `;

    cardBody.appendChild(searchContainer);

    const searchInput = document.getElementById('table-search');
    const clearButton = document.getElementById('search-clear');
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
        updateSearchResultsCounter('', 0);
        searchInput.focus();
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable(tableId, '');
            updateSearchResultsCounter('', 0);
        }
    });
}

function createColumnFilters(tableId, filterContainerId) {
    const table = document.getElementById(tableId);
    const filterContainer = document.getElementById(filterContainerId);

    if (!table || !filterContainer) return;

    const headerRow = table.querySelector('thead tr');
    filterContainer.innerHTML = '';

    Array.from(headerRow.cells).forEach((cell, index) => {
        const filterItem = document.createElement('div');
        filterItem.className = 'flex items-center space-x-2';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300';

        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.checked = true;
        switchInput.id = `filter-col-${index}`;
        switchInput.dataset.columnIndex = index;
        switchInput.className = 'sr-only peer';

        switchInput.addEventListener('change', function () {
            const colIndex = switchInput.dataset.columnIndex;
            const isVisible = switchInput.checked;

            toggleColumnVisibility(tableId, colIndex, isVisible);

            if (isVisible) {
                label.classList.remove('bg-gray-400');
                label.classList.add('bg-gray-800');
                switchIcon.className = 'fas fa-eye text-white text-xl absolute';
            } else {
                label.classList.remove('bg-gray-800');
                label.classList.add('bg-gray-400');
                switchIcon.className = 'fas fa-eye-slash text-white text-xl absolute';
            }

            // Refresh sticky clone column widths
            cleanupStickyClones();
            setTimeout(updateStickyHeaders, 50);

            const searchInput = document.getElementById('table-search');
            if (searchInput && searchInput.value.trim()) {
                filterAndHighlightTable(tableId, searchInput.value.toLowerCase().trim());
            }
        });

        label.classList.add('bg-gray-800');

        const switchIcon = document.createElement('i');
        switchIcon.className = 'fas fa-eye text-white text-xl absolute';
        switchIcon.style.top = '50%';
        switchIcon.style.left = '50%';
        switchIcon.style.transform = 'translate(-50%, -50%)';

        label.appendChild(switchInput);
        label.appendChild(switchIcon);

        const columnLabel = document.createElement('span');
        columnLabel.textContent = cell.textContent.trim();
        columnLabel.className = 'text-base text-gray-800 leading-tight break-words flex-grow min-w-0';

        filterItem.appendChild(label);
        filterItem.appendChild(columnLabel);
        filterContainer.appendChild(filterItem);
    });
}

function toggleColumnVisibility(tableId, colIndex, isVisible) {
    const table = document.getElementById(tableId);
    Array.from(table.rows).forEach(row => {
        const cell = row.cells[colIndex];
        if (cell) {
            cell.style.display = isVisible ? '' : 'none';
        }
    });
}

function filterAndHighlightTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');

    // Restore original content from any previous highlighting
    rows.forEach(row => {
        Array.from(row.cells).forEach(cell => {
            if (cell.dataset.originalHtml !== undefined) {
                cell.innerHTML = cell.dataset.originalHtml;
                delete cell.dataset.originalHtml;
            }
        });
    });

    if (!searchTerm) {
        rows.forEach(row => {
            row.style.display = '';
        });
        updateSearchResultsCounter('', 0);
        return;
    }

    let visibleRowCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let rowMatches = false;

        cells.forEach(cell => {
            const isColumnVisible = cell.style.display !== 'none';

            if (isColumnVisible) {
                // Use full text from data attribute if available (truncated cells)
                const cellText = (cell.dataset.exportValue || cell.dataset.fullText || cell.textContent).toLowerCase();

                if (cellText.includes(searchTerm)) {
                    rowMatches = true;
                    cell.dataset.originalHtml = cell.innerHTML;
                    highlightText(cell, searchTerm);
                }
            }
        });

        if (rowMatches) {
            row.style.display = '';
            visibleRowCount++;
        } else {
            row.style.display = 'none';
        }
    });

    updateSearchResultsCounter(searchTerm, visibleRowCount);
}

function highlightText(element, searchTerm) {
    const text = element.textContent;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    const highlightedText = text.replace(regex, '<mark class="bg-yellow-300 px-1 rounded">$1</mark>');
    element.innerHTML = highlightedText;
}

function removeHighlights(table) {
    const marks = table.querySelectorAll('mark');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateSearchResultsCounter(searchTerm, count) {
    let counter = document.getElementById('search-results-counter');

    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'search-results-counter';
        counter.className = 'text-center mt-2 text-base text-gray-600';

        const searchEl = document.querySelector('#table-search');
        if (!searchEl) return;
        const searchContainer = searchEl.closest('.w-full');
        if (!searchContainer) return;
        searchContainer.appendChild(counter);
    }

    if (searchTerm && searchTerm.length > 0) {
        counter.innerHTML = `
            <i class="fas fa-filter mr-1"></i>
            Showing <strong>${count}</strong> result${count !== 1 ? 's' : ''} for "<strong>${searchTerm}</strong>"
        `;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const currentSort = table.dataset.sortColumn;
    const currentDirection = table.dataset.sortDirection || 'asc';
    const newDirection = (currentSort == columnIndex && currentDirection === 'asc') ? 'desc' : 'asc';

    const headers = table.querySelectorAll('thead th');
    headers.forEach((header, index) => {
        const icon = header.querySelector('i');
        if (icon) {
            if (index === columnIndex) {
                icon.className = newDirection === 'asc' ? 'fas fa-sort-up ml-2' : 'fas fa-sort-down ml-2';
            } else {
                icon.className = 'fas fa-sort ml-2';
            }
        }
    });

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex]?.textContent.trim() || '';
        const bValue = b.cells[columnIndex]?.textContent.trim() || '';

        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        const comparison = aValue.localeCompare(bValue, 'pt-BR', { numeric: true });
        return newDirection === 'asc' ? comparison : -comparison;
    });

    rows.forEach(row => tbody.appendChild(row));

    table.dataset.sortColumn = columnIndex;
    table.dataset.sortDirection = newDirection;
}

async function exportTableToExcel(tableId) {
    const table = document.getElementById(tableId);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tableId);
    const rows = Array.from(table.rows);

    const visibleRows = rows.filter(row => row.style.display !== 'none');

    visibleRows.forEach((row, rowIndex) => {
        const visibleCells = Array.from(row.cells).filter(cell => cell.style.display !== 'none');

        visibleCells.forEach((cell, cellIndex) => {
            const excelCell = worksheet.getCell(rowIndex + 1, cellIndex + 1);
            // Use full text for truncated cells
            excelCell.value = (cell.dataset.exportValue || cell.dataset.fullText || cell.textContent).trim();
            excelCell.alignment = { vertical: 'middle', wrapText: true };

            if (rowIndex === 0) {
                excelCell.font = { bold: true };
            } else {
                const iElements = cell.querySelectorAll('i');
                let hasItalic = false;
                for (const el of iElements) {
                    if (!el.className || !el.className.match(/\bfa[srlb]?\b/)) {
                        hasItalic = true;
                        break;
                    }
                }
                if (hasItalic) {
                    excelCell.font = { italic: true };
                }
            }
        });
    });

    worksheet.columns.forEach(column => {
        let maxColumnLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            let columnLength = cell.text ? cell.text.length : 0;
            if (columnLength > maxColumnLength) {
                maxColumnLength = columnLength;
            }
        });
        column.width = maxColumnLength < 10 ? 10 : maxColumnLength > 50 ? 50 : maxColumnLength;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataFishing_' + tableId + '.xlsx';
    a.click();
    URL.revokeObjectURL(url);
}

async function exportTableToCSV(tableId) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.rows);

    const visibleRows = rows.filter(row => row.style.display !== 'none');

    let csvContent = '';

    visibleRows.forEach((row, rowIndex) => {
        const visibleCells = Array.from(row.cells).filter(cell => cell.style.display !== 'none');
        const rowData = visibleCells.map(cell => {
            let content = (cell.dataset.exportValue || cell.dataset.fullText || cell.textContent).trim();
            if (content.includes(',') || content.includes('"') || content.includes('\n')) {
                content = '"' + content.replace(/"/g, '""') + '"';
            }
            return content;
        });

        csvContent += rowData.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataFishing_${tableId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

async function exportTableToTSV(tableId) {
    const table = document.getElementById(tableId);
    const rows = Array.from(table.rows);

    const visibleRows = rows.filter(row => row.style.display !== 'none');

    let tsvContent = '';

    visibleRows.forEach((row, rowIndex) => {
        const visibleCells = Array.from(row.cells).filter(cell => cell.style.display !== 'none');
        const rowData = visibleCells.map(cell => {
            let content = (cell.dataset.exportValue || cell.dataset.fullText || cell.textContent).trim();
            if (content.includes('\t') || content.includes('"') || content.includes('\n')) {
                content = '"' + content.replace(/"/g, '""') + '"';
            }
            return content;
        });

        tsvContent += rowData.join('\t') + '\n';
    });

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataFishing_${tableId}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
}

function updateDataResults() {
    const dataResults = document.getElementById('dataResults');
    dataResults.innerHTML = '';

    const resultsContainer = document.getElementById('Results');
    if (!resultsContainer) return;

    const existingHeader = document.getElementById('resultsHeader');
    if (existingHeader) existingHeader.remove();

    const cardHeader = document.createElement('div');
    cardHeader.id = 'resultsHeader';
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-2 px-2 rounded my-1 sticky z-30';
    const stickyTop = getStickyTop();
    cardHeader.style.top = stickyTop + 'px';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-base">4</div>
        <div class="text-base font-semibold">Visualize and export the results</div>
    `;

    resultsContainer.insertBefore(cardHeader, resultsContainer.firstChild);
}

// Tab management functions

function createResultTabs(selectedApis) {
    const resultsContainer = document.getElementById('Results');
    resultsContainer.innerHTML = '';

    // Clean up stale clones when tabs are recreated
    cleanupStickyClones();

    const tabNames = {
        'bhl': 'BHL',
        'birdlife': 'BirdLife',
        'bold': 'BOLD Systems',
        'col': 'Catalogue of Life',
        'ebird': 'eBird',
        'eol': 'Encyclopedia of Life',
        'eschmeyer': "Eschmeyer's Catalog",
        'gbif': 'GBIF',
        'iucn': 'IUCN Red List',
        'ncbi': 'NCBI',
        'obis': 'OBIS',
        'opendatabio': 'OpenDataBio',
        'salve': 'ICMBio SALVE',
        'specieslink': 'speciesLink',
        'worms': 'WoRMS'
    };

    if (selectedApis.length === 1) {
        const panel = document.createElement('div');
        panel.id = 'tabPanel-' + selectedApis[0];
        panel.className = 'tab-panel';
        resultsContainer.appendChild(panel);
        return;
    }

    const tabBar = document.createElement('div');
    tabBar.id = 'tabButtons';
    tabBar.className = 'flex flex-wrap gap-1 bg-gray-200 p-1 rounded-lg mb-4';

    selectedApis.forEach((apiKey, index) => {
        const btn = document.createElement('button');
        btn.id = 'tabBtn-' + apiKey;
        btn.className = 'px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 ' +
            (index === 0 ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100');
        btn.textContent = tabNames[apiKey] || apiKey;
        btn.addEventListener('click', function () {
            switchTab(apiKey);
        });
        tabBar.appendChild(btn);
    });

    resultsContainer.appendChild(tabBar);

    const panelsContainer = document.createElement('div');
    panelsContainer.id = 'tabPanels';

    selectedApis.forEach((apiKey, index) => {
        const panel = document.createElement('div');
        panel.id = 'tabPanel-' + apiKey;
        panel.className = 'tab-panel';
        if (index !== 0) {
            panel.style.display = 'none';
        }
        panelsContainer.appendChild(panel);
    });

    resultsContainer.appendChild(panelsContainer);
}

function switchTab(apiKey) {
    // Clean up clones on tab switch
    cleanupStickyClones();

    const tabBar = document.getElementById('tabButtons');
    if (tabBar) {
        const buttons = tabBar.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.id === 'tabBtn-' + apiKey) {
                btn.className = 'px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 bg-gray-800 text-white shadow-md';
            } else {
                btn.className = 'px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 bg-white text-gray-600 hover:bg-gray-100';
            }
        });
    }

    const panelsContainer = document.getElementById('tabPanels');
    if (panelsContainer) {
        const panels = panelsContainer.querySelectorAll('.tab-panel');
        panels.forEach(panel => {
            if (panel.id === 'tabPanel-' + apiKey) {
                panel.style.display = '';
            } else {
                panel.style.display = 'none';
            }
        });
    }

    // Re-check sticky after tab becomes visible
    setTimeout(updateStickyHeaders, 50);
}
