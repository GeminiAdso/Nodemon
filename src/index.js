import crypto from 'crypto';
import express from 'express';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import indexRouter from './routes/index.js';
import productos from './data/products.js';
import router from './routes/index.js';
import session from 'express-session';
import usuarios from './data/users.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url))
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./src/public'));
app.use(express.static(path.join(__dirname, 'public'))); 




//Esta es para sesiones //estaticos
app.use(session({
  secret: 'secreto123',
  resave: false,
  saveUninitialized: false
}));
// Configuración de Multer para subir archivos


const storage = multer.diskStorage({
  destination: (req, file, cb)=> {
    cb(null, ('./uploads'));
  },
  filename:  (req, file, cb)=> {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()} . ${ext}`); // Genera un nombre único para el archivo
  }
});

const upload = multer({ storage });
app.post('/uploads', upload.single('file'), (req, res) => {
  res.send('Archivo subido correctamente');
});




app.use(express.urlencoded({ extended: true })); // Para datos de formularios (form POST)
app.use(express.json()); // Para datos JSON (si usas fetch o axios)

app.set('views',join(__dirname,'/views'))

//esta es para el servidor estatico
app.set('view engine', 'ejs')
app.use(indexRouter)
app.listen(3000)
console.log('Server is running on port 3000')
console.log('productos', productos)
console.log('users', usuarios)


export default router