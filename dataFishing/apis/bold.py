import asyncio
import logging
import time
import aiohttp
import pandas as pd
import os
import re
import json
from datetime import datetime
from Bio import SeqIO
import io

async def bold_system_data(taxid, verbose=True):
    """Get detailed taxonomy data from BOLD Systems using taxonomic ID."""
    data_dict = {
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': '-',
        'Species': '-'
    }
    
    error_messages = {
        404: f"Taxonomy ID '{taxid}' not found in BOLD Systems",
        500: "Internal Server Error",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        405: "Method Not Allowed",
        502: "Bad Gateway"
    }
    
    url = f"http://v3.boldsystems.org/index.php/API_Tax/TaxonData?taxId={taxid}&dataTypes=basic&includeTree=true"
    
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    tax_data = await response.json(content_type=None)
                    if tax_data:
                        for key, value in tax_data.items():
                            rank = value.get('tax_rank', '').lower()
                            taxon = value.get('taxon', '-')
                            
                            if rank == 'species':
                                data_dict['Species'] = taxon
                            elif rank == 'genus':
                                data_dict['Genus'] = taxon
                            elif rank == 'family':
                                data_dict['Family'] = taxon
                            elif rank == 'order':
                                data_dict['Order'] = taxon
                            elif rank == 'class':
                                data_dict['Class'] = taxon
                            elif rank == 'phylum':
                                data_dict['Phylum'] = taxon
                            elif rank == 'kingdom':
                                data_dict['Kingdom'] = taxon
                    return data_dict
                else:
                    error_msg = error_messages.get(response.status, 'Unknown Error')
                    if verbose:
                        logging.error(f"BOLD - Error {response.status} - {error_msg}")
                    return None
    except Exception as e:
        if verbose:
            logging.error(f"BOLD - Connection error getting taxonomy data: {e}")
        return None

def count_fasta_sequences(fasta_text):
    """Count the number of sequences in a FASTA format string."""
    try:
        fasta_io = io.StringIO(fasta_text)
        sequences = list(SeqIO.parse(fasta_io, "fasta"))
        return len(sequences)
    except Exception as e:
        logging.error(f"Error counting FASTA sequences: {e}")
        return 0

