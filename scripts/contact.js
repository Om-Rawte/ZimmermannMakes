// Contact page functionality
document.addEventListener('DOMContentLoaded', function() {
    setupContactForm();
});

// Setup contact form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', handleContactSubmit);
}

// Handle contact form submission
async function handleContactSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData.entries());

    // Validate form
    const validation = validateContactForm(formDataObj);
    if (!validation.isValid) {
        utils.showNotification(validation.errors.join(', '), 'error');
        return;
    }

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Send form data
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObj)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Show success message
        utils.showNotification('Thank you for your message! We will get back to you soon.', 'success');
        
        // Reset form
        e.target.reset();

    } catch (error) {
        console.error('Error sending contact form:', error);
        utils.showNotification('Failed to send message. Please try again later.', 'error');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
    }
}

// Validate contact form
function validateContactForm(data) {
    const errors = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (!data.email || !utils.validateEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    // Subject validation
    if (!data.subject || data.subject === '') {
        errors.push('Please select a subject');
    }

    // Message validation
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }

    // Phone validation (optional)
    if (data.phone && !utils.validatePhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
} 