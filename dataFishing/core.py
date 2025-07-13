import asyncio
import logging
import pandas as pd
from .excel_formatter import (
    create_excel_formats, 
    format_worms_worksheet, 
    format_iucn_worksheet,
    format_gbif_worksheet,
    format_bold_worksheet,
    format_ncbi_worksheet,
    format_eschmeyer_worksheet,
    set_workbook_properties
)

async def save_biodiversity_results(dataframes_dict, output_folder, verbose=True):
    try:
        if not dataframes_dict:
            if verbose:
                logging.warning("No data to save")
            return
            
        consolidated_path = f"{output_folder}/dataFishing_results.xlsx"
        
        with pd.ExcelWriter(consolidated_path, engine='xlsxwriter') as writer:
            workbook = writer.book
            formats = create_excel_formats(workbook)
            
            for api_name, df in dataframes_dict.items():
                if df is not None and not df.empty:
                    df_formatted = format_api_data(df, api_name, verbose)
                    df_formatted.to_excel(writer, sheet_name=api_name, index=False)
                    worksheet = writer.sheets[api_name]
                    
                    if api_name == 'WoRMS':
                        format_worms_worksheet(worksheet, formats, df_formatted)
                    elif api_name == 'IUCN':
                        format_iucn_worksheet(worksheet, formats, df_formatted)
                    elif api_name == 'GBIF':
                        format_gbif_worksheet(worksheet, formats, df_formatted)
                    elif api_name == 'BOLD':
                        format_bold_worksheet(worksheet, formats, df_formatted)
                    elif api_name == 'NCBI':
                        format_ncbi_worksheet(worksheet, formats, df_formatted)
                    elif api_name == 'Eschmeyer':
                        format_eschmeyer_worksheet(worksheet, formats, df_formatted)
            
            set_workbook_properties(workbook)
        
        if verbose:
            logging.info(f"Consolidated Excel file saved: {consolidated_path}")
            
    except Exception as e:
        if verbose:
            logging.error(f"Error saving biodiversity results: {e}")

def format_api_data(df, api_name, verbose=True):
    if verbose:
        logging.info(f"Formatting {api_name} data...")
    
    df_copy = df.copy()
    
    if api_name == 'WoRMS':
        column_order = [
            'AphiaID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 'Authority', 'Valid Species Name',
            'Valid Authority', 'Status', 'Marine', 'Brackish', 'Freshwater', 'Terrestrial', 'Extinct',
            'Match Type', 'Modified', 'URL', 'Citation'
        ]
        df_copy = df_copy.reindex(columns=column_order)
        
    elif api_name == 'GBIF':
        column_order = [
            'Key', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 'Scientific Name',
            'Canonical Name', 'Authorship', 'Taxonomic Status', 'Taxon Rank'
        ]
        df_copy = df_copy.reindex(columns=column_order)
        
    elif api_name == 'IUCN':
        pass
        
    elif api_name == 'NCBI':
        # Para NCBI, manter todas as colunas na ordem que já estão
        # pois incluem colunas dinâmicas de genes
        base_columns = [
            'TaxID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name', 
            'Scientific Name', 'Rank'
        ]
        
        # Identificar colunas de genes (terminam com '_Sequences')
        gene_columns = [col for col in df_copy.columns if col.endswith('_Sequences') and col != 'Total_Sequences']
        
        # Colunas de resumo
        summary_columns = []
        if 'Total_Sequences' in df_copy.columns:
            summary_columns.append('Total_Sequences')
        if 'Genes_Searched' in df_copy.columns:
            summary_columns.append('Genes_Searched')
        
        # Reorganizar colunas
        column_order = base_columns + gene_columns + summary_columns
        existing_columns = [col for col in column_order if col in df_copy.columns]
        df_copy = df_copy.reindex(columns=existing_columns)
    
    elif api_name == 'BOLD':
        column_order = [
            'TaxID', 'Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species Name',
            'Sequences_Count'
        ]
        df_copy = df_copy.reindex(columns=column_order)
        
    elif api_name == 'Eschmeyer':
        column_order = [
            'Species_Name', 'Status', 'Accepted_Name', 'Accepted_Author_Year',
            'Original_Genus', 'Original_Epithet', 'Original_Author_Year',
            'Family', 'Subfamily', 'Habitat', 'Type_Locality', 'Type_Specimens',
            'Synonyms_Count', 'Raw_Text'
        ]
        df_copy = df_copy.reindex(columns=column_order)
    
    if verbose:
        logging.info(f"{api_name} data formatted successfully")
    
    return df_copy