async def bold_sequences_data(species_name, verbose=True, download_sequences=False, output_folder="."):
    """Get sequence data from BOLD Systems for a species."""
    sequences_data = []
    sequence_count = 0
    
    if not download_sequences:
        return sequences_data, sequence_count
    
    # Clean species name for filename
    clean_name = re.sub(r'[^\w\s-]', '', species_name).strip()
    clean_name = re.sub(r'[-\s]+', '_', clean_name)
    
    # Create directory structure
    base_dir = os.path.join(output_folder, "BOLD_Sequences")
    genus = species_name.split(' ')[0] if ' ' in species_name else species_name
    genus_dir = os.path.join(base_dir, genus)
    species_dir = os.path.join(genus_dir, clean_name)
    
    os.makedirs(species_dir, exist_ok=True)
    
    # Get sequences from BOLD
    url = f"http://v3.boldsystems.org/index.php/API_Public/sequence?taxon={species_name}&format=json"
    
    
    try:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=60)) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    # Verificar o conteúdo antes de tentar analisá-lo como JSON
                    text_content = await response.text()
                    
                    # Se o conteúdo estiver vazio ou for apenas "[]", não há sequências disponíveis
                    if not text_content or text_content == "[]" or text_content.strip() == "":
                        if verbose:
                            logging.warning(f"BOLD - {species_name} No sequences available")
                        return sequences_data, 0
                    
                    # Tentar converter para JSON com tratamento de erros específico
                    try:
                        data = json.loads(text_content)
                    except json.JSONDecodeError:
                        if verbose:
                            logging.warning(f"BOLD - {species_name} Response is not valid JSON. Checking for FASTA format...")
                        
                        # Se não for JSON, pode ser que seja FASTA ou outro formato
                        if text_content.startswith(">"):
                            # Contar as sequências no arquivo FASTA
                            sequence_count = count_fasta_sequences(text_content)
                            
                            # Provavelmente é formato FASTA
                            filename = f"{clean_name}_raw.fasta"
                            filepath = os.path.join(species_dir, filename)
                            
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(text_content)
                            
                            if verbose:
                                logging.info(f"BOLD - {species_name} Saved raw FASTA data with {sequence_count} sequences")
                            
                            # Criar um único registro para representar os dados brutos
                            sequences_data.append({
                                'sequence_id': 'raw_data',
                                'specimen_id': 'unknown',
                                'sequence': 'raw_fasta_file_saved',
                                'country': 'Unknown',
                                'province': 'Unknown',
                                'collection_date': 'Unknown',
                                'collectors': 'Unknown',
                                'institution': 'Unknown',
                                'lat': 'Unknown',
                                'lon': 'Unknown',
                                'marker': 'Unknown'
                            })
                            return sequences_data, sequence_count
                        else:
                            # Não é JSON nem FASTA
                            if verbose:
                                logging.warning(f"BOLD - {species_name} Response is not in a recognized format")
                            return sequences_data, 0
                    
                    # Se chegou aqui, temos JSON válido
                    if data and len(data) > 0:
                        sequences_by_marker = {}
                        
                        for record in data:
                            marker = record.get('markercode', 'Unknown')
                            if marker not in sequences_by_marker:
                                sequences_by_marker[marker] = []
                            
                            # Extract metadata
                            sequence_id = record.get('processid', 'Unknown')
                            specimen_id = record.get('sampleid', 'Unknown')
                            sequence = record.get('nucleotides', '')
                            country = record.get('country', 'Unknown')
                            province = record.get('province_state', 'Unknown')
                            collection_date = record.get('collection_date', 'Unknown')
                            collectors = record.get('collectors', 'Unknown')
                            institution = record.get('institution_storing', 'Unknown')
                            lat = record.get('lat', 'Unknown')
                            lon = record.get('lon', 'Unknown')
                            
                            if sequence:
                                sequences_by_marker[marker].append({
                                    'sequence_id': sequence_id,
                                    'specimen_id': specimen_id,
                                    'sequence': sequence,
                                    'country': country,
                                    'province': province,
                                    'collection_date': collection_date,
                                    'collectors': collectors,
                                    'institution': institution,
                                    'lat': lat,
                                    'lon': lon,
                                    'marker': marker
                                })
                        
                        # Write FASTA files for each marker
                        total_sequences = 0
                        for marker, sequences in sequences_by_marker.items():
                            if sequences:
                                filename = f"{clean_name}_{marker}.fasta"
                                filepath = os.path.join(species_dir, filename)
                                
                                with open(filepath, 'w', encoding='utf-8') as f:
                                    for seq_data in sequences:
                                        header = f">{seq_data['sequence_id']}|{seq_data['specimen_id']}|{species_name}|{marker}|{seq_data['country']}|{seq_data['province']}|{seq_data['collection_date']}|{seq_data['collectors']}|{seq_data['institution']}|{seq_data['lat']}|{seq_data['lon']}"
                                        f.write(f"{header}\n")
                                        f.write(f"{seq_data['sequence']}\n")
                                        total_sequences += 1
                                
                                sequences_data.extend(sequences)
                        
                        sequence_count = total_sequences
                        
                        if verbose and total_sequences > 0:
                            logging.info(f"BOLD - {species_name} Downloaded {total_sequences} sequences across {len(sequences_by_marker)} markers")
                        
                        # Create summary file
                        summary_file = os.path.join(species_dir, f"{clean_name}_summary.txt")
                        with open(summary_file, 'w', encoding='utf-8') as f:
                            f.write(f"BOLD Sequences Summary for {species_name}\n")
                            f.write(f"Downloaded on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                            f.write(f"Total sequences: {total_sequences}\n")
                            f.write(f"Markers found: {', '.join(sequences_by_marker.keys())}\n\n")
                            
                            for marker, sequences in sequences_by_marker.items():
                                f.write(f"\n{marker}: {len(sequences)} sequences\n")
                                countries = set(seq['country'] for seq in sequences if seq['country'] != 'Unknown')
                                if countries:
                                    f.write(f"Countries: {', '.join(sorted(countries))}\n")
                
                elif response.status == 404:
                    if verbose:
                        logging.warning(f"BOLD - {species_name} No sequences found")
                else:
                    if verbose:
                        logging.error(f"BOLD - {species_name} Error {response.status} getting sequences")
                        
    except Exception as e:
        if verbose:
            logging.error(f"BOLD - {species_name} Error downloading sequences: {e}")
    
    return sequences_data, sequence_count

async def bold_taxonomy(**kwargs):
    species_name = kwargs.get('species_name', 'Rhinella marina')
    time_delay = kwargs.get('time_delay', 1)
    verbose = kwargs.get('verbose', True)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 2)
    download_sequences = kwargs.get('download_sequences', False)
    output_folder = kwargs.get('output_folder', ".")
    
    data_dict = {
        'TaxID': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': species_name.split(' ')[0],
        'Species Name': species_name,
        'Sequences_Count': '0',
    }
    
    error_messages = {
        404: f"Taxonomy of '{species_name}' not found in BOLD Systems",
        500: "Internal Server Error",
        503: "Service Unavailable - BOLD Systems server is temporarily down",
        504: "Gateway Timeout",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        405: "Method Not Allowed",
        502: "Bad Gateway"
    }
    
    log_file = os.path.join(output_folder, 'BOLDLog.txt')
    
    bold_result = [species_name]
    if time_delay > 0:
        await asyncio.sleep(time_delay)
    if verbose:
        logging.info(f"BOLD - {species_name} Getting taxonomy from BOLD Systems...")
    
    url = f"http://v3.boldsystems.org/index.php/API_Tax/TaxonSearch?taxName={species_name}"
    
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            ) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json(content_type=None)
                        if data and len(data) > 0:
                            # Extract the taxid from the response
                            taxid = None
                            for key, value in data.items():
                                if 'taxid' in value:
                                    taxid = value['taxid']
                                    break
                            
                            if taxid:
                                # Get detailed taxonomy data
                                tax_data = await bold_system_data(taxid, verbose)
                                if tax_data:
                                    data_dict['TaxID'] = str(taxid)
                                    data_dict['Kingdom'] = str(tax_data.get('Kingdom', '-'))
                                    data_dict['Phylum'] = str(tax_data.get('Phylum', '-'))
                                    data_dict['Class'] = str(tax_data.get('Class', '-'))
                                    data_dict['Order'] = str(tax_data.get('Order', '-'))
                                    data_dict['Family'] = str(tax_data.get('Family', '-'))
                                    data_dict['Genus'] = str(tax_data.get('Genus', species_name.split(' ')[0]))
                                    data_dict['Species Name'] = str(tax_data.get('Species', species_name))
                                    
                                    # Download sequences if requested
                                    sequences_data, sequence_count = await bold_sequences_data(
                                        species_name, 
                                        verbose, 
                                        download_sequences,
                                        output_folder
                                    )
                                    
                                    if sequence_count > 0:
                                        data_dict['Sequences_Count'] = str(sequence_count)
                                    
                                    taxonomy_info = f"Kingdom: {data_dict['Kingdom']}, Family: {data_dict['Family']}"
                                    sequence_info = f"Sequences: {data_dict['Sequences_Count']}"
                                    
                                    if verbose:
                                        logging.info(f"BOLD - {species_name} Found in BOLD Systems: TaxID={data_dict['TaxID']}, {taxonomy_info}, {sequence_info}")
                                    if log_to_file:
                                        log_message = f"BOLD - {species_name} Found: TaxID={data_dict['TaxID']}, {taxonomy_info}, {sequence_info}"
                                        with open(log_file, 'a+', encoding='utf-8') as f:
                                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - INFO - {log_message}\n")
                                    break
                            else:
                                if verbose:
                                    logging.warning(f"BOLD - {species_name} No taxonomy ID found in BOLD Systems")
                                if log_to_file:
                                    with open(log_file, 'a+', encoding='utf-8') as f:
                                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - BOLD - {species_name} No taxonomy ID found in BOLD Systems\n")
                                break
                        else:
                            if verbose:
                                logging.warning(f"BOLD - {species_name} No results found in BOLD Systems")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - BOLD - {species_name} No results found in BOLD Systems\n")
                            break
                    else:
                        error_msg = error_messages.get(response.status, 'Unknown Error')
                        
                        # Para erro 503, aumentar o delay de retry
                        current_retry_delay = retry_delay * 2 if response.status == 503 else retry_delay
                        
                        if attempt < max_retries - 1:
                            if verbose:
                                logging.warning(f"BOLD - {species_name} Error {response.status} - {error_msg}. Retrying in {current_retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                            await asyncio.sleep(current_retry_delay)
                        else:
                            if verbose:
                                logging.error(f"BOLD - {species_name} Error {response.status} - {error_msg}. Max retries exceeded")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - BOLD - {species_name} Error {response.status} - {error_msg}\n")
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"BOLD - {species_name} Request timeout. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"BOLD - {species_name} Request timeout. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - BOLD - {species_name} Request timeout. Max retries exceeded\n")
        except Exception as e:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"BOLD - {species_name} Connection error: {e}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"BOLD - {species_name} Connection error: {e}. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - BOLD - {species_name} Connection error: {e}. Max retries exceeded\n")
    
    bold_result.append(';'.join(data_dict.values()))
    return bold_result

async def get_bold_data_batch(species_list, **kwargs):
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 1)
    max_concurrent = kwargs.get('max_concurrent', 5)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 10)
    retry_delay = kwargs.get('retry_delay', 5)
    download_sequences = kwargs.get('download_sequences', False)
    output_folder = kwargs.get('output_folder', ".")
    
    if verbose:
        logging.info(f"BOLD - Starting taxonomy lookup for {len(species_list)} species...")
        if download_sequences:
            bold_sequences_dir = os.path.join(output_folder, "BOLD_Sequences")
            logging.info(f"BOLD - Sequence download enabled - files will be saved to {bold_sequences_dir}/")
            # Criar diretório raiz se não existir
            if not os.path.exists(bold_sequences_dir):
                os.makedirs(bold_sequences_dir, exist_ok=True)
                logging.info(f"BOLD - Created directory: {bold_sequences_dir}/")

    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def get_taxonomy_with_semaphore(species_name):
        async with semaphore:
            return await bold_taxonomy(
                species_name=species_name,
                time_delay=time_delay,
                verbose=verbose,
                log_to_file=log_to_file,
                max_retries=max_retries,
                retry_delay=retry_delay,
                download_sequences=download_sequences,
                output_folder=output_folder
            )

    tasks = [get_taxonomy_with_semaphore(species) for species in species_list]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    taxonomy_data = []
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            if verbose:
                logging.error(f"BOLD - Error processing species '{species_list[i]}': {result}")
            taxonomy_data.append({
                'TaxID': '-',
                'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 
                'Genus': species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i], 
                'Species Name': species_list[i],
                'Sequences_Count': '0',
            })
        else:
            if len(result) > 1:
                data_parts = result[1].split(';')
                
                record_dict = {
                    'TaxID': data_parts[0] if len(data_parts) > 0 else '-',
                    'Kingdom': data_parts[1] if len(data_parts) > 1 else '-',
                    'Phylum': data_parts[2] if len(data_parts) > 2 else '-',
                    'Class': data_parts[3] if len(data_parts) > 3 else '-',
                    'Order': data_parts[4] if len(data_parts) > 4 else '-',
                    'Family': data_parts[5] if len(data_parts) > 5 else '-',
                    'Genus': data_parts[6] if len(data_parts) > 6 else species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i],
                    'Species Name': data_parts[7] if len(data_parts) > 7 else species_list[i],
                    'Sequences_Count': data_parts[8] if len(data_parts) > 8 else '0',
                }
                taxonomy_data.append(record_dict)
    
    column_order = [
        'TaxID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 
        'Sequences_Count'
    ]
    
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
        total_sequences = df_taxonomy['Sequences_Count'].apply(lambda x: int(x) if x.isdigit() else 0).sum()
        logging.info(f"BOLD - Taxonomy lookup completed: {successful_records}/{total_species} species found")
        if download_sequences and total_sequences > 0:
            logging.info(f"BOLD - Total sequences downloaded: {total_sequences}")
    return df_taxonomy