__author__ = "Luan Rabelo"
__license__ = "MIT"
__version__ = "1.5.0"
__maintainer__ = "Luan Rabelo"
__email__ = "luanrabelo@outlook.com"
__date__ = "2024/03/20"
__twitter__ = "lprabelo"
__github__ = "luanrabelo/dashFishing"
__status__ = "Stable"
__tool__ = "dataFishing"

import asyncio
import logging
import os
import re
import pandas as pd
import aiofiles
from .utils import create_folder

async def write_genus_files(genus, df_genus, folder, verbose=True):
    genus_folder = str(genus) if genus != '-' else 'Unknown_Genus'
    genus_folder = re.sub(r'[^A-Za-z0-9/-]+', '_', genus_folder)
    genus_path = f"{folder}/BOLD_LocalData/{genus_folder}"
    create_folder(folder_name=f"{genus_path}/Sequences", verbose=verbose)
    create_folder(folder_name=f"{genus_path}/Occurrences", verbose=verbose)
    try:
        genus_occ_path = f"{genus_path}/Occurrences/{genus_folder}"
        df_genus.to_excel(f"{genus_occ_path}.xlsx", index=False)
        df_genus.to_csv(f"{genus_occ_path}.tsv", sep='\t', index=False)
        df_genus.to_csv(f"{genus_occ_path}.csv", index=False)
        fasta_content = []
        for index, row in df_genus.iterrows():
            try:
                if row['Nucleotides'] != '*':
                    header = (f">{row['Species']}_{row['Process ID']}_"
                             f"{row['Sample ID']}_{row['Country']}\n")
                    fasta_content.append(f"{header}{row['Nucleotides']}\n")
            except Exception as e:
                if verbose:
                    logging.error(f"Error processing sequence for genus {genus}: {e}")
        if fasta_content:
            genus_fasta_path = f"{genus_path}/Sequences/{genus_folder}.fasta"
            async with aiofiles.open(genus_fasta_path, 'w') as f:
                await f.write(''.join(fasta_content))
    except Exception as e:
        if verbose:
            logging.error(f"Error processing genus {genus}: {e}")

async def write_fasta_sequences(species_folder, sequences_path, df_species, verbose=True):
    fasta_content = []
    for index, row in df_species.iterrows():
        try:
            if row['Nucleotides'] != '*':
                header = (f">{row['Species']}_{row['Process ID']}_"
                         f"{row['Sample ID']}_{row['Country']}\n")
                fasta_content.append(f"{header}{row['Nucleotides']}\n")
        except Exception as e:
            if verbose:
                logging.error(f"Error processing sequence for {species_folder}: {e}")
    if fasta_content:
        try:
            file_path = f"{sequences_path}/{species_folder}.fasta"
            async with aiofiles.open(file_path, 'w') as f:
                await f.write(''.join(fasta_content))
        except Exception as e:
            if verbose:
                logging.error(f"Error writing FASTA file for {species_folder}: {e}")

async def process_species_data(species, df, folder, verbose=True):
    species_folder = str(species) if species != '-' else 'Unknown_Species'
    species_folder = re.sub(r'[^A-Za-z0-9/-]+', '_', species_folder)
    genus = df[df['Species'] == species]['Genus'].iloc[0] if len(df[df['Species'] == species]) > 0 else 'Unknown_Genus'
    genus_folder = str(genus) if genus != '-' else 'Unknown_Genus'
    genus_folder = re.sub(r'[^A-Za-z0-9/-]+', '_', genus_folder)
    species_path = f"{folder}/BOLD_LocalData/{genus_folder}/Species/{species_folder}"
    occurrences_path = f"{species_path}/Occurrences"
    sequences_path = f"{species_path}/Sequences"
    create_folder(folder_name=occurrences_path, verbose=verbose)
    create_folder(folder_name=sequences_path, verbose=verbose)
    df_species = df[df['Species'] == species]
    try:
        base_path = f"{occurrences_path}/{species_folder}"
        
        df_species.to_excel(f"{base_path}.xlsx", index=False)
        df_species.to_csv(f"{base_path}.tsv", sep='\t', index=False)
        df_species.to_csv(f"{base_path}.csv", index=False)
        await write_fasta_sequences(species_folder, sequences_path, df_species, verbose)
    except Exception as e:
        if verbose:
            logging.error(f"Error processing species {species}: {e}")

