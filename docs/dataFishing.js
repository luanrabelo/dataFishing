/**
 * dataFishing Web Form - Main Application Controller
 */

class DataFishingApp {
    constructor() {
        this.results = {};
        this.isProcessing = false;
        this.apis = {
            eschmeyer: eschmeyerAPI,
            // Other APIs will be added here
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupApiCards();
        this.createApiCards(); // Add this line
    }

    createApiCards() {
        // Create cards for each API
        Object.keys(Cards).forEach(key => {
            const cardElement = createCard(key, Cards[key]);
            document.getElementById('CardsOpt').appendChild(cardElement);
        });
    }

    bindEvents() {
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.startSearch();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearResults();
        });

        // Export buttons
        document.getElementById('exportExcelBtn').addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            this.exportToCsv();
        });

        // API card interactions
        document.querySelectorAll('.api-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = card.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.updateApiCardState(card, checkbox.checked);
                }
            });
        });

        // Checkbox change events
        document.querySelectorAll('.api-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const card = e.target.closest('.api-card');
                this.updateApiCardState(card, e.target.checked);
            });
        });
    }

    setupApiCards() {
        document.querySelectorAll('.api-card').forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            this.updateApiCardState(card, checkbox.checked);
        });
    }

    updateApiCardState(card, isSelected) {
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }

    async startSearch() {
        if (this.isProcessing) return;

        const speciesText = document.getElementById('speciesInput').value.trim();
        if (!speciesText) {
            alert('Please enter at least one species name.');
            return;
        }

        const speciesList = speciesText.split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (speciesList.length === 0) {
            alert('Please enter valid species names.');
            return;
        }

        const selectedApis = this.getSelectedApis();
        if (selectedApis.length === 0) {
            alert('Please select at least one database.');
            return;
        }

        this.isProcessing = true;
        this.results = {};
        
        try {
            await this.processSpecies(speciesList, selectedApis);
        } catch (error) {
            console.error('Error during search:', error);
            alert('An error occurred during the search. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideProgress();
        }
    }

    getSelectedApis() {
        const selected = [];
        
        // Verificar usando os IDs corretos criados pela função createCheckboxesForCards
        if (document.getElementById('eschmeyer-checkbox')?.checked) {
            selected.push('eschmeyer');
        }
        if (document.getElementById('worms-checkbox')?.checked) {
            selected.push('worms');
        }
        if (document.getElementById('gbif-checkbox')?.checked) {
            selected.push('gbif');
        }
        if (document.getElementById('bold-checkbox')?.checked) {
            selected.push('bold');
        }
        if (document.getElementById('iucn-checkbox')?.checked) {
            selected.push('iucn');
        }
        
        return selected;
    }

    async processSpecies(speciesList, selectedApis) {
        this.showProgress();
        this.updateProgress(0, `Starting search for ${speciesList.length} species...`);

        let totalOperations = speciesList.length * selectedApis.length;
        let completedOperations = 0;

        for (const apiName of selectedApis) {
            console.log(`🔍 Processing ${apiName.toUpperCase()} for ${speciesList.length} species...`);
            
            try {
                const apiResults = await this.processApiForSpecies(apiName, speciesList, (current, total) => {
                    completedOperations++;
                    const progress = (completedOperations / totalOperations) * 100;
                    this.updateProgress(
                        progress, 
                        `${apiName.toUpperCase()}: Processing ${current}/${total} - ${speciesList[current - 1]}`
                    );
                });

                this.results[apiName] = apiResults;
                console.log(`✅ ${apiName.toUpperCase()} completed: ${apiResults.length} results`);

            } catch (error) {
                console.error(`❌ Error processing ${apiName}:`, error);
                this.results[apiName] = this.createErrorResults(speciesList, apiName, error.message);
            }
        }

        this.updateProgress(100, 'Processing complete! Generating results table...');
        await this.delay(500);
        
        this.displayResults();
        this.hideProgress();
        this.showResults();
    }

    async processApiForSpecies(apiName, speciesList, onProgress) {
        switch (apiName) {
            case 'eschmeyer':
                return await eschmeyerAPI.searchBatch(
                    speciesList,
                    onProgress,
                    (result, current, total) => {
                        console.log(`🐟 Eschmeyer - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
                    }
                );
            
            case 'worms':
                return await wormsAPI.searchBatch(
                    speciesList,
                    onProgress,
                    (result, current, total) => {
                        console.log(`🌊 WoRMS - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
                    }
                );
            
            // Add cases for other APIs here as they are implemented
            default:
                throw new Error(`Unknown API: ${apiName}`);
        }
    }

    createErrorResults(speciesList, apiName, errorMessage) {
        return speciesList.map(species => ({
            speciesName: species,
            status: 'Error',
            error: errorMessage,
            // Add default fields based on API
            ...(apiName === 'eschmeyer' && {
                acceptedName: '-',
                acceptedAuthorYear: '-',
                originalGenus: '-',
                originalEpithet: '-',
                originalAuthorYear: '-',
                family: '-',
                subfamily: '-',
                habitat: '-',
                typeLocality: '-',
                typeSpecimens: '-',
                synonymsCount: '0',
                rawText: errorMessage
            })
        }));
    }

    displayResults() {
        const tableContainer = document.querySelector('.table-responsive');
        const resultsTable = document.getElementById('resultsTable');
        const tableHeaders = document.getElementById('tableHeaders');
        const tableBody = document.getElementById('tableBody');
        const resultsInfo = document.getElementById('resultsInfo');

        // Clear existing content
        tableHeaders.innerHTML = '';
        tableBody.innerHTML = '';

        if (Object.keys(this.results).length === 0) {
            resultsInfo.textContent = 'No results to display.';
            return;
        }

        // Create combined results table
        const combinedResults = this.combineResults();
        
        if (combinedResults.length === 0) {
            resultsInfo.textContent = 'No valid results found.';
            return;
        }

        // Create headers
        const headers = this.getTableHeaders();
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.label;
            th.title = header.description || header.label;
            tableHeaders.appendChild(th);
        });

        // Create rows
        combinedResults.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            headers.forEach(header => {
                const td = document.createElement('td');
                const value = row[header.key] || '-';
                
                // Apply special formatting based on header key
                if (header.key === 'status' || header.key.includes('Status')) {
                    td.innerHTML = this.formatStatusCell(value);
                } else if (header.key.includes('Name') && header.key !== 'speciesName') {
                    td.innerHTML = `<em>${value}</em>`;
                } else if (header.key === 'downloadSequences' && value !== '-') {
                    td.innerHTML = `<button class="btn btn-sm btn-primary download-sequences-btn" onclick="dataFishingApp.downloadSequences('${row.speciesName}', '${header.api}')" title="Download sequences for ${row.speciesName}">
                        <i class="fas fa-download"></i> Download
                    </button>`;
                } else {
                    td.textContent = value;
                }
                
                tr.appendChild(td);
            });
            
            tableBody.appendChild(tr);
        });

        // Update results info
        const totalSpecies = combinedResults.length;
        const successfulResults = combinedResults.filter(r => 
            r.status && r.status !== 'Error' && r.status !== 'Not Found'
        ).length;
        
        resultsInfo.innerHTML = `
            <strong>Results Summary:</strong> 
            ${totalSpecies} species processed, 
            ${successfulResults} successful matches 
            (${((successfulResults / totalSpecies) * 100).toFixed(1)}% success rate)
        `;
    }

    combineResults() {
        const combined = [];
        const allSpecies = new Set();

        // Collect all species from all API results
        Object.values(this.results).forEach(apiResults => {
            apiResults.forEach(result => {
                allSpecies.add(result.speciesName);
            });
        });

        // Create combined records
        allSpecies.forEach(species => {
            const combinedRecord = { speciesName: species };

            Object.keys(this.results).forEach(apiName => {
                const apiResult = this.results[apiName].find(r => r.speciesName === species);
                if (apiResult) {
                    Object.keys(apiResult).forEach(key => {
                        if (key !== 'speciesName') {
                            combinedRecord[`${apiName}_${key}`] = apiResult[key];
                        }
                    });
                }
            });

            combined.push(combinedRecord);
        });

        return combined;
    }

    getTableHeaders() {
        const headers = [
            { key: 'speciesName', label: 'Species Name', description: 'Input species name' }
        ];

        // Add headers for each API
        Object.keys(this.results).forEach(apiName => {
            const apiLabel = apiName.charAt(0).toUpperCase() + apiName.slice(1);
            
            if (apiName === 'eschmeyer') {
                headers.push(
                    { key: `${apiName}_status`, label: `${apiLabel} Status`, description: 'Taxonomic status' },
                    { key: `${apiName}_acceptedName`, label: `${apiLabel} Accepted Name`, description: 'Currently accepted name' },
                    { key: `${apiName}_acceptedAuthorYear`, label: `${apiLabel} Authority`, description: 'Author and year' },
                    { key: `${apiName}_family`, label: `${apiLabel} Family`, description: 'Taxonomic family' },
                    { key: `${apiName}_habitat`, label: `${apiLabel} Habitat`, description: 'Habitat information' },
                    { key: `${apiName}_synonymsCount`, label: `${apiLabel} Synonyms #`, description: 'Number of synonyms' }
                );
            } else if (apiName === 'worms') {
                headers.push(
                    { key: `${apiName}_aphiaID`, label: `${apiLabel} AphiaID`, description: 'WoRMS identifier' },
                    { key: `${apiName}_status`, label: `${apiLabel} Status`, description: 'Taxonomic status' },
                    { key: `${apiName}_family`, label: `${apiLabel} Family`, description: 'Taxonomic family' },
                    { key: `${apiName}_authority`, label: `${apiLabel} Authority`, description: 'Species authority' },
                    { key: `${apiName}_isMarine`, label: `${apiLabel} Marine`, description: 'Marine environment' },
                    { key: `${apiName}_isBrackish`, label: `${apiLabel} Brackish`, description: 'Brackish environment' },
                    { key: `${apiName}_isFreshwater`, label: `${apiLabel} Freshwater`, description: 'Freshwater environment' }
                );
            }

            // Add download button column for BOLD if enabled
            if (apiName === 'bold' && document.getElementById('boldDownloadSequences')?.checked) {
                headers.push({
                    key: 'downloadSequences',
                    label: 'Download Sequences',
                    description: 'Download BOLD sequences',
                    api: apiName
                });
            }
        });

        return headers;
    }

    formatStatusCell(status) {
        const statusLower = status.toLowerCase();
        let className = '';
        let icon = '';

        if (statusLower === 'valid') {
            className = 'status-valid';
            icon = '<i class="fas fa-check-circle"></i>';
        } else if (statusLower === 'synonym') {
            className = 'status-synonym';
            icon = '<i class="fas fa-exchange-alt"></i>';
        } else if (statusLower === 'error' || statusLower === 'not found') {
            className = 'status-error';
            icon = '<i class="fas fa-exclamation-triangle"></i>';
        }

        return `<span class="${className}">${icon} ${status}</span>`;
    }

    clearResults() {
        this.results = {};
        this.hideResults();
        this.hideProgress();
        
        // Clear form
        document.getElementById('speciesInput').value = '';
        
        // Uncheck all APIs
        document.querySelectorAll('.api-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            const card = checkbox.closest('.api-card');
            this.updateApiCardState(card, false);
        });
    }

    showProgress() {
        document.querySelector('.progress-container').style.display = 'block';
        document.querySelector('.loading-spinner').style.display = 'inline-block';
        document.getElementById('searchBtn').disabled = true;
    }

    hideProgress() {
        document.querySelector('.progress-container').style.display = 'none';
        document.querySelector('.loading-spinner').style.display = 'none';
        document.getElementById('searchBtn').disabled = false;
    }

    updateProgress(percentage, text) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${Math.round(percentage)}%`;
        progressText.textContent = text;
    }

    showResults() {
        document.querySelector('.results-container').style.display = 'block';
        
        // Scroll to results
        document.querySelector('.results-container').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    hideResults() {
        document.querySelector('.results-container').style.display = 'none';
    }

    downloadSequences(speciesName, apiName) {
        // This will be implemented when BOLD API is added
        console.log(`Download sequences for ${speciesName} from ${apiName}`);
        alert(`Sequence download for ${speciesName} will be implemented when BOLD API is integrated.`);
    }

    exportToExcel() {
        if (Object.keys(this.results).length === 0) {
            alert('No results to export.');
            return;
        }

        const combinedResults = this.combineResults();
        const ws = XLSX.utils.json_to_sheet(combinedResults);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'dataFishing Results');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        XLSX.writeFile(wb, `dataFishing_results_${timestamp}.xlsx`);
    }

    exportToCsv() {
        if (Object.keys(this.results).length === 0) {
            alert('No results to export.');
            return;
        }

        const combinedResults = this.combineResults();
        const headers = Object.keys(combinedResults[0]);
        
        let csvContent = headers.join(',') + '\n';
        combinedResults.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvContent += values.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `dataFishing_results_${timestamp}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataFishingApp = new DataFishingApp();
});

