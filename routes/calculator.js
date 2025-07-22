const express = require("express");
const router = express.Router();

// Clase Calculadora con todas las operaciones
class Calculadora {
  static sumar(a, b) {
    const resultado = parseFloat(a) + parseFloat(b);
    return this.redondear(resultado, 2);
  }

  static restar(a, b) {
    const resultado = parseFloat(a) - parseFloat(b);
    return this.redondear(resultado, 2);
  }

  static multiplicar(a, b) {
    const resultado = parseFloat(a) * parseFloat(b);
    return this.redondear(resultado, 2);
  }

  static dividir(a, b) {
    if (parseFloat(b) === 0) {
      throw new Error("División por cero no está permitida");
    }
    const resultado = parseFloat(a) / parseFloat(b);
    return this.redondear(resultado, 2);
  }

  static redondear(numero, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round(parseFloat(numero) * factor) / factor;
  }

  static validarCalificacion(numero) {
    const num = parseFloat(numero);
    return !isNaN(num) && num >= 0 && num <= 10;
  }

  static calcularPromedio(numeros) {
    if (!Array.isArray(numeros) || numeros.length === 0) {
      throw new Error("Se requiere un array no vacío de números");
    }

    const suma = numeros.reduce((acc, num) => acc + parseFloat(num), 0);
    const promedio = suma / numeros.length;
    return this.redondear(promedio, 2);
  }

  static calcularPorcentaje(valor, total) {
    if (parseFloat(total) === 0) {
      throw new Error("El total no puede ser cero");
    }
    const porcentaje = (parseFloat(valor) / parseFloat(total)) * 100;
    return this.redondear(porcentaje, 2);
  }
}

// Middleware para validar entrada numérica
const validarNumeros = (req, res, next) => {
  const { a, b } = req.body;

  if (a === undefined || b === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Los parámetros "a" y "b" son requeridos',
    });
  }

  if (isNaN(parseFloat(a)) || isNaN(parseFloat(b))) {
    return res.status(400).json({
      success: false,
      error: "Los parámetros deben ser números válidos",
    });
  }

  next();
};

