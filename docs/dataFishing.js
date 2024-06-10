var Cards = {
    'iucn': ['IUCN_All_data', 'IUCN_Common_Names', 'IUCN_Country_Occurrence', 'IUCN_Habitats', 'IUCN_Species_Author*', 'IUCN_Status_Conservation*', 'IUCN_Synonyms_Names', 'IUCN_Taxonomy*'],
    'gbif': ['GBIF_All_data', 'GBIF_Taxonomy*', 'Country_Presence'],
    'WoRMS': ['WoRMS_All_data*', 'WoRMS_Taxonomy*', 'WoRMS_Species Status*', 'WoRMS_Species_Author*']

};
var NamesCards = {
    'gbif': 'Global Biodiversity Information Facility',
    'iucn': 'International Union for Conservation of Nature’s Red List of Threatened Species',
    'ncbi': 'National Center for Biotechnology Information',
    'WoRMS': 'World Register of Marine Species'
};


// Click on the "Example" button to see an example of species names
const speciesNames = document.getElementById('speciesNames');
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
    species.forEach((s, i) => setTimeout(() => {
        speciesNames.value += s + "\n";
        $(speciesNames).trigger('input');
    }, i * 500));
    setTimeout(() => {
        speciesNames.value = speciesNames.value.slice(0, -1);
        $(speciesNames).trigger('input');
    }, species.length * 500);
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
    };
    const keys = Object.keys(toolTips);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { key: randomKey, description: toolTips[randomKey][0], link: toolTips[randomKey][1] };
}

function displayTip() {
    const tip = getRandomTip();
    const container = document.querySelector('.tip-container');
    container.classList.remove('fade-out');
    container.classList.add('fade-in');
    container.style.display = 'block';
    container.innerHTML = `
    <div class="bg-gray-600 overflow-hidden px-4 py-4">
        <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            
            <!-- Título da seção -->
            <div class="flex-shrink-0 text-center sm:text-left sm:mr-5">
                <span class="text-white text-lg font-semibold leading-6 rounded-full bg-gray-800 px-3 py-3">Explore other tools:</span>
            </div>
            
            <!-- Descrição da ferramenta -->
            <div class="flex-grow sm:text-center text-left sm:mr-5">
                <div class="text-white text-2xl font-semibold leading-6"><strong>${tip.key}</strong> ${tip.description}</div>
            </div>
            
            <!-- Botão 'Saiba Mais' (centralizado) -->
            <div class="flex-shrink-0 text-center sm:text-left sm:mr-2">
                <a href="${tip.link}" target="_blank" class="rounded-full bg-gray-800 px-3 py-3 text-base font-semibold text-white transition-colors duration-300 hover:bg-gray-700 hover:ring-2 hover:ring-white">
                Learn More <span aria-hidden="true">→</span>
                </a>
            </div>
            
            <!-- Botão de fechar -->
            <div class="flex-shrink-0 text-center sm:text-right mt-4 sm:mt-0">
                <button id="toolsClose" type="button" class="rounded-full bg-gray-800 px-3 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-red-600 hover:ring-2 hover:ring-red-600">
                    <span class="sr-only">Fechar</span>
                    <i class="fa-regular fa-2x fa-circle-xmark"></i>
                </button>
            </div>

        </div>
    </div>
    `;
    const closeButton = document.getElementById('toolsClose');
    closeButton.onclick = function () {
        container.classList.remove('fade-in');
        container.classList.add('fade-out');
        container.style.display = 'none';
        setTimeout(() => {
            displayTip();
        }, 25000);
    };
}


