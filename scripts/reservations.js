// Reservations page functionality
document.addEventListener('DOMContentLoaded', function() {
    setupReservationForm();
    loadTableAvailability();
});

// Setup reservation form
function setupReservationForm() {
    const reservationForm = document.getElementById('reservationForm');
    if (!reservationForm) return;

    reservationForm.addEventListener('submit', handleReservationSubmit);
}

// Handle reservation form submission
async function handleReservationSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formDataObj = Object.fromEntries(formData.entries());

    // Validate form
    const validation = validateReservationForm(formDataObj);
    if (!validation.isValid) {
        utils.showNotification(validation.errors.join(', '), 'error');
        return;
    }

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Booking...';
        submitBtn.disabled = true;

        // Send reservation data
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObj)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to make reservation');
        }

        // Show success message
        utils.showNotification('Reservation submitted successfully! We will confirm your booking shortly.', 'success');
        
        // Reset form
        e.target.reset();

        // Refresh table availability
        loadTableAvailability();

    } catch (error) {
        console.error('Error submitting reservation:', error);
        utils.showNotification(error.message || 'Failed to make reservation. Please try again later.', 'error');
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Book Reservation';
        submitBtn.disabled = false;
    }
}

// Validate reservation form
function validateReservationForm(data) {
    const errors = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    if (!data.email || !utils.validateEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    // Phone validation
    if (!data.phone || !utils.validatePhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }

    // Guests validation
    if (!data.guests || data.guests === '') {
        errors.push('Please select number of guests');
    }

    // Date validation
    if (!data.date) {
        errors.push('Please select a date');
    } else {
        const selectedDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.push('Please select a future date');
        }
    }

    // Time validation
    if (!data.time || data.time === '') {
        errors.push('Please select a time');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Load table availability
async function loadTableAvailability() {
    const availabilityGrid = document.getElementById('availabilityGrid');
    if (!availabilityGrid) return;

    try {
        // Show loading state
        availabilityGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading table availability...</p>
            </div>
        `;

        // Fetch table availability
        const response = await fetch('/api/tables');
        if (!response.ok) {
            throw new Error('Failed to fetch table availability');
        }

        const tables = await response.json();

        if (tables.length === 0) {
            availabilityGrid.innerHTML = `
                <div class="no-tables">
                    <i class="fas fa-info-circle"></i>
                    <h3>No tables available</h3>
                    <p>Please contact us directly for availability</p>
                </div>
            `;
            return;
        }

        // Render table availability
        availabilityGrid.innerHTML = tables.map(table => `
            <div class="table-card ${table.status.toLowerCase()}">
                <div class="table-name">${table.name}</div>
                <div class="table-capacity">${table.sitzplaetze} seats</div>
                <div class="table-status ${table.status.toLowerCase()}">${table.status}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading table availability:', error);
        availabilityGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load table availability</h3>
                <p>Please contact us directly for reservations</p>
            </div>
        `;
    }
} 