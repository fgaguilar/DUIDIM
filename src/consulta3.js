const oracledb = require("oracledb");
const axios = require('axios');

const mypw = "faguilar";


async function run() {
  let pool;
  let connection;

  try {
    pool = await oracledb.createPool({
      user: "faguilar",
      password: mypw,
      connectString: "SIDUNEA-DESA.WORLD",
    });
    connection = await pool.getConnection();

    const result = await connection.execute(
        `BEGIN
            cursor(:estado, :cursor);
         END;`,
        {
          estado:  'U',
          cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
        }
    );

    const rs = result.outBinds.cursor;

    let row;
    let i = 1;

    while ((row = await rs.getRow())) {
      //Aqui tengo que llamar al servicio para insertar en la coleccion declaraciondeimportacions
      const num = `DI-${row[0]}-${row[1]}-${row[12]}`
      const data = {
          _class : "bo.gob.aduana.suma.ingreso.model.DocumentoIngreso",
          header : {
            codDoc : "DIM",
            desDoc : "DECLARACION DE IMPORTACION DE MERCANCIAS",
            verDoc : 2,
            fecVer : "2019-10-28T12:49:37.818-04:00"
          },
          data : {
            num: num
          }
       
      }
      
      axios.post('http://localhost:8080/api/declaracionDeImportacions',data)
      .then((res)=>console.log(res.data))
      .catch((err)=>console.log(err))
      
    }

    await rs.close();
  } catch (err) {
    console.error(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();
