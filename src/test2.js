const fetch = require('node-fetch');

fetch('https://reqres.in/api/users?page=2').then((res)=>{
   console.log(res); 
});