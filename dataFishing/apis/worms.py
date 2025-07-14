import asyncio
import logging
import os
import time
import aiohttp
import pandas as pd

async def worms_taxonomy(**kwargs):
    species_name = kwargs.get('species_name', 'Rhinella marina')
    time_delay = kwargs.get('time_delay', 1)
    verbose = kwargs.get('verbose', True)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 2)
    output_folder = kwargs.get('output_folder', ".") 
    log_file = os.path.join(output_folder, 'WoRMSLog.txt')
    data_dict = {
        'AphiaID': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': species_name.split(' ')[0],
        'Species Name': species_name,
        'Authority': '-',
        'Valid Species Name': '-',
        'Valid Authority': '-',
        'Status': '-',
        'Marine': '-',
        'Brackish': '-',
        'Freshwater': '-',
        'Terrestrial': '-',
        'Extinct': '-',
        'Match Type': '-',
        'Modified': '-',
        'URL': '-',
        'Citation': '-'
    }
    
    error_messages = {
        404: f"Taxonomy of '{species_name}' not found in WoRMS",
        500: "Internal Server Error",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        405: "Method Not Allowed",
        502: "Bad Gateway"
    }
    
    worms_result = [species_name]
    if time_delay > 0:
        await asyncio.sleep(time_delay)
    if verbose:
        logging.info(f"🌊 WoRMS - {species_name} Getting taxonomy from WoRMS...")
    
    url = f"https://www.marinespecies.org/rest/AphiaRecordsByName/{species_name}?like=false&marine_only=false&offset=1"
    
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            ) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        if len(data) > 0:
                            record = data[0]
                            data_dict['AphiaID'] = str(record.get('AphiaID', '-'))
                            data_dict['Kingdom'] = str(record.get('kingdom', '-'))
                            data_dict['Phylum'] = str(record.get('phylum', '-'))
                            data_dict['Class'] = str(record.get('class', '-'))
                            data_dict['Order'] = str(record.get('order', '-'))
                            data_dict['Family'] = str(record.get('family', '-'))
                            data_dict['Genus'] = str(record.get('genus', species_name.split(' ')[0]))
                            data_dict['Species Name'] = str(record.get('scientificname', species_name))
                            data_dict['Authority'] = str(record.get('authority', '-'))
                            data_dict['Valid Species Name'] = str(record.get('valid_name', '-'))
                            data_dict['Valid Authority'] = str(record.get('valid_authority', '-'))
                            data_dict['Status'] = str(record.get('status', '-'))
                            data_dict['Marine'] = 'Yes' if str(record.get('isMarine', '-')) == '1' else 'No'
                            data_dict['Brackish'] = 'Yes' if str(record.get('isBrackish', '-')) == '1' else 'No'
                            data_dict['Freshwater'] = 'Yes' if str(record.get('isFreshwater', '-')) == '1' else 'No'
                            data_dict['Terrestrial'] = 'Yes' if str(record.get('isTerrestrial', '-')) == '1' else 'No'
                            data_dict['Extinct'] = 'Yes' if str(record.get('isExtinct', '-')) == '1' else 'No'
                            data_dict['Match Type'] = str(record.get('match_type', '-'))
                            data_dict['Modified'] = str(record.get('modified', '-'))
                            data_dict['URL'] = str(record.get('url', '-'))
                            data_dict['Citation'] = str(record.get('citation', '-'))
                            
                            # Status adicional para logs
                            status_info = f"Status: {data_dict['Status']}"
                            environments = []
                            if data_dict['Marine'] == 'Yes':
                                environments.append('Marine')
                            if data_dict['Brackish'] == 'Yes':
                                environments.append('Brackish')
                            if data_dict['Freshwater'] == 'Yes':
                                environments.append('Freshwater')
                            if data_dict['Terrestrial'] == 'Yes':
                                environments.append('Terrestrial')
                            env_info = f"Environments: {', '.join(environments) if environments else 'None'}"
                            
                            if verbose:
                                logging.info(f"🌊 WoRMS - {species_name} Found in WoRMS: AphiaID={data_dict['AphiaID']}, {status_info}, {env_info}")
                            if log_to_file:
                                log_message = f"🌊 WoRMS - {species_name} Found: AphiaID={data_dict['AphiaID']}, {status_info}, {env_info}"
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - INFO - {log_message}\n")
                            break
                        else:
                            if verbose:
                                logging.warning(f"🌊 WoRMS - {species_name} No results found in WoRMS")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - 🌊 WoRMS - {species_name} No results found in WoRMS\n")
                            break
                    else:
                        error_msg = error_messages.get(response.status, 'Unknown Error')
                        if attempt < max_retries - 1:
                            if verbose:
                                logging.warning(f"🌊 WoRMS - {species_name} Error {response.status} - {error_msg}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                            await asyncio.sleep(retry_delay)
                        else:
                            if verbose:
                                logging.error(f"🌊 WoRMS - {species_name} Error {response.status} - {error_msg}. Max retries exceeded")  
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - 🌊 WoRMS - {species_name} Error {response.status} - {error_msg}\n")
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"🌊 WoRMS - {species_name} Request timeout. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"🌊 WoRMS - {species_name} Request timeout. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - 🌊 WoRMS - {species_name} Request timeout. Max retries exceeded\n")
        except Exception as e:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"🌊 WoRMS - {species_name} Connection error: {e}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"🌊 WoRMS - {species_name} Connection error: {e}. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - 🌊 WoRMS - {species_name} Connection error: {e}. Max retries exceeded\n")
    
    worms_result.append(';'.join(data_dict.values()))
    return worms_result

async def get_worms_data_batch(species_list, **kwargs):
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 1)
    max_concurrent = kwargs.get('max_concurrent', 5)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 10)
    retry_delay = kwargs.get('retry_delay', 5)
    output_folder = kwargs.get('output_folder', ".")
    
    if verbose:
        logging.info(f"🌊 WoRMS - Starting taxonomy lookup for {len(species_list)} species...")

    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def get_taxonomy_with_semaphore(species_name):
        async with semaphore:
            return await worms_taxonomy(
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
                logging.error(f"WoRMS - Error processing species '{species_list[i]}': {result}")
            taxonomy_data.append({
                'AphiaID': '-',
                'Kingdom': '-', 'Phylum': '-', 'Class': '-', 'Order': '-', 'Family': '-', 'Genus': species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i], 'Species Name': species_list[i],
                'Authority': '-',
                'Valid Species Name': '-',
                'Valid Authority': '-',
                'Status': '-',
                'Marine': '-',
                'Brackish': '-',
                'Freshwater': '-',
                'Terrestrial': '-',
                'Extinct': '-',
                'Match Type': '-',
                'Modified': '-',
                'URL': '-',
                'Citation': '-'
                    })
        else:
            if len(result) > 1:
                data_parts = result[1].split(';')
                
                record_dict = {
                    'AphiaID': data_parts[0] if len(data_parts) > 0 else '-',
                    'Kingdom': data_parts[1] if len(data_parts) > 1 else '-',
                    'Phylum': data_parts[2] if len(data_parts) > 2 else '-',
                    'Class': data_parts[3] if len(data_parts) > 3 else '-',
                    'Order': data_parts[4] if len(data_parts) > 4 else '-',
                    'Family': data_parts[5] if len(data_parts) > 5 else '-',
                    'Genus': data_parts[6] if len(data_parts) > 6 else species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i],
                    'Species Name': data_parts[7] if len(data_parts) > 7 else species_list[i],
                    'Authority': data_parts[8] if len(data_parts) > 8 else '-',
                    'Valid Species Name': data_parts[9] if len(data_parts) > 9 else '-',
                    'Valid Authority': data_parts[10] if len(data_parts) > 10 else '-',
                    'Status': data_parts[11] if len(data_parts) > 11 else '-',
                    'Marine': data_parts[12] if len(data_parts) > 12 else '-',
                    'Brackish': data_parts[13] if len(data_parts) > 13 else '-',
                    'Freshwater': data_parts[14] if len(data_parts) > 14 else '-',
                    'Terrestrial': data_parts[15] if len(data_parts) > 15 else '-',
                    'Extinct': data_parts[16] if len(data_parts) > 16 else '-',
                    'Match Type': data_parts[17] if len(data_parts) > 17 else '-',
                    'Modified': data_parts[18] if len(data_parts) > 18 else '-',
                    'URL': data_parts[19] if len(data_parts) > 19 else '-',
                    'Citation': data_parts[20] if len(data_parts) > 20 else '-'
                }
                taxonomy_data.append(record_dict)
    
    column_order = [
        'AphiaID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 'Authority', 'Valid Species Name',
        'Valid Authority', 'Status', 'Marine', 'Brackish', 'Freshwater', 'Terrestrial', 'Extinct',
        'Match Type', 'Modified', 'URL', 'Citation'
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
        successful_records = len(df_taxonomy[df_taxonomy['AphiaID'] != '-'])
        total_species = len(species_list)
        logging.info(f"🌊 WoRMS - Taxonomy lookup completed: {successful_records}/{total_species} species found")
    return df_taxonomy