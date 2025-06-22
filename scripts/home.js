// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadSpecialDishes();
});

// Load special dishes for the homepage
async function loadSpecialDishes() {
    const specialDishesContainer = document.getElementById('specialDishes');
    if (!specialDishesContainer) return;

    try {
        // Show loading state
        specialDishesContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading special dishes...</p>
            </div>
        `;

        // Fetch recipes from API
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        const recipes = await response.json();
        
        // Get 3 random recipes for special dishes
        const specialDishes = recipes
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        if (specialDishes.length === 0) {
            specialDishesContainer.innerHTML = `
                <div class="no-specials">
                    <i class="fas fa-utensils"></i>
                    <h3>No special dishes available</h3>
                    <p>Check back later for our daily specials!</p>
                </div>
            `;
            return;
        }

        // Render special dishes
        specialDishesContainer.innerHTML = specialDishes.map(dish => `
            <div class="dish-card" onclick="showRecipeDetails('${dish.id}')">
                <div class="dish-image">
                    ${dish.imageData ? 
                        `<img src="data:image/jpeg;base64,${dish.imageData}" alt="${dish.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i>'">` :
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                <div class="dish-content">
                    <h3 class="dish-title">${dish.name}</h3>
                    <p class="dish-description">${dish.details.substring(0, 100)}${dish.details.length > 100 ? '...' : ''}</p>
                    <div class="dish-meta">
                        <span class="dish-category">${dish.category}</span>
                        <span class="dish-price">${utils.formatPrice(dish.price)}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading special dishes:', error);
        specialDishesContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load special dishes</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Show recipe details in modal
function showRecipeDetails(recipeId) {
    // Redirect to menu page with recipe filter
    window.location.href = `menu.html?recipe=${recipeId}`;
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .dish-card, .about-content');
    animatedElements.forEach(el => observer.observe(el));
}); 