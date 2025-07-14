import argparse
import asyncio
import logging
import os
import sys
from .file_handlers import read_input_file
from .utils import create_folder, BenchmarkTimer, plot_benchmark_results
from .apis.worms import get_worms_data_batch
from .apis.gbif import get_gbif_data_batch
from .apis.bold import get_bold_data_batch
from .apis.genbank import get_ncbi_data_batch
from .apis.eschmeyer import get_eschmeyer_data_batch
from .apis.iucn import get_iucn_data_batch
from .core import save_biodiversity_results
from . import __version__, __github__, __author__, __license__, __tool__

# Terminal colors for better visualization
class TerminalColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y/%m/%d - %H:%M:%S')

def print_tool_header():
    """Print tool header with version and author information."""
    print(f"\n{TerminalColors.BOLD}{TerminalColors.HEADER}")
    print("=" * 80)
    print(f"                              {__tool__} v{__version__}")
    print("=" * 80)
    print(f"{TerminalColors.ENDC}")
    
    print(f"{TerminalColors.OKGREEN}An Efficient Python Tool for Mining Mitochondrial and Chloroplast")
    print(f"Sequences, Taxonomic, and Biodiversity Data{TerminalColors.ENDC}")
    print()
    
    print(f"{TerminalColors.OKCYAN}Author:{TerminalColors.ENDC} {__author__}")
    print(f"{TerminalColors.OKCYAN}Version:{TerminalColors.ENDC} {__version__}")
    print(f"{TerminalColors.OKCYAN}License:{TerminalColors.ENDC} {__license__}")
    print(f"{TerminalColors.OKCYAN}GitHub:{TerminalColors.ENDC} https://github.com/{__github__}")
    print(f"{TerminalColors.OKCYAN}Documentation:{TerminalColors.ENDC} https://github.com/{__github__}")
    print()
    
    print(f"{TerminalColors.WARNING}Supported Databases:{TerminalColors.ENDC}")
    print(f"  • IUCN Red List (Conservation status, threats, habitats)")
    print(f"  • NCBI GenBank (Genetic sequences, taxonomy)")
    print(f"  • BOLD Systems (DNA barcodes, taxonomy)")
    print(f"  • GBIF (Occurrence data, taxonomy)")
    print(f"  • WoRMS (Marine species taxonomy)")
    print(f"  • Eschmeyer's Catalog (Fish taxonomy)")
    print()
    
    print(f"{TerminalColors.BOLD}{TerminalColors.HEADER}")
    print("=" * 80)
    print(f"{TerminalColors.ENDC}\n")

def print_citation():
    """Print citation information."""
    print(f"\n{TerminalColors.BOLD}{TerminalColors.OKGREEN}")
    print("=" * 80)
    print("How to cite dataFishing:")
    print("=" * 80)
    print(f"{TerminalColors.ENDC}")
    
    print(f"{TerminalColors.OKCYAN}Rabelo, L., Sodré, D., Balcázar, O. D. A., do Rosário, M. F., ")
    print(f"Guimarães-Costa, A. J., Gomes, G., Sampaio, I., & Vallinoto, M. (2025). ")
    print(f"dataFishing: An efficient Python tool and user-friendly web-form for mining ")
    print(f"mitochondrial and chloroplast sequences, taxonomic, and biodiversity data. ")
    print(f"Ecological Informatics, 85, 102970. ")
    print(f"https://doi.org/10.1016/j.ecoinf.2024.102970{TerminalColors.ENDC}")
    
    print(f"\n{TerminalColors.BOLD}{TerminalColors.OKGREEN}")
    print("=" * 80)
    print(f"{TerminalColors.ENDC}\n")

