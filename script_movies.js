import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDsxBHmWLgtduZlOeuf_erD90InXa4i3Cg",
  authDomain: "premiumtv-ba226.firebaseapp.com",
  projectId: "premiumtv-ba226",
  storageBucket: "premiumtv-ba226.firebasestorage.app",
  messagingSenderId: "542391446242",
  appId: "1:542391446242:web:b21e385f99718c14aaccbb",
  measurementId: "G-0B1E47XNFW"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Verificar si el usuario está autenticado
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Usuario autenticado:", user.email);
  } else {
    alert("Debe iniciar sesión para poder agregar o eliminar una película.");
    window.location.href = 'login.html'; // Ruta de la página de inicio de sesión
  }
});

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
  const movieForm = document.getElementById('movie-form');
  const verifyButton = document.getElementById('verify-movie-btn');
  const refreshButton = document.getElementById('refresh-page-btn');
  const deleteButton = document.getElementById('delete-movie-btn');

  // Función para manejar la creación de la película
  movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Debe iniciar sesión para agregar una película.");
      return;
    }

    const documentIdInput = document.getElementById('documentId').value.trim();
    const title = document.getElementById('title').value.trim();
    const tmdbId = document.getElementById('tmdbId').value.trim();
    const videoUrl = document.getElementById('videoUrl').value.trim();
    const addedDateValue = document.getElementById('addedDate').value;
    const addedDate = Timestamp.fromDate(new Date(addedDateValue));

    const categoriesSelect = document.getElementById('categories');
    const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);

    try {
      const documentId = documentIdInput || `${tmdbId}-${title.replace(/\s+/g, '-').toLowerCase()}`;

      await setDoc(doc(db, 'movies', documentId), {
        title,
        tmdbId,
        videoUrl,
        categories: selectedCategories,
        addedDate
      }, { merge: true });

      document.getElementById('message').innerText = "Película agregada o actualizada exitosamente";
    } catch (error) {
      document.getElementById('message').innerText = "Error al agregar la película: " + error.message;
    }
  });

  // Función para verificar si la película ya está en Firestore
  verifyButton.addEventListener('click', async () => {
    const documentId = document.getElementById('documentId').value.trim();
    if (!documentId) {
      alert("Por favor ingrese el ID del documento para verificar.");
      return;
    }

    try {
      const docRef = doc(db, 'movies', documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('title').value = data.title || '';
        document.getElementById('tmdbId').value = data.tmdbId || '';
        document.getElementById('videoUrl').value = data.videoUrl || '';
        document.getElementById('addedDate').value = data.addedDate.toDate().toISOString().split('T')[0];
        document.getElementById('message').innerText = "Película encontrada.";
      } else {
        document.getElementById('message').innerText = "La película no existe.";
      }
    } catch (error) {
      document.getElementById('message').innerText = "Error al verificar la película: " + error.message;
    }
  });

  // Función para manejar la eliminación de la película
  deleteButton.addEventListener('click', async () => {
    const documentId = document.getElementById('documentId').value.trim();

    if (!documentId) {
      alert("Por favor ingrese el ID del documento para eliminar.");
      return;
    }

    try {
      const docRef = doc(db, 'movies', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("La película con el ID proporcionado no existe.");
        return;
      }

      await deleteDoc(docRef);
      document.getElementById('message').innerText = "Película eliminada exitosamente.";
    } catch (error) {
      document.getElementById('message').innerText = "Error al eliminar la película: " + error.message;
    }
  });

  // Botón para actualizar la página
  refreshButton.addEventListener('click', () => {
    window.location.reload();
  });
});
