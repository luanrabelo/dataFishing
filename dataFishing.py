__author__      = "Luan Rabelo"
__license__     = "MIT"
__version__     = "1.0.0"
__maintainer__  = "Luan Rabelo"
__email__       = "luanrabelo@outlook.com"
__date__        = "2024/03/20"
__twitter__     = "lprabelo"
__github__      = "luanrabelo/dashFishing"
__status__      = "Development"
__tool__        = "dataFishing"

import os
import re
import time
import sys
import asyncio
import subprocess
import argparse

class TerminalColors:
    Green       = '\033[92m' # Green  #00FF00
    Warning     = '\033[93m' # Yellow #FFFF00
    Fail        = '\033[91m' # Red    #FF0000
    End         = '\033[0m'  # End    #FFFFFF
    Underline   = '\033[4m'  # Underline
    Bold        = '\033[1m'  # Bold

try:
    import requests
    print(f"{TerminalColors.Green}Package 'Requests' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Package 'Requests' not found, please install it with: {TerminalColors.Underline}pip install requests{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'requests'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{TerminalColors.Green}Package 'Requests' installed successfully!{TerminalColors.End}")
        try:
            import requests
            print(f"{TerminalColors.Green}Package 'Requests' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Package 'Requests' not found, please reinstall it with: {TerminalColors.Underline}pip install requests{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'Requests' aborted!{TerminalColors.End}")

try:
    import aiohttp
    print(f"{TerminalColors.Green}Package 'Aiohttp' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Package 'Aiohttp' not found, please install it with: {TerminalColors.Underline}pip install aiohttp{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'aiohttp'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{TerminalColors.Green}Package 'Aiohttp' installed successfully!{TerminalColors.End}")
        try:
            import aiohttp
            print(f"{TerminalColors.Green}Package 'Aiohttp' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Package 'Aiohttp' not found, please reinstall it with: {TerminalColors.Underline}pip install aiohttp{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'Aiohttp' aborted!{TerminalColors.End}")

try:
    import pandas as pd
    print(f"{TerminalColors.Green}Package 'Pandas' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Package 'Pandas' not found, please install it with: {TerminalColors.Underline}pip install pandas{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'pandas'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{TerminalColors.Green}Package 'Pandas' installed successfully!{TerminalColors.End}")
        try:
            import pandas as pd
            print(f"{TerminalColors.Green}Package 'Pandas' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Package 'Pandas' not found, please reinstall it with: {TerminalColors.Underline}pip install pandas{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'Pandas' aborted!{TerminalColors.End}")

try:
    from Bio import Entrez, SeqIO
    print(f"{TerminalColors.Green}Package 'Bio' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Package 'Bio' not found, please install it with: {TerminalColors.Underline}pip install biopython{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'biopython'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{TerminalColors.Green}Package 'Bio' installed successfully!{TerminalColors.End}")
        try:
            from Bio import Entrez, SeqIO
            print(f"{TerminalColors.Green}Package 'Bio' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Package 'Bio' not found, please reinstall it with: {TerminalColors.Underline}pip install biopython{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'Bio' aborted!{TerminalColors.End}")

try:
    from SynGenes import SynGenes
    print(f"{TerminalColors.Green}Package 'SynGenes' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Package 'SynGenes' not found, please install it with: {TerminalColors.Underline}pip install SynGenes{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'SynGenes'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{TerminalColors.Green}Package 'SynGenes' installed successfully!{TerminalColors.End}")
        try:
            from SynGenes import SynGenes
            print(f"{TerminalColors.Green}Package 'SynGenes' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Package 'SynGenes' not found, please reinstall it with: {TerminalColors.Underline}pip install SynGenes{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'SynGenes' aborted!{TerminalColors.End}")

try:
    import xlsxwriter
    print(f"{TerminalColors.Green}Package 'XlsxWriter' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Package 'XlsxWriter' not found, please install it with: {TerminalColors.Underline}pip install xlsxwriter{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'xlsxwriter'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{TerminalColors.Green}Package 'XlsxWriter' installed successfully!{TerminalColors.End}")
        try:
            import xlsxwriter
            print(f"{TerminalColors.Green}Package 'XlsxWriter' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Package 'XlsxWriter' not found, please reinstall it with: {TerminalColors.Underline}pip install xlsxwriter{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'XlsxWriter' aborted!{TerminalColors.End}")

# Dictionary with the status of the IUCN Red List and the color that corresponds to each one
StatusIUCN = {
    'LC': ['Least Concern', '#5FC65A'],
    'NT': ['Near Threatened', '#CCE226'],
    'VU': ['Vulnerable', '#F9E814'],
    'EN': ['Endangered', '#FC7F3F'],
    'CR': ['Critically Endangered', '#D81E05'],
    'EW': ['Extinct in the Wild', '#542243'],
    'EX': ['Extinct', '#000000'],
    'DD': ['Data Deficient', '#D1D1C7'],
    'NE': ['Not Evaluated', '#FFFFFF']
    }

def createFolder(**kwargs):
        """
        # createFolder: Create a Folder to store the data in the current directory.
        ---
        Create a folder to store the data. If the folder already exists, it will not be created again.

        Args:
            - `folderName` (str): Folder Name to save the data. Default is 'dataFishing'.
            - `verbose` (bool): If True, print the status of the function. Default is True.

        Returns:
            -  `None`

        Note:
            - This function requires the 'os' library to be imported.
            - This function requires the 're' library to be imported.
        
        Example:
            ```python
            createFolder(folderName='Rhinella marina', verbose=True)
            ```
        """

        # Folder Name, where the data will be saved. Default is RepyteR
        _folderName = kwargs.get('folderName', 'dataFishing')
        # Remove special characters from the folderName and replace them with '_'
        _folderName = re.sub(r'[^A-Za-z0-9/-]+', '_', _folderName)
        # If True, print the status of the function. Default is True
        _verbose    = kwargs.get('verbose', True)  

        # Check if the folder already exists in the current directory
        if not os.path.exists(_folderName):
            # Create the folder if it does not exist
            if _verbose:
                # Print the status of the function
                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Creating Folder {_folderName} in {os.getcwd()}{TerminalColors.End}")
            # Create the folder if it does not exist and set the permissions to 777 (read, write and execute)
            os.makedirs(_folderName, mode=0o777, exist_ok=True)
            if _verbose:
                # Print the status of the function
                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Folder {_folderName} created successfully!{TerminalColors.End}")
        else:
            if _verbose:
                # Print the status of the function
                print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Folder {_folderName} already exists!{TerminalColors.End}")

