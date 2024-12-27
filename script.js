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

const loginForm = document.getElementById("admin-login-form");
const userManagementContainer = document.getElementById("user-management-container");
const loginContainer = document.getElementById("login-container");
const userList = document.getElementById("user-list");
const deviceList = document.getElementById("device-list");
const resellerList = document.getElementById("reseller-list");
const addResellerForm = document.getElementById("add-reseller-form");

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-login-email").value;
  const password = document.getElementById("admin-login-password").value;

  try {
    // Configurar persistencia de sesión a 'local'
    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const userDoc = await db.collection("adminUsers").doc(userCredential.user.uid).get();

    if (userDoc.exists && userDoc.data().role === "admin") {
      loginContainer.classList.add("hidden");
      userManagementContainer.classList.remove("hidden");
      loadUsers();
      loadResellers();
    } else {
      throw new Error("No tienes permiso para acceder.");
    }
  } catch (error) {
    document.getElementById("login-error").classList.remove("hidden");
  }
});

// Verificar si el usuario sigue autenticado al cargar la página
auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection("adminUsers").doc(user.uid).get().then((doc) => {
      if (doc.exists && doc.data().role === "admin") {
        loginContainer.classList.add("hidden");
        userManagementContainer.classList.remove("hidden");
        loadUsers();
        loadResellers();
      }
    });
  }
});


// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut().then(() => {
    loginContainer.classList.remove("hidden");
    userManagementContainer.classList.add("hidden");
  });
});

