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
        'WoRMS_Species Status*',
        'WoRMS_Species_Author*'
    ]

};

var NamesCards = {
    'BoldSystems': 'Barcode of Life Data Systems <sup>beta</sup>',
    'gbif': 'Global Biodiversity Information Facility',
    'iucn': 'Red List of Threatened Species',
    //'ncbi': 'National Center for Biotechnology Information',
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
        progressBar.style.width = progress + '%';
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
    };
    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    progressModal.classList.remove('hidden');
    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n');

    const _wormsTable = document.createElement('table');
    _wormsTable.id = 'TableResults';
    _wormsTable.classList.add(
        "text-base",
        "text-blue-800", 
        "table-auto",
        "border-collapse",
        "w-full" 
    );
    _wormsTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap">
        <tr>
            <th scope="col" class="py-5 px-5">AphiaID</th>
            <th scope="col" class="py-5 px-5">Kingdom</th>
            <th scope="col" class="py-5 px-5">Phylum</th>
            <th scope="col" class="py-5 px-5">Class</th>
            <th scope="col" class="py-5 px-5">Order</th>
            <th scope="col" class="py-5 px-5">Family</th>
            <th scope="col" class="py-5 px-5">Genus</th>
            <th scope="col" class="py-5 px-5">Species</th>
            <th scope="col" class="py-5 px-5">Species Status</th>
            <th scope="col" class="py-5 px-5">Authority</th>
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;
    const _wormTableBody = _wormsTable.createTBody();
    _wormTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _wormsTableWrapper = document.createElement('div');
    _wormsTableWrapper.classList.add(
        "w-full",               // O wrapper ocupa toda a largura disponível
        "overflow-x-auto",      // Rolagem horizontal para conteúdo grande
        "overflow-y-auto",      // Rolagem vertical
        "mx-auto"               // Centraliza o wrapper
    );
    _wormsTableWrapper.appendChild(_wormsTable);

    const wormsResults = document.getElementById('Results');
    wormsResults.innerHTML = '';
    wormsResults.appendChild(_wormsTableWrapper);

    const promises = speciesNames.map(async (speciesName) => {
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://www.marinespecies.org/rest/AphiaRecordsByName/${_speciesName}`;
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
                    row.innerHTML = `
                        <td class="py-5 px-5">${json[0].AphiaID || '-'}</td>
                        <td class="py-5 px-5">${json[0].kingdom || '-'}</td>
                        <td class="py-5 px-5">${json[0].phylum || '-'}</td>
                        <td class="py-5 px-5">${json[0].class || '-'}</td>
                        <td class="py-5 px-5">${json[0].order || '-'}</td>
                        <td class="py-5 px-5">${json[0].family || '-'}</td>
                        <td class="py-5 px-5"><i>${json[0].genus || '-'}</i></td>
                        <td class="py-5 px-5"><i>${speciesName}</i></td>
                        <td class="py-5 px-5" style="background-color: ${statusColor[json[0].status] || '#FFFFFF'};">${json[0].status || '-'}</td>
                        <td class="py-5 px-5">${json[0].authority}</td>
                        <td class="py-5 px-5"><a class="btn btn-outline-dark" href="https://www.marinespecies.org/aphia.php?p=taxdetails&id=${json[0].AphiaID}" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
                    `;
                }
            } else {
                row.innerHTML = `
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5"><i>${speciesName.split(' ')[0]}</i></td>
                    <td class="py-5 px-5"><i>${speciesName}</i></td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                    <td class="py-5 px-5">-</td>
                `;
            }
        } catch (error) {
            console.error(error);
        }
        progress += (100 / speciesNames.length);
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
    updateDataResults();
}


