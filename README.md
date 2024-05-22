<p align="center">
  <img src="docs/assets/dataFishing.png" alt="dataFishing Logo" width="50%">
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/lprabelo" target="_blank">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=lprabelo&button_colour=FFFFFF&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=000000" />
  </a>
</p>

# Contents Overview
- [System Overview](#system-overview)
- [License](#license)
  - The Hitchhiker's Guide to ***dataFishing***
    - [Getting Started](#getting-started)
      - [Prerequisites](#prerequisites)
      - [Installation of dependencies](#installation-of-dependencies)
      - [Usage](#usage)


- [dataFishing Development Team](#datafishing-development-team)
- [Citing dataFishing](#citing-datafishing)
***
# System Overview
##### [:rocket: Go to Contents Overview](#contents-overview)
<p align="center">
  <img src="docs/assets/dataFishing.png" alt="dataFishing Logo" width="15%">
</p>

***dataFishing*** is an efficient Python tool and user-friendly web-form for mining genomic and biodiversity data. It is designed to facilitate and automate access to information from various databases, including **NCBI GenBank**, **Bold Systems**, **GBIF**, **WoRMS**, and **IUCN**. ***dataFishing*** is faster and more efficient than other tools for obtaining taxonomic information from the databases consulted. It also allows the retrieval of **DNA sequences**, **common names**, **synonyms**, **conservation status**, and **occurrence points** of species. The ***dataFishing*** repository, hosted on **GitHub** and **licensed under MIT**, is a **freely accessible** resource for the **scientific community**.
***  
# Licence
***dataFishing*** is released under the **MIT License**. This license permits reuse within proprietary software provided that all copies of the licensed software include a copy of the MIT License terms and the copyright notice.

For more details, please see the MIT License.
***
# The Hitchhiker's Guide to ***dataFishing***
## Getting Started
- ## Prerequisites
Before you run ***dataFishing***, make sure you have the following prerequisites installed on your system:
- **Python Environment**
    - Python **version 3.10 or higher**
    - conda (optional)
- Dependencies
    - `aiohttp`
    - `pandas`
    - `biopython`  
    - `SynGenes`
***  
### Installation of dependencies
There are two ways to install ***dataFishing*** dependencies:
1. Through pip: Install ***dataFishing*** dependencies directly using pip: 
- 1.1. Open the **Terminal** or **Python Environment**
- 1.2. Execute the Following Code:
```shell
pip install aiohttp pandas biopython SynGenes
```
>This command will install the necessary packages specified in the command. If any required packages are missing, the script will handle their installation.
2. By cloning the GitHub repository: Clone the source code of ***dataFishing*** from GitHub:
- 2.1. Open the **Terminal** or **Python Environment**
- 2.2. Execute the Following Code:
```shell
git clone https://github.com/luanrabelo/dataFishing.git
cd dataFishing  
pip install -r requirements.txt
```
>This command will clone the repository, and then you should navigate to the cloned directory to install ***dataFishing*** and its dependencies using pip.  

***  
## Usage
##### [:rocket: Go to Contents Overview](#contents-overview)
```
Usage: dataFishing.py [options]
Options:
  -h, --help          [Show this help message and exit.]
```
***  
