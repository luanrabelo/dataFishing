/**
 * Eschmeyer's Catalog of Fishes API Integration
 */

class EschmeyerAPI {
    constructor() {
        this.baseURL = 'https://researcharchive.calacademy.org/research/ichthyology/catalog/fishcatget.asp';
        this.maxRetries = 3;
        this.retryDelay = 2000;
        console.log('🐟 EschmeyerAPI instance created');
    }

    parseResultText(text) {
        text = text.replace(/\s+/g, ' ').trim();
        
        const data = {
            originalEpithet: '-',
            originalGenus: '-',
            originalAuthorYear: '-',
            status: '-',
            acceptedName: '-',
            acceptedAuthorYear: '-',
            family: '-',
            subfamily: '-',
            typeLocality: '-',
            typeSpecimens: '-',
            habitat: '-',
            rawText: text
        };

        try {
            const originalMatch = text.match(/^([^,]+),\s+([A-Z][a-z]+(?:\s*\(.+?\))?)\s+(.*?)\s+(\d{4}):\d+/);
            if (originalMatch) {
                data.originalEpithet = originalMatch[1].trim();
                data.originalGenus = originalMatch[2].trim();
                data.originalAuthorYear = `${originalMatch[3].trim()} ${originalMatch[4].trim()}`;
            }

            const statusMatch = text.match(/Current status:\s*(.*?)\./);
            if (statusMatch) {
                const statusFull = statusMatch[1].trim();
                
                if (statusFull.includes('Synonym of')) {
                    data.status = 'Synonym';
                    const acceptedMatch = statusFull.match(/Synonym of\s+([A-Z][a-z]+\s+[a-z]+)\s+(\(.*?\d{4}\))/);
                    if (acceptedMatch) {
                        data.acceptedName = acceptedMatch[1].trim();
                        data.acceptedAuthorYear = acceptedMatch[2].trim();
                    }
                } else if (statusFull.includes('Valid as')) {
                    data.status = 'Valid';
                    const validMatch = statusFull.match(/Valid as\s+([A-Z][a-z]+\s+[a-z]+)\s+(\(.*?\d{4}\))/);
                    if (validMatch) {
                        data.acceptedName = validMatch[1].trim();
                        data.acceptedAuthorYear = validMatch[2].trim();
                    }
                } else {
                    data.status = 'Uncertain';
                }
            }

            const familyMatch = text.match(/([A-Z][a-z]+idae)(?::\s*([A-Z][a-z]+inae))?\./);
            if (familyMatch) {
                data.family = familyMatch[1];
                if (familyMatch[2]) {
                    data.subfamily = familyMatch[2];
                }
            }

            const habitatMatch = text.match(/Habitat:\s*(.*?)\./);
            if (habitatMatch) {
                data.habitat = habitatMatch[1].trim();
            }

            const tempText = text.replace(/^.*?ref\. \d+\]/, '');
            const localityMatch = tempText.match(/\]?\s*(.*?)\.\s*(Syntypes:|Holotype:|Lectotype:|Neotype:|Type catalog:|Based on)/);
            if (localityMatch) {
                const locality = localityMatch[1].trim();
                if (locality && !locality.startsWith('•') && !locality.includes('[')) {
                    data.typeLocality = locality;
                }
            }

