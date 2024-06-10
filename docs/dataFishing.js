var Cards = {
    'iucn': ['IUCN_All_data', 'IUCN_Common_Names', 'IUCN_Country_Occurrence', 'IUCN_Habitats', 'IUCN_Species_Author*', 'IUCN_Status_Conservation*', 'IUCN_Synonyms_Names', 'IUCN_Taxonomy*'],
    'gbif': ['GBIF_All_data', 'GBIF_Taxonomy*', 'GBIF_Occurrence'],
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
            <div class="flex-grow text-center sm:text-left sm:mr-5">
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


  