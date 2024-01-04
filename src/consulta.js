const oracledb = require('oracledb');

const mypw = "faguilar";  // set mypw to the hr schema password

async function run() {
  let pool;

  try {
    pool = await oracledb.createPool({
      user          : "faguilar",
      password      : mypw ,
      connectString : "SIDUNEA-DESA.WORLD"
    });

    let connection;
    try {
      connection = await pool.getConnection();
      
      //result = await connection.execute(`SELECT sidunea, suma FROM doc`);

      result = await connection.execute(
        `BEGIN
           :ret := no_func(:p1, :p2, :p3);
         END;`,
         {
           p1:  'Fidel', // Bind type is determined from the data.  Default direction is BIND_IN
           p2:  'Jones',
           p3:  { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
           ret: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 40 }
         });

    //  console.log("Result is:", result);

      console.log(result.outBinds);      

    } catch (err) {
      throw (err);
    } finally {
      if (connection) {
        try {
          await connection.close(); // Put the connection back in the pool
        } catch (err) {
          throw (err);
        }
      }
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.close();
  }
}

run();