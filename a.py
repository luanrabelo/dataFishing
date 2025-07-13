
def timeFunctions(**kwargs):
    f = open("timeFunctionsGenomes.txt", "a+")
    function    = kwargs.get('function', None)
    _start      = kwargs.get('start', None)
    _end        = kwargs.get('end', None)
    f.write(f"{function}\t{_start}\t{_end}\n")
    f.close()

if __name__ == '__main__':
    _version    = f"Version: {__version__}"
    _status     = f"Status: {__status__}"
    _license    = f"License: {__license__}"
    _author     = f"Author: {__author__}"
    _github     = f"GitHub Page: https://github.com/{__github__}"
    
    
    parser.add_argument('-i', '--input', help="This argument specifies the path to the input file, which should be a .txt or .tsv file.\nIf it's a .txt file, it should be formatted such that each line contains a distinct species.\nIf it's a .tsv file, it should be obtained from the Bold System (http://www.boldsystems.org/).\nTo do this, conduct a search and obtain the TSV file by selecting the 'Combined: TSV' option.",
                        type=str,
                        required=True,
                        )
    parser.add_argument('--all', help=
                        '''This argument specifies whether to retrieve data from all available databases (IUCN, GBIF, WoRMS, BOLD, and NCBI).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--iucn', help=
                        '''This argument specifies whether to retrieve data from the IUCN Red List of Threatened Species.''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--gbif', help=
                        '''This argument specifies whether to retrieve data from the Global Biodiversity Information Facility (GBIF).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--worms', help=
                        '''This argument specifies whether to retrieve data from the World Register of Marine Species (WoRMS).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--bold', help=
                        '''This argument specifies whether to retrieve data from the Barcode of Life Data Systems (BOLD).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--ncbi', help=
                        '''This argument specifies whether to retrieve data from the National Center for Biotechnology Information (NCBI GenBank).''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--download', help=
                        '''This argument specifies whether to download the data retrieved from the BOLD and GenBank. Default is False.''',
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('--genesList', help=
                        '''This argument specifies the genes list to be retrieved from the NCBI.''',
                        type=str,
                        required=False,
                        )
    parser.add_argument('-e', '--email', help="Please include a previously registered email with NCBI using this link: https://account.ncbi.nlm.nih.gov/signup/",
                        type=str,
                        required=True,
                        )
    parser.add_argument('-v', '--verbose', help="This argument specifies if the verbose mode should be enabled or disabled. Default is True.",
                        default=True,
                        choices=[True, False],
                        type=bool,
                        required=False,
                        )
    parser.add_argument('-log', '--log', help="This argument specifies if the log mode should be enabled or disabled. Default is False.",
                        default=False,
                        choices=[True, False],
                        type=bool,
                        required=False,)
    
    
    args = parser.parse_args()
    _folderName     = time.strftime("%Y-%m-%d-%H-%M-%S")
    _inputFile      = args.input
    _all            = args.all
    _iucn           = args.iucn
    _gbif           = args.gbif
    _worms          = args.worms
    _bold           = args.bold
    _ncbi           = args.ncbi
    _genesList      = args.genesList
    _download       = args.download
    _inputVerbose   = args.verbose
    _inputLog       = args.log
    _timeSleep      = 1

    print("\n")
    print(f"{TerminalColors.Bold}############################## {__tool__} ##############################\n{TerminalColors.End}")
    print(f"{TerminalColors.Warning}{TerminalColors.Bold}{__tool__} Class has been initialized!{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_version}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_status}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_author}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_license}{TerminalColors.End}")
    print(f"{TerminalColors.Green}{_github}{TerminalColors.End}")
    print(f"Consult the documentation in github page for more information.\n")
    print(f"{TerminalColors.Bold}############################## {__tool__} ##############################{TerminalColors.End}\n")

    
    _spList = readInputFile(input=_inputFile, folder=_folderName, verbose=_inputVerbose)

    if _iucn == True or _all == True:
        dfIUCN              = pd.DataFrame()
        dfIUCN['Species']   = _spList
        resultsStatus                   = asyncio.run(IUCNStatusConservation(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Status Conservation']   = dfIUCN['Species'].map(resultsStatus)
        resultsSynonyms                 = asyncio.run(IUCNSynonymsNames(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Synonyms Names']        = dfIUCN['Species'].map(resultsSynonyms)
        resultsTaxonomy                 = asyncio.run(IUCNTaxonomy(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Taxonomy']              = dfIUCN['Species'].map(resultsTaxonomy)
        resultsCommon                   = asyncio.run(IUCNCommonNames(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Common Names']          = dfIUCN['Species'].map(resultsCommon)
        resultsOccurrence               = asyncio.run(IUCNCountryOccurrence(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Country Occurrence']    = dfIUCN['Species'].map(resultsOccurrence)
        resultsHabitat                  = asyncio.run(IUCNHabitats(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Habitats']              = dfIUCN['Species'].map(resultsHabitat)
        resultsThreats                  = asyncio.run(IUCNThreats(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfIUCN['Threats']              = dfIUCN['Species'].map(resultsThreats)
        dataFishingExcel(df=dfIUCN, sheet='IUCN', folderName=_folderName, verbose=_inputVerbose)
        dfIUCN.to_csv(f"dataFishing/{_folderName}/dataFishing_IUCN_Results.csv", index=False)
        dfIUCN.to_csv(f"dataFishing/{_folderName}/dataFishing_IUCN_Results.csv", sep='\t', index=False)
    
    if _gbif == True or _all == True:
        dfGBIF              = pd.DataFrame()
        dfGBIF['Species']   = _spList
        resultsGBIF         = asyncio.run(getGBIF(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfGBIF['Taxonomy']  = dfGBIF['Species'].map(dict(resultsGBIF))
        dataFishingExcel(df=dfGBIF, sheet='GBIF', folderName=_folderName, verbose=_inputVerbose)
        dfGBIF.to_csv(f"dataFishing/{_folderName}/dataFishing_GBIF_Results.csv", index=False)
        dfGBIF.to_csv(f"dataFishing/{_folderName}/dataFishing_GBIF_Results.csv", sep='\t', index=False)

    if _worms == True or _all == True:
        dfWORMS             = pd.DataFrame()
        dfWORMS['Species']  = _spList
        resultsWORMS        = asyncio.run(getWoRMS(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfWORMS['Taxonomy'] = dfWORMS['Species'].map(resultsWORMS)
        dataFishingExcel(df=dfWORMS, sheet='WoRMS', folderName=_folderName, verbose=_inputVerbose)

    if _bold == True or _all == True:
        dfBOLD              = pd.DataFrame()
        dfBOLD['Species']   = _spList
        resultsBOLD         = asyncio.run(getBoldSystem(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep))
        dfBOLD['Taxonomy']  = dfBOLD['Species'].map(dict(resultsBOLD))
        dataFishingExcel(df=dfBOLD, sheet='BoldSystem', folderName=_folderName, verbose=_inputVerbose)
        dfBOLD.to_csv(f"dataFishing/{_folderName}/dataFishing_BoldSystem_Results.csv", index=False)
        dfBOLD.to_csv(f"dataFishing/{_folderName}/dataFishing_BoldSystem_Results.csv", sep='\t', index=False)

        if _download:
            create_folder(folderName=f"dataFishing/{_folderName}/BOLD_Download_Sequences", verbose=_inputVerbose)
            for i in _spList:
                _url        = f'http://v3.boldsystems.org/index.php/API_Public/sequence?taxon={i}'
                _path       = os.path.join(f"dataFishing/{_folderName}/BOLD_Download_Sequences", str(i).replace(' ', '_'))
                _down       = requests.get(_url, stream = True)
                if _down.status_code == 200:
                    with open(f"{_path}.fasta", "a+", encoding='utf-8') as file:
                        file.write(_down.content.decode('utf-8'))
                    if _inputVerbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Green}Downloaded sequences for '{i}' from BOLD successfully!{TerminalColors.End}")
                else:
                    if _inputVerbose:
                        print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Fail}Error downloading sequences for '{i}' from BOLD!{TerminalColors.End}")
    
    if _ncbi == True or _all == True:
        dfNCBI              = pd.DataFrame()
        dfNCBI['Species']   = _spList
        _email              = email_checker(email=args.email, verbose=_inputVerbose)
        if _email:
            resultsNCBI         = asyncio.run(getNCBI(speciesList=_spList, verbose=_inputVerbose, log=_inputLog, time=_timeSleep, email=args.email))
            dfNCBI['Taxonomy']  = dfNCBI['Species'].map(dict(resultsNCBI))
            dataFishingExcel(df=dfNCBI, sheet='NCBI', folderName=_folderName, verbose=_inputVerbose)
        else:
            if _inputVerbose:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Email not valid!{TerminalColors.End}")
                sys.exit(1)
        if _download and _email:
            if _genesList:
                try:
                    with open(_genesList, 'r', encoding='utf-8') as file:
                        geneList = [line.strip() for line in file.readlines()]
                except:
                    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Error reading Gene List! Please check the file and try again!{TerminalColors.End}")
                    sys.exit(1)
                create_folder(folderName=f"dataFishing/{_folderName}/NCBI_Download_Sequences", verbose=_inputVerbose)
                for gene in geneList:
                    lstSeq = []
                    _sequencesNCBI = asyncio.run(getNCBIGenes(speciesList=_spList, verbose=True, email=args.email, geneName=gene))
                    for i in _sequencesNCBI:
                        for n in i:
                            if n not in lstSeq:
                                lstSeq.append(n)
                    with open(f"{gene}.txt", "a+") as file:
                        file.write(f"{os.path.basename(_inputFile).split('.')[0]},{len(lstSeq)}\n")
                    for index, id in enumerate(lstSeq):
                        _url        = f"https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?tool=portal&save=file&log$=seqview&db=nuccore&report=gbwithparts&id={id}&withparts=on"
                        _down       = requests.get(_url, stream = True)
                        _pathFile   = os.path.join(f"dataFishing/{_folderName}/NCBI_Download_Sequences", f"{id}.gb")
                        if _down.status_code == 200:
                            with open(_pathFile, "wb") as file:
                                file.write(_down.content)
                            if _inputVerbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Green}Downloaded sequences {index+1} of {len(lstSeq)} from NCBI successfully!{TerminalColors.End}")
                            for record in SeqIO.parse(_pathFile, 'genbank'):
                                try:
                                    _voucher = record.id
                                except:
                                    _voucher = '-'
                                try:
                                    _specie = record.annotations["organism"]
                                except:
                                    _specie = 'Unknown'
                                _specieFolder = re.sub(r'[^A-Za-z]+', '_', _specie)
                                create_folder(folderName=f"dataFishing/{_folderName}/NCBI_Download_Sequences/{_specieFolder}", verbose=False)
                                with open(f"dataFishing/{_folderName}/NCBI_Download_Sequences/{_specieFolder}/{gene}.fasta", "a+", encoding='utf-8') as file:
                                    file.write(f">{_voucher}_{_specie}\n{record.seq}\n")
                            os.remove(_pathFile)
                        else:
                            if _inputVerbose:
                                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S')}: {TerminalColors.Fail}Error downloading sequences from NCBI!{TerminalColors.End}")
            else:
                print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Fail}Gene List not provided!{TerminalColors.End}")
                sys.exit(1)
    print(f"{time.strftime('%Y/%m/%d - %H:%M:%S', time.localtime())}: {TerminalColors.Green}dataFishing process completed successfully!{TerminalColors.End}")
    # Citation
    print(f"{TerminalColors.Bold}\n\nHow to cite dataFishing:{TerminalColors.End}")
    print(f"Rabelo, L., Sodré, D., Balcázar, O. D. A., do Rosário, M. F., Guimarães-Costa, A. J., Gomes, G., Sampaio, I., & Vallinoto, M. (2025). dataFishing: An efficient Python tool and user-friendly web-form for mining mitochondrial and chloroplast sequences, taxonomic, and biodiversity data. Ecological Informatics, 85, 102970. https://doi.org/10.1016/j.ecoinf.2024.102970")