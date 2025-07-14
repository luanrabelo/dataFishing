import asyncio
import logging
import time
import aiohttp
import pandas as pd
import os

async def gbif_taxonomy(**kwargs):
    species_name = kwargs.get('species_name', 'Rhinella marina')
    time_delay = kwargs.get('time_delay', 1)
    verbose = kwargs.get('verbose', True)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 2)
    output_folder = kwargs.get('output_folder', ".")
    
    data_dict = {
        'Key': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': species_name.split(' ')[0],
        'Species Name': species_name,
        'Scientific Name': '-',
        'Canonical Name': '-',
        'Authorship': '-',
        'Taxonomic Status': '-',
        'Taxon Rank': '-'
    }
    
    error_messages = {
        404: f"Taxonomy of '{species_name}' not found in GBIF",
        500: "Internal Server Error",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        405: "Method Not Allowed",
        502: "Bad Gateway"
    }
    
    log_file = os.path.join(output_folder, 'GBIFLog.txt')
    
    gbif_result = [species_name]
    if time_delay > 0:
        await asyncio.sleep(time_delay)
    if verbose:
        logging.info(f"🌍 GBIF - {species_name} Getting taxonomy from GBIF...")
    
    url = f"https://api.gbif.org/v1/species?name={species_name}"
    
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            ) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'results' in data and len(data['results']) > 0:
                            for record in data['results']:
                                tax_id = record.get('taxonID', "-")
                                if (record.get('taxonomicStatus') == "ACCEPTED" and 
                                    tax_id != "-" and 'gbif:' in str(tax_id)):
                                    
                                    data_dict['Key'] = str(record.get('key', '-'))
                                    data_dict['Kingdom'] = str(record.get('kingdom', '-'))
                                    data_dict['Phylum'] = str(record.get('phylum', '-'))
                                    data_dict['Class'] = str(record.get('class', '-'))
                                    data_dict['Order'] = str(record.get('order', '-'))
                                    data_dict['Family'] = str(record.get('family', '-'))
                                    data_dict['Genus'] = str(record.get('genus', species_name.split(' ')[0]))
                                    data_dict['Species Name'] = str(record.get('species', species_name))
                                    data_dict['Scientific Name'] = str(record.get('scientificName', '-'))
                                    data_dict['Canonical Name'] = str(record.get('canonicalName', '-'))
                                    data_dict['Authorship'] = str(record.get('authorship', '-'))
                                    data_dict['Taxonomic Status'] = str(record.get('taxonomicStatus', '-'))
                                    data_dict['Taxon Rank'] = str(record.get('rank', '-'))
                                    
                                    taxonomy_info = f"Kingdom: {data_dict['Kingdom']}, Family: {data_dict['Family']}"
                                    
                                    if verbose:
                                        logging.info(f"🌍 GBIF - {species_name} Found in GBIF: Key={data_dict['Key']}, {taxonomy_info}")
                                    if log_to_file:
                                        log_message = f"🌍 GBIF - {species_name} Found: Key={data_dict['Key']}, {taxonomy_info}"
                                        with open(log_file, 'a+', encoding='utf-8') as f:
                                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - INFO - {log_message}\n")
                                    break
                            else:
                                if verbose:
                                    logging.warning(f"🌍 GBIF - {species_name} No accepted results found in GBIF")
                                if log_to_file:
                                    with open(log_file, 'a+', encoding='utf-8') as f:
                                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - 🌍 GBIF - {species_name} No accepted results found in GBIF\n")
                            break
                        else:
                            if verbose:
                                logging.warning(f"🌍 GBIF - {species_name} No results found in GBIF")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - 🌍 GBIF - {species_name} No results found in GBIF\n")
                            break
                    else:
                        error_msg = error_messages.get(response.status, 'Unknown Error')
                        if attempt < max_retries - 1:
                            if verbose:
                                logging.warning(f"🌍 GBIF - {species_name} Error {response.status} - {error_msg}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                            await asyncio.sleep(retry_delay)
                        else:
                            if verbose:
                                logging.error(f"🌍 GBIF - {species_name} Error {response.status} - {error_msg}. Max retries exceeded")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - 🌍 GBIF - {species_name} Error {response.status} - {error_msg}\n")
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"🌍 GBIF - {species_name} Request timeout. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"🌍 GBIF - {species_name} Request timeout. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - 🌍 GBIF - {species_name} Request timeout. Max retries exceeded\n")
        except Exception as e:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"🌍 GBIF - {species_name} Connection error: {e}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"🌍 GBIF - {species_name} Connection error: {e}. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - 🌍 GBIF - {species_name} Connection error: {e}. Max retries exceeded\n")
    
    gbif_result.append(';'.join(data_dict.values()))
    return gbif_result

async def get_gbif_data_batch(species_list, **kwargs):
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 1)
    max_concurrent = kwargs.get('max_concurrent', 5)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 10)
    retry_delay = kwargs.get('retry_delay', 5)
    output_folder = kwargs.get('output_folder', ".")
    
    if verbose:
        logging.info(f"🌍 GBIF - Starting taxonomy lookup for {len(species_list)} species...")

    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def get_taxonomy_with_semaphore(species_name):
        async with semaphore:
            return await gbif_taxonomy(
                species_name=species_name,
                time_delay=time_delay,
                verbose=verbose,
                log_to_file=log_to_file,
                max_retries=max_retries,
                retry_delay=retry_delay,
                output_folder=output_folder
            )

    tasks = [get_taxonomy_with_semaphore(species) for species in species_list]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    taxonomy_data = []
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            if verbose:
                logging.error(f"GBIF - Error processing species '{species_list[i]}': {result}")
            taxonomy_data.append({
                'Key': '-',
                'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 
                'Genus': species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i], 
                'Species Name': species_list[i],
                'Scientific Name': '-', 'Canonical Name': '-', 'Authorship': '-', 'Taxonomic Status': '-',
                'Taxon Rank': '-'
            })
        else:
            if len(result) > 1:
                data_parts = result[1].split(';')
                
                record_dict = {
                    'Key': data_parts[0] if len(data_parts) > 0 else '-',
                    'Kingdom': data_parts[1] if len(data_parts) > 1 else '-',
                    'Phylum': data_parts[2] if len(data_parts) > 2 else '-',
                    'Class': data_parts[3] if len(data_parts) > 3 else '-',
                    'Order': data_parts[4] if len(data_parts) > 4 else '-',
                    'Family': data_parts[5] if len(data_parts) > 5 else '-',
                    'Genus': data_parts[6] if len(data_parts) > 6 else species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i],
                    'Species Name': data_parts[7] if len(data_parts) > 7 else species_list[i],
                    'Scientific Name': data_parts[8] if len(data_parts) > 8 else '-',
                    'Canonical Name': data_parts[9] if len(data_parts) > 9 else '-',
                    'Authorship': data_parts[10] if len(data_parts) > 10 else '-',
                    'Taxonomic Status': data_parts[11] if len(data_parts) > 11 else '-',
                    'Taxon Rank': data_parts[12] if len(data_parts) > 12 else '-'
                }
                taxonomy_data.append(record_dict)
    
    column_order = [
        'Key', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 'Scientific Name',
        'Canonical Name', 'Authorship', 'Taxonomic Status', 'Taxon Rank'
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
        successful_records = len(df_taxonomy[df_taxonomy['Key'] != '-'])
        total_species = len(species_list)
        logging.info(f"🌍 GBIF - Taxonomy lookup completed: {successful_records}/{total_species} species found")
    return df_taxonomy