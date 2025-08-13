const express = require('express')

const routerDispositivo = express.Router()

var pool = require('../../mysql-connector');

routerDispositivo.get('/', function(req, res) {
    pool.query('Select * from Dispositivos', function(err, result, fields) {
        if (err) {
            console.error('Error al consultar dispositivos:', err);
            return res.status(400).send(err); 
        }
        res.status(200).send(result); // Respuesta exitosa con código de estado
    });
})

routerDispositivo.get('/:id', (req, res) => {
    const dispositivoId = req.params.id;

    // Consulta para obtener el detalle del dispositivo y su válvula
    const query = `
        SELECT d.dispositivoId, d.nombre AS dispositivoNombre, d.ubicacion, 
               e.electrovalvulaId, e.nombre AS electrovalvulaNombre
        FROM Dispositivos d
        INNER JOIN Electrovalvulas e ON d.electrovalvulaId = e.electrovalvulaId
        WHERE d.dispositivoId = ?`;

    pool.query(query, [dispositivoId], (err, result) => {
        if (err) {
            console.error('Error al obtener el dispositivo:', err);
            return res.status(500).json({ error: 'Error al obtener el dispositivo' });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Dispositivo no encontrado' });
        }
        res.status(200).json(result[0]);
    });
});

routerDispositivo.post('/:id/valvula', (req, res) => {
    const dispositivoId = req.params.id;
    const { apertura } = req.body; // apertura: 1 para abrir, 0 para cerrar
    const fecha = new Date();

    // Consulta para insertar en Log_Riegos
    const queryLog = `
        INSERT INTO Log_Riegos (apertura, fecha, electrovalvulaId)
        SELECT ?, ?, electrovalvulaId
        FROM Dispositivos
        WHERE dispositivoId = ?`;

    pool.query(queryLog, [apertura, fecha, dispositivoId], (err, result) => {
        if (err) {
            console.error('Error al registrar el riego:', err);
            return res.status(500).json({ error: 'Error al registrar el riego' });
        }
        res.status(200).json({ mensaje: `Válvula ${apertura ? 'abierta' : 'cerrada'} correctamente` });
    });
});

routerDispositivo.get('/:id/mediciones', (req, res) => {
    const dispositivoId = req.params.id;

    const query = `
        SELECT medicionId, fecha, valor
        FROM Mediciones
        WHERE dispositivoId = ?
        ORDER BY fecha DESC`;

    pool.query(query, [dispositivoId], (err, result) => {
        if (err) {
            console.error('Error al obtener las mediciones:', err);
            return res.status(500).json({ error: 'Error al obtener las mediciones' });
        }
        res.status(200).json(result);
    });
});

routerDispositivo.post('/:id/abrir', (req, res) => {
    const electrovalvulaId = req.params.id;
    const query = `
        INSERT INTO Log_Riegos (electrovalvulaId, apertura, fecha)
        VALUES (?, 1, NOW())
    `;

    pool.query(query, [electrovalvulaId], (err, result) => {
        if (err) {
            console.error('Error al abrir la válvula:', err);
            return res.status(500).send({ error: 'No se pudo abrir la válvula' });
        }
        res.status(200).send({ message: 'Válvula abierta exitosamente' });
    });
});

routerDispositivo.post('/:id/cerrar', (req, res) => {
    const electrovalvulaId = req.params.id;
    const query = `
        INSERT INTO Log_Riegos (electrovalvulaId, apertura, fecha)
        VALUES (?, 0, NOW())
    `;

    pool.query(query, [electrovalvulaId], (err, result) => {
        if (err) {
            console.error('Error al cerrar la válvula:', err);
            return res.status(500).send({ error: 'No se pudo cerrar la válvula' });
        }
        res.status(200).send({ message: 'Válvula cerrada exitosamente' });
    });
});

routerDispositivo.get('/:id/estado', (req, res) => {
    const electrovalvulaId = req.params.id;
    const query = `
        SELECT apertura
        FROM Log_Riegos
        WHERE electrovalvulaId = ?
        ORDER BY fecha DESC
        LIMIT 1
    `;

    pool.query(query, [electrovalvulaId], (err, result) => {
        if (err) {
            console.error('Error al obtener el estado de la válvula:', err);
            return res.status(500).send({ error: 'No se pudo obtener el estado' });
        }

        if (result.length > 0) {
            res.status(200).send({ estado: result[0].apertura === 1 });
        } else {
            res.status(200).send({ estado: false }); // Cerrada por defecto
        }
    });
});

routerDispositivo.get('/:id/ultima-medicion', function (req, res) {
    const dispositivoId = req.params.id;

    const query = `
        SELECT fecha, valor
        FROM Mediciones
        WHERE dispositivoId = ?
        ORDER BY fecha DESC
        LIMIT 1
    `;

    pool.query(query, [dispositivoId], function (err, result) {
        if (err) {
            console.error('Error al obtener la última medición:', err);
            res.status(500).send({ error: 'Error al obtener la última medición' });
        } else if (result.length === 0) {
            res.status(404).send({ error: 'No se encontraron mediciones para este dispositivo' });
        } else {
            res.status(200).send(result[0]);
        }
    });
});


module.exports = routerDispositivo