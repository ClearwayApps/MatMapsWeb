# MatMaps Web

A web application for managing maps, clubs, events, and community content.

## Project Structure

```
.
├── index.html                 # Main landing page
├── privacy-policy.html        # Privacy policy page
├── terms-of-use.html          # Terms of use page
├── admin/                     # Admin dashboard section
│   ├── dashboard.html         # Admin dashboard
│   ├── login.html             # Admin login
│   ├── clubs.html             # Clubs management
│   ├── events.html            # Events management
│   ├── posts-collections.html # Posts and collections
│   ├── comments-reviews.html  # Comments and reviews
│   ├── user-permissions.html  # User permissions
│   └── assets/
│       └── image/             # Admin section images
├── assets/
│   └── image/                 # Shared images and assets
└── README.md                  # This file
```

## Features

- **Main Application**: Landing page with public information
- **Admin Dashboard**: Comprehensive admin panel for managing:
  - Clubs
  - Events
  - Posts and Collections
  - Comments and Reviews
  - User Permissions
- **Legal Pages**: Privacy Policy and Terms of Use

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (recommended for development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd matmaps-web
```

2. Serve the application locally:
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (http-server)
npx http-server

# Using VS Code Live Server extension
# Right-click index.html and select "Open with Live Server"
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

## Admin Access

1. Navigate to the admin section: `http://localhost:8000/admin/login.html`
2. Log in with your credentials
3. Access the dashboard to manage content

## File Structure Guidelines

### HTML Files
- Keep HTML files in the root and appropriate subdirectories
- Use semantic HTML5 elements
- Include proper meta tags and responsive viewport configuration

### Assets
- Place images in `assets/image/` directory
- Organize assets by type (images, styles, scripts)
- Use descriptive filenames for better maintainability

## Development Tips

- Use a version control system (Git) to track changes
- Keep CSS and JavaScript organized in separate directories
- Test across different browsers for compatibility
- Use meaningful commit messages

## Deployment

When deploying to production:
1. Minify CSS and JavaScript files
2. Optimize images for web
3. Test all links and functionality
4. Ensure HTTPS is enabled
5. Set up proper caching headers

## Legal

- Review and update [Privacy Policy](privacy-policy.html)
- Review and update [Terms of Use](terms-of-use.html)

## Contributing

Please ensure all changes follow the project structure guidelines and are tested before committing.

## License

[Add your license here]

## Contact

[Add contact information here]
