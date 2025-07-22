const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

// Simulación de base de datos de usuarios (en producción usar BD real)
const usuarios = [
  {
    id: 1,
    email: "profesor@universidad.edu",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    rol: "profesor",
    nombre: "Juan Pérez",
    departamento: "Informática",
    especialidad: "Programación",
  },
  {
    id: 2,
    email: "admin@universidad.edu",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    rol: "administrador",
    nombre: "María García",
    nivelAcceso: "avanzado",
  },
  {
    id: 3,
    email: "profesor2@universidad.edu",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    rol: "profesor",
    nombre: "Carlos López",
    departamento: "Matemáticas",
    especialidad: "Cálculo",
  },
];

// Middleware de autenticación JWT
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token de acceso requerido",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || "tu_secreto_jwt", (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Token inválido o expirado",
      });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar roles
const verificarRol = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};

// POST /api/auth/login - Iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario
    const usuario = usuarios.find((u) => u.email === email);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        error: "Credenciales inválidas",
      });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET || "tu_secreto_jwt",
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Registrar auditoría
    console.log(`Login exitoso: ${usuario.email} (${usuario.rol})`);

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      token: token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
        ...(usuario.departamento && { departamento: usuario.departamento }),
        ...(usuario.especialidad && { especialidad: usuario.especialidad }),
        ...(usuario.nivelAcceso && { nivelAcceso: usuario.nivelAcceso }),
      },
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post("/logout", autenticarToken, (req, res) => {
  try {
    // Registrar auditoría
    console.log(`Logout: ${req.user.email}`);

    res.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// GET /api/auth/validate-session - Validar sesión actual
router.get("/validate-session", autenticarToken, (req, res) => {
  try {
    res.json({
      success: true,
      message: "Sesión válida",
      usuario: req.user,
    });
  } catch (error) {
    console.error("Error validando sesión:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// GET /api/auth/permissions - Obtener permisos del usuario
router.get("/permissions", autenticarToken, (req, res) => {
  try {
    const permisos = {
      profesor: [
        "read_actas",
        "write_grades",
        "add_student_to_acta",
        "remove_student_from_acta",
        "get_statistics",
        "integrate_actas",
        "export_grades",
        "use_calculator",
      ],
      administrador: [
        "all",
        "manage_students",
        "manage_subjects",
        "manage_degrees",
        "get_system_statistics",
        "manage_users",
      ],
    };

    res.json({
      success: true,
      permisos: permisos[req.user.rol] || [],
      rol: req.user.rol,
    });
  } catch (error) {
    console.error("Error obteniendo permisos:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// GET /api/auth/profile - Obtener perfil del usuario
router.get("/profile", autenticarToken, (req, res) => {
  try {
    const usuario = usuarios.find((u) => u.id === req.user.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    res.json({
      success: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
        ...(usuario.departamento && { departamento: usuario.departamento }),
        ...(usuario.especialidad && { especialidad: usuario.especialidad }),
        ...(usuario.nivelAcceso && { nivelAcceso: usuario.nivelAcceso }),
      },
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// POST /api/auth/change-password - Cambiar contraseña
router.post("/change-password", autenticarToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validar entrada
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Contraseña actual y nueva contraseña son requeridas",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    // Buscar usuario
    const usuario = usuarios.find((u) => u.id === req.user.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const passwordValido = await bcrypt.compare(
      currentPassword,
      usuario.password
    );
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        error: "Contraseña actual incorrecta",
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña (en producción, actualizar en BD)
    usuario.password = hashedPassword;

    // Registrar auditoría
    console.log(`🔑 Cambio de contraseña: ${usuario.email}`);

    res.json({
      success: true,
      message: "Contraseña cambiada exitosamente",
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// GET /api/auth/users - Listar usuarios (solo administradores)
router.get(
  "/users",
  autenticarToken,
  verificarRol(["administrador"]),
  (req, res) => {
    try {
      const usuariosLista = usuarios.map((u) => ({
        id: u.id,
        email: u.email,
        rol: u.rol,
        nombre: u.nombre,
        ...(u.departamento && { departamento: u.departamento }),
        ...(u.especialidad && { especialidad: u.especialidad }),
        ...(u.nivelAcceso && { nivelAcceso: u.nivelAcceso }),
      }));

      res.json({
        success: true,
        usuarios: usuariosLista,
        total: usuariosLista.length,
      });
    } catch (error) {
      console.error("Error listando usuarios:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }
);

module.exports = router;