function createCard(cardTitle, options) {
    const cardContainer = document.createElement('div');
    cardContainer.id = cardTitle + 'Card';
    cardContainer.className = 'bg-white shadow-md rounded pt-4 pb-4 border-1 bg-gray-800 mb-5 ml-5 mr-5 hidden';

    const cardHeader = document.createElement('div');
    cardHeader.className = 'bg-gray-800 text-white font-bold py-4 px-4 rounded';
    cardHeader.innerHTML = `<i class="fas fa-2x fa-gear"></i> Search Options of ${NamesCards[cardTitle]} <b>(${cardTitle.toUpperCase()})`;
    cardContainer.appendChild(cardHeader);

    const cardBody = document.createElement('div');
    cardBody.className = 'pt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-8 2xl:grid-cols-8 gap-1 justify-items-center sm:justify-items-center';
    cardContainer.appendChild(cardBody);

    function handleAllDataChange(event) {
        const allDataInput = event.target;
        const allDataStatus = allDataInput.checked;
        const allInputs = Array.from(cardBody.querySelectorAll('.toggle-checkbox')).filter(input => input.id != 'all_dataopt');

        allInputs.forEach(input => {
            if (!input.id.endsWith('*opt')) {
                input.checked = allDataStatus;
                input.disabled = allDataStatus;
            }
        });
    }

    options.forEach(option => {
        const toggleContainer = document.createElement('div');
        if (option.endsWith('*')) {
            toggleContainer.className = 'flex items-center mb-4 w-full cursor-not-allowed';
        } else {
            toggleContainer.className = 'flex items-center mb-4 w-full';
        }

        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'switch';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.id = option.toLowerCase().replace(cardTitle.toLowerCase() + '_', '') + 'opt';
        toggleInput.className = 'toggle-checkbox';

        if (option.endsWith('*')) {
            toggleInput.checked = true;
            toggleInput.disabled = true;
        }

        if (option.includes('_All_data')) {
            toggleInput.addEventListener('change', handleAllDataChange);

        }

        toggleLabel.appendChild(toggleInput);

        const toggleSpan = document.createElement('span');
        if (option.endsWith('*')) {
            toggleSpan.className = 'toggle-slider cursor-not-allowed';
        } else {
            toggleSpan.className = 'toggle-slider';
        }
        toggleLabel.appendChild(toggleSpan);

        const labelText = document.createElement('span');
        labelText.className = 'ml-1 text-lg';

        labelText.textContent = option.replace(new RegExp('^' + cardTitle + '_', 'i'), '').replace(/_/g, ' ');
        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(labelText);
        cardBody.appendChild(toggleContainer);
    });

    const infoText = document.createElement('div');
    infoText.className = 'bg-gray-200 text-lg col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-12 px-4 pt-4 pb-4';
    infoText.innerHTML = `<p class="font-bold">* Mandatory Fields</p><p><i class="fas fa-info-circle"></i> Click and select the options to search for ${NamesCards[cardTitle]} <b>(${cardTitle.toUpperCase()})</p>`;
    cardBody.appendChild(infoText);

    return cardContainer;
}
Object.keys(Cards).forEach(key => {
    const cardElement = createCard(key, Cards[key]);
    document.getElementById('CardsOpt').appendChild(cardElement);
});

const startSearch = document.getElementById('startSearch');