// Add global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// Configuração dos cards
var Cards = {
    'eschmeyer': [
        'Eschmeyer_All_data*',
        'Eschmeyer_Taxonomy*',
        'Eschmeyer_Status*',
        'Eschmeyer_Accepted_Name*',
        'Eschmeyer_Family*',
        'Eschmeyer_Synonyms*'
    ],
    'worms': [
        'WoRMS_All_data*',
        'WoRMS_Taxonomy*',
        'WoRMS_Authority*',
        'WoRMS_Valid_Species_Name*',
        'WoRMS_Valid_Authority*',
        'WoRMS_Species_Status*',
        'WoRMS_Marine_Environment*',
        'WoRMS_Brackish_Environment*',
        'WoRMS_Freshwater_Environment*',
        'WoRMS_Terrestrial_Environment*',
        'WoRMS_Extinct_Status*',
        'WoRMS_Match_Type*',
        'WoRMS_Modified_Date*',
        'WoRMS_Citation*'
    ],
    'gbif': [
        'GBIF_All_data*',
        'GBIF_Taxonomy*',
        "GBIF_Basionym*",
        "GBIF_Vernacular_Name*",
        "GBIF_Taxonomic_Status*"
    ],
    'bold': [
        'BOLD_All_data*',
        'BOLD_Taxonomy*',
        'BOLD_Sequences*'
    ],
    'iucn': [
        'IUCN_All_data',
        'IUCN_Common_Names',
        'IUCN_Country_Occurrence',
        'IUCN_Habitats',
        'IUCN_Species_Author*',
        'IUCN_Status_Conservation*',
        'IUCN_Synonyms_Names',
        'IUCN_Taxonomy*',
        'IUCN_Threats'
    ]
};

