async function getIUCNdata() {
    var progressBar = document.querySelector('.progress-bar');
    const synonymsopt = document.getElementById('synonymsopt').checked;
    const commonopt = document.getElementById('commonopt').checked;

    let completed = 0;

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

    const speciesNames = document.getElementById('speciesNames').value.split('\n');
    const _token = '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee';

    const _iucnTable = document.createElement('table');
    _iucnTable.id = 'iucnTableResults';
    _iucnTable.innerHTML = `
<thead>
    <tr>
        <th scope="col">Kingdom</th>
        <th scope="col">Phylum</th>
        <th scope="col">Class</th>
        <th scope="col">Order</th>
        <th scope="col">Family</th>
        <th scope="col">Genus</th>
        <th scope="col">Species</th>
        <th scope="col">Synonyms Names</th>
        <th scope="col">Common Names</th>
        <th scope="col">Status</th>
        <th scope="col">Link</th>
    </tr>
</thead>
`;
    const _iucnTableBody = _iucnTable.createTBody();
    _iucnTable.classList.add('table', 'table-striped', 'table-hover', 'mt-5', 'align-middle', 'mb-5');

    const _iucnTableWrapper = document.createElement('div');
    _iucnTableWrapper.style.maxHeight = '1000px';
    _iucnTableWrapper.style.overflowY = 'auto';
    _iucnTableWrapper.appendChild(_iucnTable);

    const iucnResults = document.getElementById('iucnResults');
    iucnResults.innerHTML = '';
    iucnResults.appendChild(_iucnTableWrapper);
    document.getElementById('iucnCount').textContent = speciesNames.length;

    const promises = speciesNames.map(async (speciesName, index) => {     
        const biodiversitydb = document.getElementById('biodiversitydb')
        biodiversitydb.innerHTML = '';
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://apiv3.iucnredlist.org/api/v3/species/${_speciesName}?token=${_token}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            const _synonyms = synonymsopt ? await getSynonymsNames(speciesName) : '-';
            const _commonNames = commonopt ? await getCommonNames(speciesName) : '-';

            for (const result of json.result) {
                const row = _iucnTableBody.insertRow();
                row.innerHTML = `
            <td>${result.kingdom.charAt(0).toUpperCase() + result.kingdom.slice(1).toLowerCase()}</td>
            <td>${result.phylum.charAt(0).toUpperCase() + result.phylum.slice(1).toLowerCase()}</td>
            <td>${result.class.charAt(0).toUpperCase() + result.class.slice(1).toLowerCase()}</td>
            <td>${result.order.charAt(0).toUpperCase() + result.order.slice(1).toLowerCase()}</td>
            <td>${result.family.charAt(0).toUpperCase() + result.family.slice(1).toLowerCase()}</td>
            <td><i>${speciesName.split(' ')[0]}</i></td>
            <td><i>${speciesName}</i><br>${result.authority}</td>
            <td>${_synonyms}</td>
            <td>${_commonNames}</td>
            <td style="background-color: ${StatusIUCN[result.category][1]};">${StatusIUCN[result.category][0]} (${result.category})</td>
            <td><a class="btn btn-outline-dark" href="https://www.iucnredlist.org/search?query=${_speciesName}&searchType=species" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
        `;
            }
        } catch (error) {
            console.error(error);
        }
        biodiversitydb.innerHTML = speciesName;
        completed += 1;
        const progressPercentage = (completed / speciesNames.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
        progressBar.innerText = 'Searching for the ' + speciesName + ' data in IUCN...';
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
                    synonyms += `<p><i>${json.result[_i].synonym}</i></p>`;
                } else {
                    synonyms += `<p><i>${json.result[_i].synonym}</i> ${json.result[_i].syn_authority}</p>`;
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
                commonNames += `<p>${json.result[_i].taxonname} <sup>${json.result[_i].language}</sup></p>`;
            }
            return commonNames;
        } else {
            return '-';
        }
    } else {
        return `Error ${response.status}`;
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
    const data = Array.from(table.rows).map(r => Array.from(r.cells).map(c => c.innerText.replace(/<p>/g, '\n').replace(/<sup>/g, ' ')));
    data.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cellIndex !== 10) {
                let excelCell = worksheet.getCell(rowIndex + 1, cellIndex < 3 ? cellIndex + 1 : cellIndex);
                excelCell.value = cell;
                excelCell.alignment = { vertical: 'middle', wrapText: true };
                if (cellIndex === 5 || cellIndex === 6 || cellIndex === 7) {
                    excelCell.font = { italic: true };
                }
                if (cellIndex === 4 && StatusIUCN[cell]) {
                    excelCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: StatusIUCN[cell][0].replace('#', '') }
                    };
                }
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
    a.download = tableId + '.xlsx';
    a.click();
}