// POST /api/calculadora/calcular - Realizar operación matemática
router.post("/calcular", validarNumeros, (req, res) => {
  try {
    const { operacion, a, b } = req.body;

    // Validar operación
    const operacionesValidas = ["suma", "resta", "multiplicacion", "division"];
    if (!operacionesValidas.includes(operacion)) {
      return res.status(400).json({
        success: false,
        error:
          "Operación no válida. Operaciones permitidas: suma, resta, multiplicacion, division",
      });
    }

    let resultado;
    let operacionSimbolo;

    switch (operacion) {
      case "suma":
        resultado = Calculadora.sumar(a, b);
        operacionSimbolo = "+";
        break;
      case "resta":
        resultado = Calculadora.restar(a, b);
        operacionSimbolo = "-";
        break;
      case "multiplicacion":
        resultado = Calculadora.multiplicar(a, b);
        operacionSimbolo = "×";
        break;
      case "division":
        resultado = Calculadora.dividir(a, b);
        operacionSimbolo = "÷";
        break;
    }

    // Registrar operación
    console.log(`Operación: ${a} ${operacionSimbolo} ${b} = ${resultado}`);

    res.json({
      success: true,
      resultado: resultado,
      operacion: operacion,
      operacionSimbolo: operacionSimbolo,
      expresion: `${a} ${operacionSimbolo} ${b}`,
      expresionCompleta: `${a} ${operacionSimbolo} ${b} = ${resultado}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en cálculo:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/calculadora/redondear - Redondear número
router.post("/redondear", (req, res) => {
  try {
    const { numero, decimales = 2 } = req.body;

    if (numero === undefined) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro "numero" es requerido',
      });
    }

    if (isNaN(parseFloat(numero))) {
      return res.status(400).json({
        success: false,
        error: "El parámetro debe ser un número válido",
      });
    }

    const resultado = Calculadora.redondear(numero, decimales);

    res.json({
      success: true,
      numeroOriginal: parseFloat(numero),
      numeroRedondeado: resultado,
      decimales: decimales,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error redondeando:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/calculadora/validar-calificacion - Validar calificación
router.post("/validar-calificacion", (req, res) => {
  try {
    const { numero } = req.body;

    if (numero === undefined) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro "numero" es requerido',
      });
    }

    const esValido = Calculadora.validarCalificacion(numero);

    res.json({
      success: true,
      numero: parseFloat(numero),
      esValido: esValido,
      mensaje: esValido
        ? "Calificación válida"
        : "Calificación debe estar entre 0 y 10",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error validando calificación:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/calculadora/promedio - Calcular promedio
router.post("/promedio", (req, res) => {
  try {
    const { numeros } = req.body;

    if (!Array.isArray(numeros)) {
      return res.status(400).json({
        success: false,
        error: 'El parámetro "numeros" debe ser un array',
      });
    }

    if (numeros.length === 0) {
      return res.status(400).json({
        success: false,
        error: "El array de números no puede estar vacío",
      });
    }

    const promedio = Calculadora.calcularPromedio(numeros);

    res.json({
      success: true,
      numeros: numeros,
      promedio: promedio,
      cantidad: numeros.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculando promedio:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/calculadora/porcentaje - Calcular porcentaje
router.post("/porcentaje", (req, res) => {
  try {
    const { valor, total } = req.body;

    if (valor === undefined || total === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Los parámetros "valor" y "total" son requeridos',
      });
    }

    if (isNaN(parseFloat(valor)) || isNaN(parseFloat(total))) {
      return res.status(400).json({
        success: false,
        error: "Los parámetros deben ser números válidos",
      });
    }

    const porcentaje = Calculadora.calcularPorcentaje(valor, total);

    res.json({
      success: true,
      valor: parseFloat(valor),
      total: parseFloat(total),
      porcentaje: porcentaje,
      expresion: `${valor} de ${total} = ${porcentaje}%`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculando porcentaje:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/calculadora/operaciones - Listar operaciones disponibles
router.get("/operaciones", (req, res) => {
  res.json({
    success: true,
    operaciones: [
      {
        nombre: "suma",
        simbolo: "+",
        descripcion: "Suma dos números",
        ejemplo: { a: 5, b: 3, resultado: 8 },
      },
      {
        nombre: "resta",
        simbolo: "-",
        descripcion: "Resta dos números",
        ejemplo: { a: 10, b: 4, resultado: 6 },
      },
      {
        nombre: "multiplicacion",
        simbolo: "×",
        descripcion: "Multiplica dos números",
        ejemplo: { a: 6, b: 7, resultado: 42 },
      },
      {
        nombre: "division",
        simbolo: "÷",
        descripcion: "Divide dos números",
        ejemplo: { a: 15, b: 3, resultado: 5 },
      },
    ],
    funcionesAdicionales: [
      {
        nombre: "redondear",
        descripcion: "Redondea un número a decimales específicos",
        endpoint: "POST /api/calculadora/redondear",
      },
      {
        nombre: "validar-calificacion",
        descripcion: "Valida si un número está en el rango 0-10",
        endpoint: "POST /api/calculadora/validar-calificacion",
      },
      {
        nombre: "promedio",
        descripcion: "Calcula el promedio de un array de números",
        endpoint: "POST /api/calculadora/promedio",
      },
      {
        nombre: "porcentaje",
        descripcion: "Calcula el porcentaje de un valor sobre un total",
        endpoint: "POST /api/calculadora/porcentaje",
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

// GET /api/calculadora/health - Health check de la calculadora
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Calculadora funcionando correctamente",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    operacionesDisponibles: [
      "suma",
      "resta",
      "multiplicacion",
      "division",
      "redondear",
      "validar-calificacion",
      "promedio",
      "porcentaje",
    ],
  });
});

module.exports = router;
