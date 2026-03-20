const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI); 

client.connect()
    .then(() => console.log("Successfully connected to MongoDB Atlas"))
    .catch(err => console.error("Initial connection error:", err));

//creating server
const server = http.createServer((req, res) => {

    //If user sends request ex."localhost:5959/hmmm" will take them to a page
    if(req.url === '/'){

        //reading home.html and throwing an error if content is not reached
        fs.readFile(path.join(__dirname,'index.html'),
        (err, content) => {
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});  //sets status code (200 = 'good') and content type for header
            res.end(content);
        }
    );
    }//if requesting api
    // Inside your else if (req.url === '/api')
    else if (req.url.startsWith('/api')) {
        async function getData() {
        try {
            const database = client.db('website355Database');
            const collection = database.collection('website355');
            const data = await collection.find({}).toArray();
            
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify(data));
        } catch (err) {
            console.error("API Error:", err);
            res.writeHead(500);
            res.end("Error fetching data");
        }
    }
        getData();
    }
    // Handle static files (e.g., CSS, JS, images)
    else {
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                // If file not found, serve 404
                fs.readFile(path.join(__dirname, '404.html'), (err404, content404) => {
                    if (err404) throw err404;
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(content404);
                });
            } else {
                // Determine content type based on file extension
                let contentType = 'text/plain';
                const ext = path.extname(req.url); 
                if (ext === '.css') contentType = 'text/css';
                else if (ext === '.js') contentType = 'application/javascript';
                else if (ext === '.html') contentType = 'text/html';
                else if (ext === '.json') contentType = 'application/json';

                res.writeHead(200, {'Content-Type': contentType});
                res.end(content);
            }
        });
    }
});

//Creating server to run in "localhost:5959", once created will send message
const PORT = process.env.PORT || 5959; 
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