async def read_input_file(**kwargs):
    input_file = kwargs.get('input', None)
    folder = kwargs.get('folder', None)
    verbose = kwargs.get('verbose', True)

    if input_file is not None:
        if verbose:
            logging.info(f"Reading Input File '{os.path.basename(input_file)}' please wait...")
        try:
            df = pd.read_csv(input_file, sep='\t', encoding='latin', low_memory=False)
            if len(df.columns) > 1:
                if verbose:
                    logging.info(f"Input File '{os.path.basename(input_file)}' (tsv) loaded successfully!")
                columns_drop = [
                    'catalognum', 'fieldnum', 'institution_storing',
                    'collection_code', 'phylum_taxID', 'class_taxID',
                    'order_taxID', 'family_taxID', 'subfamily_taxID',
                    'genus_taxID', 'species_taxID', 'subspecies_taxID',
                    'identification_provided_by', 'identification_method',
                    'identification_reference', 'tax_note', 'voucher_status',
                    'tissue_type', 'collection_event_id', 'collectors',
                    'collectiontime', 'collectiondate_start',
                    'collectiondate_end', 'collection_note', 'site_code',
                    'sampling_protocol', 'lifestage', 'sex', 'reproduction',
                    'habitat', 'associated_specimens', 'associated_taxa',
                    'extrainfo', 'notes', 'coord_source', 'coord_accuracy',
                    'elev', 'depth', 'elev_accuracy', 'depth_accuracy',
                    'sector', 'exactsite', 'image_ids', 'image_urls',
                    'media_descriptors', 'captions', 'copyright_holders',
                    'copyright_years', 'copyright_licenses',
                    'copyright_institutions', 'photographers', 'sequenceID',
                    'trace_ids', 'trace_names', 'trace_links', 'run_dates',
                    'sequencing_centers', 'directions', 'seq_primers',
                    'marker_codes'
                ]
                
                df.drop(columns=columns_drop, inplace=True, errors='ignore')
                df.dropna(subset=['species_name'], inplace=True)
                
                columns_replace_taxonomy = [
                    'phylum_name', 'class_name', 'order_name', 'family_name',
                    'genus_name', 'species_name', 'subfamily_name'
                ]
                df[columns_replace_taxonomy] = (
                    df[columns_replace_taxonomy]
                    .fillna('-')
                    .astype(str)
                    .replace('[^a-zA-Z0-9] ', '', regex=True)
                )
                
                columns_replace_nan = [
                    'lat', 'lon', 'country', 'province_state', 'region',
                    'subspecies_name'
                ]
                df[columns_replace_nan] = (
                    df[columns_replace_nan]
                    .fillna('-')
                    .astype(str)
                    .replace('nan', '-')
                )
                
                df['nucleotides'] = (
                    df['nucleotides']
                    .replace('nan', '*')
                    .replace('-', '')
                )
                
                df.rename(columns={
                    'processid': 'Process ID',
                    'sampleid': 'Sample ID',
                    'phylum_name': 'Phylum',
                    'class_name': 'Class',
                    'order_name': 'Order',
                    'family_name': 'Family',
                    'genus_name': 'Genus',
                    'species_name': 'Species',
                    'subfamily_name': 'Subfamily',
                    'subspecies_name': 'Subspecies',
                    'lat': 'Latitude',
                    'lon': 'Longitude',
                    'country': 'Country',
                    'province_state': 'Province State',
                    'region': 'Region',
                    'nucleotides': 'Nucleotides',
                }, inplace=True)
                create_folder(folder_name=f'{folder}', verbose=verbose)
                base_filename = os.path.basename(input_file).split(".")[0]
                base_path = f'{folder}/Complete_BOLD_Systems_{base_filename}'
                df.to_excel(f'{base_path}.xlsx', index=False)
                df.to_csv(f'{base_path}.tsv', sep='\t', index=False)
                df.to_csv(f'{base_path}.csv', index=False)

                unique_species = df['Species'].unique().tolist()
                unique_genera = df['Genus'].unique().tolist()
                
                if verbose:
                    logging.info(f"Processing {len(unique_genera)} genera and {len(unique_species)} species asynchronously...")

                genus_tasks = [
                    write_genus_files(genus, df[df['Genus'] == genus], 
                                    folder, verbose)
                    for genus in unique_genera
                ]
                
                species_tasks = [
                    process_species_data(species, df, folder, verbose)
                    for species in unique_species
                ]
                
                await asyncio.gather(*genus_tasks, *species_tasks)

                if verbose:
                    logging.info("All genera and species processed successfully!")

                return unique_species
            else:
                with open(input_file, 'r', encoding='latin') as file:
                    species_lines = [line.strip() for line in file.readlines()]
                if verbose:
                    logging.info(f"Input File '{os.path.basename(input_file)}' (txt) loaded successfully!")
                return species_lines
        except Exception as e:
            if verbose:
                logging.error(f"Error reading input file '{os.path.basename(input_file)}': {e}")
            return None
    else:
        if verbose:
            logging.error("Input File not provided!")
        return None