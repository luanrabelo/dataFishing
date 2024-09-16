__author__      = "Luan Rabelo"
__license__     = "MIT"
__version__     = "1.0.1"
__maintainer__  = "Luan Rabelo"
__email__       = "luanrabelo@outlook.com"
__date__        = "2024/03/20"
__twitter__     = "lprabelo"
__github__      = "luanrabelo/dashFishing"
__status__      = "Stable"
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
    Italic      = '\033[3m'  # Italic

try:
    import requests
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Requests' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Requests' not found, please install it with: {TerminalColors.Underline}pip install requests{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'requests'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Requests' installed successfully!{TerminalColors.End}")
        try:
            import requests
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Requests' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Requests' not found, please reinstall it with: {TerminalColors.Underline}pip install requests{TerminalColors.End}")
            sys.exit(1)
    else:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Installation 'Requests' aborted!{TerminalColors.End}")

try:
    import aiohttp
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Aiohttp' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Aiohttp' not found, please install it with: {TerminalColors.Underline}pip install aiohttp{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'aiohttp'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Aiohttp' installed successfully!{TerminalColors.End}")
        try:
            import aiohttp
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Aiohttp' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Aiohttp' not found, please reinstall it with: {TerminalColors.Underline}pip install aiohttp{TerminalColors.End}")
            sys.exit(1)
    else:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Installation 'Aiohttp' aborted!{TerminalColors.End}")

try:
    import pandas as pd
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Pandas' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Pandas' not found, please install it with: {TerminalColors.Underline}pip install pandas{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'pandas'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Pandas' installed successfully!{TerminalColors.End}")
        try:
            import pandas as pd
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Pandas' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Pandas' not found, please reinstall it with: {TerminalColors.Underline}pip install pandas{TerminalColors.End}")
            sys.exit(1)
    else:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Installation 'Pandas' aborted!{TerminalColors.End}")

try:
    from Bio import Entrez, SeqIO
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Bio' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Bio' not found, please install it with: {TerminalColors.Underline}pip install biopython{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'biopython'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Bio' installed successfully!{TerminalColors.End}")
        try:
            from Bio import Entrez, SeqIO
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'Bio' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'Bio' not found, please reinstall it with: {TerminalColors.Underline}pip install biopython{TerminalColors.End}")
            sys.exit(1)
    else:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Installation 'Bio' aborted!{TerminalColors.End}")

try:
    from SynGenes import SynGenes
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'SynGenes' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'SynGenes' not found, please install it with: {TerminalColors.Underline}pip install SynGenes{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'SynGenes'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'SynGenes' installed successfully!{TerminalColors.End}")
        try:
            from SynGenes import SynGenes
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'SynGenes' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'SynGenes' not found, please reinstall it with: {TerminalColors.Underline}pip install SynGenes{TerminalColors.End}")
            sys.exit(1)
    else:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Installation 'SynGenes' aborted!{TerminalColors.End}")

try:
    import xlsxwriter
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'XlsxWriter' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'XlsxWriter' not found, please install it with: {TerminalColors.Underline}pip install xlsxwriter{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    _Choice = str(input())
    if _Choice.lower() in ['y', 'yes']:
        subprocess.run(['pip', 'install', 'xlsxwriter'], stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'XlsxWriter' installed successfully!{TerminalColors.End}")
        try:
            import xlsxwriter
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Package 'XlsxWriter' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Package 'XlsxWriter' not found, please reinstall it with: {TerminalColors.Underline}pip install xlsxwriter{TerminalColors.End}")
            sys.exit(1)
    else:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Installation 'XlsxWriter' aborted!{TerminalColors.End}")

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

def colorStatus(workbook, background):
    cellFormat = workbook.add_format({'bg_color': background})
    return cellFormat

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
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Email not provided!{TerminalColors.End}")
            return False
    else:
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Checking Email '{_email}'...{TerminalColors.End}")
        e = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if bool(re.match(e, _email)):
            if _verbose:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Email '{_email}' is valid!{TerminalColors.End}")
            return True
        else:
            if _verbose:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Email '{_email}' is not valid!{TerminalColors.End}")
            return False

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
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Creating Folder {_folderName} in {os.getcwd()}{TerminalColors.End}", end='\n')
            # Create the folder if it does not exist and set the permissions to 777 (read, write and execute)
            os.makedirs(_folderName, mode=0o777, exist_ok=True)
            if _verbose:
                # Print the status of the function
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Folder {_folderName} created successfully!{TerminalColors.End}", end='\n')
        else:
            if _verbose:
                # Print the status of the function
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Folder {_folderName} already exists!{TerminalColors.End}", end='\n')

def readInputFile(**kwargs):
    # Get optional input parameters from kwargs, setting defaults if not provided
    _input      = kwargs.get('input', None)
    _folder     = kwargs.get('folder', None)
    _verbose    = kwargs.get('verbose', True)
    # Check if the input file is provided
    if _input is not None:
        if _verbose:
            # Print a message indicating the start of file reading
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Reading Input File '{os.path.basename(_input)}', please wait...{TerminalColors.End}")
        try:
            # Attempt to read the input file as a CSV file (tab-separated values)
            _df = pd.read_csv(_input, sep='\t', encoding='latin', low_memory=False)
            # Check if the input file has more than one column
            if len(_df.columns) > 1:
                if _verbose:
                    # Print a success message indicating the file was successfully loaded
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Input File '{os.path.basename(_input)}' (tsv) loaded successfully!{TerminalColors.End}")
                # List of columns to drop from the DataFrame
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
                # Drop the specified columns from the DataFrame, ignoring any errors if columns don't exist
                _df.drop(columns=columnsDrop, inplace=True, errors='ignore')
                # Drop Species with NaN values
                _df.dropna(subset=['species_name'], inplace=True)
                # Handle missing taxonomy values by replacing them with '-' and cleaning up special characters
                columnsReplaceTaxonomy      = ['phylum_name', 'class_name', 'order_name', 'family_name', 'genus_name', 'species_name', 'subfamily_name']
                _df[columnsReplaceTaxonomy] = _df[columnsReplaceTaxonomy].fillna('-').astype(str).replace('[^a-zA-Z0-9] ', '', regex=True)
                # Handle missing geographical and species data
                columnsReplaceNaN           = ['lat', 'lon', 'country', 'province_state', 'region', 'subspecies_name']
                _df[columnsReplaceNaN]      = _df[columnsReplaceNaN].fillna('-').astype(str).replace('nan', '-')
                # Process 'nucleotides' column: replace 'nan' with '*' and remove any '-'
                _df['nucleotides']          = _df['nucleotides'].replace('nan', '*').replace('-', '')
                # Rename columns for clarity
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
                # Create a folder for storing the processed data
                createFolder(folderName=f'dataFishing/{_folder}', verbose=_verbose)
                # Save the complete DataFrame to an Excel, TSV and CSV file
                _df.to_excel(f'dataFishing/{_folder}/Complete_BOLD_Systems_{os.path.basename(_input).split(".")[0]}.xlsx', index=False)
                _df.to_csv(f'dataFishing/{_folder}/Complete_BOLD_Systems_{os.path.basename(_input).split(".")[0]}.tsv', sep='\t', index=False)
                _df.to_csv(f'dataFishing/{_folder}/Complete_BOLD_Systems_{os.path.basename(_input).split(".")[0]}.csv', index=False)
                # Loop through unique species in the DataFrame
                for i in _df['Species'].unique().tolist():
                    # Create folders for each species based on its name
                    _specieFolder = str(i) if i != '-' else 'Unknown_Species'
                    _specieFolder = re.sub(r'[^A-Za-z0-9/-]+', '_', _specieFolder)
                    createFolder(folderName=f"dataFishing/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences", verbose=_verbose)
                    createFolder(folderName=f"dataFishing/{_folder}/BOLD_LocalData/{_specieFolder}/Sequences", verbose=_verbose)
                    # Filter DataFrame for the current species
                    _dfSpecies = _df[_df['Species'] == i]
                    try:
                        # Save the species data to Excel, CSV and TSV files
                        _dfSpecies.to_excel(f"dataFishing/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences/{_specieFolder}.xlsx", index=False)
                        _dfSpecies.to_csv(f"dataFishing/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences/{_specieFolder}.tsv", sep='\t', index=False)
                        _dfSpecies.to_csv(f"dataFishing/{_folder}/BOLD_LocalData/{_specieFolder}/Occurrences/{_specieFolder}.csv", index=False)
                        # Save nucleotide sequences to a FASTA file
                        for index, row in _dfSpecies.iterrows():
                            try:
                                if row['Nucleotides'] != '*':
                                    with open(f"dataFishing/{_folder}/BOLD_LocalData/{_specieFolder}/Sequences/{_specieFolder}.fasta", 'a+') as f:
                                        f.write(f">{row['Species']}_{row['Process ID']}_{row['Sample ID']}_{row['Country']}\n{row['Nucleotides']}\n")
                            except Exception as e:
                                # Handle errors during FASTA file creation
                                if _verbose:
                                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error: {e}{TerminalColors.End}")
                    except Exception as e:
                        # Handle errors during species data saving
                        if _verbose:
                            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error: {e}{TerminalColors.End}")
                # Return the list of unique species found in the input file
                return _df['Species'].unique().tolist()
            else:
                # Handle the case where the input file has only one column (likely a text file)
                with open(_input, 'r', encoding='latin') as file:
                    _dataLines = [line.strip() for line in file.readlines()]
                if _verbose:
                    # Print a success message indicating the text file was successfully loaded
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Input File '{os.path.basename(_input)}' (txt) loaded successfully!{TerminalColors.End}")
            # Return the lines of the text file
            return _dataLines
        except Exception as e:
            # Handle errors during file reading
            if _verbose:
                print(f"{TerminalColors.Fail}{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error: {e}{TerminalColors.End}")
            return None
    else:
        # Handle the case where no input file is provided
        if _verbose:
            print(f"{TerminalColors.Fail}{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Input File not provided!{TerminalColors.End}")
        return None

async def getIUCNStatusConservation(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName = kwargs.get('spName', "Rhinella marina")  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')  # IUCN API token
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing status to a file
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Status Conservation '{_specieName}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # Initialize the status list with the species name
    _specieName = re.sub(r'[^A-Za-z ]+', '', _specieName)
    _status     = [_specieName]
    # If a time delay is specified, pause execution
    if _time > 0:
        await asyncio.sleep(_time)
    # If verbose logging is enabled, print a message indicating the start of the status check
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Status Conservation of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from IUCN Red List...{TerminalColors.End}")
    # Construct the API request URL for the species using the IUCN API
    url = f'https://apiv3.iucnredlist.org/api/v3/species/{_specieName}?token={_token}'
    # Use aiohttp to asynchronously send the request to the IUCN Red List API
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if the result field exists and contains data
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    # If verbose logging is enabled, print a success message
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found Status Conservation of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in IUCN Red List!{TerminalColors.End}")
                    # Iterate through the data in the result array
                    for data in Taxdata['result']:
                        # If the species' conservation status category is recognized
                        if data['category'] in StatusIUCN.keys():
                            _status.extend(StatusIUCN[data['category']])  # Add the category to the status list
                            # If logging is enabled, write the status to the log file
                            if _log == True:
                                with open('StatusConservationLog.txt', 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Status Conservation of '{_specieName}' is {_status[1]}\n")
                            # Print the status to the console if verbose mode is on
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Status Conservation of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {_status[1]}!{TerminalColors.End}")
                else:
                    # If no result is found, print a not-found message and log it if verbose/logging is enabled
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Status Conservation of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                    if _log == True:
                        with open('StatusConservationLog.txt', 'a+', encoding='utf-8') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Status Conservation of '{_specieName}' not found in IUCN Red List!\n")
                    # Append placeholders to the status list if the species is not found
                    _status.extend(['-', '-'])
            else:
                # If the response status indicates an error, print and log the error message
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                if _log == True:
                    with open('StatusConservationLog.txt', 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                # Append placeholders to the status list in case of error
                _status.extend(['-', '-'])
    # Return the final status list (species name and conservation status)
    return _status

async def IUCNStatusConservation(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Status Conservation of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Status Conservation of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictStatus

# Function to get the synonyms of a species from the IUCN Red List
async def getIUCNSynonymsNames(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName = kwargs.get('spName', "Rhinella marina")  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')  # IUCN API token
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing synonyms to a file
    _listSyn    = []  # List to store the synonyms
    # Dictionary to map HTTP error codes to custom error messages
    errorMessages = {
        404: f"Synonyms Names '{_specieName}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # Initialize the synonyms list with the species name
    _specieName = re.sub(r'[^A-Za-z ]+', '', _specieName)
    _synonyms   = [_specieName]
    # If a time delay is specified, pause execution
    if _time > 0:
        await asyncio.sleep(_time)
    # If verbose logging is enabled, print a message indicating the start of the synonym search
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Synonyms of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from IUCN Red List...{TerminalColors.End}")
    # Construct the API request URL for the synonyms using the IUCN API
    url = f'https://apiv3.iucnredlist.org/api/v3/species/synonym/{_specieName}?token={_token}'
    # Use aiohttp to asynchronously send the request to the IUCN Red List API
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if the result field exists and contains data
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    # If verbose logging is enabled, print a success message
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found Synonyms of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in IUCN Red List!{TerminalColors.End}")
                    # Iterate through the data in the result array to extract synonyms
                    for data in Taxdata['result']:
                        # If a synonym exists, format and add it to the list
                        if data['synonym']:
                            _listSyn.append(f"{data['synonym']} {str(data['authority']).replace('&amp;', '&')}")
                            # If logging is enabled, write the synonyms to the log file
                            if _log == True:
                                with open('SynonymsLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Synonyms of '{_specieName}' is {'; '.join(_listSyn)}\n")
                    # If verbose logging is enabled, print the found synonyms to the console
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Synonyms of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {TerminalColors.Italic}{'; '.join(_listSyn)}!{TerminalColors.End}")
                # If no synonyms were found, handle the not-found case
                else:
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Synonyms of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")                    
                    # If logging is enabled, write the not-found message to the log file
                    if _log == True:
                        with open('SynonymsLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Synonyms of '{_specieName}' not found in IUCN Red List!\n")
                    # Append a placeholder to indicate no synonyms were found
                    _listSyn.append('-')
            # If the response status indicates an error, handle the error accordingly
            else:
                # Print and log the error if verbose and logging are enabled
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                # If logging is enabled, write the error to the log file
                if _log == True:
                    with open('SynonymsLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                # Append a placeholder to indicate an error occurred
                _listSyn.append('-')
    # Append the collected synonyms to the result list and return it
    _synonyms.append('\n'.join(_listSyn))
    return _synonyms

async def IUCNSynonymsNames(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Synonyms of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Synonyms of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictSynonyms

# Function to get the taxonomy details of a species from the IUCN Red List
async def getIUCNTaxonomy(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName = kwargs.get('spName', "Rhinella marina")  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')  # IUCN API token
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing taxonomy details to a file
    # Initialize a dictionary to store taxonomy data with default placeholder values
    dataList = {
        'Kingdom':     '-',
        'Phylum':      '-',
        'Class':       '-',
        'Order':       '-',
        'Family':      '-',
        'Genus':       '-',
        'Specie':      '-', 
    }
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Taxonomy '{_specieName}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # Initialize the taxonomy list with the species name
    _specieName = re.sub(r'[^A-Za-z ]+', '', _specieName)
    _taxonomy   = [_specieName]
    # If a time delay is specified, pause execution
    if _time > 0:
        await asyncio.sleep(_time)
    # If verbose logging is enabled, print a message indicating the start of the taxonomy retrieval
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from IUCN Red List...{TerminalColors.End}")
    # Construct the API request URL for the taxonomy data using the IUCN API
    url = f'https://apiv3.iucnredlist.org/api/v3/species/{_specieName}?token={_token}'
    # Use aiohttp to asynchronously send the request to the IUCN Red List API
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if the result field exists and contains data
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    # If verbose logging is enabled, print a success message
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in IUCN Red List!{TerminalColors.End}")
                    # Iterate through the data in the result array to extract taxonomy details
                    for data in Taxdata['result']:
                        if data['kingdom'] or data['phylum'] or data['class'] or data['order'] or data['family']:
                            # Populate the dataList with available taxonomy information
                            dataList['Kingdom'] = str(data.get('kingdom', '-')).capitalize()
                            dataList['Phylum']  = str(data.get('phylum', '-')).capitalize()
                            dataList['Class']   = str(data.get('class', '-')).capitalize()
                            dataList['Order']   = str(data.get('order', '-')).capitalize()
                            dataList['Family']  = str(data.get('family', '-')).capitalize()
                            dataList['Genus']   = data.get('genus', f'{str(_specieName).split(" ")[0]}')
                            dataList['Specie']  = data.get('scientific_name', f'{_specieName}')
                    # If logging is enabled, write the taxonomy details to the log file
                    if _log == True:
                        with open('TaxonomyLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' is {dataList}\n")
                    # If verbose logging is enabled, print the taxonomy details to the console
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {dataList}!{TerminalColors.End}")
                # If no taxonomy data was found, handle the not-found case
                else:
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                    # If logging is enabled, write the not-found message to the log file
                    if _log == True:
                        with open('TaxonomyLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' not found in IUCN Red List!\n")
            # If the response status indicates an error, handle the error accordingly
            else:
                # Print and log the error if verbose and logging are enabled
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                # If logging is enabled, write the error to the log file
                if _log == True:
                    with open('TaxonomyLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
    # Append the collected taxonomy details to the result list and return it
    _taxonomy.append('; '.join(dataList.values()))
    return _taxonomy

async def IUCNTaxonomy(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictTaxonomy

# Function to get the common names of a species from the IUCN Red List
async def getIUCNCommonNames(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName = kwargs.get('spName', "Rhinella marina")  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')  # IUCN API token
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing common names to a file
    lstCommon   = []  # List to store common names
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Common Names '{_specieName}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # Initialize the common names list with the species name
    _specieName     = re.sub(r'[^A-Za-z]+', '', _specieName)
    _commonNames    = [_specieName]
    # If a time delay is specified, pause execution
    if _time > 0:
        await asyncio.sleep(_time)
    # If verbose logging is enabled, print a message indicating the start of common names retrieval
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Common Names of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from IUCN Red List...{TerminalColors.End}")
    # Construct the API request URL for common names using the IUCN API
    url = f'https://apiv3.iucnredlist.org/api/v3/species/common_names/{_specieName}?token={_token}'
    # Use aiohttp to asynchronously send the request to the IUCN Red List API
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if the result field exists and contains data
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    # If verbose logging is enabled, print a success message
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found Common Names of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in IUCN Red List!{TerminalColors.End}")
                    # Iterate through the result array to extract common names
                    for data in Taxdata['result']:
                        if data['taxonname']:
                            # Append the common name and its language to the list
                            lstCommon.append(f"{str(data['taxonname'])} ({str(data['language'])})")
                            # If logging is enabled, write the common names to the log file
                            if _log == True:
                                with open('CommonNamesLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' is {lstCommon}\n")
                            # If verbose logging is enabled, print the found common names to the console
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Common Names of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {lstCommon}!{TerminalColors.End}")
                        else:
                            # Handle the case where no common names are found
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Common Names of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                            # If logging is enabled, write the not-found message to the log file
                            if _log == True:
                                with open('CommonNamesLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {data['taxonname']} not found for {_specieName} in IUCN Red List!\n")
                            # Append a placeholder to indicate no common names were found
                            lstCommon.append(str('-'))
                # If no common names were found, handle the not-found case
                else:
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Common Names of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                    # If logging is enabled, write the not-found message to the log file
                    if _log == True:
                        with open('CommonNamesLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Common Names of '{_specieName}' not found in IUCN Red List!\n")
                    # Append a placeholder to indicate no common names were found
                    lstCommon.append(str('-'))
            # If the response status indicates an error, handle the error accordingly
            else:
                # Print and log the error if verbose and logging are enabled
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                # If logging is enabled, write the error to the log file
                if _log == True:
                    with open('CommonNamesLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                # Append a placeholder to indicate an error occurred
                _commonNames.append(str('-'))
    # Append the collected common names to the result list and return it
    _commonNames.append('\n'.join(lstCommon))
    return _commonNames

async def IUCNCommonNames(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Common Names of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Common Names of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictCommonNames

# Function to get the country occurrence data of a species from the IUCN Red List
async def getIUCNCountryOccurrence(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName = kwargs.get('spName', "Rhinella marina")  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')  # IUCN API token
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing country occurrence data to a file
    lstCountry  = []  # List to store country occurrence data
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Country Occurrence '{_specieName}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # Initialize the country occurrence list with the species name
    _specieName         = re.sub(r'[^A-Za-z ]+', '', _specieName)
    _countryOccurrence  = [_specieName]
    # If a time delay is specified, pause execution
    if _time > 0:
        await asyncio.sleep(_time)
    # If verbose logging is enabled, print a message indicating the start of country occurrence retrieval
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Country Occurrence of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from IUCN Red List...{TerminalColors.End}")
    # Construct the API request URL for the country occurrence data using the IUCN API
    url = f'https://apiv3.iucnredlist.org/api/v3/species/countries/name/{_specieName}?token={_token}'
    # Use aiohttp to asynchronously send the request to the IUCN Red List API
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if the result field exists and contains data
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    # If verbose logging is enabled, print a success message
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found Country Occurrence of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in IUCN Red List!{TerminalColors.End}")
                    # Iterate through the result array to extract country occurrence details
                    for data in Taxdata['result']:
                        if data['country']:
                            # Append the country and presence status to the list
                            lstCountry.append(f"{str(data['country'])} ({str(data['presence']).capitalize()})")
                            # If logging is enabled, write the country occurrence data to the log file
                            if _log == True:
                                with open('CountryOccurrenceLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' is {lstCountry}\n")
                            # If verbose logging is enabled, print the found country occurrence data to the console
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Country Occurrence of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {lstCountry}!{TerminalColors.End}")
                        else:
                            # Handle the case where no country occurrence data is found
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Country Occurrence of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                            # If logging is enabled, write the not-found message to the log file
                            if _log == True:
                                with open('CountryOccurrenceLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {data['country']} not found for {_specieName} in IUCN Red List!\n")                            
                            # Append a placeholder to indicate no country occurrence data was found
                            lstCountry.append(str('-'))
                # If no country occurrence data was found, handle the not-found case
                else:
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Country Occurrence of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                    # If logging is enabled, write the not-found message to the log file
                    if _log == True:
                        with open('CountryOccurrenceLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Country Occurrence of '{_specieName}' not found in IUCN Red List!\n")
                    # Append a placeholder to indicate no country occurrence data was found
                    lstCountry.append(str('-'))
            # If the response status indicates an error, handle the error accordingly
            else:
                # Print and log the error if verbose and logging are enabled
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                # If logging is enabled, write the error to the log file
                if _log == True:
                    with open('CountryOccurrenceLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                # Append a placeholder to indicate an error occurred
                _countryOccurrence.append(str('-'))
    # Append the collected country occurrence data to the result list and return it
    _countryOccurrence.append('\n'.join(lstCountry))
    return _countryOccurrence

async def IUCNCountryOccurrence(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Country Occurrence of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Country Occurrence of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictCountryOccurrence

# Function to get the habitat information of a species from the IUCN Red List
async def getIUCNHabitats(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName = kwargs.get('spName', "Rhinella marina")  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _token      = kwargs.get('token', '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee')  # IUCN API token
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing habitat data to a file
    lstHabitat  = []  # List to store habitat data
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Habitats '{_specieName}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # Initialize the habitat list with the species name
    _specieName = re.sub(r'[^A-Za-z ]+', '', _specieName)
    _habitats   = [_specieName]
    # If a time delay is specified, pause execution
    if _time > 0:
        await asyncio.sleep(_time)
    # If verbose logging is enabled, print a message indicating the start of habitat retrieval
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Habitats of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from IUCN Red List...{TerminalColors.End}")
    # Construct the API request URL for the habitat data using the IUCN API
    url = f'https://apiv3.iucnredlist.org/api/v3/habitats/species/name/{_specieName}?token={_token}'
    # Use aiohttp to asynchronously send the request to the IUCN Red List API
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if the result field exists and contains data
                if Taxdata and 'result' in Taxdata and Taxdata['result']:
                    # If verbose logging is enabled, print a success message
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found Habitats of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in IUCN Red List!{TerminalColors.End}")
                    # Iterate through the result array to extract habitat details
                    for data in Taxdata['result']:
                        if data['habitat']:
                            # Append the habitat name to the list
                            lstHabitat.append(f"{str(data['habitat']).capitalize()}")
                            # If logging is enabled, write the habitat data to the log file
                            if _log == True:
                                with open('HabitatsLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' is {lstHabitat}\n")
                            # If verbose logging is enabled, print the found habitat data to the console
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H/%M/%S', time.localtime())}: {TerminalColors.Green}Habitats of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {lstHabitat}!{TerminalColors.End}")
                        else:
                            # Handle the case where no habitat data is found
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Habitats of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                            # If logging is enabled, write the not-found message to the log file
                            if _log == True:
                                with open('HabitatsLog.txt', 'a+') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {data['habitat']} not found for {_specieName} in IUCN Red List!\n")
                            # Append a placeholder to indicate no habitat data was found
                            lstHabitat.append(str('-'))
                # If no habitat data was found, handle the not-found case
                else:
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Habitats of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} not found in IUCN Red List!{TerminalColors.End}")
                    # If logging is enabled, write the not-found message to the log file
                    if _log == True:
                        with open('HabitatsLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Habitats of '{_specieName}' not found in IUCN Red List!\n")
                    # Append a placeholder to indicate no habitat data was found
                    lstHabitat.append(str('-'))
            # If the response status indicates an error, handle the error accordingly
            else:
                # Print and log the error if verbose and logging are enabled
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages[response.status]}{TerminalColors.End}")
                # If logging is enabled, write the error to the log file
                if _log == True:
                    with open('HabitatsLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                # Append a placeholder to indicate an error occurred
                _habitats.append(str('-'))
    # Append the collected habitat data to the result list and return it
    _habitats.append('\n'.join(lstHabitat))
    return _habitats

async def IUCNHabitats(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Habitats of {len(_spList)} species from IUCN Red List...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Habitats of {len(_spList)} species from IUCN Red List found successfully!{TerminalColors.End}")
    return dictHabitats

# Function to get the taxonomy details of a species from GBIF (Global Biodiversity Information Facility)
async def GBIF(**kwargs):
    # Retrieve keyword arguments with defaults
    _spName     = kwargs.get('spName', 'Rhinella marina')  # Default species name
    _time       = kwargs.get('time', 1)  # Time delay before the request
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log        = kwargs.get('log', True)  # Logging flag for writing results to a file
    # Initialize a dictionary to store the species data with default placeholder values
    dataList = {
        'Key': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': _spName.split(' ')[0],  # Extract the genus from the species name
        'Specie': _spName,
        'Basionym': '-',
        'Scientific Name': '-',
        'Vernacular Name': '-',
        'Authorship': '-',
        'Taxonomic Status': '-',
    }
    # Dictionary for handling common HTTP error codes and messages
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
    # Pause execution if a time delay is specified
    if _time > 0:
        await asyncio.sleep(_time)
    # Print a message indicating the start of the request if verbose logging is enabled
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Warning} from GBIF...{TerminalColors.End}")
    # Asynchronously send the request to the GBIF API
    async with aiohttp.ClientSession() as session:
        url = f'https://api.gbif.org/v1/species?name={_spName}'  # GBIF API endpoint for species lookup
        async with session.get(url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                Taxdata = await response.json()  # Parse the JSON response
                # Check if there are results in the response
                if len(Taxdata['results']) > 0:
                    for data in Taxdata['results']:
                        TaxID = data.get('taxonID', "-")
                        # If the species has an accepted taxonomic status and a valid GBIF ID
                        if data['taxonomicStatus'] == "ACCEPTED" and TaxID != "-" and TaxID.count('gbif:') >= 1:
                            if _verbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Green} in GBIF!{TerminalColors.End}")
                            # Populate the dataList with the species information
                            dataList['Key']                 = data.get('key', '-')
                            dataList['Kingdom']             = data.get('kingdom', '-')
                            dataList['Phylum']              = data.get('phylum', '-')
                            dataList['Class']               = data.get('class', '-')
                            dataList['Order']               = data.get('order', '-')
                            dataList['Family']              = data.get('family', '-')
                            dataList['Genus']               = data.get('genus', '-')
                            dataList['Specie']              = data.get('species', '-')
                            dataList['Basionym']            = data.get('basionym', '-')
                            dataList['Scientific Name']     = data.get('scientificName', '-')
                            dataList['Vernacular Name']     = data.get('vernacularName', '-')
                            dataList['Authorship']          = data.get('authorship', '-')
                            dataList['Taxonomic Status']    = data.get('taxonomicStatus', '-')
                            # If logging is enabled, write the results to the log file
                    if _log == True:
                        with open('GBIFLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Taxonomy of '{_spName}' is {dataList}\n")
                else:
                    # If no results are found, print a message and log it if verbose/logging is enabled
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}No results found for {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Fail} in GBIF!{TerminalColors.End}")
                    if _log == True:
                        with open('GBIFLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: No results found for '{_spName}' in GBIF!\n")
            else:
                # If the response status is an error, print and log the error message
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {ErrorMessages.get(response.status, 'Unknown Error')}{TerminalColors.End}")
                if _log == True:
                    with open('GBIFLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {ErrorMessages.get(response.status, 'Unknown Error')}\n")
    # Return the final dataList with species information
    return dataList


async def getGBIF(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {len(_spList)} species from GBIF...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {len(_spList)} species from GBIF found successfully!{TerminalColors.End}")
    return dictTaxonomy

# Function to get the taxonomy details of a species from WoRMS (World Register of Marine Species)
async def WoRMS(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName     = kwargs.get('spName', 'Rhinella marina')  # Default species name
    _time           = kwargs.get('time', 1)  # Time delay before the request
    _verbose        = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _log            = kwargs.get('log', True)  # Logging flag for writing results to a file
    # Initialize a dictionary to store the species data with default placeholder values
    dataList = {
        'AphiaID': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': _specieName.split(' ')[0],  # Extract the genus from the species name
        'Species': _specieName,
        'Species Status': '-',
        'Link': '-',
        'Authority': '-',
    }
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Taxonomy of '{_specieName}' not found in WoRMS!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # List to store the result for WoRMS (starting with the species name)
    _WoRMS = [_specieName]
    # Pause execution if a time delay is specified
    if _time > 0:
        await asyncio.sleep(_time)
    # Print a message indicating the start of the request if verbose logging is enabled
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Warning} from WoRMS...{TerminalColors.End}")
    # WoRMS API endpoint for species lookup by name
    _url = f"https://www.marinespecies.org/rest/AphiaRecordsByName/{_specieName}"
    # Asynchronously send the request to the WoRMS API
    async with aiohttp.ClientSession() as session:
        async with session.get(_url) as response:
            # If the response status is 200 (OK), process the data
            if response.status == 200:
                _data = await response.json()  # Parse the JSON response
                if len(_data) > 0:
                    d = _data[0]  # Get the first result from the response
                    # Populate the dataList with the species information
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
                    # Print the found data if verbose mode is enabled
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} is {dataList}!{TerminalColors.End}")
                    # If logging is enabled, write the results to the log file
                    if _log == True:
                        with open('WoRMSLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' is {dataList}\n")
                else:
                    # Handle the case where no results are found
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}No results found for {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Fail} in WoRMS!{TerminalColors.End}")
                    # If logging is enabled, write the not-found message to the log file
                    if _log == True:
                        with open('WoRMSLog.txt', 'a+') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: No results found for '{_specieName}' in WoRMS!\n")
            else:
                # Handle errors if the response status indicates a failure
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error {response.status} - {errorMessages.get(response.status, 'Unknown Error')}{TerminalColors.End}")
                # If logging is enabled, write the error message to the log file
                if _log == True:
                    with open('WoRMSLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages.get(response.status, 'Unknown Error')}\n")
    # Append the dataList to the result list and return it
    _WoRMS.append(';'.join(dataList.values()))
    # Print the final dataList for inspection
    if _verbose:
        print(dataList)
    
    return _WoRMS

async def getWoRMS(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)

    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {len(_spList)} species from WoRMS...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {len(_spList)} species from WoRMS found successfully!{TerminalColors.End}")
    return dictTaxonomy

# Function to get the taxonomy details of a species from Bold Systems using a taxonomic ID (taxid)
async def BoldSystemData(**kwargs):
    # Retrieve keyword arguments with defaults
    _taxid          = kwargs.get('taxid', 0)  # Default taxonomic ID (0 if not provided)
    _verbose        = kwargs.get('verbose', True)  # Verbose flag for logging messages
    # Initialize a dictionary to store the species taxonomy data with default placeholder values
    dataList = {
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': '-',
        'Species': '-', 
    }
    # Dictionary for handling common HTTP error codes and messages
    errorMessages = {
        404: f"Taxonomy of '{_taxid}' not found in BoldSystem!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    # URL for the BOLD Systems API, using the provided taxonomic ID
    _taxurl = f"http://v3.boldsystems.org/index.php/API_Tax/TaxonData?taxId={_taxid}&dataTypes=basic&includeTree=true"
    # Asynchronously send the request to the BOLD Systems API
    async with aiohttp.ClientSession() as session:
        async with session.get(_taxurl) as _taxresponse:
            # If the response status is 200 (OK), process the data
            if _taxresponse.status == 200:
                _taxdata = await _taxresponse.json(content_type=None)  # Parse the JSON response
                keydata = list(_taxdata.keys())
                # Iterate through the keys to extract taxonomy information
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
                # Return the populated dataList with taxonomy data
                return dataList
            else:
                # Handle non-200 responses by printing an error message
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}{errorMessages[_taxresponse.status]}{TerminalColors.End}")
                return None  # Return None in case of an error

# Function to search for the taxonomy of a species by name using the BOLD Systems API
async def BoldSystem(**kwargs):
    # Retrieve keyword arguments with defaults
    _specieName     = kwargs.get('spName', 'Rhinella marina')  # Default species name
    _time           = kwargs.get('time', 1)  # Time delay before the request
    _verbose        = kwargs.get('verbose', True)  # Verbose flag for logging messages
    # Error messages for handling common HTTP response codes
    errorMessages = {
        404: f"Taxonomy of '{_specieName}' not found in BoldSystem!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized!",
        403: "Forbidden!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    _BoldSystems = [_specieName]  # Initialize list to store species data
    # Simulate a delay if specified
    if _time > 0:
        await asyncio.sleep(_time)
    # Print a log message before sending the request, if verbose logging is enabled
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Getting Taxonomy of {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} from Bold Systems...{TerminalColors.End}")
    # Construct the URL for the BOLD Systems API request based on the species name
    _url = f"http://v3.boldsystems.org/index.php/API_Tax/TaxonSearch?taxName={_specieName}"
    # Send the HTTP request to the BOLD Systems API
    async with aiohttp.ClientSession() as session:
        async with session.get(_url) as response:
            # If the response is successful (status 200), process the data
            if response.status == 200:
                _data = await response.json(content_type=None)  # Parse the JSON response
                # Check if data was returned for the species
                if _data and len(_data) > 0:
                    # Extract the taxid from the response
                    taxid = next((v['taxid'] for v in _data.values() if 'taxid' in v), None)
                    # Use the taxid to get detailed taxonomy data
                    _taxdata = await BoldSystemData(taxid=taxid, verbose=_verbose)
                    if _taxdata is not None:
                        _BoldSystems.append(';'.join(_taxdata.values()))  # Append formatted taxonomy data
                        # If logging is enabled, write the results to the log file
                        if kwargs.get('log', True):
                            with open('BoldSystemLog.txt', 'a+') as f:
                                f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Taxonomy of '{_specieName}' is {_taxdata}\n")
                        return _BoldSystems  # Return the list with species data
                    else:
                        # No detailed data found
                        if _verbose:
                            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}No data found for {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in Bold Systems.{TerminalColors.End}")
                        return _BoldSystems  # Return with only the species name
                
                else:
                    # No data found for the species
                    if _verbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}No data found for {TerminalColors.Italic}'{_specieName}'{TerminalColors.End}{TerminalColors.Green} in Bold Systems.{TerminalColors.End}")
                    return _BoldSystems  # Return early
            else:
                # Handle non-200 responses
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}{errorMessages[response.status]}{TerminalColors.End}")
                # Log the error to a file if logging is enabled
                if kwargs.get('log', True):
                    with open('BoldSystemLog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error {response.status} - {errorMessages[response.status]}\n")
                return _BoldSystems  # Return with only the species name

async def getBoldSystem(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {len(_spList)} species from Bold Systems...{TerminalColors.End}")
    _tskTaxonomy = [
        BoldSystem(
            spName=sp, 
            time=_time, 
            verbose=_verbose, 
            log=_log
            ) for sp in _spList]
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    try:
        dictTaxonomy = {taxonomy[0]: taxonomy[1] for taxonomy in dataTaxonomy}
    except IndexError:
        dictTaxonomy = {taxonomy[0]: "No data found for this species in Bold Systems." for taxonomy in dataTaxonomy}
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {len(_spList)} species from Bold Systems found successfully!{TerminalColors.End}")
    return dictTaxonomy

# Function to get the taxonomy details of a species from NCBI (National Center for Biotechnology Information)
async def NCBI(**kwargs):
    # Retrieve keyword arguments with defaults
    _spName         = kwargs.get('spName', "Rhinella marina")  # Default species name
    _email          = kwargs.get('email', "lprabelo@dataFishing.com")  # Default email for NCBI Entrez
    _verbose        = kwargs.get('verbose', False)  # Verbose flag for logging messages
    _time           = kwargs.get('time', 1)  # Time delay before making the request
    _log            = kwargs.get('log', True)  # Logging flag for writing results to a file
    # Initialize a dictionary to store the species taxonomy data with default placeholder values
    dataList = {
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': _spName.split(' ')[0],  # Extract the genus from the species name
        'Specie': _spName, 
    }
    # Configure NCBI Entrez email and API key
    Entrez.email                = _email  # Set email for NCBI Entrez API requests
    Entrez.api_key              = "0267bf80ae707dd2c95cd0f3285f9ca87509"  # NCBI API key
    Entrez.sleep_between_tries  = 25  # Sleep time between retries
    Entrez.max_tries            = 5  # Maximum number of retries in case of failure
    semaphore = asyncio.Semaphore(5)  # Semaphore to limit concurrent tasks
    # Print a message before making the request, if verbose logging is enabled
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Warning} from NCBI...{TerminalColors.End}")
    # Use the semaphore to control the number of concurrent tasks
    async with semaphore:
        # If a time delay is specified, wait for the specified time
        if _time > 0:
            await asyncio.sleep(_time)
        # Search for the species in NCBI taxonomy database
        handle = Entrez.esearch(db="taxonomy", term=_spName, retmax=25, usehistory="y")
        record = Entrez.read(handle)  # Read the search result
        handle.close()  # Close the handle after reading
        # If the search found results
        if record["Count"] > "0":
            if _verbose:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Found {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Green} in NCBI!{TerminalColors.End}")
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Fetching detailed taxonomy data for {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Green} from NCBI...{TerminalColors.End}")
            # Get the taxonomy ID from the search result
            _idTax = record["IdList"][0]
            # Simulate a delay before fetching detailed data
            if _time > 0:
                await asyncio.sleep(20)
            try:
                # Fetch the taxonomy data using the taxonomy ID
                handle = await asyncio.to_thread(Entrez.efetch, db="taxonomy", id=_idTax, retmode="xml")
                records = Entrez.read(handle)
                handle.close()
                _Tax = records[0]
                _Taxonomy = _Tax["LineageEx"]  # Extract the lineage information
                # Iterate through the taxonomy lineage and populate the dataList
                for i in _Taxonomy:
                    if str(i['Rank']).capitalize() in dataList:
                        dataList[str(i['Rank']).capitalize()] = i['ScientificName']
                # If logging is enabled, write the results to the log file
                if _log == True:
                    with open('NCBILog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Taxonomy of '{_spName}' is {dataList}\n")
            except Exception as e:
                # Handle exceptions and print error messages if verbose logging is enabled
                if _verbose:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error in NCBI for {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Fail}: {e}{TerminalColors.End}")
                # If logging is enabled, write the error to the log file
                if _log == True:
                    with open('NCBILog.txt', 'a+') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: Error in NCBI for '{_spName}'\n")
        else:
            # If no data was found, print and log a message
            if _verbose:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}No data found for {TerminalColors.Italic}'{_spName}'{TerminalColors.End}{TerminalColors.Fail} in NCBI!{TerminalColors.End}")
            # Log the no-data-found message if logging is enabled
            if _log == True:
                with open('NCBILog.txt', 'a+') as f:
                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: No data found for '{_spName}' in NCBI\n")
        # Return the dataList with the taxonomy information
        return dataList

async def getNCBI(**kwargs):
    _spList     = kwargs.get('speciesList', [])
    _verbose    = kwargs.get('verbose', True)
    _log        = kwargs.get('log', True)
    _time       = kwargs.get('time', 0.25)
    _email      = kwargs.get('email', "lprabelo@dataFishing.com")
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Taxonomy of {len(_spList)} species from NCBI...{TerminalColors.End}")
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
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Taxonomy of {len(_spList)} species from NCBI found successfully!{TerminalColors.End}")
    return dictTaxonomy

# Function to format and write DataFrames to an Excel file using different configurations based on the data source
def dataFishingExcel(**kwargs):
    # Retrieve keyword arguments with defaults
    _df         = kwargs.get('df', None)  # DataFrame to be written to Excel
    _sheet      = kwargs.get('sheet', 'dataFishing')  # Sheet name (default is 'dataFishing')
    _folderName = kwargs.get('folderName', 'dataFishing')  # Folder name to save the file
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    # If the sheet is related to IUCN data, format the DataFrame accordingly
    if _sheet == 'IUCN':
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        # Split the 'Taxonomy' column into separate taxonomy levels
        _Taxonomy = _df['Taxonomy'].astype(str).str.split(';', expand=True)
        _df['Kingdom'] = _Taxonomy[0]
        _df['Phylum']  = _Taxonomy[1]
        _df['Class']   = _Taxonomy[2]
        _df['Order']   = _Taxonomy[3]
        _df['Family']  = _Taxonomy[4]
        _df['Genus']   = _Taxonomy[5]
        _df['Species'] = _Taxonomy[6]
        # Drop the original 'Taxonomy' column
        _df.drop(columns=['Taxonomy'], inplace=True)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        # Reorder columns and sort the DataFrame
        _df = _df[['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Synonyms Names', 'Common Names', 'Habitats', 'Status Conservation']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
    # Write the formatted DataFrame to an Excel, TSV and CSV file
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to CSV File dataFishing_{_sheet}_Results.csv...{TerminalColors.End}")
    _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.csv", index=False)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to TSV File dataFishing_{_sheet}_Results.tsv...{TerminalColors.End}")
    _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.tsv", sep='\t', index=False)
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
    with pd.ExcelWriter(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
        # Write the DataFrame to the Excel file
        _df.to_excel(writer, sheet_name=_sheet, index=False)
        _workbook  = writer.book  # Get the workbook object
        # Define cell formats for the Excel file
        dataFormat  = _workbook.add_format({
            'text_wrap':True, 
            'align':'left', 
            'valign':'vcenter'
        })
        italicFormat = _workbook.add_format({
            'italic': True,
            'text_wrap':True, 
            'align':'left', 
            'valign':'vcenter'
        })
        # Set the worksheet and apply conditional formatting
        worksheet = writer.sheets[_sheet]
        for cod, (status, color) in StatusIUCN.items():
            _fmt = colorStatus(_workbook, color)
            worksheet.conditional_format('A2:Z1000', {
                'type': 'cell',
                'criteria': 'equal to',
                'value': f'="{status}"',
                'format': _fmt
            })
        # Set the column width and apply the formatting
        worksheet.set_column('A:Z', 20, dataFormat)
        worksheet.set_column('F:H', 20, italicFormat)
        # Set workbook properties
        _workbook.set_properties({
            'title': 'dataFishing',
            'subject': 'Developed by Luan Rabelo',
            'author': 'Luan Rabelo',
            'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'
        })
    # Similar formatting and Excel writing logic for the 'GBIF' sheet
    if _sheet == 'GBIF':
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        # Extract and reformat the taxonomy data from the dictionary format
        _Taxonomy = dict(_df['Taxonomy'])
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
        # Convert the extracted data into a DataFrame
        _df = pd.DataFrame(dataExtracted)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        # Reorder columns and sort the DataFrame
        _df = _df[['Key', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Basionym', 'Scientific Name', 'Vernacular Name', 'Authorship', 'Taxonomic Status']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
        # Write the formatted data to an Excel, CSV and TSV file
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to CSV File dataFishing_{_sheet}_Results.csv...{TerminalColors.End}")
        _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.csv", index=False)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to TSV File dataFishing_{_sheet}_Results.tsv...{TerminalColors.End}")
        _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.tsv", sep='\t', index=False)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
        with pd.ExcelWriter(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
            _df.to_excel(writer, sheet_name=_sheet, index=False)
            _workbook = writer.book
            # Define formats for the Excel sheet
            dataFormat = _workbook.add_format({
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter'
            })
            italicFormat = _workbook.add_format({
                'italic': True,
                'text_wrap':True, 
                'align':'left', 
                'valign':'vcenter'
            })
            # Set formatting for columns
            worksheet = writer.sheets[_sheet]
            worksheet.set_column('A:Z', 20, dataFormat)
            worksheet.set_column('G:J', 20, italicFormat)
            # Set workbook properties
            _workbook.set_properties({
                'title': 'dataFishing',
                'subject': 'Developed by Luan Rabelo',
                'author': 'Luan Rabelo',
                'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'
            })
        # If the sheet is related to WoRMS data, format the DataFrame accordingly
    if _sheet == 'WoRMS':
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        # Split the 'Taxonomy' column into separate taxonomy levels for WoRMS
        _Taxonomy = _df['Taxonomy'].astype(str).str.split(';', expand=True)
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
        # Drop the original 'Taxonomy' column
        _df.drop(columns=['Taxonomy'], inplace=True)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        # Reorder and sort the DataFrame
        _df = _df[['AphiaID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species', 'Species Status', 'Link', 'Authority']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
        # Write the formatted data to an Excel, CSV and TSV file
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to CSV File dataFishing_{_sheet}_Results.csv...{TerminalColors.End}")
        _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.csv", index=False)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to TSV File dataFishing_{_sheet}_Results.tsv...{TerminalColors.End}")
        _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.tsv", sep='\t', index=False)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
        with pd.ExcelWriter(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
            _df.to_excel(writer, sheet_name=_sheet, index=False)
            _workbook = writer.book
            # Define formats for the Excel file
            dataFormat = _workbook.add_format({
                'text_wrap': True,
                'align': 'left',
                'valign': 'vcenter'
            })
            italicFormat = _workbook.add_format({
                'italic': True,
                'text_wrap': True,
                'align': 'left',
                'valign': 'vcenter'
            })
            _accepted = _workbook.add_format({'bg_color': '#BACD92', 'font_color': '#000000', 'bold': True})
            _unaccepted = _workbook.add_format({'bg_color': '#FA7070', 'font_color': '#000000', 'bold': True})
            # Apply conditional formatting for species status
            worksheet = writer.sheets[_sheet]
            worksheet.conditional_format('A2:Z1000', {'type': 'cell', 'criteria': 'equal to', 'value': '"accepted"', 'format': _accepted})
            worksheet.conditional_format('A2:Z1000', {'type': 'cell', 'criteria': 'equal to', 'value': '"unaccepted"', 'format': _unaccepted})
            worksheet.set_column('A:Z', 20, dataFormat)
            worksheet.set_column('G:H', 20, italicFormat)
            # Set workbook properties
            _workbook.set_properties({
                'title': 'dataFishing',
                'subject': 'Developed by Luan Rabelo',
                'author': 'Luan Rabelo',
                'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'
            })
    # If the sheet is related to BoldSystem or NCBI data, format the DataFrame accordingly
    if _sheet == 'BoldSystem' or _sheet == 'NCBI':
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Formatting Data {_sheet}, please wait...{TerminalColors.End}")
        # Split the 'Taxonomy' column into separate taxonomy levels
        _Taxonomy       = _df['Taxonomy'].astype(str).str.split(';', expand=True)
        try:
            _df['Kingdom'] = _Taxonomy[0]
        except:
            _df['Kingdom'] = '-'  # Handle missing data
        try:
            _df['Phylum']  = _Taxonomy[1]
        except:
            _df['Phylum'] = '-'
        try:
            _df['Class']   = _Taxonomy[2]
        except:
            _df['Class'] = '-'
        try:
            _df['Order']   = _Taxonomy[3]
        except:
            _df['Order'] = '-'
        try:
            _df['Family']  = _Taxonomy[4]
        except:
            _df['Family'] = '-'
        try:
            _df['Genus']   = _Taxonomy[5]
        except:
            _df['Genus'] = '-'
        try:
            _df['Species'] = _Taxonomy[6]
        except:
            _df['Species'] = '-'
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Data {_sheet} formatted successfully!{TerminalColors.End}")
        # Reorder and sort the DataFrame
        _df = _df[['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species']]
        _df = _df.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'])
        
        # Write the formatted data to an Excel, CSV and TSV file
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to CSV File dataFishing_{_sheet}_Results.csv...{TerminalColors.End}")
        _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.csv", index=False)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to TSV File dataFishing_{_sheet}_Results.tsv...{TerminalColors.End}")
        _df.to_csv(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.tsv", sep='\t', index=False)
        if _verbose:
            print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Writing Data {_sheet} to Excel File dataFishing_{_sheet}_Results.xlsx...{TerminalColors.End}")
        with pd.ExcelWriter(f"dataFishing/{_folderName}/dataFishing_{_sheet}_Results.xlsx", engine='xlsxwriter') as writer:
            _df.to_excel(writer, sheet_name=_sheet, index=False)
            _workbook = writer.book
            # Define formats for the Excel file
            dataFormat = _workbook.add_format({
                'text_wrap': True,
                'align': 'left',
                'valign': 'vcenter'
            })
            italicFormat = _workbook.add_format({
                'italic': True,
                'text_wrap': True,
                'align': 'left',
                'valign': 'vcenter'
            })
            # Apply formatting to the worksheet
            worksheet = writer.sheets[_sheet]
            worksheet.set_column('A:Z', 20, dataFormat)
            worksheet.set_column('F:H', 20, italicFormat)
            # Set workbook properties
            _workbook.set_properties({
                'title': 'dataFishing',
                'subject': 'Developed by Luan Rabelo',
                'author': 'Luan Rabelo',
                'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'
            })

# Function to gather gene data from NCBI for a list of species
async def getNCBIGenes(**kwargs):
    # Retrieve keyword arguments with defaults
    _spList     = kwargs.get('speciesList', [])  # List of species to search for
    _verbose    = kwargs.get('verbose', True)  # Verbose flag for logging messages
    _email      = kwargs.get('email', "lprabelo@dataFishing.com")  # Email address for NCBI Entrez
    _geneName   = kwargs.get('geneName', 'COI')  # Gene name to search for (default is 'COI')
    # Log the beginning of the gene search process
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Warning}Getting Genes of {len(_spList)} species from NCBI...{TerminalColors.End}")
    # Semaphore to control concurrent tasks (limit to 10 tasks at a time)
    Semaphore       = asyncio.Semaphore(5)
    _tskTaxonomy    = []  # List to store all the asynchronous tasks
    # Loop through each species in the species list and create an async task for NCBIGenes function
    for sp in _spList:
        task = asyncio.create_task(NCBIGenes(
            spNames=sp, email=_email, semaphore=Semaphore, verbose=_verbose, geneName=_geneName)
        )
        _tskTaxonomy.append(task)  # Add the task to the task list
        # Introduce a slight delay every 10 tasks to prevent overwhelming the system
        if len(_tskTaxonomy) % 10 == 0:
            await asyncio.sleep(2)
    # Gather the results of all the tasks (run them concurrently)
    dataTaxonomy = await asyncio.gather(*_tskTaxonomy)
    # Log completion of the gene search process
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Genes of {len(_spList)} species from NCBI found successfully!{TerminalColors.End}")
    # Return the results of all the tasks
    return dataTaxonomy

# Function to search for a specific gene in NCBI for a given species
async def NCBIGenes(**kwargs):
    # Retrieve keyword arguments with defaults
    _spNames        = kwargs.get('spNames', [])  # Species name to search for
    _email          = kwargs.get('email', "lprabelo@dataFishing.com")  # Email for NCBI Entrez
    _verbose        = kwargs.get('verbose', False)  # Verbose flag for logging messages
    _time           = kwargs.get('time', 1)  # Time delay before making the request
    _Semaphore      = kwargs.get('semaphore', None)  # Semaphore for controlling concurrency
    _geneName       = kwargs.get('geneName', 'COI')  # Gene name to search for
    # Set up NCBI Entrez API configurations
    Entrez.email                = _email  # Set the email for NCBI Entrez API requests
    Entrez.api_key              = "0267bf80ae707dd2c95cd0f3285f9ca87509"  # NCBI API key
    Entrez.sleep_between_tries  = 25  # Set delay between retries for API requests
    Entrez.max_tries            = 5  # Maximum number of retries in case of failure
    # List of mitochondrial and chloroplast genes for gene validation
    _listGenes_mt = ["12S", "16S", "ATP6", "ATP8", "COI", "COII", "COIII", "CYTB", "ND1", "ND2", "ND3", "ND4", "ND4L", "ND5", "ND6", "Control Region"]
    _listGenes_cp = ['accD', 'atpA', 'atpB', 'atpE', 'atpF', 'atpH', 'atpI', 'ccsA', 'cemA', 'chlB', 'chlL', 'chlN', 'clpP', 'clpP1', 'cysA', 'cysT', 'ftsH', 'infA', 'lhbA', 'matK', 'matk', 'ndhA', 'ndhB', 'ndhC', 'ndhD', 'ndhE', 'ndhF', 'ndhG', 'ndhH', 'ndhI', 'ndhJ', 'ndhK', 'pafI', 'pafII', 'pbf1', 'petA', 'petB', 'petD', 'petE', 'petG', 'petL', 'petN', 'psaA', 'psaB', 'psaC', 'psaI', 'psaJ', 'psaM', 'psb30', 'psbA', 'psbB', 'psbC', 'psbD', 'psbE', 'psbF', 'psbG', 'psbH', 'psbI', 'psbJ', 'psbK', 'psbL', 'psbM', 'psbN', 'psbT', 'psbZ', 'rbcL', 'rpl14', 'rpl16', 'rpl2', 'rpl20', 'rpl21', 'rpl22', 'rpl23', 'rpl32', 'rpl33', 'rpl36', 'rpoA', 'rpoB', 'rpoC1', 'rpoC2', 'rps11', 'rps12', 'rps14', 'rps15', 'rps16', 'rps18', 'rps19', 'rps2', 'rps3', 'rps4', 'rps7', 'rps8', 'rrn16S', 'rrn23S', 'rrn4.5S', 'rrn5S']
    # Validate the gene name against the mitochondrial and chloroplast gene lists
    sg = SynGenes(verbose=_verbose)  # Gene synonym handling utility
    if _geneName in _listGenes_mt:
        _type = 'mt'  # Mitochondrial gene type
    elif _geneName in _listGenes_cp:
        _type = 'cp'  # Chloroplast gene type
    else:
        # If the gene is not found in the list, print an error message
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Gene '{_geneName}' not found in the list of genes! Consult the list of genes in the documentation!{TerminalColors.End}")
    # Log the beginning of the gene search process for a specific species
    if _verbose:
        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}Searching for gene '{_geneName}' in {TerminalColors.Italic}'{_spNames}'{TerminalColors.End}{TerminalColors.Green} from NCBI...{TerminalColors.Green}{TerminalColors.End}")
    # Simulate a delay before making the request, if specified
    if _time > 0:
        await asyncio.sleep(_time)
    # Build the NCBI query to search for the gene in the species
    _query      = ""
    _query      += f'("{_spNames}"[Organism] OR "{_spNames}"[Title]) AND'
    _querysg    = sg.buildQuery(geneName=_geneName, type=_type, searchType='All Fields')  # Build the gene synonym query
    _fquery     = f"{_query} AND ({_querysg}) AND mitochondrion[filter]"  # Full query string
    # Use the semaphore to limit concurrent access to the API
    async with _Semaphore:
        # Search for the gene in the nucleotide database using the built query
        Search = Entrez.esearch(db="nucleotide", term=_fquery, retmax=100000000)
        SearchResult = Entrez.read(Search)  # Read the search results
        Search.close()  # Close the search handle
        return SearchResult['IdList']  # Return the list of gene IDs found
    

def timeFunctions(**kwargs):
    f = open("timeFunctionsGenomes.txt", "a+")
    function    = kwargs.get('function', None)
    _start      = kwargs.get('start', None)
    _end        = kwargs.get('end', None)
    f.write(f"{function}\t{_start}\t{_end}\n")
    f.close()

if __name__ == '__main__':
    _version    = f"Version: {__version__}"
    _status     = f"Status: {__status__}"
    _license    = f"License: {__license__}"
    _author     = f"Author: {__author__}"
    _github     = f"GitHub Page: https://github.com/{__github__}"
    
    parser = argparse.ArgumentParser(
        description     = "dataFishing: An Efficient Python Tool and User-Friendly Web-Form for Mining Genomic, Taxonomic, and Biodiversity Data\n\nCreated by Luan Rabelo",
        formatter_class = argparse.RawTextHelpFormatter,
        epilog          = f"Example: python dataFishing.py --input Examples/Carangidae.txt --all True --email your@email.com --download True --genesList Examples/genesList.txt --verbose True --log True",
        add_help        = True,
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
                        '''This argument specifies whether to retrieve data from the National Center for Biotechnology Information (NCBI GenBank).''',
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
    parser.add_argument('-e', '--email', help="Please include a previously registered email with NCBI using this link: https://account.ncbi.nlm.nih.gov/signup/",
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
    _all            = args.all
    _iucn           = args.iucn
    _gbif           = args.gbif
    _worms          = args.worms
    _bold           = args.bold
    _ncbi           = args.ncbi
    _genesList      = args.genesList
    _download       = args.download
    _inputVerbose   = args.verbose
    _inputLog       = args.log
    _timeSleep      = 10

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

    createFolder(folderName=f"dataFishing/{_folderName}", verbose=_inputVerbose)
    _spList = readInputFile(input=_inputFile, folder=_folderName, verbose=_inputVerbose)

    if _iucn == True or _all == True:
        dfIUCN              = pd.DataFrame()
        dfIUCN['Species']   = _spList
        resultsStatus                   = asyncio.run(IUCNStatusConservation(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Status Conservation']   = dfIUCN['Species'].map(resultsStatus)
        resultsSynonyms                 = asyncio.run(IUCNSynonymsNames(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Synonyms Names']        = dfIUCN['Species'].map(resultsSynonyms)
        resultsTaxonomy                 = asyncio.run(IUCNTaxonomy(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Taxonomy']              = dfIUCN['Species'].map(resultsTaxonomy)
        resultsCommon                   = asyncio.run(IUCNCommonNames(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Common Names']          = dfIUCN['Species'].map(resultsCommon)
        resultsOccurrence               = asyncio.run(IUCNCountryOccurrence(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Country Occurrence']    = dfIUCN['Species'].map(resultsOccurrence)
        resultsHabitat                  = asyncio.run(IUCNHabitats(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Habitats']              = dfIUCN['Species'].map(resultsHabitat)
        dataFishingExcel(df=dfIUCN, sheet='IUCN', folderName=_folderName, verbose=_inputVerbose)
        dfIUCN.to_csv(f"dataFishing/{_folderName}/dataFishing_IUCN_Results.csv", index=False)
        dfIUCN.to_csv(f"dataFishing/{_folderName}/dataFishing_IUCN_Results.csv", sep='\t', index=False)
    
    if _gbif == True or _all == True:
        dfGBIF              = pd.DataFrame()
        dfGBIF['Species']   = _spList
        resultsGBIF         = asyncio.run(getGBIF(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfGBIF['Taxonomy']  = dfGBIF['Species'].map(dict(resultsGBIF))
        dataFishingExcel(df=dfGBIF, sheet='GBIF', folderName=_folderName, verbose=_inputVerbose)
        dfGBIF.to_csv(f"dataFishing/{_folderName}/dataFishing_GBIF_Results.csv", index=False)
        dfGBIF.to_csv(f"dataFishing/{_folderName}/dataFishing_GBIF_Results.csv", sep='\t', index=False)

    if _worms == True or _all == True:
        dfWORMS             = pd.DataFrame()
        dfWORMS['Species']  = _spList
        resultsWORMS        = asyncio.run(getWoRMS(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfWORMS['Taxonomy'] = dfWORMS['Species'].map(resultsWORMS)
        dataFishingExcel(df=dfWORMS, sheet='WoRMS', folderName=_folderName, verbose=_inputVerbose)

    if _bold == True or _all == True:
        dfBOLD              = pd.DataFrame()
        dfBOLD['Species']   = _spList
        resultsBOLD         = asyncio.run(getBoldSystem(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfBOLD['Taxonomy']  = dfBOLD['Species'].map(dict(resultsBOLD))
        dataFishingExcel(df=dfBOLD, sheet='BoldSystem', folderName=_folderName, verbose=_inputVerbose)
        dfBOLD.to_csv(f"dataFishing/{_folderName}/dataFishing_BoldSystem_Results.csv", index=False)
        dfBOLD.to_csv(f"dataFishing/{_folderName}/dataFishing_BoldSystem_Results.csv", sep='\t', index=False)

        if _download:
            createFolder(folderName=f"dataFishing/{_folderName}/BOLD_Download_Sequences", verbose=_inputVerbose)
            for i in _spList:
                _url        = f'http://v3.boldsystems.org/index.php/API_Public/sequence?taxon={i}'
                _path       = os.path.join(f"dataFishing/{_folderName}/BOLD_Download_Sequences", str(i).replace(' ', '_'))
                _down       = requests.get(_url, stream = True)
                if _down.status_code == 200:
                    with open(f"{_path}.fasta", "a+", encoding='utf-8') as file:
                        file.write(_down.content.decode('utf-8'))
                    if _inputVerbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Green}Downloaded sequences for '{i}' from BOLD successfully!{TerminalColors.End}")
                else:
                    if _inputVerbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Fail}Error downloading sequences for '{i}' from BOLD!{TerminalColors.End}")
    
    if _ncbi == True or _all == True:
        dfNCBI              = pd.DataFrame()
        dfNCBI['Species']   = _spList
        _email              = emailChecker(email=args.email, verbose=_inputVerbose)
        if _email:
            resultsNCBI         = asyncio.run(getNCBI(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep, email=args.email))
            dfNCBI['Taxonomy']  = dfNCBI['Species'].map(dict(resultsNCBI))
            dataFishingExcel(df=dfNCBI, sheet='NCBI', folderName=_folderName, verbose=_inputVerbose)
        else:
            if _inputVerbose:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Email not valid!{TerminalColors.End}")
                sys.exit(1)
        if _download and _email:
            if _genesList:
                try:
                    with open(_genesList, 'r', encoding='utf-8') as file:
                        geneList = [line.strip() for line in file.readlines()]
                except:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error reading Gene List! Please check the file and try again!{TerminalColors.End}")
                    sys.exit(1)
                createFolder(folderName=f"dataFishing/{_folderName}/NCBI_Download_Sequences", verbose=_inputVerbose)
                for gene in geneList:
                    lstSeq = []
                    _sequencesNCBI = asyncio.run(getNCBIGenes(speciesList=_spList, verbose=True, email=args.email, geneName=gene))
                    for i in _sequencesNCBI:
                        for n in i:
                            if n not in lstSeq:
                                lstSeq.append(n)
                    with open(f"{gene}.txt", "a+") as file:
                        file.write(f"{os.path.basename(_inputFile).split('.')[0]},{len(lstSeq)}\n")
                    for index, id in enumerate(lstSeq):
                        _url        = f"https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=gbwithparts&id={id}&withparts=on"
                        _down       = requests.get(_url, stream = True)
                        _pathFile   = os.path.join(f"dataFishing/{_folderName}/NCBI_Download_Sequences", f"{id}.gb")
                        if _down.status_code == 200:
                            with open(_pathFile, "wb") as file:
                                file.write(_down.content)
                            if _inputVerbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Green}Downloaded sequences {index+1} of {len(lstSeq)} from NCBI successfully!{TerminalColors.End}")
                            for record in SeqIO.parse(_pathFile, 'genbank'):
                                try:
                                    _voucher = record.id
                                except:
                                    _voucher = '-'
                                try:
                                    _specie = record.annotations["organism"]
                                except:
                                    _specie = 'Unknown'
                                _specieFolder = re.sub(r'[^A-Za-z]+', '_', _specie)
                                createFolder(folderName=f"dataFishing/{_folderName}/NCBI_Download_Sequences/{_specieFolder}", verbose=False)
                                with open(f"dataFishing/{_folderName}/NCBI_Download_Sequences/{_specieFolder}/{gene}.fasta", "a+", encoding='utf-8') as file:
                                    file.write(f">{_voucher}_{_specie}\n{record.seq}\n")
                            os.remove(_pathFile)
                        else:
                            if _inputVerbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Fail}Error downloading sequences from NCBI!{TerminalColors.End}")
            else:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Gene List not provided!{TerminalColors.End}")
                sys.exit(1)
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}dataFishing process completed successfully!{TerminalColors.End}")
    # Citation
    print(f"{TerminalColors.Bold}How to cite dataFishing:{TerminalColors.End}")
    # Soon