// This function fetches data from GBIF for the given species
async function getGBIF() {
    const statusColor = {
        'ACCEPTED': '#BACD92',
        'unaccepted': '#FA7070',
    };
    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
    progressModal.classList.remove('hidden');
    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n');

    const _gbifTable = document.createElement('table');
    _gbifTable.id = 'TableResults';
    _gbifTable.classList.add(
        "text-base",
        "text-blue-800", 
        "table-auto",
        "border-collapse",
        "w-full" 
    );
    _gbifTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap">
        <tr>
            <th scope="col" class="py-5 px-5">Kingdom</th>
            <th scope="col" class="py-5 px-5">Phylum</th>
            <th scope="col" class="py-5 px-5">Class</th>
            <th scope="col" class="py-5 px-5">Order</th>
            <th scope="col" class="py-5 px-5">Family</th>
            <th scope="col" class="py-5 px-5">Genus</th>
            <th scope="col" class="py-5 px-5">Species</th>
            <th scope="col" class="py-5 px-5">Basionym</th>
            <th scope="col" class="py-5 px-5">Vernacular Name</th>
            <th scope="col" class="py-5 px-5">Taxonomic Status</th>
            <th scope="col" class="py-5 px-5">Link</th>
        </tr>
    </thead>
    `;
    const _gbifTableBody = _gbifTable.createTBody();
    _gbifTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _gbifTableWrapper = document.createElement('div');
    _gbifTableWrapper.classList.add(
        "w-full",               // O wrapper ocupa toda a largura disponível
        "overflow-x-auto",      // Rolagem horizontal para conteúdo grande
        "overflow-y-auto",      // Rolagem vertical
        "mx-auto"               // Centraliza o wrapper
    );
    _gbifTableWrapper.appendChild(_gbifTable);

    const gbifResults = document.getElementById('Results');
    gbifResults.innerHTML = '';
    gbifResults.appendChild(_gbifTableWrapper);
    const promises = speciesNames.map(async (speciesName) => {
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://api.gbif.org/v1/species?name=${_speciesName}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            //const occurrence = gbifOccurrence ? await getOccurrence(speciesName) : '-';
            const row = _gbifTableBody.insertRow();
            row.classList.add(
                'bg-gray-50',
                'hover:bg-gray-400',
                'text-black',
                'odd:bg-gray-200',
                'even:bg-white',
                'whitespace-nowrap'
            );
            for (const results of json.results) {
                if (results.taxonomicStatus === 'ACCEPTED' && results.taxonID.includes('gbif:')) {
                    row.innerHTML = `
                <td class="py-5 px-5">${results.kingdom ? results.kingdom.charAt(0).toUpperCase() + results.kingdom.slice(1).toLowerCase() : '-'}</td>
                <td class="py-5 px-5">${results.phylum ? results.phylum.charAt(0).toUpperCase() + results.phylum.slice(1).toLowerCase() : '-'}</td>
                <td class="py-5 px-5">${results.class ? results.class.charAt(0).toUpperCase() + results.class.slice(1).toLowerCase() : '-'}</td>
                <td class="py-5 px-5">${results.order ? results.order.charAt(0).toUpperCase() + results.order.slice(1).toLowerCase() : '-'}</td>
                <td class="py-5 px-5">${results.family ? results.family.charAt(0).toUpperCase() + results.family.slice(1).toLowerCase() : '-'}</td>
                <td class="py-5 px-5"><i>${speciesName.split(' ')[0]}</i></td>
                <td class="py-5 px-5"><i>${speciesName}</i> ${results.authorship}</td>
                <td class="py-5 px-5"><i>${results.basionym ? results.basionym : '-'}<i></td>
                <td class="py-5 px-5">${results.vernacularName ? results.vernacularName : '-'}</td>
                <td class="py-5 px-5" style="background-color: ${statusColor[results.taxonomicStatus] || '#FA7070'};">${results.taxonomicStatus ? results.taxonomicStatus.charAt(0).toUpperCase() + results.taxonomicStatus.slice(1).toLowerCase() : '-'}</td>
                <td class="py-5 px-5"><a class="btn btn-outline-dark" href="https://www.gbif.org/species/${results.taxonID.split(':')[1]}" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
                `;
                }
            }
        } catch (error) {
            console.error(error);
        }
        progress += (100/speciesNames.length);
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
    updateDataResults();
}

// This function exports an HTML table to an Excel file
async function exportTableToExcel(tableId) {
    const table = document.getElementById(tableId);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tableId);
    const data = Array.from(table.rows).map(r => Array.from(r.cells).map(c => c.innerText.replace(/<p>/g, '\n').replace(/<sup>/g, ' ')));
    data.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cellIndex !== 10) {
                let excelCell = worksheet.getCell(rowIndex + 1, cellIndex < 3 ? cellIndex + 1 : cellIndex);
                excelCell.value = cell;
                excelCell.alignment = { vertical: 'middle', wrapText: true };
            }
        });
    });
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns.forEach(column => {
        let maxColumnLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            let columnLength = cell.text.length;
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
}

// This function updates the data results and column filters
function updateDataResults() {
    const dataResults = document.getElementById('dataResults');
    dataResults.innerHTML = '';
    const newContent = `
        <div class="flex items-center py-5 px-5 select-none hover:cursor-pointer">
            <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-800 text-white mr-2 font-bold text-xl">2</div>
            <div class="text-3xl font-bold hover:underline">Visualize and export the results</div>
        </div>
    `;
    
    dataResults.innerHTML = newContent;
    createColumnFilters('TableResults', 'columnFilters');
    dataResults.innerHTML = `
    <div class="flex justify-center mt-2 mb-2">
        <button id="btnExcel" onclick="exportTableToExcel('TableResults')" class="bg-gray-800 text-2xl w-96 sm:w-w-96 hover:bg-blue-900 text-white font-bold py-3 px-3 rounded-lg focus:outline-none focus:shadow-outline"><i class="fa-solid fa-file-excel mr-2"></i> Export Result data to Excel</button>
    </div>`;
}

// This function creates filters to toggle table columns
function createColumnFilters(tableId, filterContainerId) {
    const table = document.getElementById(tableId);
    const filterContainer = document.getElementById(filterContainerId);

    // Certifique-se de que a tabela e o contêiner existem
    if (!table || !filterContainer) return;

    const headerRow = table.querySelector('thead tr');
    filterContainer.innerHTML = ''; // Limpar filtros existentes

    const filterTitle = document.createElement('h3');
    filterTitle.className = 'text-xl font-bold text-gray-800 mb-5';
    filterTitle.textContent = 'Show/Hide Columns of the Results';
    filterContainer.appendChild(filterTitle);

    const filterGrid = document.createElement('div');
    filterGrid.className = 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-10 xxl:grid-cols-10 gap-2';

    // Criar switches para cada coluna
    Array.from(headerRow.cells).forEach((cell, index) => {
        const filterItem = document.createElement('div');
        filterItem.className = 'flex items-center space-x-2';

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
        columnLabel.textContent = cell.textContent.trim();
        columnLabel.className = 'text-xl text-gray-800 ml-4';

        filterItem.appendChild(label);
        filterItem.appendChild(columnLabel);
        filterGrid.appendChild(filterItem);
    });

    filterContainer.appendChild(filterGrid);
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


// 

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
    });
}

Object.keys(Cards).forEach(key => {
    const cardElement = createCard(key, Cards[key]);
    document.getElementById('CardsOpt').appendChild(cardElement);
});

// This function creates a card element for the selected data source
function createCard(cardTitle, options) {
    const cardContainer = document.createElement('div');
    cardContainer.id = cardTitle + 'Card';
    cardContainer.className = 'bg-white rounded hidden';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'bg-gray-800 flex items-center text-white py-1 px-1 rounded';
    cardHeader.innerHTML = `
        <div class="flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-black mr-3 font-bold text-xl">2</div>
        <div class="text-2xl font-semibold">Search Options of <span class="font-bold">${NamesCards[cardTitle]}</span></div>
        `;
    cardContainer.appendChild(cardHeader);

    const cardBody = document.createElement('div');
    cardBody.className = 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-10 xxl:grid-cols-10 gap-1 justify-items-start px-1 py-1';
    cardContainer.appendChild(cardBody);

    function handleAllDataChange(event) {
        const allDataInput = event.target;
        const allDataStatus = allDataInput.checked;
        const allInputs = Array.from(cardBody.querySelectorAll('.toggle-checkbox')).filter(input => !input.id.endsWith('*opt'));

        allInputs.forEach(input => {
            input.checked = allDataStatus;
            input.disabled = false;
            updateInputStyle(input);
        });
    }

    function updateInputStyle(input) {
        const label = input.parentElement;
        const icon = label.querySelector('i');

        if (input.checked) {
            label.classList.remove('bg-orange-500');
            label.classList.add('bg-gray-800');
            icon.className = 'fas fa-check text-white text-xl absolute';
        } else {
            label.classList.remove('bg-gray-800');
            label.classList.add('bg-orange-500');
            icon.className = 'fas fa-times text-black text-xl absolute';
        }
    }

    options.forEach(option => {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'flex items-center space-x-2 my-5 col-span-1 space-x-2'; // Garantia de que cada item ocupa 1 coluna
        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = option.endsWith('*'); // Ligado apenas para obrigatórios
        toggleInput.id = option.toLowerCase().replace(cardTitle.toLowerCase() + '_', '') + 'opt';
        toggleInput.className = 'toggle-checkbox sr-only peer';

        // Desativa os inputs obrigatórios
        if (option.endsWith('*')) {
            toggleInput.disabled = true;
        }

        // Evento para "All Data"
        if (option.includes('_All_data')) {
            toggleInput.addEventListener('change', handleAllDataChange);
        }

        // Ícone inicial
        const stateIcon = document.createElement('i');
        stateIcon.className = toggleInput.checked
            ? 'fas fa-check text-white text-xl absolute'
            : 'fas fa-times text-black text-xl absolute';

        toggleInput.addEventListener('change', function () {
            updateInputStyle(toggleInput);
        });

        // Estilo inicial
        label.classList.add(toggleInput.checked ? 'bg-gray-800' : 'bg-orange-500');

        // Ícone centralizado no fundo
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';
        label.appendChild(toggleInput);
        label.appendChild(stateIcon);

        const columnLabel = document.createElement('span');
        columnLabel.textContent = option.replace(new RegExp('^' + cardTitle + '_', 'i'), '').replace(/_/g, ' ');
        columnLabel.className = 'text-xl text-gray-800 ml-3';

        toggleContainer.appendChild(label);
        toggleContainer.appendChild(columnLabel);
        cardBody.appendChild(toggleContainer);
    });

    const infoText = document.createElement('div');
    infoText.className = 'bg-gray-200 text-lg px-4 pt-4 pb-4 rounded text-center col-span-full w-full mx-auto my-5';
    infoText.innerHTML = `
    <p class="font-bold">* Mandatory Fields</p>
    <p><i class="fas fa-info-circle"></i> Click and select the options to search for ${NamesCards[cardTitle]} <b>(${cardTitle})</p>
    <p><i class="fas fa-info-circle"></i> Please note that a full data search may take considerable time. We appreciate your patience during processing.</p>`;
    cardBody.appendChild(infoText);

    return cardContainer;
}

// BOLD System - Search Options
async function get_BOLD_Systems() {
    const progressModal = document.getElementById('progressModal');
    const progressBar = document.getElementById('progressBar');
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
        progressBar.style.width = progress + '%';
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