async function loadUsers() {
  const querySnapshot = await db.collection("users").get();
  userList.innerHTML = ""; // Limpia la lista actual
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    userList.innerHTML += `
      <tr data-user-id="${doc.id}">
        <td>${data.username}</td>
        <td>${data.email}</td>
        <td>${data.password}</td>
        <td>${data.expirationDate.toDate().toLocaleDateString()}</td>
        <td style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
          <button onclick="renewUser('${doc.id}', 1)">
            <i class="fas fa-rotate"> 1</i>
          </button>
          <button onclick="renewUser('${doc.id}', 3)">
            <i class="fas fa-rotate"> 3</i>
          </button>
          <button onclick="renewUser('${doc.id}', 6)">
            <i class="fas fa-rotate"> 6</i>
          </button>
          <button onclick="renewUser('${doc.id}', 12)">
            <i class="fas fa-rotate"> 12</i>
          </button>
          <button onclick="deleteUser('${doc.id}')">
            <i class="fas fa-trash"></i>
          </button>
          <button onclick="loadDevices('${doc.id}')">
            <i class="fas fa-laptop"></i>
          </button>
          <button onclick="editUser('${doc.id}', '${data.username}', '${data.password}')">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>`;
  });
}
async function loadUsers() {
  const userList = document.getElementById("user-list"); // Asegurarse de que esté bien referenciado
  if (!userList) {
    console.error("Elemento 'user-list' no encontrado en el DOM.");
    return;
  }

  try {
    const querySnapshot = await db.collection("users").get();
    userList.innerHTML = ""; // Limpia la lista actual
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userList.innerHTML += `
        <tr>
          <td>${data.username}</td>
          <td>${data.email}</td>
          <td>${data.password}</td>
          <td>${data.expirationDate.toDate().toLocaleDateString()}</td>
          <td style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
            <button onclick="renewUser('${doc.id}', 1)">
              <i class="fas fa-rotate"> 1</i>
            </button>
            <button onclick="renewUser('${doc.id}', 3)">
              <i class="fas fa-rotate"> 3</i>
            </button>
            <button onclick="renewUser('${doc.id}', 6)">
              <i class="fas fa-rotate"> 6</i>
            </button>
            <button onclick="renewUser('${doc.id}', 12)">
              <i class="fas fa-rotate"> 12</i>
            </button>
            <button onclick="deleteUser('${doc.id}')">
              <i class="fas fa-trash"></i>
            </button>
            <button onclick="loadDevices('${doc.id}')">
              <i class="fas fa-laptop"></i>
            </button>
            <button onclick="editUser('${doc.id}', '${data.username}', '${data.password}')">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}




// Create User
document.getElementById("add-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("new-username").value;
  const email = document.getElementById("new-email").value;
  const password = document.getElementById("new-password").value;
  const expirationOption = document.getElementById("expiration-option").value;

  try {
    console.log("Creando usuario...");
    const newUser = await auth.createUserWithEmailAndPassword(email, password);
    console.log("Usuario creado en Authentication con UID:", newUser.user.uid);

    // Determinar la fecha de expiración según la opción seleccionada
    const currentDate = new Date();
    let expirationDate;
    if (expirationOption === "2-hours") {
      expirationDate = new Date(currentDate.getTime() + 2 * 60 * 60 * 1000); // 2 horas en milisegundos
    } else if (expirationOption === "1-month") {
      expirationDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1)); // +1 mes
    } else {
      throw new Error("Opción de expiración no válida.");
    }

    // Convertir expirationDate a Timestamp
    const expirationTimestamp = firebase.firestore.Timestamp.fromDate(expirationDate);

    // Guardar datos en Firestore
    await db.collection("users").doc(newUser.user.uid).set({
      username,
      email,
      password,
      expirationDate: expirationTimestamp,
    });
    console.log("Datos del usuario guardados en Firestore.");
    alert("Usuario creado con éxito.");
    loadUsers(); // Recargar la lista de usuarios
  } catch (error) {
    console.error("Error creando usuario:", error);

    // Mensajes de error específicos
    if (error.code === "auth/email-already-in-use") {
      alert("El correo electrónico ya está en uso.");
    } else if (error.code === "auth/weak-password") {
      alert("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
    } else {
      alert("Error al crear el usuario. Revisa la consola para más detalles.");
    }
  }
});



// Renew User
async function renewUser(userId, months) {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const currentDate = new Date(); // Fecha actual
    const expirationDate = userDoc.data().expirationDate.toDate(); // Fecha de expiración actual

    // Calcular la fecha base para la renovación
    const baseDate = expirationDate > currentDate ? expirationDate : currentDate;

    // Añadir los meses de renovación
    baseDate.setMonth(baseDate.getMonth() + months);

    // Convertir a Timestamp y actualizar en Firestore
    const newExpirationTimestamp = firebase.firestore.Timestamp.fromDate(baseDate);
    await userRef.update({ expirationDate: newExpirationTimestamp });

    // Recargar la lista de usuarios
    loadUsers();
  }
}

// Eliminar Usuario
async function deleteUser(userId) {
  try {
    // Eliminar el usuario de Firestore
    await db.collection("users").doc(userId).delete();
    alert("Usuario eliminado con éxito.");

    // Recargar la lista completa de usuarios
    await loadUsers(); // Recargar los usuarios directamente después de eliminar
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Hubo un problema al eliminar el usuario.");
  }
}


// Editar solo el nombre del usuario
async function editUser(userId, currentUsername) {
  try {
    // Solicitar el nuevo nombre de usuario
    const newUsername = prompt(`Nombre de usuario actual: ${currentUsername}\nIngresa el nuevo nombre de usuario:`, currentUsername);
    if (newUsername === null || newUsername.trim() === "") {
      alert("Operación cancelada.");
      return;
    }

    // Actualizar solo el nombre de usuario en Firestore
    await db.collection("users").doc(userId).update({
      username: newUsername,
    });

    alert("Nombre de usuario actualizado con éxito.");
    loadUsers(); // Recargar la lista de usuarios
  } catch (error) {
    console.error("Error al actualizar el nombre del usuario:", error);
    alert("Hubo un problema al actualizar el nombre del usuario.");
  }
}



// Load Devices
async function loadDevices(userId) {
  try {
    console.log(`Cargando dispositivos para el usuario: ${userId}`);
    const devicesRef = db.collection("users").doc(userId).collection("devices");
    const querySnapshot = await devicesRef.get();

    if (querySnapshot.empty) {
      console.log("No se encontraron dispositivos.");
      deviceList.innerHTML = "<tr><td colspan='2'>No se encontraron dispositivos para este usuario.</td></tr>";
      return;
    }

    deviceList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const deviceId = doc.id;
      console.log("Dispositivo encontrado:", deviceId);
      deviceList.innerHTML += `
        <tr>
          <td>${deviceId}</td>
          <td>
            <button onclick="deleteDevice('${userId}', '${deviceId}')">Eliminar</button>
          </td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al cargar dispositivos:", error);
    alert("Hubo un problema al cargar los dispositivos.");
  }
}