def main():
    # Print tool header
    print_tool_header()
    
    parser = argparse.ArgumentParser(
        prog="dataFishing",
        description=f"""{__tool__}: An Efficient Python Tool and User-Friendly Web-Form for Mining Mitochondrial and Chloroplast Sequences, Taxonomic, and Biodiversity Data

Created by {__author__}

https://doi.org/10.1016/j.ecoinf.2024.102970""".strip(),
        epilog=f"""
Examples:
  # Basic usage - all databases
  dataFishing --input species.txt --output results/ --all --email your@email.com

  # Specific databases only
  dataFishing --input species.txt --output results/ --iucn --worms --gbif

  # Download sequences from NCBI
  dataFishing --input species.txt --output results/ --ncbi --email your@email.com \\
             --download-sequences --genes-list genes.txt

  # Enable benchmarking
  dataFishing --input species.txt --output results/ --all --benchmark

For more information, visit: https://github.com/{__github__}
        """,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        add_help=True,
    )
    
    # Input and Output Arguments
    io_group = parser.add_argument_group('📁 Input and Output Arguments')
    io_group.add_argument(
        '-i', '--input',
        type=str,
        required=True,
        metavar='PATH',
        help="""Path to the input file containing species names.
        
Supported formats:
  • Text file (.txt): One species name per line
    Example: 'Panthera tigris'
  • TSV file (.tsv): BOLD Systems export format
    Download from http://www.boldsystems.org/
    
The file should contain binomial species names (genus + species).
Example file content:
  Panthera tigris
  Canis lupus
  Ursus americanus"""
    )
    
    io_group.add_argument(
        '-o', '--output',
        type=str,
        required=True,
        metavar='PATH',
        help="""Absolute path to the output directory for results.
        
The directory will be created automatically if it doesn't exist.
All results will be organized in subdirectories:
  • Excel files with formatted results
  • CSV/TSV files for data analysis
  • FASTA sequences (if downloaded)
  • Log files and benchmarks
  
Example: /path/to/results or C:\\Users\\username\\Documents\\results"""
    )

    # Biodiversity Databases Arguments
    api_group = parser.add_argument_group('🌍 Biodiversity Databases Arguments')
    api_group.add_argument(
        '--all',
        action='store_true',
        help="""Retrieve data from ALL available databases.
        
This enables data collection from:
  • IUCN Red List (conservation status)
  • NCBI GenBank (genetic sequences)
  • BOLD Systems (DNA barcodes)
  • GBIF (occurrence data)
  • WoRMS (marine taxonomy)
  • Eschmeyer's Catalog (fish taxonomy)
  
Note: NCBI requires --email parameter"""
    )
    
    api_group.add_argument(
        '--iucn',
        action='store_true',
        help="""Query IUCN Red List of Threatened Species.
        
Retrieves:
  • Conservation status (LC, NT, VU, EN, CR, EW, EX)
  • Threats and pressures
  • Habitat preferences
  • Geographic distribution
  • Population trends
  • Conservation actions needed
  
Requires: IUCN API token in apikeys.env file"""
    )
    
    api_group.add_argument(
        '--ncbi',
        action='store_true',
        help="""Query NCBI GenBank for genetic sequences.
        
Retrieves:
  • Taxonomic classification
  • Available genetic sequences
  • GenBank accession numbers
  • Sequence metadata
  
Requires: --email parameter (NCBI registration)
Optional: --ncbi-api-key for higher rate limits"""
    )
    
    api_group.add_argument(
        '--bold',
        action='store_true',
        help="""Query BOLD Systems (Barcode of Life).
        
Retrieves:
  • DNA barcode sequences
  • Specimen records
  • Collection information
  • Taxonomic classification
  • BIN (Barcode Index Numbers)
  
Sequences can be downloaded with --download-sequences"""
    )
    
    api_group.add_argument(
        '--gbif',
        action='store_true',
        help="""Query Global Biodiversity Information Facility.
        
Retrieves:
  • Species occurrence records
  • Taxonomic backbone
  • Geographic distribution
  • Synonym relationships
  • Vernacular names"""
    )
    
    api_group.add_argument(
        '--worms',
        action='store_true',
        help="""Query World Register of Marine Species.
        
Retrieves:
  • Marine species taxonomy
  • Taxonomic status (accepted/unaccepted)
  • Habitat preferences (marine/brackish/freshwater)
  • Authority information
  • AphiaID identifiers"""
    )
    
    api_group.add_argument(
        '--eschmeyer',
        action='store_true',
        help="""Query Eschmeyer's Catalog of Fishes.
        
Retrieves:
  • Fish taxonomy and nomenclature
  • Valid/synonym status
  • Original descriptions
  • Type specimens
  • Family classifications"""
    )

    # NCBI Specific Arguments
    ncbi_group = parser.add_argument_group('🧬 NCBI GenBank Arguments')
    ncbi_group.add_argument(
        '-e', '--email',
        type=str,
        metavar='EMAIL',
        help="""Email address for NCBI API access (REQUIRED for NCBI).
        
Must be registered with NCBI: https://account.ncbi.nlm.nih.gov/signup/
Can also be set via NCBI_EMAIL environment variable.

Example: --email researcher@university.edu"""
    )
    
    ncbi_group.add_argument(
        '--ncbi-api-key',
        type=str,
        metavar='KEY',
        help="""NCBI API key for increased rate limits (OPTIONAL).
        
Increases request limits from 3/sec to 10/sec.
Get yours at: https://www.ncbi.nlm.nih.gov/account/settings/
Can also be set via NCBI_API_KEY environment variable.

Example: --ncbi-api-key 1234567890abcdef"""
    )

    # Sequence Download Arguments
    download_group = parser.add_argument_group('⬇️ Sequence Download Arguments')
    download_group.add_argument(
        '--download-sequences',
        action='store_true',
        help="""Download DNA/RNA sequences from databases.
        
For NCBI: Downloads sequences for genes specified in --genes-list
For BOLD: Downloads all available barcode sequences

Sequences are saved as FASTA files organized by:
  • Species (separate folders)
  • Gene type (separate files)
  • Database source"""
    )
    
    download_group.add_argument(
        '--genes-list',
        type=str,
        metavar='FILE',
        help="""Path to file containing gene names for NCBI download.
        
File format: One gene name per line
Example content:
  COI
  16S
  CYTB
  ND1
  Control Region

Supports mitochondrial and chloroplast genes.
See documentation for complete gene list."""
    )

    # Performance and Logging Arguments
    performance_group = parser.add_argument_group('📊 Performance and Logging Arguments')
    performance_group.add_argument(
        '--benchmark',
        action='store_true',
        help="""Enable performance benchmarking.
        
Measures and records:
  • API response times
  • Success rates
  • Species processing speed
  • Database performance comparison

Results saved as:
  • benchmark_results.tsv (raw data)
  • benchmark_performance_analysis.png (plots)
  • benchmark_summary.tsv (statistics)"""
    )
    
    performance_group.add_argument(
        '--plot-benchmark',
        type=str,
        metavar='TSV_FILE',
        help="""Generate plots from existing benchmark data.
        
Provide path to a benchmark_results.tsv file to create
performance visualization plots.

Example: --plot-benchmark /path/to/benchmark_results.tsv"""
    )
    
    performance_group.add_argument(
        '-v', '--verbose',
        action='store_true',
        help="""Enable detailed logging output.
        
Shows:
  • Progress information for each species
  • API response details
  • File processing status
  • Error messages and warnings
  • Performance metrics

Recommended for troubleshooting."""
    )
    
    performance_group.add_argument(
        '--log-file',
        action='store_true',
        help="""Save detailed logs to files.
        
Creates separate log files for each database:
  • IUCNLog.txt
  • NCBILog.txt
  • BOLDLog.txt
  • GBIFLog.txt
  • WoRMSLog.txt

Useful for debugging and audit trails."""
    )

    # API Configuration Arguments
    config_group = parser.add_argument_group('🔧 API Configuration Arguments')
    config_group.add_argument(
        '--max-concurrent',
        type=int,
        default=None,
        metavar='N',
        help="""Maximum concurrent API requests (default: auto).
        
Controls parallel processing:
  • Higher values = faster processing
  • Lower values = more stable for slow connections
  • Auto-adjusts based on database limits

Recommended ranges:
  • IUCN: 10-20
  • NCBI: 3-10
  • Others: 20-50"""
    )
    
    config_group.add_argument(
        '--rate-limit',
        type=float,
        default=None,
        metavar='SECONDS',
        help="""Delay between API requests in seconds (default: auto).
        
Controls request frequency:
  • Higher values = slower but more stable
  • Lower values = faster but may hit rate limits
  • Auto-adjusts based on API requirements

Default delays:
  • IUCN: 2 seconds
  • NCBI: 0.5 seconds
  • Others: 1 second"""
    )

    args = parser.parse_args()
    
    # Validate arguments
    if args.plot_benchmark:
        if not os.path.exists(args.plot_benchmark):
            print(f"{TerminalColors.FAIL}❌ Error: Benchmark file not found: {args.plot_benchmark}{TerminalColors.ENDC}")
            return 1
        
        output_dir = os.path.dirname(args.plot_benchmark) if os.path.dirname(args.plot_benchmark) else "."
        plot_benchmark_results(args.plot_benchmark, output_folder=output_dir, verbose=args.verbose)
        print_citation()
        return 0
    
    # Check if any database is selected
    if not any([args.all, args.iucn, args.ncbi, args.bold, args.gbif, args.worms, args.eschmeyer]):
        print(f"{TerminalColors.FAIL}❌ Error: No databases selected. Use --all or specify individual databases.{TerminalColors.ENDC}")
        return 1
    
    # Validate NCBI requirements
    if (args.all or args.ncbi) and not args.email:
        print(f"{TerminalColors.FAIL}❌ Error: NCBI database requires --email parameter.{TerminalColors.ENDC}")
        print(f"Register at: https://account.ncbi.nlm.nih.gov/signup/")
        return 1
    
    # Validate sequence download requirements
    if args.download_sequences and (args.all or args.ncbi) and not args.genes_list:
        print(f"{TerminalColors.WARNING}⚠️  Warning: --download-sequences enabled for NCBI but no --genes-list provided.{TerminalColors.ENDC}")
        print("Only taxonomy will be retrieved from NCBI.")
    
    # Validate input file
    if not os.path.exists(args.input):
        print(f"{TerminalColors.FAIL}❌ Error: Input file not found: {args.input}{TerminalColors.ENDC}")
        return 1
    
    # Show configuration summary
    print(f"{TerminalColors.OKBLUE}🔧 Configuration Summary:{TerminalColors.ENDC}")
    print(f"   Input file: {os.path.basename(args.input)}")
    print(f"   Output directory: {args.output}")
    
    selected_dbs = []
    if args.all:
        selected_dbs = ["All databases"]
    else:
        if args.iucn: selected_dbs.append("IUCN")
        if args.ncbi: selected_dbs.append("NCBI")
        if args.bold: selected_dbs.append("BOLD")
        if args.gbif: selected_dbs.append("GBIF")
        if args.worms: selected_dbs.append("WoRMS")
        if args.eschmeyer: selected_dbs.append("Eschmeyer")
    
    print(f"   Databases: {', '.join(selected_dbs)}")
    
    if args.download_sequences:
        print(f"   Sequence download: {TerminalColors.OKGREEN}Enabled{TerminalColors.ENDC}")
        if args.genes_list:
            print(f"   Genes list: {os.path.basename(args.genes_list)}")
    
    if args.benchmark:
        print(f"   Benchmarking: {TerminalColors.OKGREEN}Enabled{TerminalColors.ENDC}")
    
    print()

    # Initialize benchmark timer if requested
    benchmark_timer = None
    if args.benchmark:
        benchmark_timer = BenchmarkTimer(output_folder=args.output, verbose=args.verbose)

    # Create output folder and read input file
    create_folder(folder_name=args.output, verbose=args.verbose)
    
    try:
        species_list = asyncio.run(read_input_file(
            input=args.input, 
            folder=args.output, 
            verbose=args.verbose
        ))
    except Exception as e:
        print(f"{TerminalColors.FAIL}❌ Error reading input file: {e}{TerminalColors.ENDC}")
        return 1
    
    if not species_list:
        print(f"{TerminalColors.FAIL}❌ Error: No species found in input file{TerminalColors.ENDC}")
        return 1
    
    print(f"{TerminalColors.OKGREEN}✅ Found {len(species_list)} species to process{TerminalColors.ENDC}\n")
    
    api_results = {}
    
    # Process each database
    try:
        # WoRMS
        if species_list and (args.all or args.worms):
            if args.verbose:
                logging.info("🌊 WoRMS data retrieval requested...")
            
            if benchmark_timer:
                benchmark_timer.start_api_benchmark("WoRMS", len(species_list))
            
            df_worms = asyncio.run(get_worms_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=args.rate_limit or 1,
                max_concurrent=args.max_concurrent or 50,
                log_to_file=args.log_file,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output
            ))
            
            if benchmark_timer:
                success_count = len(df_worms[df_worms.iloc[:, 0] != '-']) if not df_worms.empty else 0
                benchmark_timer.end_api_benchmark(success_count)
            
            api_results['WoRMS'] = df_worms

        # GBIF
        if species_list and (args.all or args.gbif):
            if args.verbose:
                logging.info("🌍 GBIF data retrieval requested...")
            
            if benchmark_timer:
                benchmark_timer.start_api_benchmark("GBIF", len(species_list))
            
            df_gbif = asyncio.run(get_gbif_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=args.rate_limit or 1,
                max_concurrent=args.max_concurrent or 50,
                log_to_file=args.log_file,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output
            ))
            
            if benchmark_timer:
                success_count = len(df_gbif[df_gbif.iloc[:, 0] != '-']) if not df_gbif.empty else 0
                benchmark_timer.end_api_benchmark(success_count)
            
            api_results['GBIF'] = df_gbif

        # BOLD
        if species_list and (args.all or args.bold):
            if args.verbose:
                logging.info("🧬 BOLD Systems data retrieval requested...")
            
            if benchmark_timer:
                benchmark_timer.start_api_benchmark("BOLD", len(species_list))
            
            df_bold = asyncio.run(get_bold_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=args.rate_limit or 1,
                max_concurrent=args.max_concurrent or 20,
                log_to_file=args.log_file,
                max_retries=10,
                retry_delay=5,
                download_sequences=args.download_sequences,
                output_folder=args.output
            ))
            
            if benchmark_timer:
                success_count = len(df_bold[df_bold.iloc[:, 0] != '-']) if not df_bold.empty else 0
                benchmark_timer.end_api_benchmark(success_count)
            
            api_results['BOLD'] = df_bold

        # NCBI
        if species_list and (args.all or args.ncbi):
            if args.verbose:
                logging.info("🔬 NCBI data retrieval requested...")
            
            if benchmark_timer:
                benchmark_timer.start_api_benchmark("NCBI", len(species_list))
            
            # Process genes list if provided
            gene_list = []
            if args.download_sequences and args.genes_list:
                try:
                    with open(args.genes_list, 'r', encoding='utf-8') as f:
                        gene_list = [line.strip() for line in f.readlines() if line.strip()]
                    if args.verbose:
                        logging.info(f"🧬 NCBI - Loaded {len(gene_list)} genes from {args.genes_list}")
                except Exception as e:
                    if args.verbose:
                        logging.error(f"❌ NCBI - Error reading genes list: {e}")
                    gene_list = []
            
            df_ncbi = asyncio.run(get_ncbi_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=args.rate_limit or 1,
                max_concurrent=args.max_concurrent or 5,
                log_to_file=args.log_file,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output,
                email=args.email,
                api_key=args.ncbi_api_key,
                download_sequences=args.download_sequences,
                gene_list=gene_list
            ))
            
            if benchmark_timer:
                success_count = len(df_ncbi[df_ncbi.iloc[:, 0] != '-']) if not df_ncbi.empty else 0
                benchmark_timer.end_api_benchmark(success_count)
            
            api_results['NCBI'] = df_ncbi

        # Eschmeyer
        if species_list and (args.all or args.eschmeyer):
            if args.verbose:
                logging.info("🐟 Eschmeyer's Catalog data retrieval requested...")
            
            if benchmark_timer:
                benchmark_timer.start_api_benchmark("Eschmeyer", len(species_list))
            
            df_eschmeyer = asyncio.run(get_eschmeyer_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=args.rate_limit or 1,
                max_concurrent=args.max_concurrent or 10,
                log_to_file=args.log_file,
                max_retries=10,
                retry_delay=5,
                output_folder=args.output
            ))
            
            if benchmark_timer:
                success_count = len(df_eschmeyer[df_eschmeyer.iloc[:, 0] != '-']) if not df_eschmeyer.empty else 0
                benchmark_timer.end_api_benchmark(success_count)
            
            api_results['Eschmeyer'] = df_eschmeyer

        # IUCN
        if species_list and (args.all or args.iucn):
            if args.verbose:
                logging.info("🦎 IUCN data retrieval requested...")
            
            if benchmark_timer:
                benchmark_timer.start_api_benchmark("IUCN", len(species_list))
            
            df_iucn = asyncio.run(get_iucn_data_batch(
                species_list=species_list,
                verbose=args.verbose,
                time_delay=args.rate_limit or 2,  # IUCN requires slower rate
                max_concurrent=args.max_concurrent or 20,
                log_to_file=args.log_file,
                max_retries=3,
                retry_delay=5,
                output_folder=args.output
            ))
            
            if benchmark_timer:
                success_count = len(df_iucn[df_iucn['Tax ID'] != '-']) if not df_iucn.empty else 0
                benchmark_timer.end_api_benchmark(success_count)
            
            api_results['IUCN'] = df_iucn

        # Save benchmark results and generate plots
        if benchmark_timer and benchmark_timer.benchmark_data:
            benchmark_timer.save_benchmark_results()
            
            benchmark_file = os.path.join(args.output, "benchmark_results.tsv")
            if os.path.exists(benchmark_file):
                plot_benchmark_results(benchmark_file, output_folder=args.output, verbose=args.verbose)

        # Save results
        if api_results:
            asyncio.run(save_biodiversity_results(
                dataframes_dict=api_results,
                output_folder=args.output,
                verbose=args.verbose
            ))
            
            print(f"\n{TerminalColors.OKGREEN}✅ dataFishing process completed successfully!{TerminalColors.ENDC}")
            print(f"📁 Results saved to: {args.output}")
            
        elif species_list:
            if args.verbose:
                logging.info("No biodiversity APIs requested. Use --all or specify individual databases.")
        else:
            logging.warning("No species list available for API lookup")

    except KeyboardInterrupt:
        print(f"\n{TerminalColors.WARNING}⚠️  Process interrupted by user{TerminalColors.ENDC}")
        return 1
    except Exception as e:
        print(f"\n{TerminalColors.FAIL}❌ Error during execution: {e}{TerminalColors.ENDC}")
        return 1
    
    # Print citation
    print_citation()
    return 0

if __name__ == '__main__':
    sys.exit(main())
