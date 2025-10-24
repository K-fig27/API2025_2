import { conmysql } from "../db.js";

//función para registrar un pedido con su detalle
export const postPedido = async (req, res) => {
  try {
    const { cli_id, usr_id, ped_estado, detalles } = req.body;

    // Validar datos mínimos
    if (!cli_id || !usr_id || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ message: "Datos incompletos o inválidos" });
    }

    // Insertar pedido (sin fecha, se asigna automáticamente con NOW())
    const [pedidoResult] = await conmysql.query(
      'INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?, NOW(), ?, ?)',
      [cli_id, usr_id, ped_estado || 0]
    );

    const ped_id = pedidoResult.insertId; // ID del pedido recién creado

    // Insertar los detalles del pedido
    for (const item of detalles) {
      const { prod_id, det_cantidad, det_precio } = item;
      await conmysql.query(
        'INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES (?, ?, ?, ?)',
        [prod_id, ped_id, det_cantidad, det_precio]
      );
    }

    // Respuesta al cliente
    res.status(201).json({
      message: "Pedido registrado correctamente",
      ped_id: ped_id,
    });
  } catch (error) {
    console.error("Error al registrar pedido:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// Función para obtener todos los pedidos
export const getPedido = async (req, res) => {
  try {
    const [rows] = await conmysql.query(`
      SELECT 
        p.ped_id,
        p.cli_id,
        c.cli_nombre,
        p.ped_fecha,
        p.usr_id,
        u.usr_nombre,
        p.ped_estado
      FROM pedidos p
      LEFT JOIN clientes c ON p.cli_id = c.cli_id
      LEFT JOIN usuarios u ON p.usr_id = u.usr_id
      ORDER BY p.ped_fecha DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Función para obtener un pedido específico con su detalle
export const getPedidoxID = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos del pedido
    const [pedido] = await conmysql.query(
      `
      SELECT  
        p.ped_id,
        p.cli_id,
        c.cli_nombre,
        p.ped_fecha,
        p.usr_id,
        u.usr_nombre,
        p.ped_estado
      FROM pedidos p
      LEFT JOIN clientes c ON p.cli_id = c.cli_id
      LEFT JOIN usuarios u ON p.usr_id = u.usr_id
      WHERE p.ped_id = ?
      `,
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Obtener detalles del pedido
    const [detalles] = await conmysql.query(
      `
      SELECT 
        d.det_id,
        d.prod_id,
        pr.prod_nombre,
        d.det_cantidad,
        d.det_precio
      FROM pedidos_detalle d
      LEFT JOIN productos pr ON d.prod_id = pr.prod_id
      WHERE d.ped_id = ?
      `,
      [id]
    );

    // Enviar pedido con sus detalles
    res.status(200).json({
      ...pedido[0],
      detalles: detalles,
    });
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
