<p align="center">
  <img src="docs/assets/dataFishing.png" alt="dataFishing Logo" width="50%">
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/lprabelo" target="_blank">
    <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=lprabelo&button_colour=959595&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=000000" />
  </a>
</p>

[![Published in%20](https://img.shields.io/badge/Published_in-Ecological%20Informatics-black?style=for-the-badge)](https://doi.org/10.1016/j.ecoinf.2024.102970)

# Contents Overview
- [System Overview](#system-overview)
- [How to cite dataFishing](#how-to-cite-datafishing)
- [License](#license)
  - The Hitchhiker's Guide to ***dataFishing***
    - [Change Log](#change-log)
    - [Getting Started](#getting-started)
      - [Prerequisites](#prerequisites)
      - [Installation](#installation)
      - [API Keys Configuration](#api-keys-configuration)
      - [Usage](#usage)
      - [Command Line Arguments](#command-line-arguments)
      - [Examples](#examples)
      - [Outputs Files](#outputs-files)
        - [IUCN Example](#iucn-example)
        - [WoRMS Example](#worms-example)
- [dataFishing Development Team](#datafishing-development-team)
- [Contact](#contact)

***
# System Overview
##### [:rocket: Go to Contents Overview](#contents-overview)
<p align="center">
  <img src="docs/assets/dataFishing.png" alt="dataFishing Logo" width="15%">
</p>

***dataFishing*** is an efficient Python tool and user-friendly web-form for mining Mitochondrial/Chloroplast Sequences and biodiversity data. It is designed to facilitate and automate access to information from various databases, including **NCBI GenBank**, **Bold Systems**, **GBIF**, **WoRMS**, **IUCN Red List**, and **Eschmeyer's Catalog of Fishes**. ***dataFishing*** is faster and more efficient than other tools for obtaining taxonomic information from the databases consulted. It also allows the retrieval of **DNA sequences**, **Common Names**, **Synonyms**, **Conservation Status**, and **Occurrence Points** of species. The ***dataFishing*** repository, hosted on **GitHub** and **licensed under MIT**, is a **freely accessible** resource for the **scientific community**.

## Key Features

🌍 **Multiple Database Support**: Access 6 major biodiversity databases  
🧬 **Sequence Download**: Automated download of mitochondrial and chloroplast sequences  
📊 **Performance Benchmarking**: Built-in performance analysis and visualization  
⚡ **Asynchronous Processing**: High-speed concurrent API requests  
📋 **Comprehensive Results**: Excel, CSV, and TSV output formats  
🔧 **Easy Configuration**: Simple command-line interface with helpful documentation  

***  
### How to cite ***dataFishing***
##### [:rocket: Go to Contents Overview](#contents-overview)
When referencing the ***[dataFishing](https://doi.org/10.1016/j.ecoinf.2024.102970)*** tool, please cite it appropriately in your academic or professional work:

```
Rabelo, L., Sodré, D., Balcázar, O. D. A., do Rosário, M. F., Guimarães-Costa, A. J., Gomes, G., Sampaio, I., & Vallinoto, M. (2025). dataFishing: An efficient Python tool and user-friendly web-form for mining mitochondrial and chloroplast sequences, taxonomic, and biodiversity data. Ecological Informatics, 85, 102970. https://doi.org/10.1016/j.ecoinf.2024.102970
```
***  
# License
***dataFishing*** is released under the **MIT License**. This license permits reuse within proprietary software provided that all copies of the licensed software include a copy of the MIT License terms and the copyright notice.

For more details, please see the MIT License.
***
# The Hitchhiker's Guide to ***dataFishing***

## Change Log
##### [:rocket: Go to Contents Overview](#contents-overview)
- **Version 1.6.1** (2025-01-30)
  - Added asynchronous processing with aiohttp for improved performance
  - Implemented comprehensive IUCN Red List data extraction
  - Added performance benchmarking and visualization
  - Enhanced command-line interface with better argument descriptions
  - Added API key configuration system
  - Improved error handling and logging
  - Added support for Eschmeyer's Catalog of Fishes

- **Version 1.0.1** (2024-10-15)
  - Added the ability to download sequence data from BOLD System and/or GenBank
  - Added the ability to obtain data of Threats from the IUCN database

- **Version 1.0.0** (2024-10-01)
  - Initial release of ***dataFishing***

## Getting Started
##### [:rocket: Go to Contents Overview](#contents-overview)

### Prerequisites
Before you run ***dataFishing***, make sure you have the following prerequisites installed:

#### Python Environment
- **Python version 3.8 or higher**
- pip (Python package installer)
- conda (optional but recommended)

#### System Requirements
- Internet connection for API access
- Minimum 4GB RAM (8GB recommended for large datasets)
- 1GB free disk space for results and sequences

### Installation
##### [:rocket: Go to Contents Overview](#contents-overview)

#### Option 1: Install from PyPI (Recommended)
```bash
pip install dataFishing
```

#### Option 2: Install from Source
```bash
git clone https://github.com/luanrabelo/dataFishing.git
cd dataFishing
pip install -r requirements.txt
pip install -e .
```

#### Option 3: Using Conda Environment
```bash
conda create -n dataFishing python=3.11
conda activate dataFishing
pip install dataFishing
```

### API Keys Configuration
##### [:rocket: Go to Contents Overview](#contents-overview)

Some databases require API keys for access. Create an `apikeys.env` file in your working directory:

```bash
# Create apikeys.env file
touch apikeys.env
```

Add your API keys to the file:

```env
# NCBI Configuration (Required for NCBI database)
NCBI_EMAIL=your-email@university.edu
NCBI_API_KEY=your-ncbi-api-key-here

# IUCN Configuration (Required for IUCN database)
IUCN_API_KEY=your-iucn-api-token-here
```

#### How to Obtain API Keys:

**NCBI GenBank:**
1. Register at: https://account.ncbi.nlm.nih.gov/signup/
2. Email is required, API key is optional but increases rate limits
3. Get API key at: https://www.ncbi.nlm.nih.gov/account/settings/

**IUCN Red List:**
1. Request token at: https://apiv3.iucnredlist.org/api/v3/token
2. Academic use is usually free
3. Commercial use requires subscription

**Other databases (GBIF, WoRMS, BOLD, Eschmeyer) do not require API keys**

### Usage
##### [:rocket: Go to Contents Overview](#contents-overview)

Basic syntax:
```bash
dataFishing --input SPECIES_FILE --output RESULTS_DIR [OPTIONS]
```

### Command Line Arguments
##### [:rocket: Go to Contents Overview](#contents-overview)

#### 📁 Input and Output Arguments
- `--input, -i PATH` *(required)*: Path to species list file (.txt or .tsv)
- `--output, -o PATH` *(required)*: Output directory for results

#### 🌍 Biodiversity Databases Arguments
- `--all`: Query all available databases
- `--iucn`: Query IUCN Red List (requires API key)
- `--ncbi`: Query NCBI GenBank (requires email)
- `--bold`: Query BOLD Systems
- `--gbif`: Query GBIF
- `--worms`: Query WoRMS
- `--eschmeyer`: Query Eschmeyer's Catalog

#### 🧬 NCBI GenBank Arguments
- `--email, -e EMAIL`: Email address for NCBI access *(required for NCBI)*
- `--ncbi-api-key KEY`: NCBI API key for higher rate limits

#### ⬇️ Sequence Download Arguments
- `--download-sequences`: Enable sequence download
- `--genes-list FILE`: File containing gene names (one per line)

#### 📊 Performance and Logging Arguments
- `--benchmark`: Enable performance benchmarking
- `--plot-benchmark TSV_FILE`: Generate plots from benchmark data
- `--verbose, -v`: Enable detailed logging
- `--log-file`: Save logs to files

#### 🔧 API Configuration Arguments
- `--max-concurrent N`: Maximum concurrent requests
- `--rate-limit SECONDS`: Delay between requests

### Examples
##### [:rocket: Go to Contents Overview](#contents-overview)

#### Basic Usage - All Databases
```bash
dataFishing --input species.txt --output results/ --all --email your@email.com
```

#### Specific Databases Only
```bash
dataFishing --input species.txt --output results/ --iucn --worms --gbif --verbose
```

#### Download Sequences from NCBI
```bash
dataFishing --input species.txt --output results/ --ncbi \
           --email your@email.com --download-sequences --genes-list genes.txt
```

#### Enable Performance Benchmarking
```bash
dataFishing --input species.txt --output results/ --all \
           --email your@email.com --benchmark --verbose
```

#### Generate Plots from Existing Benchmark
```bash
dataFishing --plot-benchmark results/benchmark_results.tsv
```

### Input File Formats
##### [:rocket: Go to Contents Overview](#contents-overview)

#### Text File (.txt)
```
Panthera tigris
Canis lupus
Ursus americanus
Ailuropoda melanoleuca
```

#### TSV File from BOLD Systems
Download TSV data from [BOLD Systems](http://www.boldsystems.org/):
1. Search for your taxonomic group
2. Click "Combined: TSV" to download

### Gene List File Example
```
COI
COII
COIII
ND5
CYTB
Control Region
16S
12S
```

### Supported Genes
##### [:rocket: Go to Contents Overview](#contents-overview)

| Category | Mitochondrial Genes | Chloroplast Genes |
|----------|---------------------|-------------------|
| **rRNA** | 12S, 16S | - |
| **Complex I** | ND1, ND2, ND3, ND4, ND4L, ND5, ND6 | - |
| **Complex III** | CYTB | - |
| **Complex IV** | COI, COII, COIII | - |
| **Complex V** | ATP6, ATP8 | - |
| **Control Region** | Control Region | - |
| **ATP Synthase** | - | atpA, atpB, atpE, atpF, atpH, atpI |
| **Cytochrome** | - | petA, petB, petD, petE, petG, petL, petN |
| **RNA Polymerase** | - | rpoA, rpoB, rpoC1, rpoC2 |
| **Ribosome (Large)** | - | rpl2, rpl14, rpl16, rpl20, rpl22, rpl23, rpl32, rpl33, rpl36 |
| **NADH-dehydrogenase** | - | ndhA, ndhB, ndhC, ndhD, ndhE, ndhF, ndhG, ndhH, ndhI, ndhJ, ndhK |
| **PhotoSystem** | - | psaA, psaB, psaC, psaI, psaJ, psaM, psbA, psbB, psbC, psbD, psbE, psbF, psbH, psbI, psbJ, psbK, psbL, psbM, psbN, psbZ |
| **Ribosome (Small)** | - | rps2, rps3, rps4, rps7, rps8, rps11, rps12, rps14, rps15, rps16, rps18, rps19 |
| **Rubisco** | - | rbcL |

### Database Information
##### [:rocket: Go to Contents Overview](#contents-overview)

| Database | Data Retrieved | Requirements |
|----------|----------------|--------------|
| **IUCN Red List** | Conservation status, threats, habitats, population trends | API token |
| **NCBI GenBank** | Genetic sequences, taxonomy | Email (+ API key optional) |
| **BOLD Systems** | DNA barcodes, specimen records, taxonomy | None |
| **GBIF** | Occurrence records, taxonomy, synonyms | None |
| **WoRMS** | Marine taxonomy, habitat preferences | None |
| **Eschmeyer's Catalog** | Fish taxonomy, nomenclature, synonyms | None |

### Outputs Files
##### [:rocket: Go to Contents Overview](#contents-overview)

dataFishing generates several output files:

#### Main Results
- `dataFishing_results.xlsx`: Formatted Excel file with all data
- Individual CSV/TSV files for each database
- Consolidated summary files

#### Sequence Files (if downloaded)
- FASTA files organized by species and gene
- Separate folders for NCBI and BOLD sequences

#### Performance Files (if benchmarking enabled)
- `benchmark_results.tsv`: Raw performance data
- `benchmark_performance_analysis.png`: Performance plots
- `benchmark_summary.tsv`: Summary statistics

#### Log Files (if enabled)
- `IUCNLog.txt`, `NCBILog.txt`, etc.

#### IUCN Example
| **Tax ID** | **Kingdom** | **Phylum** | **Class** | **Order** | **Family** | **Genus** | **Species** | **Red List Category** | **Population Trend** | **Main Common Name** |
|:----------:|:-----------:|:----------:|:---------:|:---------:|:----------:|:---------:|:-----------:|:---------------------:|:--------------------:|:--------------------:|
| 15955 | Animalia | Chordata | Mammalia | Carnivora | Felidae | *Panthera* | *Panthera tigris* | Endangered | Decreasing | Tiger (eng) |
| 22823 | Animalia | Chordata | Mammalia | Carnivora | Canidae | *Canis* | *Canis lupus* | Least Concern | Stable | Gray Wolf (eng) |

#### WoRMS Example
| **AphiaID** | **Kingdom** | **Phylum** | **Class** | **Order** | **Family** | **Genus** | **Species** | **Status** | **Authority** |
|:-----------:|:-----------:|:----------:|:---------:|:---------:|:----------:|:---------:|:-----------:|:----------:|:-------------:|
| 137205 | Animalia | Chordata | Actinopteri | Carangiformes | Carangidae | *Caranx* | *Caranx hippos* | accepted | (Linnaeus, 1766) |

### Performance Optimization
##### [:rocket: Go to Contents Overview](#contents-overview)

#### For Large Datasets (>1000 species):
```bash
dataFishing --input large_species.txt --output results/ --all \
           --max-concurrent 10 --rate-limit 1.5 --benchmark
```

#### For Slow Connections:
```bash
dataFishing --input species.txt --output results/ --all \
           --max-concurrent 5 --rate-limit 2.0
```

#### For Fast Processing:
```bash
dataFishing --input species.txt --output results/ --all \
           --max-concurrent 50 --rate-limit 0.5
```

### Troubleshooting
##### [:rocket: Go to Contents Overview](#contents-overview)

#### Common Issues:

**"API token required"**
- Ensure `apikeys.env` file is in your working directory
- Check API key format and validity

**"Connection timeout"**
- Increase `--rate-limit` value
- Decrease `--max-concurrent` value
- Check internet connection

**"No species found"**
- Verify input file format
- Check species name spelling
- Ensure one species per line in text files

**"Permission denied"**
- Check output directory permissions
- Ensure disk space is available

### Advanced Usage
##### [:rocket: Go to Contents Overview](#contents-overview)

#### Custom Configuration File
Create a configuration script for repeated usage:

```bash
#!/bin/bash
# datafishing_config.sh

EMAIL="your@email.com"
INPUT_DIR="/path/to/species/files"
OUTPUT_DIR="/path/to/results"
GENES_LIST="/path/to/genes.txt"

dataFishing --input "$INPUT_DIR/species.txt" \
           --output "$OUTPUT_DIR" \
           --all \
           --email "$EMAIL" \
           --download-sequences \
           --genes-list "$GENES_LIST" \
           --benchmark \
           --verbose \
           --log-file
```

#### Batch Processing Multiple Files
```bash
#!/bin/bash
# Process multiple species files

for file in species_*.txt; do
    echo "Processing $file..."
    dataFishing --input "$file" \
               --output "results_$(basename $file .txt)" \
               --all \
               --email your@email.com \
               --verbose
done
```

***
### ***dataFishing*** Development Team
##### [:rocket: Go to Contents Overview](#contents-overview)
- **Luan Rabelo** (Lead Developer)
- Clayton Sodré
- Oscar Balcázar
- Murilo Furtado
- Aurycéia Guimarães-Costa
- **Iracilda Sampaio**
- **Marcelo Vallinoto**

***  
### Contact
##### [:rocket: Go to Contents Overview](#contents-overview)
For reporting bugs, requesting assistance, or providing feedback, please reach out to:

**Primary Contact:** Luan Rabelo
- Email: luanrabelo@outlook.com
- GitHub: [@luanrabelo](https://github.com/luanrabelo)

**Issues and Bug Reports:**
- GitHub Issues: https://github.com/luanrabelo/dataFishing/issues

**Documentation and Wiki:**
- GitHub Wiki: https://github.com/luanrabelo/dataFishing/wiki

---

**⭐ If you find dataFishing useful, please consider giving it a star on GitHub!**

[![GitHub stars](https://img.shields.io/github/stars/luanrabelo/dataFishing?style=social)](https://github.com/luanrabelo/dataFishing)
***