// Netlify serverless function for restaurant API
const recipes = [
    {
        id: '1',
        name: 'Grilled Salmon with Lemon Herb Sauce',
        details: 'Fresh Atlantic salmon grilled to perfection with a zesty lemon herb sauce, served with seasonal vegetables and wild rice.',
        ingredients: ['Salmon fillet', 'Lemon', 'Fresh herbs', 'Olive oil', 'Garlic', 'Seasonal vegetables', 'Wild rice'],
        dateAdded: '2024-01-15',
        category: 'Hauptgericht',
        preparationTime: 25,
        difficulty: 'Medium',
        price: 28.50,
        allergens: ['Fisch'],
        additives: [],
        energy: 450,
        fat: 22,
        carbs: 15,
        protein: 35,
        salt: 1.2,
        origin: 'Norway',
        dietarySuitability: []
    },
    {
        id: '2',
        name: 'Truffle Mushroom Risotto',
        details: 'Creamy Arborio rice cooked with wild mushrooms, truffle oil, and aged Parmesan cheese.',
        ingredients: ['Arborio rice', 'Wild mushrooms', 'Truffle oil', 'Parmesan cheese', 'White wine', 'Vegetable stock', 'Onion', 'Garlic'],
        dateAdded: '2024-01-10',
        category: 'Vegetarisch',
        preparationTime: 35,
        difficulty: 'Hard',
        price: 24.00,
        allergens: ['Milch/Laktose'],
        additives: [],
        energy: 380,
        fat: 18,
        carbs: 45,
        protein: 12,
        salt: 0.8,
        origin: 'Italy',
        dietarySuitability: ['Vegetarisch']
    },
    {
        id: '3',
        name: 'Beef Tenderloin with Red Wine Reduction',
        details: 'Premium beef tenderloin seared to perfection, served with a rich red wine reduction sauce and roasted potatoes.',
        ingredients: ['Beef tenderloin', 'Red wine', 'Shallots', 'Butter', 'Beef stock', 'Potatoes', 'Fresh herbs'],
        dateAdded: '2024-01-12',
        category: 'Hauptgericht',
        preparationTime: 30,
        difficulty: 'Hard',
        price: 42.00,
        allergens: [],
        additives: [],
        energy: 520,
        fat: 28,
        carbs: 20,
        protein: 45,
        salt: 1.5,
        origin: 'Germany',
        dietarySuitability: []
    }
];

// --- LIVE TABLE RESERVATION API ---

let reservations = [];
let tables = [
    { id: 1, name: 'Table 1', capacity: 2 },
    { id: 2, name: 'Table 2', capacity: 4 },
    { id: 3, name: 'Table 3', capacity: 4 },
    { id: 4, name: 'Table 4', capacity: 6 },
    { id: 5, name: 'Table 5', capacity: 8 },
    // Add more tables as needed
];

function parseDateTime(date, time) {
    return new Date(`${date}T${time}`);
}

function isConflict(tableId, date, time, durationMinutes = 120) {
    const newStart = parseDateTime(date, time);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);
    return reservations.some(r => {
        if (r.tableId !== tableId || r.status === 'cancelled') return false;
        const rStart = parseDateTime(r.date, r.time);
        const rEnd = new Date(rStart.getTime() + (r.durationMinutes || 120) * 60000);
        return (newStart < rEnd && newEnd > rStart);
    });
}

