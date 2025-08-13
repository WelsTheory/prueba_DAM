//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

const cors = require('cors');

var express = require('express');
var app = express();
var pool = require('./mysql-connector');
const routerDispositivo = require('./routes/dispositivo')

var corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true // Permitir cookies
}

//=======[Generador de Mediciones Aleatorias]==========================================//
const generarMediciones = () => {
    console.log('Intentando obtener dispositivos para generar mediciones...');
    const queryDispositivos = 'SELECT dispositivoId FROM Dispositivos';
    const queryInsertMedicion = `
        INSERT INTO Mediciones (dispositivoId, fecha, valor)
        VALUES (?, NOW(), ?)`;

    pool.query(queryDispositivos, (err, dispositivos) => {
        if (err) {
            console.error('Error al obtener dispositivos:', err);
            return; // Evita seguir si hay un problema en la consulta
        }

        dispositivos.forEach(({ dispositivoId }) => {
            const valor = (Math.random() * 100).toFixed(2); // Genera un valor aleatorio

            pool.query(queryInsertMedicion, [dispositivoId, valor], (err) => {
                if (err) {
                    console.error(`Error al registrar medición para dispositivo ${dispositivoId}:`, err);
                } else {
                    console.log(`Medición registrada para dispositivo ${dispositivoId}: ${valor}`);
                }
            });
        });
    });
};


setTimeout(() => {
    console.log('Iniciando generación periódica de mediciones...');
    setInterval(() => {
        console.log('Generando nuevas mediciones...');
        generarMediciones();
    }, 300000); // Ejecutar cada 60 segundos
}, 10000); // Retraso inicial de 10 segundos

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));
// to enable cors
app.use(cors(corsOptions));

app.use('/dispositivo', routerDispositivo)

//=======[ Main module code ]==================================================

app.get('/', function(req, res, next) {
    res.send({'mensaje': 'Hola DAM'}).status(200);
});

app.get('/devices', function (req, res) {
    const query = 'SELECT * FROM Dispositivos';

    // Realizamos la consulta a la base de datos
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener los dispositivos:', error);
            res.status(500).send({ error: 'Error al obtener los dispositivos' });
        } else {
            res.status(200).send(results);
        }
    });
});


//=======[ End of file ]======================================================

//=====================================[]==============================//
app.listen(PORT, function(req, res) {
    console.log(`NodeJS API running correctly on port ${PORT}`);
});