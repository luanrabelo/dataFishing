__author__      = "Luan Rabelo"
__license__     = "MIT"
__version__     = "1.0"
__maintainer__  = "Luan Rabelo"
__email__       = "luanrabelo@outlook.com"
__date__        = "2022/07/21"
__twitter__     = "lprabelo"

import os, time, sys

class bcolors:
    Header      = '\033[95m'
    Blue        = '\033[94m'
    Cyan        = '\033[96m'
    Green       = '\033[92m'
    Warning     = '\033[93m'
    Fail        = '\033[91m'
    End         = '\033[0m'
    Bold        = '\033[1m'
    Underline   = '\033[4m'

try:
    import xlsxwriter
except ImportError:
    cmd = "python3 -m pip install -U xlsxwriter"
    os.system(cmd)
    import xlsxwriter

try:
    import pandas as pd
except ImportError:
    cmd = "python3 -m pip install -U pandas"
    os.system(cmd)
    import pandas as pd

try:
    import requests
except ImportError:
    cmd = "python3 -m pip install -U requests"
    os.system(cmd)
    import requests

try:
    import Bio
    from Bio import Entrez
except ImportError:
    cmd = "python3 -m pip install -U biopython"
    os.system(cmd)
    import Bio
    from Bio import Entrez

try:
    import Bio
    from Bio import SeqIO
except ImportError:
    cmd = "python3 -m pip install -U biopython"
    os.system(cmd)
    import Bio
    from Bio import SeqIO

try:
    from collections import OrderedDict
except ImportError:
    cmd = "python3 -m pip install -U collections"
    os.system(cmd)
    from collections import OrderedDict

try:
    from operator import itemgetter
except ImportError:
    cmd = "python3 -m pip install -U operator"
    os.system(cmd)
    from operator import itemgetter

# Table Excel
SpecieName      = []
Genome          = []
GeneRhodopsin   = []
GeneRAG         = []
GeneZic         = []
GeneCOI         = []
GeneCOII        = []
GeneCOIII       = []
GeneCYTB        = []
# Bold Table
BoldSpeciesName     = []
BoldSampleID        = []
BoldLat             = []
BoldLon             = []
BoldCountry         = []
BoldState           = []
BoldRegion          = []
BoldAccession       = []
Bin                 = []
Code                = []
MarkerCode          = []
BoldSpecie          = []
# Genome
GenomeString        = ''
idGenome            = []
GenVouchers         = []
SampleGenomeString  = ''
VouchersGenome      = []
SampleGenome        = []
# Rhodopsin
RhodopsinString         = ''
idRhodopsin             = []
RodVouchers             = []
SampleRhodopsinString   = ''
VouchersRhodopsin       = []
SampleRhodopsin         = []
# RAG-1
RagString       = ''
idRAG           = []
RagVouchers     = []
SampleRagString = ''
VouchersRag     = []
SampleRag       = []
# ZIC-1
ZicString       = ''
idZic           = []
ZicVouchers     = []
SampleZicString = ''
VouchersZic     = []
SampleZic       = []
# COI
COIString       = ''
idCOI           = []
CO1Vouchers     = []
SampleCOIString = ''
VouchersCOI     = []
SampleCOI       = []
# COII
COIIString          = ''
idCOII              = []
CO2Vouchers         = []
SampleCOIIString    = ''
VouchersCOII        = []
SampleCOII          = []
# COIII
COIIIString         = ''
idCOIII             = []
CO3Vouchers         = []
SampleCOIIIString   = ''
VouchersCOIII       = []
SampleCOIII         = []
# CYTB
CYTBString          = ''
idCYTB              = []
CobVouchers         = []
SampleCYTBString    = ''
VouchersCYTB        = []
SampleCYTB          = []

Now = time.strftime("%Y_%m_%d-%H_%M_%S")

