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

const tables = [
    { id: '1', name: 'Table 1', sitzplaetze: 2, bereich: 'Window', status: 'Available' },
    { id: '2', name: 'Table 2', sitzplaetze: 4, bereich: 'Window', status: 'Reserved' },
    { id: '3', name: 'Table 3', sitzplaetze: 6, bereich: 'Garden', status: 'Occupied' },
    { id: '4', name: 'Table 4', sitzplaetze: 2, bereich: 'Garden', status: 'Available' },
    { id: '5', name: 'Table 5', sitzplaetze: 8, bereich: 'Private', status: 'Available' }
];

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const path = event.path.replace('/.netlify/functions/api', '');

    try {
        switch (path) {
            case '/recipes':
                if (event.httpMethod === 'GET') {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(recipes)
                    };
                }
                break;

            case (path.match(/^\/recipes\/(.+)$/) || {}).input:
                if (event.httpMethod === 'GET') {
                    const recipeId = path.split('/')[2];
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
                if (event.httpMethod === 'GET') {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(tables)
                    };
                }
                break;

            case '/reservations':
                if (event.httpMethod === 'POST') {
                    const reservationData = JSON.parse(event.body);
                    
                    // Here you would typically save to a database
                    console.log('New reservation:', reservationData);
                    
                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({ 
                            message: 'Reservation created successfully',
                            id: Date.now().toString()
                        })
                    };
                }
                break;

            case '/contact':
                if (event.httpMethod === 'POST') {
                    const contactData = JSON.parse(event.body);
                    
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