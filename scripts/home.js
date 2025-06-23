import { supabase } from '../src/supabaseClient.js';

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

        // Fetch recipes from Supabase
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('published', true);
        if (error) throw error;

        // Get 3 random recipes for special dishes
        const specialDishes = (data || [])
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
            <div class="special-dish">
                <h4>${dish.name}</h4>
                <p>${dish.details}</p>
            </div>
        `).join('');
    } catch (error) {
        specialDishesContainer.innerHTML = `<div class='error-state'><h3>Error loading specials</h3><p>${error.message}</p></div>`;
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