startSearch.addEventListener('click', function () {
    const iucn = document.getElementById('iucn-checkbox').checked;
    const gbif = document.getElementById('gbif-checkbox').checked;
    const WoRMS = document.getElementById('WoRMS-checkbox').checked;
    if (iucn) {
        getIUCN();
    } else if (gbif) {
        getGBIF();
    } else if (WoRMS) {
        getWoRMS();
    }
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            event.preventDefault();
        }
    });
});

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

    const progressModal = document.getElementById('progressModalIUCN');
    const progressBar = document.getElementById('progressBarIUCN');
    progressModal.classList.remove('hidden');

    const iucnSynonymsOpt = document.getElementById('synonyms_namesopt').checked;
    const iucnCommonOpt = document.getElementById('common_namesopt').checked;
    const iucnCountryOpt = document.getElementById('country_occurrenceopt').checked;
    const iucnHabitatsOpt = document.getElementById('habitatsopt').checked;

    let progress = 0;
    const _Tabs = document.getElementById('tabs');
    let iucnTab = document.getElementById('iucnTab');
    if (!iucnTab) {
        iucnTab = document.createElement('li');
        iucnTab.className = 'mr-2';
        iucnTab.innerHTML = '<a href="#" class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" id="iucnTab">Data Results</a>';
        _Tabs.appendChild(iucnTab);
    }
    const speciesNames = document.getElementById('speciesNames').value.split('\n');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';

    const _iucnTable = document.createElement('table');
    _iucnTable.id = 'iucnTableResults';
    _iucnTable.classList.add("w-full", "text-lg", "text-center", "text-gray-500", "dark:text-gray-400", "flex-grow");
    _iucnTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 top-0">
        <tr>
            <th scope="col" class="px-6 py-3">Kingdom</th>
            <th scope="col" class="px-6 py-3">Phylum</th>
            <th scope="col" class="px-6 py-3">Class</th>
            <th scope="col" class="px-6 py-3">Order</th>
            <th scope="col" class="px-6 py-3">Family</th>
            <th scope="col" class="px-6 py-3">Genus</th>
            <th scope="col" class="px-6 py-3">Species</th>
            <th scope="col" class="px-6 py-3">Common Names</th>
            <th scope="col" class="px-6 py-3">Country Occurrence</th>
            <th scope="col" class="px-6 py-3">Habitats</th>
            <th scope="col" class="px-6 py-3">Species Citation</th>
            <th scope="col" class="px-6 py-3">Status Conservation</th>
            <th scope="col" class="px-6 py-3">Synonyms Names</th>
            <th scope="col" class="px-6 py-3">Link</th>
        </tr>
    </thead>
    `;
    const _iucnTableBody = _iucnTable.createTBody();
    _iucnTableBody.classList.add("text-center");

    const _iucnTableWrapper = document.createElement('div');
    _iucnTableWrapper.style.maxHeight = '1000px';
    _iucnTableWrapper.style.overflowY = 'auto';
    _iucnTableWrapper.classList.add("max-h-50", "overflow-y-auto");
    _iucnTableWrapper.appendChild(_iucnTable);

    const iucnResults = document.getElementById('iucnResults');
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

            for (const result of json.result) {
                const row = _iucnTableBody.insertRow();
                row.classList.add('bg-gray-50', 'hover:bg-gray-100', 'text-black');
                row.innerHTML = `
                        <td>${result.kingdom.charAt(0).toUpperCase() + result.kingdom.slice(1).toLowerCase()}</td>
                        <td>${result.phylum.charAt(0).toUpperCase() + result.phylum.slice(1).toLowerCase()}</td>
                        <td>${result.class.charAt(0).toUpperCase() + result.class.slice(1).toLowerCase()}</td>
                        <td>${result.order.charAt(0).toUpperCase() + result.order.slice(1).toLowerCase()}</td>
                        <td>${result.family.charAt(0).toUpperCase() + result.family.slice(1).toLowerCase()}</td>
                        <td><i>${speciesName.split(' ')[0]}</i></td>
                        <td><i>${speciesName}</i><br>${result.authority}</td>
                        <td>${_commonNames}</td>
                        <td>${_country}</td>
                        <td>${_habitats}</td>
                        <td>${result.authority}</td>
                        <td style="background-color: ${StatusIUCN[result.category][1]};">${StatusIUCN[result.category][0]} (${result.category})</td>
                        <td>${_synonyms}</td>
                        <td><a class="btn btn-outline-dark" href="https://www.iucnredlist.org/search?query=${_speciesName}&searchType=species" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
            `;
            }
        } catch (error) {
            console.error(error);
        }
        progress += 10;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
}

async function getSynonymsNames(speciesName) {
    const _speciesName = speciesName.replace(' ', '%20');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';
    const url = `https://apiv3.iucnredlist.org/api/v3/species/synonym/${_speciesName}?token=${_token}`;
    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        if (json.result.length > 0) {
            let synonyms = '';
            for (let _i = 0; _i < json.result.length; _i++) {
                if (`${json.result[_i].syn_authority}` === 'null') {
                    synonyms += `<p><i>${json.result[_i].synonym}</i></p>\n`;
                } else {
                    synonyms += `<p><i>${json.result[_i].synonym}</i> ${json.result[_i].syn_authority}</p>\n`;
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
                commonNames += `<p>${json.result[_i].taxonname} <sup>${json.result[_i].language}</sup></p>\n`;
            }
            return commonNames;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }
}

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
                countries += `${json.result[_i].country};\n`;
            }
            return countries;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }
}

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
                habitats += `${json.result[_i].habitat};\n`;
            }
            return habitats;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
    }

}

