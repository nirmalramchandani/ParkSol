import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Nirmal@844",
    database: "parkings"
});

export default db;
