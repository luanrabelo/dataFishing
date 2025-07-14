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
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-2 px-2 rounded-t';
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

    // Dicionário de descrições para cada campo (adicione conforme necessário)
    const optionDescriptions = {
        'all_data': 'All available data for the species.',
        'taxonomy': 'Taxonomic classification (kingdom, phylum, class, etc).',
        'status': 'Taxonomic or conservation status.',
        'accepted_name': 'Currently accepted scientific name.',
        'family': 'Taxonomic family.',
        'synonyms': 'Known synonyms for the species.',
        'authority': 'Author and year of species description.',
        'marine_environment': 'Presence in marine environments.',
        'brackish_environment': 'Presence in brackish environments.',
        'freshwater_environment': 'Presence in freshwater environments.',
        'terrestrial_environment': 'Presence in terrestrial environments.',
        'extinct_status': 'Extinction status.',
        'match_type': 'Type of match in the database.',
        'modified_date': 'Date of last modification.',
        'citation': 'Recommended citation for the data.',
        'basionym': 'Original name (basionym) for the species.',
        'vernacular_name': 'Common names.',
        'taxonomic_status': 'Taxonomic status in GBIF.',
        'sequences': 'DNA barcode sequences.',
        // ...adicione mais descrições conforme necessário...
    };

    // Create options for each data type
    cardData.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex items-center space-x-2 my-2';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center w-12 h-8 rounded-full transition duration-300 flex-shrink-0';

        const optionId = option.toLowerCase().replace(/[^a-z0-9]/g, '');
        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.id = optionId + 'opt';
        switchInput.className = 'sr-only peer';

        // Checar se é obrigatório (*)
        const isRequired = option.endsWith('*');
        switchInput.checked = isRequired;
        switchInput.disabled = isRequired;

        // Tooltip informativo
        const cleanOption = option.replace('*', '').replace(/^.*?_/, '').replace(/_/g, ' ');
        const descKey = option.replace('*', '').toLowerCase().replace(/^.*?_/, '').replace(/_/g, '');
        const description = optionDescriptions[descKey] || cleanOption;

        label.title = isRequired
            ? `${description} (Mandatory)`
            : description;

        // Aparência do switch (igual ao início, mas com cadeado para obrigatórios)
        if (isRequired) {
            label.classList.add('bg-gray-800', 'cursor-not-allowed');
        } else {
            label.classList.add('bg-gray-400', 'cursor-pointer');
        }

        const switchIcon = document.createElement('i');
        if (isRequired) {
            switchIcon.className = 'fas fa-lock text-white text-xl absolute';
        } else {
            switchIcon.className = 'far fa-circle text-gray-600 text-xl absolute';
        }
        switchIcon.style.top = '50%';
        switchIcon.style.left = '50%';
        switchIcon.style.transform = 'translate(-50%, -50%)';

        // Atualizar aparência ao mudar (apenas se não for obrigatório)
        if (!isRequired) {
            switchInput.addEventListener('change', () => {
                if (switchInput.checked) {
                    label.classList.remove('bg-gray-400');
                    label.classList.add('bg-gray-800');
                    switchIcon.className = 'fas fa-check text-white text-xl absolute';
                } else {
                    label.classList.remove('bg-gray-800');
                    label.classList.add('bg-gray-400');
                    switchIcon.className = 'far fa-circle text-gray-600 text-xl absolute';
                }
            });
        }

        label.appendChild(switchInput);
        label.appendChild(switchIcon);

        const optionLabel = document.createElement('span');
        optionLabel.className = 'ml-3 text-xl text-gray-800 leading-tight';
        optionLabel.innerHTML = cleanOption + (isRequired ? ' <span class="font-bold text-black">*</span>' : '');

        optionDiv.appendChild(label);
        optionDiv.appendChild(optionLabel);
        optionsGrid.appendChild(optionDiv);
    });

    // Mensagem informativa igual ao tópico 1 (agora DEPOIS dos inputs, texto maior)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'bg-gray-200 border-l-4 border-gray-800 p-4 my-2 mx-1 rounded-lg shadow-sm';
    infoDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-2x fa-exclamation-triangle text-black"></i>
            </div>
            <div class="ml-5">
                <h3 class="text-lg font-semibold text-black mb-1">
                    <i class="fas fa-info-circle mr-2"></i>Important Information
                </h3>
                <p class="text-black text-base leading-relaxed">
                    <i class="fas fa-hand-pointer mr-2 text-gray-800"></i>
                    <strong>Please select the data fields you want to retrieve from <span class="text-gray-800">${NamesCards[apiKey]}</span>.</strong><br>
                    <i class="fas fa-lock mr-2 text-gray-600"></i>
                    Fields marked with <b class="text-black">*</b> are mandatory and cannot be unchecked <b>( <i class="fas fa-lock text-gray-800"></i> )</b>.<br>
                    <i class="fas fa-info-circle mr-2 text-gray-600"></i>
                    Hover over each option to see a description.
                </p>
            </div>
        </div>
    `;
    cardElement.appendChild(infoDiv);

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
        allCheckboxes.push({ checkbox, label, stateIcon, wrapperDiv });
        
        // Update styles based on checkbox state
        const updateStyles = () => {
            const checkedBoxes = allCheckboxes.filter(item => item.checkbox.checked);
            const anyChecked = checkedBoxes.length > 0;
            allCheckboxes.forEach(item => {
                if (item.checkbox.checked) {
                    // Selecionado: cinza escuro, ícone check
                    item.label.classList.remove('bg-gray-400', 'bg-orange-500', 'cursor-not-allowed');
                    item.label.classList.add('bg-gray-800', 'cursor-pointer');
                    item.stateIcon.className = 'fas fa-check text-white text-xl absolute';
                    item.checkbox.disabled = false;
                    item.wrapperDiv.style.pointerEvents = 'auto';
                    item.wrapperDiv.style.opacity = '1';
                } else if (anyChecked) {
                    // Não selecionado quando algum está selecionado: laranja, ícone ban
                    item.label.classList.remove('bg-gray-400', 'bg-gray-800', 'cursor-pointer');
                    item.label.classList.add('bg-orange-500', 'cursor-not-allowed');
                    item.stateIcon.className = 'fas fa-ban text-gray-500 text-xl absolute';
                    item.checkbox.disabled = true;
                    item.wrapperDiv.style.pointerEvents = 'none';
                    item.wrapperDiv.style.opacity = '0.6';
                    item.wrapperDiv.style.cursor = 'not-allowed';
                } else {
                    // Nenhum selecionado: todos cinza claro, ícone círculo vazio
                    item.label.classList.remove('bg-gray-800', 'bg-orange-500', 'cursor-not-allowed');
                    item.label.classList.add('bg-gray-400', 'cursor-pointer');
                    item.stateIcon.className = 'far fa-question text-gray-600 text-xl absolute';
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
        textLabel.className = 'ml-5 text-xl text-gray-800';
        // Remover o acrônimo do nome exibido
        textLabel.innerHTML = NamesCards[key];

        wrapperDiv.appendChild(label);
        wrapperDiv.appendChild(textLabel);
        container.appendChild(wrapperDiv);
    });

    // Configuração inicial dos estilos
    allCheckboxes.forEach(item => {
        item.label.classList.remove('bg-gray-800', 'bg-orange-500');
        item.label.classList.add('bg-gray-400', 'cursor-pointer');
        item.stateIcon.className = 'far fa-question text-gray-600 text-xl absolute';
        item.stateIcon.style.top = '50%';
        item.stateIcon.style.left = '50%';
        item.stateIcon.style.transform = 'translate(-50%, -50%)';
        item.wrapperDiv.style.cursor = 'pointer';
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

    // Melhorar texto de instrução com ícone
    const infoCard = document.querySelector('.bg-gray-200.border-l-4.border-gray-800.p-5.my-1.mx-1.rounded-lg.shadow-sm');
    if (infoCard) {
        infoCard.querySelector('p.text-black.text-base').innerHTML = `
            <i class="fas fa-hand-pointer mr-2 text-xl text-gray-800"></i>
            <strong>Please select <span class="text-gray-800">one</span> data source at a time</strong> <b>( <i class="far fa-question text-gray-800"></i> )</b> to search for biodiversity information.<br>
            <i class="fas fa-lock mr-2 text-gray-600"></i>
            When you select an option, the other options will be automatically disabled <b>( <i class="fas fa-ban text-gray-800"></i> )</b><br>
            <i class="fas fa-undo-alt mr-2 text-gray-600"></i>
            To choose a different data source, you must first uncheck the currently selected option <b>( <i class="fas fa-check text-gray-800"></i> )</b>
        `;
    }

    // Exibir/esconder o bloco Species Names conforme cards de opções (tópico 2)
    const cardsOpt = document.getElementById('CardsOpt');
    const spForm = document.getElementById('spForm');
    // Inicialmente esconde o bloco 3
    if (spForm) spForm.style.display = 'none';

    // Função para monitorar visibilidade dos cards de opções
    function updateSpeciesFormVisibility() {
        // Se algum card de opções estiver visível, mostra o bloco 3
        const anyCardVisible = Array.from(cardsOpt.children).some(card => !card.classList.contains('hidden'));
        if (spForm) spForm.style.display = anyCardVisible ? '' : 'none';
    }

    // Hook nos cards de opções para atualizar visibilidade do bloco 3
    const observer = new MutationObserver(updateSpeciesFormVisibility);
    observer.observe(cardsOpt, { attributes: true, childList: true, subtree: true });

    // Também atualizar ao clicar nos checkboxes
    document.getElementById('checkbox-container').addEventListener('click', () => {
        setTimeout(updateSpeciesFormVisibility, 100);
    });

    // Atualizar na inicialização
    updateSpeciesFormVisibility();

    // Atualizar barra do bloco 3 para o mesmo modelo das demais
    const spFormHeader = document.querySelector('#spForm > .bg-gray-800, #spForm > .bg-gray-200');
    if (spFormHeader) {
        // Substitui qualquer barra antiga por uma igual às demais (bg-gray-800, texto branco, padding igual)
        spFormHeader.className = 'bg-gray-800 flex items-center text-white py-2 px-2 rounded my-1';
        spFormHeader.innerHTML = `
            <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-xl">3</div>
            <div class="text-2xl font-semibold">Species Names:</div>
        `;
    }

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
                // Corrigir duplicação: sobrescreve o valor ao invés de concatenar
                speciesNames.value = species.join('\n');
                const event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                speciesNames.dispatchEvent(event);
            }
        });
    }
});