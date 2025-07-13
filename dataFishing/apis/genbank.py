import asyncio
import logging
import time
import os
import pandas as pd
import requests
import re
from Bio import Entrez
from Bio import SeqIO
# Correção na importação do syngenes
try:
    from SynGenes import SynGenes
except ImportError:
    try:
        from SynGenes import SynGenes
    except ImportError:
        logging.error("SynGenes library not found. Please install it with: pip install syngenes")
        SynGenes = None

from ..utils import load_api_keys, get_rate_limit_delay, create_folder

async def ncbi_taxonomy(**kwargs):
    species_name = kwargs.get('species_name', 'Rhinella marina')
    email = kwargs.get('email')
    api_key = kwargs.get('api_key')
    time_delay = kwargs.get('time_delay', 1)
    verbose = kwargs.get('verbose', True)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 2)
    output_folder = kwargs.get('output_folder', ".")
    
    # Carregar API keys se não fornecidas
    if not email or not api_key:
        api_keys = load_api_keys(verbose=verbose)
        if not email:
            email = api_keys.get('ncbi_email')
        if not api_key:
            api_key = api_keys.get('ncbi_api_key')
    
    # Validar email
    if not email:
        if verbose:
            logging.error("NCBI - Email is required for NCBI API access")
        return None
    
    # Configurar delay baseado na disponibilidade da API key
    has_api_key = bool(api_key)
    rate_delay = get_rate_limit_delay(has_api_key=has_api_key, api_name='ncbi')
    
    if not api_key:
        if verbose:
            logging.warning("NCBI - API key not provided, using reduced rate limits (2 requests/second)")
    else:
        if verbose:
            logging.info("NCBI - API key found, using standard rate limits (4 requests/second)")
    
    data_dict = {
        'TaxID': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': species_name.split(' ')[0],
        'Species Name': species_name,
        'Scientific Name': '-',
        'Rank': '-'
    }
    
    log_file = os.path.join(output_folder, 'NCBILog.txt')
    
    # Configurar NCBI Entrez
    Entrez.email = email
    if api_key:
        Entrez.api_key = api_key
    Entrez.sleep_between_tries = 25
    Entrez.max_tries = 5
    
    ncbi_result = [species_name]
    
    # Aplicar delay de rate limiting
    await asyncio.sleep(rate_delay)
    
    if verbose:
        logging.info(f"NCBI - {species_name} Getting taxonomy from NCBI...")
    
    for attempt in range(max_retries):
        try:
            # Buscar na base de dados de taxonomia do NCBI
            search_handle = await asyncio.to_thread(
                Entrez.esearch, 
                db="taxonomy", 
                term=species_name, 
                retmax=25, 
                usehistory="y"
            )
            search_record = Entrez.read(search_handle)
            search_handle.close()
            
            if int(search_record["Count"]) > 0:
                tax_id = search_record["IdList"][0]
                
                if verbose:
                    logging.info(f"NCBI - {species_name} Found in NCBI: TaxID={tax_id}")
                
                # Delay antes de buscar dados detalhados
                await asyncio.sleep(rate_delay)
                
                # Buscar dados detalhados da taxonomia
                fetch_handle = await asyncio.to_thread(
                    Entrez.efetch, 
                    db="taxonomy", 
                    id=tax_id, 
                    retmode="xml"
                )
                fetch_records = Entrez.read(fetch_handle)
                fetch_handle.close()
                
                if fetch_records:
                    tax_record = fetch_records[0]
                    lineage = tax_record.get("LineageEx", [])
                    
                    data_dict['TaxID'] = str(tax_id)
                    data_dict['Scientific Name'] = str(tax_record.get('ScientificName', species_name))
                    data_dict['Rank'] = str(tax_record.get('Rank', '-'))
                    
                    # Processar a linhagem taxonômica
                    for lineage_item in lineage:
                        rank = str(lineage_item.get('Rank', '')).capitalize()
                        if rank in data_dict:
                            data_dict[rank] = str(lineage_item.get('ScientificName', '-'))
                    
                    taxonomy_info = f"TaxID: {data_dict['TaxID']}, Kingdom: {data_dict['Kingdom']}, Family: {data_dict['Family']}"
                    
                    if verbose:
                        logging.info(f"NCBI - {species_name} Taxonomy retrieved: {taxonomy_info}")
                    
                    if log_to_file:
                        log_message = f"NCBI - {species_name} Found: {taxonomy_info}"
                        with open(log_file, 'a+', encoding='utf-8') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - INFO - {log_message}\n")
                    break
                else:
                    if verbose:
                        logging.warning(f"NCBI - {species_name} No detailed taxonomy data found")
                    if log_to_file:
                        with open(log_file, 'a+', encoding='utf-8') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - NCBI - {species_name} No detailed taxonomy data found\n")
                    break
            else:
                if verbose:
                    logging.warning(f"NCBI - {species_name} No results found in NCBI")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - NCBI - {species_name} No results found in NCBI\n")
                break
                
        except Exception as e:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"NCBI - {species_name} Error: {e}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"NCBI - {species_name} Error: {e}. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - NCBI - {species_name} Error: {e}\n")
    
    ncbi_result.append(';'.join(data_dict.values()))
    return ncbi_result

