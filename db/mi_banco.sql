-- Se crea la base de datos llamada "mi_banco"
CREATE DATABASE mi_banco;

--Conectarse a la nueva base de dato
\c mi_banco

-- CREACION de la Tabla transferencias
CREATE TABLE transferencias 
(descripcion varchar(50), 
fecha varchar(10), 
monto DECIMAL, 
cuenta_origen INT, 
cuenta_destino INT);

-- CREACION de la Tabla cuentas
CREATE TABLE cuentas 
(id INT, 
saldo DECIMAL CHECK (saldo >= 0) );

-- CONSULTAS DE LA TABLA
SELECT * FROM transferencias;
SELECT * FROM cuentas;

-- SE INSERTA 2 Registros de cuentas
INSERT INTO cuentas values (1, 200000); 
INSERT INTO cuentas values (2, 100000);
