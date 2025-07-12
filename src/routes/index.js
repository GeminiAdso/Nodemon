import { Router } from "express";
import express from 'express';
import productos from "../data/products.js";
import usuarios from '../data/users.js';
// Sesiones manuales con SESSIONID
const sesiones = {}; // { sessionId: usuario }
const router = Router();
//import nodemailer from 'nodemailer';
const dominiosValidos = [
  'gmail.com',
  'hotmail.com',
  'yahoo.com',
  'outlook.com',
  'icloud.com',
  'live.com'
];
import multer from 'multer';
import path from 'path';


import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Sesiones manuales (SESSIONID => usuario)







//rutas de paginas
router.get('/', (req, res) => res.render('index', {title:'Inicio'}))
router.get('/about', (req, res) => res.render('about',{title:'Sobre Nosotros'}))
router.get('/contact', (req, res) => res.render('contact', {title:'Contactenos' }))
router.get('/landing', (req, res) => res.render('landing', {title:'Principal' }))
router.get('/product', (req, res) => res.render('product',{title:'Productos',productos, }))
router.get('/login', (req, res) => res.render('login',{title:'Iniciar Sesion'}))
router.get('/registro', (req, res) => res.render('registro',{title:'Registro'}))
////perfil
router.get('/perfil', (req, res) => {
  let usuario = req.session.usuario;

  // Si no hay sesión de cookies, probá con SESSIONID por URL
  if (!usuario && req.query.SESSIONID) {
    usuario = sesiones[req.query.SESSIONID];
  }

  if (!usuario) return res.redirect('/login');

  res.render('perfil', { usuario, title: 'Perfil' });
});


//router.get('/carrito', (req, res) => res.render('carrito',{title:'Carrito',carrito: req.session.carrito || []}))

//vista administrador/crear productos
router.get('/CrearProductos', (req, res) => {res.render('CrearProductos',{title:'ListarProductos'})});



// Guardar producto desde formulario
router.post('/crear-producto', (req, res) => {
  const { nombre, precio, categoria, imagen } = req.body;
  const id = Date.now().toString();
  productos.push({ id, nombre, precio, categoria, imagen });
  console.log(productos);
  res.redirect('/product');
});

// Mostrar los productos
router.get('/productos', (req, res) => {
  res.render('product', { productos });
});

router.post('/registro', (req, res) => {
  const { nick, email, password } = req.body;
  //validaciones de registro
  if (!nick || !email || !password) {
    return res.send('Faltan datos (body vacío o incompleto)');
  }

  if (/^\d+$/.test(nick)) {
    return res.send('El nick no puede ser solo números');
  }

  if (nick.length < 3) {
    return res.send('El nick debe tener al menos 3 caracteres');
  }

  if (password.length < 6) {
    return res.send('La contraseña debe tener al menos 6 caracteres');
  }

  // Validar email formato y dominio real
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dominiosValidos = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'live.com'];
  const dominioEmail = email.split('@')[1];

  if (!emailRegex.test(email)) {
    return res.send('El correo electrónico no tiene un formato válido');
  }

  if (!dominiosValidos.includes(dominioEmail)) {
    return res.send('Dominio de correo no permitido. Usa Gmail, Outlook, Yahoo, etc.');
  }
  
  if (usuarios.find(u => u.nick === nick)) {
    return res.send('El nick ya existe');
  }
  if (usuarios.find(u => u.email === email)) {
    return res.send('El email ya existe');
  }
  //// enviar correo de bienvenida
  

  
  
  
  /////
  usuarios.push({ id: Date.now(), nick, email, password });
  res.redirect('/login');
});


// Login
import crypto from 'crypto'; // al principio del archivo, si aún no lo has importado

router.post('/login', (req, res) => {
  const { nick, password } = req.body;
  const usuario = usuarios.find(u => u.nick === nick && u.password === password);
  if (!usuario) return res.send('Credenciales incorrectas');

  // Generar un SESSIONID aleatorio
  const sessionId = crypto.randomUUID(); // O crypto.randomBytes(16).toString('hex');

  // Guardar en sesión clásica por si seguís usando cookies
  req.session.usuario = usuario;

  // Guardar en nuestro mapa de sesiones personal
  sesiones[sessionId] = usuario;

  // Redirigir pasando el SESSIONID por la URL
  res.redirect(`/productos?SESSIONID=${sessionId}`);
});


//esta es para añadir un producto al carrito
router.post('/carrito/agregar/:id', (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');
  
  const producto = productos.find(p => p.id === req.params.id);
  if (!producto) return res.send('Producto no encontrado');

  if (!req.session.carrito) req.session.carrito = [];

  req.session.carrito.push(producto);
  res.redirect('/carrito');
});


//esta es para ver el carrito

router.get('/carrito', (req, res) => {
  let usuario = req.session.usuario;

  if (!usuario && req.query.SESSIONID) {
    usuario = sesiones[req.query.SESSIONID];
  }

  if (!usuario) return res.redirect('/login');

  const carrito = req.session.carrito || [];
  res.render('carrito', { carrito });
});



// Cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.send('Error al cerrar sesión');
    }
    res.redirect('/login'); // Redirige al login o a la página de inicio
  });
});

//filtro de productos por categoria

router.get('/productos', (req, res) => {
  const categoria = req.query.categoria;
  const sessionId = req.query.SESSIONID;

  let filtrados = productos;

  if (categoria) {
    filtrados = productos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
  }

  res.render('product', { productos: filtrados, categoria, SESSIONID: sessionId });
});

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads')); // ⚠️ La carpeta debe existir
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});



//personalizacion de perfil
const upload = multer({ storage });//<--tiene que ir arriba
router.post('/perfil/avatar', upload.single('avatar'), (req, res) => {
  const usuario = req.session.usuario; // Asegúrate de que esté logueado

  if (!req.file) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  // Simula que se actualiza el usuario con el nuevo avatar
  usuario.avatar = req.file.filename;

  // Aquí deberías guardar ese dato en tu base de datos si usas una

  res.redirect('/perfil');
});



export default router;