            const typeMatch = text.match(/(Syntypes:|Holotype:|Lectotype:|Neotype:)\s*(.*?)\./);
            if (typeMatch) {
                data.typeSpecimens = typeMatch[2].trim();
            }

        } catch (error) {
            console.error('Error parsing Eschmeyer result text:', error);
        }

        return data;
    }

    async searchSpecies(speciesName) {
        const parts = speciesName.split(' ');
        if (parts.length < 2) {
            throw new Error('Invalid species name format. Must contain genus and species.');
        }

        const genus = parts[0];
        const species = parts[1];

        // URL da API do Eschmeyer
        const targetUrl = `${this.baseURL}?tbl=species&genus=${encodeURIComponent(genus)}&species=${encodeURIComponent(species)}`;

        // Lista de proxies CORS que funcionam com o Eschmeyer
        const proxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?',
            'https://cors-proxy.fringe.zone/',
            'https://proxy.cors.sh/'
        ];

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            // Primeiro, tentar requisição direta (pode funcionar em alguns casos)
            if (attempt === 0) {
                try {
                    console.log(`🐟 Eschmeyer - ${speciesName} Trying direct request (attempt ${attempt + 1}/${this.maxRetries})...`);
                    
                    const response = await fetch(targetUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (response.ok) {
                        const htmlContent = await response.text();
                        return this.parseHTML(htmlContent, speciesName);
                    }
                } catch (error) {
                    console.warn(`🐟 Eschmeyer - ${speciesName} Direct request failed:`, error.message);
                }
            }

            // Tentar com proxies CORS
            for (const proxy of proxies) {
                try {
                    console.log(`🐟 Eschmeyer - ${speciesName} Trying proxy: ${proxy.includes('allorigins') ? 'AllOrigins' : proxy.includes('corsproxy') ? 'CORSProxy' : proxy.includes('fringe') ? 'Fringe' : 'CORS.sh'} (attempt ${attempt + 1}/${this.maxRetries})...`);
                    
                    let proxyUrl;
                    let fetchOptions = {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                        }
                    };

                    if (proxy.includes('allorigins')) {
                        // AllOrigins retorna JSON com a propriedade 'contents'
                        proxyUrl = proxy + encodeURIComponent(targetUrl);
                    } else {
                        // Outros proxies retornam HTML diretamente
                        proxyUrl = proxy + encodeURIComponent(targetUrl);
                    }

                    const response = await fetch(proxyUrl, fetchOptions);

                    if (response.ok) {
                        let htmlContent;
                        
                        if (proxy.includes('allorigins')) {
                            // Para AllOrigins, extrair conteúdo do JSON
                            const jsonResponse = await response.json();
                            htmlContent = jsonResponse.contents;
                        } else {
                            // Para outros proxies, usar texto diretamente
                            htmlContent = await response.text();
                        }

                        if (htmlContent && htmlContent.length > 100) {
                            console.log(`🐟 Eschmeyer - ${speciesName} Successfully retrieved data via proxy`);
                            return this.parseHTML(htmlContent, speciesName);
                        }
                    }
                } catch (proxyError) {
                    console.warn(`🐟 Eschmeyer - ${speciesName} Proxy failed:`, proxyError.message);
                    continue;
                }
            }

            if (attempt < this.maxRetries - 1) {
                console.warn(`🐟 Eschmeyer - ${speciesName} All methods failed, retrying in ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
            }
        }

        // Se todas as tentativas falharam
        console.error(`🐟 Eschmeyer - ${speciesName} All attempts failed after ${this.maxRetries} retries`);
        return {
            speciesName: speciesName,
            status: 'Error',
            acceptedName: '-',
            acceptedAuthorYear: '-',
            originalGenus: '-',
            originalEpithet: '-',
            originalAuthorYear: '-',
            family: '-',
            subfamily: '-',
            habitat: '-',
            typeLocality: '-',
            typeSpecimens: '-',
            synonymsCount: '0',
            rawText: 'Unable to access Eschmeyer database - CORS restrictions'
        };
    }

    parseHTML(htmlContent, speciesName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const resultElements = doc.querySelectorAll('p.result');

        if (resultElements.length === 0) {
            return {
                speciesName: speciesName,
                status: 'Not Found',
                acceptedName: '-',
                acceptedAuthorYear: '-',
                originalGenus: '-',
                originalEpithet: '-',
                originalAuthorYear: '-',
                family: '-',
                subfamily: '-',
                habitat: '-',
                typeLocality: '-',
                typeSpecimens: '-',
                synonymsCount: '0',
                rawText: 'No results found'
            };
        }

        const allResults = [];
        let validEntry = null;
        let synonymsCount = 0;

        for (const element of resultElements) {
            const textContent = element.textContent || element.innerText;
            const parsedData = this.parseResultText(textContent);
            allResults.push(parsedData);

            if (parsedData.status === 'Valid') {
                validEntry = parsedData;
            } else if (parsedData.status === 'Synonym') {
                synonymsCount++;
            }
        }

        if (!validEntry && allResults.length > 0) {
            validEntry = allResults[0];
            synonymsCount = allResults.length - 1;
        }

        if (validEntry) {
            return {
                speciesName: speciesName,
                status: validEntry.status,
                acceptedName: validEntry.acceptedName || '-',
                acceptedAuthorYear: validEntry.acceptedAuthorYear || '-',
                originalGenus: validEntry.originalGenus || '-',
                originalEpithet: validEntry.originalEpithet || '-',
                originalAuthorYear: validEntry.originalAuthorYear || '-',
                family: validEntry.family || '-',
                subfamily: validEntry.subfamily || '-',
                habitat: validEntry.habitat || '-',
                typeLocality: validEntry.typeLocality || '-',
                typeSpecimens: validEntry.typeSpecimens || '-',
                synonymsCount: synonymsCount.toString(),
                rawText: validEntry.rawText.substring(0, 200) + (validEntry.rawText.length > 200 ? '...' : '')
            };
        }

        return {
            speciesName: speciesName,
            status: 'Error',
            acceptedName: '-',
            acceptedAuthorYear: '-',
            originalGenus: '-',
            originalEpithet: '-',
            originalAuthorYear: '-',
            family: '-',
            subfamily: '-',
            habitat: '-',
            typeLocality: '-',
            typeSpecimens: '-',
            synonymsCount: '0',
            rawText: 'Error parsing results'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null) {
        const results = [];
        const total = speciesList.length;

        console.log(`🐟 Eschmeyer - Starting search for ${total} species using CORS proxy`);
        console.log(`🐟 Eschmeyer - Note: Using proxy servers to bypass browser CORS restrictions`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];
            
            try {
                console.log(`🐟 Eschmeyer - Processing ${species} (${i + 1}/${total})...`);
                
                const result = await this.searchSpecies(species);
                results.push(result);

                if (onSpeciesComplete) {
                    onSpeciesComplete(result, i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }

                // Rate limiting mais conservador devido ao uso de proxies
                if (i < speciesList.length - 1) {
                    await this.delay(2000); // 2 segundos entre requests
                }

            } catch (error) {
                console.error(`🐟 Eschmeyer - Error processing ${species}:`, error);
                
                results.push({
                    speciesName: species,
                    status: 'Error',
                    acceptedName: '-',
                    acceptedAuthorYear: '-',
                    originalGenus: '-',
                    originalEpithet: '-',
                    originalAuthorYear: '-',
                    family: '-',
                    subfamily: '-',
                    habitat: '-',
                    typeLocality: '-',
                    typeSpecimens: '-',
                    synonymsCount: '0',
                    rawText: `Error: ${error.message}`
                });

                if (onSpeciesComplete) {
                    onSpeciesComplete(results[results.length - 1], i + 1, total);
                }

                if (onProgress) {
                    onProgress(i + 1, total);
                }
            }
        }

        return results;
    }
}

// Garantir que a instância global seja criada imediatamente
if (typeof window !== 'undefined') {
    // Criar instância global imediatamente
    window.eschmeyerAPI = new EschmeyerAPI();
    console.log('🐟 Eschmeyer API loaded and instance created successfully');
    
    // Também disponibilizar a classe globalmente para compatibilidade
    window.EschmeyerAPI = EschmeyerAPI;
} else {
    // Para ambientes não-browser (Node.js)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = EschmeyerAPI;
    }
}
