<p align="center">
<a href="https://www.buymeacoffee.com/lprabelo">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Eucalyp-Deus_Coffee.png/640px-Eucalyp-Deus_Coffee.png" width="10%">
<br>
Did you like my bioinformatic scripts? Buy me a coffee to help me make more!
</a>
</p>

<h2><p align="center">Manual <i>dataFishing</i> v1.0</p></h2>

<p align="center">
  <img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/dataFishing.svg" width="75%" title="hover text">
</p>

# Installation

- <h3>Python</h3> 

*dataFishing* requires the installation of Python 3 environment. For installation on your operating system, refer to the website https://www.python.org/downloads/ **(Figure 1)**.  
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure1.png" width="100%" title="Figure 1">Figure 1. Python 3 download page.</p>  
<br/>

After installation, users will be able to verify the installed Python version by running the command `python3 --version` in their operating system terminal, and a message like the one shown in **Figure 2** will appear.  
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure2.png" width="100%" title="Figure 2">Figure 2. Command to check the installed Python version.</p>
<br/>  

> **Note 1: In the user's operating system PATH, pay attention to the Python execution command, which can be `python --version` or `python3 --version` (Figure 3).**
<br/>  

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure3.png" width="100%" title="Figure 3">Figure 3. Different ways to run Python depending on the downloaded version.</p>  
<br/>

# Libraries

After installing Python, the libraries, such as the **“biopython”** library, must be installed as *dataFishing* uses external libraries to perform specific functions.  

The gene sequences of a particular species are then searched using the Entrez tool. We also use libraries to read the files obtained, and to extract as extensive information.  

The **“requests”** library is used to obtain the fasta and gb files from NCBI repository. The **“pandas”** library is used for data manipulation, such as removing redundancies in the input file and for preparing the output file, in Excel format, with the mining data, whereas for writing this file, **“xlsxwriter”** library is used.
All these libraries are installed through modules within the script, and **Figure 4** shows an example of these modules.   
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure5.png" width="100%" title="Figure 4">Figure 4. Pandas library installation module.</p>  
<br/>  

In the example above **(Figure 4)**, an attempt to import the **“pandas”** library is shown (try:).  

If the script cannot import it, because it is not installed on the system (except ImportError:), the script will try to install it through the command `python3 -m pip install -U pandas`.  

However, as shown in **Note 1**, if the command to execute Python is `python3` rather than `python`, the user will need to edit the command for the installation in the script, in each module, adding the correct command for their system, as shown in **Figure 5**.  
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure4.png" width="100%" title="Figure 5">Figure 5. Installing Pandas library using the correct user PATH command.</p>  
<br/>  

# Running *dataFishing*
  - Obtaining *dataFishing*  
  
The *dataFishing* script is available at the GitHub repository https://github.com/luanrabelo/dataFishing/releases. An example input file is also available with the script, containing data on fish species of the family Carangidae as well as output files with the mining data of this family.  

  - Input File

*dataFishing* accepts a file in **TSV format** as input for data mining, and this file is obtained directly from the **BOLD Systems** website (https://www.boldsystems.org/).  

On the website, click *“Explore the Data”* **(Figure 6)**, and a search field will appear for the user. Thereafter, type the term you want to search, for example: Family Carangidae **(Figure 7A)**.  
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure6.png" width="100%" title="Figure 6">Figure 6. BOLD Systems initial page.</p>  
<br/>  

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure7.png" width="100%" title="Figure 7">Figure 7. Search page for the systematic term about a given species, such as an order, family, or genus (A). Type of file to obtain containing the search results (B).</p>  
<br/>  

After searching **(Figure 7 A)**, find the option **“Combined:”** and click the option to get a **TSV file (Figure 7 B)**. After getting the text file with the data, we can start the mining process.  
<br/>  

# Running *dataFishing*  

Arguments are needed for the mining process. **Figure 8** shows the complete command executed in the terminal:  
<br/>  

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure8.png" width="100%" title="Figure 8">Figure 8. Command for executing dataFishing, where arguments must be provided.</p>  
<br/>  

> **(1) Shows the user running the script and the folder the terminal is accessing. This part may be slightly different depending on the operating system or the terminal used. However, the user needs to pay attention to which folder the terminal is accessing, a specific folder or the default root folder. In the figure, the terminal is accessing the folder `/home/luan`.**  

> **(2) This is the command to run a Python script, remembering that the command may be different *(python or python3)* depending on the system or version of Python installed; *see Note 1 for more details*.**  

> **(3) The full path where the *dataFishing.py* script is located. Here, the user can simply drag and drop the script on the terminal so that it finds the path. It is worth mentioning that a directory will be created in the folder where the terminal is working to store the output files *(see the step (1) for more information)*.**  

> **(4) In this path, the user will need to inform the full path of the input file *(See section 2.2)*.**  

> **(5) Enter a valid email address to use the tool.**  

> **(6) The user needs to inform the time (in seconds) that the script will have to wait between queries, because the NCBI does not accept a high number of requests in a brief time, which may cause an error in the Entrez tool usage. Enter a time between 5 and 10 seconds to avoid errors, remembering that this parameter will influence the mining time.**  

# Output  

After the mining process, an Excel file will appear so that the user can visualise which genes, from which species, and from which specimen the sequences were found in NCBI **(Figure 9)**.  

In addition, a second spreadsheet will contain data on the location of specimens extracted from the input file, so that the researcher will be able to search which genes are available for the same specimen or which specimens from the same region have available genes.  
<br/>  

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure9.png" width="100%" title="Figure 9">Figure 9. Output file in Excel format containing the list of genes found and their respective vouchers.</p>  
<br/>  
