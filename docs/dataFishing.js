/**
 * dataFishing Web Form - Main Application Controller
 * Search handler, tips display, and global error handling
 */

// Global error handling
window.addEventListener('error', function (e) {
    console.error('Global error caught:', e.error);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
});

// Tips rotation
function getRandomTip() {
    const toolTips = {
        SynGenes: [
            'a Python class for standardizing nomenclatures of mitochondrial and chloroplast genes and a web form for enhancing searches for evolutionary analyses.',
            'https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-024-05781-y'
        ],
        ForAlexa: [
            "an online tool for the rapid development of artificial intelligence skills for the teaching of evolutionary biology using Amazon's Alexa.",
            'https://link.springer.com/article/10.1186/s12052-022-00169-z'
        ],
        dataFishing: [
            "An efficient Python tool and user-friendly web-form for mining mitochondrial and chloroplast sequences, taxonomic, and biodiversity data.",
            'https://doi.org/10.1016/j.ecoinf.2024.102970'
        ],
    };
    const keys = Object.keys(toolTips);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { key: randomKey, description: toolTips[randomKey][0], link: toolTips[randomKey][1] };
}

function displayTip() {
    const tip = getRandomTip();
    const container = document.querySelector('.tip-container');
    container.classList.remove('fade-out');
    container.classList.add('fade-in');
    container.style.display = 'block';
    container.innerHTML = `
    <div class="bg-gray-700 overflow-hidden px-5 py-5">
        <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">

            <div class="flex-shrink-0 text-center sm:text-center md:text-left lg:text-left xl:text-left">
                <span class="text-white font-semibold leading-6 rounded-full bg-gray-800 px-3 py-3 text-base">Explore other tools:</span>
            </div>

            <div class="flex-grow sm:text-justify md:text-center lg:text-center xl:text-center">
                <div class="text-white font-semibold leading-6 sm:text-base md:text-base lg:text-base xl:text-base xxl:text-base">
                    <strong>${tip.key}</strong> ${tip.description}
                </div>
            </div>

            <div class="flex-shrink-0 text-center sm:text-center md:text-left lg:text-left xl:text-left">
                <a href="${tip.link}" target="_blank" class="rounded-full bg-gray-700 px-3 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-gray-800">Learn More <span aria-hidden="true">&rarr;</span></a>
            </div>

        </div>
    </div>
    `;
}