def readInputFile(**kwargs):
    _input      = kwargs.get('input', None)
    _folder     = kwargs.get('folder', None)
    _verbose    = kwargs.get('verbose', True)

    if _input is not None:
        if _verbose:
            print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Reading Input File '{os.path.basename(_input)}', please wait...{TerminalColors.End}")
        try:
            _df = pd.read_csv(_input, sep='\t', encoding='latin', low_memory=False)
            if len(_df.columns) > 1:
                if _verbose:
                    print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Input File '{os.path.basename(_input)}' (tsv) loaded successfully!{TerminalColors.End}")
                columnsDrop = [
                    'catalognum', 'fieldnum', 'institution_storing', 'collection_code', 'phylum_taxID',
                    'class_taxID', 'order_taxID', 'family_taxID', 'subfamily_taxID', 'genus_taxID',
                    'species_taxID', 'subspecies_taxID', 'identification_provided_by', 'identification_method', 'identification_reference',
                    'tax_note', 'voucher_status', 'tissue_type', 'collection_event_id', 'collectors',
                    'collectiontime', 'collectiondate_start', 'collectiondate_end', 'collection_note', 'site_code',
                    'sampling_protocol', 'lifestage', 'sex', 'reproduction', 'habitat',
                    'associated_specimens', 'associated_taxa', 'extrainfo', 'notes', 'coord_source',
                    'coord_accuracy', 'elev', 'depth', 'elev_accuracy', 'depth_accuracy', 
                    'sector', 'exactsite', 'image_ids', 'image_urls', 'media_descriptors',
                    'captions', 'copyright_holders', 'copyright_years', 'copyright_licenses', 'copyright_institutions',
                    'photographers', 'sequenceID', 'trace_ids', 'trace_names', 'trace_links',
                    'run_dates', 'sequencing_centers', 'directions', 'seq_primers', 'marker_codes'
                    ]
                _df.drop(columns=columnsDrop, inplace=True, errors='ignore')

                columnsReplaceTaxonomy      = ['phylum_name', 'class_name', 'order_name', 'family_name', 'genus_name', 'species_name', 'subfamily_name']
                _df[columnsReplaceTaxonomy] = _df[columnsReplaceTaxonomy].fillna('-').astype(str).replace('[^a-zA-Z0-9] ', '', regex=True)
                columnsReplaceNaN           = ['lat', 'lon', 'country', 'province_state', 'region', 'subspecies_name']
                _df[columnsReplaceNaN]      = _df[columnsReplaceNaN].fillna('-').astype(str).replace('nan', '-')
                _df['nucleotides']          = _df['nucleotides'].replace('nan', '*').replace('-', '')

                _df.rename(columns={
                    'processid': 'Process ID',
                    'sampleid': 'Sample ID',
                    'phylum_name': 'Phylum',
                    'class_name': 'Class',
                    'order_name': 'Order',
                    'family_name': 'Family',
                    'genus_name': 'Genus',
                    'species_name': 'Species',
                    'subfamily_name': 'Subfamily',
                    'subspecies_name': 'Subspecies',
                    'lat': 'Latitude',
                    'lon': 'Longitude',
                    'country': 'Country',
                    'province_state': 'Province State',
                    'region': 'Region',
                    'nucleotides': 'Nucleotides',
                    }, inplace=True)
                
                createFolder(folderName=f'dataFishing_output/{_folder}', verbose=_verbose)
                _df.to_excel(f'dataFishing_output/{_folder}/Complete_BOLD_Systems_{os.path.basename(_input).split(".")[0]}.xlsx', index=False)
                
                for i in _df['Species'].unique().tolist():
                    _specieFolder = str(i) if i != '-' else 'Unknown_Species'
                    _specieFolder = re.sub(r'[^A-Za-z0-9/-]+', '_', _specieFolder)
                    createFolder(folderName=f"dataFishing_output/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences", verbose=_verbose)
                    createFolder(folderName=f"dataFishing_output/{_folder}/BOLD_LocalData/{_specieFolder}/Sequences", verbose=_verbose)
                    _dfSpecies = _df[_df['Species'] == i]
                    try:
                        _dfSpecies.to_excel(f"dataFishing_output/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences/{_specieFolder}.xlsx", index=False)
                        _dfSpecies.to_csv(f"dataFishing_output/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences/{_specieFolder}.tsv", sep='\t', index=False)
                        for index, row in _dfSpecies.iterrows():
                            try:
                                if row['Nucleotides'] != '*':
                                    with open(f"dataFishing_output/{_folder}/BOLD_LocalData/{_specieFolder}/Sequences/{_specieFolder}.fasta", 'a+') as f:
                                        f.write(f">{row['Species']}_{row['Process ID']}_{row['Sample ID']}_{row['Country']}\n{row['Nucleotides']}\n")
                            except Exception as e:
                                if _verbose:
                                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error: {e}{TerminalColors.End}")
                    except Exception as e:
                        if _verbose:
                            print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error: {e}{TerminalColors.End}")
                return _df['Species'].unique().tolist()
            else:
                with open(_input, 'r', encoding='latin') as file:
                    _dataLines = [line.strip() for line in file.readlines()]
                if _verbose:
                    print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Input File '{os.path.basename(_input)}' (txt) loaded successfully!{TerminalColors.End}")
            return _dataLines
        except Exception as e:
            if _verbose:
                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error: {e}{TerminalColors.End}")
            return None
    else:
        if _verbose:
            print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Input File not provided!{TerminalColors.End}")
        return None


        
