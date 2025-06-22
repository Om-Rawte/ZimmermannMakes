// Menu page functionality
let allRecipes = [];
let filteredRecipes = [];

document.addEventListener('DOMContentLoaded', function() {
    loadMenu();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce(handleSearch, 300));
    }

    // Category filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleCategoryFilter(btn));
    });

    // Modal functionality
    const modal = document.getElementById('recipeModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Check for recipe parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('recipe');
    if (recipeId) {
        setTimeout(() => showRecipeModal(recipeId), 500);
    }
}

// Load menu from API
async function loadMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noResults = document.getElementById('noResults');

    if (!menuGrid) return;

    try {
        // Show loading
        if (loadingSpinner) loadingSpinner.style.display = 'block';
        if (noResults) noResults.style.display = 'none';
        menuGrid.innerHTML = '';

        // Fetch recipes
        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        allRecipes = await response.json();
        filteredRecipes = [...allRecipes];

        // Render menu
        renderMenu();

    } catch (error) {
        console.error('Error loading menu:', error);
        menuGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load menu</h3>
                <p>Please try again later</p>
            </div>
        `;
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

// Render menu items
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const noResults = document.getElementById('noResults');

    if (!menuGrid) return;

    if (filteredRecipes.length === 0) {
        menuGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    if (noResults) noResults.style.display = 'none';

    menuGrid.innerHTML = filteredRecipes.map(recipe => `
        <div class="menu-item" onclick="showRecipeModal('${recipe.id}')">
            <div class="menu-item-image">
                ${recipe.imageData ? 
                    `<img src="data:image/jpeg;base64,${recipe.imageData}" alt="${recipe.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i>'">` :
                    `<i class="fas fa-image"></i>`
                }
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-title">${recipe.name}</h3>
                    <span class="menu-item-price">${utils.formatPrice(recipe.price)}</span>
                </div>
                <p class="menu-item-description">${recipe.details.substring(0, 120)}${recipe.details.length > 120 ? '...' : ''}</p>
                <div class="menu-item-meta">
                    <span class="menu-item-category">${recipe.category}</span>
                    <div class="menu-item-difficulty">
                        <span>Difficulty:</span>
                        <div class="difficulty-dots">
                            ${getDifficultyDots(recipe.difficulty)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Get difficulty dots
function getDifficultyDots(difficulty) {
    const levels = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const level = levels[difficulty] || 1;
    
    return Array.from({ length: 3 }, (_, i) => 
        `<div class="difficulty-dot ${i < level ? 'active' : ''}"></div>`
    ).join('');
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredRecipes = [...allRecipes];
    } else {
        filteredRecipes = allRecipes.filter(recipe => 
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.details.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(searchTerm)
            ) ||
            recipe.category.toLowerCase().includes(searchTerm)
        );
    }
    
    renderMenu();
}

// Handle category filter
function handleCategoryFilter(clickedBtn) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedBtn.classList.add('active');

    const category = clickedBtn.dataset.category;
    
    if (category === 'all') {
        filteredRecipes = [...allRecipes];
    } else {
        filteredRecipes = allRecipes.filter(recipe => 
            recipe.category === category ||
            (category === 'Vegetarisch' && recipe.dietarySuitability.includes('Vegetarisch')) ||
            (category === 'Vegan' && recipe.dietarySuitability.includes('Vegan'))
        );
    }
    
    renderMenu();
}

// Show recipe modal
async function showRecipeModal(recipeId) {
    const modal = document.getElementById('recipeModal');
    const recipeDetail = document.getElementById('recipeDetail');
    
    if (!modal || !recipeDetail) return;

    try {
        // Show loading in modal
        recipeDetail.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading recipe details...</p>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Find recipe in current data or fetch from API
        let recipe = allRecipes.find(r => r.id === recipeId);
        
        if (!recipe) {
            const response = await fetch(`/api/recipes/${recipeId}`);
            if (!response.ok) {
                throw new Error('Recipe not found');
            }
            recipe = await response.json();
        }

        // Render recipe details
        recipeDetail.innerHTML = `
            <div class="recipe-header">
                <div class="recipe-image">
                    ${recipe.imageData ? 
                        `<img src="data:image/jpeg;base64,${recipe.imageData}" alt="${recipe.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-image\\'></i>'">` :
                        `<i class="fas fa-image"></i>`
                    }
                </div>
                <div class="recipe-info">
                    <h2>${recipe.name}</h2>
                    <p class="recipe-description">${recipe.details}</p>
                    <div class="recipe-meta">
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${recipe.preparationTime} min</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-signal"></i>
                            <span>${recipe.difficulty}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${recipe.origin || 'Local'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${utils.formatDate(recipe.dateAdded)}</span>
                        </div>
                    </div>
                    <div class="recipe-price">${utils.formatPrice(recipe.price)}</div>
                </div>
            </div>
            <div class="recipe-sections">
                <div class="recipe-section">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                </div>
                <div class="recipe-section">
                    <h3>Additional Information</h3>
                    ${recipe.allergens.length > 0 ? `
                        <div class="info-group">
                            <h4>Allergens</h4>
                            <div class="allergens-tags">
                                ${recipe.allergens.map(allergen => `<span class="allergen-tag">${allergen}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${recipe.dietarySuitability.length > 0 ? `
                        <div class="info-group">
                            <h4>Dietary Suitability</h4>
                            <div class="dietary-tags">
                                ${recipe.dietarySuitability.map(diet => `<span class="dietary-tag">${diet}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${recipe.energy || recipe.fat || recipe.carbs || recipe.protein ? `
                        <div class="info-group">
                            <h4>Nutrition (per serving)</h4>
                            <div class="nutrition-info">
                                ${recipe.energy ? `<div class="nutrition-item"><span>Energy:</span><span>${recipe.energy} kcal</span></div>` : ''}
                                ${recipe.fat ? `<div class="nutrition-item"><span>Fat:</span><span>${recipe.fat}g</span></div>` : ''}
                                ${recipe.carbs ? `<div class="nutrition-item"><span>Carbohydrates:</span><span>${recipe.carbs}g</span></div>` : ''}
                                ${recipe.protein ? `<div class="nutrition-item"><span>Protein:</span><span>${recipe.protein}g</span></div>` : ''}
                                ${recipe.salt ? `<div class="nutrition-item"><span>Salt:</span><span>${recipe.salt}g</span></div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading recipe details:', error);
        recipeDetail.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load recipe details</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Close modal
function closeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
} 