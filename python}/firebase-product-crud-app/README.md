# Firebase Product CRUD App

This project is a web application that allows users to create, edit, and view products using Firebase as the backend. The application is structured to provide a user-friendly interface for managing product data.

## Project Structure

```
firebase-product-crud-app
├── public
│   ├── index.html          # Main entry point of the application
│   ├── create.html        # Interface for creating new products
│   ├── edit.html          # Interface for editing existing products
│   ├── styles.css         # CSS styles for the application
│   └── scripts
│       ├── firebase-config.js  # Firebase configuration settings
│       ├── main.js             # Main JavaScript file for initialization
│       ├── create.js           # JavaScript for creating products
│       └── edit.js             # JavaScript for editing products
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd firebase-product-crud-app
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Firebase Configuration:**
   Update the `firebase-config.js` file with your Firebase project settings. You can find these in your Firebase console.

4. **Run the application:**
   Open `public/index.html` in your web browser to start using the application.

## Usage Guidelines

- **Creating a Product:** Navigate to the "Crear Producto" link to access the product creation form.
- **Viewing Products:** Use the "Ver Productos" link to view the list of products.
- **Editing a Product:** Click on a product in the list to edit its details.

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements or new features.

## License

This project is licensed under the MIT License.