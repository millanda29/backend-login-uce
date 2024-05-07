const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

// Configuración de CORS para permitir solicitudes desde http://localhost:3000
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true // Habilita el intercambio de cookies y encabezados de autenticación
}));

const connection = mysql.createConnection({
    host: 'mysql-programacionweb.alwaysdata.net',
    port: 3306,
    user: '358100_admin',
    password: 'wagog37681',
    database: 'programacionweb_db_acceso',
    connectTimeout: 60000, // Aumenta el tiempo de espera a 60 segundos (valor en milisegundos)
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

app.use(express.json());

// Endpoint para registrar un usuario
app.post('/api/register', (req, res) => {
    const { nombre, apellido, correo, clave } = req.body;
    console.log('Datos recibidos para registro:', { nombre, apellido, correo, clave });
    connection.query('CALL sp_RegistrarUsuario(?, ?, ?, ?, @registrado, @mensaje)', [nombre, apellido, correo, clave], (error, results) => {
        if (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Error registering user' });
            return;
        }
        connection.query('SELECT @registrado AS Registrado, @mensaje AS Mensaje', (error, results) => {
            if (error) {
                console.error('Error fetching result:', error);
                res.status(500).json({ error: 'Error fetching result' });
                return;
            }
            const { Registrado, Mensaje } = results[0];
            res.json({ Registrado, Mensaje });
        });
    });
});

// Endpoint para validar un usuario y realizar el inicio de sesión
app.post('/api/login', (req, res) => {
    const { correo, clave } = req.body;
    console.log('Datos recibidos para inicio de sesión:', { correo, clave });
    connection.query('CALL sp_ValidarUsuario(?, ?)', [correo, clave], (error, results) => {
        if (error) {
            console.error('Error validating user:', error);
            res.status(500).json({ error: 'Error validating user' });
            return;
        }
        const user = results[0][0];
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        res.json(user);
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
