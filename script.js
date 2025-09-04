//v18
class SEOGenerator {
    constructor() {
        console.log('SEOGenerator constructor called');
        
        this.form = document.getElementById('seoForm');
        this.resultsSection = document.getElementById('results');
        this.matrixPreview = document.getElementById('matrixPreview');
        this.statusMessage = document.getElementById('statusMessage');
        this.submitBtn = document.getElementById('submitBtn');
        this.generatePagesBtn = document.getElementById('generatePages');
        this.downloadCsvBtn = document.getElementById('downloadCsv');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.keywordsDisplay = document.getElementById('keywordsDisplay');
        this.keywordsList = document.getElementById('keywordsList');
        this.keywordCount = document.getElementById('keywordCount');
        this.promptTypeSelect = document.getElementById('promptType');
        
        this.currentMatrix = [];
        this.loadedKeywords = [];
        this.promptTypes = [];
        this.sheetsData = {
            docNames: [],
            keywordsMap: {}
        };
        
        console.log('About to call init()');
        this.init();
    }
    
    init() {
        console.log('SEOGenerator init() called');
        
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.generatePagesBtn.addEventListener('click', () => this.generatePages());
        this.downloadCsvBtn.addEventListener('click', () => this.downloadCSV());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.promptTypeSelect.addEventListener('change', () => this.handlePromptTypeChange());
        
        console.log('Event listeners attached');
        
        this.initDarkMode();
        this.initWebhookListeners();
        
        this.showStatus('Loading data from Google Apps Script...', 'info');
        
        console.log('About to load initial sheets data');
        this.loadInitialSheetsData();
    }
    
    async loadInitialSheetsData() {
        console.log('loadInitialSheetsData() called');
        
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbxjKNjowmwUDYVmZONXf6NRUTNif4GmUQT9iN8C39sCV-mF6U4HpjvUlrmps09NUYAl/exec';
        
        try {
            console.log('Calling fetchFromWebApp with URL:', webAppUrl);
            await this.fetchFromWebApp(webAppUrl);
        } catch (error) {
            console.error('Failed to load data from web app:', error);
            this.showStatus('Failed to load data from Google Sheets Web App. Please check the deployment.', 'error');
        }
    }
    
    async fetchFromWebApp(webAppUrl) {
        console.log('fetchFromWebApp() called with:', webAppUrl);
        
        try {
            this.showStatus('Fetching data from Google Apps Script...', 'info');
            
            // Use JSONP to bypass CORS restrictions
            console.log('Using JSONP to bypass CORS...');
            const data = await this.fetchViaJSONP(webAppUrl);
            
            console.log('JSONP data received:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.mapWebAppDataToUI(data);
            this.showStatus('Successfully loaded data from Google Apps Script!', 'success');
            
        } catch (error) {
            console.error('fetchFromWebApp error:', error);
            
            // Fallback: try direct fetch in case CORS is fixed
            console.log('JSONP failed, trying direct fetch as fallback...');
            try {
                const response = await fetch(webAppUrl + '?callback=?', {
                    method: 'GET',
                    mode: 'no-cors'
                });
                console.log('Fallback fetch response:', response);
            } catch (fetchError) {
                console.error('Fallback fetch also failed:', fetchError);
            }
            
            throw error;
        }
    }
    
    fetchViaJSONP(url) {
        return new Promise((resolve, reject) => {
            // Create a unique callback name
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            
            // Add callback parameter to URL
            const urlWithCallback = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
            
            console.log('JSONP URL:', urlWithCallback);
            
            // Create script element
            const script = document.createElement('script');
            script.src = urlWithCallback;
            
            // Set up callback function
            window[callbackName] = function(data) {
                console.log('JSONP callback received:', data);
                resolve(data);
                
                // Cleanup
                document.head.removeChild(script);
                delete window[callbackName];
            };
            
            // Handle errors
            script.onerror = function() {
                console.error('JSONP script failed to load');
                reject(new Error('JSONP request failed'));
                
                // Cleanup
                document.head.removeChild(script);
                delete window[callbackName];
            };
            
            // Add script to DOM to trigger request
            document.head.appendChild(script);
            
            // Set timeout
            setTimeout(() => {
                if (window[callbackName]) {
                    console.error('JSONP request timed out');
                    reject(new Error('JSONP request timed out'));
                    
                    // Cleanup
                    if (document.head.contains(script)) {
                        document.head.removeChild(script);
                    }
                    delete window[callbackName];
                }
            }, 10000); // 10 second timeout
        });
    }
    
    mapWebAppDataToUI(jsonData) {
        console.log('mapWebAppDataToUI called with:', jsonData);
        
        if (!jsonData.prompt_types || !Array.isArray(jsonData.prompt_types)) {
            throw new Error('Invalid data format: prompt_types array not found');
        }
        
        if (!jsonData.keywords_map || typeof jsonData.keywords_map !== 'object') {
            throw new Error('Invalid data format: keywords_map object not found');
        }
        
        this.sheetsData = {
            docNames: jsonData.prompt_types,
            keywordsMap: jsonData.keywords_map
        };
        
        console.log('Mapped data:', this.sheetsData);
        this.updatePromptTypesFromSheets();
    }
    
    updatePromptTypesFromSheets() {
        console.log('updatePromptTypesFromSheets called');
        
        if (this.sheetsData.docNames.length === 0) {
            this.showStatus('No prompt types found in Google Sheets', 'error');
            return;
        }
        
        this.promptTypes = [...this.sheetsData.docNames];
        this.updatePromptTypeOptions();
        
        this.showStatus(`Loaded ${this.promptTypes.length} prompt types from Google Sheets`, 'success');
    }
    
    updatePromptTypeOptions() {
        console.log('updatePromptTypeOptions called with:', this.promptTypes);
        
        this.promptTypeSelect.innerHTML = '<option value="">Select prompt type...</option>';
        
        this.promptTypes.forEach(promptType => {
            const option = document.createElement('option');
            option.value = promptType;
            option.textContent = this.formatPromptTypeName(promptType);
            this.promptTypeSelect.appendChild(option);
            console.log(`Added option: ${promptType}`);
        });
    }
    
    formatPromptTypeName(docName) {
        return docName.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    initDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }
    
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    }
    
