var Cards = {
    'BoldSystems': [
        'BOLD_All_data*',
        'BOLD_Taxonomy*',
    ],
    'gbif': [
        'GBIF_All_data*',
        'GBIF_Taxonomy*',
        "GBIF_Basionym*",
        "GBIF_Vernacular_Name*",
        "GBIF_Taxonomic_Status*"
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
    ],
    'WoRMS': [
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
    'BoldSystems': 'Barcode of Life Data Systems <sup>beta</sup>',
    'gbif': 'Global Biodiversity Information Facility',
    'iucn': 'Red List of Threatened Species',
    'WoRMS': 'World Register of Marine Species'
};


document.addEventListener('DOMContentLoaded', function () {
    const speciesNames = document.getElementById('speciesNames');
    speciesNames.value = "";
    const exampleSpecies = document.getElementById('exampleSpecies');
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
    });
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

function updateDataResults() {
    const dataResults = document.getElementById('dataResults');
    dataResults.innerHTML = '';

    const resultsCard = document.createElement('div');
    resultsCard.className = 'bg-white rounded mb-4';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-1 px-1 rounded';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-xl">4</div>
        <div class="text-2xl font-semibold">Visualize and export the results</div>
    `;
    resultsCard.appendChild(cardHeader);

    const cardBody = document.createElement('div');
    cardBody.className = 'px-4 py-4';
    resultsCard.appendChild(cardBody);
    dataResults.appendChild(resultsCard);

    const columnTitle = document.createElement('h3');
    columnTitle.className = 'text-xl font-bold text-gray-800 mb-5 mt-6';
    columnTitle.textContent = 'Show/Hide Columns of the Results';
    cardBody.appendChild(columnTitle);

    const filterGrid = document.createElement('div');
    filterGrid.id = 'columnFiltersGrid';
    filterGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4';
    cardBody.appendChild(filterGrid);

    const infoNote = document.createElement('div');
    infoNote.className = 'bg-gray-200 text-lg px-4 pt-4 pb-4 rounded text-center col-span-full w-full mx-auto my-5';
    infoNote.innerHTML = `
        <p class="font-bold"><i class="fas fa-info-circle"></i> Column Visibility Controls</p>
        <p><i class="fas fa-info-circle"></i> Toggle columns on/off to customize your view. Hidden columns will not be included in the table search below.</p>
        <p><i class="fas fa-info-circle"></i> Please note that changing column visibility will affect search results and Excel export.</p>
    `;
    cardBody.appendChild(infoNote);

    createColumnFilters('TableResults', 'columnFiltersGrid');
    createSearchInput('TableResults', cardBody);

    const exportSection = document.createElement('div');
    exportSection.className = 'flex justify-center mt-6 mb-6';
    exportSection.innerHTML = `
        <button id="btnExcel" onclick="exportTableToExcel('TableResults')" class="bg-gray-800 text-2xl w-96 sm:w-96 hover:bg-blue-900 text-white font-bold py-3 px-3 rounded-lg focus:outline-none focus:shadow-outline">
            <i class="fa-solid fa-file-excel mr-2"></i> Export Result data to Excel
        </button>
    `;
    cardBody.appendChild(exportSection);
}

// This function fetches IUCN data and updates the progress bar
async function getIUCN() {
    const StatusIUCN = {
        'LC': ['Least Concern', '#5FC65A'],
        'NT': ['Near Threatened', '#CCE226'],
        'VU': ['Vulnerable', '#F9E814'],
        'EN': ['Endangered', '#FC7F3F'],
        'CR': ['Critically Endangered', '#D81E05'],
        'EW': ['Extinct in the Wild', '#542243'],
        'EX': ['Extinct', '#000000'],
        'DD': ['Data Deficient', '#D1D1C7'],
        'NE': ['Not Evaluated', '#FFFFFF']
    };

    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressModal.classList.remove('hidden');

    const iucnSynonymsOpt = document.getElementById('synonyms_namesopt').checked;
    const iucnCommonOpt = document.getElementById('common_namesopt').checked;
    const iucnCountryOpt = document.getElementById('country_occurrenceopt').checked;
    const iucnHabitatsOpt = document.getElementById('habitatsopt').checked;
    const iucnThreatsOpt = document.getElementById('threatsopt').checked;

    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';

    const _iucnTable = document.createElement('table');
    _iucnTable.id = 'TableResults';
    _iucnTable.classList.add(
        "text-base",
        "text-blue-800",
        "table-auto",
        "border-collapse",
        "w-full"
    );
    _iucnTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap">
        <tr>
            <th scope="col" class="py-5 px-5">Kingdom</th>
            <th scope="col" class="py-5 px-5">Phylum</th>
            <th scope="col" class="py-5 px-5">Class</th>
            <th scope="col" class="py-5 px-5">Order</th>
            <th scope="col" class="py-5 px-5">Family</th>
            <th scope="col" class="py-5 px-5">Genus</th>
            <th scope="col" class="py-5 px-5">Species</th>
            ${iucnCommonOpt ? '<th scope="col" class="py-5 px-5">Common Names</th>' : ''}
            ${iucnCountryOpt ? '<th scope="col" class="py-5 px-5">Country Occurrence</th>' : ''}
            ${iucnHabitatsOpt ? '<th scope="col" class="py-5 px-5">Habitats</th>' : ''}
            <th scope="col" class="py-5 px-5">Species Citation</th>
            <th scope="col" class="py-5 px-5">Status Conservation</th>
            ${iucnSynonymsOpt ? '<th scope="col" class="py-5 px-5">Synonyms Names</th>' : ''}
            ${iucnThreatsOpt ? '<th scope="col" class="py-5 px-5">Threats</th>' : ''}
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;
    const _iucnTableBody = _iucnTable.createTBody();
    _iucnTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _iucnTableWrapper = document.createElement('div');
    _iucnTableWrapper.classList.add(
        "w-full",               // O wrapper ocupa toda a largura disponível
        "overflow-x-auto",      // Rolagem horizontal para conteúdo grande
        "overflow-y-auto",      // Rolagem vertical
        "mx-auto"               // Centraliza o wrapper
    );
    _iucnTableWrapper.appendChild(_iucnTable);

    const iucnResults = document.getElementById('Results');
    iucnResults.innerHTML = '';
    iucnResults.appendChild(_iucnTableWrapper);

    const promises = speciesNames.map(async (speciesName, index) => {
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://apiv3.iucnredlist.org/api/v3/species/${_speciesName}?token=${_token}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            const _synonyms = iucnSynonymsOpt ? await getSynonymsNames(speciesName) : '-';
            const _commonNames = iucnCommonOpt ? await getCommonNames(speciesName) : '-';
            const _country = iucnCountryOpt ? await getCountryOccurrence(speciesName) : '-';
            const _habitats = iucnHabitatsOpt ? await getHabitat(speciesName) : '-';
            const _threats = iucnThreatsOpt ? await getThreats(speciesName) : '-';

            for (const result of json.result) {
                const row = _iucnTableBody.insertRow();
                row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'whitespace-nowrap', 'odd:bg-gray-200', 'even:bg-white');
                row.innerHTML = `
                        <td class="py-5 px-5">${result.kingdom.charAt(0).toUpperCase() + result.kingdom.slice(1).toLowerCase()}</td>
                        <td class="py-5 px-5">${result.phylum.charAt(0).toUpperCase() + result.phylum.slice(1).toLowerCase()}</td>
                        <td class="py-5 px-5">${result.class.charAt(0).toUpperCase() + result.class.slice(1).toLowerCase()}</td>
                        <td class="py-5 px-5">${result.order.charAt(0).toUpperCase() + result.order.slice(1).toLowerCase()}</td>
                        <td class="py-5 px-5">${result.family.charAt(0).toUpperCase() + result.family.slice(1).toLowerCase()}</td>
                        <td class="py-5 px-5"><i>${speciesName.split(' ')[0]}</i></td>
                        <td class="py-5 px-5"><i>${speciesName}</i></td>
                        ${iucnCommonOpt ? `<td class="py-5 px-5">${_commonNames}</td>` : ''}
                        ${iucnCountryOpt ? `<td class="py-5 px-5">${_country}</td>` : ''}
                        ${iucnHabitatsOpt ? `<td class="py-5 px-5">${_habitats}</td>` : ''}
                        <td class="py-5 px-5">${result.authority}</td>
                        <td class="text-center py-5 px-5" style="background-color: ${StatusIUCN[result.category][1]};">${StatusIUCN[result.category][0]} (${result.category})</td>
                        ${iucnSynonymsOpt ? `<td class="py-5 px-5">${_synonyms}</td>` : ''}
                        ${iucnThreatsOpt ? `<td class="py-5 px-5">${_threats}</td>` : ''}
                        <td class="py-5 px-5"><a class="btn btn-outline-dark" href="https://www.iucnredlist.org/search?query=${_speciesName}&searchType=species" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
            `;
            }
        } catch (error) {
            console.error(error);
        }
        progress += (100 / speciesNames.length);
        const progressPercentage = Math.round(progress);
        progressBar.style.width = progressPercentage + '%';
        progressText.textContent = progressPercentage + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
    updateDataResults();
}

// This function fetches synonyms for the given species from IUCN
async function getSynonymsNames(speciesName) {
    const _speciesName = speciesName.replace(' ', '%20');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';
    const url = `https://apiv3.iucnredlist.org/api/v3/species/synonym/${_speciesName}?token=${_token}`;
    const listSpecies = [];
    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        if (json.result.length > 0) {
            let synonyms = '';
            for (let _i = 0; _i < json.result.length; _i++) {
                if (`${json.result[_i].syn_authority}` === 'null') {
                    if (!listSpecies.includes(json.result[_i].synonym)) {
                        synonyms += `<div class="py-2"><i>${json.result[_i].synonym}</i></div>\n`;
                        listSpecies.push(json.result[_i].synonym);
                    }
                } else {
                    if (!listSpecies.includes(json.result[_i].synonym)) {
                        synonyms += `<div class="py-2"><i>${json.result[_i].synonym}</i> ${json.result[_i].syn_authority}</div>\n`;
                        listSpecies.push(json.result[_i].synonym);
                    }
                }
            }
            return synonyms;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }
}

// This function fetches threats data for the given species from IUCN
async function getThreats(speciesName) {
    threats_dict = {
        1: 'Residential & commercial development',
        2: 'Agriculture & aquaculture',
        3: 'Energy production & mining',
        4: 'Transportation & service corridors',
        5: 'Biological resource use',
        6: 'Human intrusions & disturbance',
        7: 'Natural system modifications',
        8: 'Invasive & other problematic species, genes & diseases',
        9: 'Pollution',
        10: 'Geological events',
        11: 'Climate change & severe weather',
        12: 'Other threats'
    };
    const _speciesName = speciesName.replace(' ', '%20');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';
    const url = `https://apiv3.iucnredlist.org/api/v3/threats/species/name/${_speciesName}?token=${_token}`;
    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        if (json.result.length > 0) {
            let threats = [];
            for (let _i = 0; _i < json.result.length; _i++) {
                let code = `${json.result[_i].code}`;
                code = code.split('.')[0];
                if (threats_dict[code]) {
                    if (!threats.includes(threats_dict[code])) {
                        threats.push(threats_dict[code]);
                    }
                } else {
                    if (!threats.includes(json.result[_i].code)) {
                        threats.push(json.result[_i].code);
                    }
                }
            }
            for (let _j = 0; _j < threats.length; _j++) {
                threats[_j] = `<div class="py-2">${threats[_j]}</div>`;
            }
            threats = threats.join('');
            return threats;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }
}

// This function fetches common names data for the given species from IUCN
async function getCommonNames(speciesName) {
    const _speciesName = speciesName.replace(' ', '%20');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';
    const url = `https://apiv3.iucnredlist.org/api/v3/species/common_names/${_speciesName}?token=${_token}`;
    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        if (json.result.length > 0) {
            let commonNames = '';
            for (let _i = 0; _i < json.result.length; _i++) {
                commonNames += `<div class="py-2">${json.result[_i].taxonname} <sup>${json.result[_i].language}</sup></div>\n`;
            }
            return commonNames;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }
}

// This function fetches country occurrence data for the given species from IUCN
async function getCountryOccurrence(speciesName) {
    const _speciesName = speciesName.replace(' ', '%20');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';
    const url = `https://apiv3.iucnredlist.org/api/v3/species/countries/name/${_speciesName}?token=${_token}`;
    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        if (json.result.length > 0) {
            let countries = '';
            for (let _i = 0; _i < json.result.length; _i++) {
                //countries += `<p>${json.result[_i].country} <sup><b>Presence:</b> ${json.result[_i].presence}</sup> <sup><b>Origin:</b> ${json.result[_i].origin}</sup> <sup><b>Distribution:</b> ${json.result[_i].distribution_code}</sup></p>`;
                countries += `<div class"py-2">${json.result[_i].country};\n</div>`;
            }
            return countries;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }
}

// This function fetches habitat data for the given species from IUCN
async function getHabitat(speciesName) {
    const _speciesName = speciesName.replace(' ', '%20');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';
    const url = `https://apiv3.iucnredlist.org/api/v3/habitats/species/name/${_speciesName}?token=${_token}`;
    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        if (json.result.length > 0) {
            let habitats = '';
            for (let _i = 0; _i < json.result.length; _i++) {
                habitats += `<div class="py-2">${json.result[_i].habitat};</div>`;
            }
            return habitats;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }

}

// This function fetches data from WoRMS for the given species
async function getWoRMS() {
    const statusColor = {
        'accepted': '#BACD92',
        'unaccepted': '#FA7070',
        'synonym': '#FFE066',
        'uncertain': '#D1D1C7'
    };

    const environmentColors = {
        'Yes': '#5FC65A',
        'No': '#FA7070',
        '-': '#D1D1C7'
    };

    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressModal.classList.remove('hidden');

    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n');

    // Verificar quais campos opcionais estão selecionados - corrigindo os IDs
    const wormsAuthorityOpt = document.getElementById('authorityopt')?.checked ?? true;
    const wormsValidSpeciesOpt = document.getElementById('valid_species_nameopt')?.checked ?? true;
    const wormsValidAuthorityOpt = document.getElementById('valid_authorityopt')?.checked ?? true;
    const wormsMarineOpt = document.getElementById('marine_environmentopt')?.checked ?? true;
    const wormsBrackishOpt = document.getElementById('brackish_environmentopt')?.checked ?? true;
    const wormsFreshwaterOpt = document.getElementById('freshwater_environmentopt')?.checked ?? true;
    const wormsTerrestrialOpt = document.getElementById('terrestrial_environmentopt')?.checked ?? true;
    const wormsExtinctOpt = document.getElementById('extinct_statusopt')?.checked ?? true;
    const wormsMatchTypeOpt = document.getElementById('match_typeopt')?.checked ?? true;
    const wormsModifiedOpt = document.getElementById('modified_dateopt')?.checked ?? true;
    const wormsCitationOpt = document.getElementById('citationopt')?.checked ?? true;

    const _wormsTable = document.createElement('table');
    _wormsTable.id = 'TableResults';
    _wormsTable.classList.add(
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
                AphiaID <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 1)">
                Kingdom <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 2)">
                Phylum <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 3)">
                Class <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 4)">
                Order <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 5)">
                Family <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 6)">
                Genus <i class="fas fa-sort ml-2"></i>
            </th>
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', 7)">
                Species <i class="fas fa-sort ml-2"></i>
            </th>
            ${wormsAuthorityOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${8})">Authority <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsValidSpeciesOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${8 + (wormsAuthorityOpt ? 1 : 0)})">Valid Species Name <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsValidAuthorityOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${8 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0)})">Valid Authority <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${8 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0)})">
                Species Status <i class="fas fa-sort ml-2"></i>
            </th>
            ${wormsMarineOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0)})">Marine <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsBrackishOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0)})">Brackish <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsFreshwaterOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0) + (wormsBrackishOpt ? 1 : 0)})">Freshwater <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsTerrestrialOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0) + (wormsBrackishOpt ? 1 : 0) + (wormsFreshwaterOpt ? 1 : 0)})">Terrestrial <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsExtinctOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0) + (wormsBrackishOpt ? 1 : 0) + (wormsFreshwaterOpt ? 1 : 0) + (wormsTerrestrialOpt ? 1 : 0)})">Extinct <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsMatchTypeOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0) + (wormsBrackishOpt ? 1 : 0) + (wormsFreshwaterOpt ? 1 : 0) + (wormsTerrestrialOpt ? 1 : 0) + (wormsExtinctOpt ? 1 : 0)})">Match Type <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsModifiedOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0) + (wormsBrackishOpt ? 1 : 0) + (wormsFreshwaterOpt ? 1 : 0) + (wormsTerrestrialOpt ? 1 : 0) + (wormsExtinctOpt ? 1 : 0) + (wormsMatchTypeOpt ? 1 : 0)})">Modified Date <i class="fas fa-sort ml-2"></i></th>` : ''}
            ${wormsCitationOpt ? `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('TableResults', ${9 + (wormsAuthorityOpt ? 1 : 0) + (wormsValidSpeciesOpt ? 1 : 0) + (wormsValidAuthorityOpt ? 1 : 0) + (wormsMarineOpt ? 1 : 0) + (wormsBrackishOpt ? 1 : 0) + (wormsFreshwaterOpt ? 1 : 0) + (wormsTerrestrialOpt ? 1 : 0) + (wormsExtinctOpt ? 1 : 0) + (wormsMatchTypeOpt ? 1 : 0) + (wormsModifiedOpt ? 1 : 0)})">Citation <i class="fas fa-sort ml-2"></i></th>` : ''}
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;

    _wormsTable.innerHTML = headerHTML;

    const _wormTableBody = _wormsTable.createTBody();
    _wormTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _wormsTableWrapper = document.createElement('div');
    _wormsTableWrapper.classList.add(
        "w-full",
        "overflow-x-auto",
        "overflow-y-auto",
        "mx-auto"
    );
    _wormsTableWrapper.appendChild(_wormsTable);

    const wormsResults = document.getElementById('Results');
    wormsResults.innerHTML = '';
    wormsResults.appendChild(_wormsTableWrapper);

    // Continue com o resto da função...
    const promises = speciesNames.map(async (speciesName) => {
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://www.marinespecies.org/rest/AphiaRecordsByName/${_speciesName}?like=false&marine_only=false&offset=1`;

        try {
            const response = await fetch(url);
            const row = _wormTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );

            if (response.status === 200) {
                const json = await response.json();
                if (json.length > 0) {
                    const data = json[0];

                    // Função para formatar ambiente com cor na célula inteira
                    const formatEnvironment = (value) => {
                        const envValue = value === 1 ? 'Yes' : (value === 0 ? 'No' : '-');
                        const color = environmentColors[envValue] || '#D1D1C7';
                        return { text: envValue, color: color };
                    };

                    // Formatar data modificada
                    const formatModifiedDate = (dateString) => {
                        if (!dateString || dateString === '-') return '-';
                        try {
                            const date = new Date(dateString);
                            return date.toLocaleDateString('pt-BR');
                        } catch (e) {
                            return dateString;
                        }
                    };

                    // Formatar citação (truncar se muito longa)
                    const formatCitation = (citation) => {
                        if (!citation || citation === '-') return '-';
                        return citation.length > 100 ? citation.substring(0, 100) + '...' : citation;
                    };

                    let cellIndex = 0;

                    // Células básicas
                    row.insertCell(cellIndex++).innerHTML = `${data.AphiaID || '-'}`;
                    row.insertCell(cellIndex++).innerHTML = `${data.kingdom || '-'}`;
                    row.insertCell(cellIndex++).innerHTML = `${data.phylum || '-'}`;
                    row.insertCell(cellIndex++).innerHTML = `${data.class || '-'}`;
                    row.insertCell(cellIndex++).innerHTML = `${data.order || '-'}`;
                    row.insertCell(cellIndex++).innerHTML = `${data.family || '-'}`;
                    row.insertCell(cellIndex++).innerHTML = `<i>${data.genus || '-'}</i>`;
                    row.insertCell(cellIndex++).innerHTML = `<i>${speciesName}</i>`;

                    // Células opcionais
                    if (wormsAuthorityOpt) {
                        row.insertCell(cellIndex++).innerHTML = `${data.authority || '-'}`;
                    }
                    if (wormsValidSpeciesOpt) {
                        row.insertCell(cellIndex++).innerHTML = `<i>${data.valid_name || '-'}</i>`;
                    }
                    if (wormsValidAuthorityOpt) {
                        row.insertCell(cellIndex++).innerHTML = `${data.valid_authority || '-'}`;
                    }

                    // Status da espécie com cor de fundo
                    const statusCell = row.insertCell(cellIndex++);
                    statusCell.innerHTML = `${data.status || '-'}`;
                    statusCell.style.backgroundColor = statusColor[data.status] || '#FFFFFF';

                    // Ambientes com cores de fundo
                    if (wormsMarineOpt) {
                        const marineData = formatEnvironment(data.isMarine);
                        const marineCell = row.insertCell(cellIndex++);
                        marineCell.innerHTML = marineData.text;
                        marineCell.style.backgroundColor = marineData.color;
                        marineCell.style.color = 'white';
                        marineCell.style.fontWeight = 'bold';
                        marineCell.style.textAlign = 'center';
                    }
                    if (wormsBrackishOpt) {
                        const brackishData = formatEnvironment(data.isBrackish);
                        const brackishCell = row.insertCell(cellIndex++);
                        brackishCell.innerHTML = brackishData.text;
                        brackishCell.style.backgroundColor = brackishData.color;
                        brackishCell.style.color = 'white';
                        brackishCell.style.fontWeight = 'bold';
                        brackishCell.style.textAlign = 'center';
                    }
                    if (wormsFreshwaterOpt) {
                        const freshwaterData = formatEnvironment(data.isFreshwater);
                        const freshwaterCell = row.insertCell(cellIndex++);
                        freshwaterCell.innerHTML = freshwaterData.text;
                        freshwaterCell.style.backgroundColor = freshwaterData.color;
                        freshwaterCell.style.color = 'white';
                        freshwaterCell.style.fontWeight = 'bold';
                        freshwaterCell.style.textAlign = 'center';
                    }
                    if (wormsTerrestrialOpt) {
                        const terrestrialData = formatEnvironment(data.isTerrestrial);
                        const terrestrialCell = row.insertCell(cellIndex++);
                        terrestrialCell.innerHTML = terrestrialData.text;
                        terrestrialCell.style.backgroundColor = terrestrialData.color;
                        terrestrialCell.style.color = 'white';
                        terrestrialCell.style.fontWeight = 'bold';
                        terrestrialCell.style.textAlign = 'center';
                    }
                    if (wormsExtinctOpt) {
                        const extinctData = formatEnvironment(data.isExtinct);
                        const extinctCell = row.insertCell(cellIndex++);
                        extinctCell.innerHTML = extinctData.text;
                        extinctCell.style.backgroundColor = extinctData.color;
                        extinctCell.style.color = 'white';
                        extinctCell.style.fontWeight = 'bold';
                        extinctCell.style.textAlign = 'center';
                    }

                    // Outras células opcionais
                    if (wormsMatchTypeOpt) {
                        row.insertCell(cellIndex++).innerHTML = `${data.match_type || '-'}`;
                    }
                    if (wormsModifiedOpt) {
                        row.insertCell(cellIndex++).innerHTML = `${formatModifiedDate(data.modified)}`;
                    }
                    if (wormsCitationOpt) {
                        const citationCell = row.insertCell(cellIndex++);
                        citationCell.innerHTML = `${formatCitation(data.citation)}`;
                        citationCell.title = data.citation || '-';
                    }

                    // Link
                    row.insertCell(cellIndex++).innerHTML = `<a class="btn btn-outline-dark" href="https://www.marinespecies.org/aphia.php?p=taxdetails&id=${data.AphiaID}" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;

                    // Aplicar classes CSS às células
                    Array.from(row.cells).forEach(cell => {
                        cell.classList.add("py-5", "px-5");
                    });
                }
            } else {
                // Linha para espécie não encontrada
                let cellIndex = 0;

                for (let i = 0; i < 8; i++) {
                    if (i === 6) {
                        row.insertCell(cellIndex++).innerHTML = `<i>${speciesName.split(' ')[0]}</i>`;
                    } else if (i === 7) {
                        row.insertCell(cellIndex++).innerHTML = `<i>${speciesName}</i>`;
                    } else {
                        row.insertCell(cellIndex++).innerHTML = '-';
                    }
                }

                if (wormsAuthorityOpt) row.insertCell(cellIndex++).innerHTML = '-';
                if (wormsValidSpeciesOpt) row.insertCell(cellIndex++).innerHTML = '-';
                if (wormsValidAuthorityOpt) row.insertCell(cellIndex++).innerHTML = '-';

                row.insertCell(cellIndex++).innerHTML = '-';

                if (wormsMarineOpt) {
                    const cell = row.insertCell(cellIndex++);
                    cell.innerHTML = '-';
                    cell.style.backgroundColor = '#D1D1C7';
                    cell.style.color = 'white';
                    cell.style.fontWeight = 'bold';
                    cell.style.textAlign = 'center';
                }
                if (wormsBrackishOpt) {
                    const cell = row.insertCell(cellIndex++);
                    cell.innerHTML = '-';
                    cell.style.backgroundColor = '#D1D1C7';
                    cell.style.color = 'white';
                    cell.style.fontWeight = 'bold';
                    cell.style.textAlign = 'center';
                }
                if (wormsFreshwaterOpt) {
                    const cell = row.insertCell(cellIndex++);
                    cell.innerHTML = '-';
                    cell.style.backgroundColor = '#D1D1C7';
                    cell.style.color = 'white';
                    cell.style.fontWeight = 'bold';
                    cell.style.textAlign = 'center';
                }
                if (wormsTerrestrialOpt) {
                    const cell = row.insertCell(cellIndex++);
                    cell.innerHTML = '-';
                    cell.style.backgroundColor = '#D1D1C7';
                    cell.style.color = 'white';
                    cell.style.fontWeight = 'bold';
                    cell.style.textAlign = 'center';
                }
                if (wormsExtinctOpt) {
                    const cell = row.insertCell(cellIndex++);
                    cell.innerHTML = '-';
                    cell.style.backgroundColor = '#D1D1C7';
                    cell.style.color = 'white';
                    cell.style.fontWeight = 'bold';
                    cell.style.textAlign = 'center';
                }

                if (wormsMatchTypeOpt) row.insertCell(cellIndex++).innerHTML = '-';
                if (wormsModifiedOpt) row.insertCell(cellIndex++).innerHTML = '-';
                if (wormsCitationOpt) row.insertCell(cellIndex++).innerHTML = '-';

                row.insertCell(cellIndex++).innerHTML = '-';

                Array.from(row.cells).forEach(cell => {
                    cell.classList.add("py-5", "px-5");
                });
            }
        } catch (error) {
            console.error(`Error fetching data for ${speciesName}:`, error);
            const row = _wormTableBody.insertRow();
            row.classList.add('bg-red-100', 'text-red-800');
            const totalCols = 9 +
                (wormsAuthorityOpt ? 1 : 0) +
                (wormsValidSpeciesOpt ? 1 : 0) +
                (wormsValidAuthorityOpt ? 1 : 0) +
                (wormsMarineOpt ? 1 : 0) +
                (wormsBrackishOpt ? 1 : 0) +
                (wormsFreshwaterOpt ? 1 : 0) +
                (wormsTerrestrialOpt ? 1 : 0) +
                (wormsExtinctOpt ? 1 : 0) +
                (wormsMatchTypeOpt ? 1 : 0) +
                (wormsModifiedOpt ? 1 : 0) +
                (wormsCitationOpt ? 1 : 0) + 1;

            const errorCell = row.insertCell(0);
            errorCell.colSpan = totalCols;
            errorCell.innerHTML = `Error fetching data for <i>${speciesName}</i>: ${error.message}`;
            errorCell.classList.add("py-5", "px-5", "text-center");
        }

        progress += (100 / speciesNames.length);
        const progressPercentage = Math.round(progress);
        progressBar.style.width = progressPercentage + '%';
        progressText.textContent = progressPercentage + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });

    await Promise.all(promises);
    updateDataResults();
}

// BOLD System - Search Options
async function get_BOLD_Systems() {
    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressModal.classList.remove('hidden');

    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n');

    const _boldTable = document.createElement('table');
    _boldTable.id = 'TableResults';
    _boldTable.classList.add(
        "text-base",
        "text-blue-800",
        "table-auto",
        "border-collapse",
        "w-full"
    );
    _boldTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap">
        <tr>
            <th scope="col" class="py-5 px-5">Phylum</th>
            <th scope="col" class="py-5 px-5">Class</th>
            <th scope="col" class="py-5 px-5">Order</th>
            <th scope="col" class="py-5 px-5">Family</th>
            <th scope="col" class="py-5 px-5">Sub Family</th>
            <th scope="col" class="py-5 px-5">Genus</th>
            <th scope="col" class="py-5 px-5">Species</th>
        </tr>
    </thead>
    `;
    const _boldTableBody = _boldTable.createTBody();
    _boldTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _boldTableWrapper = document.createElement('div');
    _boldTableWrapper.classList.add(
        "w-full",               // O wrapper ocupa toda a largura disponível
        "overflow-x-auto",      // Rolagem horizontal para conteúdo grande
        "overflow-y-auto",      // Rolagem vertical
        "mx-auto"               // Centraliza o wrapper
    );
    _boldTableWrapper.appendChild(_boldTable);

    const boldResults = document.getElementById('Results');
    boldResults.innerHTML = '';
    boldResults.appendChild(_boldTableWrapper);

    const promises = speciesNames.map(async (speciesName, index) => {
        const _speciesName = encodeURIComponent(speciesName);
        const apiUrl = `http://v3.boldsystems.org/index.php/API_Tax/TaxonSearch?taxName=${_speciesName}`;
        const proxyUrl = `https://corsproxy.io/?${apiUrl}`;
        try {
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            if (json) {
                await Promise.all(Object.keys(json).map(async key => {
                    const taxData = json[key];
                    if (taxData && taxData.taxid) {
                        const taxid = taxData.taxid;
                        const dataTaxonomy = await get_BOLD_Systems_data(taxid);
                        if (dataTaxonomy) {
                            const row = _boldTableBody.insertRow();
                            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'whitespace-nowrap', 'odd:bg-gray-200', 'even:bg-white');
                            row.innerHTML = `
                                <td class="py-5 px-5">${dataTaxonomy.phylum}</td>
                                <td class="py-5 px-5">${dataTaxonomy.class}</td>
                                <td class="py-5 px-5">${dataTaxonomy.order}</td>
                                <td class="py-5 px-5">${dataTaxonomy.family}</td>
                                <td class="py-5 px-5">${dataTaxonomy.subfamily || '-'}</td>
                                <td class="py-5 px-5"><i>${dataTaxonomy.genus}</i></td>
                                <td class="py-5 px-5"><i>${speciesName}</i></td>
                            `;
                        } else {
                            // add - to the table
                            const row = _boldTableBody.insertRow();
                            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'whitespace-nowrap', 'odd:bg-gray-200', 'even:bg-white');
                            row.innerHTML = `
                                <td class="py-5 px-5">-</td>
                                <td class="py-5 px-5">-</td>
                                <td class="py-5 px-5">-</td>
                                <td class="py-5 px-5">-</td>
                                <td class="py-5 px-5">-</td>
                                <td class="py-5 px-5"><i>${speciesName.split(' ')[0]}</i></td>
                                <td class="py-5 px-5"><i>${speciesName}</i></td>
                            `;
                        }
                    }
                }));
            }
        } catch (error) {
            console.error(`Error fetching data for ${speciesName}: ${error}`);
        }
        progress += (100 / speciesNames.length);
        const progressPercentage = Math.round(progress);
        progressBar.style.width = progressPercentage + '%';
        progressText.textContent = progressPercentage + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
    updateDataResults();
}

async function get_BOLD_Systems_data(taxid) {
    const apiUrl = `http://v3.boldsystems.org/index.php/API_Tax/TaxonData?taxId=${taxid}&dataTypes=basic&includeTree=true`;
    const proxyUrl = `https://corsproxy.io/?${apiUrl}`;
    const tax_data = {};
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
        const json = await response.json();
        if (json) {
            Object.keys(json).forEach(key => {
                const value = json[key];
                tax_data[value.tax_rank] = value.taxon;
            });
            return tax_data;
        }
    } catch (error) {
        return false;
    }
}

// Função para criar input de busca (modificada para receber cardBody diretamente)
function createSearchInput(tableId, cardBody) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mt-6 mb-6'; // Mudei de mb-6 para mt-6 mb-6
    searchContainer.innerHTML = `
        <div class="w-full mx-auto">
            <label for="table-search" class="text-lg font-semibold text-gray-800 mb-2 block">
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
                This search will filter and highlight results in the visible columns selected above. First choose your columns, then search through the data.
            </small>
        </div>
    `;

    // Adicionar ao FINAL do cardBody (não mais no início)
    cardBody.appendChild(searchContainer);

    // Adicionar funcionalidade de busca
    const searchInput = document.getElementById('table-search');
    const clearButton = document.getElementById('search-clear');
    let searchTimeout;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();

        // Mostrar/esconder botão de limpar
        if (searchTerm) {
            clearButton.classList.remove('hidden');
        } else {
            clearButton.classList.add('hidden');
        }

        // Debounce para melhor performance
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterAndHighlightTable(tableId, searchTerm);
        }, 300);
    });

    // Funcionalidade do botão limpar
    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        clearButton.classList.add('hidden');
        filterAndHighlightTable(tableId, '');
        updateSearchResultsCounter('', 0);
        searchInput.focus();
    });

    // Limpar busca com ESC
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable(tableId, '');
            updateSearchResultsCounter('', 0);
        }
    });
}