// Delete Device
async function deleteDevice(userId, deviceId) {
  try {
    await db.collection("users").doc(userId).collection("devices").doc(deviceId).delete();
    alert("Dispositivo eliminado con éxito.");
    loadDevices(userId); // Recargar la lista de dispositivos
  } catch (error) {
    console.error("Error al eliminar dispositivo:", error);
    alert("No se pudo eliminar el dispositivo.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const deviceList = document.getElementById("device-list");

  // Función para cargar dispositivos
  async function loadDevices(userId) {
    try {
      console.log(`Intentando cargar dispositivos para el usuario con ID: ${userId}`);
      const devicesRef = db.collection("users").doc(userId).collection("devices");
      const querySnapshot = await devicesRef.get();

      deviceList.innerHTML = ""; // Limpiar lista de dispositivos

      if (querySnapshot.empty) {
        console.log("No se encontraron dispositivos.");
        deviceList.innerHTML = "<tr><td colspan='2'>No se encontraron dispositivos para este usuario.</td></tr>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const deviceId = doc.id;
        console.log("Dispositivo encontrado:", deviceId);
        deviceList.innerHTML += `
          <tr>
            <td>${deviceId}</td>
            <td>
              <button onclick="deleteDevice('${userId}', '${deviceId}')">Eliminar</button>
            </td>
          </tr>`;
      });
    } catch (error) {
      console.error("Error al cargar dispositivos:", error);
      alert("Hubo un problema al cargar los dispositivos.");
    }
  }

  // Función para eliminar dispositivo
  async function deleteDevice(userId, deviceId) {
    try {
      console.log(`Eliminando dispositivo ${deviceId} para el usuario ${userId}`);
      await db.collection("users").doc(userId).collection("devices").doc(deviceId).delete();
      alert("Dispositivo eliminado.");
      loadDevices(userId); // Recargar lista de dispositivos
    } catch (error) {
      console.error("Error al eliminar dispositivo:", error);
      alert("Hubo un problema al eliminar el dispositivo.");
    }
  }
});



// Delete Device
async function deleteDevice(userId, deviceId) {
  try {
    await db.collection("users").doc(userId).collection("devices").doc(deviceId).delete();
    alert("Dispositivo eliminado con éxito.");
    loadDevices(userId); // Recargar la lista de dispositivos
  } catch (error) {
    console.error("Error al eliminar dispositivo:", error);
    alert("No se pudo eliminar el dispositivo.");
  }
}


// Crear reseller
addResellerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener datos del formulario
  const name = document.getElementById("reseller-name").value;
  const email = document.getElementById("reseller-email").value;
  const password = document.getElementById("reseller-password").value;
  const credits = parseInt(document.getElementById("reseller-credits").value);

  try {
    console.log("Iniciando creación del reseller...");

    // Obtener UID del administrador actual
    const currentAdmin = auth.currentUser;
    if (!currentAdmin) {
      throw new Error("El administrador no está autenticado.");
    }
    const adminId = currentAdmin.uid;
    console.log("UID del administrador:", adminId);

    // Crear usuario en Firebase Authentication
    const newReseller = await auth.createUserWithEmailAndPassword(email, password);
    console.log("Usuario creado en Authentication con UID:", newReseller.user.uid);

    // Guardar datos del reseller en Firestore
    await db.collection("resellers").doc(newReseller.user.uid).set({
      adminId, // Asociar con el UID del administrador
      name,
      email,
      password, // Guardar la contraseña en Firestore
      credits,
      role: "reseller",
    });
    console.log("Datos del reseller guardados en Firestore con la contraseña incluida.");

    alert("Reseller creado con éxito.");
    loadResellers(); // Recargar lista de resellers
    addResellerForm.reset(); // Limpiar formulario
  } catch (error) {
    console.error("Error al crear reseller:", error);

    // Mostrar un mensaje de error más descriptivo
    if (error.code === "auth/email-already-in-use") {
      alert("El correo electrónico ya está en uso. Prueba con otro.");
    } else if (error.code === "auth/weak-password") {
      alert("La contraseña es muy débil. Intenta usar una contraseña más fuerte.");
    } else {
      alert("Ocurrió un error al crear el reseller. Revisa la consola para más detalles.");
    }
  }
});


