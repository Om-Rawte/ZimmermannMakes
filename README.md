# Zimmermann Makes Restaurant Website

A professional 5-star restaurant website built with Vite, featuring a modern design and integration with your iOS app for real-time recipe publishing.

## Features

- **Professional Design**: Elegant, responsive design with gold accent colors
- **Multiple Pages**: Home, Menu, About, Contact, and Reservations
- **Recipe Management**: Display recipes from your iOS app with search and filtering
- **Interactive Menu**: Tappable recipe cards with detailed modal views
- **Reservation System**: Online booking with table availability
- **Contact Form**: Customer inquiry handling
- **iOS Integration**: Publish recipes directly from your iOS app to the website
- **Real-time Updates**: Website updates automatically when recipes are published

## Project Structure

```
restaurant-website/
├── index.html              # Homepage
├── menu.html               # Menu page with recipes
├── about.html              # About page
├── contact.html            # Contact page
├── reservations.html       # Reservations page
├── styles/
│   ├── main.css           # Global styles
│   ├── home.css           # Homepage styles
│   ├── menu.css           # Menu page styles
│   ├── about.css          # About page styles
│   ├── contact.css        # Contact page styles
│   └── reservations.css   # Reservations page styles
├── scripts/
│   ├── main.js            # Common functionality
│   ├── home.js            # Homepage functionality
│   ├── menu.js            # Menu functionality
│   ├── contact.js         # Contact form handling
│   └── reservations.js    # Reservation handling
├── netlify/
│   └── functions/
│       └── api.js         # Serverless API functions
├── netlify.toml           # Netlify configuration
└── README.md              # This file
```

## Setup Instructions

### 1. Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:5173`

### 2. Deployment to Netlify

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/restaurant-website.git
   git push -u origin main
   ```

2. **Deploy to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Deploy settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Update iOS App URL**:
   - In `WebsitePublisher.swift`, update the `baseURL` to your Netlify domain:
   ```swift
   private let baseURL = "https://your-site-name.netlify.app/api"
   ```

## iOS App Integration

### Adding the Publish Button

1. **Add WebsitePublisher.swift** to your iOS project
2. **Import in your ContentView**:
   ```swift
   @StateObject private var websitePublisher = WebsitePublisher()
   ```

3. **Add publish button to your menu view**:
   ```swift
   PublishButton(publisher: websitePublisher, recipes: recipes)
       .padding()
   ```

4. **For individual recipe publishing**:
   ```swift
   PublishButton(publisher: websitePublisher, singleRecipe: selectedRecipe)
   ```

### How It Works

1. **Create recipes** in your iOS app
2. **Tap "Publish to Website"** button
3. **Recipe data** is sent to the website API
4. **Website updates** automatically with new recipes
5. **Customers can view** recipes on the website

## API Endpoints

The website includes a serverless API with the following endpoints:

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes` - Add new recipe (from iOS app)
- `GET /api/tables` - Get table availability
- `POST /api/reservations` - Create reservation
- `POST /api/contact` - Send contact message

## Customization

### Colors and Branding

Update the color scheme in `styles/main.css`:
```css
:root {
    --primary-color: #d4af37;    /* Gold */
    --secondary-color: #1a1a1a;  /* Dark */
    --accent-color: #f9f9f9;     /* Light gray */
}
```

### Restaurant Information

Update contact information in all HTML files:
- Phone number
- Email address
- Address
- Opening hours

### Images

Replace placeholder images with your restaurant photos:
- Hero background images
- About section images
- Team member photos

## Features in Detail

### Menu Page
- **Search functionality**: Search by recipe name, ingredients, or category
- **Category filters**: Filter by appetizers, main courses, desserts, etc.
- **Recipe cards**: Click to view detailed recipe information
- **Modal details**: Full recipe information with ingredients, allergens, nutrition

### Reservations Page
- **Booking form**: Date, time, guests, special requests
- **Table availability**: Real-time table status
- **Validation**: Form validation with error messages
- **Confirmation**: Success messages and email confirmations

### Contact Page
- **Contact form**: Name, email, subject, message
- **Contact information**: Address, phone, email, hours
- **Map integration**: Placeholder for Google Maps

## Troubleshooting

### Common Issues

1. **API not working**:
   - Check Netlify function deployment
   - Verify API endpoints in browser console
   - Check CORS settings

2. **iOS publishing fails**:
   - Verify website URL in `WebsitePublisher.swift`
   - Check network connectivity
   - Ensure recipe data is valid

3. **Images not loading**:
   - Check image file paths
   - Verify image format (JPEG/PNG)
   - Check file permissions

### Development Tips

1. **Local API testing**:
   ```bash
   netlify dev
   ```

2. **Debug API functions**:
   - Check Netlify function logs
   - Use browser developer tools
   - Test endpoints with Postman

## Future Enhancements

- **Database integration**: Replace mock data with real database
- **Email notifications**: Send confirmation emails for reservations
- **Admin panel**: Manage recipes and reservations
- **Payment integration**: Online payment for reservations
- **Social media**: Instagram feed integration
- **Reviews**: Customer review system
- **Newsletter**: Email newsletter signup
- **Multi-language**: German/English language support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Netlify function logs
3. Test API endpoints manually
4. Check browser console for errors

## License

This project is created for Zimmermann Makes restaurant. All rights reserved. 