import logging
import os
import re
from dotenv import load_dotenv

def load_api_keys(**kwargs):
    """Load API keys from apikeys.env file or environment variables."""
    verbose = kwargs.get('verbose', True)
    
    # Try to load from apikeys.env first
    env_file = 'apikeys.env'
    if os.path.exists(env_file):
        if verbose:
            logging.info(f"Loading API keys from {env_file}")
        load_dotenv(env_file)
    else:
        if verbose:
            logging.warning(f"API keys file '{env_file}' not found, checking environment variables")
        load_dotenv()  # Load from .env or environment variables
    
    api_keys = {
        'ncbi_email': os.getenv('NCBI_EMAIL'),
        'ncbi_api_key': os.getenv('NCBI_API_KEY'),
        'iucn_api_key': os.getenv('IUCN_API_KEY'),
        'gbif_api_key': os.getenv('GBIF_API_KEY'),
        'bold_api_key': os.getenv('BOLD_API_KEY')
    }
    
    return api_keys

def get_rate_limit_delay(**kwargs):
    """Get appropriate delay between requests based on API key availability."""
    has_api_key = kwargs.get('has_api_key', False)
    api_name = kwargs.get('api_name', 'generic')
    
    if has_api_key:
        return 0.25  # 4 requests per second with API key
    else:
        return 0.5   # 2 requests per second without API key

def email_checker(**kwargs):
    email = kwargs.get('email', None)
    verbose = kwargs.get('verbose', True)

    if email is None or len(email) == 0 or email == '':
        if verbose:
            logging.error("Email not provided!")
        return False
    else:
        if verbose:
            logging.info(f"Checking Email '{email}'...")
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if bool(re.match(pattern, email)):
            if verbose:
                logging.info(f"Email '{email}' is valid!")
            return True
        else:
            if verbose:
                logging.error(f"Email '{email}' is not valid!")
            return False

def create_folder(**kwargs):
    folder_name = kwargs.get('folder_name', 'dataFishing')
    folder_name = re.sub(r'[^A-Za-z0-9/-]+', '_', folder_name)
    verbose = kwargs.get('verbose', True)

    if not os.path.exists(folder_name):
        if verbose:
            logging.info(f"Creating Folder '{folder_name}'")
        try:
            os.makedirs(folder_name, mode=0o777, exist_ok=True)
        except Exception as e:
            if verbose:
                logging.error(f"Error creating folder '{folder_name}': {e}")

def clean_excel_data(text):
    """Clean text data for Excel compatibility."""
    if not text or text == '-':
        return '-'
    
    # Convert to string if not already
    text = str(text)
    
    # Remove newlines and excess whitespace
    text = ' '.join(text.split())
    
    # Limit length to prevent Excel issues
    if len(text) > 32767:  # Excel cell limit
        text = text[:32767] + '...'
    
    return text

def clean_iucn_data(value):
    """Clean IUCN data for consistent formatting."""
    if not value or value in [None, 'None', 'null', '']:
        return '-'
    
    # Convert to string
    value = str(value).strip()
    
    # Handle common null/empty values
    if value.lower() in ['none', 'null', 'n/a', 'na', '']:
        return '-'
    
    # Clean whitespace and newlines
    value = ' '.join(value.split())
    
    return value if value else '-'

def safe_join_data(data_list, separator='; '):
    """Safely join data list avoiding conflicts with internal separators."""
    if not data_list:
        return '-'
    
    # Clean each item and filter out empty ones
    cleaned_items = []
    for item in data_list:
        cleaned = clean_iucn_data(item)
        if cleaned and cleaned != '-':
            cleaned_items.append(cleaned)
    
    return separator.join(cleaned_items) if cleaned_items else '-'