// Search handler initialization
document.addEventListener('DOMContentLoaded', function () {
    console.log('dataFishing.js - DOM loaded');

    // Prevent closing progress modal by clicking on it
    const progressModal = document.getElementById('progressModal');
    if (progressModal) {
        progressModal.addEventListener('click', function(e) {
            // Only prevent clicks on the modal backdrop, not on the content
            if (e.target === progressModal) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        // Disable backdrop click from closing modal
        progressModal.addEventListener('mousedown', function(e) {
            if (e.target === progressModal) {
                e.preventDefault();
            }
        });
    }

    // Check API availability after a short delay
    setTimeout(() => {
        console.log('Checking API availability:');
        console.log('- EschmeyerAPI:', typeof EschmeyerAPI !== 'undefined' ? 'Available' : 'Missing');
        console.log('- WormsAPI:', typeof WormsAPI !== 'undefined' ? 'Available' : 'Missing');
        console.log('- GbifAPI:', typeof GbifAPI !== 'undefined' ? 'Available' : 'Missing');
        console.log('- BoldAPI:', typeof BoldAPI !== 'undefined' ? 'Available' : 'Missing');
        console.log('- IucnAPI:', typeof IucnAPI !== 'undefined' ? 'Available' : 'Missing');
        console.log('- NcbiAPI:', typeof NcbiAPI !== 'undefined' ? 'Available' : 'Missing');

        if (typeof EschmeyerAPI !== 'undefined' && typeof window.eschmeyerAPI === 'undefined') {
            window.eschmeyerAPI = new EschmeyerAPI();
        }
        if (typeof WormsAPI !== 'undefined' && typeof window.wormsAPI === 'undefined') {
            window.wormsAPI = new WormsAPI();
        }
        if (typeof GbifAPI !== 'undefined' && typeof window.gbifAPI === 'undefined') {
            window.gbifAPI = new GbifAPI();
        }
        if (typeof BoldAPI !== 'undefined' && typeof window.boldAPI === 'undefined') {
            window.boldAPI = new BoldAPI();
        }
        if (typeof NcbiAPI !== 'undefined' && typeof window.ncbiAPI === 'undefined') {
            window.ncbiAPI = new NcbiAPI();
        }
    }, 100);

    // Search button handler
    const startSearch = document.getElementById('startSearch');
    if (startSearch) {
        startSearch.addEventListener('click', async function () {
            console.log('Start search button clicked');

            // Collect all checked APIs
            const selectedApis = [];
            Object.keys(Cards).forEach(key => {
                const cb = document.getElementById(key + '-checkbox');
                if (cb && cb.checked) {
                    selectedApis.push(key);
                }
            });

            console.log('Selected databases:', selectedApis);

            if (selectedApis.length === 0) {
                alert('Please select at least one database to search.');
                return;
            }

            const speciesNames = document.getElementById('speciesNames').value.split('\n').filter(name => name.trim());
            if (speciesNames.length === 0) {
                alert('Please enter at least one species name.');
                return;
            }

            // Show progress modal
            const progressModal = document.getElementById('progressModal');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const apiProgressContainer = document.getElementById('apiProgressContainer');
            if (progressModal) {
                progressModal.classList.remove('hidden');
                progressBar.style.width = '0%';
                progressText.textContent = '0%';

                // Initialize per-API progress bars
                apiProgressContainer.innerHTML = '';
                selectedApis.forEach(apiKey => {
                    const apiName = {
                        'eschmeyer': "Eschmeyer's Catalog",
                        'worms': 'WoRMS',
                        'gbif': 'GBIF',
                        'bold': 'BOLD Systems',
                        'iucn': 'IUCN Red List',
                        'ncbi': 'NCBI'
                    }[apiKey] || apiKey;

                    const apiProgressDiv = document.createElement('div');
                    apiProgressDiv.id = `progress-${apiKey}`;
                    apiProgressDiv.className = 'text-left';
                    apiProgressDiv.innerHTML = `
                        <div class="text-sm font-semibold text-gray-700 mb-1">${apiName}</div>
                        <div class="w-full bg-gray-200 rounded-full h-3 relative">
                            <div id="progressBar-${apiKey}" class="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-300 ease-out" style="width: 0%;"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1"><span id="progressText-${apiKey}">0%</span></div>
                    `;
                    apiProgressContainer.appendChild(apiProgressDiv);
                });
            }

            // Clear previous results and create tabs
            const resultsContainer = document.getElementById('Results');
            resultsContainer.innerHTML = '';

            // Create tab structure
            createResultTabs(selectedApis);

            // Create a global progress tracker for coordinated updates
            const globalProgress = {
                apiProgress: {},
                updateMainProgress: function() {
                    // Calculate average progress across all APIs
                    const progressValues = Object.values(this.apiProgress);
                    if (progressValues.length === 0) return;

                    const avgProgress = progressValues.reduce((a, b) => a + b, 0) / progressValues.length;
                    progressBar.style.width = avgProgress + '%';
                    progressText.textContent = Math.round(avgProgress) + '%';
                },
                updateApiProgress: function(apiKey, progress) {
                    this.apiProgress[apiKey] = progress;
                    this.updateMainProgress();
                }
            };

            // Make it globally accessible so API callbacks can update it
            window.globalProgressTracker = globalProgress;

            // Initialize progress for each API
            selectedApis.forEach(apiKey => {
                globalProgress.apiProgress[apiKey] = 0;
            });

            // Map API keys to their search functions
            const apiSearchMap = {
                'eschmeyer': getEschmeyer,
                'worms': getWoRMS,
                'gbif': getGBIF,
                'bold': getBOLD,
                'iucn': getIUCN,
                'ncbi': typeof getNcbi !== 'undefined' ? getNcbi : null
            };

            // Create a wrapper function to intercept progress updates
            const createProgressWrapper = (apiKey, searchFn) => {
                return async (...args) => {
                    // Store the original fetch/API calls if needed
                    return searchFn(apiKey).catch(err => {
                        console.error(`Error in ${apiKey} search:`, err);
                    });
                };
            };

            // Run all selected APIs in parallel with coordinated progress tracking
            const promises = selectedApis.map(apiKey => {
                const searchFn = apiSearchMap[apiKey];
                if (searchFn) {
                    return (async () => {
                        try {
                            await searchFn(apiKey);
                            // Mark this API as complete (100%)
                            globalProgress.updateApiProgress(apiKey, 100);
                        } catch (err) {
                            console.error(`Error in ${apiKey} search:`, err);
                            globalProgress.updateApiProgress(apiKey, 0);
                        }
                    })();
                }
                return Promise.resolve();
            });

            await Promise.all(promises);

            // Re-initialize Tippy.js tooltips on dynamically created elements
            if (typeof tippy !== 'undefined') {
                tippy('#Results [title]', {
                    placement: 'top',
                    arrow: true,
                    animation: 'fade',
                    duration: [200, 150],
                    delay: [200, 0],
                    theme: 'light-border',
                    onShow(instance) {
                        const title = instance.reference.getAttribute('title');
                        if (title) {
                            instance.setContent(title);
                            instance.reference.removeAttribute('title');
                            instance.reference.dataset.tippyContent = title;
                        }
                    }
                });
            }

            // Update sticky headers after tables are rendered
            if (typeof updateStickyHeaders !== 'undefined') {
                setTimeout(() => {
                    updateStickyHeaders();
                }, 100);
            }

            // Hide progress modal
            if (progressModal) {
                setTimeout(() => {
                    progressModal.classList.add('hidden');
                }, 500);
            }

            // Activate first tab
            if (selectedApis.length > 0) {
                switchTab(selectedApis[0]);
            }
        });
        console.log('Start search button event listener added');
    } else {
        console.error('Start search button not found');
    }
});
