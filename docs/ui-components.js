/**
 * UI Components and Card Creation Functions
 */

// Card configuration data
var Cards = {
    'bold': [
        'BOLD_All_data*',
        'BOLD_Taxonomy*',
        'BOLD_Sequences*'
    ],
    'eschmeyer': [
        'Eschmeyer_All_data*',
        'Eschmeyer_Taxonomy*',
        'Eschmeyer_Status*',
        'Eschmeyer_Accepted_Name*',
        'Eschmeyer_Family*',
        'Eschmeyer_Synonyms*'
    ],
    'gbif': [
        'GBIF_All_data*',
        'GBIF_Taxonomy*',
        "GBIF_Basionym*",
        "GBIF_Vernacular_Name*",
        "GBIF_Taxonomic_Status*"
    ],
    'iucn': [
        'IUCN_All_data*',
        'IUCN_Common_Names*',
        'IUCN_Country_Occurrence*',
        'IUCN_Habitats*',
        'IUCN_Species_Author*',
        'IUCN_Status_Conservation*',
        'IUCN_Synonyms_Names*',
        'IUCN_Taxonomy*',
        'IUCN_Threats*'
    ],
    'ncbi': [
        'NCBI_Taxonomy*',
        'NCBI_Mitochondrial_Genome',
        'NCBI_Nuclear_Genomes',
        'NCBI_Transcriptomes',
        'NCBI_PopSet',
        'NCBI_SNP',
        'NCBI_COI',
        'NCBI_CYTB',
        'NCBI_16S',
        'NCBI_12S',
        'NCBI_COII',
        'NCBI_ND2',
        'NCBI_CR',
        'NCBI_matK',
        'NCBI_rbcL'
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
    ]
};