async function getGBIFdata() {
    var progressBar = document.querySelector('.progress-bar');
    const gbifoccurrence = document.getElementById('gbifoccurrence').checked;
    let completed = 0;

    const speciesNames = document.getElementById('speciesNames').value.split('\n');
    const _gbifTable = document.createElement('table');
    _gbifTable.id = 'gbifTableResults';
    _gbifTable.innerHTML = `
<thead>
    <tr>
        <th scope="col">Kingdom</th>
        <th scope="col">Phylum</th>
        <th scope="col">Class</th>
        <th scope="col">Order</th>
        <th scope="col">Family</th>
        <th scope="col">Genus</th>
        <th scope="col">Species</th>
        <th scope="col">Basionym</th>
        <th scope="col">Vernacular Name</th>
        <th scope="col">Taxonomic Status</th>
        <th scope="col">Countries’ Occurrenc</th>
        <th scope="col">Lat</th>
        <th scope="col">Lon</th>
        <th scope="col">Link</th>
    </tr>
</thead>
`;
    const _gbifTableBody = _gbifTable.createTBody();
    _gbifTable.classList.add('table', 'table-striped', 'table-hover', 'mt-5', 'align-middle', 'mb-5');

    const _gbifTableWrapper = document.createElement('div');
    _gbifTableWrapper.style.maxHeight = '1000px';
    _gbifTableWrapper.style.overflowY = 'auto';
    _gbifTableWrapper.appendChild(_gbifTable);

    const gbifResults = document.getElementById('gbifResults');
    gbifResults.innerHTML = '';
    gbifResults.appendChild(_gbifTableWrapper);
    document.getElementById('gbifCount').textContent = speciesNames.length;

    const promises = speciesNames.map(async (speciesName, index) => {
        //const biodiversitydb = document.getElementById('biodiversitydb')
        //biodiversitydb.innerHTML = '';
        const _speciesName = encodeURIComponent(speciesName);
        const url = `https://api.gbif.org/v1/species?name=${_speciesName}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP-Error: ${response.status}`);
            const json = await response.json();
            const occurrence = gbifoccurrence ? await getOccurrence(speciesName) : ['-','-'];
            
            const row = _gbifTableBody.insertRow();
            for (const results of json.results) {
                if (results.taxonomicStatus === 'ACCEPTED' && results.taxonID.includes('gbif:')) {
                    console.log(results);
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
                <td>${occurrence[1].join('<br>')}</td>
                <td>${occurrence[2].join('<br>')}</td>
                <td><a class="btn btn-outline-dark" href="https://www.gbif.org/species/${results.taxonID.split(':')[1]}" role="button" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a></td>
                `;
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
    await Promise.all(promises);
}

async function getOccurrence(speciesName) {
    const dataParams = { 'scientificName': speciesName , 'limit': 1000000};
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


// BOLD Systems //

async function getBoldSystem(speciesName) {
    const url = `https://v3.boldsystems.org/index.php/API_Tax/TaxonSearch?taxName=${speciesName}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('A resposta da rede não foi ok.');
        }
        const json = await response.json();
        return json;
    } catch (error) {
        console.error('Falha ao buscar dados do sistema BOLD:', error);
    }
}

// Uso
getBoldSystem('Diplura').then(data => console.log(data));


