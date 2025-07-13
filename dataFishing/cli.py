import argparse
import asyncio
import logging
from .file_handlers import read_input_file
from .utils import create_folder
from .apis.worms import get_worms_data_batch
from .apis.gbif import get_gbif_data_batch
from .apis.bold import get_bold_data_batch
from .apis.genbank import get_ncbi_data_batch
from .apis.eschmeyer import get_eschmeyer_data_batch
from .apis.iucn import get_iucn_data_batch
from .core import save_biodiversity_results
from . import __version__, __github__

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y/%m/%d - %H:%M:%S')

def main():
    parser = argparse.ArgumentParser(
        prog="dataFishing",
        description="""dataFishing: An Efficient Python Tool and User-Friendly Web-Form for Mining Mitochondrial and Chloroplast Sequences, Taxonomic, and Biodiversity Data\n\nCreated by Luan Rabelo\n\nhttps://doi.org/10.1016/j.ecoinf.2024.102970""".strip(),
        epilog=f"Example: dataFishing --input Examples/Carangidae.txt --all --email your@email.com --verbose",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        add_help=True,
    )
    
    io_group = parser.add_argument_group('Input and Output Arguments')
    io_group.add_argument(
        '-i',
        '--input',
        help=("This argument specifies the path to the input file, which "
              "should be a .txt or .tsv file.\n"
              "If it's a .txt file, it should be formatted such that each "
              "line contains a distinct species.\n"
              "If it's a .tsv file, it should be obtained from the Bold "
              "System (http://www.boldsystems.org/).\n"
              "To do this, conduct a search and obtain the TSV file by "
              "selecting the 'Combined: TSV' option.\n"
              f"See documentation in https://github.com/{__github__} for "
              "more details.\n"
              "Example: /path/to/species.txt or "
              "C:\\Users\\username\\Documents\\bold_data.tsv"),
        type=str,
        required=True,
        metavar='PATH'
    )
    io_group.add_argument(
        "-o", "--output",
        type=str,
        required=True,
        metavar="PATH",
        help=("This argument specifies the absolute path to the output "
              "directory where results will be saved.\n"
              "The directory will be created automatically if it does not "
              "exist.\n"
              "All generated files including Excel, CSV, TSV and FASTA "
              "sequences will be organized in subdirectories.\n"
              "Example: /path/to/output/directory or "
              "C:\\Users\\username\\Documents\\results")
    )

    api_group = parser.add_argument_group('Biodiversity databases Arguments')
    api_group.add_argument(
        '--all',
        action='store_true',
        help=("This argument specifies whether to retrieve data from all "
              "available databases (IUCN, GBIF, WoRMS, BOLD, and NCBI).\n"
              "When enabled, data will be collected from all supported "
              "biodiversity databases.")
    )
    api_group.add_argument(
        '--worms',
        action='store_true',
        help=("This argument specifies whether to retrieve taxonomic data "
              "from the World Register of Marine Species (WoRMS).\n"
              "WoRMS provides comprehensive taxonomic information for "
              "marine and some terrestrial species.")
    )
    api_group.add_argument(
        '--gbif',
        action='store_true',
        help=("This argument specifies whether to retrieve occurrence data "
              "from the Global Biodiversity Information Facility (GBIF).\n"
              "GBIF provides access to biodiversity data from around "
              "the world.")
    )
    api_group.add_argument(
        '--iucn',
        action='store_true',
        help=("This argument specifies whether to retrieve conservation "
              "status from the International Union for Conservation of "
              "Nature (IUCN).\n"
              "Provides Red List conservation status for species.")
    )
    api_group.add_argument(
        '--ncbi',
        action='store_true',
        help=("This argument specifies whether to retrieve genetic sequence "
              "data from the National Center for Biotechnology Information "
              "(NCBI).\n"
              "Provides access to GenBank and other sequence databases.")
    )
    api_group.add_argument(
        '--bold',
        action='store_true',
        help=("This argument specifies whether to retrieve taxonomic data "
              "from the Barcode of Life Data Systems (BOLD).\n"
              "BOLD provides comprehensive DNA barcode and taxonomic "
              "information for species identification.")
    )
    api_group.add_argument(
        '--eschmeyer',
        action='store_true',
        help=("This argument specifies whether to retrieve taxonomic data "
              "from Eschmeyer's Catalog of Fishes.\n"
              "Provides comprehensive fish taxonomy, nomenclature, and "
              "synonymy information.")
    )

    ncbi_group = parser.add_argument_group('NCBI Arguments')
    ncbi_group.add_argument(
        '-e', '--email',
        type=str,
        help=("Email address for NCBI API access. "
              "Please register at: https://account.ncbi.nlm.nih.gov/signup/\n"
              "Can also be set via NCBI_EMAIL environment variable.")
    )
    ncbi_group.add_argument(
        '--ncbi-api-key',
        type=str,
        help=("NCBI API key for increased rate limits. "
              "Get yours at: https://www.ncbi.nlm.nih.gov/account/settings/\n"
              "Can also be set via NCBI_API_KEY environment variable.")
    )
    ncbi_group.add_argument(
        '--download-sequences',
        action='store_true',
        help=("Download DNA sequences from NCBI for the specified genes.\n"
              "Sequences will be organized by species and gene in the output directory.")
    )
    ncbi_group.add_argument(
        '--genes-list',
        type=str,
        help=("Path to a text file containing gene names (one per line) to download from NCBI.\n"
              "Example file content:\nCOI\n16S\nCYTB\nND1")
    )

    log_group = parser.add_argument_group('Logging Arguments')
    log_group.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose logging for detailed progress information.\n"
             "Shows detailed file processing information and debug messages."
    )

    args = parser.parse_args()
    api_results = {}

    create_folder(folder_name=f"{args.output}", verbose=args.verbose)
    species_list = asyncio.run(
        read_input_file(
            input=args.input, 
            folder=args.output, 
            verbose=args.verbose
        )
    )
    
    if species_list and (args.all or args.worms):
        if args.verbose:
            logging.info("WoRMS data retrieval requested...")
        df_worms = asyncio.run(
            get_worms_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=1,
                max_concurrent=50,
                log_to_file=True,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output
            )
        )
        api_results['WoRMS'] = df_worms
    
    if species_list and (args.all or args.gbif):
        if args.verbose:
            logging.info("GBIF data retrieval requested...")
        df_gbif = asyncio.run(
            get_gbif_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=1,
                max_concurrent=50,
                log_to_file=True,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output
            )
        )
        api_results['GBIF'] = df_gbif
    
    if species_list and (args.all or args.bold):
        if args.verbose:
            logging.info("BOLD Systems data retrieval requested...")
        df_bold = asyncio.run(
            get_bold_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=1,
                max_concurrent=20,
                log_to_file=True,
                max_retries=10,
                retry_delay=5,
                download_sequences=True,
                output_folder=args.output
            )
        )
        api_results['BOLD'] = df_bold

    if species_list and (args.all or args.ncbi):
        if args.verbose:
            logging.info("NCBI data retrieval requested...")
        
        # Processar lista de genes se fornecida
        gene_list = []
        if args.download_sequences and args.genes_list:
            try:
                with open(args.genes_list, 'r', encoding='utf-8') as f:
                    gene_list = [line.strip() for line in f.readlines() if line.strip()]
                if args.verbose:
                    logging.info(f"NCBI - Loaded {len(gene_list)} genes from {args.genes_list}")
            except Exception as e:
                if args.verbose:
                    logging.error(f"NCBI - Error reading genes list: {e}")
                gene_list = []
        elif args.download_sequences and not args.genes_list:
            if args.verbose:
                logging.warning("NCBI - Sequence download requested but no genes list provided. Skipping sequence download.")
        elif not args.download_sequences and args.genes_list:
            if args.verbose:
                logging.info("NCBI - Genes list provided but sequence download not requested. Only taxonomy will be retrieved.")
        
        df_ncbi = asyncio.run(
            get_ncbi_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=1,
                max_concurrent=5,
                log_to_file=True,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output,
                email=args.email,
                api_key=args.ncbi_api_key,
                download_sequences=args.download_sequences,
                gene_list=gene_list
            )
        )
        api_results['NCBI'] = df_ncbi

    if species_list and (args.all or args.eschmeyer):
        if args.verbose:
            logging.info("Eschmeyer's Catalog data retrieval requested...")
        df_eschmeyer = asyncio.run(
            get_eschmeyer_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=1,
                max_concurrent=10,
                log_to_file=True,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output
            )
        )
        api_results['Eschmeyer'] = df_eschmeyer

    if species_list and (args.all or args.iucn):
        if args.verbose:
            logging.info("IUCN data retrieval requested...")
        df_iucn = asyncio.run(
            get_iucn_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=2,  # Rate limiting for IUCN
                max_concurrent=10,  # IUCN limit
                log_to_file=True,
                max_retries=3,
                retry_delay=5,
                output_folder=args.output
            )
        )
        api_results['IUCN'] = df_iucn

    if api_results:
        asyncio.run(
            save_biodiversity_results(
                dataframes_dict=api_results,
                output_folder=args.output,
                verbose=args.verbose
            )
        )
    elif species_list:
        if args.verbose:
            logging.info("No biodiversity APIs requested. Use --worms, --gbif, --iucn, --ncbi or --all to enable.")
    else:
        logging.warning("No species list available for API lookup")

if __name__ == '__main__':
    main()
