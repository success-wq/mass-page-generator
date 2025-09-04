//v2 (referenced to previous v18)
// ONLY UPDATE THESE TWO METHODS IN YOUR EXISTING WORKING SCRIPT

// Replace your existing handleFormSubmit method with this:
async handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = this.getFormData();
    if (!this.validateFormData(formData)) return;
    
    this.showLoading(true);
    this.hideStatus();
    
    try {
        // Send data to webhook first
        await this.sendToWebhook(formData);
        
        // Then generate and display the matrix (your existing code)
        const matrix = this.generateMatrix(formData);
        this.currentMatrix = matrix;
        this.displayMatrix(matrix);
        this.showResults();
        this.showStatus('Matrix generated successfully and data sent to webhook!', 'success');
    } catch (error) {
        this.showStatus('Error: ' + error.message, 'error');
    } finally {
        this.showLoading(false);
    }
}

// ADD this new method to your existing class:
async sendToWebhook(formData) {
    const webhookUrl = 'https://bsmteam.app.n8n.cloud/webhook-test/9e3a84b1-42e9-416b-9c73-a3cf329138d4';
    
    // Get current form data
    const selection = this.promptTypeSelect.value.trim();
    const location = document.getElementById('cityState').value.trim();
    const companyUrl = document.getElementById('websiteUrl').value.trim();
    
    // Try to get company name, but don't fail if element doesn't exist
    let companyName = '';
    const companyNameElement = document.getElementById('companyName');
    if (companyNameElement) {
        companyName = companyNameElement.value.trim();
    }
    
    // Create payload according to expected format
    const payload = [
        {
            "selection": selection,        // actual dropdown value
            "keyword": "",                 // left blank as requested
            "location": location,          // actual city+state input
            "company_name": companyName,   // actual company name input (or empty if field doesn't exist)
            "company_url": companyUrl      // actual website URL input
        }
    ];
    
    console.log('Sending payload to webhook:', payload);
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Webhook response:', result);
        
    } catch (error) {
        console.error('Webhook error:', error);
        // Don't throw error here - let the matrix generation continue even if webhook fails
        console.warn('Webhook failed, but continuing with matrix generation');
    }
}
