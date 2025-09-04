class SEOGenerator {
    constructor() {
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
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.generatePagesBtn.addEventListener('click', () => this.generatePages());
        this.downloadCsvBtn.addEventListener('click', () => this.downloadCSV());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.promptTypeSelect.addEventListener('change', () => this.handlePromptTypeChange());
        
        // Initialize dark mode from localStorage
        this.initDarkMode();
        
        // Initialize webhook listeners
        this.initWebhookListeners();
        
        // Set initial state
        this.showStatus('Waiting for webhook data...', 'info');
    }
    
    initWebhookListeners() {
        // Listen for prompt types webhook
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'prompt_types_data') {
                this.handlePromptTypesData(event.data.payload);
            } else if (event.data && event.data.type === 'keywords_data') {
                this.handleKeywordsData(event.data.payload);
            }
        });
        
        // Also listen for custom events
        document.addEventListener('promptTypesData', (event) => {
            this.handlePromptTypesData(event.detail);
        });
        
        document.addEventListener('keywordsData', (event) => {
            this.handleKeywordsData(event.detail);
        });
    }
    
    handlePromptTypesData(data) {
        if (data.prompt_types && Array.isArray(data.prompt_types)) {
            this.promptTypes = data.prompt_types;
            this.updatePromptTypeOptions();
            this.showStatus(`Loaded ${data.prompt_types.length} prompt types`, 'success');
        }
    }
    
    handleKeywordsData(data) {
        if (data.keywords && Array.isArray(data.keywords)) {
            this.loadedKeywords = data.keywords;
            this.displayKeywords(this.loadedKeywords);
            this.showStatus(`Loaded ${data.keywords.length} keywords`, 'success');
        }
    }
    
    updatePromptTypeOptions() {
        // Clear existing options
        this.promptTypeSelect.innerHTML = '<option value="">Select prompt type...</option>';
        
        // Add loaded prompt types
        this.promptTypes.forEach(promptType => {
            const option = document.createElement('option');
            option.value = promptType;
            option.textContent = this.formatPromptTypeName(promptType);
            this.promptTypeSelect.appendChild(option);
        });
    }
    
    formatPromptTypeName(docName) {
        // Convert doc_name to human readable format
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
    
    handlePromptTypeChange() {
        const selectedPrompt = this.promptTypeSelect.value;
        
        if (selectedPrompt) {
            this.showStatus(`Selected prompt type: ${this.formatPromptTypeName(selectedPrompt)}`, 'info');
            // Keywords will be loaded separately via webhook
        } else {
            this.keywordsDisplay.style.display = 'none';
            this.loadedKeywords = [];
        }
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
            cityState: document.getElementById('cityState').value.trim(),
            websiteUrl: document.getElementById('websiteUrl').value.trim(),
            keywords: this.loadedKeywords
        };
    }
    
    validateFormData(data) {
        if (!data.promptType) {
            this.showStatus('Please select a prompt type', 'error');
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
        
        if (!data.keywords || data.keywords.length === 0) {
            this.showStatus('No keywords loaded. Please load keywords via webhook first.', 'error');
            return false;
        }
        
        return true;
    }
    
    generateMatrix(data) {
        const { cityState, keywords, websiteUrl } = data;
        
        // Parse city and state
        const cityStateParts = cityState.split(',').map(part => part.trim());
        const city = cityStateParts[0];
        const state = cityStateParts[1] || '';
        
        // Clean website URL (remove trailing slash)
        const baseUrl = websiteUrl.replace(/\/$/, '');
        
        // Use loaded keywords array
        const keywordList = keywords;
        
        // Generate matrix combinations
        const matrix = [];
        
        // Add header row
        matrix.push({
            type: 'header',
            city: 'City',
            state: 'State', 
            keyword: 'Service Keyword',
            urlSlug: 'URL Slug',
            fullUrl: 'Full URL',
            pageTitle: 'Page Title'
        });
        
        // Generate combinations
        keywordList.forEach(keyword => {
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
        
        // Add summary
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
        
        try {
            this.showStatus('Generating pages on your website...', 'info');
            
            // Send to backend for processing (Google Sheets connection handled there)
            const response = await fetch('/api/generate-pages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matrix: this.currentMatrix,
                    websiteUrl: websiteUrl,
                    promptType: this.promptTypeSelect.value,
                    timestamp: new Date().toISOString()
                })
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
        if (this.currentMatrix.length === 0) {
            this.showStatus('No matrix data to download', 'error');
            return;
        }
        
        // Convert matrix to CSV
        const csvContent = this.currentMatrix.map(row => 
            [row.city, row.state, row.keyword, row.urlSlug, row.fullUrl || '', row.pageTitle]
                .map(field => `"${field}"`)
                .join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `seo-matrix-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showStatus('CSV file downloaded successfully!', 'success');
    }
    
    displayKeywords(keywords) {
        this.keywordCount.textContent = `${keywords.length} keywords`;
        
        const keywordTags = keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
        
        this.keywordsList.innerHTML = keywordTags;
        this.keywordsDisplay.style.display = 'block';
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
        
        // Auto-hide success messages after 5 seconds
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
    const seoGenerator = new SEOGenerator();
    
    // Expose global functions for external webhook integration
    window.loadPromptTypes = function(data) {
        const event = new CustomEvent('promptTypesData', { detail: data });
        document.dispatchEvent(event);
    };
    
    window.loadKeywords = function(data) {
        const event = new CustomEvent('keywordsData', { detail: data });
        document.dispatchEvent(event);
    };
    
    // Example usage for testing (remove in production):
    // window.loadPromptTypes({
    //     prompt_types: ["service_areas_prompt", "location_pages_prompt"]
    // });
    // 
    // window.loadKeywords({
    //     keywords: ["windows installation", "door replacement", "roof repair"]
    // });
});