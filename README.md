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
      - [Download the ***dataFishing*** script file](#download-the-datafishing-script-file)
      - [Usage](#usage)
      - [Run ***dataFishing***](#run-datafishing)
        - [With **Bold Systems TSV File**](#with-bold-systems-tsv-file)
        - [With a **Text File**](#with-a-text-file)
        - [To execute](#to-execute)
      - [Outputs Files](#outputs-files)
        - [IUCN Example](#iucn-example)
        - [WoRMS Example](#worms-example)
- [dataFishing Development Team](#datafishing-development-team)
- [Contact](#contact)

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
##### [:rocket: Go to Contents Overview](#contents-overview)
- ## Prerequisites
Before you run ***dataFishing***, make sure you have the following prerequisites installed on your system:
- **Python Environment**
    - Python **version 3.10 or higher**
    - conda (optional)
- Dependencies
    - `aiohttp`
    - `requests `
    - `pandas`
    - `biopython`
    - `xlsxwriter`
    - `openpyxl`
    - `SynGenes`
***  
### Installation of dependencies
##### [:rocket: Go to Contents Overview](#contents-overview)
There are two ways to install ***dataFishing*** dependencies:
1. Through pip: Install ***dataFishing*** dependencies directly using pip: 
- 1.1. Open the **Terminal** or **Python Environment**
- 1.2. Execute the Following Code:
```shell
pip install aiohttp requests pandas biopython openpyxl xlsxwriter SynGenes
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
> [!NOTE]
> This command will clone the repository, and then you should navigate to the cloned directory to install ***dataFishing*** and its dependencies using pip.  

***  
## Download the ***dataFishing*** script file
##### [:rocket: Go to Contents Overview](#contents-overview)
You can download the ***dataFishing*** script file using two different methods:
1. By cloning the GitHub repository: Clone the source code of ***dataFishing*** from GitHub:
- 1.1. Open the **Terminal** or **Python Environment**
- 1.2. Execute the Following Code:
```shell
git clone https://github.com/luanrabelo/dataFishing.git
cd dataFishing  
```
2. Obtaining the Latest Release:
  - Visit the Releases page of the dataFishing repository on GitHub.
  - Look for the most recent release (usually tagged with version numbers).
  - Download the script file associated with that release (usually in a .zip or .tar.gz format).

> [!NOTE]
> Choose the method that suits you best, and you’ll have the dataFishing script ready for use!
***  
## Usage
##### [:rocket: Go to Contents Overview](#contents-overview)
```
Usage: dataFishing.py [options]
Options:
  -h, --help                    [Show this help message and exit.]

  --input string {Mandatory}    [a text file with species names listed on separate lines or a BOLD System TSV file.]

  --{databases} True            [Select the database(s) you wish to query. Default is --all True]
                                {--iucn, --ncbi, --bold, --gbif, --worms}

  --email {Mandatory}           [Please include an email address for NCBI to contact in case of any issues.]

  --output                      [The argument specifies the output folder for data storage. Default is dataFishing.]
```
***  
## Run ***dataFishing*** 
##### [:rocket: Go to Contents Overview](#contents-overview)
### With **Bold Systems TSV File**
To execute the ***dataFishing*** tool using data sourced from **Bold Systems**, ensure that you are searching for a specific systematic term related to a particular species, such as **order**, **family**, or **genus** (Figure 1) or see **Example** folder.
<p align="center">
  <img src="docs/assets/bold.gif" alt="dataFishing Logo" width="100%">
</p>

Figure 1. Get TSV data from **Bold Systems**. On the website, click “**Explore the Data**”, and a search field will appear for the user. Thereafter, type the term you want to search, for example: **Bufonidae**. After searching, find the option “**Combined**:” and click the option to get a **TSV file**.

### With a **Text File**
Example
```
Ailuropoda melanoleuca
Ara macao
Balaenoptera musculus
Carcharodon carcharias
Dendrobates tinctorius
Elephas maximus
Eretmochelys imbricata
Gorilla gorilla
Pan paniscus
Panthera tigris
```
> [!NOTE]
> Copy and paste into a new text document. Be sure to save the file with the correct extension. For example, if you're working with text file, save the file with the `.txt` extension.
***
## To execute 
##### [:rocket: Go to Contents Overview](#contents-overview)
- To run the dataFishing script:
  - If you are using a **conda environment**, activate it with the following command:
  ```shell
  conda activate {your_environment_name}
  ```
  > Replace {your_environment_name} with the name of your environment.
  - Navigate to the folder containing the ***dataFishing*** script.

Then, execute the command below.
```shell
luan@lprabelo:~$ dataFishing.py -i Examples/Carangidae.txt --all True --email your@email.com --o dataFishing
```

`dataFishing.py`: The Python script for ***dataFishing*** is available on GitHub:
 github.com/luanrabelo/dataFishing.

`-i Examples/Carangidae.txt`: Input file from the `Examples` folder, sourced from Bold Systems*.

`--{databases} True`: Select the database(s) you wish to query. For instance, use `--worms True` to search only in the WoRMS database, or `--all True` to search across all databases (see Table below). You can also use combinations of databases, such as `--bold True` `--gbif True`, to conduct queries in both the BOLD and GBIF databases simultaneously. Default is `--all True`.
| dataBase | data | Parameters |
| --- | --- | --- | 
| `IUCN` | Common Names; Country Occurrence; Habitats; Status Conservation; Synonyms Names; Taxonomy | `--iucn True` |
| `NCBI GenBank` | Sequences; Taxonomy | `--ncbi True` |
| `Bold Systems` | BINs; Collection Site; Depository; Sample IDs; Sequences; Taxonomy | `--bold True` |
| `GBIF` | Occurrence; Synonyms; Vernacular Names; Verbatim Name; Taxonomy | `--gbif True` |
| `WoRMS` | Taxonomy; Species Status Vernaculars; Authors | `--worms True` |

`--email`: Please include an email address for NCBI to contact in case of any issues*. 

`--output`: The argument specifies the output folder for data storage. Default is `dataFishing`.

> [!NOTE]
> \* Mandatory 
***
### Outputs Files
##### [:rocket: Go to Contents Overview](#contents-overview)
- #### IUCN Example
| Kingdom | Phylum | Class | Order | Family | *Genus* | *Species* | Synonyms Names | Common Names | Status Conservation |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| Animalia | Chordata | Actinopterygii | Perciformes | Carangidae | *Trachurus* | *Trachurus picturatus* | *Trachurus picturatus* (Ayres, 1855)| Blue Scad (eng) | Least Concern |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

- #### WoRMS Example
| AphiaID | Kingdom | Phylum | Class | Order | Family | *Genus* | *Species* | Species Status | Authority | Link |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 401555 | Animalia | Chordata | Teleostei | Carangiformes | Carangidae | *Alectis* | *Alectis alexandrina* | **accepted** | (Geoffroy Saint-Hilaire, 1817) | https://www.marinespecies.org/aphia.php?p=taxdetails&id=401555
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
***
### ***dataFishing*** Development Team
##### [:rocket: Go to Contents Overview](#contents-overview)
- **Luan Rabelo**
- Clayton Sodré
- Oscar Balcázar
- Murilo Furtado
- Aurycéia Guimarães-Costa
- **Iracilda Sampaio**
- **Marcelo Vallinoto**
***  
### Citing ***dataFishing***
##### [:rocket: Go to Contents Overview](#contents-overview)
When referencing the ***dataFishing*** tool, please cite it appropriately in your academic or professional work.
```
Soon...
```
***  
### Contact
##### [:rocket: Go to Contents Overview](#contents-overview)
For reporting bugs, requesting assistance, or providing feedback, please reach out to **Luan Rabelo**:
```
luanrabelo@outlook.com
```
***  