var NamesCards = {
    'bold': 'Barcode of Life Data Systems <sup>beta</sup>',
    'eschmeyer': 'Eschmeyer\'s Catalog of Fishes',
    'gbif': 'Global Biodiversity Information Facility',
    'iucn': 'Red List of Threatened Species',
    'ncbi': 'National Center for Biotechnology Information',
    'worms': 'World Register of Marine Species'
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
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-2 px-2 rounded';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-5 font-semibold text-base">2</div>
        <div class="text-base">Configure <b>${NamesCards[apiKey]}</b> options</div>
    `;
    cardElement.appendChild(cardHeader);

    // Card body
    const cardBody = document.createElement('div');
    cardBody.className = 'px-2 py-2';
    cardElement.appendChild(cardBody);

    // Options grid
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-2';
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
        'mitochondrialgenome': 'Count of complete mitochondrial genomes available.',
        'nucleargenomes': 'Nuclear genome assemblies by assembly level (Scaffold, Contig, Chromosome).',
        'transcriptomes': 'Count of transcriptome datasets (RNA-Seq).',
        'popset': 'Population study and phylogenetic records from NCBI PopSet database.',
        'snp': 'Single Nucleotide Polymorphisms (SNPs) from NCBI dbSNP database.',
        'coi': 'Cytochrome c oxidase subunit I (COI) - primary DNA barcode marker for animals.',
        'cytb': 'Cytochrome b (Cyt b) - widely used marker for phylogenetics.',
        '16s': '16S ribosomal RNA - mitochondrial marker for species identification.',
        '12s': '12S ribosomal RNA - mitochondrial marker for species identification.',
        'coii': 'Cytochrome c oxidase subunit II (COII) - mitochondrial protein-coding gene.',
        'nd2': 'NADH dehydrogenase subunit 2 (ND2) - mitochondrial marker.',
        'cr': 'Control region (D-loop) - non-coding mitochondrial region.',
        'matk': 'Maturase K (matK) - chloroplast gene used for plant DNA barcoding.',
        'rbcl': 'RuBisCO large subunit (rbcL) - chloroplast gene for plant identification.',
        // ...adicione mais descrições conforme necessário...
    };

    // Create options for each data type
    cardData.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'flex items-center space-x-2 my-3';

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
            switchIcon.className = 'far fa-question text-gray-600 text-xl absolute';
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
                    switchIcon.className = 'far fa-question text-gray-600 text-xl absolute';
                }
            });
        }

        label.appendChild(switchInput);
        label.appendChild(switchIcon);

        const optionLabel = document.createElement('span');
        optionLabel.className = 'ml-3 text-base text-gray-800 leading-tight';
        optionLabel.innerHTML = cleanOption + (isRequired ? ' <span class="font-bold text-black">*</span>' : '');

        optionDiv.appendChild(label);
        optionDiv.appendChild(optionLabel);
        optionsGrid.appendChild(optionDiv);
    });

    // Mensagem informativa igual ao tópico 1 (agora DEPOIS dos inputs, texto maior)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
    infoDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-2x fa-exclamation-triangle text-black"></i>
            </div>
            <div class="ml-5">
                <h3 class="text-base font-semibold text-black mb-1">
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
    // Special options for specific APIs (before Important Information)
    if (apiKey === 'bold') {
        addBoldSpecialOptions(cardElement);
    } else if (apiKey === 'iucn') {
        addIucnSpecialOptions(cardElement);
    } else if (apiKey === 'ncbi') {
        addNcbiSpecialOptions(cardElement);
    }

    // Important Information always last
    cardElement.appendChild(infoDiv);

    return cardElement;
}

/**
 * Add special options for BOLD Systems
 */
function addBoldSpecialOptions(container) {
    const specialDiv = document.createElement('div');
    specialDiv.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';

    specialDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-2x fa-dna text-black"></i>
            </div>
            <div class="ml-5 w-full">
                <h3 class="text-base font-semibold text-black mb-1">
                    <i class="fas fa-download mr-2"></i>Sequence Download Options
                </h3>
                <div class="space-y-3 mt-3">
                    <div class="flex items-center space-x-3">
                        <label class="relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300 bg-gray-400 flex-shrink-0">
                            <input type="checkbox" id="boldDownloadSequences" class="sr-only peer">
                            <i class="far fa-question text-gray-600 text-xl absolute" style="top: 50%; left: 50%; transform: translate(-50%, -50%);"></i>
                        </label>
                        <span class="text-base text-gray-800">
                            <strong>Download Sequences:</strong> Download DNA barcode sequences in FASTA format
                        </span>
                    </div>
                    <p class="text-black text-base leading-relaxed">
                        <i class="fas fa-info-circle mr-1 text-gray-600"></i>
                        Sequences will be organized by species and saved as FASTA files.
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add toggle behavior for the download checkbox
    setTimeout(() => {
        const dlCheckbox = document.getElementById('boldDownloadSequences');
        if (dlCheckbox) {
            const dlLabel = dlCheckbox.closest('label');
            const dlIcon = dlLabel?.querySelector('i:not(.sr-only)');
            dlCheckbox.addEventListener('change', () => {
                if (dlCheckbox.checked) {
                    dlLabel.classList.remove('bg-gray-400');
                    dlLabel.classList.add('bg-gray-800');
                    if (dlIcon) dlIcon.className = 'fas fa-check text-white text-xl absolute';
                } else {
                    dlLabel.classList.remove('bg-gray-800');
                    dlLabel.classList.add('bg-gray-400');
                    if (dlIcon) dlIcon.className = 'far fa-circle text-gray-600 text-xl absolute';
                }
            });
        }
    }, 100);

    container.appendChild(specialDiv);
}

/**
 * Add special options for IUCN
 */
function addIucnSpecialOptions(container) {
    const specialDiv = document.createElement('div');
    specialDiv.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';

    specialDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-2x fa-key text-black"></i>
            </div>
            <div class="ml-5 w-full">
                <h3 class="text-base font-semibold text-black mb-1">
                    <i class="fas fa-cog mr-2"></i>API Configuration
                </h3>
                <div class="space-y-3 mt-3">
                    <div>
                        <label for="iucnApiKey" class="block text-base font-medium text-black mb-1">
                            <i class="fas fa-key mr-1"></i> IUCN API Token (required):
                        </label>
                        <input
                            type="password"
                            id="iucnApiKey"
                            class="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Enter your IUCN API token"
                        >
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button id="iucnSaveCredentials" class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
                            <i class="fas fa-save mr-2"></i> Save to Browser
                        </button>
                        <button id="iucnClearCredentials" class="inline-flex items-center px-4 py-2 border border-gray-400 text-base font-medium rounded-md text-gray-800 bg-white hover:bg-gray-100 transition-colors duration-200">
                            <i class="fas fa-trash-alt mr-2"></i> Clear Saved Data
                        </button>
                    </div>
                    <p id="iucnSaveStatus" class="text-base text-green-700 hidden">
                        <i class="fas fa-check-circle mr-1"></i> Credentials saved successfully.
                    </p>
                    <p class="text-black text-base leading-relaxed">
                        <i class="fas fa-shield-alt mr-1 text-gray-600"></i>
                        <strong>Privacy:</strong> Your API token is stored only in your browser's local storage and is <strong>never</strong> sent to any external server other than the IUCN Red List API.
                    </p>
                    <p class="text-black text-base leading-relaxed">
                        <i class="fas fa-info-circle mr-1 text-gray-600"></i>
                        Request your free API token at:
                        <a href="https://apiv3.iucnredlist.org/api/v3/token" target="_blank" class="underline text-gray-800 hover:text-gray-600">
                            IUCN Red List API
                        </a>
                    </p>
                </div>
            </div>
        </div>
    `;

    container.appendChild(specialDiv);

    // Restore saved credentials and setup save/clear buttons
    setTimeout(() => {
        const savedApiKey = localStorage.getItem('iucn_api_key');
        const apiKeyInput = document.getElementById('iucnApiKey');

        if (apiKeyInput && savedApiKey) apiKeyInput.value = savedApiKey;

        const saveBtn = document.getElementById('iucnSaveCredentials');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                const apiKey = document.getElementById('iucnApiKey')?.value?.trim() || '';
                if (apiKey) localStorage.setItem('iucn_api_key', apiKey);
                const status = document.getElementById('iucnSaveStatus');
                if (status) {
                    status.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Credentials saved successfully.';
                    status.className = 'text-base text-green-700';
                    status.classList.remove('hidden');
                    setTimeout(() => status.classList.add('hidden'), 3000);
                }
            });
        }

        const clearBtn = document.getElementById('iucnClearCredentials');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                localStorage.removeItem('iucn_api_key');
                const apiKeyEl = document.getElementById('iucnApiKey');
                if (apiKeyEl) apiKeyEl.value = '';
                const status = document.getElementById('iucnSaveStatus');
                if (status) {
                    status.innerHTML = '<i class="fas fa-trash-alt mr-1"></i> Saved credentials cleared.';
                    status.className = 'text-base text-red-700';
                    status.classList.remove('hidden');
                    setTimeout(() => status.classList.add('hidden'), 3000);
                }
            });
        }
    }, 100);
}

