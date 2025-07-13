import asyncio
import logging
import time
import aiohttp
import pandas as pd
import os
import re
from bs4 import BeautifulSoup

def parse_result_text(text: str) -> dict:
    """Analisa o texto bruto de um resultado do ECoF e extrai informações detalhadas."""
    
    # Limpa o texto removendo quebras de linha extras e espaços
    text = " ".join(text.split())
    
    data = {
        'Original_Epithet': '-',
        'Original_Genus': '-',
        'Original_Author_Year': '-',
        'Status': '-',
        'Accepted_Name': '-',
        'Accepted_Author_Year': '-',
        'Family': '-',
        'Subfamily': '-',
        'Type_Locality': '-',
        'Type_Specimens': '-',
        'Habitat': '-',
        'Raw_Text': text
    }

    # --- 1. Extração do Nome Original, Gênero, Autor e Ano ---
    match_original = re.match(r"^([^,]+),\s+([A-Z][a-z]+(?:\s*\(.+?\))?)\s+(.*?)\s+(\d{4}):\d+", text)
    
    if match_original:
        data['Original_Epithet'] = match_original.group(1).strip()
        data['Original_Genus'] = match_original.group(2).strip()
        data['Original_Author_Year'] = f"{match_original.group(3).strip()} {match_original.group(4).strip()}"

    # --- 2. Extração do Status Atual e Nome Válido ---
    match_status = re.search(r"Current status:\s*(.*?)\.", text)
    if match_status:
        status_full = match_status.group(1).strip()
        
        if "Synonym of" in status_full:
            data['Status'] = 'Synonym'
            match_accepted = re.search(r"Synonym of\s+([A-Z][a-z]+\s+[a-z]+)\s+(\(.*?\d{4}\))", status_full)
            if match_accepted:
                data['Accepted_Name'] = match_accepted.group(1).strip()
                data['Accepted_Author_Year'] = match_accepted.group(2).strip()
        
        elif "Valid as" in status_full:
            data['Status'] = 'Valid'
            match_valid = re.search(r"Valid as\s+([A-Z][a-z]+\s+[a-z]+)\s+(\(.*?\d{4}\))", status_full)
            if match_valid:
                data['Accepted_Name'] = match_valid.group(1).strip()
                data['Accepted_Author_Year'] = match_valid.group(2).strip()
        else:
            data['Status'] = 'Uncertain'

    # --- 3. Extração da Família e Subfamília ---
    match_family = re.search(r"([A-Z][a-z]+idae)(?::\s*([A-Z][a-z]+inae))?\.", text)
    if match_family:
        data['Family'] = match_family.group(1)
        if match_family.group(2):
            data['Subfamily'] = match_family.group(2)

    # --- 4. Extração do Habitat ---
    match_habitat = re.search(r"Habitat:\s*(.*?)\.", text)
    if match_habitat:
        data['Habitat'] = match_habitat.group(1).strip()

    # --- 5. Extração da Localidade-Tipo ---
    temp_text = re.sub(r"^.*?ref\. \d+\]", "", text)
    match_locality = re.search(r"\]?\s*(.*?)\.\s*(Syntypes:|Holotype:|Lectotype:|Neotype:|Type catalog:|Based on)", temp_text)
    if match_locality:
        locality = match_locality.group(1).strip()
        if locality and not locality.startswith('•') and '[' not in locality:
             data['Type_Locality'] = locality

    # --- 6. Extração dos Espécimes-Tipo ---
    match_types = re.search(r"(Syntypes:|Holotype:|Lectotype:|Neotype:)\s*(.*?)\.", text)
    if match_types:
        data['Type_Specimens'] = match_types.group(2).strip()

    return data