async def ncbi_gene_search(**kwargs):
    """Buscar genes específicos no NCBI para uma espécie usando SynGenes."""
    species_name = kwargs.get('species_name', 'Rhinella marina')
    gene_name = kwargs.get('gene_name', 'COI')
    email = kwargs.get('email')
    api_key = kwargs.get('api_key')
    verbose = kwargs.get('verbose', True)
    semaphore = kwargs.get('semaphore')
    
    # Carregar API keys se não fornecidas
    if not email or not api_key:
        api_keys = load_api_keys(verbose=False)  # Não verbose para evitar logs repetitivos
        if not email:
            email = api_keys.get('ncbi_email')
        if not api_key:
            api_key = api_keys.get('ncbi_api_key')
    
    if not email:
        if verbose:
            logging.error("NCBI - Email is required for gene search")
        return []
    
    # Configurar delay baseado na disponibilidade da API key
    has_api_key = bool(api_key)
    rate_delay = get_rate_limit_delay(has_api_key=has_api_key, api_name='ncbi')
    
    # Configurar NCBI Entrez
    Entrez.email = email
    if api_key:
        Entrez.api_key = api_key
    Entrez.sleep_between_tries = 25
    Entrez.max_tries = 5
    
    # Lista de genes mitocondriais e cloroplastos
    mitochondrial_genes = ["12S", "16S", "ATP6", "ATP8", "COI", "COII", "COIII", "CYTB", "ND1", "ND2", "ND3", "ND4", "ND4L", "ND5", "ND6", "Control Region"]
    chloroplast_genes = ['accD', 'atpA', 'atpB', 'atpE', 'atpF', 'atpH', 'atpI', 'ccsA', 'cemA', 'chlB', 'chlL', 'chlN', 'clpP', 'clpP1', 'cysA', 'cysT', 'ftsH', 'infA', 'lhbA', 'matK', 'matk', 'ndhA', 'ndhB', 'ndhC', 'ndhD', 'ndhE', 'ndhF', 'ndhG', 'ndhH', 'ndhI', 'ndhJ', 'ndhK', 'pafI', 'pafII', 'pbf1', 'petA', 'petB', 'petD', 'petE', 'petG', 'petL', 'petN', 'psaA', 'psaB', 'psaC', 'psaI', 'psaJ', 'psaM', 'psb30', 'psbA', 'psbB', 'psbC', 'psbD', 'psbE', 'psbF', 'psbG', 'psbH', 'psbI', 'psbJ', 'psbK', 'psbL', 'psbM', 'psbN', 'psbT', 'psbZ', 'rbcL', 'rpl14', 'rpl16', 'rpl2', 'rpl20', 'rpl21', 'rpl22', 'rpl23', 'rpl32', 'rpl33', 'rpl36', 'rpoA', 'rpoB', 'rpoC1', 'rpoC2', 'rps11', 'rps12', 'rps14', 'rps15', 'rps16', 'rps18', 'rps19', 'rps2', 'rps3', 'rps4', 'rps7', 'rps8', 'rrn16S', 'rrn23S', 'rrn4.5S', 'rrn5S']
    
    # Validar gene e determinar tipo
    if gene_name in mitochondrial_genes:
        gene_type = 'mt'
    elif gene_name in chloroplast_genes:
        gene_type = 'cp'
    else:
        if verbose:
            logging.error(f"NCBI - Gene '{gene_name}' not found in supported gene lists")
        return []
    
    if verbose:
        logging.info(f"NCBI - {species_name} Searching for gene '{gene_name}' ({gene_type})")
    
    try:
        async with semaphore:
            # Aplicar delay de rate limiting
            await asyncio.sleep(rate_delay)
            
            # Construir query usando múltiplas estratégias
            base_query = f'("{species_name}"[Organism] OR "{species_name}"[Title])'
            
            # Lista de queries para tentar (do mais específico para o mais geral)
            query_strategies = []
            
            # Estratégia 1: Usar SynGenes se disponível
            if SynGenes is not None:
                try:
                    # Inicializar SynGenes silenciosamente
                    sg = SynGenes(verbose=False)
                    
                    # Suprimir saída do SynGenes temporariamente
                    import sys
                    from io import StringIO
                    
                    # Capturar stdout temporariamente
                    old_stdout = sys.stdout
                    sys.stdout = StringIO()
                    
                    try:
                        gene_query = sg.build_query(geneName=gene_name, type=gene_type, searchType='All Fields', verbose=False)
                    finally:
                        # Restaurar stdout
                        sys.stdout = old_stdout
                    
                    if gene_query and gene_query.strip():
                        organelle_filter = "mitochondrion[filter]" if gene_type == 'mt' else "chloroplast[filter]"
                        full_query = f"{base_query} AND ({gene_query}) AND {organelle_filter}"
                        query_strategies.append(("SynGenes", full_query))
                    
                except Exception as e:
                    if verbose:
                        logging.debug(f"NCBI - SynGenes error for {gene_name}: {e}")
            
            # Estratégia 2: Query simples com gene
            organelle_filter = "mitochondrion[filter]" if gene_type == 'mt' else "chloroplast[filter]"
            simple_query = f"{base_query} AND \"{gene_name}\"[Gene] AND {organelle_filter}"
            query_strategies.append(("Simple Gene", simple_query))
            
            # Estratégia 3: Query apenas com nome do gene (sem filtro de organela)
            basic_query = f"{base_query} AND \"{gene_name}\""
            query_strategies.append(("Basic", basic_query))
            
            # Estratégia 4: Query muito simples
            minimal_query = f"\"{species_name}\" AND \"{gene_name}\""
            query_strategies.append(("Minimal", minimal_query))
            
            # Tentar cada estratégia até encontrar resultados
            for strategy_name, query in query_strategies:
                try:
                    if verbose:
                        logging.debug(f"NCBI - {species_name} Trying {strategy_name} strategy: {query[:100]}...")
                    
                    # Buscar sequências
                    search_handle = await asyncio.to_thread(
                        Entrez.esearch,
                        db="nucleotide",
                        term=query,
                        retmax=10000
                    )
                    search_result = Entrez.read(search_handle)
                    search_handle.close()
                    
                    id_list = search_result.get('IdList', [])
                    
                    if id_list:
                        if verbose:
                            logging.info(f"NCBI - {species_name} Found {len(id_list)} sequences for gene '{gene_name}' using {strategy_name} strategy")
                        return id_list
                    else:
                        if verbose:
                            logging.debug(f"NCBI - {species_name} No results with {strategy_name} strategy")
                
                except Exception as e:
                    if verbose:
                        logging.debug(f"NCBI - {species_name} Error with {strategy_name} strategy: {e}")
                    continue
            
            # Se chegou aqui, nenhuma estratégia funcionou
            if verbose:
                logging.warning(f"NCBI - {species_name} No sequences found for gene '{gene_name}' with any strategy")
            
            return []
            
    except Exception as e:
        if verbose:
            logging.error(f"NCBI - {species_name} Error searching for gene '{gene_name}': {e}")
        return []