// WoRMS //
async function getWoRMS() {
    const statusColor = {
        'accepted': '#BACD92',
        'unaccepted': '#FA7070',
    }
    const progressModal = document.getElementById('progressModalIUCN');
    const progressBar = document.getElementById('progressBarIUCN');
    progressModal.classList.remove('hidden');

    let progress = 0;

    const _Tabs = document.getElementById('tabs');
    let iucnTab = document.getElementById('iucnTab');
    if (!iucnTab) {
        iucnTab = document.createElement('li');
        iucnTab.className = 'mr-2';
        iucnTab.innerHTML = '<a href="#" class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" id="iucnTab">Data Results</a>';
        _Tabs.appendChild(iucnTab);
    }
    const speciesNames = document.getElementById('speciesNames').value.split('\n');

    const _wormsTable = document.createElement('table');
    _wormsTable.id = 'iucnTableResults';
    _wormsTable.classList.add("w-full", "text-lg", "text-center", "text-gray-500", "dark:text-gray-400", "flex-grow");
    _wormsTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 top-0">
        <tr>
            <th scope="col" class="px-6 py-3">AphiaID</th>
            <th scope="col" class="px-6 py-3">Kingdom</th>
            <th scope="col" class="px-6 py-3">Phylum</th>
            <th scope="col" class="px-6 py-3">Class</th>
            <th scope="col" class="px-6 py-3">Order</th>
            <th scope="col" class="px-6 py-3">Family</th>
            <th scope="col" class="px-6 py-3">Genus</th>
            <th scope="col" class="px-6 py-3">Species</th>
            <th scope="col" class="px-6 py-3">Species Status</th>
            <th scope="col" class="px-6 py-3">Authority</th>
            <th scope="col" class="px-6 py-3">Link</th>
        </tr>
    </thead>
    `;
    const _wormTableBody = _wormsTable.createTBody();
    _wormTableBody.classList.add("text-center");

    const _wormsTableWrapper = document.createElement('div');
    _wormsTableWrapper.style.maxHeight = '1000px';
    _wormsTableWrapper.style.overflowY = 'auto';
    _wormsTableWrapper.classList.add("max-h-50", "overflow-y-auto");
    _wormsTableWrapper.appendChild(_wormsTable);

    const wormsResults = document.getElementById('iucnResults');
    wormsResults.innerHTML = '';
    wormsResults.appendChild(_wormsTableWrapper);

    const promises = speciesNames.map(async (speciesName) => {
        console.log(speciesName);
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://www.marinespecies.org/rest/AphiaRecordsByName/${_speciesName}`;
        try {
            const response = await fetch(url);
            const row = _wormTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-100', 'text-black');
            if (response.status === 200) {
                const json = await response.json();
                if (json.length > 0) {
                    row.innerHTML = `
                        <td>${json[0].AphiaID || '-'}</td>
                        <td>${json[0].kingdom || '-'}</td>
                        <td>${json[0].phylum || '-'}</td>
                        <td>${json[0].class || '-'}</td>
                        <td>${json[0].order || '-'}</td>
                        <td>${json[0].family || '-'}</td>
                        <td><i>${json[0].genus || '-'}</i></td>
                        <td><i>${speciesName}</i></td>
                        <td style="background-color: ${statusColor[json[0].status] || '#FFFFFF'};">${json[0].status || '-'}</td>
                        <td>${json[0].authority}</td>
                        <td><a href="https://www.marinespecies.org/aphia.php?p=taxdetails&id=${json[0].AphiaID}" target="_blank">Link</a></td>
                    `;
                }
            } else {
                row.innerHTML = `
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td><i>${speciesName.split(' ')[0]}</i></td>
                    <td><i>${speciesName}</i></td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                `;
            }
        } catch (error) {
            console.error(error);
        }
        progress += 10;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
}

