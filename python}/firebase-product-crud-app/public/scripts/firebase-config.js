// Importa las funciones necesarias del SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKJ-KAJoq32F_oI3_77O6QaTqJRdZ0GSI",
  authDomain: "borrador1-564e0.firebaseapp.com",
  projectId: "borrador1-564e0",
  storageBucket: "borrador1-564e0.appspot.com", // corregido
  messagingSenderId: "78508253716",
  appId: "1:78508253716:web:31d3f48558d67ea2a23d01",
  measurementId: "G-HBQWYLZQ05"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);