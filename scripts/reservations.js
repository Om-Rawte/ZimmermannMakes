// Reservations page functionality
document.addEventListener('DOMContentLoaded', function() {
    setupReservationForm();
    setupLiveTableSelector();
    loadTableAvailability();
});

// Setup reservation form
function setupReservationForm() {
    const reservationForm = document.getElementById('reservationForm');
    if (!reservationForm) return;

    reservationForm.addEventListener('submit', handleReservationSubmit);
}

function setupLiveTableSelector() {
    const form = document.getElementById('reservationForm');
    if (!form) return;
    const dateInput = form.querySelector('input[name="date"]');
    const timeInput = form.querySelector('select[name="time"]');
    const guestsInput = form.querySelector('select[name="guests"]');
    let tableSelect = form.querySelector('select[name="tableId"]');
    if (!tableSelect) {
        tableSelect = document.createElement('select');
        tableSelect.name = 'tableId';
        tableSelect.required = true;
        tableSelect.className = 'form-group';
        tableSelect.innerHTML = '<option value="">Select Table</option>';
        // Insert after guestsInput
        guestsInput.parentNode.insertAdjacentElement('afterend', tableSelect);
    }
    async function updateTableOptions() {
        const date = dateInput.value;
        const time = timeInput.value;
        const guests = parseInt(guestsInput.value, 10);
        if (!date || !time || !guests) {
            tableSelect.innerHTML = '<option value="">Select Table</option>';
            tableSelect.disabled = true;
            return;
        }
        tableSelect.disabled = true;
        tableSelect.innerHTML = '<option>Loading...</option>';
        try {
            const res = await fetch(`/api/tables?date=${date}&time=${time}`);
            const tables = await res.json();
            const available = tables.filter(t => t.available && t.capacity >= guests);
            if (available.length === 0) {
                tableSelect.innerHTML = '<option value="">No tables available</option>';
                tableSelect.disabled = true;
            } else {
                tableSelect.innerHTML = '<option value="">Select Table</option>' +
                    available.map(t => `<option value="${t.id}">${t.name} (${t.capacity} seats)</option>`).join('');
                tableSelect.disabled = false;
            }
        } catch (e) {
            tableSelect.innerHTML = '<option value="">Error loading tables</option>';
            tableSelect.disabled = true;
        }
    }
    dateInput.addEventListener('change', updateTableOptions);
    timeInput.addEventListener('change', updateTableOptions);
    guestsInput.addEventListener('change', updateTableOptions);
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
    if (!formDataObj.tableId) {
        utils.showNotification('Please select an available table.', 'error');
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
            body: JSON.stringify({
                name: formDataObj.name,
                email: formDataObj.email,
                phone: formDataObj.phone,
                guests: parseInt(formDataObj.guests, 10),
                date: formDataObj.date,
                time: formDataObj.time,
                tableId: parseInt(formDataObj.tableId, 10),
                occasion: formDataObj['special-requests'] || ''
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to make reservation');
        }
        utils.showNotification('Reservation submitted successfully! We will confirm your booking shortly.', 'success');
        e.target.reset();
        loadTableAvailability();
    } catch (error) {
        console.error('Error submitting reservation:', error);
        utils.showNotification(error.message || 'Failed to make reservation. Please try again later.', 'error');
    } finally {
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
    // Get selected date/time from form
    const form = document.getElementById('reservationForm');
    let date = '', time = '', guests = 1;
    if (form) {
        date = form.querySelector('input[name="date"]').value;
        time = form.querySelector('select[name="time"]').value;
        guests = parseInt(form.querySelector('select[name="guests"]').value, 10) || 1;
    }
    try {
        availabilityGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading table availability...</p>
            </div>
        `;
        let url = '/api/tables';
        if (date && time) url += `?date=${date}&time=${time}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch table availability');
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
        availabilityGrid.innerHTML = tables.map(table => `
            <div class="table-card ${table.available ? 'available' : 'reserved'}">
                <div class="table-name">${table.name}</div>
                <div class="table-capacity">${table.capacity} seats</div>
                <div class="table-status ${table.available ? 'available' : 'reserved'}">${table.available ? 'Available' : 'Reserved'}</div>
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