exports.handler = async function(event, context) {
    const { httpMethod, path, queryStringParameters, body } = event;
    // Normalize path for Netlify
    const cleanPath = path.replace(/^.*\/api/, '');

    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        switch (cleanPath) {
            case '/recipes':
                if (httpMethod === 'GET') {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(recipes)
                    };
                }
                if (httpMethod === 'POST') {
                    const receivedRecipes = JSON.parse(body);
                    
                    if (Array.isArray(receivedRecipes)) {
                        receivedRecipes.forEach(newRecipe => {
                            if (!newRecipe.id) return; // Skip if no ID
                            const index = recipes.findIndex(r => r.id === newRecipe.id);

                            if (index !== -1) {
                                // Recipe exists, so update it
                                recipes[index] = newRecipe;
                                console.log(`Updated recipe: ${newRecipe.name}`);
                            } else {
                                // Recipe is new, so add it
                                recipes.push(newRecipe);
                                console.log(`Added new recipe: ${newRecipe.name}`);
                            }
                        });
                    }

                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ message: 'Recipes processed successfully', count: Array.isArray(receivedRecipes) ? receivedRecipes.length : 0 })
                    };
                }
                break;

            case (cleanPath.match(/^\/recipes\/(.+)$/) || {}).input:
                if (httpMethod === 'GET') {
                    const recipeId = cleanPath.split('/')[2];
                    const recipe = recipes.find(r => r.id === recipeId);
                    
                    if (!recipe) {
                        return {
                            statusCode: 404,
                            headers,
                            body: JSON.stringify({ message: 'Recipe not found' })
                        };
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(recipe)
                    };
                }
                break;

            case '/tables':
                if (httpMethod === 'GET') {
                    const { date, time } = queryStringParameters;
                    if (!date || !time) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({ error: 'Missing date or time' })
                        };
                    }
                    // For each table, check if it is available at the given date/time
                    const availableTables = tables.map(table => {
                        const conflict = isConflict(table.id, date, time);
                        return { ...table, available: !conflict };
                    });
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(availableTables)
                    };
                }
                if (httpMethod === 'POST') {
                    let data;
                    try {
                        data = JSON.parse(body);
                    } catch (e) {
                        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
                    }
                    const { name, capacity } = data;
                    if (!name || !capacity) {
                        return { statusCode: 400, body: JSON.stringify({ error: 'Missing name or capacity' }) };
                    }
                    const newTable = {
                        id: tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1,
                        name,
                        capacity: parseInt(capacity, 10)
                    };
                    tables.push(newTable);
                    return {
                        statusCode: 201,
                        body: JSON.stringify(newTable)
                    };
                }
                if (httpMethod === 'DELETE') {
                    const id = parseInt(cleanPath.split('/')[2], 10);
                    const idx = tables.findIndex(t => t.id === id);
                    if (idx === -1) {
                        return { statusCode: 404, body: JSON.stringify({ error: 'Table not found' }) };
                    }
                    tables.splice(idx, 1);
                    // Also remove any future reservations for this table
                    reservations = reservations.filter(r => r.tableId !== id);
                    return { statusCode: 204, body: '' };
                }
                break;

            case '/reservations':
                if (httpMethod === 'GET') {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(reservations)
                    };
                }
                if (httpMethod === 'POST') {
                    let data;
                    try {
                        data = JSON.parse(body);
                    } catch (e) {
                        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
                    }
                    const { name, date, time, tableId, guests, occasion } = data;
                    if (!name || !date || !time || !tableId || !guests) {
                        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
                    }
                    if (isConflict(tableId, date, time)) {
                        return { statusCode: 409, body: JSON.stringify({ error: 'Table already reserved for this time' }) };
                    }
                    const reservation = {
                        id: Date.now().toString(),
                        name,
                        date,
                        time,
                        tableId,
                        guests,
                        occasion: occasion || '',
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        durationMinutes: 120 // default 2 hours
                    };
                    reservations.push(reservation);
                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify(reservation)
                    };
                }
                break;

            case '/contact':
                if (httpMethod === 'POST') {
                    const contactData = JSON.parse(body);
                    
                    // Here you would typically send an email or save to a database
                    console.log('New contact message:', contactData);
                    
                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({ 
                            message: 'Message sent successfully'
                        })
                    };
                }
                break;

            case '/tables':
                if (httpMethod === 'GET' && (!queryStringParameters.date || !queryStringParameters.time)) {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(tables)
                    };
                }
                break;

            default:
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ message: 'Endpoint not found' })
                };
        }
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}; 