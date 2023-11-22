import weacast from '@codask/weacast'; // Import du module weacast
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();

const getWeatherData = async (cityName) => {
    try {
        return await weacast(cityName);
    } catch (err) {
        console.error("Error getting weather data", err);
        throw err;
    }
};

const startServer = async () => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Configuration du moteur de template Handlebars
        app.set('view engine', 'hbs');
        app.set('views', path.join(__dirname, '..', 'views'));

        app.use(express.static(path.join(__dirname, 'public')));

        // Route pour récupérer les données météorologiques en fonction de la ville fournie
        app.get('/', async (req, res) => {
            const cityName = req.query.city;
            const currentDate = new Date();
            const searchId = Math.floor(Math.random() * 1000); // Génération d'un identifiant aléatoire

            try {
                let weatherData = null;

                if (cityName) {
                    weatherData = await getWeatherData(cityName);

                    // Données à sauvegarder
                    const searchData = {
                        id: searchId,
                        timestamp: currentDate.toISOString(),
                        city: cityName,
                        temperature: weatherData
                    };

                    // Lecture du fichier JSON existant
                    let searchDataArray = [];
                    try {
                        const fileData = fs.readFileSync('searchData.json', 'utf8');
                        searchDataArray = JSON.parse(fileData);
                    } catch (error) {
                        console.error(error)
                    }

                    // Ajout des nouvelles données de recherche
                    searchDataArray.push(searchData);

                    // Écriture des données dans le fichier JSON
                    fs.writeFileSync('searchData.json', JSON.stringify(searchDataArray, null, 2));

                    // Renvoyer les données au client
                    res.render('home', { weather: weatherData, searchId });
                } else {
                    res.render('home', { weather: null });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Error fetching weather data');
            }
        });


        //autre route
        app.get('/about', (req, res) => {
            res.render('about');
        });

        app.get('/contact', (req, res) => {
            res.render('contact');
        });

        // Démarrage du serveur
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup error", error);
    }
};

// Lancement du serveur
startServer();
