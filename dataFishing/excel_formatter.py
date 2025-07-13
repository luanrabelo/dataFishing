import time

STATUS_IUCN = {
    'LC': ['Least Concern', '#5FC65A'],
    'NT': ['Near Threatened', '#CCE226'],
    'VU': ['Vulnerable', '#F9E814'],
    'EN': ['Endangered', '#FC7F3F'],
    'CR': ['Critically Endangered', '#D81E05'],
    'EW': ['Extinct in the Wild', '#542243'],
    'EX': ['Extinct', '#000000'],
    'DD': ['Data Deficient', '#D1D1C7'],
    'NE': ['Not Evaluated', '#FFFFFF']
}

def create_excel_formats(workbook):
    """Create and return all Excel formatting styles."""
    border = {'border': 1}
    
    formats = {
        'workbook': workbook,
        'data': workbook.add_format({
            'align': 'left',
            'valign': 'vcenter',
            **border
        }),
        'italic': workbook.add_format({
            'italic': True,
            'align': 'left',
            'valign': 'vcenter',
            **border
        }),
        'center': workbook.add_format({
            'align': 'center',
            'valign': 'vcenter',
            **border
        }),
        'accepted': workbook.add_format({
            'bg_color': '#BACD92',
            'font_color': '#000000',
            'bold': True,
            'align': 'center',
            'valign': 'vcenter',
            **border
        }),
        'unaccepted': workbook.add_format({
            'bg_color': '#FA7070',
            'font_color': '#000000',
            'bold': True,
            'align': 'center',
            'valign': 'vcenter',
            **border
        }),
        'yes': workbook.add_format({
            'bg_color': '#90EE90',
            'font_color': '#000000',
            'align': 'center',
            'valign': 'vcenter',
            **border
        }),
        'no': workbook.add_format({
            'bg_color': '#FFB6C1',
            'font_color': '#000000',
            'align': 'center',
            'valign': 'vcenter',
            **border
        })
    }
    
    for status_code, (status_name, color) in STATUS_IUCN.items():
        formats[f'iucn_{status_code}'] = workbook.add_format({
            'bg_color': color,
            'font_color': '#000000' if color != '#000000' else '#FFFFFF',
            'align': 'center',
            'valign': 'vcenter',
            **border
        })
    
    return formats

def auto_adjust_column_width(worksheet, df, formats):
    """Auto-adjust column width based on content."""
    for idx, col in enumerate(df.columns):
        # Calculate the maximum width needed
        max_len = len(str(col))  # Header length
        
        # Check content length
        for value in df[col].astype(str):
            if len(value) > max_len:
                max_len = len(value)
        
        # Set minimum and maximum widths
        width = min(max(max_len + 2, 10), 50)
        
        # Convert column index to Excel column letter
        col_letter = chr(65 + idx) if idx < 26 else f"{chr(65 + idx // 26 - 1)}{chr(65 + idx % 26)}"
        worksheet.set_column(f'{col_letter}:{col_letter}', width, formats['data'])

def format_worms_worksheet(worksheet, formats, df):
    """Apply WoRMS-specific formatting to worksheet."""
    # Auto-adjust all columns first
    auto_adjust_column_width(worksheet, df, formats)
    
    # Apply specific formatting to taxonomic columns
    worksheet.set_column('G:G', None, formats['italic'])  # Genus
    worksheet.set_column('H:H', None, formats['italic'])  # Species Name
    worksheet.set_column('J:J', None, formats['italic'])  # Valid Species Name
    worksheet.set_column('L:L', 15, formats['center'])    # Status
    
    worksheet.conditional_format('L2:L1000', {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"accepted"',
        'format': formats['accepted']
    })
    worksheet.conditional_format('L2:L1000', {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"unaccepted"',
        'format': formats['unaccepted']
    })
    
    # Format habitat columns
    for col in ['M', 'N', 'O', 'P', 'Q']:
        worksheet.set_column(f'{col}:{col}', 12, formats['center'])
        worksheet.conditional_format(f'{col}2:{col}1000', {
            'type': 'cell',
            'criteria': 'equal to',
            'value': '"Yes"',
            'format': formats['yes']
        })
        worksheet.conditional_format(f'{col}2:{col}1000', {
            'type': 'cell',
            'criteria': 'equal to',
            'value': '"No"',
            'format': formats['no']
        })
    
    worksheet.freeze_panes(1, 3)

def format_gbif_worksheet(worksheet, formats, df):
    """Apply GBIF-specific formatting to worksheet."""
    # Auto-adjust all columns first
    auto_adjust_column_width(worksheet, df, formats)
    
    # Apply specific formatting to taxonomic columns
    worksheet.set_column('G:I', None, formats['italic'])  # Genus, Species Name, Scientific Name
    worksheet.set_column('L:L', 15, formats['center'])    # Taxonomic Status
    
    accepted_format = formats['workbook'].add_format({
        'bg_color': '#90EE90',
        'font_color': '#000000',
        'bold': True,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1
    })
    synonym_format = formats['workbook'].add_format({
        'bg_color': '#FFE4B5',
        'font_color': '#000000',
        'bold': True,
        'align': 'center',
        'valign': 'vcenter',
        'border': 1
    })
    
    worksheet.conditional_format('L2:L1000', {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"ACCEPTED"',
        'format': accepted_format
    })
    worksheet.conditional_format('L2:L1000', {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"SYNONYM"',
        'format': synonym_format
    })
    
    worksheet.freeze_panes(1, 3)