Developer   = "Developer: Luan Rabelo;\n\nCollaborators:\nOscar Balcázar,\nMurilo Furtado,\nAurycéia Guimarães-Costa,\nIracilda Sampaio,\nMarcelo Vallinoto;\n"
Github      = "https://github.com/luanrabelo/dataFishing"
Coffee      = "https://www.buymeacoffee.com/lprabelo"
print("==========================================================================================================\n")
print(f"{bcolors.Cyan}\ndataFishing - Developed by lprabelo{bcolors.End}")
print(f"{bcolors.Cyan}{Github.center(20, '=')}\n{bcolors.End}")
print(f"{bcolors.Cyan}{Developer.center(20, '=')}\n{bcolors.End}")
print(f"{bcolors.Bold}{bcolors.Cyan}{Coffee.center(20, '=')}\n{bcolors.End}{bcolors.End}")
print("==========================================================================================================\n")


def CreateFolder(Folder):
    Folder = Folder.replace(":", "").replace(".", "")
    if not os.path.exists(Folder):
        print(f"{bcolors.Blue}{bcolors.Warning}Creating Folder {Folder}, please wait...{bcolors.End}")
        os.makedirs(Folder)


CreateFolder("dataFishing/"+Now+"/datasets/")

# Search mtGenome gene in NCBI
def mtGenome(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (mitochondrion[Title]) AND (complete[Title] OR partial[Title]) AND (genome[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        Genome.append("Found")
        print(f"{bcolors.Blue}Mitochondrial Genome {Specie} Found {bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("mtGenome Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download mtGenome {Specie} {bcolors.End}")
            VouchersGenome.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/mtgenome/fasta/", Specie))
            DownloadGenBankFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/mtgenome/", Specie)
            idGenome.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}mtGenome {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("mtGenome not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        Genome.append("MISSING")
        idGenome.append("-")
        time.sleep(Time)
    Search.close()
    
# Search rhodopsin gene in NCBI
def Rhodopsin(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    SpecieName.append(Specie)
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (rod[Title] OR rhodopsin[Title] OR rhodopsin-like[Title] OR rhod[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneRhodopsin.append("Found")
        print(f"{bcolors.Blue}Rhodopsin {Specie} Found {bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("Rhodopsin Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download Rhodopsin {Specie} {bcolors.End}")
            VouchersRhodopsin.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-Rhodopsin/", Specie))
            idRhodopsin.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}Rhodopsin {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("Rhodopsin not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneRhodopsin.append("MISSING")
        idRhodopsin.append("-")
        time.sleep(Time)
    Search.close()
    
# Search RAG gene in NCBI
def RAG(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (RAG[Title] OR RAG1[Title] OR RAG-1[Title] OR RAG-1-POL[Title] OR RAG-1-MUT[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneRAG.append("Found")
        print(f"{bcolors.Blue}RAG {Specie} Found {bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("RAG Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download RAG {Specie} {bcolors.End}")
            VouchersRag.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-RAG/", Specie))
            idRAG.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}RAG {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("RAG not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneRAG.append("MISSING")
        idRAG.append("-")
        time.sleep(Time)
    Search.close()
    
# Search Zic gene in NCBI
def Zic(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (Zic[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneZic.append("Found")
        print(f"{bcolors.Blue}Zic {Specie} Found{bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("Zic Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download Zic {Specie} {bcolors.End}")
            VouchersZic.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-zic/", Specie))
            idZic.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}Zic {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("Zic not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneZic.append("MISSING")
        idZic.append("-")
        time.sleep(Time)
    Search.close()
    
# Search COI gene in NCBI
def COI(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (COI[Title] OR cytochrome c oxidase subunit I[Title] OR cytochrome oxidase subunit 1[Title] OR cytochrome c oxidase subunit 1[Title] OR chytochrome c oxidase subunit I[Title] OR cytochrome oxidase subunits I[Title] OR cytochrome oxidase subunit I[Title] OR cytochrome oxydase subunit 1[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneCOI.append("Found")
        print(f"{bcolors.Blue}COI {Specie} Found{bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("COI Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download COI {Specie} {bcolors.End}")
            VouchersCOI.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-COI/", Specie))
            idCOI.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}COI {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("COI not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneCOI.append("MISSING")
        idCOI.append("-")
        time.sleep(Time)
    Search.close()
    
# Search COII gene in NCBI
def COII(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (COII[Title] OR cytochrome c oxidase subunit II[Title] OR cytochrome oxidase subunit 2[Title] OR cytochrome c oxidase subunit 2[Title] OR chytochrome c oxidase subunit II[Title] OR cytochrome oxidase subunits II[Title] OR cytochrome oxidase subunit II[Title] OR cytochrome oxydase subunit 2[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneCOII.append("Found")
        print(f"{bcolors.Blue}COII {Specie} Found {bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("COII Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download COII {Specie} {bcolors.End}")
            VouchersCOII.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-COII/", Specie))
            idCOII.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}COII {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("COII not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneCOII.append("MISSING")
        idCOII.append("-")
        time.sleep(Time)
    Search.close()
    
# Search COIII gene in NCBI
def COIII(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (COIII[Title] OR cytochrome c oxidase subunit III[Title] OR cytochrome oxidase subunit 3[Title] OR cytochrome c oxidase subunit 3[Title] OR chytochrome c oxidase subunit III[Title] OR cytochrome oxidase subunits III[Title] OR cytochrome oxidase subunit III[Title] OR cytochrome oxydase subunit 3[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneCOIII.append("Found")
        print(f"{bcolors.Blue}COIII {Specie} Found{bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("COIII Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download COIII {Specie} {bcolors.End}")
            VouchersCOIII.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-COIII/", Specie))
            idCOIII.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}COIII {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("COIII not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneCOIII.append("MISSING")
        idCOIII.append("-")
        time.sleep(Time)
    Search.close()
    
# Search CYTB gene in NCBI
def CYTB(Specie, Email, Time):
    Specie = Specie.replace(":", "").replace(".", "")
    Entrez.email    = Email
    Entrez.tool     = 'dataFishing'
    Search          = Entrez.esearch(
        db = "nuccore", 
        term = '("'+Specie+'"[Organism] OR "'+Specie+'"[Title]) AND (CYTB[Title] OR cytochrome b[Title] OR Cytochrome b apoenzyme[Title] OR cob[Title] OR cytb protein[Title])"')
    SearchResult    = Entrez.read(Search)
    if(int(SearchResult["Count"]) > 0):
        GeneCYTB.append("Found")
        print(f"{bcolors.Blue}CYTB {Specie} Found {bcolors.End}")
        for Voucher in SearchResult["IdList"]:
            Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
            Log.write(str(Specie)+": "+str("CYTB Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
            Log.close()
            print(f"{bcolors.Warning}Download CYTB {Specie} {bcolors.End}")
            VouchersCYTB.append(DownloadFastaFile(Voucher, "dataFishing/"+Now+"/datasets/"+Specie+"/NCBI-CYTB/", Specie))
            idCYTB.append(Voucher)
            time.sleep(Time)
    else:
        print(f"{bcolors.Fail}CYTB {Specie} not found! {bcolors.End}")
        Log = open("dataFishing/"+Now+"/dataFishing.log", "a+")
        Log.write(str(Specie)+": "+str("CYTB not Found in NCBI")+time.strftime("%Y/%m/%d-%H:%M:%S")+"\r")
        Log.close()
        GeneCYTB.append("MISSING")
        idCYTB.append("-")
        time.sleep(Time)
    Search.close()
    
def ReadBoldFile(File):
    df = pd.read_csv(File, sep = '\t', header = 0, encoding = 'cp1252', low_memory = False)
    df = df.reset_index()
    for index, row in df.iterrows():
        if (str(row['species_name']) != "nan"):
            if row['genbank_accession'] != "-SUPPRESSED":
                SpecieNameBold = str(row['species_name']).replace(":", "").replace(".", "")
                print(f"{bcolors.Warning}Writing COI {SpecieNameBold} from BOLD System {bcolors.End}")
                CreateFolder(f"dataFishing/{Now}/datasets/{SpecieNameBold}/BOLD-COI/")
                Fasta = open(f"dataFishing/{Now}/datasets/{SpecieNameBold}/BOLD-COI/fromBOLD_{SpecieNameBold}_{row['recordID']}.fasta", "w")
                Fasta.write(f">{SpecieNameBold}_{row['sampleid']}\n{row['nucleotides']}")
                Fasta.close()

def ReadFile(File, Email, Time):
    df = pd.read_csv(File, sep = '\t', header = 0, encoding = 'cp1252', low_memory = False)
    df = df.reset_index()
    SpeciesName = {}
    for index, row in df.iterrows():
        if (str(row['species_name']) != "nan"):
            if (row['species_name'] not in SpeciesName.keys()):
                SpeciesName[row['species_name']] = 1
            else:
                Old = SpeciesName[row['species_name']]
                SpeciesName[row['species_name']] = Old + 1
    for key, value in SpeciesName.items():
        Rhodopsin(str(key), Email, Time)
        RhodopsinString = '\n'.join(idRhodopsin)
        RodVouchers.append(RhodopsinString)
        idRhodopsin.clear()
        SampleRhodopsinString = "\n".join(VouchersRhodopsin)
        SampleRhodopsin.append(SampleRhodopsinString)
        VouchersRhodopsin.clear()
    for key, value in SpeciesName.items():
        RAG(str(key), Email, Time)
        RagString = '\n'.join(idRAG)
        RagVouchers.append(RagString)
        idRAG.clear()
        SampleRagString = "\n".join(VouchersRag)
        SampleRag.append(SampleRagString)
        VouchersRag.clear()
    for key, value in SpeciesName.items():
        Zic(str(key), Email, Time)
        ZicString = '\n'.join(idZic)
        ZicVouchers.append(ZicString)
        idZic.clear()
        SampleZicString = "\n".join(VouchersZic)
        SampleZic.append(SampleZicString)
        VouchersZic.clear()
    for key, value in SpeciesName.items():
        COI(str(key), Email, Time)
        COIString = '\n'.join(idCOI)
        CO1Vouchers.append(COIString)
        idCOI.clear()
        SampleCOIString = "\n".join(VouchersCOI)
        SampleCOI.append(SampleCOIString)
        VouchersCOI.clear()
    for key, value in SpeciesName.items():
        COII(str(key), Email, Time)
        COIIString = '\n'.join(idCOII)
        CO2Vouchers.append(COIIString)
        idCOII.clear()
        SampleCOIIString = "\n".join(VouchersCOII)
        SampleCOII.append(SampleCOIIString)
        VouchersCOII.clear()
    for key, value in SpeciesName.items():
        COIII(str(key), Email, Time)
        COIIIString = '\n'.join(idCOIII)
        CO3Vouchers.append(COIIIString)
        idCOIII.clear()
        SampleCOIIIString = "\n".join(VouchersCOIII)
        SampleCOIII.append(SampleCOIIIString)
        VouchersCOIII.clear()
    for key, value in SpeciesName.items():
        CYTB(str(key), Email, Time)
        CYTBString = '\n'.join(idCYTB)
        CobVouchers.append(CYTBString)
        idCYTB.clear()
        SampleCYTBString = "\n".join(VouchersCYTB)
        SampleCYTB.append(SampleCYTBString)
        VouchersCYTB.clear()
    for key, value in SpeciesName.items():
        mtGenome(str(key), Email, Time)
        GenomeString = '\n'.join(idGenome)
        GenVouchers.append(GenomeString)
        idGenome.clear()
        SampleGenomeString = "\n".join(VouchersGenome)
        SampleGenome.append(SampleGenomeString)
        VouchersGenome.clear()

def DownloadFastaFile(Voucher, Folder = "dataFishing/"+Now+"/datasets/", Specie = ""):
    CreateFolder(Folder)
    url = "https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=fasta&id="+Voucher+"&conwithfeat=on&withparts=on&hide-cdd=on"
    FileName    = Voucher+".fasta"
    Path        = os.path.join(Folder, FileName)
    Download    = requests.get(url, stream = True)
    LogFile     = open(Folder+Now+".log", "a+")
    Sample      = ''
    if Download.ok:
        with open(Path, 'wb') as f:
            for chunk in Download.iter_content(chunk_size = 1024*8):
                if chunk:
                    f.write(chunk)
                    f.flush()
                    os.fsync(f.fileno())
                    LogText = "Download %s has been successfully" % Specie
                    LogFile.write(Now+"-"+LogText+"\n")
                    print(f"{bcolors.Green}{LogText}{bcolors.End}")
                    with open(Path) as handle:
                        for record in SeqIO.parse(handle, "fasta"):
                            voucher = record.description
                            if voucher.count("voucher ") == 0:
                                Sample      = '-'
                            else:
                                data =  (voucher.split('voucher '))[1].split(' ')[0]
                                if data != "" or data != " " or data != "  ":
                                    Sample = data
                                else:
                                    Sample      = '-'
    else:
        Sample      = '-'
        LogText = "Download failed: status code {}\n{}".format(Download.status_code, Download.text)
        LogFile.write(Now+"-"+LogText+"\n")
        print(LogText)
    LogFile.close()
    return Sample

def DownloadGenBankFile(Voucher, Folder = "dataFishing/"+Now+"/datasets/", Specie = ""):
    CreateFolder(Folder)
    url = "https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=gbwithparts&id="+Voucher+"&withparts=on"
    FileName    = Voucher+".gb"
    Path        = os.path.join(Folder, FileName)
    Download    = requests.get(url, stream = True)
    LogFile     = open(Folder+Now+".log", "w")
    if Download.ok:
        with open(Path, 'wb') as f:
            for chunk in Download.iter_content(chunk_size = 1024*8):
                if chunk:
                    f.write(chunk)
                    f.flush()
                    os.fsync(f.fileno())
                    LogText = "Download %s has been successfully" % Specie
                    LogFile.write(Now+"-"+LogText+"\n")
                    print(F"{bcolors.Green}{LogText}{bcolors.End}")
        GetGenes(Path, Folder, Voucher, Specie)
    else:
        LogText = "Download failed: status code {}\n{}".format(Download.status_code, Download.text)
        LogFile.write(Now+"-"+LogText+"\n")
        print(LogText)
    LogFile.close()

def GetGenes(File, Folder, Voucher, Specie):
    Specie = Specie.replace(":", "").replace(".", "")
    print("Processing Genome...")
    for rec in SeqIO.parse(File, "genbank"):
        if rec.features:
            for feature in rec.features:
                if feature.type == "CDS":
                    time.sleep(1)
                    if (str(feature.qualifiers["gene"]).replace("'", "") == "[ND1]" or str(feature.qualifiers["gene"]).replace("'", "") == "[nad1]"):
                        print("Processing NADH1 fasta")
                        f = open(Folder+"NADH1.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ND2]"or str(feature.qualifiers["gene"]).replace("'", "") == "[nad2]"):
                        print("Processing NADH2 fasta")
                        f = open(Folder+"NADH2.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[COX1]" or str(feature.qualifiers["gene"]).replace("'", "") == "[cox1]" or str(feature.qualifiers["gene"]).replace("'", "") == "[COI]" or str(feature.qualifiers["gene"]).replace("'", "") == "[COXI]"):
                        print("Processing COI fasta")
                        f = open(Folder+"COI.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[COX2]" or str(feature.qualifiers["gene"]).replace("'", "") == "[cox2]" or str(feature.qualifiers["gene"]).replace("'", "") == "[COII]" or str(feature.qualifiers["gene"]).replace("'", "") == "[COXII]"):
                        print("Processing COII fasta")
                        f = open(Folder+"COII.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ATP8]" or str(feature.qualifiers["gene"]).replace("'", "") == "[atp8]" or str(feature.qualifiers["gene"]).replace("'", "") == "[ATPase 8]"):
                        print("Processing ATP8 fasta")
                        f = open(Folder+"ATP8.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ATP6]" or str(feature.qualifiers["gene"]).replace("'", "") == "[atp6]" or str(feature.qualifiers["gene"]).replace("'", "") == "[ATPase 6]"):
                        print("Processing ATP6 fasta")
                        f = open(Folder+"ATP6.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[COX3]" or str(feature.qualifiers["gene"]).replace("'", "") == "[cox3]" or str(feature.qualifiers["gene"]).replace("'", "") == "[COIII]" or str(feature.qualifiers["gene"]).replace("'", "") == "[COXIII]"):
                        print("Processing COIII fasta")
                        f = open(Folder+"COIII.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ND3]" or str(feature.qualifiers["gene"]).replace("'", "") == "[nad3]"):
                        print("Processing NADH3 fasta")
                        f = open(Folder+"NADH3.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ND4]" or str(feature.qualifiers["gene"]).replace("'", "") == "[nad4]"):
                        print("Processing NADH4 fasta")
                        f = open(Folder+"NADH4.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ND4L]" or str(feature.qualifiers["gene"]).replace("'", "") == "[nad4l]"):
                        print("Processing NADH4L fasta")
                        f = open(Folder+"NADH4L.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ND5]" or str(feature.qualifiers["gene"]).replace("'", "") == "[nad5]"):
                        print("Processing NADH5 fasta")
                        f = open(Folder+"NADH5.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[ND6]" or str(feature.qualifiers["gene"]).replace("'", "") == "[nad6]"):
                        print("Processing NADH6 fasta")
                        f = open(Folder+"NADH6.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    elif (str(feature.qualifiers["gene"]).replace("'", "") == "[CYTB]" or str(feature.qualifiers["gene"]).replace("'", "") == "[cob]" or str(feature.qualifiers["gene"]).replace("'", "") == "[Cyt b]"):
                        print("Processing CYTB fasta")
                        f = open(Folder+"CYTB.fasta", "a+")
                        f.write(f">{Voucher}_{Specie}\n")
                        f.write(str(feature.location.extract(rec).seq)+"\n")
                        f.close()
                    else:
                        print("Erro "+ str(feature.qualifiers["gene"]))
def BoldData(File):
    df2 = pd.read_csv(File, sep = '\t', header = 0, encoding = 'cp1252', low_memory = False)
    df2 = df2.reset_index()
    for index, row in df2.iterrows():
        if (str(row['species_name']) != "nan"):
            BoldSpeciesName.append(row['species_name'])
            BoldSampleID.append(row['sampleid'])
            BoldLat.append(row['lat'])
            BoldLon.append(row['lon'])
            BoldCountry.append(row['country'])
            BoldState.append(row['province_state'])
            BoldRegion.append(row['region'])
            BoldAccession.append(row['genbank_accession'])
            Bin.append(row['bin_uri'])
            Code.append(row['markercode'])
            MarkerCode.append(row['marker_codes'])
            BoldSpecie.append("fromBOLD_"+str(row['species_name']).replace(":", "").replace(".", "")+"_"+str(row['recordID'])+".fasta")
if __name__ == "__main__":
    File    = sys.argv[1]
    Email   = sys.argv[2]
    Time    = sys.argv[3]
    ReadFile(File, Email, int(Time))
    BoldData(File)
    df1 = pd.DataFrame({
        'Specie': SpecieName,
        'mtGenome': Genome,
        'mtGenome Vouchers': GenVouchers,
        'mtGenome Samples': SampleGenome,
        'Rhodopsin': GeneRhodopsin,
        'Rhodopsin Vouchers': RodVouchers,
        'Rhodopsin Samples': SampleRhodopsin,
        'RAG-1': GeneRAG,
        'RAG-1 Vouchers': RagVouchers,
        'RAG-1 Samples': SampleRag,
        'ZIC-1': GeneZic,
        'ZIC-1 Vouchers': ZicVouchers,
        'ZIC-1 Samples': SampleZic,
        'COI': GeneCOI,
        'COI Vouchers': CO1Vouchers,
        'COI Samples': SampleCOI,
        'COII': GeneCOII,
        'COII Vouchers': CO2Vouchers,
        'COII Samples': SampleCOII,
        'COIII': GeneCOIII,
        'COIII Vouchers': CO3Vouchers,
        'COIII Samples': SampleCOIII,
        'CYTB': GeneCYTB,
        'CYTB Vouchers': CobVouchers,
        'CYTB Samples': SampleCYTB
        })
    df2 = pd.DataFrame({
        'File Name' : BoldSpecie,
        'Accession': BoldAccession,
        'Sample ID': BoldSampleID,
        'Species Name': BoldSpeciesName,
        'Bin': Bin,
        'Code' : Code,
        'Marker Codes' : MarkerCode,
        'Country': BoldCountry,
        'State': BoldState,
        'Region': BoldRegion,
        'Lat': BoldLat,
        'Lon': BoldLon
        })
    with pd.ExcelWriter(f"dataFishing/{Now}/dataFishingGenesLog.xlsx", engine = 'xlsxwriter') as writer:
        df1.to_excel(writer, sheet_name='dataFishing NCBI', index = False)
        df2.to_excel(writer, sheet_name='dataFishing BOLD' , index = False)
        workbook  = writer.book
        YES = workbook.add_format({'bg_color': '#C6EFCE', 'font_color': '#000000'})
        NO  = workbook.add_format({'bg_color': '#FFC7CE', 'font_color': '#000000'})
        Format = workbook.add_format({'text_wrap': True, 'align': 'center', 'valign': 'vcenter', 'border': 1 })
        worksheet1 = writer.sheets['dataFishing NCBI']
        worksheet2 = writer.sheets['dataFishing BOLD']
        worksheet1.set_column('A:Z', cell_format = Format)
        worksheet1.set_column("A:Z", 20)
        worksheet1.conditional_format('A2:Z1000', {'type': 'text', 'criteria': 'containing', 'value': 'Found', 'format': YES})
        worksheet1.conditional_format('A2:Z1000', {'type': 'text', 'criteria': 'containing', 'value': 'MISSING', 'format': NO })
        worksheet2.set_column('A:Z', cell_format = Format)
        worksheet2.set_column("A:Z", 25)
        workbook.set_properties({
        'title':    'dataFishing',
        'subject':  'Created by Luan Rabelo',
        'author':   'Luan Rabelo',
        'comments': f'Created with dataFishing in {time.strftime("%Y/%m/%d - %H:%M:%S")}'})
    ReadBoldFile(File)
    print(f"\n{bcolors.Cyan}{os.path.basename(File)} dataFishing Done{bcolors.End}")
    print(f"\n{bcolors.Cyan}Files Downloaded in dataFishing/{Now}{bcolors.End}")
    print(f"\n{bcolors.Bold}{bcolors.Cyan}https://www.buymeacoffee.com/lprabelo{bcolors.End}{bcolors.End}")
    print(f"\n{bcolors.Cyan}Cite dataFishing{bcolors.End}")