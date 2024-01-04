const Busquedas = require("./busquedas")


const main = async() => {
    const busquedas = new Busquedas

    console.log('entro');

    await busquedas.llamar('Lo que sea');
}

main();