async def download_ncbi_sequences(**kwargs):
    """Download sequences from NCBI and organize by species and gene."""
    species_list = kwargs.get('species_list', [])
    gene_list = kwargs.get('gene_list', ['COI'])
    email = kwargs.get('email')
    api_key = kwargs.get('api_key')
    output_folder = kwargs.get('output_folder', ".")
    verbose = kwargs.get('verbose', True)
    max_concurrent = kwargs.get('max_concurrent', 3)
    
    if not species_list:
        if verbose:
            logging.warning("NCBI - No species list provided for sequence download")
        return
    
    if verbose:
        logging.info(f"NCBI - Starting sequence download for {len(species_list)} species and {len(gene_list)} genes")
    
    # Carregar API keys se não fornecidas
    if not email or not api_key:
        api_keys = load_api_keys(verbose=False)
        if not email:
            email = api_keys.get('ncbi_email')
        if not api_key:
            api_key = api_keys.get('ncbi_api_key')
    
    if not email:
        if verbose:
            logging.error("NCBI - Email is required for sequence download")
        return
    
    # Configurar delay baseado na disponibilidade da API key
    has_api_key = bool(api_key)
    rate_delay = get_rate_limit_delay(has_api_key=has_api_key, api_name='ncbi')
    
    # Criar estrutura de diretórios
    sequences_dir = os.path.join(output_folder, "NCBI_Sequences")
    create_folder(folder_name=sequences_dir, verbose=verbose)
    
    # Semáforo para controlar concorrência
    semaphore = asyncio.Semaphore(max_concurrent)
    
    # Buscar sequências para todos os genes e espécies
    all_sequence_ids = []
    gene_species_map = {}
    
    for gene_name in gene_list:
        if verbose:
            logging.info(f"NCBI - Searching for gene '{gene_name}' across all species")
        
        gene_tasks = []
        for species in species_list:
            task = asyncio.create_task(
                ncbi_gene_search(
                    species_name=species,
                    gene_name=gene_name,
                    email=email,
                    api_key=api_key,
                    verbose=False,  # Reduzir verbosidade durante busca em lote
                    semaphore=semaphore
                )
            )
            gene_tasks.append(task)
        
        # Aguardar resultados para este gene
        gene_results = await asyncio.gather(*gene_tasks, return_exceptions=True)
        
        gene_sequences_found = 0
        for i, result in enumerate(gene_results):
            if isinstance(result, Exception):
                if verbose:
                    logging.error(f"NCBI - Error processing {species_list[i]} for gene {gene_name}: {result}")
                continue
            
            if result:
                for seq_id in result:
                    if seq_id not in all_sequence_ids:
                        all_sequence_ids.append(seq_id)
                        gene_species_map[seq_id] = {
                            'gene': gene_name,
                            'species': species_list[i]
                        }
                        gene_sequences_found += 1
        
        if verbose:
            logging.info(f"NCBI - Found {gene_sequences_found} sequences for gene '{gene_name}' across all species")
    
    if not all_sequence_ids:
        if verbose:
            logging.warning("NCBI - No sequences found for download")
        return
    
    if verbose:
        logging.info(f"NCBI - Found {len(all_sequence_ids)} total sequences to download")
    
    # Download das sequências
    downloaded_count = 0
    error_count = 0
    
    for i, seq_id in enumerate(all_sequence_ids):
        try:
            gene_info = gene_species_map.get(seq_id, {'gene': 'unknown', 'species': 'unknown'})
            
            if verbose and (i + 1) % 50 == 0:
                logging.info(f"NCBI - Downloading sequence {i + 1}/{len(all_sequence_ids)} (ID: {seq_id})")
            
            # URL para download da sequência em formato GenBank
            url = f"https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=gbwithparts&id={seq_id}&withparts=on"
            
            response = requests.get(url, stream=True, timeout=30)
            
            if response.status_code == 200:
                # Salvar arquivo temporário
                temp_file = os.path.join(sequences_dir, f"temp_{seq_id}.gb")
                with open(temp_file, "wb") as f:
                    f.write(response.content)
                
                # Processar arquivo GenBank
                try:
                    records_processed = 0
                    for record in SeqIO.parse(temp_file, 'genbank'):
                        # Extrair informações
                        voucher = record.id
                        organism = record.annotations.get("organism", "Unknown")
                        
                        # Limpar nome da espécie para criar pasta
                        clean_organism = re.sub(r'[^A-Za-z0-9\s]+', '_', organism)
                        clean_organism = re.sub(r'\s+', '_', clean_organism)
                        
                        # Criar estrutura de diretórios: NCBI_Sequences/Species/Gene/
                        species_dir = os.path.join(sequences_dir, clean_organism)
                        gene_dir = os.path.join(species_dir, gene_info['gene'])
                        create_folder(folder_name=gene_dir, verbose=False)
                        
                        # Salvar sequência em formato FASTA
                        fasta_file = os.path.join(gene_dir, f"{gene_info['gene']}.fasta")
                        with open(fasta_file, "a+", encoding='utf-8') as f:
                            f.write(f">{voucher}_{organism}\n{record.seq}\n")
                        
                        downloaded_count += 1
                        records_processed += 1
                    
                    if records_processed == 0:
                        if verbose:
                            logging.debug(f"NCBI - No valid records found in GenBank file for {seq_id}")
                        error_count += 1
                
                except Exception as e:
                    if verbose:
                        logging.debug(f"NCBI - Error processing GenBank file for {seq_id}: {e}")
                    error_count += 1
                
                # Remover arquivo temporário
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    
            else:
                if verbose:
                    logging.debug(f"NCBI - Error downloading sequence {seq_id}: HTTP {response.status_code}")
                error_count += 1
                    
        except Exception as e:
            if verbose:
                logging.debug(f"NCBI - Error downloading sequence {seq_id}: {e}")
            error_count += 1
        
        # Rate limiting entre downloads
        await asyncio.sleep(rate_delay)
    
    if verbose:
        logging.info(f"NCBI - Sequence download completed: {downloaded_count} sequences downloaded successfully")
        if error_count > 0:
            logging.info(f"NCBI - {error_count} sequences had issues during download")
    
    # Criar resumo dos downloads
    summary_file = os.path.join(sequences_dir, "download_summary.txt")
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write(f"NCBI Sequence Download Summary\n")
        f.write(f"Download completed on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total sequences downloaded: {downloaded_count}\n")
        f.write(f"Failed downloads: {error_count}\n")
        f.write(f"Genes searched: {', '.join(gene_list)}\n")
        f.write(f"Species processed: {len(species_list)}\n\n")
        
        # Estatísticas por gene
        gene_stats = {}
        for seq_id, info in gene_species_map.items():
            gene = info['gene']
            if gene not in gene_stats:
                gene_stats[gene] = 0
            gene_stats[gene] += 1
        
        f.write("Sequences found per gene:\n")
        for gene, count in gene_stats.items():
            f.write(f"  {gene}: {count} sequences\n")