/**
 * Add special options for NCBI
 */
function addNcbiSpecialOptions(container) {
    const specialDiv = document.createElement('div');
    specialDiv.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';

    specialDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-2x fa-key text-black"></i>
            </div>
            <div class="ml-5 w-full">
                <h3 class="text-base font-semibold text-black mb-1">
                    <i class="fas fa-cog mr-2"></i>API Configuration
                </h3>
                <div class="space-y-3 mt-3">
                    <div>
                        <label for="ncbiEmail" class="block text-base font-medium text-black mb-1">
                            <i class="fas fa-envelope mr-1"></i> Email Address (required):
                        </label>
                        <input
                            type="email"
                            id="ncbiEmail"
                            class="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="your.email@example.com"
                        >
                    </div>
                    <div>
                        <label for="ncbiApiKey" class="block text-base font-medium text-black mb-1">
                            <i class="fas fa-key mr-1"></i> API Key (optional, increases rate limit):
                        </label>
                        <input
                            type="text"
                            id="ncbiApiKey"
                            class="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Enter your NCBI API key (optional)"
                        >
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button id="ncbiSaveCredentials" class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
                            <i class="fas fa-save mr-2"></i> Save to Browser
                        </button>
                        <button id="ncbiClearCredentials" class="inline-flex items-center px-4 py-2 border border-gray-400 text-base font-medium rounded-md text-gray-800 bg-white hover:bg-gray-100 transition-colors duration-200">
                            <i class="fas fa-trash-alt mr-2"></i> Clear Saved Data
                        </button>
                    </div>
                    <p id="ncbiSaveStatus" class="text-base text-green-700 hidden">
                        <i class="fas fa-check-circle mr-1"></i> Credentials saved successfully.
                    </p>
                    <p class="text-black text-base leading-relaxed">
                        <i class="fas fa-shield-alt mr-1 text-gray-600"></i>
                        <strong>Privacy:</strong> Your email and API key are stored only in your browser's local storage and are <strong>never</strong> sent to any external server other than NCBI's own API.
                    </p>
                    <p class="text-black text-base leading-relaxed">
                        <i class="fas fa-info-circle mr-1 text-gray-600"></i>
                        NCBI requires an email address for API access. Get an API key at:
                        <a href="https://www.ncbi.nlm.nih.gov/account/settings/" target="_blank" class="underline text-gray-800 hover:text-gray-600">
                            NCBI Account Settings
                        </a>
                    </p>
                    <p class="text-black text-base leading-relaxed">
                        <i class="fas fa-clock mr-1 text-gray-600"></i>
                        <strong>Processing time may increase significantly</strong> when multiple optional fields are selected, especially gene-level searches.
                        Each species requires additional API calls for each selected option.
                        Consider using an API key for better rate limits.
                    </p>
                </div>
            </div>
        </div>
    `;

    container.appendChild(specialDiv);

    // SynGenes citation message (hidden by default, shown when mitochondrial genes/genomes selected)
    const synGenesDiv = document.createElement('div');
    synGenesDiv.id = 'synGenesCitation';
    synGenesDiv.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm hidden';
    synGenesDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-2x fa-dna text-black"></i>
            </div>
            <div class="ml-5">
                <h3 class="text-base font-semibold text-black mb-1">
                    <i class="fas fa-quote-left mr-2"></i>SynGenes - Gene Nomenclature Standardization
                </h3>
                <p class="text-black text-base leading-relaxed">
                    <i class="fas fa-info-circle mr-2 text-gray-600"></i>
                    This search uses <strong>SynGenes</strong> gene synonym dictionaries to maximize results by querying all known nomenclatures for mitochondrial and chloroplast genes.
                </p>
                <p class="text-black text-base leading-relaxed mt-2">
                    <i class="fas fa-book mr-2 text-gray-600"></i>
                    <strong>Please cite:</strong> Rabelo, L.P., Sodr&eacute;, D., de Sousa, R.P.C. et al. SynGenes: a Python class for standardizing nomenclatures of mitochondrial and chloroplast genes and a web form for enhancing searches for evolutionary analyses. <i>BMC Bioinformatics</i> 25, 160 (2024).
                    <a href="https://doi.org/10.1186/s12859-024-05781-y" target="_blank" class="underline text-gray-800 hover:text-gray-600">
                        https://doi.org/10.1186/s12859-024-05781-y
                    </a>
                </p>
            </div>
        </div>
    `;
    container.appendChild(synGenesDiv);

    // Monitor mitochondrial gene/genome checkboxes to show/hide SynGenes citation
    setTimeout(() => {
        const mitoCheckboxIds = [
            'ncbimitochondrialgenomeopt',
            'ncbicoiopt', 'ncbicytbopt', 'ncbi16sopt', 'ncbi12sopt',
            'ncbicoiiopt', 'ncbind2opt', 'ncbicropt'
        ];

        function updateSynGenesCitation() {
            const anyMitoSelected = mitoCheckboxIds.some(id => {
                const el = document.getElementById(id);
                return el && el.checked;
            });
            const citationDiv = document.getElementById('synGenesCitation');
            if (citationDiv) {
                if (anyMitoSelected) {
                    citationDiv.classList.remove('hidden');
                    citationDiv.classList.add('fade-in');
                } else {
                    citationDiv.classList.add('hidden');
                    citationDiv.classList.remove('fade-in');
                }
            }
        }

        mitoCheckboxIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', updateSynGenesCitation);
            }
        });
    }, 200);

    // Restore saved credentials from localStorage
    setTimeout(() => {
        const savedEmail = localStorage.getItem('ncbi_email');
        const savedApiKey = localStorage.getItem('ncbi_apikey');
        const emailInput = document.getElementById('ncbiEmail');
        const apiKeyInput = document.getElementById('ncbiApiKey');

        if (emailInput && savedEmail) emailInput.value = savedEmail;
        if (apiKeyInput && savedApiKey) apiKeyInput.value = savedApiKey;

        // Save button
        const saveBtn = document.getElementById('ncbiSaveCredentials');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                const email = document.getElementById('ncbiEmail')?.value?.trim() || '';
                const apiKey = document.getElementById('ncbiApiKey')?.value?.trim() || '';
                if (email) localStorage.setItem('ncbi_email', email);
                if (apiKey) localStorage.setItem('ncbi_apikey', apiKey);
                const status = document.getElementById('ncbiSaveStatus');
                if (status) {
                    status.textContent = '';
                    status.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Credentials saved successfully.';
                    status.className = 'text-base text-green-700';
                    status.classList.remove('hidden');
                    setTimeout(() => status.classList.add('hidden'), 3000);
                }
            });
        }

        // Clear button
        const clearBtn = document.getElementById('ncbiClearCredentials');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                localStorage.removeItem('ncbi_email');
                localStorage.removeItem('ncbi_apikey');
                const emailEl = document.getElementById('ncbiEmail');
                const apiKeyEl = document.getElementById('ncbiApiKey');
                if (emailEl) emailEl.value = '';
                if (apiKeyEl) apiKeyEl.value = '';
                const status = document.getElementById('ncbiSaveStatus');
                if (status) {
                    status.textContent = '';
                    status.innerHTML = '<i class="fas fa-trash-alt mr-1"></i> Saved credentials cleared.';
                    status.className = 'text-base text-red-700';
                    status.classList.remove('hidden');
                    setTimeout(() => status.classList.add('hidden'), 3000);
                }
            });
        }
    }, 100);
}

