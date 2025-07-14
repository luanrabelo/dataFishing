/**
 * UI Components and Card Creation Functions
 */

// Card configuration data
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

/**
 * Create a database selection card
 */
function createCard(apiKey, cardData) {
    const cardElement = document.createElement('div');
    cardElement.className = 'bg-white rounded mb-4 hidden'; // Start hidden
    cardElement.id = `${apiKey}Card`;

    // Card header with step number and title
    const cardHeader = document.createElement('div');
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-1 px-1 rounded-t';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-xl">2</div>
        <div class="text-2xl font-semibold">Configure ${NamesCards[apiKey]} options</div>
    `;
    cardElement.appendChild(cardHeader);

    // Card body
    const cardBody = document.createElement('div');
    cardBody.className = 'px-4 py-4';
    cardElement.appendChild(cardBody);

    // Options grid
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4';
    cardBody.appendChild(optionsGrid);

    // Create options for each data type
    cardData.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex items-center space-x-2 my-2';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300 bg-gray-800';

        const optionId = option.toLowerCase().replace(/[^a-z0-9]/g, '');
        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.checked = option.includes('*'); // Default checked if marked with *
        switchInput.id = optionId + 'opt';
        switchInput.className = 'sr-only peer';

        const switchIcon = document.createElement('i');
        switchIcon.className = 'fas fa-eye text-white text-xl absolute';
        switchIcon.style.top = '50%';
        switchIcon.style.left = '50%';
        switchIcon.style.transform = 'translate(-50%, -50%)';

        // Update switch appearance based on state
        const updateSwitch = () => {
            if (switchInput.checked) {
                label.classList.remove('bg-gray-400');
                label.classList.add('bg-gray-800');
                switchIcon.className = 'fas fa-eye text-white text-xl absolute';
            } else {
                label.classList.remove('bg-gray-800');
                label.classList.add('bg-gray-400');
                switchIcon.className = 'fas fa-eye-slash text-white text-xl absolute';
            }
        };

        switchInput.addEventListener('change', updateSwitch);
        updateSwitch(); // Set initial state

        label.appendChild(switchInput);
        label.appendChild(switchIcon);

        const optionLabel = document.createElement('span');
        optionLabel.className = 'ml-3 text-base text-gray-800 leading-tight';
        optionLabel.innerHTML = option.replace('*', '').replace(/_/g, ' ');

        optionDiv.appendChild(label);
        optionDiv.appendChild(optionLabel);
        optionsGrid.appendChild(optionDiv);
    });

    // Special options for specific APIs
    if (apiKey === 'bold') {
        addBoldSpecialOptions(cardBody);
    } else if (apiKey === 'iucn') {
        addIucnSpecialOptions(cardBody);
    }

    return cardElement;
}

/**
 * Add special options for BOLD Systems
 */
function addBoldSpecialOptions(cardBody) {
    const specialDiv = document.createElement('div');
    specialDiv.className = 'mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400';
    
    specialDiv.innerHTML = `
        <h4 class="text-lg font-semibold text-blue-800 mb-3">
            <i class="fas fa-dna mr-2"></i>Sequence Download Options
        </h4>
        <div class="flex items-center space-x-3">
            <label class="relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300 bg-gray-800">
                <input type="checkbox" id="boldDownloadSequences" class="sr-only peer">
                <i class="fas fa-download text-white text-xl absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%);"></i>
            </label>
            <span class="text-base text-gray-800">
                <strong>Download Sequences:</strong> Download DNA barcode sequences in FASTA format
            </span>
        </div>
        <p class="text-sm text-blue-700 mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            Sequences will be organized by species and saved as FASTA files.
        </p>
    `;
    
    cardBody.appendChild(specialDiv);
}

/**
 * Add special options for IUCN
 */
function addIucnSpecialOptions(cardBody) {
    const specialDiv = document.createElement('div');
    specialDiv.className = 'mt-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-400';
    
    specialDiv.innerHTML = `
        <h4 class="text-lg font-semibold text-red-800 mb-3">
            <i class="fas fa-key mr-2"></i>API Configuration Required
        </h4>
        <div class="space-y-3">
            <div>
                <label for="iucnApiKey" class="block text-sm font-medium text-red-700 mb-1">
                    IUCN API Token:
                </label>
                <input 
                    type="password" 
                    id="iucnApiKey" 
                    class="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your IUCN API token"
                >
            </div>
            <p class="text-sm text-red-700">
                <i class="fas fa-info-circle mr-1"></i>
                Request your free API token at: 
                <a href="https://apiv3.iucnredlist.org/api/v3/token" target="_blank" class="underline text-red-600 hover:text-red-800">
                    IUCN Red List API
                </a>
            </p>
        </div>
    `;
    
    cardBody.appendChild(specialDiv);
}

/**
 * Create checkboxes for database selection
 */
function createCheckboxesForCards(Cards) {
    const container = document.getElementById('checkbox-container');
    
    if (!container) {
        console.error('Checkbox container not found');
        return;
    }

    // Clear existing content
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
        
        // Icon for checkbox state
        const stateIcon = document.createElement('i');
        stateIcon.className = 'fas fa-times text-black text-xl absolute';
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';
        
        // Add checkbox to list for global control
        allCheckboxes.push({ checkbox, label, stateIcon });
        
        // Update styles based on checkbox state
        const updateStyles = () => {
            if (checkbox.checked) {
                label.classList.remove('bg-orange-500');
                label.classList.add('bg-gray-800');
                stateIcon.className = 'fas fa-check text-white text-xl absolute';
            } else {
                label.classList.remove('bg-gray-800');
                label.classList.add('bg-orange-500');
                stateIcon.className = 'fas fa-times text-black text-xl absolute';
            }
            
            // Manage disabling other checkboxes (only one at a time)
            const anyChecked = allCheckboxes.some(item => item.checkbox.checked);
            allCheckboxes.forEach(item => {
                if (!item.checkbox.checked && anyChecked) {
                    item.label.classList.add('bg-gray-200', 'cursor-not-allowed', 'disabled');
                    item.label.classList.remove('bg-orange-500', 'bg-gray-800');
                    item.stateIcon.className = 'fas fa-ban text-gray-500 text-xl absolute';
                } else if (!item.checkbox.checked) {
                    item.label.classList.remove('bg-gray-200', 'cursor-not-allowed', 'disabled');
                    item.label.classList.add('bg-orange-500');
                    item.stateIcon.className = 'fas fa-times text-black text-xl absolute';
                }
            });
        };

        // Checkbox change event
        checkbox.addEventListener('change', function () {
            const card = document.getElementById(key + 'Card');
            if (this.checked) {
                card.classList.remove('hidden');
                card.classList.add('fade-in');
            } else {
                card.classList.add('fade-out');
                setTimeout(() => {
                    card.classList.add('hidden');
                    card.classList.remove('fade-out');
                }, 500);
            }
            updateStyles();
        });

        // Initial setup
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Clear species input
    const textField = document.getElementById('speciesNames');
    if (textField) {
        textField.value = '';
    }

    // Create checkboxes for database selection
    createCheckboxesForCards(Cards);

    // Example species button
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
                speciesNames.value = "";
                species.forEach((s, i) => {
                    setTimeout(() => {
                        speciesNames.value += s + "\n";
                        const event = new Event('input', {
                            bubbles: true,
                            cancelable: true,
                        });
                        speciesNames.dispatchEvent(event);
                    }, i * 500);
                });
                
                setTimeout(() => {
                    speciesNames.value = speciesNames.value.trim();
                    const event = new Event('input', {
                        bubbles: true,
                        cancelable: true,
                    });
                    speciesNames.dispatchEvent(event);
                }, species.length * 500);
            }
        });
    }
});