var NamesCards = {
    'eschmeyer': 'Eschmeyer\'s Catalog of Fishes',
    'worms': 'World Register of Marine Species',
    'gbif': 'Global Biodiversity Information Facility',
    'bold': 'Barcode of Life Data Systems <sup>beta</sup>',
    'iucn': 'Red List of Threatened Species'
};

function createCheckboxesForCards(Cards) {
    const container = document.getElementById('checkbox-container');
    
    if (!container) {
        console.error('Checkbox container not found');
        return;
    }

    container.innerHTML = '';
    container.className = 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xxl:grid-cols-5 gap-1 px-1 py-1';
    
    const allCheckboxes = [];

    Object.keys(Cards).forEach(key => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'flex items-center space-x-2 my-5';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = key + '-checkbox';
        checkbox.checked = false;
        checkbox.className = 'sr-only peer';

        const stateIcon = document.createElement('i');
        stateIcon.className = 'fas fa-times text-black text-xl absolute';
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';

        allCheckboxes.push({ checkbox, label, stateIcon });

        const updateStyles = () => {
            const anyChecked = allCheckboxes.some(item => item.checkbox.checked);

            allCheckboxes.forEach(item => {
                if (item.checkbox.checked) {
                    item.label.classList.remove('bg-orange-500', 'bg-gray-400');
                    item.label.classList.add('bg-gray-800');
                    item.stateIcon.className = 'fas fa-check text-white text-xl absolute';
                } else if (anyChecked) {
                    item.label.classList.remove('bg-gray-800', 'bg-orange-500');
                    item.label.classList.add('bg-gray-400', 'cursor-not-allowed');
                    item.stateIcon.className = 'fas fa-ban text-gray-500 text-xl absolute';
                    item.checkbox.disabled = true;
                } else {
                    item.label.classList.remove('bg-gray-800', 'bg-gray-400', 'cursor-not-allowed');
                    item.label.classList.add('bg-orange-500');
                    item.stateIcon.className = 'fas fa-times text-black text-xl absolute';
                    item.checkbox.disabled = false;
                }
            });
        };

        checkbox.addEventListener('change', function() {
            const card = document.getElementById(key + 'Card');
            if (this.checked) {
                allCheckboxes.forEach(item => {
                    if (item.checkbox !== this) {
                        item.checkbox.checked = false;
                        const otherCard = document.getElementById(item.checkbox.id.replace('-checkbox', 'Card'));
                        if (otherCard) {
                            otherCard.classList.add('hidden');
                            otherCard.classList.remove('fade-in');
                        }
                    }
                });

                if (card) {
                    card.classList.remove('hidden');
                    card.classList.add('fade-in');
                }
            } else {
                if (card) {
                    card.classList.add('fade-out');
                    setTimeout(() => {
                        card.classList.add('hidden');
                        card.classList.remove('fade-out');
                    }, 500);
                }
            }
            updateStyles();
        });

        label.classList.add('bg-orange-500');

        label.appendChild(checkbox);
        label.appendChild(stateIcon);

        const textLabel = document.createElement('span');
        textLabel.className = 'ml-5 text-xl text-gray-800';
        textLabel.innerHTML = `${NamesCards[key]}<br>(<strong>${key.toUpperCase()}</strong>)`;

        wrapperDiv.appendChild(label);
        wrapperDiv.appendChild(textLabel);
        container.appendChild(wrapperDiv);
    });

    allCheckboxes.forEach(item => {
        item.label.classList.add('bg-orange-500');
        item.stateIcon.className = 'fas fa-times text-black text-xl absolute';
        item.stateIcon.style.top = '50%';
        item.stateIcon.style.left = '50%';
        item.stateIcon.style.transform = 'translate(-50%, -50%)';
    });
}

