// This file contains JavaScript functions specifically for handling the creation of new products, including form validation and submission to Firebase.

document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('product-form');
    
    productForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const productName = document.getElementById('product-name').value;
        const productPrice = document.getElementById('product-price').value;
        const productDescription = document.getElementById('product-description').value;

        if (validateForm(productName, productPrice, productDescription)) {
            createProduct(productName, productPrice, productDescription);
        } else {
            alert('Please fill in all fields correctly.');
        }
    });
});

function validateForm(name, price, description) {
    return name && price && description && !isNaN(price);
}

function createProduct(name, price, description) {
    const db = firebase.firestore();
    
    db.collection('products').add({
        name: name,
        price: parseFloat(price),
        description: description
    })
    .then(() => {
        alert('Product created successfully!');
        window.location.href = 'index.html'; // Redirect to the main page
    })
    .catch((error) => {
        console.error('Error creating product: ', error);
        alert('Error creating product. Please try again.');
    });
}