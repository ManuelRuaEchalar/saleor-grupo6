# SALEOR

Instrucciones para ejecutar el proyecto
---

## 🗃️ Configuración de Base de Datos

1. Abre tu gestor de bases de datos MySQL.
2. Crea una base de datos con el siguiente nombre:

```bash
CREATE DATABASE express_api_db;
```
---

## 🚀 Backend - Express + MySQL

1. Abre una terminal y navega a la carpeta del backend:

```bash
cd express-mysql-api
```

2. Instala las dependencias:

```bash
npm install
```

3. Ejecuta el seed para poblar la base de datos:

```bash
node seed.js
```

4. Inicia el servidor backend:

```bash
npm run start
```

---

## 💻 Frontend - Saleor

1. Abre otra terminal y navega a la carpeta del frontend:

```bash
cd saleor
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

---

## ✅ Verificación

* El backend estará funcionando en `http://localhost:4000`.
* El frontend estará disponible en `http://localhost:5173`.

---