# Function to get the status conservation of a species from the IUCN Red List
async def getIUCNStatusConservation(**kwargs):
    _specieName = kwargs.get('spName', "Rhinella marina")
    _time       = kwargs.get('time', 1)
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)

    errorMessages = {
        404: "Status Conservation '{}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }

    _status = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Status Conservation of '{_specieName}' from IUCN Red List...{TerminalColors.End}")
    url = f'https://apiv3.iucnredlist.org/api/v3/species/{_specieName}?token={_token}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Found Status Conservation of '{_specieName}' in IUCN Red List!{TerminalColors.End}")
                    for data in Taxdata['result']:
                        if data['category'] in StatusIUCN.keys():
                            _status.extend(StatusIUCN[data['category']])
                            if _log:
                                with open('StatusConservationLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Status Conservation of '{_specieName}' is {_status[1]}\n")
                            if _verbose:
                                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Status Conservation of '{_specieName}' is {_status[1]}!{TerminalColors.End}")
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Status Conservation of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                    if _log:
                        with open('StatusConservationLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Status Conservation of '{_specieName}' not found in IUCN Red List!\n")
                    _status.extend(['-', '-'])
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log:
                    with open('StatusConservationLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                _status.extend(['-', '-'])
    return _status

async def IUCNStatusConservation(**kwargs):
    """
    ## IUCNStatusConservation Function Documentation
    #### Created by: [Luan Rabelo](https://github.com/luanrabelo)  

    ## Description
        The `IUCNStatusConservation` function is an asynchronous function that retrieves the conservation status of a list of species from the IUCN Red List.

    ## Parameters
    The function accepts the following parameters:
        - `speciesList` (optional): A list of species names for which to retrieve the conservation status. The default value is an empty list.
        - `verbose` (optional): A boolean that determines whether the function should print status messages during execution. The default value is True.
        - `log` (optional): A boolean that determines whether the function should log its actions. The default value is True.
        - `time` (optional): The wait time between requests to avoid overloading the server. The default value is 0.25.

    ## Return
        The function returns a dictionary where the keys are the species names and the values are the corresponding conservation status.

    ## Usage Example
    ```python
    import asyncio
    # Define the list of species
    speciesList = ["Panthera leo", "Elephas maximus", "Canis lupus"]
    # Create an event loop
    loop = asyncio.get_event_loop()
    # Use the function to get the conservation status
    status = loop.run_until_complete(IUCNStatusConservation(speciesList=spList, verbose=True, log=False, time=0.25, semaphore=50))
    # Print the conservation status
    for species, conservation_status in status.items():
        print(f"The conservation status of {species} is {conservation_status}.")
    ```
    """
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Status Conservation of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
    _tskStatus  = [
        getIUCNStatusConservation(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log,
            ) for sp in _spList]
    
    dataStatus  = await asyncio.gather(*_tskStatus)
    dictStatus = {status[0]: status[1] for status in dataStatus}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Status Conservation of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictStatus

# Function to get the synonyms names of a species from the IUCN Red List
async def getIUCNSynonymsNames(**kwargs):
    _specieName = kwargs.get('spName', "Rhinella marina")
    _time       = kwargs.get('time', 1)
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _listSyn    = []

    errorMessages = {
        404: "Synonyms Names '{}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }

    _synonyms = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Synonyms of '{_specieName}' from IUCN Red List...{TerminalColors.End}")
    
    url = f'https://apiv3.iucnredlist.org/api/v3/species/synonym/{_specieName}?token={_token}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Found Synonyms of '{_specieName}' in IUCN Red List!{TerminalColors.End}")
                    for data in Taxdata['result']:
                        if data['synonym']:
                            _listSyn.append(f"{data['synonym']} {str(data['authority']).replace('&amp;', '&')}")
                            if _log:
                                with open('SynonymsLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Synonyms of '{_specieName}' is {'; '.join(_listSyn)}\n")
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Synonyms of '{_specieName}' is {'; '.join(_listSyn)}!{TerminalColors.End}")
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Synonyms of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                    if _log:
                        with open('SynonymsLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Synonyms of '{_specieName}' not found in IUCN Red List!\n")
                    _listSyn.append('-')
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log:
                    with open('SynonymsLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                _listSyn.append('-')
    _synonyms.append('\n'.join(_listSyn))
    return _synonyms

async def IUCNSynonymsNames(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Synonyms of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")

    _tskSynonyms    = [
        getIUCNSynonymsNames(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataSynonyms    = await asyncio.gather(*_tskSynonyms)
    dictSynonyms    = {synonyms[0]: synonyms[1] for synonyms in dataSynonyms}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Synonyms of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictSynonyms


async def getIUCNTaxonomy(**kwargs):
    _specieName = kwargs.get('spName', "Rhinella marina")
    _time       = kwargs.get('time', 1)
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)

    dataList = {
        'Kingdom':     '-',
        'Phylum':      '-',
        'Class':       '-',
        'Order':       '-',
        'Family':      '-',
        'Genus':       '-',
        'Specie':      '-', 
    }

    errorMessages = {
        404: "Taxonomy '{}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }

    _taxonomy = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of '{_specieName}' from IUCN Red List...{TerminalColors.End}")
    url = f'https://apiv3.iucnredlist.org/api/v3/species/{_specieName}?token={_token}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Found Taxonomy of '{_specieName}' in IUCN Red List!{TerminalColors.End}")
                    for data in Taxdata['result']:
                        if data['kingdom'] or data['phylum'] or data['class'] or data['order'] or data['family']:
                            dataList['Kingdom'] = str(data.get('kingdom', '-')).capitalize()
                            dataList['Phylum']  = str(data.get('phylum', '-')).capitalize()
                            dataList['Class']   = str(data.get('class', '-')).capitalize()
                            dataList['Order']   = str(data.get('order', '-')).capitalize()
                            dataList['Family']  = str(data.get('family', '-')).capitalize()
                            dataList['Genus']   = data.get('genus', f'{str(_specieName).split(" ")[0]}')
                            dataList['Specie']  = data.get('scientific_name', f'{_specieName}')
                    if _log:
                        with open('TaxonomyLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' is {dataList}\n")
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' is {dataList}!{TerminalColors.End}")
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                    if _log:
                        with open('TaxonomyLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' not found in IUCN Red List!\n")
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log:
                    with open('TaxonomyLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
    _taxonomy.append('; '.join(dataList.values()))
    return _taxonomy


async def IUCNTaxonomy(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
    _tskTaxonomy = [
        getIUCNTaxonomy(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    dictTaxonomy = {taxonomy[0]: taxonomy[1] for taxonomy in dataTaxonomy}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictTaxonomy

async def getIUCNCommonNames(**kwargs):
    _specieName = kwargs.get('spName', "Rhinella marina")
    _time       = kwargs.get('time', 1)
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    lstCommon   = []

    errorMessages = {
        404: "Common Names '{}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }

    _commonNames = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Common Names of '{_specieName}' from IUCN Red List...{TerminalColors.End}")
    
    url = f'https://apiv3.iucnredlist.org/api/v3/species/common_names/{_specieName}?token={_token}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Found Common Names of '{_specieName}' in IUCN Red List!{TerminalColors.End}")
                    for data in Taxdata['result']:
                        if data['taxonname']:
                            lstCommon.append(f"{str(data['taxonname'])} ({str(data['language'])})")
                            if _log:
                                with open('CommonNamesLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' is {lstCommon}\n")
                            if _verbose:
                                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' is {lstCommon}!{TerminalColors.End}")
                        else:
                            if _verbose:
                                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                            if _log:
                                with open('CommonNamesLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: {data['taxonname']} not found for {_specieName} in IUCN Red List!\n")
                            lstCommon.append(str('-'))
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                    if _log:
                        with open('CommonNamesLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' not found in IUCN Red List!\n")
                    lstCommon.append(str('-'))
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log:
                    with open('CommonNamesLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                _commonNames.append(str('-'))
    _commonNames.append('\n'.join(lstCommon))
    return _commonNames

async def IUCNCommonNames(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Common Names of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
    _tskCommonNames = [
        getIUCNCommonNames(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataCommonNames = await asyncio.gather(*_tskCommonNames)
    dictCommonNames = {commonNames[0]: commonNames[1] for commonNames in dataCommonNames}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Common Names of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictCommonNames


async def getIUCNCountryOccurrence(**kwargs):
    _specieName = kwargs.get('spName', "Rhinella marina")
    _time       = kwargs.get('time', 1)
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    lstCountry  = []

    errorMessages = {
        404: "Country Occurrence '{}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }

    _countryOccurrence = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Country Occurrence of '{_specieName}' from IUCN Red List...{TerminalColors.End}")
    url = f'https://apiv3.iucnredlist.org/api/v3/species/countries/name/{_specieName}?token={_token}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Found Country Occurrence of '{_specieName}' in IUCN Red List!{TerminalColors.End}")
                    for data in Taxdata['result']:
                        if data['country']:
                            lstCountry.append(f"{str(data['country'])} ({str(data['presence']).capitalize()})")
                            if _log:
                                with open('CountryOccurrenceLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' is {lstCountry}\n")
                            if _verbose:
                                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' is {lstCountry}!{TerminalColors.End}")
                        else:
                            if _verbose:
                                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                            if _log:
                                with open('CountryOccurrenceLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: {data['country']} not found for {_specieName} in IUCN Red List!\n")
                            lstCountry.append(str('-'))
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                    if _log:
                        with open('CountryOccurrenceLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' not found in IUCN Red List!\n")
                    lstCountry.append(str('-'))
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log:
                    with open('CountryOccurrenceLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                _countryOccurrence.append(str('-'))
    _countryOccurrence.append('\n'.join(lstCountry))
    return _countryOccurrence

async def IUCNCountryOccurrence(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Country Occurrence of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
    _tskCountryOccurrence = [
        getIUCNCountryOccurrence(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataCountryOccurrence = await asyncio.gather(*_tskCountryOccurrence)
    dictCountryOccurrence = {countryOccurrence[0]: countryOccurrence[1] for countryOccurrence in dataCountryOccurrence}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Country Occurrence of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictCountryOccurrence

async def getIUCNHabitats(**kwargs):
    _specieName = kwargs.get('spName', "Rhinella marina")
    _time       = kwargs.get('time', 1)
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    lstHabitat  = []

    errorMessages = {
        404: "Habitats '{}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }

    _habitats = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Habitats of '{_specieName}' from IUCN Red List...{TerminalColors.End}")
    url = f'https://apiv3.iucnredlist.org/api/v3/habitats/species/name/{_specieName}?token={_token}'
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    if _verbose:
                        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Found Habitats of '{_specieName}' in IUCN Red List!{TerminalColors.End}")
                    for data in Taxdata['result']:
                        if data['habitat']:
                            lstHabitat.append(f"{str(data['habitat']).capitalize()}")
                            if _log:
                                with open('HabitatsLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' is {lstHabitat}\n")
                            if _verbose:
                                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' is {lstHabitat}!{TerminalColors.End}")
                        else:
                            if _verbose:
                                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                            if _log:
                                with open('HabitatsLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: {data['habitat']} not found for {_specieName} in IUCN Red List!\n")
                            lstHabitat.append(str('-'))
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' not found in IUCN Red List!{TerminalColors.End}")
                    if _log:
                        with open('HabitatsLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' not found in IUCN Red List!\n")
                    lstHabitat.append(str('-'))
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log:
                    with open('HabitatsLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                _habitats.append(str('-'))
    _habitats.append('\n'.join(lstHabitat))
    return _habitats

async def IUCNHabitats(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Habitats of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
    _tskHabitats = [
        getIUCNHabitats(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataHabitats = await asyncio.gather(*_tskHabitats)
    dictHabitats = {habitats[0]: habitats[1] for habitats in dataHabitats}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Habitats of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictHabitats

async def GBIF(**kwargs):
    _spName = kwargs.get('spName', 'Rhinella marina')
    _time = kwargs.get('time', 1)
    _verbose = kwargs.get('verbose', True)
    _log = kwargs.get('log', True)

    dataList = {
        'Key': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': _spName.split(' ')[0],
        'Specie': _spName,
        'Basionym': '-',
        'Scientific Name': '-',
        'Vernacular Name': '-',
        'Authorship': '-',
        'Taxonomic Status': '-',
    }

    ErrorMessages = {
        404: f"Status Conservation '{_spName}' not found in GBIF!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of '{_spName}' from GBIF...{TerminalColors.End}")
    async with aiohttp.ClientSession() as session:
        url = f'https://api.gbif.org/v1/species?name={_spName}'
        async with session.get(url) as response:
            if response.status == 200:
                Taxdata = await response.json()
                if len(Taxdata['results']) > 0:
                    for data in Taxdata['results']:
                        TaxID = data.get('taxonID', "-")
                        if data['taxonomicStatus'] == "ACCEPTED" and TaxID != "-" and TaxID.count('gbif:') >= 1:
                            if _verbose:
                                print(f"Found '{_spName}' in GBIF!")
                            dataList['Key'] = data.get('key', '-')
                            dataList['Kingdom'] = data.get('kingdom', '-')
                            dataList['Phylum'] = data.get('phylum', '-')
                            dataList['Class'] = data.get('class', '-')
                            dataList['Order'] = data.get('order', '-')
                            dataList['Family'] = data.get('family', '-')
                            dataList['Genus'] = data.get('genus', '-')
                            dataList['Specie'] = data.get('species', '-')
                            dataList['Basionym'] = data.get('basionym', '-')
                            dataList['Scientific Name'] = data.get('scientificName', '-')
                            dataList['Vernacular Name'] = data.get('vernacularName', '-')
                            dataList['Authorship'] = data.get('authorship', '-')
                            dataList['Taxonomic Status'] = data.get('taxonomicStatus', '-')
                            print(f"Found '{_spName}' in GBIF!")
                else:
                    if _verbose:
                        print(f"No results found for '{_spName}' in GBIF!")
            else:
                if _verbose:
                    print(ErrorMessages.get(response.status, 'Error!'))
    return dataList

async def getGBIF(**kwargs):
    _spList = kwargs.get('speciesList', [])
    _verbose = kwargs.get('verbose', True)
    _log = kwargs.get('log', True)
    _time = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of {len(_spList)} species from GBIF...{TerminalColors.End}")
    _tskTaxonomy = [
        GBIF(
            spName=sp,
            time=_time,
            verbose=_verbose,
            log=_log
        ) for sp in _spList]
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    dictTaxonomy = {taxonomy['Specie']: taxonomy for taxonomy in dataTaxonomy}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of {len(_spList)} species from GBIF found successfully!{TerminalColors.End}")
    return dictTaxonomy

async def WoRMS(**kwargs):
    _specieName     = kwargs.get('spName', 'Rhinella marina')
    _time           = kwargs.get('time', 1)
    _verbose        = kwargs.get('verbose', True)
    _log            = kwargs.get('log', True)

    dataList = {
        'AphiaID' : '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': _specieName.split(' ')[0],
        'Species': _specieName,
        'Species Status': '-',
        'Link' : '-',
        'Authority': '-',
        }

    errorMessages = {
            404: "Taxonomy of '{}' not found in WoRMS!",
            500: "Internal Server Error!",
            503: "Service Unavailable!",
            504: "Gateway Timeout!",
            400: "Bad Request!",
            401: "Unauthorized!",
            403: "Forbidden!",
            405: "Method Not Allowed!",
            502: "Bad Gateway!"
        }
    
    _WoRMS = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of '{_specieName}' from WoRMS...{TerminalColors.End}")
    
    _url = f"https://www.marinespecies.org/rest/AphiaRecordsByName/{_specieName}"
    async with aiohttp.ClientSession() as session:
        async with session.get(_url) as response:
            if response.status == 200:
                _data = await response.json()
                d = _data[0]
                dataList['AphiaID']         = str(d.get('AphiaID', '-'))
                dataList['Link']            = str(d.get('url', '-'))
                dataList['Species']         = _specieName
                dataList['Authority']       = str(d.get('authority', '-'))
                dataList['Species Status']  = str(d.get('status', '-'))
                dataList['Kingdom']         = str(d.get('kingdom', '-'))
                dataList['Phylum']          = str(d.get('phylum', '-'))
                dataList['Class']           = str(d.get('class', '-'))
                dataList['Order']           = str(d.get('order', '-'))
                dataList['Family']          = str(d.get('family', '-'))
                dataList['Genus']           = _specieName.split(' ')[0]
    _WoRMS.append(';'.join(dataList.values()))
    print(dataList)
    return _WoRMS

async def getWoRMS(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of {len(_spList)} species from WoRMS...{TerminalColors.End}")
    _tskTaxonomy = [
        WoRMS(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    dictTaxonomy = {taxonomy[0]: taxonomy[1] for taxonomy in dataTaxonomy}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of {len(_spList)} species from WoRMS found successfully!{TerminalColors.End}")
    return dictTaxonomy

async def BoldSystemData(**kwargs):
    _taxid          = kwargs.get('taxid', 0)
    _verbose        = kwargs.get('verbose', True)
    dataList = {
        'Kingdom':     '-',
        'Phylum':      '-',
        'Class':       '-',
        'Order':       '-',
        'Family':      '-',
        'Genus':       '-',
        'Species':      '-', 
    }
    errorMessages = {
            404: "Taxonomy of '{}' not found in BoldSystem!",
            500: "Internal Server Error!",
            503: "Service Unavailable!",
            504: "Gateway Timeout!",
            400: "Bad Request!",
            401: "Unauthorized!",
            403: "Forbidden!",
            405: "Method Not Allowed!",
            502: "Bad Gateway!"
        }
    _taxurl = f"https://v3.boldsystems.org/index.php/API_Tax/TaxonData?taxId={_taxid}&dataTypes=basic&includeTree=true"
    async with aiohttp.ClientSession() as session:
        async with session.get(_taxurl) as _taxresponse:
            if _taxresponse.status == 200:
                _taxdata = await _taxresponse.json(content_type=None)
                keydata = list(_taxdata.keys())
                for _i in keydata:
                    if _taxdata[_i]['tax_rank'] == "species":
                        dataList['Species'] = _taxdata[_i]['taxon']
                    if _taxdata[_i]['tax_rank'] == "genus":
                        dataList['Genus'] = _taxdata[_i]['taxon']
                    if _taxdata[_i]['tax_rank'] == "family":
                        dataList['Family'] = _taxdata[_i]['taxon']
                    if _taxdata[_i]['tax_rank'] == "order":
                        dataList['Order'] = _taxdata[_i]['taxon']
                    if _taxdata[_i]['tax_rank'] == "class":
                        dataList['Class'] = _taxdata[_i]['taxon']
                    if _taxdata[_i]['tax_rank'] == "phylum":
                        dataList['Phylum'] = _taxdata[_i]['taxon']
                    if _taxdata[_i]['tax_rank'] == "kingdom":
                        dataList['Kingdom'] = _taxdata[_i]['taxon']
                return dataList
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: {errorMessages[_taxresponse.status]}{TerminalColors.End}")
                return None
    
async def BoldSystem(**kwargs):
    _specieName     = kwargs.get('spName', 'Rhinella marina')
    _time           = kwargs.get('time', 1)
    _verbose        = kwargs.get('verbose', True)
    _log            = kwargs.get('log', True)

    dataList = {
        'Kingdom':     '-',
        'Phylum':      '-',
        'Class':       '-',
        'Order':       '-',
        'Family':      '-',
        'Genus':       _specieName.split(' ')[0],
        'Species':      _specieName, 
    }

    errorMessages = {
            404: "Taxonomy of '{}' not found in BoldSystem!",
            500: "Internal Server Error!",
            503: "Service Unavailable!",
            504: "Gateway Timeout!",
            400: "Bad Request!",
            401: "Unauthorized!",
            403: "Forbidden!",
            405: "Method Not Allowed!",
            502: "Bad Gateway!"
        }
    
    _BoldSystems = [_specieName]
    if _time > 0:
        await asyncio.sleep(_time)
    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of '{_specieName}' from Bold Systems...{TerminalColors.End}")
    
    _url = f"http://v3.boldsystems.org/index.php/API_Tax/TaxonSearch?taxName={_specieName}"
    async with aiohttp.ClientSession() as session:
        async with session.get(_url) as response:
            if response.status == 200:
                _data = await response.json(content_type=None)
                if len(_data) > 0:
                    taxid = next((v['taxid'] for v in _data.values() if 'taxid' in v), None)
                    _taxdata = await BoldSystemData(taxid=taxid, verbose=_verbose)
                    if _taxdata is not None:
                        _BoldSystems.append(';'.join(_taxdata.values()))
                        print(_taxdata)
                        return _BoldSystems
                    else:
                        if _verbose:
                            print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: No data found for '{_specieName}' in Bold Systems{TerminalColors.End}")
                        return _BoldSystems.append(';'.join(dataList.values()))
                else:
                    if _verbose:
                        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: No data found for '{_specieName}' in Bold Systems{TerminalColors.End}")
            else:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: No data found for '{_specieName}' in Bold Systems{TerminalColors.End}")
    _BoldSystems.append(';'.join(dataList.values()))
    return _BoldSystems

async def getBoldSystem(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Getting Taxonomy of {len(_spList)} species from Bold Systems...{TerminalColors.End}")
    _tskTaxonomy = [
        BoldSystem(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    dictTaxonomy = {taxonomy[0]: taxonomy[1] for taxonomy in dataTaxonomy}
    if _verbose:
        print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Taxonomy of {len(_spList)} species from Bold Systems found successfully!{TerminalColors.End}")
    return dictTaxonomy

async def NCBI(**kwargs):
    _spName         = kwargs.get('spName', "Rhinella marina")
    _email          = kwargs.get('email', "lprabelo@dataFishing.com")
    _verbose        = kwargs.get('verbose', False)
    _time           = kwargs.get('time', 1)
    _log            = kwargs.get('log', True)

    dataList = {
        'Kingdom':     '-',
        'Phylum':      '-',
        'Class':       '-',
        'Order':       '-',
        'Family':      '-',
        'Genus':       _spName.split(' ')[0],
        'Specie':      _spName, 
    }

    Entrez.email = _email
    Entrez.api_key = "0267bf80ae707dd2c95cd0f3285f9ca87509"
    Entrez.sleep_between_tries = 25
    Entrez.max_tries = 5

    semaphore = asyncio.Semaphore(10)

    if _verbose:
        print(f"Searching Taxonomy in NCBI for '{_spName}', please wait...")
    async with semaphore:
        if _time > 0:
            await asyncio.sleep(_time)
        handle = Entrez.esearch(db="taxonomy", term=_spName, retmax=25, usehistory="y")
        #handle = await asyncio.to_thread(Entrez.esearch, db="taxonomy", term=_spName, retmax=25, usehistory="y")
        record = Entrez.read(handle)
        handle.close()
        if record["Count"] > "0":
            if _verbose:
                print(f"Found ID for '{_spName}' in NCBI!")
                print(f"Extracting Taxonomy for '{_spName}', please wait...")
            _idTax = record["IdList"][0]
            if _time > 0:
                await asyncio.sleep(10)
            try:
                handle = await asyncio.to_thread(Entrez.efetch, db="taxonomy", id=_idTax, retmode="xml")
                records = Entrez.read(handle)
                handle.close()
                _Tax = records[0]
                _Taxonomy = _Tax["LineageEx"]
                for i in _Taxonomy:
                    if str(i['Rank']).capitalize() in dataList:
                        dataList[str(i['Rank']).capitalize()] = i['ScientificName']
            except Exception as e:
                if _verbose:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error in NCBI for '{_spName}'{TerminalColors.End}")
        else:
            if _verbose:
                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: No data found for '{_spName}' in NCBI{TerminalColors.End}")
        return dataList


async def getNCBI(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    _email      = kwargs.get('email', "lprabelo@dataFishing.com")

    if _verbose:
        print(f"Getting Taxonomy of {len(_spList)} species from NCBI...")
    _tskTaxonomy = [
        NCBI(
            spName=sp,
            email=_email,
            time=_time,
            verbose=_verbose,
            log=_log
            ) for sp in _spList]
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    dictTaxonomy = {taxonomy['Specie']: ';'.join(taxonomy.values()) for taxonomy in dataTaxonomy}
    if _verbose:
        print(f"Taxonomy of {len(_spList)} species from NCBI found successfully!")
    return dictTaxonomy

def colorStatus(workbook, background):
    cellFormat = workbook.add_format({'bg_color': background})
    return cellFormat

def dataFishingExcel(**kwargs):
    _df         = kwargs.get('df', None)
    _sheet      = kwargs.get('sheet', 'dataFishing')
    _folderName = kwargs.get('folderName', 'dataFishing_output')
    _verbose    = kwargs.get('verbose', True)

    if _sheet == 'IUCN':
        if _verbose:
            print(f"{TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        _Taxonomy      = _df['Taxonomy'].astype(str).str.split(';', expand=True)
        _df['Kingdom'] = _Taxonomy[0]
        _df['Phylum']  = _Taxonomy[1]
        _df['Class']   = _Taxonomy[2]
        _df['Order']   = _Taxonomy[3]
        _df['Family']  = _Taxonomy[4]
        _df['Genus']   = _Taxonomy[5]
        _df['Species'] = _Taxonomy[6]
        _df.drop(columns=['Taxonomy'], inplace=True)
        if _verbose:
            print(f"{TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        _df = _df[['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Synonyms Names', 'Common Names', 'Habitats', 'Status Conservation']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
    if _verbose:
        print(f"{TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
    with pd.ExcelWriter(f"dataFishing_output/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
        _df.to_excel(writer, sheet_name=_sheet, index=False)
        _workbook  = writer.book
        dataFormat  = _workbook.add_format({
            'text_wrap':True, 
            'align':'left', 
            'valign':'vcenter', 
            #'border':1
            })
        italicFormat = _workbook.add_format({
            'italic': True,
            'text_wrap':True, 
            'align':'left', 
            'valign':'vcenter', 
            #'border':1
            })
        worksheet   = writer.sheets[_sheet]
        for cod, (status, color) in StatusIUCN.items():
                _fmt = colorStatus(_workbook, color)
                worksheet.conditional_format('A2:Z1000', {
                    'type': 'cell',
                    'criteria': 'equal to',
                    'value': f'="{status}"',
                    'format': _fmt
                    })
        worksheet.set_column('A:Z', 20, dataFormat)
        worksheet.set_column('F:H', 20, italicFormat)
        _workbook.set_properties({
        'title':    'dataFishing',
        'subject':  'Developed by Luan Rabelo',
        'author':   'Luan Rabelo',
        'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'})
    
    if _sheet == 'GBIF':
        if _verbose:
            print(f"{TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        _Taxonomy       = dict(_df['Taxonomy'])
        dataExtracted = []
        for key, value in _Taxonomy.items():
            value = dict(value)
            dataExtracted.append({
                'Key': value.get('Key', '-'),
                'Kingdom': value.get('Kingdom', '-'),
                'Phylum': value.get('Phylum', '-'),
                'Class': value.get('Class', '-'),
                'Order': value.get('Order', '-'),
                'Family': value.get('Family', '-'),
                'Genus': value.get('Genus', '-'),
                'Species': value.get('Scientific Name', '-'),
                'Basionym': value.get('Basionym', '-'),
                'Scientific Name': value.get('Scientific Name', '-'),
                'Vernacular Name': value.get('Vernacular Name', '-'),
                'Authorship': value.get('Authorship', '-'),
                'Taxonomic Status': value.get('Taxonomic Status', '-')
            })

        _df = pd.DataFrame(dataExtracted)
       
        if _verbose:
            print(f"{TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        _df = _df[['Key', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Basionym', 'Scientific Name', 'Vernacular Name', 'Authorship', 'Taxonomic Status']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
        if _verbose:
            print(f"{TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
        with pd.ExcelWriter(f"dataFishing_output/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
            _df.to_excel(writer, sheet_name=_sheet, index=False)
            _workbook   = writer.book
            dataFormat  = _workbook.add_format({
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter', 
                #'border':1
                })
            italicFormat = _workbook.add_format({
                'italic': True,
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter', 
                #'border':1
                })
            worksheet   = writer.sheets[_sheet]
            worksheet.set_column('A:Z', 20, dataFormat)
            worksheet.set_column('G:J', 20, italicFormat)
            _workbook.set_properties({
            'title':    'dataFishing',
            'subject':  'Developed by Luan Rabelo',
            'author':   'Luan Rabelo',
            'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'})
    
    if _sheet == 'WoRMS':
        if _verbose:
            print(f"{TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        _Taxonomy      = _df['Taxonomy'].astype(str).str.split(';', expand=True)
        _df['AphiaID']          = _Taxonomy[0]
        _df['Kingdom']          = _Taxonomy[1]
        _df['Phylum']           = _Taxonomy[2]
        _df['Class']            = _Taxonomy[3]
        _df['Order']            = _Taxonomy[4]
        _df['Family']           = _Taxonomy[5]
        _df['Genus']            = _Taxonomy[6]
        _df['Species']          = _Taxonomy[7]
        _df['Species Status']   = _Taxonomy[8]
        _df['Link']             = _Taxonomy[9]
        _df['Authority']        = _Taxonomy[10]
        _df.drop(columns=['Taxonomy'], inplace=True)
        if _verbose:
            print(f"{TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        _df = _df[['AphiaID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Species Status', 'Link', 'Authority']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
        if _verbose:
            print(f"{TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
        with pd.ExcelWriter(f"dataFishing_output/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
            _df.to_excel(writer, sheet_name=_sheet, index=False)
            _workbook  = writer.book
            dataFormat  = _workbook.add_format({
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter', 
                #'border':1
                })
            italicFormat = _workbook.add_format({
                'italic': True,
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter', 
                #'border':1
                })
            _accepted       = _workbook.add_format({'bg_color': '#BACD92', 'font_color': '#000000', 'bold': True})
            _unaccepted     = _workbook.add_format({'bg_color': '#FA7070', 'font_color': '#000000', 'bold': True})
            worksheet   = writer.sheets[_sheet]
            worksheet.conditional_format('A2:Z1000', {'type': 'cell', 'criteria': 'equal to', 'value': '"accepted"', 'format': _accepted})
            worksheet.conditional_format('A2:Z1000', {'type': 'cell', 'criteria': 'equal to', 'value': '"unaccepted"', 'format': _unaccepted})
            worksheet.set_column('A:Z', 20, dataFormat)
            worksheet.set_column('G:H', 20, italicFormat)
            _workbook.set_properties({
            'title':    'dataFishing',
            'subject':  'Developed by Luan Rabelo',
            'author':   'Luan Rabelo',
            'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'})
    
    if _sheet == 'BoldSystem' or _sheet == 'NCBI':
        if _verbose:
            print(f"{TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        _Taxonomy      = _df['Taxonomy'].astype(str).str.split(';', expand=True)
        _df['Kingdom'] = _Taxonomy[0]
        _df['Phylum']  = _Taxonomy[1]
        _df['Class']   = _Taxonomy[2]
        _df['Order']   = _Taxonomy[3]
        _df['Family']  = _Taxonomy[4]
        _df['Genus']   = _Taxonomy[5]
        _df['Species'] = _Taxonomy[6]
        if _verbose:
            print(f"{TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        _df = _df[['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
        if _verbose:
            print(f"{TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
        with pd.ExcelWriter(f"dataFishing_output/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
            _df.to_excel(writer, sheet_name=_sheet, index=False)
            _workbook  = writer.book
            dataFormat  = _workbook.add_format({
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter', 
                #'border':1
                })
            italicFormat = _workbook.add_format({
                'italic': True,
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter', 
                #'border':1
                })
            worksheet   = writer.sheets[_sheet]
            worksheet.set_column('A:Z', 20, dataFormat)
            worksheet.set_column('F:H', 20, italicFormat)
            _workbook.set_properties({
            'title':    'dataFishing',
            'subject':  'Developed by Luan Rabelo',
            'author':   'Luan Rabelo',
            'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'})
        
def emailChecker(**kwargs):
    """
    # emailChecker: Check if the email is valid.
    ---
    Check if the email is valid. If the email is not valid, the script returns False. If the email is valid, the script returns True.

    Args:
        - `email` (str): Email to be checked.
        - `verbose` (bool): If True, print the status of the function. Default is True.

    Returns:
        -  `True` if the email is valid.
        -  `False` if the email is not valid.

    Note:
        - This function requires the 're' library to be imported.
        - This function requires the 'sys' library to be imported.
        - This function requires the 'time' library to be imported.

    Example:
        ```python
        _emailChecker = emailChecker(
            email="luanrabelo@github.com",
            verbose=True
        )
        print(_emailChecker)
        ```
    """
    _email      = kwargs.get('email', None)
    _verbose    = kwargs.get('verbose', True)

    if _email is None or len(_email) == 0 or _email == '':
        if _verbose:
            print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Email not provided!{TerminalColors.End}")
            return False
    else:
        if _verbose:
            print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Checking Email '{_email}'...{TerminalColors.End}")
        e = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if bool(re.match(e, _email)):
            if _verbose:
                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Email '{_email}' is valid!{TerminalColors.End}")
            return True
        else:
            if _verbose:
                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Email '{_email}' is not valid!{TerminalColors.End}")
            return False

async def getNCBIGenes(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _email      = kwargs.get('email', "lprabelo@dataFishing.com")
    _geneName   = kwargs.get('geneName', 'COI')

    if _verbose:
        print(f"Getting Genes of {len(_spList)} species from NCBI...")
    Semaphore = asyncio.Semaphore(10)
    _tskTaxonomy = []
    for sp in _spList:
        task = asyncio.create_task(NCBIGenes(
            spNames=sp, email=_email, semaphore=Semaphore, verbose=_verbose, geneName=_geneName)
            )
        _tskTaxonomy.append(task)
        if len(_tskTaxonomy) % 10 == 0:
            await asyncio.sleep(2)
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    if _verbose:
        print(f"Genes of {len(_spList)} species from NCBI found successfully!")
    return dataTaxonomy

async def NCBIGenes(**kwargs):
    _spNames        = kwargs.get('spNames', [])
    _email          = kwargs.get('email', "lprabelo@dataFishing.com")
    _verbose        = kwargs.get('verbose', False)
    _time           = kwargs.get('time', 1)
    _Semaphore      = kwargs.get('semaphore', None)
    _geneName       = kwargs.get('geneName', 'COI')

    Entrez.email                = _email
    Entrez.api_key              = "0267bf80ae707dd2c95cd0f3285f9ca87509"
    Entrez.sleep_between_tries  = 25
    Entrez.max_tries            = 5

    _listGenes_mt   = ["12S", "16S", "ATP6", "ATP8", "COI", "COII", "COIII", "CYTB", "ND1", "ND2", "ND3", "ND4", "ND4L", "ND5", "ND6", "Control Region"]
    _listGenes_cp   = ['accD', 'atpA', 'atpB', 'atpE', 'atpF', 'atpH', 'atpI', 'ccsA', 'cemA', 'chlB', 'chlL', 'chlN', 'clpP', 'clpP1', 'cysA', 'cysT', 'ftsH', 'infA', 'lhbA', 'matK', 'matk', 'ndhA', 'ndhB', 'ndhC', 'ndhD', 'ndhE', 'ndhF', 'ndhG', 'ndhH', 'ndhI', 'ndhJ', 'ndhK', 'pafI', 'pafII', 'pbf1', 'petA', 'petB', 'petD', 'petE', 'petG', 'petL', 'petN', 'psaA', 'psaB', 'psaC', 'psaI', 'psaJ', 'psaM', 'psb30', 'psbA', 'psbB', 'psbC', 'psbD', 'psbE', 'psbF', 'psbG', 'psbH', 'psbI', 'psbJ', 'psbK', 'psbL', 'psbM', 'psbN', 'psbT', 'psbZ', 'rbcL', 'rpl14', 'rpl16', 'rpl2', 'rpl20', 'rpl21', 'rpl22', 'rpl23', 'rpl32', 'rpl33', 'rpl36', 'rpoA', 'rpoB', 'rpoC1', 'rpoC2', 'rps11', 'rps12', 'rps14', 'rps15', 'rps16', 'rps18', 'rps19', 'rps2', 'rps3', 'rps4', 'rps7', 'rps8', 'rrn16S', 'rrn23S', 'rrn4.5S', 'rrn5S']

    sg = SynGenes(verbose=_verbose)

    if _geneName in _listGenes_mt:
        _type = 'mt'
    elif _geneName in _listGenes_cp:
        _type = 'cp'
    else:
        print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Gene '{_geneName}' not found in the list of genes! Consult the list of genes in the documentation!{TerminalColors.End}")

    if _verbose:
        print(f"Searching Gene {_geneName} in NCBI for '{_spNames}', please wait...")
    
    if _time > 0:
        await asyncio.sleep(_time)
    _query = ""
    _query += f'("{_spNames}"[Organism] OR "{_spNames}"[Title]) AND'
    _querysg = sg.buildQuery(geneName=_geneName, type=_type, searchType='Title')
    _fquery = f"{_query} AND ({_querysg}) AND mitochondrion[filter]"
    
    async with _Semaphore:
        Search          = Entrez.esearch(db="nucleotide", term=_fquery, retmax=1000000)
        SearchResult    = Entrez.read(Search)
        Search.close()
        return SearchResult['IdList']

if __name__ == '__main__':
    _version    = f"Version: {__version__}"
    _status     = f"Status: {__status__}"
    _license    = f"License: {__license__}"
    _author     = f"Author: {__author__}"
    _github     = f"GitHub Page: https://github.com/{__github__}"
    
    parser = argparse.ArgumentParser(
        description     = "dataFishing: An Efficient Python Tool and User-Friendly Web-Form for Mining Genomic, Taxonomic, and Biodiversity Data\n\nCreated by Luan Rabelo",
        formatter_class = argparse.RawTextHelpFormatter,
        epilog          = f"Example: python dataFishing.py -i Examples/Carangidae.txt -v True",
        add_help        = True,
        #allow_abbrev    = False,
        prog            = "dataFishing.py",
    )
    parser.add_argument('-i', '--input', help="This argument specifies the path to the input file, which should be a .txt or .tsv file.\nIf it's a .txt file, it should be formatted such that each line contains a distinct species.\nIf it's a .tsv file, it should be obtained from the Bold System (http://www.boldsystems.org/).\nTo do this, conduct a search and obtain the TSV file by selecting the 'Combined: TSV' option.",
                        type=str,
                        required=True,
                        )
    parser.add_argument('--all', help=
                        '''This argument specifies whether to retrieve data from all available databases (IUCN, GBIF, WoRMS, BOLD, and NCBI).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--iucn', help=
                        '''This argument specifies whether to retrieve data from the IUCN Red List of Threatened Species.''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--gbif', help=
                        '''This argument specifies whether to retrieve data from the Global Biodiversity Information Facility (GBIF).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--worms', help=
                        '''This argument specifies whether to retrieve data from the World Register of Marine Species (WoRMS).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--bold', help=
                        '''This argument specifies whether to retrieve data from the Barcode of Life Data Systems (BOLD).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--ncbi', help=
                        '''This argument specifies whether to retrieve data from the National Center for Biotechnology Information (NCBI).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--download', help=
                        '''This argument specifies whether to download the data retrieved from the BOLD and GenBank. Default is False.''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--genesList', help=
                        '''This argument specifies the genes list to be retrieved from the NCBI.''',
                        type=str,
                        required=False,
                        )
    parser.add_argument('-e', '--email', help="This argument specifies the email to be used in the NCBI API.",
                        type=str,
                        required=True,
                        )
    parser.add_argument('-v', '--verbose', help="This argument specifies if the verbose mode should be enabled or disabled. Default is True.",
                        default=True,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('-log', '--log', help="This argument specifies if the log mode should be enabled or disabled. Default is False.",
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,)
    
    
    args = parser.parse_args()

    _folderName     = time.strftime("%Y-%m-%d-%H-%M-%S")
    _inputFile      = args.input

    _all           = args.all
    _iucn           = args.iucn
    _gbif           = args.gbif
    _worms          = args.worms
    _bold           = args.bold
    _ncbi           = args.ncbi

    _genesList      = args.genesList
    _download       = args.download

    _inputVerbose   = args.verbose
    _inputLog       = args.log

    print("\n")
    print(f"{TerminalColors.Bold}############################## {__tool__} ##############################\n{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Bold}{__tool__} Class has been initialized!{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_version}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_status}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_author}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_license}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_github}{TerminalColors.End}")
    print(f"Consult the documentation in github page for more information.\n")
    print(f"{TerminalColors.Bold}############################## {__tool__} ##############################{TerminalColors.End}\n")

    createFolder(folderName=f"dataFishing_output/{_folderName}", verbose=_inputVerbose)

    _spList = readInputFile(input=_inputFile, folder=_folderName, verbose=_inputVerbose)
    loop    = asyncio.get_event_loop()

    if _iucn == True or _all == True:
        dfIUCN              = pd.DataFrame()
        dfIUCN['Species']   = _spList

        resultsStatus    = loop.run_until_complete(
            IUCNStatusConservation(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfIUCN['Status Conservation'] = dfIUCN['Species'].map(resultsStatus)

        resultsSynonyms     = loop.run_until_complete(
            IUCNSynonymsNames(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfIUCN['Synonyms Names'] = dfIUCN['Species'].map(resultsSynonyms)

        resultsTaxonomy     = loop.run_until_complete(
            IUCNTaxonomy(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfIUCN['Taxonomy']  = dfIUCN['Species'].map(resultsTaxonomy)

        resultsCommon       = loop.run_until_complete(
            IUCNCommonNames(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfIUCN['Common Names']  = dfIUCN['Species'].map(resultsCommon)

        resultsOccurrence  = loop.run_until_complete(
            IUCNCountryOccurrence(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfIUCN['Country Occurrence'] = dfIUCN['Species'].map(resultsOccurrence)

        resultsHabitat     = loop.run_until_complete(
            IUCNHabitats(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfIUCN['Habitats']   = dfIUCN['Species'].map(resultsHabitat)

        dataFishingExcel(df=dfIUCN, sheet='IUCN', folderName=_folderName, verbose=_inputVerbose)
    
    if _gbif == True or _all == True:
        dfGBIF              = pd.DataFrame()
        dfGBIF['Species']   = _spList

        resultsGBIF         = loop.run_until_complete(
            getGBIF(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfGBIF['Taxonomy']  = dfGBIF['Species'].map(dict(resultsGBIF))

        dataFishingExcel(df=dfGBIF, sheet='GBIF', folderName=_folderName, verbose=_inputVerbose)

    if _worms == True or _all == True:
        dfWORMS             = pd.DataFrame()
        dfWORMS['Species']  = _spList
        resultsWORMS = loop.run_until_complete(
            getWoRMS(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfWORMS['Taxonomy'] = dfWORMS['Species'].map(resultsWORMS)
        dataFishingExcel(df=dfWORMS, sheet='WoRMS', folderName=_folderName, verbose=_inputVerbose)

    if _bold == True or _all == True:
        dfBOLD              = pd.DataFrame()
        dfBOLD['Species']   = _spList

        resultsBOLD        = loop.run_until_complete(
            getBoldSystem(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1)
            )
        dfBOLD['Taxonomy']  = dfBOLD['Species'].map(dict(resultsBOLD))
        dataFishingExcel(df=dfBOLD, sheet='BoldSystem', folderName=_folderName, verbose=_inputVerbose)

        if _download == True:
            createFolder(folderName=f"dataFishing_output/{_folderName}/BOLD_Download_Sequences", verbose=_inputVerbose)
            for i in _spList:
                _url        = f'https://v3.boldsystems.org/index.php/API_Public/sequence?taxon={i}'
                _path       = os.path.join(f"dataFishing_output/{_folderName}/BOLD_Download_Sequences", str(i).replace(' ', '_'))
                _download   = requests.get(_url, stream = True)
                if _download.status_code == 200:
                    with open(f"{_path}.fasta", "a+") as file:
                        file.write(_download.content.decode('utf-8'))
                    if _inputVerbose:
                        print(f"{TerminalColors.Green}Downloaded sequences for '{i}' from BOLD successfully!{TerminalColors.End}")
                else:
                    if _inputVerbose:
                        print(f"{TerminalColors.Fail}Error downloading sequences for '{i}' from BOLD!{TerminalColors.End}")
    
    if _ncbi == True or _all == True:
        dfNCBI              = pd.DataFrame()
        dfNCBI['Species']   = _spList
        _email = emailChecker(email=args.email, verbose=_inputVerbose)
        if _email:
            resultsNCBI         = loop.run_until_complete(
                getNCBI(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=1, email=args.email)
                )
            dfNCBI['Taxonomy']  = dfNCBI['Species'].map(dict(resultsNCBI))
            dataFishingExcel(df=dfNCBI, sheet='NCBI', folderName=_folderName, verbose=_inputVerbose)
        else:
            if _inputVerbose:
                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Email not valid!{TerminalColors.End}")
                sys.exit(1)
        if _download and _email:
            if _genesList:
                try:
                    with open(_genesList, 'r', encoding='latin') as file:
                        geneList = [line.strip() for line in file.readlines()]
                except:
                    print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Error reading Gene List! Please check the file and try again!{TerminalColors.End}")
                    sys.exit(1)
                createFolder(folderName=f"dataFishing_output/{_folderName}/NCBI_Download_Sequences", verbose=_inputVerbose)
                for gene in geneList:
                    _sequencesNCBI = loop.run_until_complete(getNCBIGenes(
                        speciesList=_spList, verbose=True, email=args.email, geneName=gene)
                        )
                    for i in _sequencesNCBI:
                        for index, id in enumerate(i):
                            _url        = f"https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=gbwithparts&id={id}&withparts=on"
                            _download   = requests.get(_url, stream = True)
                            _pathFile   = os.path.join(f"dataFishing_output/{_folderName}/NCBI_Download_Sequences", f"{id}.gb")
                            if _download.status_code == 200:
                                with open(_pathFile, "wb") as file:
                                    file.write(_download.content)
                                if _inputVerbose:
                                    print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S')}: Downloaded sequences {index+1} of {len(i)} from NCBI successfully!{TerminalColors.End}")
                                for record in SeqIO.parse(_pathFile, 'genbank'):
                                    try:
                                        _voucher = record.id
                                    except:
                                        _voucher = '-'
                                    try:
                                        _specie = record.annotations["organism"]
                                    except:
                                        _specie = '-'
                                    _specieFolder = re.sub(r'[^A-Za-z0-9/-]+', '_', _specie)
                                    createFolder(folderName=f"dataFishing_output/{_folderName}/NCBI_Download_Sequences/{_specieFolder}", verbose=False)
                                    with open(f"dataFishing_output/{_folderName}/NCBI_Download_Sequences/{_specieFolder}/{gene}.fasta", "a+") as file:
                                        file.write(f">{_voucher}_{_specie}\n{record.seq}\n")
                                os.remove(_pathFile)
                            else:
                                if _inputVerbose:
                                    print(f"{TerminalColors.Fail}Error downloading sequences for '{id}' from NCBI!{TerminalColors.End}")
            else:
                print(f"{TerminalColors.Fail}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Gene List not provided!{TerminalColors.End}")
                sys.exit(1)