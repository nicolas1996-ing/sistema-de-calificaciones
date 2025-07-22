# sistema-de-calificaciones
Implementación de funcionalida de autenticación con JWT + Node.js + Express.js

# instrucciones básicas de iniciación del proyecto

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd gestion-de-calificaciones
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp env.example .env
```

4. **Iniciar el servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```
## Configuración

### Variables de Entorno (.env). ( ver archivo de ejemplo: env.example )


## Uso de algunos endpoints disponibles

### Autenticación

#### iniciar sesión de usuario

## 👥 Usuarios de Prueba

### Profesor
- **Email:** profesor@universidad.edu
- **Password:** password
- **Rol:** profesor
- **Permisos:** read_actas, write_grades, add_student_to_acta, remove_student_from_acta, get_statistics, integrate_actas, export_grades, use_calculator

### Administrador
- **Email:** admin@universidad.edu
- **Password:** password
- **Rol:** administrador
- **Permisos:** all, manage_students, manage_subjects, manage_degrees, get_system_statistics, manage_users

### Profesor 2
- **Email:** profesor2@universidad.edu
- **Password:** password
- **Rol:** profesor
- **Departamento:** Matemáticas
- **Especialidad:** Cálculo


**Request:**
```json
{
  "email": "profesor@universidad.edu",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "profesor@universidad.edu",
    "rol": "profesor",
    "nombre": "Juan Pérez",
    "departamento": "Informática",
    "especialidad": "Programación"
  },
  "expiresIn": "24h"
}
```

#### POST /auth/logout
Cerrar sesión (requiere token).

**Headers:**
```
Authorization: Bearer <token>
```
### Calculadora

#### POST /calculadora/calcular
Realizar operación matemática.

**Request:**
```json
{
  "operacion": "suma",
  "a": 5.5,
  "b": 3.2
}
```

**Response:**
```json
{
  "success": true,
  "resultado": 8.7,
  "operacion": "suma",
  "operacionSimbolo": "+",
  "expresion": "5.5 + 3.2",
  "expresionCompleta": "5.5 + 3.2 = 8.7",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### POST /calculadora/promedio
Calcular promedio de un array de números.

**Request:**
```json
{
  "numeros": [7.5, 8.2, 6.8, 9.1, 7.9]
}
```

#### POST /calculadora/porcentaje
Calcular porcentaje de un valor sobre un total.

**Request:**
```json
{
  "valor": 15,
  "total": 20
}
```
