# LaborLink

**LaborLink** es una aplicación móvil desarrollada para facilitar la conexión entre personas que buscan empleo y empresas que desean contratar talento. El proyecto está pensado tanto para usuarios sin experiencia técnica como para quienes desean conocer detalles sobre su funcionamiento y desarrollo.

---

## 🌟 ¿Qué es LaborLink?

LaborLink es una plataforma digital que permite a los usuarios buscar y postularse a ofertas de empleo desde su teléfono móvil. Al mismo tiempo, las empresas pueden publicar vacantes, gestionar postulaciones y contactar candidatos de manera eficiente.

---

## 🧑‍💼 ¿Para quién está pensada?

- **Personas que buscan empleo:** Pueden crear un perfil, subir su currículum, buscar ofertas y postularse fácilmente.
- **Empresas:** Pueden registrar su negocio, publicar vacantes, revisar candidatos y gestionar sus procesos de selección.

---

## 🚀 ¿Cómo funciona LaborLink?

### Para personas que buscan empleo

1. **Registro y perfil:** El usuario crea una cuenta y completa su perfil con información personal, experiencia laboral y formación académica.
2. **Búsqueda de empleos:** Puede buscar ofertas filtrando por ubicación, tipo de trabajo, salario, etc.
3. **Postulación:** Al encontrar una oferta interesante, puede postularse con un solo clic.
4. **Seguimiento:** Puede ver el estado de sus postulaciones y recibir notificaciones sobre cambios o mensajes de las empresas.

### Para empresas

1. **Registro de empresa:** Se crea una cuenta de empresa con los datos del negocio.
2. **Publicación de vacantes:** Se pueden crear y editar ofertas de empleo, especificando requisitos y condiciones.
3. **Gestión de candidatos:** Las empresas pueden ver los perfiles de los postulantes, filtrar por criterios y contactar a quienes les interesen.
4. **Actualización de estados:** Pueden cambiar el estado de las postulaciones (por ejemplo, “En revisión”, “Seleccionado”, “No seleccionado”).

---

## 🛠️ Aspectos técnicos

### Tecnologías utilizadas

- **Frontend:**

  - [React Native](https://reactnative.dev/) con [Expo](https://expo.dev/) para el desarrollo móvil multiplataforma (Android/iOS).
  - [React Navigation](https://reactnavigation.org/) para la gestión de pantallas y navegación.
  - [Axios](https://axios-http.com/) para la comunicación con el backend.
  - [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) para almacenamiento local de datos como tokens de sesión.

- **Backend:**

  - [Spring Boot](https://spring.io/projects/spring-boot) para la creación de la API RESTful que gestiona usuarios, ofertas, postulaciones y toda la lógica de negocio.
  - Base de datos relacional (por ejemplo, MySQL o PostgreSQL) para almacenar la información de usuarios, empresas y ofertas.

- **Gestión de estado:**
  - Uso de Context API de React para compartir información global como el usuario autenticado o las ofertas disponibles.

### Estructura del proyecto

```
src/
├── Cards/              # Componentes visuales de tarjetas de empleo
├── context/            # Contextos globales de React
├── jobs/               # Lógica y componentes relacionados con ofertas de empleo
├── Menu/               # Componentes del menú de navegación
├── PostJobOffer/       # Formularios y lógica para publicar empleos
├── screens/            # Pantallas principales de la app
├── WorkExperience/     # Componentes para gestionar experiencia laboral
```

### Flujo de autenticación

- El usuario se registra o inicia sesión.
- El token de autenticación se almacena localmente (AsyncStorage).
- Cada petición al backend incluye el token para validar la sesión.
- El backend con Spring Boot valida el token y gestiona la seguridad de los datos.

### Seguridad

- Los datos personales y de sesión se almacenan de forma segura en el dispositivo.
- La comunicación con el backend se realiza mediante HTTPS.
- Spring Boot implementa medidas de seguridad para proteger la información y controlar el acceso a los recursos.

---

## 📲 ¿Cómo instalar y probar LaborLink?

1. **Clona el repositorio:**

   ```sh
   git clone https://github.com/tuusuario/laborlink.git
   cd laborlink
   ```

2. **Instala las dependencias:**

   ```sh
   npm install
   ```

3. **Ejecuta la app:**

   ```sh
   npx expo start
   ```

   Escanea el código QR con la app Expo Go en tu teléfono.

4. **Backend:**  
   Asegúrate de tener el backend de Spring Boot en funcionamiento y configurado para aceptar las peticiones de la app móvil.

---

## 🤝 Contribuciones

Si tienes conocimientos técnicos y quieres colaborar, puedes abrir un _issue_ o enviar un _pull request_. Toda ayuda es bienvenida, ya sea para mejorar la interfaz, optimizar el código o agregar nuevas funcionalidades.

---

## 👨‍💻 Autor

Desarrollado por **Francisco Matías Molina Jurado**.

---

## 📬 Contacto

¿Tienes dudas, sugerencias o quieres colaborar?  
Puedes dejar tus comentarios o contactarte directamente para ayudar a mejorar LaborLink.

---

**LaborLink: facilitando el acceso al empleo y la gestión de talento, para todos.**