function createCard(cardTitle, options) {
    const cardContainer = document.createElement('div');
    cardContainer.id = cardTitle + 'Card';
    cardContainer.className = 'bg-white rounded hidden mb-4 mx-1';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-1 px-1 rounded mx-1 my-2';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-xl">2</div>
        <div class="text-2xl font-semibold">Search Options of <span class="font-bold">${NamesCards[cardTitle]}</span></div>
    `;
    cardContainer.appendChild(cardHeader);

    const cardBody = document.createElement('div');
    cardBody.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start px-4 py-4';
    cardContainer.appendChild(cardBody);

    const allInputs = [];

    function updateAllInputStyles() {
        const anyChecked = allInputs.some(input => input.checked);

        allInputs.forEach(input => {
            const label = input.parentElement;
            const icon = label.querySelector('i');

            if (input.checked) {
                label.classList.remove('bg-orange-500', 'bg-gray-400');
                label.classList.add('bg-gray-800');
                icon.className = 'fas fa-check text-white text-xl absolute';
            } else if (anyChecked) {
                label.classList.remove('bg-gray-800', 'bg-gray-400');
                label.classList.add('bg-orange-500');
                icon.className = 'fas fa-times text-black text-xl absolute';
            } else {
                label.classList.remove('bg-gray-800', 'bg-orange-500');
                label.classList.add('bg-gray-400');
                icon.className = 'fas fa-circle text-white text-xl absolute';
            }
        });
    }

    options.forEach(option => {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'flex items-start space-x-3 my-3 w-full';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300 flex-shrink-0 bg-gray-400';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = option.includes('*');
        toggleInput.id = option.toLowerCase().replace(cardTitle.toLowerCase() + '_', '') + 'opt';
        toggleInput.className = 'toggle-checkbox sr-only peer';

        allInputs.push(toggleInput);

        toggleInput.addEventListener('change', function () {
            updateAllInputStyles();
        });

        const stateIcon = document.createElement('i');
        stateIcon.className = 'fas fa-circle text-white text-xl absolute';
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';

        label.appendChild(toggleInput);
        label.appendChild(stateIcon);

        const columnLabel = document.createElement('span');
        columnLabel.textContent = option.replace(new RegExp('^' + cardTitle + '_', 'i'), '').replace(/_/g, ' ').replace('*', '');
        columnLabel.className = 'text-base text-gray-800 leading-tight break-words flex-grow';

        toggleContainer.appendChild(label);
        toggleContainer.appendChild(columnLabel);
        cardBody.appendChild(toggleContainer);
    });

    updateAllInputStyles();

    const infoText = document.createElement('div');
    infoText.className = 'bg-gray-200 text-lg px-4 pt-4 pb-4 rounded text-center col-span-full w-full mx-auto my-5';
    infoText.innerHTML = `
        <p class="font-bold">* Mandatory Fields</p>
        <p><i class="fas fa-info-circle"></i> Click and select the options to search for ${NamesCards[cardTitle]} <b>(${cardTitle})</b></p>
        <p><i class="fas fa-info-circle"></i> Please note that a full data search may take considerable time. We appreciate your patience during processing.</p>
    `;
    cardBody.appendChild(infoText);

    return cardContainer;
}

function updateDataResults() {
    console.log('Data results updated successfully');
}

async function getEschmeyer() {
    console.log('getEschmeyer called');
    
    // Verificar se o eschmeyerAPI está disponível
    if (typeof window.eschmeyerAPI === 'undefined' || !window.eschmeyerAPI) {
        console.error('❌ eschmeyerAPI is not available. Attempting to initialize...');
        
        if (typeof EschmeyerAPI !== 'undefined') {
            window.eschmeyerAPI = new EschmeyerAPI();
            console.log('✅ eschmeyerAPI initialized successfully');
        } else {
            console.error('❌ EschmeyerAPI class not found. Please check if eschmeyer.js is loaded.');
            alert('Erro: API do Eschmeyer não está carregada. Por favor, recarregue a página e tente novamente.');
            return;
        }
    }

    const statusColor = {
        'Valid': '#BACD92',
        'Synonym': '#FFE066',
        'Error': '#FA7070',
        'Not Found': '#D1D1C7'
    };

    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
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

    console.log(`🐟 Starting Eschmeyer search for ${speciesNames.length} species...`);
    console.log(`🐟 Note: Using CORS proxy servers to access Eschmeyer database from browser`);

    // Verificar quais campos opcionais estão selecionados
    const eschmeyerStatusOpt = document.getElementById('statusopt')?.checked ?? true;
    const eschmeyerAcceptedNameOpt = document.getElementById('accepted_nameopt')?.checked ?? true;
    const eschmeyerFamilyOpt = document.getElementById('familyopt')?.checked ?? true;
    const eschmeyerSynonymsOpt = document.getElementById('synonymsopt')?.checked ?? true;

    const _eschmeyerTable = document.createElement('table');
    _eschmeyerTable.id = 'TableResults';
    _eschmeyerTable.classList.add(
        "text-base",
        "text-blue-800",
        "table-auto",
        "border-collapse",
        "w-full"
    );

    let headerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap">
        <tr>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 0)">
                Species Name <i class="fas fa-sort ml-2"></i>
            </th>
            ${eschmeyerStatusOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${1})">Status <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${eschmeyerAcceptedNameOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${1 + (eschmeyerStatusOpt ? 1 : 0)})">Accepted Name <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${1 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0)})">
                Authority <i class="fas fa-sort ml-2"></i>
            </th>
            ${eschmeyerFamilyOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${2 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0)})">Family <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${2 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0) + (eschmeyerFamilyOpt ? 1 : 0)})">
                Habitat <i class="fas fa-sort ml-2"></i>
            </th>
            ${eschmeyerSynonymsOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${3 + (eschmeyerStatusOpt ? 1 : 0) + (eschmeyerAcceptedNameOpt ? 1 : 0) + (eschmeyerFamilyOpt ? 1 : 0)})">Synonyms Count <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _eschmeyerTable.innerHTML = headerHTML;

    const _eschmeyerTableBody = _eschmeyerTable.createTBody();
    _eschmeyerTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _eschmeyerTableWrapper = document.createElement('div');
    _eschmeyerTableWrapper.classList.add(
        "w-full",
        "overflow-x-auto",
        "overflow-y-auto",
        "mx-auto"
    );
    _eschmeyerTableWrapper.appendChild(_eschmeyerTable);

    const eschmeyerResults = document.getElementById('Results');
    eschmeyerResults.innerHTML = '';
    eschmeyerResults.appendChild(_eschmeyerTableWrapper);

    try {
        console.log('🐟 Using eschmeyerAPI.searchBatch...');
        
        const results = await window.eschmeyerAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;
                progressBar.style.width = progress + '%';
                progressText.textContent = Math.round(progress) + '%';
            },
            (result, current, total) => {
                console.log(`🐟 Eschmeyer - Completed ${current}/${total}: ${result.speciesName} (${result.status})`);
            }
        );

        console.log(`🐟 Eschmeyer search completed. Processing ${results.length} results...`);

        // Contar resultados com sucesso e erros
        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
            const row = _eschmeyerTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );
            
            let cellIndex = 0;

            // Species Name
            const speciesCell = row.insertCell(cellIndex++);
            speciesCell.innerHTML = `<i>${result.speciesName}</i>`;
            speciesCell.className = "py-5 px-5";

            // Status (if enabled)
            if (eschmeyerStatusOpt) {
                const statusCell = row.insertCell(cellIndex++);
                const statusColor = result.status === 'Valid' ? '#BACD92' : 
                                   result.status === 'Synonym' ? '#FFE066' : 
                                   result.status === 'Error' ? '#FA7070' : '#D1D1C7';
                statusCell.innerHTML = result.status;
                statusCell.className = "py-5 px-5 font-bold";
                statusCell.style.backgroundColor = statusColor;
            }

            // Accepted Name (if enabled)
            if (eschmeyerAcceptedNameOpt) {
                const acceptedNameCell = row.insertCell(cellIndex++);
                acceptedNameCell.innerHTML = `<i>${result.acceptedName}</i>`;
                acceptedNameCell.className = "py-5 px-5";
            }

            // Authority
            const authorityCell = row.insertCell(cellIndex++);
            authorityCell.innerHTML = result.acceptedAuthorYear;
            authorityCell.className = "py-5 px-5";

            // Family (if enabled)
            if (eschmeyerFamilyOpt) {
                const familyCell = row.insertCell(cellIndex++);
                familyCell.innerHTML = result.family;
                familyCell.className = "py-5 px-5";
            }

            // Habitat
            const habitatCell = row.insertCell(cellIndex++);
            habitatCell.innerHTML = result.habitat;
            habitatCell.className = "py-5 px-5";

            // Synonyms Count (if enabled)
            if (eschmeyerSynonymsOpt) {
                const synonymsCell = row.insertCell(cellIndex++);
                synonymsCell.innerHTML = result.synonymsCount;
                synonymsCell.className = "py-5 px-5 text-center";
            }

            // Link
            const linkCell = row.insertCell(cellIndex++);
            linkCell.innerHTML = `
                <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md" 
                   href="https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp?tbl=species&genus=${encodeURIComponent(result.speciesName.split(' ')[0])}&species=${encodeURIComponent(result.speciesName.split(' ')[1])}" 
                   target="_blank">
                    <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                    View
                </a>
            `;
            linkCell.className = "py-5 px-5";

            // Contar status para estatísticas
            if (result.status === 'Valid' || result.status === 'Synonym') {
                successCount++;
            } else if (result.status === 'Error') {
                errorCount++;
            }
        }

        // Mostrar aviso sobre o uso de proxy se houve erros
        if (errorCount > 0) {
            const corsNotice = document.createElement('div');
            corsNotice.className = 'bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4';
            corsNotice.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">
                            <strong>Browser Notice:</strong> ${errorCount} of ${results.length} requests failed. 
                            The Eschmeyer database requires special CORS proxy servers for browser access.
                        </p>
                        <p class="text-sm mt-2">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                        <p class="text-sm mt-2">
                            <i class="fas fa-lightbulb"></i> 
                            <strong>Tip:</strong> For better reliability with large datasets, consider using the Python version of dataFishing.
                        </p>
                    </div>
                </div>
            `;
            eschmeyerResults.insertBefore(corsNotice, _eschmeyerTableWrapper);
        } else if (successCount > 0) {
            // Mostrar notice de sucesso
            const successNotice = document.createElement('div');
            successNotice.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4';
            successNotice.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">
                            <strong>Success:</strong> Successfully accessed Eschmeyer database using CORS proxy servers.
                        </p>
                        <p class="text-sm mt-2">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            eschmeyerResults.insertBefore(successNotice, _eschmeyerTableWrapper);
        }

        // Adicionar controles de filtro, busca e exportação ANTES da tabela
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="eschmeyer-table-search" class="text-lg font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in Eschmeyer Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input 
                            type="text" 
                            id="eschmeyer-table-search" 
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="eschmeyer-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
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
                <h4 class="text-lg font-semibold text-gray-800 mb-3">
                    <i class="fas fa-columns mr-2"></i>Toggle Column Visibility
                </h4>
                <div id="eschmeyer-column-filters" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-start"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-lg font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="eschmeyer-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="eschmeyer-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>
                        Export to TSV
                    </button>
                </div>
                <p class="text-sm text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results.
                </p>
            </div>
        `;

        // Inserir controles ANTES da tabela
        eschmeyerResults.insertBefore(controlsContainer, _eschmeyerTableWrapper);

        // Configurar funcionalidades dos controles

        // 1. Criar filtros de coluna
        createColumnFilters('TableResults', 'eschmeyer-column-filters');

        // 2. Configurar busca na tabela
        const searchInput = document.getElementById('eschmeyer-table-search');
        const clearButton = document.getElementById('eschmeyer-search-clear');
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
                filterAndHighlightTable('TableResults', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('TableResults', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('TableResults', '');
                updateSearchResultsCounter('', 0);
            }
        });

        // 3. Configurar botões de exportação
        document.getElementById('eschmeyer-export-excel').addEventListener('click', function() {
            exportTableToExcel('TableResults');
        });

        document.getElementById('eschmeyer-export-tsv').addEventListener('click', function() {
            exportTableToTSV('TableResults');
        });

        setTimeout(() => {
            progressModal.classList.add('hidden');
        }, 1000);

        updateDataResults();

        console.log(`🐟 Eschmeyer search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('❌ Error during Eschmeyer search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('dataFishing.js - DOM loaded');
    
    const textField = document.getElementById('speciesNames');
    if (textField) {
        textField.value = '';
        console.log('Species input field cleared');
    }

    // Verificar disponibilidade das APIs após um pequeno delay para garantir que todos os scripts foram carregados
    setTimeout(() => {
        console.log('Checking API availability:');
        console.log('- EschmeyerAPI class:', typeof EschmeyerAPI !== 'undefined' ? '✅ Available' : '❌ Missing');
        console.log('- eschmeyerAPI instance:', typeof window.eschmeyerAPI !== 'undefined' ? '✅ Available' : '❌ Missing');
        
        // Inicializar eschmeyerAPI se a classe estiver disponível mas a instância não
        if (typeof EschmeyerAPI !== 'undefined' && typeof window.eschmeyerAPI === 'undefined') {
            window.eschmeyerAPI = new EschmeyerAPI();
            console.log('✅ eschmeyerAPI instance created');
        }
    }, 100);

    createCheckboxesForCards(Cards);
    console.log('Database selection checkboxes created');
    
    Object.keys(Cards).forEach(key => {
        const cardElement = createCard(key, Cards[key]);
        const cardsContainer = document.getElementById('CardsOpt');
        if (cardsContainer) {
            cardsContainer.appendChild(cardElement);
        }
    });
    console.log('Configuration cards created');

    const exampleSpecies = document.getElementById('exampleSpecies');
    if (exampleSpecies) {
        exampleSpecies.addEventListener('click', function () {
            const species = [
                "Ailuropoda melanoleuca",
                "Ara macao",
                "Balaenoptera musculus",
                "Carcharodon carcharias",
                "Dendrobates tinctorius",
                "Elephas maximus",
                "Eretmochelys imbricata",
                "Gorilla gorilla",
                "Pan paniscus",
                "Panthera tigris"
            ];
            
            const speciesNames = document.getElementById('speciesNames');
            if (speciesNames) {
                speciesNames.value = species.join('\n');
                console.log('Example species loaded');
            }
        });
    }

    const startSearch = document.getElementById('startSearch');
    if (startSearch) {
        startSearch.addEventListener('click', function () {
            console.log('Start search button clicked');
            
            // Usar os IDs corretos dos checkboxes
            const eschmeyer = document.getElementById('eschmeyer-checkbox')?.checked;
            const iucn = document.getElementById('iucn-checkbox')?.checked;
            const gbif = document.getElementById('gbif-checkbox')?.checked;
            const worms = document.getElementById('worms-checkbox')?.checked;
            const bold = document.getElementById('bold-checkbox')?.checked;
            
            console.log('Selected databases:', {
                eschmeyer, iucn, gbif, worms, bold
            });
            
            if (eschmeyer) {
                console.log('Starting Eschmeyer search...');
                getEschmeyer();
            } else if (worms) {
                console.log('Starting WoRMS search...');
                getWoRMS();
            } else if (iucn) {
                alert('IUCN API not yet implemented in web version');
            } else if (gbif) {
                alert('GBIF API not yet implemented in web version');
            } else if (bold) {
                alert('BOLD Systems API not yet implemented in web version');
            } else {
                alert('Please select a database to search.');
                return;
            }
        });
        console.log('Start search button event listener added');
    } else {
        console.error('Start search button not found');
    }
});

window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});