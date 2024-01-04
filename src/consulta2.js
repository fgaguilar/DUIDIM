const oracledb = require("oracledb");
const axios = require('axios');
const dbConfig = require('./dbconfig.js');
require('dotenv').config();

async function init() {
  try {
    await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString,
      poolAlias: 'default'
    });
    console.log('Connection pool started');

    await leerSadGen('2019','201','373975025','1476');
    //await leerSadGen('2019');

  } catch (err) {
    console.error('init() error: ' + err.message);
  } finally {
    await closePoolAndExit();
  }
}

async function leerSadTax(keyYear,keyCuo,keyDec,keyNber) {
  let connection;
  console.log('Ingreso leerSadTax');
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      ` SELECT   a.key_year,
                 a.key_cuo,
                 a.key_dec,
                 a.key_nber,
                 a.saditm_tax_code,
                 u.tax_dsc,
                 SUM (a.saditm_tax_amount) liqBob,
                 SUM (a.saditm_tax_amount)-SUM (a.saditm_tax_noexo) exoBob,
                 SUM (a.saditm_tax_amount)-(SUM (a.saditm_tax_amount)-SUM (a.saditm_tax_noexo)) totDetBob
          FROM   ops$asy.sad_tax a,untaxtab u
         WHERE a.key_year = :keyYear
           AND a.key_cuo = :keyCuo
           AND a.key_dec = :keyDec
           AND a.key_nber = :keyNber
           AND a.sad_num = 0
           AND u.tax_cod=a.saditm_tax_code
           AND u.lst_ope='U'
          GROUP BY   a.key_year,
                     a.key_cuo,
                     a.key_dec,
                     a.key_nber,
                     a.saditm_tax_code,
                     u.tax_dsc                
      `,
      [keyYear,keyCuo,keyDec,keyNber], 
      {
        resultSet: true, 
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    const rs = result.resultSet;
    let row;
    let liqTri = [];
    while ((row = await rs.getRow())) {
      const codImp = row.SADITM_TAX_CODE;
      const desImp = row.TAX_DSC;
      const liqBob = row.LIQBOB;
      const exoBob = row.EXOBOB;
      const totDetBob = row.TOTDETBOB;

      const data = {
        codImp,
        desImp,
        liqBob,
        exoBob,
        totDetBob
      }
      liqTri.push(data)
    }

    await rs.close();
    return liqTri;
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

async function leerSadTrr(keyYear,keyCuo,keyDec,keyNber) {
  let connection;
  console.log('Ingreso leerSadTrr');
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT a.key_year,
              a.key_cuo,
              a.key_dec,
              a.key_nber,
              a.sad_att_cod,
              d.suma,
              a.sad_att_dsc,
              a.sad_att_free,
              a.sad_att_ref,
              to_date(a.sad_att_fec,'yyyymmdd') sad_att_fec,
              a.sad_att_mon,
              a.sad_att_div,
              a.sad_att_nbr,
              a.sad_att_itm,
              a.sad_att_flg,
              a.sad_num
        FROM  sad_trr a, doc d
        WHERE a.key_year=:key_year
          AND a.key_cuo=:key_cuo
          AND a.key_dec=:key_dec
          AND a.key_nber=:key_nber
          AND a.sad_num = 0
          AND d.sidunea = a.sad_att_cod
      `,
      [keyYear,keyCuo,keyDec,keyNber], 
      {
        resultSet: true, 
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    const rs = result.resultSet;
    let row;
    let docSop = [];
    while ((row = await rs.getRow())) {
      const codTip = row.SUMA;
      const desTip = row.SAD_ATT_DSC;
      const num = row.SAD_ATT_REF;
      const emi = row.SAD_ATT_FREE;
      const fecEmi = row.SAD_ATT_FEC;
      const iteAso = row.SAD_ATT_ITM;
      const mon = row.SAD_ATT_MON;
      const cod = row.SAD_ATT_DIV;
      let tipoMon = null;

      switch(cod) {
        case 'USD':
          des = 'DOLAR ESTADOUNIDENSE';
          break;
        case 'UFV':
          des = 'UNIDAD DE FOMENTO A LA VIVIENDA';
          break;
        case 'BOB':
          des = 'BOLIVIANO';
          break;
        default:
          des = null;
      }

      if (cod !== null) {
        tipoMon = {
          cod : row.SAD_ATT_DIV,
          des : des
        }
      }
      else {
        tipoMon = null;
      }
  
      const camDin = {
        num,
        emi,
        fecEmi,
        iteAso,
        mon,
        tipoMon
      };

      const data = {
        codTip,
        desTip,
        camDin
      }
      docSop.push(data)
    }

    await rs.close();
    return docSop;
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

async function leerSadSpy(keyYear,keyCuo,keyDec,keyNber) {
  let connection;
  console.log('Ingreso leerSadSpy');
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT a.key_year,
             a.key_cuo,
             a.key_dec,
             a.key_nber,
             a.spy_sta,
             a.spy_act,
             e.estado,
             a.usr_nam,
             to_date(to_char(a.upd_dat,'dd/mm/yyyy')||' '||a.upd_hor,'dd/mm/yyyy hh24:mi:ss') upd_dat,
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
      const fec = new Date(row.UPD_DAT);
      const data = {
        nom,
        usu,
        fec
      }
      est.push(data)
    }

    await rs.close();
    return est;
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

async function leerSadGen(anio,adu,dec,nber) {
  let connection;
  console.log('Ingreso leerSadGen');
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT   a.key_year,
               a.key_cuo,
               cuo.cuo_nam cuo_nam,
               a.key_dec,
               dec.dec_nam,
               a.key_nber,
               a.sad_flw,
               a.sad_typ_dec,
               a.sad_typ_proc,
               i.saditm_extd_proc,
               i.saditm_nat_proc,
               a.sad_typ_transit,
               a.sad_exporter,
               a.sad_manif_nber,
               a.sad_lst_nber,
               a.sad_reg_serial,
               a.sad_reg_nber,
               a.sad_reg_date,
               a.sad_itm_total,
               a.sad_pack_total,
               a.sad_consignee,
               con.cmp_nam,
               a.sad_financial,
               a.sad_cty_1dlp,
               cty1.cty_dsc cty1_nam,
               a.sad_tra_cty,
               cty2.cty_dsc cty2_nam,
               a.sad_val_details,
               a.sad_cap_ref,
               a.sad_cty_expcod,
               cty3.cty_dsc cty3_nam,
               a.sad_cty_expreg,
               a.sad_cty_destcod,
               'BOLIVIA' cty_dsc,
               a.sad_cty_destreg,
               reg.reg_dsc,
               a.sad_trsp_iddepar,
               a.sad_trsp_natdepar,
               a.sad_ctnr_flag,
               a.sad_tod_cod,
               a.sad_tod_nam,
               a.sad_tod_sit,
               a.sad_trsp_idbord,
               a.sad_trsp_natbord,
               a.sad_cur_cod,
               a.sad_tot_invoiced,
               a.sad_tra_cod1,
               a.sad_tra_cod2,
               a.sad_mot_bord,
               a.sad_mot_inland,
               a.sad_lop_cod,
               a.sad_top_cod,
               a.sad_cuo_bord,
               bord.cuo_nam cuo_bord,
               a.sad_loc_goods,
               a.sad_bnk_cod,
               a.sad_bnk_bra,
               a.sad_bnk_fnber,
               a.sad_def_pay,
               a.sad_whs_cod,
               a.sad_whs_time,
               a.sad_total_sdi,
               a.sad_asmt_serial,
               a.sad_asmt_nber,
               a.sad_asmt_date,
               a.sad_rcpt_serial,
               a.sad_rcpt_nber,
               a.sad_rcpt_date,
               a.sad_grty_amount,
               a.sad_grty_date,
               a.sad_tot_fees,
               a.sad_total_taxes,
               a.sad_ctrl_results,
               a.sad_dec_place,
               a.sad_dec_date,
               a.sad_dec_repnam,
               a.sad_cof_nam,
               a.sad_not_val,
               a.sad_sta,
               a.sad_to_be_paid,
               a.sad_reg_year,
               a.sad_asmt_year,
               a.sad_stat_val,
               a.lst_ope,
               a.sad_pst_num,
               a.sad_pst_dat,
               a.sad_num,
               TO_DATE (TO_CHAR (s.upd_dat, 'dd/mm/yyyy') || ' ' || s.upd_hor,
                        'dd/mm/yyyy hh24:mi:ss')
                   upd_dat,
               m.codmoddep,
               m.desmoddep,
               m.coddesregadu,
               m.desdesregadu,
               m.codtraesp,
               m.destraesp,
               m.codmodreg,
               m.desmodreg
        FROM   sad_gen a,
               sad_itm i,
               sad_spy s,
               uncuotab cuo,
               uncuotab bord,
               undectab dec,
               uncmptab con,
               unctytab cty1,
               unctytab cty2,
               unctytab cty3,
               unregtab reg,
               modalidad m
       WHERE       a.key_cuo = cuo.cuo_cod
               AND a.sad_cuo_bord = bord.cuo_cod
               AND a.key_dec = dec.dec_cod
               AND a.sad_consignee = con.cmp_cod
               AND a.sad_cty_1dlp = cty1.cty_cod
               AND a.sad_tra_cty = cty2.cty_cod
               AND a.sad_cty_expcod = cty3.cty_cod
               AND a.sad_cty_destcod = reg.cty_cod
               AND a.sad_cty_destreg = reg.reg_cod
               AND i.key_year = a.key_year
               AND i.key_cuo = a.key_cuo
               AND i.key_dec = a.key_dec
               AND i.key_nber = a.key_nber
               AND i.sad_num = a.sad_num
               AND i.itm_nber = 1
               AND s.key_year = a.key_year
               AND s.key_cuo = a.key_cuo
               AND s.key_dec = a.key_dec
               AND s.key_nber = a.key_nber
               AND s.spy_act = '25'
               AND m.typ_dec=a.sad_typ_dec
               AND m.typ_proc=a.sad_typ_proc
               AND m.extd_proc=i.saditm_extd_proc
               AND m.nat_proc=i.saditm_nat_proc
               AND a.key_year = :anio
               AND a.key_cuo = :adu
               AND a.key_dec = :dec
               AND a.key_nber = :nber
               AND a.sad_reg_nber<2000000
               AND a.sad_num = 0
      `,
      [anio,adu,dec,nber],
      {
        resultSet: true, 
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );

    const rs = result.resultSet;
    let row;
    while ((row = await rs.getRow())) {
      const fecVer = new Date(row.SAD_REG_DATE);
      const est=await leerSadSpy(row.KEY_YEAR,row.KEY_CUO,row.KEY_DEC,row.KEY_NBER);
      const docSop=await leerSadTrr(row.KEY_YEAR,row.KEY_CUO,row.KEY_DEC,row.KEY_NBER);
      const liqTri=await leerSadTax(row.KEY_YEAR,row.KEY_CUO,row.KEY_DEC,row.KEY_NBER);
      const num = `DI-${row.KEY_YEAR}-${row.KEY_CUO}-${row.SAD_REG_NBER}`;
      const fecTra = fecVer;
      const ver = 0;
      const estAct = 'CONCLUIDO';
      const fecEstAct = row.UPD_DAT; //TODO: Se debe tomar la fecha del levante de la sad_spy
      const numRef = row.KEY_NBER; 
      const codAduDep = row.SAD_CUO_BORD;
      const desAduDep = row.CUO_BORD;
      const codModDep = row.CODMODDEP;
      const desModDep = row.DESMODDEP;
      const codDesRegAdu = row.CODDESREGADU;
      const desDesRegAdu = row.DESDESREGADU;
      const codTraEsp = row.CODTRAESP;
      const desTraEsp = row.DESTRAESP;
      const codModReg = row.CODMODREG;
      const desModReg = row.DESMODREG;
      const codTipDoc = 'NIT';
      const desTipDoc = 'NÚMERO DE IDENTIFICACIÓN TRIBUTARIA';
      const imp_numDoc = row.SAD_CONSIGNEE;
      const imp_nomRazSoc =row.CMP_NAM;
      const dec_numDoc = row.KEY_DEC;
      const dec_nomRazSoc = row.DEC_NAM;
      
      const data = {
        _class : "bo.gob.aduana.suma.ingreso.model.DocumentoIngreso",
        header : {
          codDoc : "DIM",
          desDoc : "DECLARACION DE IMPORTACION DE MERCANCIAS",
          verDoc : 0,
          fecVer : fecVer
        },
        data : {
          num,
          fecTra,
          ver,
          estAct,
          fecEstAct,
          numRef,
          codAduDep,
          desAduDep,
          codModDep,
          desModDep,
          codDesRegAdu,
          desDesRegAdu,
          codTraEsp,
          desTraEsp,
          codModReg,
          desModReg,
          imp: {
            codTipDoc,
            desTipDoc,
            numDoc:imp_numDoc,
            nomRazSoc:imp_nomRazSoc
          },
          con: {
            codTipDoc,
            desTipDoc,
            numDoc : imp_numDoc,
            nomRazSoc : imp_nomRazSoc
          },
          dec: {
            codTipDoc,
            desTipDoc,
            numDoc : dec_numDoc,
            nomRazSoc : dec_nomRazSoc
          },
          liqTri,
          docSop

        },
        log: {
          est
        }
      }
      
      const url = process.env.URL_MONGO;

      await axios.post(
        url,
        data
      )
      .then( res => {
        console.log(res.data)
      })
      .catch((err)=>console.log(err));

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

async function closePoolAndExit() {
  console.log('\nTerminating');
  try {
    await oracledb.getPool().close(10);
    console.log('Pool closed');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

process
  .once('SIGTERM', closePoolAndExit)
  .once('SIGINT',  closePoolAndExit);

init();