async function getGBIF() {
    const progressModal = document.getElementById('progressModalIUCN');
    const progressBar = document.getElementById('progressBarIUCN');
    progressModal.classList.remove('hidden');

    const gbifOccurrence = document.getElementById('country_presenceopt').checked;

    let progress = 0;

    const _Tabs = document.getElementById('tabs');
    let iucnTab = document.getElementById('iucnTab');
    if (!iucnTab) {
        iucnTab = document.createElement('li');
        iucnTab.className = 'mr-2';
        iucnTab.innerHTML = '<a href="#" class="inline-block text-gray-500 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg py-4 px-4 text-sm font-medium text-center" id="iucnTab">Data Results</a>';
        _Tabs.appendChild(iucnTab);
    }
    const speciesNames = document.getElementById('speciesNames').value.split('\n');

    const _gbifTable = document.createElement('table');
    _gbifTable.id = 'iucnTableResults';
    _gbifTable.classList.add("w-full", "text-lg", "text-center", "text-gray-500", "dark:text-gray-400", "flex-grow");
    _gbifTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 top-0">
        <tr>
            <th scope="col" class="px-6 py-3">Kingdom</th>
            <th scope="col" class="px-6 py-3">Phylum</th>
            <th scope="col" class="px-6 py-3">Class</th>
            <th scope="col" class="px-6 py-3">Order</th>
            <th scope="col" class="px-6 py-3">Family</th>
            <th scope="col" class="px-6 py-3">Genus</th>
            <th scope="col" class="px-6 py-3">Species</th>
            <th scope="col" class="px-6 py-3">Basionym</th>
            <th scope="col" class="px-6 py-3">Vernacular Name</th>
            <th scope="col" class="px-6 py-3">Taxonomic Status</th>
            <th scope="col" class="px-6 py-3">Countries Occurrenc</th>
            <th scope="col" class="px-6 py-3">Link</th>
        </tr>
    </thead>
    `;
    const _gbifTableBody = _gbifTable.createTBody();
    _gbifTableBody.classList.add("text-center");

    const _gbifTableWrapper = document.createElement('div');
    _gbifTableWrapper.style.maxHeight = '1000px';
    _gbifTableWrapper.style.overflowY = 'auto';
    _gbifTableWrapper.classList.add("max-h-50", "overflow-y-auto");
    _gbifTableWrapper.appendChild(_gbifTable);

    const gbifResults = document.getElementById('iucnResults');
    gbifResults.innerHTML = '';
    gbifResults.appendChild(_gbifTableWrapper);
    const promises = speciesNames.map(async (speciesName) => {
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://api.gbif.org/v1/species?name=${_speciesName}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            const occurrence = gbifOccurrence ? await getOccurrence(speciesName) : ['-', '-', '-'];
            const row = _gbifTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-100', 'text-black');
            for (const results of json.results) {
                if (results.taxonomicStatus === 'ACCEPTED' && results.taxonID.includes('gbif:')) {
                    row.innerHTML = `
                <td>${results.kingdom ? results.kingdom.charAt(0).toUpperCase() + results.kingdom.slice(1).toLowerCase() : '-'}</td>
                <td>${results.phylum ? results.phylum.charAt(0).toUpperCase() + results.phylum.slice(1).toLowerCase() : '-'}</td>
                <td>${results.class ? results.class.charAt(0).toUpperCase() + results.class.slice(1).toLowerCase() : '-'}</td>
                <td>${results.order ? results.order.charAt(0).toUpperCase() + results.order.slice(1).toLowerCase() : '-'}</td>
                <td>${results.family ? results.family.charAt(0).toUpperCase() + results.family.slice(1).toLowerCase() : '-'}</td>
                <td><i>${speciesName.split(' ')[0]}</i></td>
                <td><i>${speciesName}</i><br>${results.authorship}</td>
                <td><i>${results.basionym ? results.basionym : '-'}<i></td>
                <td>${results.vernacularName ? results.vernacularName : '-'}</td>
                <td>${results.taxonomicStatus ? results.taxonomicStatus.charAt(0).toUpperCase() + results.taxonomicStatus.slice(1).toLowerCase() : '-'}</td>
                <td>${occurrence[0].join('<br>')}</td>
                <td><a class="btn btn-outline-dark" href="https://www.gbif.org/species/${results.taxonID.split(':')[1]}" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
                `;
                }
            }
        } catch (error) {
            console.error(error);
        }
        progress += 10;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            setTimeout(() => {
                progressModal.classList.add('hidden');
            }, 1000);
        }
    });
    await Promise.all(promises);
}

async function getOccurrence(speciesName) {
    const dataParams = { 'scientificName': speciesName, 'limit': 1000000 };
    const url = `https://api.gbif.org/v1/occurrence/search?${new URLSearchParams(dataParams)}`;

    let response = await fetch(url);
    if (response.ok) {
        let json = await response.json();
        console.log(json);
        if (json.results.length > 0) {
            let countries = [...new Set(json.results.filter(result => result.country !== undefined).map(result => result.country))];
            let latitudes = json.results.filter(result => result.decimalLatitude !== undefined).map(result => result.decimalLatitude);
            let longitudes = json.results.filter(result => result.decimalLongitude !== undefined).map(result => result.decimalLongitude);
            return [countries, latitudes, longitudes];
        } else {
            return [[], [], []];
        }
    } else {
        throw new Error(`Request failed with status ${response.status}`);
    }
}