def format_iucn_worksheet(worksheet, formats, df):
    """Apply IUCN-specific formatting to worksheet."""
    # Auto-adjust all columns first
    auto_adjust_column_width(worksheet, df, formats)
    
    # Apply specific formatting to species names
    worksheet.set_column('A:A', None, formats['italic'])  # Species_Name
    worksheet.set_column('B:B', 18, formats['center'])    # Red_List_Category
    
    # Format Red List categories with colors
    for status_code, (status_name, color) in STATUS_IUCN.items():
        worksheet.conditional_format('B2:B1000', {
            'type': 'cell',
            'criteria': 'equal to',
            'value': f'"{status_name}"',
            'format': formats[f'iucn_{status_code}']
        })
    
    # Format extinction flags
    for col in ['S', 'T']:  # Possibly_Extinct, Possibly_Extinct_Wild
        worksheet.set_column(f'{col}:{col}', 12, formats['center'])
        worksheet.conditional_format(f'{col}2:{col}1000', {
            'type': 'cell',
            'criteria': 'equal to',
            'value': '"Yes"',
            'format': formats['no']  # Red for extinction risk
        })
        worksheet.conditional_format(f'{col}2:{col}1000', {
            'type': 'cell',
            'criteria': 'equal to',
            'value': '"No"',
            'format': formats['yes']  # Green for not extinct
        })
    
    worksheet.freeze_panes(1, 3)

def format_bold_worksheet(worksheet, formats, df):
    """Apply BOLD Systems-specific formatting to worksheet."""
    # Auto-adjust all columns first
    auto_adjust_column_width(worksheet, df, formats)
    
    # Apply specific formatting to taxonomic columns
    worksheet.set_column('G:H', None, formats['italic'])  # Genus, Species Name
    
    worksheet.freeze_panes(1, 3)

def format_ncbi_worksheet(worksheet, formats, df):
    """Apply NCBI-specific formatting to worksheet."""
    # Auto-adjust all columns first
    auto_adjust_column_width(worksheet, df, formats)
    
    # Apply specific formatting to taxonomic columns
    worksheet.set_column('G:I', None, formats['italic'])  # Genus, Species Name, Scientific Name
    
    # Identificar colunas de sequências (terminam com '_Sequences')
    sequence_columns = [i for i, col in enumerate(df.columns) if col.endswith('_Sequences')]
    
    # Aplicar formatação numérica para colunas de sequências
    for col_idx in sequence_columns:
        col_letter = chr(65 + col_idx) if col_idx < 26 else f"{chr(65 + col_idx // 26 - 1)}{chr(65 + col_idx % 26)}"
        worksheet.set_column(f'{col_letter}:{col_letter}', 12, formats['center'])
        
        # Formatação condicional para destacar espécies com sequências
        worksheet.conditional_format(f'{col_letter}2:{col_letter}1000', {
            'type': 'cell',
            'criteria': '>',
            'value': 0,
            'format': formats['yes']
        })
        worksheet.conditional_format(f'{col_letter}2:{col_letter}1000', {
            'type': 'cell',
            'criteria': '=',
            'value': 0,
            'format': formats['no']
        })
    
    worksheet.freeze_panes(1, 3)

def format_eschmeyer_worksheet(worksheet, formats, df):
    """Apply Eschmeyer-specific formatting to worksheet."""
    # Auto-adjust all columns first
    auto_adjust_column_width(worksheet, df, formats)
    
    # Apply specific formatting to taxonomic columns
    worksheet.set_column('B:B', 15, formats['center'])    # Status
    worksheet.set_column('C:C', None, formats['italic'])  # Accepted_Name
    worksheet.set_column('E:F', None, formats['italic'])  # Original_Genus, Original_Epithet
    
    # Format status column with conditional formatting
    worksheet.conditional_format('B2:B1000', {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"Valid"',
        'format': formats['yes']
    })
    worksheet.conditional_format('B2:B1000', {
        'type': 'cell',
        'criteria': 'equal to',
        'value': '"Synonym"',
        'format': formats['no']
    })
    
    # Format synonyms count column
    worksheet.set_column('M:M', 12, formats['center'])  # Synonyms_Count
    
    worksheet.freeze_panes(1, 3)

def set_workbook_properties(workbook):
    """Set workbook metadata properties."""
    workbook.set_properties({
        'title': 'dataFishing - Consolidated Results',
        'subject': 'Developed by Luan Rabelo',
        'author': 'Luan Rabelo',
        'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'
    })
