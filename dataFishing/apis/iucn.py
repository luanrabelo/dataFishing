import asyncio
import json
import logging
import time
import os
import pandas as pd
import aiohttp
from bs4 import BeautifulSoup
from datetime import datetime
from ..utils import load_api_keys

def _clean_html(html_content):
    """Remove HTML tags from content and clean text."""
    if not html_content or html_content == '-':
        return None
    if not isinstance(html_content, str):
        html_content = str(html_content)
    soup = BeautifulSoup(html_content, "html.parser")
    text = soup.get_text(separator=' ')
    text = ' '.join(text.split()).strip()
    return text if text else None

async def iucn_taxa(**kwargs):
    """Get taxa data from IUCN Red List API."""
    species_name = kwargs.get('species_name', "Rhinella marina")
    token = kwargs.get('token', None)
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 2)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 5)
    output_folder = kwargs.get('output_folder', ".")
    session = kwargs.get('session', None)  # aiohttp session
    
    data_dict = {
        'Tax ID': '-',
        'Kingdom': '-',
        'Phylum': '-',
        'Class': '-',
        'Order': '-',
        'Family': '-',
        'Genus': species_name.split(' ')[0] if ' ' in species_name else species_name,
        'Species Name': species_name,
        'Authority': '-',
        'Main Common Name': '-',
        'Common Names List': '-',
        'Red List Category': '-',
        'Red List Version': '-',
        'Assessment Date': '-',
        'Year Published': '-',
        'Population Trend': '-',
        'Systems': '-',
        'Biogeographical Realms': '-',
        'Scopes': '-',
        'Possibly Extinct': 'No',
        'Possibly Extinct In Wild': 'No',
        'SSC Groups': '-',
        'Synonyms Count': '0',
        'Synonyms List': '-',
        'Countries Count': '0',
        'Countries List': '-',
        'Habitats Count': '0',
        'Habitats List': '-',
        'Threats Count': '0',
        'Threats List': '-',
        'Conservation Actions Count': '0',
        'Conservation Actions List': '-',
        'Research Needed Count': '0',
        'Research Needed List': '-',
        'Use Trade Count': '0',
        'Use Trade List': '-',
        'Population Text': '-',
        'Population Severely Fragmented': '-',
        'Range Text': '-',
        'Habitat Text': '-',
        'Threats Full Text': '-',
        'Conservation Actions Text': '-',
        'Use Trade Text': '-',
        'Taxonomic Notes': '-',
        'Rationale': '-',
        'References Count': '0',
        'Citation': '-',
        'Lower Elevation Limit': '-',
        'Upper Elevation Limit': '-',
        'Movement Patterns': '-'
    }
    
    error_messages = {
        404: f"Taxa data '{species_name}' not found in IUCN Red List!",
        500: "Internal Server Error!",
        503: "Service Unavailable!",
        504: "Gateway Timeout!",
        400: "Bad Request!",
        401: "Unauthorized - Check your IUCN API token!",
        403: "Forbidden - Check your IUCN API token!",
        405: "Method Not Allowed!",
        502: "Bad Gateway!"
    }
    
    log_file = os.path.join(output_folder, 'IUCNLog.txt')
    
    # Apply rate limiting delay
    if time_delay > 0:
        await asyncio.sleep(time_delay)
    
    if verbose:
        logging.info(f"IUCN - {species_name} Fetching taxa data from IUCN Red List API...")
    
    # Parse species name
    species_parts = species_name.split()
    if len(species_parts) < 2:
        if verbose:
            logging.error(f"IUCN - {species_name} Invalid species name format")
        return [species_name, '|'.join([str(data_dict[field]) for field in data_dict.keys()])]
    
    genus_name = species_parts[0]
    species_epithet = species_parts[1]
    
    url = f'https://api.iucnredlist.org/api/v4/taxa/scientific_name?genus_name={genus_name}&species_name={species_epithet}'
    headers = {'accept': 'application/json', 'Authorization': token}
    
    for attempt in range(max_retries):
        try:
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    taxa_data = await response.json()
                    
                    if taxa_data.get('taxon', None) is not None:
                        if verbose:
                            logging.info(f"IUCN - {species_name} Found taxa data in IUCN Red List!")
                        
                        taxon_info = taxa_data.get('taxon', {})
                        
                        # Extract basic taxonomic information
                        data_dict['Tax ID'] = str(taxon_info.get('sis_id', '-'))
                        data_dict['Kingdom'] = str(taxon_info.get('kingdom_name', '-')).capitalize() if taxon_info.get('kingdom_name') else '-'
                        data_dict['Phylum'] = str(taxon_info.get('phylum_name', '-')).capitalize() if taxon_info.get('phylum_name') else '-'
                        data_dict['Class'] = str(taxon_info.get('class_name', '-')).capitalize() if taxon_info.get('class_name') else '-'
                        data_dict['Order'] = str(taxon_info.get('order_name', '-')).capitalize() if taxon_info.get('order_name') else '-'
                        data_dict['Family'] = str(taxon_info.get('family_name', '-')).capitalize() if taxon_info.get('family_name') else '-'
                        data_dict['Genus'] = str(taxon_info.get('genus_name', genus_name)).capitalize() if taxon_info.get('genus_name') else genus_name
                        data_dict['Species Name'] = str(taxon_info.get('scientific_name', species_name)) if taxon_info.get('scientific_name') else species_name
                        data_dict['Authority'] = str(taxon_info.get('authority', '-')) if taxon_info.get('authority') else '-'
                        
                        # Extract synonyms
                        synonyms = taxon_info.get('synonyms', [])
                        data_dict['Synonyms Count'] = str(len(synonyms)) if synonyms else '0'
                        
                        synonyms_list = []
                        for syn in synonyms:
                            genus = _clean_html(syn.get('genus_name', ''))
                            species = _clean_html(syn.get('species_name', ''))
                            infra_type = _clean_html(syn.get('infra_type', ''))
                            infra_name = _clean_html(syn.get('infra_name', ''))
                            authority = _clean_html(syn.get('species_author') or syn.get('infrarank_author', ''))
                            
                            synonym_parts = []
                            if genus:
                                synonym_parts.append(genus)
                            if species:
                                synonym_parts.append(species)
                            if infra_type and infra_name:
                                synonym_parts.append(f"{infra_type} {infra_name}")
                            
                            if synonym_parts:
                                synonym_name = ' '.join(synonym_parts)
                                if authority:
                                    synonym_name += f" {authority}"
                                synonyms_list.append(synonym_name)
                        
                        data_dict['Synonyms List'] = '; '.join(synonyms_list) if synonyms_list else '-'
                        
                        # Extract SSC Groups
                        ssc_groups = taxon_info.get('ssc_groups', [])
                        ssc_groups_list = []
                        for group in ssc_groups:
                            group_name = _clean_html(group.get('name', ''))
                            if group_name:
                                ssc_groups_list.append(group_name)
                        data_dict['SSC Groups'] = '; '.join(ssc_groups_list) if ssc_groups_list else '-'
                        
                        # Extract Common Names
                        common_names = []
                        main_common_name_set = False
                        cn = taxon_info.get('common_names', [])
                        
                        if cn and len(cn) > 0:
                            # Separar nomes principais dos outros
                            main_names = []
                            other_names = []
                            
                            for name_data in cn:
                                is_main = str(name_data.get('main', 'false')).lower() == 'true'
                                name = name_data.get('name', '')
                                language = name_data.get('language', '')
                                
                                if name and name != '-':
                                    name_str = f"{name} ({language})" if language else name
                                    
                                    if is_main:
                                        main_names.append(name_str)
                                        # Definir o primeiro nome principal encontrado
                                        if not main_common_name_set:
                                            data_dict['Main Common Name'] = name_str
                                            main_common_name_set = True
                                    else:
                                        other_names.append(name_str)
                            
                            # Combinar nomes principais primeiro, depois outros
                            common_names = main_names + other_names
                        
                        # Se não definiu nome principal ainda e há nomes comuns, usar o primeiro
                        if not main_common_name_set and common_names:
                            data_dict['Main Common Name'] = common_names[0]
                        
                        # Juntar todos os nomes comuns
                        data_dict['Common Names List'] = '; '.join(common_names) if common_names else '-'
                        
                        # Get assessment data - need to fetch detailed assessment data
                        assessments = taxa_data.get('assessments', [])
                        if assessments:
                            # Procurar pelo assessment mais recente e global
                            global_assessments = [a for a in assessments if any(scope.get('description', {}).get('en', '').lower() == 'global' for scope in a.get('scopes', []))]
                            if global_assessments:
                                latest_assessment = max(global_assessments, key=lambda x: int(x.get('year_published', 0)))
                            else:
                                latest_assessment = max(assessments, key=lambda x: int(x.get('year_published', 0)))
                        
                            # Red List Category
                            category_code = latest_assessment.get('red_list_category_code', '')
                            category_mapping = {
                                'EX': 'Extinct',
                                'EW': 'Extinct in the Wild',
                                'CR': 'Critically Endangered',
                                'EN': 'Endangered',
                                'VU': 'Vulnerable',
                                'NT': 'Near Threatened',
                                'LC': 'Least Concern',
                                'DD': 'Data Deficient',
                                'NE': 'Not Evaluated',
                                'V': 'Vulnerable',
                                'LR/lc': 'Least Concern',
                                'E': 'Endangered',
                                'RE': 'Regionally Extinct'
                            }
                            data_dict['Red List Category'] = category_mapping.get(category_code, category_code if category_code else '-')
                            data_dict['Year Published'] = str(latest_assessment.get('year_published', '-'))
                            data_dict['Possibly Extinct'] = 'Yes' if latest_assessment.get('possibly_extinct', False) else 'No'
                            data_dict['Possibly Extinct In Wild'] = 'Yes' if latest_assessment.get('possibly_extinct_in_the_wild', False) else 'No'
                            
                            # Fetch detailed assessment data
                            assessment_id = latest_assessment.get('assessment_id')
                            if assessment_id:
                                await asyncio.sleep(0.5)  # Rate limiting mais agressivo
                                try:
                                    assessment_url = f'https://api.iucnredlist.org/api/v4/assessment/{assessment_id}'
                                    async with session.get(assessment_url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as assessment_response:
                                        if assessment_response.status == 200:
                                            assessment_data = await assessment_response.json()
                                            
                                            # Extract detailed assessment information
                                            red_list_cat = assessment_data.get('red_list_category', {})
                                            if red_list_cat:
                                                data_dict['Red List Version'] = str(red_list_cat.get('version', '-'))
                                            
                                            # Assessment date
                                            assessment_date = assessment_data.get('assessment_date')
                                            if assessment_date:
                                                try:
                                                    parsed_date = datetime.strptime(assessment_date, '%Y-%m-%d')
                                                    data_dict['Assessment Date'] = parsed_date.strftime('%Y-%m-%d')
                                                except:
                                                    data_dict['Assessment Date'] = str(assessment_date)
                                            
                                            # Population trend
                                            pop_trend = assessment_data.get('population_trend', {})
                                            if pop_trend:
                                                trend_desc = pop_trend.get('description', {})
                                                if isinstance(trend_desc, dict):
                                                    data_dict['Population Trend'] = str(trend_desc.get('en', '-')).capitalize()
                                                else:
                                                    data_dict['Population Trend'] = str(trend_desc).capitalize()
                                            
                                            # Systems, realms, scopes
                                            systems = assessment_data.get('systems', [])
                                            if systems:
                                                systems_names = []
                                                for sys in systems:
                                                    sys_desc = sys.get('description', {})
                                                    if isinstance(sys_desc, dict):
                                                        sys_name = sys_desc.get('en', '')
                                                    else:
                                                        sys_name = str(sys_desc)
                                                    if sys_name:
                                                        systems_names.append(sys_name.capitalize())
                                                data_dict['Systems'] = '; '.join(systems_names) if systems_names else '-'
                                            
                                            realms = assessment_data.get('biogeographical_realms', [])
                                            if realms:
                                                realm_names = []
                                                for realm in realms:
                                                    realm_desc = realm.get('description', {})
                                                    if isinstance(realm_desc, dict):
                                                        realm_name = realm_desc.get('en', '')
                                                    else:
                                                        realm_name = str(realm_desc)
                                                    if realm_name:
                                                        realm_names.append(realm_name.capitalize())
                                                data_dict['Biogeographical Realms'] = '; '.join(realm_names) if realm_names else '-'
                                            
                                            scopes = assessment_data.get('scopes', [])
                                            if scopes:
                                                scope_names = []
                                                for scope in scopes:
                                                    scope_desc = scope.get('description', {})
                                                    if isinstance(scope_desc, dict):
                                                        scope_name = scope_desc.get('en', '')
                                                    else:
                                                        scope_name = str(scope_desc)
                                                    if scope_name:
                                                        scope_names.append(scope_name.capitalize())
                                                data_dict['Scopes'] = '; '.join(scope_names) if scope_names else '-'
                                            
                                            # Countries/Locations
                                            locations = assessment_data.get('locations', [])
                                            data_dict['Countries Count'] = str(len(locations))
                                            countries_list = []
                                            for loc in locations:
                                                country_desc = loc.get('description', {})
                                                if isinstance(country_desc, dict):
                                                    country_name = country_desc.get('en', '')
                                                else:
                                                    country_name = str(country_desc)
                                                
                                                presence = _clean_html(loc.get('presence', ''))
                                                origin = _clean_html(loc.get('origin', ''))
                                                
                                                if country_name:
                                                    country_info = country_name
                                                    if presence and presence != '-':
                                                        country_info += f" ({presence}"
                                                        if origin and origin != '-':
                                                            country_info += f", {origin}"
                                                        country_info += ")"
                                                    countries_list.append(country_info)
                                            
                                            data_dict['Countries List'] = '; '.join(countries_list) if countries_list else '-'
                                            
                                            # Habitats
                                            habitats = assessment_data.get('habitats', [])
                                            data_dict['Habitats Count'] = str(len(habitats))
                                            habitats_list = []
                                            for habitat in habitats:
                                                habitat_desc = habitat.get('description', {})
                                                if isinstance(habitat_desc, dict):
                                                    habitat_name = habitat_desc.get('en', '')
                                                else:
                                                    habitat_name = str(habitat_desc)
                                                
                                                suitability = _clean_html(habitat.get('suitability', ''))
                                                season = _clean_html(habitat.get('season', ''))
                                                major_importance = habitat.get('majorImportance')
                                                
                                                if habitat_name:
                                                    habitat_info = habitat_name
                                                    details = []
                                                    if suitability and suitability != '-':
                                                        details.append(f"Suitability: {suitability}")
                                                    if season and season != '-':
                                                        details.append(f"Season: {season}")
                                                    if major_importance is not None:
                                                        importance = "Yes" if str(major_importance).lower() == 'yes' else "No"
                                                        details.append(f"Major importance: {importance}")
                                                
                                                    if details:
                                                        habitat_info += f" ({'; '.join(details)})"
                                                    habitats_list.append(habitat_info)
                                            
                                            data_dict['Habitats List'] = '; '.join(habitats_list) if habitats_list else '-'
                                            
                                            # Threats
                                            threats = assessment_data.get('threats', [])
                                            data_dict['Threats Count'] = str(len(threats))
                                            threats_list = []
                                            for threat in threats:
                                                threat_desc = threat.get('description', {})
                                                if isinstance(threat_desc, dict):
                                                    threat_name = threat_desc.get('en', '')
                                                else:
                                                    threat_name = str(threat_desc)
                                                
                                                code = str(threat.get('code', '')).replace('_', '.')
                                                
                                                if threat_name:
                                                    threat_info = f"{code}: {threat_name}" if code else threat_name
                                                    threats_list.append(threat_info)
                                            
                                            data_dict['Threats List'] = '; '.join(threats_list) if threats_list else '-'
                                            
                                            # Conservation Actions
                                            conservation_actions = assessment_data.get('conservation_actions', [])
                                            data_dict['Conservation Actions Count'] = str(len(conservation_actions))
                                            actions_list = []
                                            for action in conservation_actions:
                                                action_desc = action.get('description', {})
                                                if isinstance(action_desc, dict):
                                                    action_name = action_desc.get('en', '')
                                                else:
                                                    action_name = str(action_desc)
                                                
                                                code = str(action.get('code', '')).replace('_', '.')
                                                
                                                if action_name:
                                                    action_info = f"{code}: {action_name}" if code else action_name
                                                    actions_list.append(action_info)
                                            
                                            data_dict['Conservation Actions List'] = '; '.join(actions_list) if actions_list else '-'
                                            
                                            # Research Needed
                                            research_needed = assessment_data.get('researches', [])
                                            data_dict['Research Needed Count'] = str(len(research_needed))
                                            research_list = []
                                            for research in research_needed:
                                                research_desc = research.get('description', {})
                                                if isinstance(research_desc, dict):
                                                    research_name = research_desc.get('en', '')
                                                else:
                                                    research_name = str(research_desc)
                                                
                                                code = str(research.get('code', '')).replace('_', '.')
                                                
                                                if research_name:
                                                    research_info = f"{code}: {research_name}" if code else research_name
                                                    research_list.append(research_info)
                                            
                                            data_dict['Research Needed List'] = '; '.join(research_list) if research_list else '-'
                                            
                                            # Use and Trade
                                            use_trade = assessment_data.get('use_and_trade', [])
                                            data_dict['Use Trade Count'] = str(len(use_trade))
                                            use_trade_list = []
                                            for use in use_trade:
                                                use_desc = use.get('description', {})
                                                if isinstance(use_desc, dict):
                                                    use_name = use_desc.get('en', '')
                                                else:
                                                    use_name = str(use_desc)
                                                
                                                code = str(use.get('code', ''))
                                                
                                                if use_name:
                                                    use_info = f"{code}: {use_name}" if code else use_name
                                                    use_trade_list.append(use_info)
                                            
                                            data_dict['Use Trade List'] = '; '.join(use_trade_list) if use_trade_list else '-'
                                            
                                            # Extract documentation texts
                                            documentation = assessment_data.get('documentation', {})
                                            
                                            # Population text
                                            population_text = _clean_html(documentation.get('population', ''))
                                            if population_text and len(population_text) > 500:
                                                population_text = population_text[:500] + '...'
                                            data_dict['Population Text'] = population_text or '-'
                                            
                                            # Range text
                                            range_text = _clean_html(documentation.get('range', ''))
                                            if range_text and len(range_text) > 500:
                                                range_text = range_text[:500] + '...'
                                            data_dict['Range Text'] = range_text or '-'
                                            
                                            # Habitat text
                                            habitat_text = _clean_html(documentation.get('habitats', ''))
                                            if habitat_text and len(habitat_text) > 500:
                                                habitat_text = habitat_text[:500] + '...'
                                            data_dict['Habitat Text'] = habitat_text or '-'
                                            
                                            # Threats full text
                                            threats_full_text = _clean_html(documentation.get('threats', ''))
                                            if threats_full_text and len(threats_full_text) > 500:
                                                threats_full_text = threats_full_text[:500] + '...'
                                            data_dict['Threats Full Text'] = threats_full_text or '-'
                                            
                                            # Conservation actions text - verificando múltiplas chaves possíveis
                                            conservation_text = None
                                            for key in ['conservation_actions', 'conservation_measures', 'conservation', 'measures']:
                                                if documentation.get(key):
                                                    conservation_text = _clean_html(documentation.get(key))
                                                    break
                                            
                                            if conservation_text and len(conservation_text) > 500:
                                                conservation_text = conservation_text[:500] + '...'
                                            data_dict['Conservation Actions Text'] = conservation_text or '-'
                                            
                                            # Use and trade text - verificando múltiplas chaves possíveis
                                            use_trade_text = None
                                            for key in ['use_and_trade', 'use_trade', 'utilization', 'trade']:
                                                if documentation.get(key):
                                                    use_trade_text = _clean_html(documentation.get(key))
                                                    break
                                            
                                            if use_trade_text and len(use_trade_text) > 500:
                                                use_trade_text = use_trade_text[:500] + '...'
                                            data_dict['Use Trade Text'] = use_trade_text or '-'
                                            
                                            # Taxonomic notes
                                            taxonomic_notes = _clean_html(documentation.get('taxonomic_notes', ''))
                                            if taxonomic_notes and len(taxonomic_notes) > 500:
                                                taxonomic_notes = taxonomic_notes[:500] + '...'
                                            data_dict['Taxonomic Notes'] = taxonomic_notes or '-'
                                            
                                            # Rationale
                                            rationale = _clean_html(documentation.get('rationale', ''))
                                            if rationale and len(rationale) > 500:
                                                rationale = rationale[:500] + '...'
                                            data_dict['Rationale'] = rationale or '-'
                                            
                                            # Supplementary information
                                            supplementary_info = assessment_data.get('supplementary_info', {})
                                            
                                            # Population severely fragmented
                                            pop_frag = _clean_html(supplementary_info.get('population_severely_fragmented', ''))
                                            data_dict['Population Severely Fragmented'] = pop_frag or '-'
                                            
                                            # Elevation limits
                                            lower_elev = supplementary_info.get('lower_elevation_limit')
                                            upper_elev = supplementary_info.get('upper_elevation_limit')
                                            data_dict['Lower Elevation Limit'] = str(lower_elev) if lower_elev is not None else '-'
                                            data_dict['Upper Elevation Limit'] = str(upper_elev) if upper_elev is not None else '-'
                                            
                                            # Movement patterns
                                            movement = _clean_html(supplementary_info.get('movement_patterns', ''))
                                            data_dict['Movement Patterns'] = movement or '-'
                                            
                                            # References
                                            references = assessment_data.get('references', [])
                                            data_dict['References Count'] = str(len(references))
                                            
                                            # Citation
                                            citation = assessment_data.get('citation', '')
                                            data_dict['Citation'] = _clean_html(citation) or '-'
                                            
                                        else:
                                            if verbose:
                                                logging.warning(f"IUCN - {species_name} Assessment details not accessible (Status: {assessment_response.status})")
                                except Exception as e:
                                    if verbose:
                                        logging.warning(f"IUCN - {species_name} Could not fetch detailed assessment data: {e}")
                        
                        taxonomy_info = f"Category: {data_dict['Red List Category']}, Kingdom: {data_dict['Kingdom']}, Family: {data_dict['Family']}"
                        if verbose:
                            logging.info(f"IUCN - {species_name} Found in IUCN Red List: TaxID={data_dict['Tax ID']}, {taxonomy_info}")
                        with open(log_file, 'a+', encoding='utf-8') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - INFO - IUCN - {species_name} Found: TaxID={data_dict['Tax ID']}, {taxonomy_info}\n")
                        break
                    else:
                        if verbose:
                            logging.warning(f"IUCN - {species_name} No taxon data found in IUCN Red List")
                        with open(log_file, 'a+', encoding='utf-8') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - WARNING - IUCN - {species_name} No taxon data found\n")
                        break
                else:
                    error_msg = error_messages.get(response.status, 'Unknown error')
                    if attempt < max_retries - 1:
                        if verbose:
                            logging.warning(f"IUCN - {species_name} Error {response.status} - {error_msg}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                        await asyncio.sleep(retry_delay)
                    else:
                        if verbose:
                            logging.error(f"IUCN - {species_name} Error {response.status} - {error_msg}. Max retries exceeded")
                        with open(log_file, 'a+', encoding='utf-8') as f:
                            f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - IUCN - {species_name} Error {response.status} - {error_msg}\n")
                
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"IUCN - {species_name} Timeout error. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"IUCN - {species_name} Timeout error. Max retries exceeded")
                with open(log_file, 'a+', encoding='utf-8') as f:
                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - IUCN - {species_name} Timeout error\n")
        except Exception as e:
            if attempt < max_retries - 1:
                if verbose:
                    logging.warning(f"IUCN - {species_name} Unexpected error: {e}. Retrying in {retry_delay} seconds... (Attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(retry_delay)
            else:
                if verbose:
                    logging.error(f"IUCN - {species_name} Unexpected error: {e}. Max retries exceeded")
                with open(log_file, 'a+', encoding='utf-8') as f:
                    f.write(f"{time.strftime('%Y/%m/%d - %H:%M:%S')} - ERROR - IUCN - {species_name} Unexpected error: {e}\n")
    
    # Return as list with species name and joined data values in correct order
    field_order = [
        'Tax ID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 
        'Genus', 'Species Name', 'Authority', 'Main Common Name', 
        'Common Names List', 'Red List Category', 'Red List Version',
        'Assessment Date', 'Year Published', 'Population Trend', 'Systems',
        'Biogeographical Realms', 'Scopes', 'Possibly Extinct', 'Possibly Extinct In Wild',
        'SSC Groups', 'Synonyms Count', 'Synonyms List', 'Countries Count',
        'Countries List', 'Habitats Count', 'Habitats List', 'Threats Count',
        'Threats List', 'Conservation Actions Count', 'Conservation Actions List',
        'Research Needed Count', 'Research Needed List', 'Use Trade Count',
        'Use Trade List', 'Population Text', 'Population Severely Fragmented',
        'Range Text', 'Habitat Text', 'Threats Full Text', 'Conservation Actions Text',
        'Use Trade Text', 'Taxonomic Notes', 'Rationale', 'References Count',
        'Citation', 'Lower Elevation Limit', 'Upper Elevation Limit', 'Movement Patterns'
    ]
    
    iucn_result = [species_name]
    iucn_result.append('|'.join([str(data_dict[field]) for field in field_order]))
    return iucn_result

async def get_iucn_data_batch(species_list, **kwargs):
    verbose = kwargs.get('verbose', True)
    time_delay = kwargs.get('time_delay', 1)  # Reduzido para 1 segundo já que temos rate limiting interno
    max_concurrent = kwargs.get('max_concurrent', 20)  # Aumentado para 20 concurrent requests
    log_to_file = kwargs.get('log_to_file', True)
    max_retries = kwargs.get('max_retries', 3)
    retry_delay = kwargs.get('retry_delay', 5)
    output_folder = kwargs.get('output_folder', ".")
    token = kwargs.get('token', None)
    
    # Load API key if not provided
    if not token:
        api_keys = load_api_keys(verbose=verbose)
        token = api_keys.get('iucn_api_key')
    
    if not token:
        if verbose:
            logging.error("IUCN - API token is required for IUCN API access")
        return pd.DataFrame()
    
    if verbose:
        logging.info(f"IUCN - Starting taxa lookup for {len(species_list)} species...")
        logging.info(f"IUCN - Using rate limit of {max_concurrent} concurrent requests with aiohttp")

    # Create aiohttp connector with proper limits
    connector = aiohttp.TCPConnector(
        limit=max_concurrent * 2,  # Total connection pool size
        limit_per_host=max_concurrent,  # Per host limit
        keepalive_timeout=30,
        enable_cleanup_closed=True
    )
    
    timeout = aiohttp.ClientTimeout(total=60, connect=10)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def get_taxa_with_semaphore(species_name):
            async with semaphore:
                return await iucn_taxa(
                    species_name=species_name,
                    token=token,
                    time_delay=time_delay,
                    verbose=verbose,
                    max_retries=max_retries,
                    retry_delay=retry_delay,
                    output_folder=output_folder,
                    session=session  # Pass aiohttp session
                )

        # Executar todas as tarefas de forma assíncrona
        tasks = [get_taxa_with_semaphore(species) for species in species_list]
        
        if verbose:
            logging.info(f"IUCN - Created {len(tasks)} async tasks, executing with aiohttp...")
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
    
    taxa_data = []
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            if verbose:
                logging.error(f"IUCN - Error processing species '{species_list[i]}': {result}")
            # Create a default record with all fields in correct order
            default_record = {
                'Tax ID': '-',
                'Kingdom': '-', 
                'Phylum': '-', 
                'Class': '-', 
                'Order': '-', 
                'Family': '-',
                'Genus': species_list[i].split(' ')[0] if ' ' in species_list[i] else species_list[i],
                'Species Name': species_list[i],
                'Authority': '-',
                'Main Common Name': '-',
                'Common Names List': '-',
                'Red List Category': '-',
                'Red List Version': '-',
                'Assessment Date': '-',
                'Year Published': '-',
                'Population Trend': '-',
                'Systems': '-',
                'Biogeographical Realms': '-',
                'Scopes': '-',
                'Possibly Extinct': 'No',
                'Possibly Extinct In Wild': 'No',
                'SSC Groups': '-',
                'Synonyms Count': '0',
                'Synonyms List': '-',
                'Countries Count': '0',
                'Countries List': '-',
                'Habitats Count': '0',
                'Habitats List': '-',
                'Threats Count': '0',
                'Threats List': '-',
                'Conservation Actions Count': '0',
                'Conservation Actions List': '-',
                'Research Needed Count': '0',
                'Research Needed List': '-',
                'Use Trade Count': '0',
                'Use Trade List': '-',
                'Population Text': '-',
                'Population Severely Fragmented': '-',
                'Range Text': '-',
                'Habitat Text': '-',
                'Threats Full Text': '-',
                'Conservation Actions Text': '-',
                'Use Trade Text': '-',
                'Taxonomic Notes': '-',
                'Rationale': '-',
                'References Count': '0',
                'Citation': '-',
                'Lower Elevation Limit': '-',
                'Upper Elevation Limit': '-',
                'Movement Patterns': '-'
            }
            taxa_data.append(default_record)
        else:
            if len(result) > 1:
                data_parts = result[1].split('|')
                
                # Map all fields from the result in correct order
                field_names = [
                    'Tax ID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 
                    'Genus', 'Species Name', 'Authority', 'Main Common Name', 
                    'Common Names List', 'Red List Category', 'Red List Version',
                    'Assessment Date', 'Year Published', 'Population Trend', 'Systems',
                    'Biogeographical Realms', 'Scopes', 'Possibly Extinct', 'Possibly Extinct In Wild',
                    'SSC Groups', 'Synonyms Count', 'Synonyms List', 'Countries Count',
                    'Countries List', 'Habitats Count', 'Habitats List', 'Threats Count',
                    'Threats List', 'Conservation Actions Count', 'Conservation Actions List',
                    'Research Needed Count', 'Research Needed List', 'Use Trade Count',
                    'Use Trade List', 'Population Text', 'Population Severely Fragmented',
                    'Range Text', 'Habitat Text', 'Threats Full Text', 'Conservation Actions Text',
                    'Use Trade Text', 'Taxonomic Notes', 'Rationale', 'References Count',
                    'Citation', 'Lower Elevation Limit', 'Upper Elevation Limit', 'Movement Patterns'
                ]
                
                record_dict = {}
                for idx, field_name in enumerate(field_names):
                    if idx < len(data_parts):
                        record_dict[field_name] = data_parts[idx]
                    else:
                        record_dict[field_name] = '-'
                
                taxa_data.append(record_dict)
    
    df_taxa = pd.DataFrame(taxa_data)
    if not df_taxa.empty:
        # Reorder columns to ensure consistency
        column_order = [
            'Tax ID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 
            'Genus', 'Species Name', 'Authority', 'Main Common Name', 
            'Common Names List', 'Red List Category', 'Red List Version',
            'Assessment Date', 'Year Published', 'Population Trend', 'Systems',
            'Biogeographical Realms', 'Scopes', 'Possibly Extinct', 'Possibly Extinct In Wild',
            'SSC Groups', 'Synonyms Count', 'Synonyms List', 'Countries Count',
            'Countries List', 'Habitats Count', 'Habitats List', 'Threats Count',
            'Threats List', 'Conservation Actions Count', 'Conservation Actions List',
            'Research Needed Count', 'Research Needed List', 'Use Trade Count',
            'Use Trade List', 'Population Text', 'Population Severely Fragmented',
            'Range Text', 'Habitat Text', 'Threats Full Text', 'Conservation Actions Text',
            'Use Trade Text', 'Taxonomic Notes', 'Rationale', 'References Count',
            'Citation', 'Lower Elevation Limit', 'Upper Elevation Limit', 'Movement Patterns'
        ]
        df_taxa = df_taxa.reindex(columns=column_order, fill_value='-')
        df_taxa.sort_values(by=['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name'], inplace=True)

    if verbose:
        successful_records = len(df_taxa[df_taxa['Tax ID'] != '-'])
        total_species = len(species_list)
        logging.info(f"IUCN - Taxa lookup completed: {successful_records}/{total_species} species found")
    return df_taxa