/**
 * Create checkboxes for database selection (multi-select)
 */
function createCheckboxesForCards(Cards) {
    const container = document.getElementById('checkbox-container');

    if (!container) {
        console.error('Checkbox container not found');
        return;
    }

    // Clear existing content
    container.innerHTML = '';
    container.className = 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xxl:grid-cols-5 gap-3 px-2 py-2';

    Object.keys(Cards).forEach(key => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'flex items-center space-x-1 my-3 cursor-pointer';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300 bg-gray-400';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = key + '-checkbox';
        checkbox.checked = false;
        checkbox.className = 'sr-only peer';

        // Icon for checkbox state
        const stateIcon = document.createElement('i');
        stateIcon.className = 'far fa-question text-gray-600 text-xl absolute';
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';

        // Toggle handler - independent multi-select
        const toggleCheckbox = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = document.getElementById(key + 'Card');

            if (checkbox.checked) {
                // Unchecking
                checkbox.checked = false;
                label.classList.remove('bg-gray-800');
                label.classList.add('bg-gray-400');
                stateIcon.className = 'far fa-question text-gray-600 text-xl absolute';
                if (card) {
                    card.classList.add('fade-out');
                    setTimeout(() => {
                        card.classList.add('hidden');
                        card.classList.remove('fade-out');
                    }, 500);
                }
            } else {
                // Checking
                checkbox.checked = true;
                label.classList.remove('bg-gray-400');
                label.classList.add('bg-gray-800');
                stateIcon.className = 'fas fa-check text-white text-xl absolute';
                if (card) {
                    card.classList.remove('hidden');
                    card.classList.add('fade-in');
                }
            }

            // Re-apply icon positions after class change
            stateIcon.style.top = '50%';
            stateIcon.style.left = '50%';
            stateIcon.style.transform = 'translate(-50%, -50%)';

            return false;
        };

        wrapperDiv.addEventListener('click', toggleCheckbox);

        label.appendChild(checkbox);
        label.appendChild(stateIcon);

        const textLabel = document.createElement('span');
        textLabel.className = 'ml-5 text-base text-gray-800';
        textLabel.innerHTML = NamesCards[key];

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

    // Create option cards for each API and append to CardsOpt
    const cardsOptContainer = document.getElementById('CardsOpt');
    if (cardsOptContainer) {
        cardsOptContainer.innerHTML = '';
        Object.keys(Cards).forEach(key => {
            const card = createCard(key, Cards[key]);
            cardsOptContainer.appendChild(card);
        });
    }

    // Update info card text for multi-select
    const infoCard = document.querySelector('.bg-gray-200.border-l-4.border-gray-800.p-5.my-1.mx-1.rounded-lg.shadow-sm');
    if (infoCard) {
        const infoP = infoCard.querySelector('p.text-black.text-base');
        if (infoP) {
            infoP.innerHTML = `
                <i class="fas fa-hand-pointer mr-2 text-xl text-gray-800"></i>
                <strong>Select <span class="text-gray-800">one or more</span> data sources</strong> <b>( <i class="far fa-question text-gray-800"></i> )</b> to search for biodiversity information.<br>
                <i class="fas fa-check mr-2 text-gray-600"></i>
                You can select multiple databases simultaneously. Results will be displayed in separate tabs.<br>
                <i class="fas fa-undo-alt mr-2 text-gray-600"></i>
                Click a selected option again to deselect it.
            `;
        }
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

    // Initialize Tippy.js tooltips for elements with title attributes
    if (typeof tippy !== 'undefined') {
        tippy('[title]', {
            placement: 'top',
            arrow: true,
            animation: 'fade',
            duration: [200, 150],
            delay: [200, 0],
            theme: 'light-border',
            onShow(instance) {
                // Move title content to tippy and remove title to prevent double tooltip
                const title = instance.reference.getAttribute('title');
                if (title) {
                    instance.setContent(title);
                    instance.reference.removeAttribute('title');
                    instance.reference.dataset.tippyContent = title;
                }
            }
        });
    }

    // Atualizar barra do bloco 3 para o mesmo modelo das demais
    const spFormHeader = document.querySelector('#spForm > .bg-gray-800, #spForm > .bg-gray-200');
    if (spFormHeader) {
        // Substitui qualquer barra antiga por uma igual às demais (bg-gray-800, texto branco, padding igual)
        spFormHeader.className = 'bg-gray-800 flex items-center text-white py-2 px-2 rounded my-1';
        spFormHeader.innerHTML = `
            <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-base">3</div>
            <div class="text-base font-semibold">Species Names:</div>
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