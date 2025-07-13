// Componentes de Interface do Usuário

function createCheckboxesForCards(Cards) {
    const container = document.getElementById('checkbox-container');
    const textField = document.getElementById('speciesNames');
    textField.value = '';

    container.innerHTML = '';
    // Grid responsivo melhorada para diferentes tamanhos de tela
    container.className = 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 px-4 py-4';

    const allCheckboxes = [];

    Object.keys(Cards).forEach(key => {
        const wrapperDiv = document.createElement('div');
        // Card com padding otimizado para mobile
        wrapperDiv.className = 'flex items-center space-x-4 p-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all duration-300 bg-white shadow-sm hover:shadow-lg min-h-[80px]';

        const label = document.createElement('label');
        // Switch maior e mais responsivo
        label.className = 'relative inline-flex items-center cursor-pointer w-16 h-9 rounded-full transition-all duration-300 flex-shrink-0 shadow-md';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = key + '-checkbox';
        checkbox.checked = false;
        checkbox.className = 'sr-only peer';

        // Ícone com melhor animação
        const stateIcon = document.createElement('i');
        stateIcon.className = 'fas fa-circle text-white text-lg absolute transition-all duration-500 transform';

        // Adiciona o checkbox à lista para controle global
        allCheckboxes.push({ checkbox, label, stateIcon, wrapperDiv });

        // Função para atualizar estilos
        const updateStyles = () => {
            const anyChecked = allCheckboxes.some(item => item.checkbox.checked);

            allCheckboxes.forEach(item => {
                if (item.checkbox.checked) {
                    // Item selecionado - Azul vibrante
                    item.label.classList.remove('bg-gray-400', 'bg-orange-500', 'scale-100');
                    item.label.classList.add('bg-blue-600', 'shadow-lg', 'scale-110');
                    item.stateIcon.className = 'fas fa-check text-white text-xl absolute transition-all duration-500 transform scale-110';
                    item.wrapperDiv.classList.remove('border-gray-300', 'border-orange-300');
                    item.wrapperDiv.classList.add('border-blue-500', 'bg-blue-50', 'shadow-xl', 'transform', 'scale-105', 'ring-2', 'ring-blue-200');
                } else if (anyChecked) {
                    // Item desabilitado - Laranja suave
                    item.label.classList.remove('bg-gray-400', 'bg-blue-600', 'shadow-lg', 'scale-110');
                    item.label.classList.add('bg-orange-500', 'cursor-not-allowed', 'scale-100');
                    item.stateIcon.className = 'fas fa-ban text-white text-lg absolute transition-all duration-500 transform scale-100';
                    item.wrapperDiv.classList.remove('border-gray-300', 'border-blue-500', 'bg-blue-50', 'shadow-xl', 'transform', 'scale-105', 'ring-2', 'ring-blue-200');
                    item.wrapperDiv.classList.add('border-orange-300', 'bg-orange-50', 'opacity-70', 'cursor-not-allowed');
                } else {
                    // Item padrão - Cinza neutro
                    item.label.classList.remove('bg-blue-600', 'bg-orange-500', 'cursor-not-allowed', 'shadow-lg', 'scale-110', 'scale-100');
                    item.label.classList.add('bg-gray-400');
                    item.stateIcon.className = 'fas fa-circle text-white text-lg absolute transition-all duration-500 transform scale-100';
                    item.wrapperDiv.classList.remove('border-blue-500', 'border-orange-300', 'bg-blue-50', 'bg-orange-50', 'opacity-70', 'cursor-not-allowed', 'shadow-xl', 'transform', 'scale-105', 'ring-2', 'ring-blue-200');
                    item.wrapperDiv.classList.add('border-gray-300');
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

        // Configuração inicial: cinza neutro
        label.classList.add('bg-gray-400');
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';

        label.appendChild(checkbox);
        label.appendChild(stateIcon);

        const textContainer = document.createElement('div');
        textContainer.className = 'flex-1 min-w-0 overflow-hidden';

        const textLabel = document.createElement('div');
        // Texto responsivo que não quebra em mobile
        textLabel.className = 'text-lg sm:text-xl font-bold text-gray-800 leading-tight mb-1 line-clamp-2';
        textLabel.innerHTML = `${NamesCards[key]}`;

        const codeLabel = document.createElement('div');
        codeLabel.className = 'text-sm sm:text-base text-gray-600 font-medium';
        codeLabel.innerHTML = `<strong>${key}</strong>`;

        // Badge com status visual
        const statusBadge = document.createElement('div');
        statusBadge.className = 'text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full mt-2 inline-block font-medium';
        statusBadge.textContent = 'Available';

        textContainer.appendChild(textLabel);
        textContainer.appendChild(codeLabel);
        textContainer.appendChild(statusBadge);

        wrapperDiv.appendChild(label);
        wrapperDiv.appendChild(textContainer);
        container.appendChild(wrapperDiv);
    });

    // Aplicar estilos iniciais via classes
    updateAllStyles();

    function updateAllStyles() {
        const anyChecked = allCheckboxes.some(item => item.checkbox.checked);

        allCheckboxes.forEach(item => {
            if (!anyChecked) {
                // todos em cinza quando nada está selecionado
                item.label.classList.remove('bg-blue-600', 'bg-orange-500');
                item.label.classList.add('bg-gray-400');
                item.stateIcon.className = 'fas fa-circle text-white text-lg absolute transition-all duration-500 transform scale-100';
                item.wrapperDiv.classList.remove('border-blue-500', 'border-orange-300', 'bg-blue-50', 'bg-orange-50', 'opacity-70', 'cursor-not-allowed', 'shadow-xl', 'transform', 'scale-105', 'ring-2', 'ring-blue-200');
                item.wrapperDiv.classList.add('border-gray-300');
            }
        });
    }
}

function displayTip() {
    const tip = getRandomTip();
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

    // Array para armazenar todos os inputs do card
    const allInputs = [];

    function updateAllInputStyles() {
        const anyChecked = allInputs.some(input => input.checked);

        allInputs.forEach(input => {
            const label = input.parentElement;
            const icon = label.querySelector('i');

            if (input.checked) {
                // Input marcado - cinza escuro
                label.classList.remove('bg-orange-500', 'bg-gray-400');
                label.classList.add('bg-gray-800');
                icon.className = 'fas fa-check text-white text-xl absolute';
            } else if (anyChecked) {
                // Input desmarcado quando há outros marcados - laranja
                label.classList.remove('bg-gray-800', 'bg-gray-400');
                label.classList.add('bg-orange-500');
                icon.className = 'fas fa-times text-black text-xl absolute';
            } else {
                // Todos desmarcados - cinza neutro
                label.classList.remove('bg-gray-800', 'bg-orange-500');
                label.classList.add('bg-gray-400');
                icon.className = 'fas fa-circle text-white text-xl absolute';
            }
        });
    }

    function handleAllDataChange(event) {
        const allDataInput = event.target;
        const allDataStatus = allDataInput.checked;
        const nonMandatoryInputs = allInputs.filter(input => !input.id.endsWith('*opt'));

        nonMandatoryInputs.forEach(input => {
            input.checked = allDataStatus;
            input.disabled = false;
        });

        updateAllInputStyles();
    }

    options.forEach(option => {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'flex items-start space-x-3 my-3 w-full';

        const label = document.createElement('label');
        label.className = 'relative inline-flex items-center cursor-pointer w-12 h-8 rounded-full transition duration-300 flex-shrink-0';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        // CORREÇÃO: Inicializar TODOS os inputs como desmarcados
        toggleInput.checked = false;
        toggleInput.id = option.toLowerCase().replace(cardTitle.toLowerCase() + '_', '') + 'opt';
        toggleInput.className = 'toggle-checkbox sr-only peer';

        // CORREÇÃO: Remover a lógica de disabled para campos obrigatórios
        // if (option.endsWith('*')) {
        //     toggleInput.disabled = true;
        // }

        // Adicionar input ao array
        allInputs.push(toggleInput);

        if (option.includes('_All_data')) {
            toggleInput.addEventListener('change', handleAllDataChange);
        } else {
            toggleInput.addEventListener('change', function () {
                updateAllInputStyles();
            });
        }

        const stateIcon = document.createElement('i');

        // CORREÇÃO: Não definir estilos aqui, deixar para updateAllInputStyles
        stateIcon.style.top = '50%';
        stateIcon.style.left = '50%';
        stateIcon.style.transform = 'translate(-50%, -50%)';

        label.appendChild(toggleInput);
        label.appendChild(stateIcon);

        const columnLabel = document.createElement('span');
        columnLabel.textContent = option.replace(new RegExp('^' + cardTitle + '_', 'i'), '').replace(/_/g, ' ');
        columnLabel.className = 'text-base text-gray-800 leading-tight break-words flex-grow';

        toggleContainer.appendChild(label);
        toggleContainer.appendChild(columnLabel);
        cardBody.appendChild(toggleContainer);
    });

    // CORREÇÃO: Chamar updateAllInputStyles imediatamente, sem setTimeout
    updateAllInputStyles();

    const infoText = document.createElement('div');
    infoText.className = 'bg-gray-200 text-lg px-4 pt-4 pb-4 rounded text-center col-span-full w-full mx-auto my-5';
    infoText.innerHTML = `
    <p class="font-bold">* Mandatory Fields</p>
    <p><i class="fas fa-info-circle"></i> Click and select the options to search for ${NamesCards[cardTitle]} <b>(${cardTitle})</p>
    <p><i class="fas fa-info-circle"></i> Please note that a full data search may take considerable time. We appreciate your patience during processing.</p>`;
    cardBody.appendChild(infoText);

    return cardContainer;
}