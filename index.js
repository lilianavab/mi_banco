import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

dotenv.config();

const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

const pool = new Pool(config);

const argumentos = process.argv.slice(2);
const operacion = argumentos[0];

async function ejecutarOperacion() {
    const client = await pool.connect();
    try {
        switch (operacion) {
            case "nueva":
                console.log('Realizando nueva transferencia...');
                const descripcion = argumentos[4];
                const fecha = argumentos[3];
                const monto = argumentos[5];
                const cuentaOrigen = argumentos[1];
                const cuentaDestino = argumentos[2];
                await nuevaTransferencia(client, descripcion, fecha, monto, cuentaOrigen, cuentaDestino);
                break;
            case "consultar-transferencias":
                console.log('Consultando últimas transferencias...');
                const cuentaIdTransferencias = argumentos[1];
                const ultimasTransferencias = await consultarUltimasTransferencias(client, cuentaIdTransferencias);
                console.log('Últimas transferencias:', ultimasTransferencias);
                break;
            case "consultar-saldo":
                console.log('Consultando saldo...');
                const cuentaIdSaldo = argumentos[1];
                const saldo = await consultarSaldoCuenta(client, cuentaIdSaldo);
                console.log('Saldo de la cuenta:', saldo);
                break;
            default:
                console.log('Operación no reconocida. Por favor, ingrese una operación válida.');
                break;
        }
    } catch (error) {
        console.error('Error durante la conexión o la consulta:', error.stack);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

async function nuevaTransferencia(client, descripcion, fecha, monto, cuentaOrigen, cuentaDestino) {
    try {
        await client.query('BEGIN');

        await client.query('UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2', [monto, cuentaOrigen]);
        await client.query('UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2', [monto, cuentaDestino]);

        const result = await client.query('INSERT INTO transferencias (descripcion, fecha, monto, cuenta_origen, cuenta_destino) VALUES ($1, $2, $3, $4, $5) RETURNING *', [descripcion, fecha, monto, cuentaOrigen, cuentaDestino]);

        await client.query('COMMIT');
        console.log('Transacción realizada con éxito:', result.rows[0]);
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error durante la conexión o la consulta:', error.stack);
        throw error;
    }
}

async function consultarUltimasTransferencias(client, cuentaId) {
    try {
        const result = await client.query('SELECT * FROM transferencias WHERE cuenta_origen = $1 OR cuenta_destino = $1 ORDER BY fecha DESC LIMIT 10', [cuentaId]);
        return result.rows;
    } catch (error) {
        console.error('Error al consultar las últimas transferencias:', error.stack);
        throw error;
    }
}

async function consultarSaldoCuenta(client, cuentaId) {
    try {
        const result = await client.query('SELECT saldo FROM cuentas WHERE id = $1', [cuentaId]);
        return result.rows[0].saldo;
    } catch (error) {
        console.error('Error al consultar el saldo de la cuenta:', error.stack);
        throw error;
    }
}

ejecutarOperacion().catch(error => {
    console.error('Error durante la conexión o la consulta:', error.stack);
    process.exit(1);
});