async function exportTableToExcel(tableId) {
    const StatusIUCN = {
        'Least Concern (LC)': ['#5FC65A'],
        'Near Threatened (NT)': ['#CCE226'],
        'Vulnerable (VU)': ['#F9E814'],
        'Endangered (EN)': ['#FC7F3F'],
        'Critically Endangered (CR)': ['#D81E05'],
        'Extinct in the Wild (EW)': ['#542243'],
        'Extinct (EX)': ['#000000'],
        'Data Deficient (DD)': ['#D1D1C7'],
        'Not Evaluated (NE)': ['#FFFFFF']
    };
    const table = document.getElementById(tableId);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tableId);
    //const data = Array.from(table.rows).map(r => Array.from(r.cells).map(c => c.innerText.replace(/<p>/g, '\n').replace(/<sup>/g, ' ')));
    //data.forEach((row, rowIndex) => {
    //    row.forEach((cell, cellIndex) => {
    //        if (cellIndex !== 10) {
    //            let excelCell = worksheet.getCell(rowIndex + 1, cellIndex < 3 ? cellIndex + 1 : cellIndex);
    //            excelCell.value = cell;
    //            excelCell.alignment = { vertical: 'middle', wrapText: true };
    //            if (cellIndex === 5 || cellIndex === 6 || cellIndex === 7) {
    //                excelCell.font = { italic: true };
    //            }
    //            if (cellIndex === 4 && StatusIUCN[cell]) {
    //                excelCell.fill = {
    //                    type: 'pattern',
    //                    pattern: 'solid',
    //                    fgColor: { argb: StatusIUCN[cell][0] }
    //                };
    //            }
    //        }
    //    });
    //});
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
    a.download = tableId + '.xlsx';
    a.click();
}