<h2><p align="center">Manual <i>dataFishing</i> v1.0</p></h2>

<p align="center">
  <img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/dataFishing.png" width="50%" title="hover text">
</p>

# Installation

- <h3>Python</h3> 

  *dataFishing* requires the installation of Python environment. For installation on your operating system, refer to the website https://www.python.org/downloads/ **(Figure 1)**.  
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure1.png" width="100%" title="Figure 1">Figure 1. Python download page.</p>  
<br/>

After installation, users will be able to verify the installed Python version by running the command `python --version` in their operating system terminal, and a message like the one shown in **Figure 2** will appear.  
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

The “requests” library is used to obtain the fasta and gb files from NCBI repository. The **“pandas”** library is used for data manipulation, such as removing redundancies in the input file and for preparing the output file, in Excel format, with the mining data, whereas for writing this file, **“xlsxwriter”** library is used.
All these libraries are installed through modules within the script, and **Figure 4** shows an example of these modules.   
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure4.png" width="100%" title="Figure 4">Figure 4. Pandas library installation module.</p>  
<br/>  

In the example above **(Figure 4)**, an attempt to import the **“pandas”** library is shown (try:).  

If the script cannot import it, because it is not installed on the system (except ImportError:), the script will try to install it through the command `python -m pip install -U pandas`.  

However, as shown in **Note 1**, if the command to execute Python is `python3` rather than `python`, the user will need to edit the command for the installation in the script, in each module, adding the correct command for their system, as shown in **Figure 5**.  
<br/>

<p align="center"><img src="https://github.com/luanrabelo/dataFishing/blob/stable/assets/Figure5.png" width="100%" title="Figure 5">Figure 5. Installing Pandas library using the correct user PATH command.</p>  
<br/>  

# Running *dataFishing*
  - Obtaining *dataFishing*  
  
The dataFishing script is available at the GitHub repository https://github.com/luanrabelo/dataFishing/releases. An example input file is also available with the script, containing data on fish species of the family Carangidae as well as output files with the mining data of this family.