// Cargar lista de resellers
async function loadResellers() {
  const querySnapshot = await db.collection("resellers").get();
  resellerList.innerHTML = ""; // Limpiar lista actual

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    resellerList.innerHTML += `
      <tr>
        <td>${data.name}</td>
        <td>${data.email}</td>
        <td>${data.credits}</td>
        <td>${data.password ? data.password : "No disponible"}</td>
        <td class="actions" style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
          <button title="Editar Créditos" onclick="editCredits('${doc.id}', ${data.credits})">
            <i class="fas fa-edit"></i>
          </button>
          <button title="Eliminar" onclick="deleteReseller('${doc.id}')">
            <i class="fas fa-trash-alt"></i>
          </button>
          <button title="Ver Usuarios" onclick="viewUsersByReseller('${doc.id}')">
            <i class="fas fa-users"></i>
          </button>
        </td>
      </tr>`;
  });
}

// Mostrar lista de usuarios creados por un reseller específico
async function viewUsersByReseller(resellerId) {
  try {
    const querySnapshot = await db.collection("users").where("resellerId", "==", resellerId).get();
    const resellerUserListSection = document.getElementById("reseller-user-list-section");
    const resellerUserList = document.getElementById("reseller-user-list");

    resellerUserList.innerHTML = ""; // Limpiar contenido de la lista

    if (querySnapshot.empty) {
      resellerUserList.innerHTML = "<tr><td colspan='5'>No se encontraron usuarios creados por este reseller.</td></tr>";
    } else {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        resellerUserList.innerHTML += `
          <tr>
            <td>${userData.username}</td>
            <td>${userData.email}</td>
            <td>${userData.password}</td>
            <td>${userData.expirationDate.toDate().toLocaleDateString()}</td>
            <td style="display: flex; gap: 0.5rem; justify-content: center; align-items: center;">
              <button onclick="deleteUser('${doc.id}')" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>`;
      });
    }

    // Mostrar la sección de usuarios creados por el reseller
    resellerUserListSection.classList.remove("hidden");
  } catch (error) {
    console.error("Error al cargar usuarios creados por el reseller:", error);
  }
}

// Eliminar usuario
async function deleteUser(userId) {
  try {
    await db.collection("users").doc(userId).delete();
    alert("Usuario eliminado con éxito.");
    // Recargar la lista de usuarios del reseller
    const resellerId = document.getElementById("reseller-user-list-section").getAttribute("data-reseller-id");
    viewUsersByReseller(resellerId);
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    alert("Hubo un problema al eliminar el usuario.");
  }
}

// Eliminar reseller
async function deleteReseller(resellerId) {
  try {
    await db.collection("resellers").doc(resellerId).delete();
    alert("Reseller eliminado.");
    loadResellers(); // Recargar lista de resellers
  } catch (error) {
    console.error("Error al eliminar reseller:", error);
  }
}

// Editar créditos del reseller
async function editCredits(resellerId, currentCredits) {
  const newCredits = prompt(`Créditos actuales: ${currentCredits}\nIngresa la nueva cantidad de créditos:`, currentCredits);

  if (newCredits === null || newCredits.trim() === "") {
    alert("Operación cancelada.");
    return;
  }

  const parsedCredits = parseInt(newCredits);
  if (isNaN(parsedCredits) || parsedCredits < 0) {
    alert("Por favor, ingresa un número válido.");
    return;
  }

  try {
    await db.collection("resellers").doc(resellerId).update({ credits: parsedCredits });
    alert("Créditos actualizados con éxito.");
    loadResellers(); // Recargar lista de resellers
  } catch (error) {
    console.error("Error al actualizar los créditos:", error);
    alert("Hubo un problema al actualizar los créditos.");
  }
}


// Llamar a loadResellers al cargar el panel
loadResellers();