    initWebhookListeners() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type && event.data.type.startsWith('webhook_')) {
                console.log('Received webhook message:', event.data);
            }
        });
    }
    
    handlePromptTypeChange() {
        const selectedPrompt = this.promptTypeSelect.value;
        
        if (selectedPrompt) {
            if (this.sheetsData && this.sheetsData.keywordsMap[selectedPrompt]) {
                this.loadKeywordsForSelectedPrompt(selectedPrompt);
            } else {
                this.showStatus(`Selected prompt type: ${this.formatPromptTypeName(selectedPrompt)}`, 'info');
            }
        } else {
            this.keywordsDisplay.style.display = 'none';
            this.loadedKeywords = [];
        }
    }
    
    loadKeywordsForSelectedPrompt(selectedDocName) {
        if (this.sheetsData.keywordsMap[selectedDocName]) {
            this.loadedKeywords = [...this.sheetsData.keywordsMap[selectedDocName]];
            this.displayKeywords(this.loadedKeywords);
            this.showStatus(`Loaded ${this.loadedKeywords.length} keywords for "${selectedDocName}"`, 'success');
        } else {
            this.keywordsDisplay.style.display = 'none';
            this.loadedKeywords = [];
            this.showStatus(`No keywords found for "${selectedDocName}"`, 'error');
        }
    }
    
    displayKeywords(keywords) {
        this.keywordCount.textContent = `${keywords.length} keywords`;
        
        const keywordTags = keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
        
        this.keywordsList.innerHTML = keywordTags;
        this.keywordsDisplay.style.display = 'block';
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;
        
        this.showLoading(true);
        this.hideStatus();
        
        try {
            const matrix = this.generateMatrix(formData);
            this.currentMatrix = matrix;
            this.displayMatrix(matrix);
            this.showResults();
            this.showStatus('Matrix generated successfully!', 'success');
        } catch (error) {
            this.showStatus('Error generating matrix: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    getFormData() {
        return {
            promptType: this.promptTypeSelect.value.trim(),
            companyName: document.getElementById('companyName').value.trim(),
            cityState: document.getElementById('cityState').value.trim(),
            websiteUrl: document.getElementById('websiteUrl').value.trim(),
            wpUsername: document.getElementById('wpUsername').value.trim(),
            wpPassword: document.getElementById('wpPassword').value.trim(),
            keywords: this.loadedKeywords
        };
    }
    
    validateFormData(data) {
        if (!data.promptType) {
            this.showStatus('Please select a prompt type', 'error');
            return false;
        }
        
        if (!data.companyName) {
            this.showStatus('Please enter your company name', 'error');
            return false;
        }
        
        if (!data.cityState) {
            this.showStatus('Please enter city and state', 'error');
            return false;
        }
        
        if (!data.websiteUrl) {
            this.showStatus('Please enter your website URL', 'error');
            return false;
        }
        
        if (!data.wpUsername) {
            this.showStatus('Please enter your WordPress username', 'error');
            return false;
        }
        
        if (!data.wpPassword) {
            this.showStatus('Please enter your WordPress password', 'error');
            return false;
        }
        
        if (!data.keywords || data.keywords.length === 0) {
            this.showStatus('No keywords loaded. Please select a prompt type first.', 'error');
            return false;
        }
        
        return true;
    }
    
    generateMatrix(data) {
        const { cityState, keywords, websiteUrl } = data;
        
        const cityStateParts = cityState.split(',').map(part => part.trim());
        const city = cityStateParts[0];
        const state = cityStateParts[1] || '';
        
        const baseUrl = websiteUrl.replace(/\/$/, '');
        const matrix = [];
        
        matrix.push({
            type: 'header',
            city: 'City',
            state: 'State', 
            keyword: 'Service Keyword',
            urlSlug: 'URL Slug',
            fullUrl: 'Full URL',
            pageTitle: 'Page Title'
        });
        
        keywords.forEach(keyword => {
            const urlSlug = this.generateUrlSlug(city, state, keyword);
            const fullUrl = `${baseUrl}${urlSlug}`;
            const pageTitle = this.generatePageTitle(city, state, keyword);
            
            matrix.push({
                type: 'data',
                city: city,
                state: state,
                keyword: keyword,
                urlSlug: urlSlug,
                fullUrl: fullUrl,
                pageTitle: pageTitle
            });
        });
        
        return matrix;
    }
    
    generateUrlSlug(city, state, keyword) {
        const cleanCity = city.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const cleanKeyword = keyword.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
            
        return `/locations/${cleanCity}/${cleanKeyword}`;
    }
    
    generatePageTitle(city, state, keyword) {
        const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
        
        return `${capitalizedKeyword} in ${capitalizedCity}, ${state}`;
    }
    
    displayMatrix(matrix) {
        if (matrix.length === 0) {
            this.matrixPreview.innerHTML = '<p>No data generated</p>';
            return;
        }
        
        let html = '<div class="matrix-grid" style="grid-template-columns: repeat(6, 1fr);">';
        
        matrix.forEach(row => {
            const isHeader = row.type === 'header';
            const className = isHeader ? 'matrix-item matrix-header' : 'matrix-item';
            
            html += `
                <div class="${className}">${row.city}</div>
                <div class="${className}">${row.state}</div>
                <div class="${className}">${row.keyword}</div>
                <div class="${className}">${row.urlSlug}</div>
                <div class="${className}">${row.fullUrl || 'Full URL'}</div>
                <div class="${className}">${row.pageTitle}</div>
            `;
        });
        
        html += '</div>';
        
        const dataRows = matrix.filter(row => row.type === 'data');
        html += `<p><strong>Total combinations generated: ${dataRows.length}</strong></p>`;
        
        this.matrixPreview.innerHTML = html;
    }
    
    async generatePages() {
        if (this.currentMatrix.length === 0) {
            this.showStatus('No matrix data to generate pages from', 'error');
            return;
        }
        
        const websiteUrl = document.getElementById('websiteUrl').value.trim();
        const apiEndpoint = '/api/generate-pages';
        
        try {
            this.showStatus('Generating pages on your website...', 'info');
            
            const requestData = {
                matrix: this.currentMatrix,
                websiteUrl: websiteUrl,
                promptType: this.promptTypeSelect.value,
                timestamp: new Date().toISOString()
            };
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showStatus(`Successfully generated ${result.pagesCreated || 'multiple'} pages on your website!`, 'success');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.showStatus('Error generating pages: ' + error.message, 'error');
        }
    }
    
    downloadCSV() {
        // CSV functionality removed - no longer needed
        this.showStatus('Export functionality has been removed', 'info');
    }
    
    showLoading(show) {
        const btnText = this.submitBtn.querySelector('.btn-text');
        const loader = this.submitBtn.querySelector('.loader');
        
        if (show) {
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';
            this.submitBtn.disabled = true;
        } else {
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
            this.submitBtn.disabled = false;
        }
    }
    
    showResults() {
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => this.hideStatus(), 5000);
        }
    }
    
    hideStatus() {
        this.statusMessage.style.display = 'none';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    
    try {
        const seoGenerator = new SEOGenerator();
        console.log('SEOGenerator instance created successfully');
        
        window.seoGenerator = seoGenerator;
        
    } catch (error) {
        console.error('Error creating SEOGenerator:', error);
        console.error('Error stack:', error.stack);
    }
    
    window.loadPromptTypes = function(data) {
        const event = new CustomEvent('promptTypesData', { detail: data });
        document.dispatchEvent(event);
    };
    
    window.loadKeywords = function(data) {
        const event = new CustomEvent('keywordsData', { detail: data });
        document.dispatchEvent(event);
    };
    
    window.loadGoogleSheetsData = function(spreadsheetUrl) {
        if (window.seoGenerator) {
            return window.seoGenerator.fetchGoogleSheetsData(spreadsheetUrl);
        } else {
            console.error('SEOGenerator not initialized');
        }
    };
});