// Função para filtrar e destacar resultados na tabela
function filterAndHighlightTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');

    // Remover highlights anteriores
    removeHighlights(table);

    if (!searchTerm) {
        // Mostrar todas as linhas se não há termo de busca
        rows.forEach(row => {
            row.style.display = '';
        });
        updateSearchResultsCounter('', 0); // Esconder contador
        return;
    }

    let visibleRowCount = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let rowMatches = false;

        cells.forEach((cell, cellIndex) => {
            // Verificar se a coluna está visível
            const isColumnVisible = cell.style.display !== 'none';

            if (isColumnVisible) {
                const cellText = cell.textContent.toLowerCase();

                if (cellText.includes(searchTerm)) {
                    rowMatches = true;
                    // Destacar o termo encontrado
                    highlightText(cell, searchTerm);
                }
            }
        });

        // Mostrar/esconder linha baseado na correspondência
        if (rowMatches) {
            row.style.display = '';
            visibleRowCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Mostrar contador de resultados
    updateSearchResultsCounter(searchTerm, visibleRowCount);
}

function highlightText(element, searchTerm) {
    const text = element.textContent;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    const highlightedText = text.replace(regex, '<mark class="bg-yellow-300 px-1 rounded">$1</mark>');
    element.innerHTML = highlightedText;
}

