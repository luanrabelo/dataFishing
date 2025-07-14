import logging
import os
import re
from dotenv import load_dotenv
import time
import csv

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
        #'gbif_api_key': os.getenv('GBIF_API_KEY'),
        #'bold_api_key': os.getenv('BOLD_API_KEY')
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

class BenchmarkTimer:
    """Class to handle benchmarking timing for API calls."""
    
    def __init__(self, output_folder=".", verbose=True):
        self.output_folder = output_folder
        self.verbose = verbose
        self.benchmark_data = []
        self.current_api = None
        self.api_start_time = None
        self.species_count = 0
        
    def start_api_benchmark(self, api_name, species_count):
        """Start timing for an API."""
        self.current_api = api_name
        self.species_count = species_count
        self.api_start_time = time.time()
        
        if self.verbose:
            logging.info(f"Benchmark - Starting {api_name} API timing for {species_count} species...")
    
    def end_api_benchmark(self, success_count=None):
        """End timing for an API and save results."""
        if self.current_api is None or self.api_start_time is None:
            return
        
        end_time = time.time()
        duration = end_time - self.api_start_time
        
        if success_count is None:
            success_count = self.species_count
        
        # Calculate metrics
        avg_time_per_species = duration / self.species_count if self.species_count > 0 else 0
        success_rate = (success_count / self.species_count * 100) if self.species_count > 0 else 0
        species_per_second = self.species_count / duration if duration > 0 else 0
        
        benchmark_record = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'api_name': self.current_api,
            'total_species': self.species_count,
            'successful_species': success_count,
            'total_duration_seconds': round(duration, 3),
            'avg_time_per_species_seconds': round(avg_time_per_species, 3),
            'species_per_second': round(species_per_second, 3),
            'success_rate_percent': round(success_rate, 2)
        }
        
        self.benchmark_data.append(benchmark_record)
        
        if self.verbose:
            logging.info(f"Benchmark - {self.current_api} completed in {duration:.2f}s "
                        f"({success_count}/{self.species_count} species, {success_rate:.1f}% success rate)")
        
        # Reset for next API
        self.current_api = None
        self.api_start_time = None
        self.species_count = 0
    
    def save_benchmark_results(self, filename="benchmark_results.tsv"):
        """Save benchmark results to TSV file."""
        if not self.benchmark_data:
            if self.verbose:
                logging.warning("Benchmark - No benchmark data to save")
            return
        
        output_path = os.path.join(self.output_folder, filename)
        
        try:
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                fieldnames = [
                    'timestamp', 'api_name', 'total_species', 'successful_species',
                    'total_duration_seconds', 'avg_time_per_species_seconds',
                    'species_per_second', 'success_rate_percent'
                ]
                writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
                writer.writeheader()
                writer.writerows(self.benchmark_data)
            
            if self.verbose:
                logging.info(f"Benchmark - Results saved to {output_path}")
                
        except Exception as e:
            if self.verbose:
                logging.error(f"Benchmark - Error saving results: {e}")

