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
 * Update sticky header positioning for all tables
 */
function updateStickyHeaders() {
    const stickyTop = getStickyTop();
    const allTableHeads = document.querySelectorAll('thead[data-sticky="true"]');
    allTableHeads.forEach(thead => {
        thead.style.top = stickyTop + 'px';
    });
}

// Initialize sticky header updates when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initial update
    setTimeout(() => updateStickyHeaders(), 100);

    // Watch for resize and update offsets
    window.addEventListener('resize', updateStickyHeaders);

    // Also update when tip container visibility changes
    const tipContainer = document.querySelector('.tip-container');
    if (tipContainer) {
        const observer = new MutationObserver(updateStickyHeaders);
        observer.observe(tipContainer, { attributes: true, subtree: true });
    }

    // Watch for new tables added to Results container
    const resultsContainer = document.getElementById('Results');
    if (resultsContainer) {
        const observer = new MutationObserver(() => {
            // Update sticky headers when new tables are added
            setTimeout(() => updateStickyHeaders(), 50);
        });
        observer.observe(resultsContainer, { childList: true, subtree: true });
    }

    // Update sticky headers when scrolling (for header visibility)
    document.addEventListener('scroll', updateStickyHeaders, true);
});


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
                const cellText = cell.textContent.toLowerCase();

                if (cellText.includes(searchTerm)) {
                    rowMatches = true;
                    // Save original HTML before modifying (preserves links, italics, etc.)
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

    // Filter only visible rows
    const visibleRows = rows.filter(row => row.style.display !== 'none');

    visibleRows.forEach((row, rowIndex) => {
        // Filter only visible cells
        const visibleCells = Array.from(row.cells).filter(cell => cell.style.display !== 'none');

        visibleCells.forEach((cell, cellIndex) => {
            const excelCell = worksheet.getCell(rowIndex + 1, cellIndex + 1);
            excelCell.value = cell.textContent.trim();
            excelCell.alignment = { vertical: 'middle', wrapText: true };

            // Header row: bold
            if (rowIndex === 0) {
                excelCell.font = { bold: true };
            } else {
                // Check if cell contains italic text (<i> without Font Awesome classes)
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

    // Filter only visible rows and cells
    const visibleRows = rows.filter(row => row.style.display !== 'none');

    let csvContent = '';

    visibleRows.forEach((row, rowIndex) => {
        const visibleCells = Array.from(row.cells).filter(cell => cell.style.display !== 'none');
        const rowData = visibleCells.map(cell => {
            // Clean the cell content
            let content = cell.textContent.trim();
            // Escape quotes and wrap in quotes if contains comma or quote
            if (content.includes(',') || content.includes('"') || content.includes('\n')) {
                content = '"' + content.replace(/"/g, '""') + '"';
            }
            return content;
        });

        csvContent += rowData.join(',') + '\n';
    });

    // Create and download file
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

    // Filter only visible rows and cells
    const visibleRows = rows.filter(row => row.style.display !== 'none');

    let tsvContent = '';

    visibleRows.forEach((row, rowIndex) => {
        const visibleCells = Array.from(row.cells).filter(cell => cell.style.display !== 'none');
        const rowData = visibleCells.map(cell => {
            // Clean the cell content
            let content = cell.textContent.trim();
            // Escape tabs and wrap in quotes if contains tab, quote or newline
            if (content.includes('\t') || content.includes('"') || content.includes('\n')) {
                content = '"' + content.replace(/"/g, '""') + '"';
            }
            return content;
        });

        tsvContent += rowData.join('\t') + '\n';
    });

    // Create and download file
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

    const resultsCard = document.createElement('div');
    resultsCard.className = 'bg-white rounded mb-4';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-2 px-2 rounded my-1';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-base">4</div>
        <div class="text-base font-semibold">Visualize and export the results</div>
    `;
    resultsCard.appendChild(cardHeader);

    dataResults.appendChild(resultsCard);
}

// Tab management functions

function createResultTabs(selectedApis) {
    const resultsContainer = document.getElementById('Results');
    resultsContainer.innerHTML = '';

    // Display names for each API
    const tabNames = {
        'eschmeyer': "Eschmeyer's Catalog",
        'worms': 'WoRMS',
        'gbif': 'GBIF',
        'bold': 'BOLD Systems',
        'iucn': 'IUCN Red List',
        'ncbi': 'NCBI'
    };

    // If only one API selected, just create the panel without tab buttons
    if (selectedApis.length === 1) {
        const panel = document.createElement('div');
        panel.id = 'tabPanel-' + selectedApis[0];
        panel.className = 'tab-panel';
        resultsContainer.appendChild(panel);
        return;
    }

    // Create tab buttons container
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

    // Create tab panels
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
    // Update tab buttons
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

    // Show/hide panels
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
}
