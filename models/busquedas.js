const fs = require('fs');

const axios = require('axios')




class Busquedas {

    historial = [];
    dbPath = './db/database.json';


    constructor() {
        this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ')
        })
    }
     
    get historialCapitalizado(){


        
        return this.historial;
    }


    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }
    get paramsWheather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            'lang': 'es',
            'units': 'metric'

        }
    }
    async ciudad(lugar = '') {

        try {
            const instace = axios.create({

                baseURL: `https://api.mapbox.com/`,
                params: this.paramsMapbox
            });
            const resp = await instace.get(`geocoding/v5/mapbox.places/${lugar}.json`);


            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]


            }))








        } catch (error) {
            return []

        }

        return []; // retornar los lugares que coincidan.

    }

    async climaLugar(lat, lon) {

        try {

            const instace = axios.create({

                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsWheather , lat , lon}
            });
            const resp = await instace.get();
            const {weather,main} = resp.data

            return {
                desc: weather[0].description,
                min: main.temp_min ,
                max: main.temp_max,
                temp: main.temp
            }

        }
        catch (error) {
            console.log(error);
        }
    }


    agregarHistorial(lugar = '') {
         
        if(this.historial.includes( lugar.toLocaleLowerCase())) {

            return;
        }
        this.historial = this.historial.splice(0,5);
          this.historial.unshift(lugar.toLocaleLowerCase());
         // prevenir duplicados
         this.historial.unshift( lugar );

         //Grabar en DB
          this.guardarDB();


    }

    guardarDB(){
      
        const payload = {
            historial: this.historial
        }

      fs.writeFileSync(this.dbPath, JSON.stringify(payload));

    }

    leerDB() {
      

        if(! fs.existsSync(this.dbPath) ) return;

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8'});

        const data = JSON.parse(info)
       
         this.historial = data.historial
       

       
    }

}



module.exports = Busquedas;