async def eschmeyer_taxonomy(**kwargs):
    species_name = kwargs.get('species_name', 'Alepes kleinii')
    time_delay = kwargs.get('time_delay', 1)
    verbose = kwargs.get('verbose', True)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 2)
    output_folder = kwargs.get('output_folder', ".")
    
    # Estrutura de dados padrão
    data_dict = {
        'Species_Name': species_name,
        'Original_Epithet': '-',
        'Original_Genus': '-',
        'Original_Author_Year': '-',
        'Status': '-',
        'Accepted_Name': '-',
        'Accepted_Author_Year': '-',
        'Family': '-',
        'Subfamily': '-',
        'Type_Locality': '-',
        'Type_Specimens': '-',
        'Habitat': '-',
        'Synonyms_Count': '0',
        'Raw_Text': '-'
    }
    
    error_messages = {
        404: f"Species '{species_name}' not found in Eschmeyer's Catalog",
        500: "Internal Server Error",
        503: "Service Unavailable",
        504: "Gateway Timeout",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        405: "Method Not Allowed",
        502: "Bad Gateway"
    }
    
    log_file = os.path.join(output_folder, 'EschmeyerLog.txt')
    
    eschmeyer_result = [species_name]
    if time_delay > 0:
        await asyncio.sleep(time_delay)
    if verbose:
        logging.info(f"Eschmeyer - {species_name} Getting taxonomy from Eschmeyer's Catalog of Fishes...")
    
    # Construir parâmetros da URL
    base_url = "https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp"
    
    parts = species_name.split(" ", 1)
    if len(parts) < 2:
        if verbose:
            logging.warning(f"Eschmeyer - {species_name} Invalid species name format (must contain genus and species)")
        if log_to_file:
            with open(log_file, 'a+', encoding='utf-8') as f:
                f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - Eschmeyer - {species_name} Invalid species name format\n")
        eschmeyer_result.append(';'.join(data_dict.values()))
        return eschmeyer_result
    
    params = {
        'tbl': 'species',
        'genus': parts[0],
        'species': parts[1]
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(max_retries):
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30)
            ) as session:
                async with session.get(base_url, params=params, headers=headers) as response:
                    if response.status == 200:
                        html_content = await response.text()
                        soup = BeautifulSoup(html_content, 'html.parser')
                        results_p = soup.find_all('p', class_='result')
                        
                        if results_p:
                            all_results = []
                            valid_entry = None
                            synonyms_count = 0
                            
                            # Processar todos os resultados
                            for p in results_p:
                                text_content = p.get_text()
                                parsed_data = parse_result_text(text_content)
                                all_results.append(parsed_data)
                                
                                # Identificar entrada válida
                                if parsed_data['Status'] == 'Valid':
                                    valid_entry = parsed_data
                                elif parsed_data['Status'] == 'Synonym':
                                    synonyms_count += 1
                            
                            # Se não encontrou entrada válida, usar a primeira
                            if not valid_entry and all_results:
                                valid_entry = all_results[0]
                                synonyms_count = len(all_results) - 1
                            
                            if valid_entry:
                                data_dict['Original_Epithet'] = str(valid_entry.get('Original_Epithet', '-'))
                                data_dict['Original_Genus'] = str(valid_entry.get('Original_Genus', '-'))
                                data_dict['Original_Author_Year'] = str(valid_entry.get('Original_Author_Year', '-'))
                                data_dict['Status'] = str(valid_entry.get('Status', '-'))
                                data_dict['Accepted_Name'] = str(valid_entry.get('Accepted_Name', '-'))
                                data_dict['Accepted_Author_Year'] = str(valid_entry.get('Accepted_Author_Year', '-'))
                                data_dict['Family'] = str(valid_entry.get('Family', '-'))
                                data_dict['Subfamily'] = str(valid_entry.get('Subfamily', '-'))
                                data_dict['Type_Locality'] = str(valid_entry.get('Type_Locality', '-'))
                                data_dict['Type_Specimens'] = str(valid_entry.get('Type_Specimens', '-'))
                                data_dict['Habitat'] = str(valid_entry.get('Habitat', '-'))
                                data_dict['Synonyms_Count'] = str(synonyms_count)
                                data_dict['Raw_Text'] = str(valid_entry.get('Raw_Text', '-')[:200] + '...' if len(str(valid_entry.get('Raw_Text', ''))) > 200 else valid_entry.get('Raw_Text', '-'))
                                
                                taxonomy_info = f"Status: {data_dict['Status']}, Family: {data_dict['Family']}, Synonyms: {data_dict['Synonyms_Count']}"
                                
                                if verbose:
                                    logging.info(f"Eschmeyer - {species_name} Found in Eschmeyer's Catalog: {taxonomy_info}")
                                if log_to_file:
                                    log_message = f"Eschmeyer - {species_name} Found: {taxonomy_info}"
                                    with open(log_file, 'a+', encoding='utf-8') as f:
                                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - INFO - {log_message}\n")
                                break
                        else:
                            if verbose:
                                logging.warning(f"Eschmeyer - {species_name} No results found in Eschmeyer's Catalog")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - Eschmeyer - {species_name} No results found\n")
                            break
                    else:
                        error_msg = error_messages.get(response.status, 'Unknown Error')
                        if attempt < max_retries - 1:
                            if verbose:
                                logging.warning(f"Eschmeyer - {species_name} Error {response.status} - {error_msg}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                            await asyncio.sleep(retry_delay)
                        else:
                            if verbose:
                                logging.error(f"Eschmeyer - {species_name} Error {response.status} - {error_msg}. Max retries exceeded")
                            if log_to_file:
                                with open(log_file, 'a+', encoding='utf-8') as f:
                                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - Eschmeyer - {species_name} Error {response.status} - {error_msg}\n")
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"Eschmeyer - {species_name} Request timeout. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"Eschmeyer - {species_name} Request timeout. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - Eschmeyer - {species_name} Request timeout\n")
        except Exception as e:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"Eschmeyer - {species_name} Connection error: {e}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"Eschmeyer - {species_name} Connection error: {e}. Max retries exceeded")
                if log_to_file:
                    with open(log_file, 'a+', encoding='utf-8') as f:
                        f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - Eschmeyer - {species_name} Connection error: {e}\n")
    
    eschmeyer_result.append(';'.join(data_dict.values()))
    return eschmeyer_result

async def get_eschmeyer_data_batch(species_list, **kwargs):
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 1)
    max_concurrent = kwargs.get('max_concurrent', 5)
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 10)
    retry_delay = kwargs.get('retry_delay', 5)
    output_folder = kwargs.get('output_folder', ".")
    
    if verbose:
        logging.info(f"Eschmeyer - Starting taxonomy lookup for {len(species_list)} species...")

    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def get_taxonomy_with_semaphore(species_name):
        async with semaphore:
            return await eschmeyer_taxonomy(
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
                logging.error(f"Eschmeyer - Error processing species '{species_list[i]}': {result}")
            taxonomy_data.append({
                'Species_Name': species_list[i],
                'Original_Epithet': '-',
                'Original_Genus': '-',
                'Original_Author_Year': '-',
                'Status': '-',
                'Accepted_Name': '-',
                'Accepted_Author_Year': '-',
                'Family': '-',
                'Subfamily': '-',
                'Type_Locality': '-',
                'Type_Specimens': '-',
                'Habitat': '-',
                'Synonyms_Count': '0',
                'Raw_Text': '-'
            })
        else:
            if len(result) > 1:
                data_parts = result[1].split(';')
                
                record_dict = {
                    'Species_Name': data_parts[0] if len(data_parts) > 0 else species_list[i],
                    'Original_Epithet': data_parts[1] if len(data_parts) > 1 else '-',
                    'Original_Genus': data_parts[2] if len(data_parts) > 2 else '-',
                    'Original_Author_Year': data_parts[3] if len(data_parts) > 3 else '-',
                    'Status': data_parts[4] if len(data_parts) > 4 else '-',
                    'Accepted_Name': data_parts[5] if len(data_parts) > 5 else '-',
                    'Accepted_Author_Year': data_parts[6] if len(data_parts) > 6 else '-',
                    'Family': data_parts[7] if len(data_parts) > 7 else '-',
                    'Subfamily': data_parts[8] if len(data_parts) > 8 else '-',
                    'Type_Locality': data_parts[9] if len(data_parts) > 9 else '-',
                    'Type_Specimens': data_parts[10] if len(data_parts) > 10 else '-',
                    'Habitat': data_parts[11] if len(data_parts) > 11 else '-',
                    'Synonyms_Count': data_parts[12] if len(data_parts) > 12 else '0',
                    'Raw_Text': data_parts[13] if len(data_parts) > 13 else '-'
                }
                taxonomy_data.append(record_dict)
    
    column_order = [
        'Species_Name', 'Status', 'Accepted_Name', 'Accepted_Author_Year',
        'Original_Genus', 'Original_Epithet', 'Original_Author_Year',
        'Family', 'Subfamily', 'Habitat', 'Type_Locality', 'Type_Specimens',
        'Synonyms_Count', 'Raw_Text'
    ]
    
    df_taxonomy = pd.DataFrame(taxonomy_data)
    if not df_taxonomy.empty:
        df_taxonomy = df_taxonomy.reindex(columns=column_order)
        df_taxonomy['sort_key'] = df_taxonomy.apply(
            lambda row: (
                0 if row['Family'] != '-' else 1,
                0 if row['Status'] != '-' else 1,
                0 if row['Species_Name'] != '-' else 1,
                row['Family'] if row['Family'] != '-' else 'zzz',
                row['Status'] if row['Status'] != '-' else 'zzz',
                row['Species_Name'] if row['Species_Name'] != '-' else 'zzz'
            ), axis=1
        )
        df_taxonomy = df_taxonomy.sort_values('sort_key').drop('sort_key', axis=1)

    if verbose:
        successful_records = len(df_taxonomy[df_taxonomy['Status'] != '-'])
        total_species = len(species_list)
        total_synonyms = df_taxonomy['Synonyms_Count'].apply(lambda x: int(x) if x.isdigit() else 0).sum()
        logging.info(f"Eschmeyer - Taxonomy lookup completed: {successful_records}/{total_species} species found")
        if total_synonyms > 0:
            logging.info(f"Eschmeyer - Total synonyms found: {total_synonyms}")
    
    return df_taxonomy
