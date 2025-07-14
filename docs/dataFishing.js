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
            
            case 'gbif':
                return await gbifAPI.searchBatch(
                    speciesList,
                    onProgress,
                    (result, current, total) => {
                        console.log(`🌍 GBIF - Completed ${current}/${total}: ${result.speciesName} (${result.taxonomicStatus})`);
                    }
                );
            
            case 'bold':
                return await boldAPI.searchBatch(
                    speciesList,
                    onProgress,
                    (result, current, total) => {
                        console.log(`🧬 BOLD - Completed ${current}/${total}: ${result.speciesName} (${result.sequencesCount} sequences)`);
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
            } else if (apiName === 'gbif') {
                headers.push(
                    { key: `${apiName}_key`, label: `${apiLabel} Key`, description: 'GBIF identifier' },
                    { key: `${apiName}_taxonomicStatus`, label: `${apiLabel} Status`, description: 'Taxonomic status' },
                    { key: `${apiName}_family`, label: `${apiLabel} Family`, description: 'Taxonomic family' },
                    { key: `${apiName}_scientificName`, label: `${apiLabel} Scientific Name`, description: 'Full scientific name' },
                    { key: `${apiName}_authorship`, label: `${apiLabel} Authorship`, description: 'Species authorship' },
                    { key: `${apiName}_taxonRank`, label: `${apiLabel} Rank`, description: 'Taxonomic rank' }
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
    //'bold': [
    //    'BOLD_All_data*',
    //    'BOLD_Taxonomy*',
    //    'BOLD_Sequences*'
    //],
    //'iucn': [
    //    'IUCN_All_data',
    //    'IUCN_Common_Names',
    //    'IUCN_Country_Occurrence',
    //    'IUCN_Habitats',
    //    'IUCN_Species_Author*',
    //    'IUCN_Status_Conservation*',
    //    'IUCN_Synonyms_Names',
    //    'IUCN_Taxonomy*',
    //    'IUCN_Threats'
    //]
};

var NamesCards = {
    'eschmeyer': 'Eschmeyer\'s Catalog of Fishes',
    'worms': 'World Register of Marine Species',
    'gbif': 'Global Biodiversity Information Facility',
    //'bold': 'Barcode of Life Data Systems',
    //'iucn': 'IUCN Red List of Threatened Species'
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

        allCheckboxes.push({ checkbox, label, stateIcon, wrapperDiv });

        const updateStyles = () => {
            const checkedBoxes = allCheckboxes.filter(item => item.checkbox.checked);
            const anyChecked = checkedBoxes.length > 0;

            allCheckboxes.forEach(item => {
                if (item.checkbox.checked) {
                    // Checkbox selecionado - estilo ativo
                    item.label.classList.remove('bg-orange-500', 'bg-gray-400', 'cursor-not-allowed');
                    item.label.classList.add('bg-gray-800', 'cursor-pointer');
                    item.stateIcon.className = 'fas fa-check text-white text-xl absolute';
                    item.checkbox.disabled = false;
                    item.wrapperDiv.style.pointerEvents = 'auto';
                    item.wrapperDiv.style.opacity = '1';
                } else if (anyChecked) {
                    // Outros checkboxes quando um está selecionado - REALMENTE desabilitados
                    item.label.classList.remove('bg-gray-800', 'bg-orange-500', 'cursor-pointer');
                    item.label.classList.add('bg-gray-400', 'cursor-not-allowed');
                    item.stateIcon.className = 'fas fa-ban text-gray-600 text-xl absolute';
                    item.checkbox.disabled = true;
                    item.wrapperDiv.style.pointerEvents = 'none'; // Bloquear TODOS os eventos do mouse
                    item.wrapperDiv.style.opacity = '0.6';
                    item.wrapperDiv.style.cursor = 'not-allowed';
                } else {
                    // Estado inicial - todos disponíveis
                    item.label.classList.remove('bg-gray-800', 'bg-gray-400', 'cursor-not-allowed');
                    item.label.classList.add('bg-orange-500', 'cursor-pointer');
                    item.stateIcon.className = 'fas fa-times text-black text-xl absolute';
                    item.checkbox.disabled = false;
                    item.wrapperDiv.style.pointerEvents = 'auto';
                    item.wrapperDiv.style.opacity = '1';
                    item.wrapperDiv.style.cursor = 'pointer';
                }
            });
        };

        // Função para alternar checkbox (só funciona se não estiver desabilitado)
        const toggleCheckbox = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Verificar se o checkbox está desabilitado
            if (checkbox.disabled) {
                return false;
            }
            
            const card = document.getElementById(key + 'Card');
            
            if (checkbox.checked) {
                // Desmarcando
                checkbox.checked = false;
                if (card) {
                    card.classList.add('fade-out');
                    setTimeout(() => {
                        card.classList.add('hidden');
                        card.classList.remove('fade-out');
                    }, 500);
                }
            } else {
                // Marcando - desmarcar todos os outros primeiro
                allCheckboxes.forEach(item => {
                    if (item.checkbox !== checkbox) {
                        item.checkbox.checked = false;
                        const otherCard = document.getElementById(item.checkbox.id.replace('-checkbox', 'Card'));
                        if (otherCard) {
                            otherCard.classList.add('hidden');
                            otherCard.classList.remove('fade-in');
                        }
                    }
                });

                // Marcar o atual
                checkbox.checked = true;
                if (card) {
                    card.classList.remove('hidden');
                    card.classList.add('fade-in');
                }
            }
            
            updateStyles();
            return false;
        };

        // Adicionar event listeners para o wrapper inteiro
        wrapperDiv.addEventListener('click', toggleCheckbox);
        wrapperDiv.addEventListener('mousedown', (e) => {
            if (checkbox.disabled) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        // Event listener direto no checkbox também
        checkbox.addEventListener('change', function(e) {
            if (this.disabled) {
                e.preventDefault();
                return false;
            }
            updateStyles();
        });

        // Configuração inicial
        label.classList.add('bg-orange-500', 'cursor-pointer');

        label.appendChild(checkbox);
        label.appendChild(stateIcon);

        const textLabel = document.createElement('span');
        textLabel.className = 'ml-5 text-xl text-gray-800 font-medium select-none';
        textLabel.innerHTML = NamesCards[key]; // Apenas o nome completo, sem parênteses

        wrapperDiv.appendChild(label);
        wrapperDiv.appendChild(textLabel);
        container.appendChild(wrapperDiv);
    });

    // Configuração inicial dos estilos
    allCheckboxes.forEach(item => {
        item.label.classList.add('bg-orange-500', 'cursor-pointer');
        item.stateIcon.className = 'fas fa-times text-black text-xl absolute';
        item.stateIcon.style.top = '50%';
        item.stateIcon.style.left = '50%';
        item.stateIcon.style.transform = 'translate(-50%, -50%)';
        item.wrapperDiv.style.cursor = 'pointer';
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
            } else if (gbif) {
                console.log('Starting GBIF search...');
                getGBIF();
            } else if (bold) {
                console.log('Starting BOLD search...');
                getBOLD();
            } else if (iucn) {
                console.log('Starting IUCN search...');
                getIUCN();
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

function getRandomTip() {
    const toolTips = {
        SynGenes: [
            'a Python class for standardizing nomenclatures of mitochondrial and chloroplast genes and a web form for enhancing searches for evolutionary analyses.',
            'https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-024-05781-y'
        ],
        ForAlexa: [
            "an online tool for the rapid development of artificial intelligence skills for the teaching of evolutionary biology using Amazon's Alexa.",
            'https://link.springer.com/article/10.1186/s12052-022-00169-z'
        ],
        dataFishing: [
            "An efficient Python tool and user-friendly web-form for mining mitochondrial and chloroplast sequences, taxonomic, and biodiversity data.",
            'https://doi.org/10.1016/j.ecoinf.2024.102970'
        ],
    };
    const keys = Object.keys(toolTips);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { key: randomKey, description: toolTips[randomKey][0], link: toolTips[randomKey][1] };
}

function displayTip() {
    const tip = getRandomTip(); // Get a random tip
    const container = document.querySelector('.tip-container');
    container.classList.remove('fade-out');
    container.classList.add('fade-in');
    container.style.display = 'block';
    container.innerHTML = `
    <div class="bg-gray-700 overflow-hidden px-5 py-5">
        <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            
            <div class="flex-shrink-0 text-center sm:text-center md:text-left lg:text-left xl:text-left">
                <span class="text-white font-semibold leading-6 rounded-full bg-gray-800 px-3 py-3 text-base">Explore other tools:</span>
            </div>
            
            <div class="flex-grow sm:text-justify md:text-center lg:text-center xl:text-center">
                <div class="text-white font-semibold leading-6 sm:text-base md:text-lg lg:text-2xl xl:text-2xl xxl:text-2xl">
                    <strong>${tip.key}</strong> ${tip.description}
                </div>
            </div>

            <div class="flex-shrink-0 text-center sm:text-center md:text-left lg:text-left xl:text-left">
                <a href="${tip.link}" target="_blank" class="rounded-full bg-gray-800 px-3 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-gray-400 hover:ring-2 hover:ring-white hover:scale-105">Learn More <span aria-hidden="true">→</span></a>
            </div>

        </div>
    </div>
    `;
}