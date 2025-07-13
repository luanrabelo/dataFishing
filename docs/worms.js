// WoRMS - World Register of Marine Species Functions

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
