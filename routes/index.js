const express = require('express');
const router = express.Router();
const fs = require('fs')
const { v4 } = require('uuid')
const habitaciones = require('../habitaciones.json')
const inquilinos = require('../inquilinos.json')

const json_habitaciones = fs.readFileSync('habitaciones.json', 'utf-8')
let habitacion = JSON.parse(json_habitaciones)

const json_usuario = fs.readFileSync('inquilinos.json', 'utf-8')
let usuario = JSON.parse(json_usuario)

var habitaciones_uno = 0
var habitaciones_dos = 0
var habitaciones_cuatro = 0

for (let i = 0; i < habitaciones.habitacion1.length + 1; i++) {
  habitaciones_uno = i;
};

for (let i = 0; i < habitaciones.habitacion2.length + 1; i++) {
  habitaciones_dos = i;
};

for (let i = 0; i < habitaciones.habitacion4.length + 1; i++) {
  habitaciones_cuatro = i;
};

/* GET home page. */
router.get('/', function (req, res) {
  res.status(200).send("Bienvenido al Hotel. Ingrese sus datos y la habitación que desea")
})

router.get('/habitaciones', function(req, res) {
  try {
    res.status(200).json( { 
      habitaciones_para_uno: 25-habitaciones_uno,
      habitaciones_para_dos: 15-habitaciones_dos,
      habitaciones_para_cuatro: 10-habitaciones_cuatro, 
    });
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
});

router.get('/inquilinos', function (req, res) {
  try {
    res.status(200).json( { inquilinos } )
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.post('/new-user', function (req, res) {
  try {
    let { nombre, edad, sexo, telefono, direccion } = req.body;

    if ( !nombre || !edad || !sexo || !telefono || !direccion) {
      res.status(400).send("Campos incompletos, por favor llenar todos los campos")
    }
    
    let newUser = {
      id: v4(),
      nombre,
      edad,
      sexo,
      telefono,
      direccion
    }

    function validarDatos(obj) {
      if (/^[A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]+$/g.test(obj.nombre)) {
        if (isNaN(obj.edad) === false && obj.edad < 90) {
          if (obj.sexo.toLowerCase() == "masculino" || obj.sexo.toLowerCase() == "femenino") {
            if (isNaN(obj.telefono) === false && obj.telefono.length < 15 ) {
              if (/^[A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]+$/g.test(obj.direccion)) {
                usuario.push(obj)
              } else {res.status(400).send('La direccion está vacía, debe llenar todos los campos')}
            } else {res.status(400).send('Número de teléfono erróneo')}
          } else {res.status(400).send('El sexo es inválido')}
        } else {res.status(400).send('Edad inválida')}
        return true
      } else {res.status(400).send('Nombre inválido, usar solo letras')}
    }

    if (validarDatos(newUser)) {
      let json_usuario = JSON.stringify(usuario)
      fs.writeFileSync('inquilinos.json', json_usuario, 'utf-8')
      res.status(200).send("Inquilino agregado correctamente")
    }
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.post('/new-user/habitaciones/:id_user/:nro_habitacion', (req, res) => {
  try {
    let id = req.params.id_user
    let nro = req.params.nro_habitacion
    if (id && nro == 1 || nro == 2 || nro == 4) {
      let newUserHabitacion = {id}

      for (let hab in habitacion) {
        if(hab == "habitacion"+nro){
          habitacion[hab].push(newUserHabitacion)
        }
      }

      let json_habitaciones = JSON.stringify(habitacion)
      fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
      res.status(200).send("Usuario registrado en la habitacion")
    } else {
      res.status(400).send("Id no existe")
    }
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.put('/inquilinos/update/:id', (req, res) => {
  try {
    let id_param = req.params.id
    if (id_param) { 
      let {id, nombre, edad, sexo, telefono, direccion} = req.body;
      
      let updateUser = {
        id,
        nombre,
        edad,
        sexo,
        telefono,
        direccion
      }

      usuario.filter(user => {
        if(user.id == id_param) {
          if(updateUser.nombre) user.nombre = updateUser.nombre;
          if(updateUser.edad) user.edad = updateUser.edad;
          if(updateUser.sexo) user.sexo = updateUser.sexo;
          if(updateUser.telefono) user.telefono = updateUser.telefono;
          if(updateUser.direccion) user.direccion = updateUser.direccion;
        }
      })
      
      let json_usuario = JSON.stringify(usuario)
      fs.writeFileSync('inquilinos.json', json_usuario, 'utf-8')
      res.status(200).send('Inquilino actualizado')
    } else {
      res.status(400).send("No ha ingresado ningun ID")
    }
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.put('/habitaciones/update/:id/:nro_habitacion', (req, res) => {
  try {
    let id_param = req.params.id
    let nro = req.params.nro_habitacion
    let id = req.body.id
    let updateHabitacion = { id }

    if (id_param) {
      for (let hab in habitacion) {
        if(hab == "habitacion"+nro){
          habitacion[hab].forEach((element) => {
            if (element.id == id_param) {
              if(updateHabitacion.id) element.id = updateHabitacion.id
            }
          })
        }
      }
    }
    let json_habitaciones = JSON.stringify(habitacion)
    fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
    res.status(200).send("Habitación actualizada")
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.delete('/inquilinos/delete/:id', (req, res) => {
  try {
    if (req.params.id) {
      usuario = usuario.filter(user => user.id != req.params.id)
      let json_usuario = JSON.stringify(usuario)
      fs.writeFileSync('inquilinos.json', json_usuario, 'utf-8')
      res.status(200).send('Inquilino eliminado del sistema')
    } else {
      res.status(400).send("El ID no existe")
    }
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.delete('/habitaciones/delete/:id_user', (req, res) => {
  try {
    let id = req.params.id_user
    if (id) {
      
      for (let habi in habitacion) {
        habitacion[habi] = habitacion[habi].filter(user => user.id !== id)
      }
      
      let json_habitaciones = JSON.stringify(habitacion)
      fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
      res.status(200).send('Inquilino fuera de la habitación')
    } else {
      res.status(400).send("El ID no existe")
    }
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

module.exports = router;