// Função para remover highlights
function removeHighlights(table) {
    const marks = table.querySelectorAll('mark');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
}

// Função para escapar caracteres especiais do regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Função para mostrar contador de resultados
function updateSearchResultsCounter(searchTerm, count) {
    let counter = document.getElementById('search-results-counter');

    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'search-results-counter';
        counter.className = 'text-center mt-2 text-sm text-gray-600';

        const searchContainer = document.querySelector('#table-search').closest('.w-full');
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

function createColumnFilters(tableId, filterContainerId) {
    const table = document.getElementById(tableId);
    const filterContainer = document.getElementById(filterContainerId);

    // Certifique-se de que a tabela e o contêiner existem
    if (!table || !filterContainer) return;

    const headerRow = table.querySelector('thead tr');
    filterContainer.innerHTML = ''; // Limpar filtros existentes

    // Criar switches para cada coluna
    Array.from(headerRow.cells).forEach((cell, index) => {
        const filterItem = document.createElement('div');
        filterItem.className = 'flex items-start space-x-3 my-2 w-full';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300';

        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.checked = true; // Todos ligados por padrão
        switchInput.id = `filter-col-${index}`;
        switchInput.dataset.columnIndex = index;
        switchInput.className = 'sr-only peer';

        switchInput.addEventListener('change', function () {
            const colIndex = switchInput.dataset.columnIndex;
            const isVisible = switchInput.checked;

            // Alterna visibilidade da coluna
            toggleColumnVisibility(tableId, colIndex, isVisible);

            // Altera o fundo e o ícone
            if (isVisible) {
                label.classList.remove('bg-gray-400');
                label.classList.add('bg-gray-800');
                switchIcon.className = 'fas fa-eye text-white text-xl absolute';
            } else {
                label.classList.remove('bg-gray-800');
                label.classList.add('bg-gray-400');
                switchIcon.className = 'fas fa-eye-slash text-white text-xl absolute';
            }

            // Reprocessar busca se houver termo ativo
            const searchInput = document.getElementById('table-search');
            if (searchInput && searchInput.value.trim()) {
                filterAndHighlightTable(tableId, searchInput.value.toLowerCase().trim());
            }
        });

        // Fundo do switch
        label.classList.add('bg-gray-800');

        // Ícone centralizado
        const switchIcon = document.createElement('i');
        switchIcon.className = 'fas fa-eye text-white text-xl absolute';
        switchIcon.style.top = '50%';
        switchIcon.style.left = '50%';
        switchIcon.style.transform = 'translate(-50%, -50%)';

        label.appendChild(switchInput);
        label.appendChild(switchIcon);

        const columnLabel = document.createElement('span');
        columnLabel.htmlFor = `filter-col-${index}`;
        columnLabel.className = 'ml-3 text-base text-gray-800 leading-tight';
        columnLabel.innerHTML = cell.textContent.trim();

        filterItem.appendChild(label);
        filterItem.appendChild(columnLabel);
        filterContainer.appendChild(filterItem);
    });
}

// This function toggles the visibility of a table column
function toggleColumnVisibility(tableId, colIndex, isVisible) {
    const table = document.getElementById(tableId);
    Array.from(table.rows).forEach(row => {
        const cell = row.cells[colIndex];
        if (cell) {
            cell.style.display = isVisible ? '' : 'none';
        }
    });
}

// This function displays the randomly selected tip on the screen
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

function createCheckboxesForCards(Cards) {
    const container = document.getElementById('checkbox-container');
    // Limpa o TextField
    const textField = document.getElementById('speciesNames');
    textField.value = '';

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
        // Ícone dinâmico
        const stateIcon = document.createElement('i');
        stateIcon.className = 'fas fa-times text-black text-xl absolute';
        // Adiciona o checkbox à lista para controle global
        allCheckboxes.push({ checkbox, label });
        // Atualiza estilos de acordo com o estado do checkbox
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
            // Gerencia a desabilitação de outros checkboxes
            const anyChecked = allCheckboxes.some(item => item.checkbox.checked);
            allCheckboxes.forEach(item => {
                if (!item.checkbox.checked && anyChecked) {
                    item.label.classList.add('bg-gray-200', 'cursor-not-allowed', 'disabled');
                    item.label.classList.remove('bg-orange-500', 'bg-gray-800');
                } else if (!item.checkbox.checked) {
                    item.label.classList.remove('bg-gray-200', 'cursor-not-allowed', 'disabled');
                    item.label.classList.add('bg-orange-500');
                }
            });
        };

        // Evento de mudança no estado do checkbox
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

        // Configuração inicial
        label.classList.add('bg-orange-500');
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';

        label.appendChild(checkbox);
        label.appendChild(stateIcon);

        const textLabel = document.createElement('span');
        textLabel.htmlFor = key + '-checkbox';
        textLabel.className = 'ml-5 text-xl text-gray-800';
        textLabel.innerHTML = `${NamesCards[key]}<br>(<strong>${key}</strong>)`;

        wrapperDiv.appendChild(label);
        wrapperDiv.appendChild(textLabel);
        container.appendChild(wrapperDiv);
    }
    );
}

// Criar cards ao carregar
Object.keys(Cards).forEach(key => {
    const cardElement = createCard(key, Cards[key]);
    document.getElementById('CardsOpt').appendChild(cardElement);
});

const startSearch = document.getElementById('startSearch');
startSearch.addEventListener('click', function () {
    const iucn = document.getElementById('iucn-checkbox').checked;
    const gbif = document.getElementById('gbif-checkbox').checked;
    const WoRMS = document.getElementById('WoRMS-checkbox').checked;
    const boldSystems = document.getElementById('BoldSystems-checkbox').checked;
    if (iucn) {
        getIUCN();
    } else if (gbif) {
        getGBIF();
    } else if (WoRMS) {
        getWoRMS();
    } else if (boldSystems) {
        get_BOLD_Systems();
    }
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
});