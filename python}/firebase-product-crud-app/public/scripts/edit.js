// This file contains JavaScript functions for retrieving product details from Firebase and updating them based on user input.

const db = firebase.firestore();
const productId = getProductIdFromUrl();

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    document.getElementById('edit-product-form').addEventListener('submit', updateProduct);
});

function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadProductDetails() {
    db.collection('products').doc(productId).get().then((doc) => {
        if (doc.exists) {
            const product = doc.data();
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-price').value = product.price;
        } else {
            console.error('No such product!');
        }
    }).catch((error) => {
        console.error('Error getting product:', error);
    });
}

function updateProduct(event) {
    event.preventDefault();
    
    const updatedProduct = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: document.getElementById('product-price').value
    };

    db.collection('products').doc(productId).update(updatedProduct)
        .then(() => {
            alert('Product updated successfully!');
            window.location.href = 'index.html'; // Redirect to the main page
        })
        .catch((error) => {
            console.error('Error updating product:', error);
        });
}