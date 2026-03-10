/**
 * IUCN Red List API v4 Integration
 * Uses a Cloudflare Worker as CORS reverse proxy to call api.iucnredlist.org
 * The Worker URL and API token are configured in the UI and stored in localStorage
 */

class IucnAPI {
    constructor() {
        this.workerUrl = 'https://summer-resonance-3244.luan-rabelo.workers.dev';
        this.token = '';
        this.maxRetries = 5;
        this.retryDelay = 2000;
        console.log('IUCN API v4 (Cloudflare Worker Proxy) instance created');
    }

    setWorkerUrl(url) {
        this.workerUrl = url.replace(/\/+$/, '');
    }

    setToken(token) {
        this.token = token;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Strip HTML tags from a string
     */
    cleanHtml(html) {
        if (!html || html === '-') return '';
        if (typeof html !== 'string') html = String(html);
        const temp = document.createElement('textarea');
        temp.innerHTML = html;
        const decoded = temp.value;
        const stripped = decoded.replace(/<[^>]*>/g, '').trim();
        return stripped.replace(/\s+/g, ' ').trim();
    }

    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str || typeof str !== 'string') return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Extract description.en from nested objects (common v4 pattern)
     */
    getDescriptionEn(obj) {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'object' && obj.description) {
            if (typeof obj.description === 'object') {
                return obj.description.en || '';
            }
            return String(obj.description);
        }
        if (typeof obj === 'object' && obj.en) {
            return obj.en;
        }
        return '';
    }

    /**
     * Fetch a single IUCN API v4 endpoint through the Worker proxy
     * @param {string} endpoint - e.g. /api/v4/taxa/scientific_name?genus_name=Panthera&species_name=tigris
     */
    async apiFetch(endpoint) {
        const url = `${this.workerUrl}${endpoint}`;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': this.token
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (attempt < this.maxRetries - 1) {
                    console.warn(`IUCN - Retry ${attempt + 1}/${this.maxRetries}: ${error.message}`);
                    await this.delay(this.retryDelay);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Search for a species using API v4 (two-step: taxa + assessment)
     */
    async searchSpecies(speciesName, options = {}) {
        try {
            console.log(`IUCN - ${speciesName} Fetching taxa data...`);

            // Parse species name into genus + epithet
            const parts = speciesName.trim().split(/\s+/);
            if (parts.length < 2) {
                console.warn(`IUCN - ${speciesName} Invalid species name format`);
                return this.createNotFoundResult(speciesName);
            }

            const genusName = parts[0];
            const speciesEpithet = parts[1];

            // Step A: Fetch taxa data
            const taxaUrl = `/api/v4/taxa/scientific_name?genus_name=${encodeURIComponent(genusName)}&species_name=${encodeURIComponent(speciesEpithet)}`;
            const taxaData = await this.apiFetch(taxaUrl);

            console.log(`IUCN - ${speciesName} Raw taxa response:`, taxaData);

            if (!taxaData || !taxaData.taxon) {
                console.warn(`IUCN - ${speciesName} No taxon data found`);
                return this.createNotFoundResult(speciesName);
            }

            const taxon = taxaData.taxon;

            // Build result object with taxonomy from taxon
            const result = {
                taxId: String(taxon.sis_id || '-'),
                speciesName: speciesName,
                scientificName: String(taxon.scientific_name || speciesName),
                kingdom: taxon.kingdom_name ? this.capitalize(String(taxon.kingdom_name)) : '-',
                phylum: taxon.phylum_name ? this.capitalize(String(taxon.phylum_name)) : '-',
                class: taxon.class_name ? this.capitalize(String(taxon.class_name)) : '-',
                order: taxon.order_name ? this.capitalize(String(taxon.order_name)) : '-',
                family: taxon.family_name ? this.capitalize(String(taxon.family_name)) : '-',
                genus: taxon.genus_name ? this.capitalize(String(taxon.genus_name)) : genusName,
                authority: String(taxon.authority || '-'),
                // Common names from taxon
                mainCommonName: '-',
                commonNamesList: '-',
                // SSC Groups
                sscGroups: '-',
                // Synonyms from taxon
                synonymsCount: '0',
                synonymsList: '-',
                // Assessment fields (filled from assessment call)
                assessmentId: '-',
                categoryCode: '-',
                categoryFull: 'Not Found',
                criteria: '-',
                redListVersion: '-',
                assessmentDate: '-',
                yearPublished: '-',
                populationTrend: '-',
                systems: '-',
                biogeographicalRealms: '-',
                scopes: '-',
                possiblyExtinct: 'No',
                possiblyExtinctInWild: 'No',
                countriesCount: '0',
                countriesList: '-',
                habitatsCount: '0',
                habitatsList: '-',
                threatsCount: '0',
                threatsList: '-',
                stressesCount: '0',
                stressesList: '-',
                conservationActionsCount: '0',
                conservationActionsList: '-',
                researchNeededCount: '0',
                researchNeededList: '-',
                useTradeCount: '0',
                useTradeList: '-',
                populationText: '-',
                populationSeverelyFragmented: '-',
                populationSize: '-',
                generationalLength: '-',
                areaOfOccupancy: '-',
                extentOfOccurrence: '-',
                populationContinuingDecline: '-',
                noOfSubpopulations: '-',
                congregatory: '-',
                rangeText: '-',
                habitatText: '-',
                threatsFullText: '-',
                conservationActionsText: '-',
                useTradeText: '-',
                taxonomicNotes: '-',
                rationale: '-',
                referencesCount: '0',
                referencesList: '-',
                creditsList: '-',
                citation: '-',
                lowerElevationLimit: '-',
                upperElevationLimit: '-',
                lowerDepthLimit: '-',
                upperDepthLimit: '-',
                movementPatterns: '-',
                // Additional supplementary_info fields
                areaRestrictedIsRestricted: '-',
                numberOfLocations: '-',
                continuingDeclineInArea: '-',
                conservationActionsInPlace: '-',
                identificationInformation: '-',
                extremeFluctuations: '-',
                continuingDeclineInSubpopulations: '-',
                extremeFluctuationsInSubpopulations: '-',
                allIndividualsInOneSubpopulation: '-',
                noOfIndividualsInLargestSubpopulation: '-',
                continuingDeclineInAreaOfOccupancy: '-',
                extremeFluctuationsInAreaOfOccupancy: '-',
                continuingDeclineInExtentOfOccurrence: '-',
                extremeFluctuationsInExtentOfOccurrence: '-',
                continuingDeclineInNumberOfLocations: '-',
                extremeFluctuationsInNumberOfLocations: '-',
                // Documentation - additional fields
                trendJustification: '-',
                // Composed supplementary details for display
                supplementaryDetails: '-',
                iucnUrl: ''
            };

            // Extract common names from taxon
            const commonNames = taxon.common_names || [];
            if (commonNames.length > 0) {
                const mainNames = [];
                const otherNames = [];

                for (const nameData of commonNames) {
                    const isMain = String(nameData.main || 'false').toLowerCase() === 'true';
                    const name = nameData.name || '';
                    const language = nameData.language || '';

                    if (name && name !== '-') {
                        const nameStr = language ? `${name} (${language})` : name;
                        if (isMain) {
                            mainNames.push(nameStr);
                            if (result.mainCommonName === '-') {
                                result.mainCommonName = nameStr;
                            }
                        } else {
                            otherNames.push(nameStr);
                        }
                    }
                }

                const allNames = [...mainNames, ...otherNames];
                if (result.mainCommonName === '-' && allNames.length > 0) {
                    result.mainCommonName = allNames[0];
                }
                result.commonNamesList = allNames.length > 0 ? allNames.join('; ') : '-';
            }

            // Extract synonyms from taxon
            const synonyms = taxon.synonyms || [];
            result.synonymsCount = String(synonyms.length);
            if (synonyms.length > 0) {
                const synonymsList = [];
                for (const syn of synonyms) {
                    const genus = this.cleanHtml(syn.genus_name || '');
                    const species = this.cleanHtml(syn.species_name || '');
                    const infraType = this.cleanHtml(syn.infra_type || '');
                    const infraName = this.cleanHtml(syn.infra_name || '');
                    const authority = this.cleanHtml(syn.species_author || syn.infrarank_author || '');

                    const parts = [];
                    if (genus) parts.push(genus);
                    if (species) parts.push(species);
                    if (infraType && infraName) parts.push(`${infraType} ${infraName}`);

                    if (parts.length > 0) {
                        let synonymName = parts.join(' ');
                        if (authority) synonymName += `|||${authority}`;
                        synonymsList.push(synonymName);
                    }
                }
                result.synonymsList = synonymsList.length > 0 ? synonymsList.join('; ') : '-';
            }

            // Extract SSC Groups from taxon
            const sscGroups = taxon.ssc_groups || [];
            if (sscGroups.length > 0) {
                const groupNames = [];
                for (const group of sscGroups) {
                    const name = this.cleanHtml(group.name || '');
                    if (name) groupNames.push(name);
                }
                result.sscGroups = groupNames.length > 0 ? groupNames.join('; ') : '-';
            }

            // Find the latest global assessment
            const assessments = taxaData.assessments || [];
            if (assessments.length > 0) {
                // Filter for global scope assessments
                let globalAssessments = assessments.filter(a => {
                    const scopes = a.scopes || [];
                    return scopes.some(scope => {
                        const desc = scope.description || {};
                        const en = typeof desc === 'object' ? (desc.en || '') : String(desc);
                        return en.toLowerCase() === 'global';
                    });
                });

                let latestAssessment;
                if (globalAssessments.length > 0) {
                    latestAssessment = globalAssessments.reduce((a, b) =>
                        parseInt(a.year_published || 0) > parseInt(b.year_published || 0) ? a : b
                    );
                } else {
                    latestAssessment = assessments.reduce((a, b) =>
                        parseInt(a.year_published || 0) > parseInt(b.year_published || 0) ? a : b
                    );
                }

                // Category mapping
                const categoryMapping = {
                    'EX': 'Extinct', 'EW': 'Extinct in the Wild',
                    'CR': 'Critically Endangered', 'EN': 'Endangered',
                    'VU': 'Vulnerable', 'NT': 'Near Threatened',
                    'LC': 'Least Concern', 'DD': 'Data Deficient',
                    'NE': 'Not Evaluated',
                    'V': 'Vulnerable', 'LR/lc': 'Least Concern',
                    'E': 'Endangered', 'RE': 'Regionally Extinct'
                };

                const catCode = latestAssessment.red_list_category_code || '';
                result.categoryCode = catCode || '-';
                result.categoryFull = categoryMapping[catCode] || (catCode || 'Not Evaluated');
                result.yearPublished = String(latestAssessment.year_published || '-');
                result.possiblyExtinct = latestAssessment.possibly_extinct ? 'Yes' : 'No';
                result.possiblyExtinctInWild = latestAssessment.possibly_extinct_in_the_wild ? 'Yes' : 'No';

                // Step B: Fetch detailed assessment data
                const assessmentId = latestAssessment.assessment_id;
                if (assessmentId) {
                    result.assessmentId = String(assessmentId);
                    try {
                        await this.delay(500); // Rate limiting
                        const assessmentData = await this.apiFetch(`/api/v4/assessment/${assessmentId}`);
                        console.log(`IUCN - ${speciesName} Assessment details:`, assessmentData);

                        if (assessmentData) {
                            this.parseAssessmentData(result, assessmentData, speciesName);
                        }
                    } catch (e) {
                        console.warn(`IUCN - ${speciesName} Could not fetch assessment details: ${e.message}`);
                    }
                }
            }

            console.log(`IUCN - ${speciesName} Successfully found: Category=${result.categoryFull}, Trend=${result.populationTrend}`);
            return result;

        } catch (error) {
            console.error(`IUCN - Error processing ${speciesName}: ${error.message}`);
            return this.createErrorResult(speciesName, error.message);
        }
    }

    /**
     * Parse detailed assessment data into result object
     * Follows the exact same field extraction as the Python iucn.py
     */
    parseAssessmentData(result, data, speciesName) {
        // Log complete assessment data for debugging
        console.log(`IUCN - ${speciesName} FULL ASSESSMENT JSON:`, JSON.stringify(data, null, 2));

        // Capture the URL directly from assessment data
        if (data.url) {
            result.iucnUrl = data.url;
        }

        // Criteria (e.g., "A2abcd")
        if (data.criteria) {
            result.criteria = String(data.criteria);
        }

        // Red List version
        const redListCat = data.red_list_category || {};
        if (redListCat.version) {
            result.redListVersion = String(redListCat.version);
        }
        // Also extract category description from detail if available
        if (redListCat.description) {
            const catDesc = typeof redListCat.description === 'object' ? (redListCat.description.en || '') : String(redListCat.description);
            if (catDesc) result.categoryFull = catDesc;
        }
        if (redListCat.code) {
            result.categoryCode = String(redListCat.code);
        }

        // Assessment date
        if (data.assessment_date) {
            try {
                result.assessmentDate = data.assessment_date.split('T')[0];
            } catch (e) {
                result.assessmentDate = String(data.assessment_date);
            }
        }

        // Year published
        if (data.year_published) {
            result.yearPublished = String(data.year_published);
        }

        // Possibly extinct
        if (data.possibly_extinct != null) {
            result.possiblyExtinct = data.possibly_extinct ? 'Yes' : 'No';
        }
        if (data.possibly_extinct_in_the_wild != null) {
            result.possiblyExtinctInWild = data.possibly_extinct_in_the_wild ? 'Yes' : 'No';
        }

        // Population trend
        const popTrend = data.population_trend;
        if (popTrend) {
            const trendDesc = popTrend.description;
            if (trendDesc && typeof trendDesc === 'object') {
                result.populationTrend = this.capitalize(trendDesc.en || '-');
            } else if (trendDesc) {
                result.populationTrend = this.capitalize(String(trendDesc));
            }
        }

        // Systems
        const systems = data.systems || [];
        if (systems.length > 0) {
            const sysNames = [];
            for (const sys of systems) {
                const desc = sys.description;
                let name = '';
                if (desc && typeof desc === 'object') {
                    name = desc.en || '';
                } else if (desc) {
                    name = String(desc);
                }
                if (name) sysNames.push(this.capitalize(name));
            }
            result.systems = sysNames.length > 0 ? sysNames.join('; ') : '-';
        }

        // Biogeographical realms
        const realms = data.biogeographical_realms || [];
        if (realms.length > 0) {
            const realmNames = [];
            for (const realm of realms) {
                const desc = realm.description;
                let name = '';
                if (desc && typeof desc === 'object') {
                    name = desc.en || '';
                } else if (desc) {
                    name = String(desc);
                }
                if (name) realmNames.push(this.capitalize(name));
            }
            result.biogeographicalRealms = realmNames.length > 0 ? realmNames.join('; ') : '-';
        }

        // Scopes
        const scopes = data.scopes || [];
        if (scopes.length > 0) {
            const scopeNames = [];
            for (const scope of scopes) {
                const desc = scope.description;
                let name = '';
                if (desc && typeof desc === 'object') {
                    name = desc.en || '';
                } else if (desc) {
                    name = String(desc);
                }
                if (name) scopeNames.push(this.capitalize(name));
            }
            result.scopes = scopeNames.length > 0 ? scopeNames.join('; ') : '-';
        }

        // Countries / Locations (enhanced with endemic, formerlyBred, seasonality)
        const locations = data.locations || [];
        result.countriesCount = String(locations.length);
        if (locations.length > 0) {
            const countriesList = [];
            for (const loc of locations) {
                const desc = loc.description;
                let countryName = '';
                if (desc && typeof desc === 'object') {
                    countryName = desc.en || '';
                } else if (desc) {
                    countryName = String(desc);
                }

                const presence = this.cleanHtml(loc.presence || '');
                const origin = this.cleanHtml(loc.origin || '');
                const isEndemic = loc.is_endemic;
                const formerlyBred = this.cleanHtml(loc.formerlyBred || '');
                const seasonality = loc.seasonality || [];

                if (countryName) {
                    let details = [];
                    if (presence && presence !== '-') details.push(presence);
                    if (origin && origin !== '-') details.push(origin);
                    if (isEndemic) details.push('Endemic');
                    if (formerlyBred && formerlyBred !== '-') details.push(`Formerly bred: ${formerlyBred}`);
                    if (seasonality.length > 0) details.push(seasonality.join(', '));

                    let countryInfo = countryName;
                    if (details.length > 0) {
                        countryInfo += ` (${details.join(', ')})`;
                    }
                    countriesList.push(countryInfo);
                }
            }
            result.countriesList = countriesList.length > 0 ? countriesList.join('; ') : '-';
        }

        // Habitats (enhanced with code)
        const habitats = data.habitats || [];
        result.habitatsCount = String(habitats.length);
        if (habitats.length > 0) {
            const habitatsList = [];
            for (const habitat of habitats) {
                const desc = habitat.description;
                let habitatName = '';
                if (desc && typeof desc === 'object') {
                    habitatName = desc.en || '';
                } else if (desc) {
                    habitatName = String(desc);
                }

                const code = String(habitat.code || '').replace(/_/g, '.');
                const suitability = this.cleanHtml(this.getDescriptionEn(habitat.suitability) || '');
                const season = this.cleanHtml(this.getDescriptionEn(habitat.season) || '');
                const majorImportance = habitat.majorImportance;

                if (habitatName) {
                    let habitatInfo = code ? `${code}: ${habitatName}` : habitatName;
                    const details = [];
                    if (suitability && suitability !== '-') details.push(`Suitability: ${suitability}`);
                    if (season && season !== '-') details.push(`Season: ${season}`);
                    if (majorImportance != null) {
                        const importance = String(majorImportance).toLowerCase() === 'yes' ? 'Yes' : 'No';
                        details.push(`Major importance: ${importance}`);
                    }
                    if (details.length > 0) {
                        habitatInfo += ` (${details.join('; ')})`;
                    }
                    habitatsList.push(habitatInfo);
                }
            }
            result.habitatsList = habitatsList.length > 0 ? habitatsList.join('; ') : '-';
        }

        // Threats (enhanced with scope, timing, severity, score, internationalTrade)
        const threats = data.threats || [];
        result.threatsCount = String(threats.length);
        if (threats.length > 0) {
            const threatsList = [];
            for (const threat of threats) {
                const desc = threat.description;
                let threatName = '';
                if (desc && typeof desc === 'object') {
                    threatName = desc.en || '';
                } else if (desc) {
                    threatName = String(desc);
                }

                const code = String(threat.code || '').replace(/_/g, '.');
                const scope = this.cleanHtml(this.getDescriptionEn(threat.scope) || '');
                const timing = this.cleanHtml(this.getDescriptionEn(threat.timing) || '');
                const severity = this.cleanHtml(this.getDescriptionEn(threat.severity) || '');
                const score = this.cleanHtml(this.getDescriptionEn(threat.score) || '');
                const intlTrade = threat.internationalTrade;

                if (threatName) {
                    let threatInfo = code ? `${code}: ${threatName}` : threatName;
                    const details = [];
                    if (scope) details.push(`Scope: ${scope}`);
                    if (timing) details.push(`Timing: ${timing}`);
                    if (severity) details.push(`Severity: ${severity}`);
                    if (score) details.push(`Score: ${score}`);
                    if (intlTrade) details.push(`International Trade: ${intlTrade}`);
                    if (details.length > 0) {
                        threatInfo += ` [${details.join('; ')}]`;
                    }
                    threatsList.push(threatInfo);
                }
            }
            result.threatsList = threatsList.length > 0 ? threatsList.join('; ') : '-';
        }

        // Stresses
        const stresses = data.stresses || [];
        result.stressesCount = String(stresses.length);
        if (stresses.length > 0) {
            const stressesList = [];
            for (const stress of stresses) {
                const desc = stress.description;
                let stressName = '';
                if (desc && typeof desc === 'object') {
                    stressName = desc.en || '';
                } else if (desc) {
                    stressName = String(desc);
                }
                const code = String(stress.code || '').replace(/_/g, '.');
                if (stressName) {
                    const stressInfo = code ? `${code}: ${stressName}` : stressName;
                    stressesList.push(stressInfo);
                }
            }
            // Deduplicate stresses
            const uniqueStresses = [...new Set(stressesList)];
            result.stressesList = uniqueStresses.length > 0 ? uniqueStresses.join('; ') : '-';
        }

        // Conservation Actions (enhanced with notes)
        const conservationActions = data.conservation_actions || [];
        result.conservationActionsCount = String(conservationActions.length);
        if (conservationActions.length > 0) {
            const actionsList = [];
            for (const action of conservationActions) {
                const desc = action.description;
                let actionName = '';
                if (desc && typeof desc === 'object') {
                    actionName = desc.en || '';
                } else if (desc) {
                    actionName = String(desc);
                }

                const code = String(action.code || '').replace(/_/g, '.');
                const note = this.cleanHtml(action.note || '');

                if (actionName) {
                    let actionInfo = code ? `${code}: ${actionName}` : actionName;
                    if (note) {
                        actionInfo += ` - ${note}`;
                    }
                    actionsList.push(actionInfo);
                }
            }
            result.conservationActionsList = actionsList.length > 0 ? actionsList.join('; ') : '-';
        }

        // Research Needed
        const researches = data.researches || [];
        result.researchNeededCount = String(researches.length);
        if (researches.length > 0) {
            const researchList = [];
            for (const research of researches) {
                const desc = research.description;
                let researchName = '';
                if (desc && typeof desc === 'object') {
                    researchName = desc.en || '';
                } else if (desc) {
                    researchName = String(desc);
                }

                const code = String(research.code || '').replace(/_/g, '.');
                const note = this.cleanHtml(research.note || '');

                if (researchName) {
                    let researchInfo = code ? `${code}: ${researchName}` : researchName;
                    if (note) {
                        researchInfo += ` - ${note}`;
                    }
                    researchList.push(researchInfo);
                }
            }
            result.researchNeededList = researchList.length > 0 ? researchList.join('; ') : '-';
        }

        // Use and Trade (enhanced with international, national, subsistence flags)
        const useTrade = data.use_and_trade || [];
        result.useTradeCount = String(useTrade.length);
        if (useTrade.length > 0) {
            const useTradeList = [];
            for (const use of useTrade) {
                const desc = use.description;
                let useName = '';
                if (desc && typeof desc === 'object') {
                    useName = desc.en || '';
                } else if (desc) {
                    useName = String(desc);
                }

                const code = String(use.code || '');
                if (useName) {
                    let useInfo = code ? `${code}: ${useName}` : useName;
                    const flags = [];
                    if (use.international) flags.push('International');
                    if (use.national) flags.push('National');
                    if (use.subsistence) flags.push('Subsistence');
                    if (flags.length > 0) {
                        useInfo += ` [${flags.join(', ')}]`;
                    }
                    useTradeList.push(useInfo);
                }
            }
            result.useTradeList = useTradeList.length > 0 ? useTradeList.join('; ') : '-';
        }

        // Documentation texts
        const doc = data.documentation || {};

        let populationText = this.cleanHtml(doc.population || '');
        result.populationText = populationText || '-';

        let rangeText = this.cleanHtml(doc.range || '');
        result.rangeText = rangeText || '-';

        let habitatText = this.cleanHtml(doc.habitats || '');
        result.habitatText = habitatText || '-';

        let threatsFullText = this.cleanHtml(doc.threats || '');
        result.threatsFullText = threatsFullText || '-';

        // Conservation actions text - try multiple keys
        let conservationText = '';
        for (const key of ['conservation_actions', 'conservation_measures', 'conservation', 'measures']) {
            if (doc[key]) {
                conservationText = this.cleanHtml(doc[key]);
                break;
            }
        }
        result.conservationActionsText = conservationText || '-';

        // Use and trade text - try multiple keys
        let useTradeText = '';
        for (const key of ['use_and_trade', 'use_trade', 'utilization', 'trade']) {
            if (doc[key]) {
                useTradeText = this.cleanHtml(doc[key]);
                break;
            }
        }
        result.useTradeText = useTradeText || '-';

        let taxonomicNotes = this.cleanHtml(doc.taxonomic_notes || '');
        result.taxonomicNotes = taxonomicNotes || '-';

        let rationale = this.cleanHtml(doc.rationale || '');
        result.rationale = rationale || '-';

        let trendJustification = this.cleanHtml(doc.trend_justification || '');
        result.trendJustification = trendJustification || '-';

        // Supplementary information (fully extracted)
        const suppInfo = data.supplementary_info || {};
        const popFrag = this.cleanHtml(suppInfo.population_severely_fragmented || '');
        result.populationSeverelyFragmented = popFrag || '-';

        result.populationSize = suppInfo.population_size != null ? String(suppInfo.population_size) : '-';
        result.generationalLength = suppInfo.generational_length != null ? String(suppInfo.generational_length) : '-';
        result.areaOfOccupancy = suppInfo.estimated_area_of_occupancy != null ? String(suppInfo.estimated_area_of_occupancy) : '-';
        result.extentOfOccurrence = suppInfo.estimated_extent_of_occurence != null ? String(suppInfo.estimated_extent_of_occurence) : '-';
        result.populationContinuingDecline = this.cleanHtml(suppInfo.population_continuing_decline || '') || '-';
        result.noOfSubpopulations = suppInfo.no_of_subpopulations != null ? String(suppInfo.no_of_subpopulations) : '-';
        result.congregatory = this.cleanHtml(suppInfo.congregatory || '') || '-';

        result.lowerElevationLimit = suppInfo.lower_elevation_limit != null ? String(suppInfo.lower_elevation_limit) : '-';
        result.upperElevationLimit = suppInfo.upper_elevation_limit != null ? String(suppInfo.upper_elevation_limit) : '-';
        result.lowerDepthLimit = suppInfo.lower_depth_limit != null ? String(suppInfo.lower_depth_limit) : '-';
        result.upperDepthLimit = suppInfo.upper_depth_limit != null ? String(suppInfo.upper_depth_limit) : '-';

        const movement = this.cleanHtml(suppInfo.movement_patterns || '');
        result.movementPatterns = movement || '-';

        // Additional supplementary_info fields
        result.areaRestrictedIsRestricted = this.cleanHtml(suppInfo.area_restricted_is_restricted || '') || '-';
        result.numberOfLocations = suppInfo.number_of_locations != null ? String(suppInfo.number_of_locations) : '-';
        result.continuingDeclineInArea = this.cleanHtml(suppInfo.continuing_decline_in_area || '') || '-';
        result.identificationInformation = this.cleanHtml(suppInfo.identification_information || '') || '-';
        result.extremeFluctuations = this.cleanHtml(suppInfo.extreme_fluctuations || '') || '-';
        result.continuingDeclineInSubpopulations = this.cleanHtml(suppInfo.continuing_decline_in_subpopulations || '') || '-';
        result.extremeFluctuationsInSubpopulations = this.cleanHtml(suppInfo.extreme_fluctuations_in_subpopulations || '') || '-';
        result.allIndividualsInOneSubpopulation = this.cleanHtml(suppInfo.all_individuals_in_one_subpopulation || '') || '-';
        result.noOfIndividualsInLargestSubpopulation = suppInfo.no_of_individuals_in_largest_subpopulation != null ? String(suppInfo.no_of_individuals_in_largest_subpopulation) : '-';
        result.continuingDeclineInAreaOfOccupancy = this.cleanHtml(suppInfo.continuing_decline_in_area_of_occupancy || '') || '-';
        result.extremeFluctuationsInAreaOfOccupancy = this.cleanHtml(suppInfo.extreme_fluctuations_in_area_of_occupancy || '') || '-';
        result.continuingDeclineInExtentOfOccurrence = this.cleanHtml(suppInfo.continuing_decline_in_extent_of_occurence || '') || '-';
        result.extremeFluctuationsInExtentOfOccurrence = this.cleanHtml(suppInfo.extreme_fluctuations_in_extent_of_occurence || '') || '-';
        result.continuingDeclineInNumberOfLocations = this.cleanHtml(suppInfo.continuing_decline_in_number_of_locations || '') || '-';
        result.extremeFluctuationsInNumberOfLocations = this.cleanHtml(suppInfo.extreme_fluctuations_in_number_of_locations || '') || '-';

        // Conservation actions in place (complex nested structure)
        const actionsInPlace = suppInfo.conservation_actions_in_place || [];
        if (actionsInPlace.length > 0) {
            const parts = [];
            for (const group of actionsInPlace) {
                const groupName = group.name || '';
                const actions = group.actions || [];
                const actionStrs = actions.map(a => `${a.name || ''}: ${a.value || ''}`).filter(s => s !== ': ');
                if (groupName) {
                    parts.push(`${groupName} [${actionStrs.join(', ')}]`);
                }
            }
            result.conservationActionsInPlace = parts.length > 0 ? parts.join('; ') : '-';
        }

        // Compose supplementary details for display
        const suppDetailParts = [
            `Area Restricted: ${result.areaRestrictedIsRestricted}`,
            `Number of Locations: ${result.numberOfLocations}`,
            `Continuing Decline in Area: ${result.continuingDeclineInArea}`,
            `Extreme Fluctuations: ${result.extremeFluctuations}`,
            `Continuing Decline in Subpopulations: ${result.continuingDeclineInSubpopulations}`,
            `Extreme Fluctuations in Subpopulations: ${result.extremeFluctuationsInSubpopulations}`,
            `All Individuals in One Subpopulation: ${result.allIndividualsInOneSubpopulation}`,
            `Largest Subpopulation Size: ${result.noOfIndividualsInLargestSubpopulation}`,
            `Continuing Decline in AOO: ${result.continuingDeclineInAreaOfOccupancy}`,
            `Extreme Fluctuations in AOO: ${result.extremeFluctuationsInAreaOfOccupancy}`,
            `Continuing Decline in EOO: ${result.continuingDeclineInExtentOfOccurrence}`,
            `Extreme Fluctuations in EOO: ${result.extremeFluctuationsInExtentOfOccurrence}`,
            `Continuing Decline in Locations: ${result.continuingDeclineInNumberOfLocations}`,
            `Extreme Fluctuations in Locations: ${result.extremeFluctuationsInNumberOfLocations}`,
        ].join('; ');
        result.supplementaryDetails = suppDetailParts;

        // References (full list)
        const references = data.references || [];
        result.referencesCount = String(references.length);
        if (references.length > 0) {
            const refList = [];
            for (const ref of references) {
                const citation = this.cleanHtml(ref.citation || '');
                if (citation) refList.push(citation);
            }
            result.referencesList = refList.length > 0 ? refList.join('; ') : '-';
        }

        // Credits (assessors, evaluators, contributors)
        const credits = data.credits || [];
        if (credits.length > 0) {
            const creditParts = [];
            for (const credit of credits) {
                const type = this.cleanHtml(credit.credit_type_name || '');
                const full = this.cleanHtml(credit.full || '');
                if (type && full) {
                    creditParts.push(`${this.capitalize(type)}: ${full}`);
                }
            }
            result.creditsList = creditParts.length > 0 ? creditParts.join('; ') : '-';
        }

        // Citation
        const citation = data.citation || '';
        result.citation = this.cleanHtml(citation) || '-';
    }

    createNotFoundResult(speciesName) {
        return {
            taxId: '-', speciesName: speciesName,
            scientificName: '-', kingdom: '-', phylum: '-', class: '-', order: '-',
            family: '-', genus: speciesName.split(' ')[0] || '-', authority: '-',
            mainCommonName: '-', commonNamesList: '-',
            sscGroups: '-',
            synonymsCount: '0', synonymsList: '-',
            assessmentId: '-', categoryCode: '-', categoryFull: 'Not Found',
            criteria: '-', redListVersion: '-',
            assessmentDate: '-', yearPublished: '-', populationTrend: '-',
            systems: '-', biogeographicalRealms: '-', scopes: '-',
            possiblyExtinct: 'No', possiblyExtinctInWild: 'No',
            countriesCount: '0', countriesList: '-',
            habitatsCount: '0', habitatsList: '-',
            threatsCount: '0', threatsList: '-',
            stressesCount: '0', stressesList: '-',
            conservationActionsCount: '0', conservationActionsList: '-',
            researchNeededCount: '0', researchNeededList: '-',
            useTradeCount: '0', useTradeList: '-',
            populationText: '-', populationSeverelyFragmented: '-',
            populationSize: '-', generationalLength: '-',
            areaOfOccupancy: '-', extentOfOccurrence: '-',
            populationContinuingDecline: '-', noOfSubpopulations: '-',
            congregatory: '-',
            rangeText: '-', habitatText: '-', threatsFullText: '-',
            conservationActionsText: '-', useTradeText: '-',
            taxonomicNotes: '-', rationale: '-',
            referencesCount: '0', referencesList: '-',
            creditsList: '-', citation: '-',
            lowerElevationLimit: '-', upperElevationLimit: '-',
            lowerDepthLimit: '-', upperDepthLimit: '-',
            movementPatterns: '-',
            areaRestrictedIsRestricted: '-',
            numberOfLocations: '-',
            continuingDeclineInArea: '-',
            conservationActionsInPlace: '-',
            identificationInformation: '-',
            extremeFluctuations: '-',
            continuingDeclineInSubpopulations: '-',
            extremeFluctuationsInSubpopulations: '-',
            allIndividualsInOneSubpopulation: '-',
            noOfIndividualsInLargestSubpopulation: '-',
            continuingDeclineInAreaOfOccupancy: '-',
            extremeFluctuationsInAreaOfOccupancy: '-',
            continuingDeclineInExtentOfOccurrence: '-',
            extremeFluctuationsInExtentOfOccurrence: '-',
            continuingDeclineInNumberOfLocations: '-',
            extremeFluctuationsInNumberOfLocations: '-',
            trendJustification: '-',
            supplementaryDetails: '-',
            iucnUrl: ''
        };
    }

    createErrorResult(speciesName, errorMessage) {
        const result = this.createNotFoundResult(speciesName);
        result.categoryFull = 'Error';
        result.categoryCode = errorMessage || 'Error';
        return result;
    }

    async searchBatch(speciesList, onProgress = null, onSpeciesComplete = null, options = {}) {
        const results = [];
        const total = speciesList.length;

        console.log(`IUCN - Starting search for ${total} species...`);

        for (let i = 0; i < speciesList.length; i++) {
            const species = speciesList[i];

            try {
                console.log(`IUCN - Processing ${species} (${i + 1}/${total})...`);
                const result = await this.searchSpecies(species, options);
                results.push(result);
                if (onSpeciesComplete) onSpeciesComplete(result, i + 1, total);
            } catch (error) {
                console.error(`IUCN - Error processing ${species}:`, error);
                const errorResult = this.createErrorResult(species, error.message);
                results.push(errorResult);
                if (onSpeciesComplete) onSpeciesComplete(errorResult, i + 1, total);
            }

            if (onProgress) onProgress(i + 1, total);

            if (i < speciesList.length - 1) await this.delay(500);
        }

        return results;
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.iucnAPI = new IucnAPI();
    console.log('IUCN API v4 loaded and instance created successfully');
    window.IucnAPI = IucnAPI;
} else {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = IucnAPI;
    }
}


// Modal functions for IUCN
function openIucnModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Close modal when clicking outside the content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeIucnModal(modalId);
            }
        });
    }
}

function closeIucnModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function showIucnDetail(index, field, title) {
    const result = window._iucnResults && window._iucnResults[index];
    if (!result) return showCellModal(title, '-');

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sortByCode = (a, b) => {
        const ap = a.code.split('.').map(Number);
        const bp = b.code.split('.').map(Number);
        for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
            if ((ap[i] || 0) !== (bp[i] || 0)) return (ap[i] || 0) - (bp[i] || 0);
        }
        return 0;
    };
    const openTableModal = (titleText, tableHtml) => {
        ensureCellModal();
        document.getElementById('cellTextModalTitle').textContent = titleText;
        document.getElementById('cellTextModalBody').innerHTML = tableHtml;
        const modal = document.getElementById('cellTextModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    if (field === 'supplementaryDetails') {
        // Show as HTML table
        ensureCellModal();
        document.getElementById('cellTextModalTitle').textContent = title;
        const body = document.getElementById('cellTextModalBody');
        const tableRows = [
            ['Area Restricted', result.areaRestrictedIsRestricted],
            ['Number of Locations', result.numberOfLocations],
            ['Continuing Decline in Area', result.continuingDeclineInArea],
            ['Extreme Fluctuations', result.extremeFluctuations],
            ['Continuing Decline in Subpopulations', result.continuingDeclineInSubpopulations],
            ['Extreme Fluctuations in Subpopulations', result.extremeFluctuationsInSubpopulations],
            ['All Individuals in One Subpopulation', result.allIndividualsInOneSubpopulation],
            ['Largest Subpopulation Size', result.noOfIndividualsInLargestSubpopulation],
            ['Continuing Decline in AOO', result.continuingDeclineInAreaOfOccupancy],
            ['Extreme Fluctuations in AOO', result.extremeFluctuationsInAreaOfOccupancy],
            ['Continuing Decline in EOO', result.continuingDeclineInExtentOfOccurrence],
            ['Extreme Fluctuations in EOO', result.extremeFluctuationsInExtentOfOccurrence],
            ['Continuing Decline in Locations', result.continuingDeclineInNumberOfLocations],
            ['Extreme Fluctuations in Locations', result.extremeFluctuationsInNumberOfLocations],
            ['Identification Information', result.identificationInformation],
        ];
        let html = '<table class="w-full border-collapse"><thead><tr><th class="text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm">Field</th><th class="text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm">Value</th></tr></thead><tbody>';
        tableRows.forEach(([label, value], idx) => {
            const bgClass = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const escaped = (value || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `<tr class="${bgClass}"><td class="py-2 px-3 border border-gray-300 text-sm font-medium text-gray-700">${label}</td><td class="py-2 px-3 border border-gray-300 text-sm">${escaped}</td></tr>`;
        });
        html += '</tbody></table>';
        body.innerHTML = html;
        const modal = document.getElementById('cellTextModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else if (field === 'countriesList') {
        // Show countries as sorted table
        ensureCellModal();
        document.getElementById('cellTextModalTitle').textContent = title;
        const body = document.getElementById('cellTextModalBody');
        const text = result[field] || '-';
        if (text === '-') {
            body.textContent = '-';
        } else {
            const entries = text.split('; ').map(entry => {
                const match = entry.match(/^(.+?)\s*\((.+)\)$/);
                if (match) return { country: match[1].trim(), details: match[2].trim() };
                return { country: entry.trim(), details: '-' };
            });
            entries.sort((a, b) => a.country.localeCompare(b.country));
            let html = '<table class="w-full border-collapse"><thead><tr><th class="text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm">Country</th><th class="text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm">Details</th></tr></thead><tbody>';
            entries.forEach(({ country, details }, idx) => {
                const bgClass = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                const escCountry = country.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const escDetails = details.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html += `<tr class="${bgClass}"><td class="py-2 px-3 border border-gray-300 text-sm">${escCountry}</td><td class="py-2 px-3 border border-gray-300 text-sm">${escDetails}</td></tr>`;
            });
            html += '</tbody></table>';
            body.innerHTML = html;
        }
        const modal = document.getElementById('cellTextModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else if (field === 'synonymsList') {
        const text = result[field] || '-';
        if (text === '-') return showCellModal(title, '-');
        ensureCellModal();
        document.getElementById('cellTextModalTitle').textContent = title;
        const body = document.getElementById('cellTextModalBody');
        const entries = text.split('; ');
        const formatted = entries.map(entry => {
            const delimParts = entry.split('|||');
            const name = delimParts[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const auth = delimParts.length > 1 ? delimParts[1].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            return auth ? `<i>${name}</i> ${auth}` : `<i>${name}</i>`;
        });
        body.innerHTML = formatted.join(';<br>');
        const modal = document.getElementById('cellTextModal');
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else if (field === 'habitatsList') {
        let text = result[field] || '-';
        if (text === '-') return showCellModal(title, '-');
        text = text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
        const rawEntries = text.split(/;\s*(?=\d)/);
        const parsed = [];
        rawEntries.forEach(entry => {
            const trimmed = entry.trim().replace(/;$/, '');
            if (!trimmed) return;
            const detailMatch = trimmed.match(/^([\d.]+):\s*(.*?)\s*\(((?:Suitability|Season|Major importance).+)\)$/);
            let code = '', name = '', suitability = '-', season = '-', major = '-';
            if (detailMatch) {
                code = detailMatch[1];
                name = detailMatch[2];
                const details = detailMatch[3];
                const sm = details.match(/Suitability:\s*([^;)]+)/);
                const sem = details.match(/Season:\s*([^;)]+)/);
                const mm = details.match(/Major importance:\s*([^;)]+)/);
                if (sm) suitability = sm[1].trim();
                if (sem) season = sem[1].trim();
                if (mm) major = mm[1].trim();
            } else {
                const simpleMatch = trimmed.match(/^([\d.]+):\s*(.+)$/);
                if (simpleMatch) { code = simpleMatch[1]; name = simpleMatch[2]; }
                else { name = trimmed; }
            }
            parsed.push({ code, name, suitability, season, major });
        });
        parsed.sort(sortByCode);
        const thCls = 'text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm';
        let html = '<table class="w-full border-collapse"><thead><tr>' +
            `<th class="${thCls}">Code</th><th class="${thCls}">Habitat</th>` +
            `<th class="${thCls}">Suitability</th><th class="${thCls}">Season</th>` +
            `<th class="${thCls}">Major Importance</th></tr></thead><tbody>`;
        parsed.forEach(({ code, name, suitability, season, major }, idx) => {
            const bg = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const td = 'py-2 px-3 border border-gray-300 text-sm';
            html += `<tr class="${bg}"><td class="${td}">${esc(code)}</td><td class="${td}">${esc(name)}</td>` +
                `<td class="${td}">${esc(suitability)}</td><td class="${td}">${esc(season)}</td>` +
                `<td class="${td}">${esc(major)}</td></tr>`;
        });
        html += '</tbody></table>';
        openTableModal(title, html);
    } else if (field === 'threatsList') {
        let text = result[field] || '-';
        if (text === '-') return showCellModal(title, '-');
        text = text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
        const rawEntries = text.split(/;\s*(?=\d)/);
        const parsed = [];
        rawEntries.forEach(entry => {
            const trimmed = entry.trim().replace(/;$/, '');
            if (!trimmed) return;
            const bracketMatch = trimmed.match(/^([\d.]+):\s*(.*?)\s*\[(.+)\]$/);
            let code = '', name = '', scope = '-', timing = '-', severity = '-', score = '-';
            if (bracketMatch) {
                code = bracketMatch[1];
                name = bracketMatch[2];
                const det = bracketMatch[3];
                const sm = det.match(/Scope:\s*([^;]+?)(?:;|$)/);
                const tm = det.match(/Timing:\s*([^;]+?)(?:;|$)/);
                const svm = det.match(/Severity:\s*([^;]+?)(?:;|$)/);
                const scm = det.match(/Score:\s*(.+)$/);
                if (sm) scope = sm[1].trim();
                if (tm) timing = tm[1].trim();
                if (svm) severity = svm[1].trim();
                if (scm) score = scm[1].trim();
            } else {
                const simpleMatch = trimmed.match(/^([\d.]+):\s*(.+)$/);
                if (simpleMatch) { code = simpleMatch[1]; name = simpleMatch[2]; }
                else { name = trimmed; }
            }
            parsed.push({ code, name, scope, timing, severity, score });
        });
        parsed.sort(sortByCode);
        const thCls = 'text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm';
        let html = '<table class="w-full border-collapse"><thead><tr>' +
            `<th class="${thCls}">Code</th><th class="${thCls}">Threat</th>` +
            `<th class="${thCls}">Scope</th><th class="${thCls}">Timing</th>` +
            `<th class="${thCls}">Severity</th><th class="${thCls}">Score</th></tr></thead><tbody>`;
        parsed.forEach(({ code, name, scope, timing, severity, score }, idx) => {
            const bg = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const td = 'py-2 px-3 border border-gray-300 text-sm';
            html += `<tr class="${bg}"><td class="${td}">${esc(code)}</td><td class="${td}">${esc(name)}</td>` +
                `<td class="${td}">${esc(scope)}</td><td class="${td}">${esc(timing)}</td>` +
                `<td class="${td}">${esc(severity)}</td><td class="${td}">${esc(score)}</td></tr>`;
        });
        html += '</tbody></table>';
        openTableModal(title, html);
    } else if (field === 'useTradeList') {
        let text = result[field] || '-';
        if (text === '-') return showCellModal(title, '-');
        text = text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
        const rawEntries = text.split(/;\s*(?=\d)/);
        const parsed = [];
        rawEntries.forEach(entry => {
            const trimmed = entry.trim().replace(/;$/, '');
            if (!trimmed) return;
            const bracketMatch = trimmed.match(/^(\d[\d.]*?):\s*(.*?)\s*\[(.+)\]$/);
            let code = '', name = '', details = '-';
            if (bracketMatch) { code = bracketMatch[1]; name = bracketMatch[2]; details = bracketMatch[3]; }
            else {
                const simpleMatch = trimmed.match(/^(\d[\d.]*?):\s*(.+)$/);
                if (simpleMatch) { code = simpleMatch[1]; name = simpleMatch[2]; }
                else { name = trimmed; }
            }
            parsed.push({ code, name, details });
        });
        parsed.sort(sortByCode);
        const thCls = 'text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm';
        let html = '<table class="w-full border-collapse"><thead><tr>' +
            `<th class="${thCls}">Code</th><th class="${thCls}">Use / Trade</th>` +
            `<th class="${thCls}">Details</th></tr></thead><tbody>`;
        parsed.forEach(({ code, name, details }, idx) => {
            const bg = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const td = 'py-2 px-3 border border-gray-300 text-sm';
            html += `<tr class="${bg}"><td class="${td}">${esc(code)}</td>` +
                `<td class="${td}">${esc(name)}</td><td class="${td}">${esc(details)}</td></tr>`;
        });
        html += '</tbody></table>';
        openTableModal(title, html);
    } else if (field === 'conservationActionsList' || field === 'researchNeededList') {
        let text = result[field] || '-';
        if (text === '-') return showCellModal(title, '-');
        text = text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
        const rawEntries = text.split(/;\s*(?=\d)/);
        const parsed = [];
        rawEntries.forEach(entry => {
            const trimmed = entry.trim().replace(/;$/, '');
            if (!trimmed) return;
            const simpleMatch = trimmed.match(/^([\d.]+):\s*(.+)$/);
            let code = '', name = trimmed;
            if (simpleMatch) { code = simpleMatch[1]; name = simpleMatch[2]; }
            parsed.push({ code, name });
        });
        parsed.sort(sortByCode);
        const colName = field === 'conservationActionsList' ? 'Conservation Action' : 'Research Needed';
        const thCls = 'text-left py-2 px-3 bg-gray-800 text-white border border-gray-300 text-sm';
        let html = '<table class="w-full border-collapse"><thead><tr>' +
            `<th class="${thCls}">Code</th><th class="${thCls}">${colName}</th>` +
            '</tr></thead><tbody>';
        parsed.forEach(({ code, name }, idx) => {
            const bg = idx % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            const td = 'py-2 px-3 border border-gray-300 text-sm';
            html += `<tr class="${bg}"><td class="${td}">${esc(code)}</td>` +
                `<td class="${td}">${esc(name)}</td></tr>`;
        });
        html += '</tbody></table>';
        openTableModal(title, html);
    } else {
        let text = result[field] || '-';
        if (field === 'citation') {
            text = text.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ');
        }
        const noBreakFields = [
            'populationText', 'rangeText', 'habitatText', 'threatsFullText',
            'conservationActionsText', 'useTradeText', 'taxonomicNotes',
            'rationale', 'trendJustification', 'conservationActionsInPlace',
            'citation'
        ];
        showCellModal(title, text, noBreakFields.includes(field));
    }
}

async function getIUCN(apiKey = 'iucn') {
    console.log(`getIUCN called with apiKey: ${apiKey}`);

    if (typeof window.iucnAPI === 'undefined' || !window.iucnAPI) {
        if (typeof IucnAPI !== 'undefined') {
            window.iucnAPI = new IucnAPI();
        } else {
            alert('Error: IUCN API is not loaded. Please reload the page.');
            return;
        }
    }

    // Read Token from UI input
    const tokenInput = document.getElementById('iucnApiToken');

    if (!tokenInput || !tokenInput.value.trim()) {
        alert('Please enter your IUCN API Token in the IUCN configuration section.');
        return;
    }

    window.iucnAPI.setToken(tokenInput.value.trim());

    const categoryColors = {
        'Extinct': '#000000', 'Extinct in the Wild': '#542344', 'Critically Endangered': '#D81E05',
        'Endangered': '#FC7F3F', 'Vulnerable': '#F9E79F', 'Near Threatened': '#CCE2A3',
        'Least Concern': '#78C679', 'Data Deficient': '#D3D3D3', 'Not Evaluated': '#FFFFFF',
        'Regionally Extinct': '#000000',
        'EX': '#000000', 'EW': '#542344', 'CR': '#D81E05', 'EN': '#FC7F3F',
        'VU': '#F9E79F', 'NT': '#CCE2A3', 'LC': '#78C679', 'DD': '#D3D3D3', 'NE': '#FFFFFF',
        'V': '#F9E79F', 'E': '#FC7F3F', 'RE': '#000000', 'LR/lc': '#78C679',
        'Error': '#FA7070', 'Not Found': '#D1D1C7', '-': '#D1D1C7'
    };

    const trendColors = {
        'Increasing': '#5FC65A', 'Stable': '#87CEEB', 'Decreasing': '#FA7070',
        'Unknown': '#D1D1C7', '-': '#D1D1C7'
    };

    const progressModal = document.getElementById('progressModal');
    if (!progressModal) { console.error('Progress modal not found'); return; }
    progressModal.classList.remove('hidden');

    let progress = 0;
    const speciesNames = document.getElementById('speciesNames').value.split('\n').filter(name => name.trim());

    if (speciesNames.length === 0) {
        alert('Please enter at least one species name.');
        progressModal.classList.add('hidden');
        return;
    }

    // Read optional field checkboxes (with correct iucn-prefix IDs)
    const iucnTaxonomyOpt       = document.getElementById('iucntaxonomyopt')?.checked ?? true;
    const iucnStatusOpt         = document.getElementById('iucnstatusconservationopt')?.checked ?? true;
    const iucnCommonNamesOpt    = document.getElementById('iucncommonnamesopt')?.checked ?? true;
    const iucnSynonymsOpt       = document.getElementById('iucnsynonymsnamesopt')?.checked ?? true;
    const iucnCountriesOpt      = document.getElementById('iucncountryoccurrenceopt')?.checked ?? true;
    const iucnHabitatsOpt       = document.getElementById('iucnhabitatsopt')?.checked ?? true;
    const iucnThreatsOpt        = document.getElementById('iucnthreatsopt')?.checked ?? true;
    const iucnMeasuresOpt       = document.getElementById('iucnconservationmeasuresopt')?.checked ?? true;
    const iucnResearchOpt       = document.getElementById('iucnresearchneededopt')?.checked ?? true;
    const iucnUseTradeOpt       = document.getElementById('iucnusetradeopt')?.checked ?? true;
    const iucnDocumentationOpt  = document.getElementById('iucndocumentationopt')?.checked ?? true;
    const iucnCitationOpt       = document.getElementById('iucncitationopt')?.checked ?? true;

    // Build table header dynamically
    const _iucnTable = document.createElement('table');
    _iucnTable.id = 'IucnTable';
    _iucnTable.classList.add("text-base", "text-blue-800", "table-auto", "border-collapse", "w-full");

    let colIdx = 0;
    let headerCells = '';

    const addHeader = (label) => {
        const idx = colIdx++;
        headerCells += `<th scope="col" class="py-5 px-5 cursor-pointer hover:bg-gray-700" onclick="sortTable('IucnTable', ${idx})">${label} <i class="fas fa-sort ml-2"></i></th>`;
    };

    // Taxonomy (mandatory)
    if (iucnTaxonomyOpt) {
        addHeader('Tax ID');
        addHeader('Kingdom');
        addHeader('Phylum');
        addHeader('Class');
        addHeader('Order');
        addHeader('Family');
    }
    addHeader('Species Name');
    addHeader('Scientific Name');
    if (iucnTaxonomyOpt) {
        addHeader('Authority');
    }

    // Status Conservation (mandatory)
    if (iucnStatusOpt) {
        addHeader('Red List Category');
        addHeader('Population Trend');
        addHeader('Assessment Date');
        addHeader('Year Published');
    }

    // Optional columns
    if (iucnCommonNamesOpt) {
        addHeader('Main Common Name');
        addHeader('Common Names List');
    }
    if (iucnSynonymsOpt) addHeader('Synonyms');
    if (iucnCountriesOpt) addHeader('Countries');
    if (iucnHabitatsOpt) addHeader('Habitats');
    if (iucnThreatsOpt) addHeader('Threats');
    if (iucnMeasuresOpt) addHeader('Conservation Actions');
    if (iucnResearchOpt) addHeader('Research Needed');
    if (iucnUseTradeOpt) addHeader('Use and Trade');
    if (iucnDocumentationOpt) {
        addHeader('Population Text');
        addHeader('Range Text');
        addHeader('Habitat Text');
        addHeader('Threats Full Text');
        addHeader('Conservation Actions Text');
        addHeader('Use Trade Text');
        addHeader('Taxonomic Notes');
        addHeader('Rationale');
        addHeader('Trend Justification');
        addHeader('Conservation In Place');
        addHeader('Supplementary Details');
    }
    if (iucnCitationOpt) addHeader('Citation');
    // Link column (no sort)
    headerCells += `<th scope="col" class="py-5 px-5">Link</th>`;

    _iucnTable.innerHTML = `
    <thead class="text-base text-white bg-gray-800 text-left whitespace-nowrap" data-sticky="true" style="position: sticky; z-index: 20;">
        <tr>${headerCells}</tr>
    </thead>`;

    const _iucnTableBody = _iucnTable.createTBody();
    _iucnTableBody.classList.add("text-left", 'divide-y-1', 'divide-blue-800', 'divide-dashed');

    const _iucnTableWrapper = document.createElement('div');
    _iucnTableWrapper.classList.add("w-full", "table-wrapper");
    _iucnTableWrapper.appendChild(_iucnTable);

    const iucnResults = document.getElementById('tabPanel-iucn');
    iucnResults.appendChild(_iucnTableWrapper);

    try {
        const results = await window.iucnAPI.searchBatch(
            speciesNames,
            (current, total) => {
                progress = (current / total) * 100;
                const apiProgressBar = document.getElementById(`progressBar-${apiKey}`);
                const apiProgressText = document.getElementById(`progressText-${apiKey}`);
                if (apiProgressBar) apiProgressBar.style.width = progress + '%';
                if (apiProgressText) apiProgressText.textContent = Math.round(progress) + '%';
                if (typeof window.globalProgressTracker !== 'undefined') {
                    window.globalProgressTracker.updateApiProgress(apiKey, progress);
                }
            },
            (result, current, total) => {
                console.log(`IUCN - Completed ${current}/${total}: ${result.speciesName} (${result.categoryFull})`);
            }
        );

        let successCount = 0;
        let errorCount = 0;

        // Store results globally for modal access
        window._iucnResults = results;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const row = _iucnTableBody.insertRow();
            row.classList.add('bg-gray-50', 'hover:bg-gray-400', 'text-black', 'odd:bg-gray-200', 'even:bg-white', 'whitespace-nowrap');

            let ci = 0;
            const addCell = (html, cls = "py-5 px-5") => {
                const cell = row.insertCell(ci++);
                cell.innerHTML = html;
                cell.className = cls;
                // For cells with View buttons, store actual data for Excel/CSV/TSV export
                if (typeof html === 'string') {
                    const btnMatch = html.match(/showIucnDetail\(\d+,\s*'(\w+)'/);
                    if (btnMatch) {
                        const fieldName = btnMatch[1];
                        let val = result[fieldName] || '-';
                        if (fieldName === 'synonymsList') val = val.replace(/\|\|\|/g, ' ');
                        cell.dataset.exportValue = val;
                    }
                }
                return cell;
            };

            // Taxonomy
            if (iucnTaxonomyOpt) {
                addCell(result.taxId);
                addCell(result.kingdom);
                addCell(result.phylum);
                addCell(result.class);
                addCell(result.order);
                addCell(result.family);
            }

            // Species Name & Scientific Name (always visible)
            addCell(`<i>${result.speciesName}</i>`);
            addCell(`<i>${result.scientificName}</i>`);

            if (iucnTaxonomyOpt) {
                addCell(result.authority);
            }

            // Status / Conservation
            if (iucnStatusOpt) {
                const catColor = categoryColors[result.categoryFull] || categoryColors[result.categoryCode] || '#D1D1C7';
                const catCell = addCell(result.categoryFull || '-', "py-5 px-5 font-bold");
                catCell.style.backgroundColor = catColor;
                catCell.style.color = ['#000000', '#542344', '#D81E05'].includes(catColor) ? 'white' : 'black';

                const trendText = result.populationTrend || '-';
                const trendColor = trendColors[trendText] || '#D1D1C7';
                const trendCell = addCell(trendText, "py-5 px-5 font-bold");
                trendCell.style.backgroundColor = trendColor;

                addCell(result.assessmentDate || '-');
                addCell(result.yearPublished || '-');
            }

            // Optional columns - using showCellModal for consistent modal style
            if (iucnCommonNamesOpt) {
                addCell(result.mainCommonName || '-');
                addCell(result.commonNamesList && result.commonNamesList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'commonNamesList', 'Common Names List')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnSynonymsOpt) {
                addCell(result.synonymsList && result.synonymsList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'synonymsList', 'Synonyms')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnCountriesOpt) {
                addCell(result.countriesList && result.countriesList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'countriesList', 'Countries')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnHabitatsOpt) {
                addCell(result.habitatsList && result.habitatsList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'habitatsList', 'Habitats')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnThreatsOpt) {
                addCell(result.threatsList && result.threatsList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'threatsList', 'Threats')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnMeasuresOpt) {
                addCell(result.conservationActionsList && result.conservationActionsList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'conservationActionsList', 'Conservation Actions')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnResearchOpt) {
                addCell(result.researchNeededList && result.researchNeededList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'researchNeededList', 'Research Needed')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnUseTradeOpt) {
                addCell(result.useTradeList && result.useTradeList !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'useTradeList', 'Use and Trade')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnDocumentationOpt) {
                addCell(result.populationText && result.populationText !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'populationText', 'Population Text')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.rangeText && result.rangeText !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'rangeText', 'Range Text')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.habitatText && result.habitatText !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'habitatText', 'Habitat Text')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.threatsFullText && result.threatsFullText !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'threatsFullText', 'Threats Full Text')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.conservationActionsText && result.conservationActionsText !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'conservationActionsText', 'Conservation Actions Text')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.useTradeText && result.useTradeText !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'useTradeText', 'Use Trade Text')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.taxonomicNotes && result.taxonomicNotes !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'taxonomicNotes', 'Taxonomic Notes')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.rationale && result.rationale !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'rationale', 'Rationale')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.trendJustification && result.trendJustification !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'trendJustification', 'Trend Justification')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.conservationActionsInPlace && result.conservationActionsInPlace !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'conservationActionsInPlace', 'Conservation Actions In Place')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
                addCell(result.supplementaryDetails && result.supplementaryDetails !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'supplementaryDetails', 'Supplementary Details')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }
            if (iucnCitationOpt) {
                addCell(result.citation && result.citation !== '-'
                    ? `<button class="inline-flex items-center px-4 py-2 text-base font-medium rounded-lg text-white bg-gray-800 hover:opacity-90 transition-colors duration-200 shadow-sm hover:shadow-md" onclick="showIucnDetail(${i}, 'citation', 'Citation')"><i class="fa-solid fa-eye mr-2"></i>View</button>`
                    : '-', "py-5 px-5 text-center");
            }

            // Link to IUCN species page (use URL from assessment data when available)
            const linkCell = addCell('-', "py-5 px-5 text-center");
            const iucnLink = result.iucnUrl || (result.taxId && result.taxId !== '-' && result.assessmentId && result.assessmentId !== '-'
                ? `https://www.iucnredlist.org/species/${result.taxId}/${result.assessmentId}`
                : '');
            if (iucnLink) {
                linkCell.innerHTML = `
                    <a class="inline-flex items-center px-4 py-2 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md"
                       href="${iucnLink}"
                       target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-lg"></i>
                        View
                    </a>
                `;
            }

            if (result.categoryFull !== 'Not Found' && result.categoryFull !== 'Error') {
                successCount++;
            } else if (result.categoryFull === 'Error') {
                errorCount++;
            }
        }

        // Status notice
        if (successCount > 0) {
            const successNotice = document.createElement('div');
            successNotice.className = 'bg-gray-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            successNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-check-circle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-base font-semibold text-black mb-1">
                            <strong>Success:</strong> Successfully accessed IUCN Red List API v4.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Results: ${successCount}/${results.length} species found
                        </p>
                    </div>
                </div>
            `;
            iucnResults.insertBefore(successNotice, _iucnTableWrapper);
        } else if (errorCount > 0) {
            const errorNotice = document.createElement('div');
            errorNotice.className = 'bg-red-200 border-l-4 border-gray-800 p-5 my-1 mx-1 rounded-lg shadow-sm';
            errorNotice.innerHTML = `
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-2x fa-exclamation-triangle text-black"></i>
                    </div>
                    <div class="ml-5">
                        <p class="text-base font-semibold text-black mb-1">
                            <strong>Notice:</strong> ${errorCount} of ${results.length} requests had issues.
                        </p>
                        <p class="text-black text-base leading-relaxed">
                            Successfully processed: ${successCount}/${results.length} species
                        </p>
                    </div>
                </div>
            `;
            iucnResults.insertBefore(errorNotice, _iucnTableWrapper);
        }

        // Controls (search, column filters, export)
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'bg-white rounded mb-4 mx-1';
        controlsContainer.innerHTML = `
            <!-- Search Input -->
            <div class="mt-6 mb-6 px-4">
                <div class="w-full mx-auto">
                    <label for="iucn-table-search" class="text-base font-semibold text-gray-800 mb-2 block">
                        <i class="fas fa-search mr-2"></i>Search in IUCN Red List Results
                    </label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            id="iucn-table-search"
                            class="block w-full pl-10 pr-12 py-3 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                            placeholder="Type to search in visible columns..."
                            autocomplete="off"
                        >
                        <div id="iucn-search-clear" class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hidden">
                            <i class="fas fa-times text-gray-400 hover:text-gray-600 text-lg"></i>
                        </div>
                    </div>
                    <small class="text-gray-600 mt-2 block">
                        <i class="fas fa-info-circle mr-1"></i>
                        This search will filter and highlight results in the visible columns selected below.
                    </small>
                </div>
            </div>

            <!-- Column Filters -->
            <div class="px-4 py-4">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-columns mr-2"></i>Toggle Column Visibility
                </h4>
                <div id="iucn-column-filters" class="flex flex-wrap gap-x-6 gap-y-2"></div>
            </div>

            <!-- Export Section -->
            <div class="px-4 py-4 border-t">
                <h4 class="text-base font-semibold text-gray-800 mb-3">
                    <i class="fas fa-download mr-2"></i>Export Results
                </h4>
                <div class="flex flex-wrap gap-3">
                    <button id="iucn-export-excel" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-excel mr-3 text-green-600 text-lg"></i>
                        Export to Excel
                    </button>
                    <button id="iucn-export-tsv" class="inline-flex items-center px-6 py-3 border border-gray-800 text-base font-medium rounded-lg text-gray-800 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-sm hover:shadow-md">
                        <i class="fas fa-file-alt mr-3 text-blue-600 text-lg"></i>
                        Export to TSV
                    </button>
                </div>
                <p class="text-base text-gray-600 mt-3">
                    <i class="fas fa-info-circle mr-1"></i>
                    Export will include only the currently visible columns and filtered results.
                </p>
            </div>
        `;

        iucnResults.insertBefore(controlsContainer, _iucnTableWrapper);

        createColumnFilters('IucnTable', 'iucn-column-filters');

        const searchInput = document.getElementById('iucn-table-search');
        const clearButton = document.getElementById('iucn-search-clear');
        let searchTimeout;

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm) {
                clearButton.classList.remove('hidden');
            } else {
                clearButton.classList.add('hidden');
            }
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAndHighlightTable('IucnTable', searchTerm);
            }, 300);
        });

        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            clearButton.classList.add('hidden');
            filterAndHighlightTable('IucnTable', '');
            updateSearchResultsCounter('', 0);
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearButton.classList.add('hidden');
                filterAndHighlightTable('IucnTable', '');
                updateSearchResultsCounter('', 0);
            }
        });

        document.getElementById('iucn-export-excel').addEventListener('click', function () {
            exportTableToExcel('IucnTable');
        });

        document.getElementById('iucn-export-tsv').addEventListener('click', function () {
            exportTableToTSV('IucnTable');
        });

        updateDataResults();

        console.log(`IUCN search completed: ${successCount} successful, ${errorCount} errors`);

    } catch (error) {
        console.error('Error during IUCN search:', error);
        progressModal.classList.add('hidden');
        alert('An error occurred during the search: ' + error.message);
    }
}
