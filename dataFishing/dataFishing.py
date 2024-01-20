__author__      = "Luan Rabelo"
__license__     = "MIT"
__version__     = "0.0.1"
__maintainer__  = "Luan Rabelo"
__email__       = "luanrabelo@outlook.com"
__date__        = "2024/01/20"
__twitter__     = "lprabelo"
__github__      = "luanrabelo/dataFishing"
__status__      = "Stable"

import os
import re
import time
import sys
class TerminalColors:
    Header      = '\033[95m'
    Blue        = '\033[94m'
    Cyan        = '\033[96m'
    Green       = '\033[92m'
    Warning     = '\033[93m'
    Fail        = '\033[91m'
    End         = '\033[0m'
    Bold        = '\033[1m'
    Underline   = '\033[4m'

try:
    import requests
    print(f"{TerminalColors.Green}Module 'Requests' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Module 'Requests' not found, please install it with: pip install requests{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    Choice = str(input())
    if Choice.lower() == 'y' or Choice.lower() == 'yes':
        os.system('pip install requests')
        print(f"{TerminalColors.Green}Module 'Requests' installed successfully!{TerminalColors.End}")
        try:
            import requests
            print(f"{TerminalColors.Green}Module 'Requests' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Module 'Requests' not found, please reinstall it with: pip install requests{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'Requests' aborted!{TerminalColors.End}")

try:
    import pandas as pd
    print(f"{TerminalColors.Green}Module 'Pandas' found and imported!{TerminalColors.End}")
except ImportError:
    print(f"{TerminalColors.Fail}Module 'Pandas' not found, please install it with: pip install pandas{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Underline}Do you want to install it now? (yes/no){TerminalColors.End}")
    Choice = str(input())
    if Choice.lower() == 'y' or Choice.lower() == 'yes':
        os.system('pip install pandas')
        print(f"{TerminalColors.Green}Module 'Pandas' installed successfully!{TerminalColors.End}")
        try:
            import pandas as pd
            print(f"{TerminalColors.Green}Module 'Pandas' found and imported!{TerminalColors.End}")
        except ImportError:
            print(f"{TerminalColors.Fail}Module 'Pandas' not found, please reinstall it with: pip install pandas{TerminalColors.End}")
            sys.exit()
    else:
        print(f"{TerminalColors.Fail}Installation 'Pandas' aborted!{TerminalColors.End}")

class dataFishing:
    def __init__(self, path):
        print("dataFishing init")

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
            createFolder(folderName='Rhinella_marina', verbose=True)
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
            os.makedirs(_folderName, mode=0o777, exist_ok=False)
            if _verbose:
                # Print the status of the function
                print(f"{TerminalColors.Green}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Folder {_folderName} created successfully!{TerminalColors.End}")
        else:
            if _verbose:
                # Print the status of the function
                print(f"{TerminalColors.Warning}{time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}: Folder {_folderName} already exists!{TerminalColors.End}")