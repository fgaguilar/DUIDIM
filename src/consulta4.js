const oracledb = require("oracledb");

const mypw = "faguilar"; // set mypw to the hr schema password

async function leerSadSpy(keyYear,keyCuo,keyDec,keyNber) {
  let connection;
  let pool = await oracledb.createPool({
    user: "faguilar",
    password: mypw,
    connectString: "SIDUNEA-DESA.WORLD",
  });

  try {
    connection = await pool.getConnection();

    const result = await connection.execute(
      `SELECT a.key_year,
             a.key_cuo,
             a.key_dec,
             a.key_nber,
             a.spy_sta,
             a.spy_act,
             e.estado,
             a.usr_nam,
             to_char(a.upd_dat)||' '||a.upd_hor upd_dat,
             a.sad_clr,
             a.sec_cod,
             a.usr_ex1,
             a.usr_ex2,
             a.upd_ind,
             a.sad_his,
             a.pst_num,
             a.sad_num
        FROM ops$asy.sad_spy a, estados e
       WHERE a.key_year=:key_year
         AND a.key_cuo=:key_cuo
         AND a.key_dec=:key_dec
         AND a.key_nber=:key_nber
         AND a.spy_sta=e.spy_sta
         AND a.spy_act=e.spy_act
    ORDER BY a.upd_dat, a.upd_hor
      `,
      [keyYear,keyCuo,keyDec,keyNber], 
      {
        resultSet: true, 
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    const rs = result.resultSet;
    let row;
    let est = [];
    while ((row = await rs.getRow())) {
      const nom=row.ESTADO;
      const usu=row.USR_NAM;
      const fec=row.UPD_DAT;
      const verDoc=null;
      const data = {
        nom,
        usu,
        fec,
        verDoc 
      }
      est.push(data)
    }
    console.log(est);

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

leerSadSpy('2019','721','1004777023','ANBE559GCA');