async def get_ncbi_data_batch(species_list, **kwargs):
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 1)
    max_concurrent = kwargs.get('max_concurrent', 5)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 10)
    retry_delay = kwargs.get('retry_delay', 5)
    output_folder = kwargs.get('output_folder', ".")
    email = kwargs.get('email')
    api_key = kwargs.get('api_key')
    download_sequences = kwargs.get('download_sequences', False)
    gene_list = kwargs.get('gene_list', ['COI'])
    
    if verbose:
        logging.info(f"NCBI - Starting taxonomy lookup for {len(species_list)} species...")
    
    # Carregar API keys se não fornecidas
    if not email or not api_key:
        api_keys = load_api_keys(verbose=verbose)
        if not email:
            email = api_keys.get('ncbi_email')
        if not api_key:
            api_key = api_keys.get('ncbi_api_key')
    
    if not email:
        if verbose:
            logging.error("NCBI - Email is required for NCBI API access")
        return pd.DataFrame()

    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def get_taxonomy_with_semaphore(species_name):
        async with semaphore:
            return await ncbi_taxonomy(
                species_name=species_name,
                email=email,
                api_key=api_key,
                time_delay=time_delay,
                verbose=verbose,
                log_to_file=log_to_file,
                max_retries=max_retries,
                retry_delay=retry_delay,
                output_folder=output_folder
            )

    # Executar busca de taxonomia
    tasks = [get_taxonomy_with_semaphore(species) for species in species_list]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    taxonomy_data = []
    
    # Dicionário para armazenar contagens de sequências por espécie e gene
    species_gene_counts = {}
    
    # Verificar se devemos buscar sequências
    should_search_sequences = download_sequences and gene_list and len(gene_list) > 0
    
    if should_search_sequences:
        if verbose:
            logging.info(f"NCBI - Sequence download enabled - Searching sequences for genes: {', '.join(gene_list)}")
        
        for gene_name in gene_list:
            if verbose:
                logging.info(f"NCBI - Searching for gene '{gene_name}' across all species")
            
            gene_tasks = []
            for species in species_list:
                task = asyncio.create_task(
                    ncbi_gene_search(
                        species_name=species,
                        gene_name=gene_name,
                        email=email,
                        api_key=api_key,
                        verbose=False,  # Reduzir verbosidade durante busca em lote
                        semaphore=semaphore
                    )
                )
                gene_tasks.append(task)
            
            # Aguardar resultados para este gene
            gene_results = await asyncio.gather(*gene_tasks, return_exceptions=True)
            
            for i, result in enumerate(gene_results):
                species_name = species_list[i]
                
                if species_name not in species_gene_counts:
                    species_gene_counts[species_name] = {}
                
                if isinstance(result, Exception):
                    species_gene_counts[species_name][gene_name] = 0
                    if verbose:
                        logging.error(f"NCBI - Error processing {species_name} for gene {gene_name}: {result}")
                else:
                    sequence_count = len(result) if result else 0
                    species_gene_counts[species_name][gene_name] = sequence_count
                    
                    if verbose and sequence_count > 0:
                        logging.debug(f"NCBI - {species_name} found {sequence_count} sequences for gene '{gene_name}'")
    else:
        if verbose:
            if not download_sequences:
                logging.info("NCBI - Sequence download disabled")
            elif not gene_list or len(gene_list) == 0:
                logging.info("NCBI - No genes list provided - skipping sequence search")
            else:
                logging.info("NCBI - Sequence search not requested")
    
    # Processar resultados de taxonomia e adicionar dados de genes
    for i, result in enumerate(results):
        species_name = species_list[i]
        
        if isinstance(result, Exception):
            if verbose:
                logging.error(f"NCBI - Error processing species '{species_name}': {result}")
            
            # Criar entrada básica para espécie com erro
            record_dict = {
                'TaxID': '-',
                'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 
                'Genus': species_name.split(' ')[0] if ' ' in species_name else species_name, 
                'Species Name': species_name,
                'Scientific Name': '-', 'Rank': '-'
            }
        else:
            if result and len(result) > 1:
                data_parts = result[1].split(';')
                
                record_dict = {
                    'TaxID': data_parts[0] if len(data_parts) > 0 else '-',
                    'Kingdom': data_parts[1] if len(data_parts) > 1 else '-',
                    'Phylum': data_parts[2] if len(data_parts) > 2 else '-',
                    'Class': data_parts[3] if len(data_parts) > 3 else '-',
                    'Order': data_parts[4] if len(data_parts) > 4 else '-',
                    'Family': data_parts[5] if len(data_parts) > 5 else '-',
                    'Genus': data_parts[6] if len(data_parts) > 6 else species_name.split(' ')[0] if ' ' in species_name else species_name,
                    'Species Name': data_parts[7] if len(data_parts) > 7 else species_name,
                    'Scientific Name': data_parts[8] if len(data_parts) > 8 else '-',
                    'Rank': data_parts[9] if len(data_parts) > 9 else '-'
                }
            else:
                # Adicionar entrada vazia se não houver resultado válido
                record_dict = {
                    'TaxID': '-',
                    'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 
                    'Genus': species_name.split(' ')[0] if ' ' in species_name else species_name, 
                    'Species Name': species_name,
                    'Scientific Name': '-', 'Rank': '-'
                }
        
        # Adicionar colunas para cada gene pesquisado (apenas se sequências foram buscadas)
        if should_search_sequences:
            for gene_name in gene_list:
                gene_count = species_gene_counts.get(species_name, {}).get(gene_name, 0)
                record_dict[f'{gene_name}_Sequences'] = gene_count
            
            # Adicionar coluna com total de sequências
            total_sequences = sum(species_gene_counts.get(species_name, {}).values())
            record_dict['Total_Sequences'] = total_sequences
            
            # Adicionar coluna com lista de genes pesquisados
            record_dict['Genes_Searched'] = ', '.join(gene_list)
        
        taxonomy_data.append(record_dict)
    
    # Download de sequências se solicitado
    if should_search_sequences:
        await download_ncbi_sequences(
            species_list=species_list,
            gene_list=gene_list,
            email=email,
            api_key=api_key,
            output_folder=output_folder,
            verbose=verbose,
            max_concurrent=3
        )
    
    # Definir ordem das colunas
    base_columns = [
        'TaxID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 
        'Scientific Name', 'Rank'
    ]
    
    # Adicionar colunas de genes apenas se sequências foram buscadas
    if should_search_sequences:
        gene_columns = [f'{gene}_Sequences' for gene in gene_list]
        summary_columns = ['Total_Sequences', 'Genes_Searched']
        column_order = base_columns + gene_columns + summary_columns
    else:
        column_order = base_columns
    
    df_taxonomy = pd.DataFrame(taxonomy_data)
    if not df_taxonomy.empty:
        df_taxonomy = df_taxonomy.reindex(columns=column_order)
        df_taxonomy['sort_key'] = df_taxonomy.apply(
            lambda row: (
                0 if row['Family'] != '-' else 1,
                0 if row['Genus'] != '-' else 1,
                0 if row['Species Name'] != '-' else 1,
                row['Family'] if row['Family'] != '-' else 'zzz',
                row['Genus'] if row['Genus'] != '-' else 'zzz',
                row['Species Name'] if row['Species Name'] != '-' else 'zzz'
            ), axis=1
        )
        df_taxonomy = df_taxonomy.sort_values('sort_key').drop('sort_key', axis=1)

    if verbose:
        successful_records = len(df_taxonomy[df_taxonomy['TaxID'] != '-'])
        total_species = len(species_list)
        logging.info(f"NCBI - Taxonomy lookup completed: {successful_records}/{total_species} species found")
        
        if should_search_sequences:
            total_sequences = df_taxonomy['Total_Sequences'].sum() if 'Total_Sequences' in df_taxonomy.columns else 0
            logging.info(f"NCBI - Gene search completed: {total_sequences} total sequences found")
            
            # Log estatísticas por gene
            for gene in gene_list:
                gene_col = f'{gene}_Sequences'
                if gene_col in df_taxonomy.columns:
                    gene_total = df_taxonomy[gene_col].sum()
                    species_with_gene = len(df_taxonomy[df_taxonomy[gene_col] > 0])
                    logging.info(f"NCBI - Gene {gene}: {gene_total} sequences found in {species_with_gene} species")
    
    return df_taxonomy