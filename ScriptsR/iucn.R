# Time Function
timeFunctions <- function(file, family, function_name, start, end) {
  # Check if the file exists; if not, create it
  if (!file.exists(paste0(file, ".txt"))) {
    cat("Family\tFunction\tStart\tEnd\n", file = paste0(file, ".txt"), append = TRUE)
  }
  # Append the information to the file
  cat(family,"\t", function_name, "\t", start, "\t", end, "\n", file = paste0(file, ".txt"), append = TRUE)
}

iucnKey <- '9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee'

library('readr')
library('dplyr')
library('tidyverse')
library('rredlist')
library('taxize')

fileList <- list.files(path = "D:/apps/dataFishing/dataFishing/Example/IUCN/", pattern = "*.txt", full.names = TRUE)

for (i in fileList) {
  df <- read_delim(i, delim = "\t", locale = locale(encoding = "windows-1252"), show_col_types = FALSE)
  df <- df %>% drop_na(species_name)
  # Get a list of unique species names
  spList <- unique(df$species_name)
  
  start <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  for (sp in spList) {
    Taxonomy <- iucn_id <- get_iucn(sp, key = iucnKey)
    print(Taxonomy)
  }
  end <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  
  timeFunctions(file = "Taxonomy_IUCN",
                family = gsub("\\.txt$", "", basename(i)),
                function_name = "taxize Package",
                start = start,
                end = end)
  
  start <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  
  for (sp in spList) {
    spResultTaxonomy <- rl_search(sp, key = iucnKey)
    print(spResultTaxonomy$result)
  }
  end <- format(Sys.time(), "%Y/%m/%d - %H:%M:%S")
  timeFunctions(file = "Taxonomy_IUCN",
                family = gsub("\\.txt$", "", basename(i)),
                function_name = "rredlist Package",
                start = start,
                end = end)
  rm(df, spList)
}