def plot_benchmark_results(tsv_file_path, output_folder=".", verbose=True):
    """
    Plot benchmark results from TSV file using seaborn.
    
    Args:
        tsv_file_path (str): Path to the TSV file with benchmark data
        output_folder (str): Folder to save the plots
        verbose (bool): Enable verbose logging
    """
    try:
        import pandas as pd
        import matplotlib.pyplot as plt
        import seaborn as sns
        import matplotlib.dates as mdates
        from datetime import datetime
        
        # Set style
        plt.style.use('default')
        sns.set_palette("husl")
        
        # Read data
        df = pd.read_csv(tsv_file_path, sep='\t')
        
        if df.empty:
            if verbose:
                logging.warning("Benchmark - No data found in TSV file")
            return
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('dataFishing API Performance Benchmark Results', fontsize=16, fontweight='bold')
        
        # 1. Total Duration by API (Line Plot)
        ax1 = axes[0, 0]
        for api in df['api_name'].unique():
            api_data = df[df['api_name'] == api]
            ax1.plot(api_data['timestamp'], api_data['total_duration_seconds'], 
                    marker='o', linewidth=2, markersize=6, label=api)
        
        ax1.set_title('Total Execution Time by API', fontweight='bold')
        ax1.set_xlabel('Timestamp')
        ax1.set_ylabel('Duration (seconds)')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        ax1.tick_params(axis='x', rotation=45)
        
        # 2. Species Processing Rate (Bar Plot)
        ax2 = axes[0, 1]
        avg_rates = df.groupby('api_name')['species_per_second'].mean().sort_values(ascending=False)
        bars = ax2.bar(avg_rates.index, avg_rates.values, alpha=0.8)
        ax2.set_title('Average Species Processing Rate', fontweight='bold')
        ax2.set_xlabel('API')
        ax2.set_ylabel('Species per Second')
        ax2.tick_params(axis='x', rotation=45)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                    f'{height:.2f}', ha='center', va='bottom', fontweight='bold')
        
        # 3. Success Rate by API (Bar Plot)
        ax3 = axes[1, 0]
        avg_success = df.groupby('api_name')['success_rate_percent'].mean().sort_values(ascending=False)
        bars = ax3.bar(avg_success.index, avg_success.values, alpha=0.8, color='green')
        ax3.set_title('Average Success Rate by API', fontweight='bold')
        ax3.set_xlabel('API')
        ax3.set_ylabel('Success Rate (%)')
        ax3.set_ylim(0, 100)
        ax3.tick_params(axis='x', rotation=45)
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax3.text(bar.get_x() + bar.get_width()/2., height + 1,
                    f'{height:.1f}%', ha='center', va='bottom', fontweight='bold')
        
        # 4. Performance Comparison (Multiple Metrics)
        ax4 = axes[1, 1]
        
        # Normalize metrics for comparison (0-100 scale)
        df_norm = df.copy()
        df_norm['norm_duration'] = 100 - (df['total_duration_seconds'] / df['total_duration_seconds'].max() * 100)
        df_norm['norm_rate'] = df['species_per_second'] / df['species_per_second'].max() * 100
        df_norm['norm_success'] = df['success_rate_percent']
        
        metrics_summary = df_norm.groupby('api_name')[['norm_duration', 'norm_rate', 'norm_success']].mean()
        
        x = range(len(metrics_summary.index))
        width = 0.25
        
        ax4.bar([i - width for i in x], metrics_summary['norm_duration'], width, 
               label='Speed (inverted)', alpha=0.8)
        ax4.bar(x, metrics_summary['norm_rate'], width, 
               label='Processing Rate', alpha=0.8)
        ax4.bar([i + width for i in x], metrics_summary['norm_success'], width, 
               label='Success Rate', alpha=0.8)
        
        ax4.set_title('Overall Performance Comparison', fontweight='bold')
        ax4.set_xlabel('API')
        ax4.set_ylabel('Normalized Score (0-100)')
        ax4.set_xticks(x)
        ax4.set_xticklabels(metrics_summary.index, rotation=45)
        ax4.legend()
        ax4.set_ylim(0, 100)
        
        # Adjust layout
        plt.tight_layout()
        
        # Save plot
        output_path = os.path.join(output_folder, 'benchmark_performance_analysis.png')
        plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
        
        if verbose:
            logging.info(f"Benchmark - Performance plot saved to {output_path}")
        
        plt.close()
        
        # Create a summary table
        summary_stats = df.groupby('api_name').agg({
            'total_duration_seconds': ['mean', 'std', 'min', 'max'],
            'species_per_second': ['mean', 'std', 'min', 'max'],
            'success_rate_percent': ['mean', 'std', 'min', 'max'],
            'total_species': 'sum'
        }).round(3)
        
        # Save summary
        summary_path = os.path.join(output_folder, 'benchmark_summary.tsv')
        summary_stats.to_csv(summary_path, sep='\t')
        
        if verbose:
            logging.info(f"Benchmark - Summary statistics saved to {summary_path}")
            logging.info("\nBenchmark Summary:")
            print(summary_stats)
        
    except ImportError as e:
        if verbose:
            logging.error(f"Benchmark - Missing required packages for plotting: {e}")
            logging.error("Install with: pip install matplotlib seaborn")
    except Exception as e:
        if verbose:
            logging.error(f"Benchmark - Error creating plots: {e}")
