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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Manejar el evento de envío del formulario
const adVideoForm = document.getElementById("adVideoForm");

adVideoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        // Validar si el usuario está autenticado
        const user = auth.currentUser;
        if (!user) {
            alert("No estás autenticado. Por favor, inicia sesión.");
            return;
        }

        // Obtener los valores del formulario
        const title = document.getElementById("title").value.trim();
        const videoTitle = document.getElementById("videoTitle").value.trim();
        const videoUrl = document.getElementById("videoUrl").value.trim();
        const isActive = document.getElementById("isActive").value === "true";

        // Validar los campos
        if (!title || !videoTitle || !videoUrl) {
            alert("Por favor, completa todos los campos del formulario.");
            return;
        }

        // Agregar o actualizar el documento en la colección "featuredVideos"
        await db.collection("featuredVideos").doc(title).set({
            videoTitle: videoTitle,
            videoUrl: videoUrl,
            isActive: isActive
        }, { merge: true });

        alert("Video publicitario agregado o actualizado con éxito.");
        adVideoForm.reset(); // Limpiar el formulario
    } catch (error) {
        console.error("Error al agregar o actualizar el video publicitario:", error);
        alert("Error al procesar el video. Verifica la consola para más detalles.");
    }
});

// Escuchar cambios de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
    } else {
        console.log("No hay un usuario autenticado. Por favor, inicia sesión.");
    }
});
