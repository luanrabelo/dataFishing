# Time Function
timeFunctions <- function(file, family, function_name, start, end) {
  # Check if the file exists; if not, create it
  if (!file.exists(paste0(file, ".txt"))) {
    cat("Family\tFunction\tStart\tEnd\n", file = paste0(file, ".txt"), append = TRUE)
  }
  # Append the information to the file
  cat(family,"\t", function_name, "\t", start, "\t", end, "\n", file = paste0(file, ".txt"), append = TRUE)
}

library('readr')
library('dplyr')
library('tidyverse')
library('taxize')
library("rgbif")

fileList <- list.files(path = "D:/apps/dataFishing/dataFishing/Example/GBIF/", pattern = "*.txt", full.names = TRUE)

for (i in fileList) {
  df <- read_delim(i, delim = "\t", locale = locale(encoding = "windows-1252"), show_col_types = FALSE)
  df <- df %>% drop_na(species_name)
  # Get a list of unique species names
  spList <- unique(df$species_name)
  
  start <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  for (sp in spList) {
    chave_taxonomica <- name_backbone(name = sp)$usageKey[1]
    dados_taxonomia <- name_usage(key = chave_taxonomica, data = 'all')
    print(dados_taxonomia)
  }
  end <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  
  timeFunctions(file = "Taxonomy_GBIF",
                family = gsub("\\.txt$", "", basename(i)),
                function_name = "rgbif Package",
                start = start,
                end = end)
  
  #start <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  #for (sp in spList) {
  #  TaxonomiaResultado <- classification(sp, db="gbif")
  #  print(TaxonomiaResultado)
  #}
  #end <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  #timeFunctions(file = "Taxonomy_GBIF",
  #              family = gsub("\\.txt$", "", basename(i)),
  #              function_name = "taxize Package",
  #              start = start,
  #              end = end)
  rm(df, spList)
}

