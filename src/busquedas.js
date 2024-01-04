const axios = require('axios');
class Busquedas { 
    async llamar( lugar = '') { 

        try {
            console.log(lugar);
            
            const resp = await axios.get('https://reqres.in/api/users?page=2');
            console.log(resp); 
        } catch (error) {
            console.log(error);
        }

        return [];

    }
}

module.exports = Busquedas;