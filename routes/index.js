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

/* GET home page. */
router.get('/', function (req, res) {
  res.status(200).send("Bienvenido al Hotel. Ingrese sus datos y la habitación que desea")
})

router.get('/habitaciones', function(req, res) {
  try {
    res.status(200).json( { 
      habitaciones_para_uno: 25-habitaciones.habitacion1.length,
      habitaciones_para_dos: 15-habitaciones.habitacion2.length,
      habitaciones_para_cuatro: 10-habitaciones.habitacion4.length, 
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
              if (/^[A-Za-zñÑáéíóúÁÉÍÓÚüÜs]+$/g.test(obj.direccion)) {
                usuario.push(obj)
              } else {res.status(400).send('La direccion es invalida')}
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

      function agregarHabitacion(valor) {
        for (let hab in habitacion) {
          if(hab == valor){
            usuario.filter(user => {
              if(user.id == id) {
                habitacion[hab].push(newUserHabitacion)
                let json_habitaciones = JSON.stringify(habitacion)
                fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
                res.status(200).send("Usuario registrado en la habitacion")
              }
            })
          }
        }
      }

      if (nro == 1) {
        habitaciones.habitacion1.length >= 25 ? res.status(400).send("No hay habitaciones disponibles para una persona") : agregarHabitacion("habitacion1")
      } else if (nro == 2) {
        habitaciones.habitacion2.length >= 15 ? res.status(400).send("No hay habitaciones disponibles para dos personas") : agregarHabitacion("habitacion2")
      } else if (nro == 4) {
        habitaciones.habitacion4.length >= 10 ? res.status(400).send("No hay habitaciones disponibles para cuatro personas") : agregarHabitacion("habitacion4")
      }
      
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
      let {nombre, edad, sexo, telefono, direccion} = req.body;

      if ( !nombre && !edad && !sexo && !telefono && !direccion) {
        res.status(400).send("Todos los campos están vacíos, debe modificar al menos un valor")
      } else {
        let updateUser = {
          nombre,
          edad,
          sexo,
          telefono,
          direccion
        }
        
        usuario.filter(user => {
          if(user.id == id_param) {
            if(updateUser.nombre) {
              /^[A-Za-zñÑáéíóúÁÉÍÓÚüÜ\s]+$/g.test(updateUser.nombre) ? user.nombre = updateUser.nombre : res.status(400).send('Nombre Invalido')
            }

            if(updateUser.edad) {
              isNaN(updateUser.edad) === false && updateUser.edad < 90 ? user.edad = updateUser.edad : res.status(400).send('Edad Invalida')
            }

            if(updateUser.sexo) {
              updateUser.sexo.toLowerCase() == "masculino" || updateUser.sexo.toLowerCase() == "femenino" ? user.sexo = updateUser.sexo : res.status(400).send('Sexo Invalido')
            }

            if(updateUser.telefono) {
              isNaN(updateUser.telefono) === false && updateUser.telefono.length < 15 ? user.telefono = updateUser.telefono : res.status(400).send('Telefono Invalido')
            }

            if(updateUser.direccion) {
              /^[A-Za-zñÑáéíóúÁÉÍÓÚüÜ]+$/g.test(updateUser.direccion) ? user.direccion = updateUser.direccion : res.status(400).send('Direccion Invalida')
            }
          }
        })
        
        let json_usuario = JSON.stringify(usuario)
        fs.writeFileSync('inquilinos.json', json_usuario, 'utf-8')
        res.status(200).send('Inquilino actualizado')
      }
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
          usuario.filter(user => {
            if(user.id == id) {
              habitacion[hab].forEach((room) => {
                if (room.id == id_param) {
                  room.id = updateHabitacion.id
                  let json_habitaciones = JSON.stringify(habitacion)
                  fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
                  res.status(200).send("Habitación actualizada")
                }
              })
            }
          })
          res.status(400).send('Ingrese ID Valido')
        }
      }
      res.status(400).send('Habitacion no existe')
    } else { res.status(400).send("ID no existe") }
  } catch (error) {
    res.status(500).json({
      descripcion: "Error interno del servidor",
      error: error.message
    })
  }
})

router.delete('/inquilinos/delete/:id', (req, res) => {
  try {
    let id_user = req.params.id
    if (id_user) {
      usuario = usuario.filter(user => user.id != id_user)
      let json_usuario = JSON.stringify(usuario)
      fs.writeFileSync('inquilinos.json', json_usuario, 'utf-8')

      for (let habi in habitacion) {
        habitacion[habi] = habitacion[habi].filter(user => user.id !== id_user)
      }
      
      let json_habitaciones = JSON.stringify(habitacion)
      fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
      
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
      usuario.forEach(user => {
        if (user.id == id) {
          for (let habi in habitacion) {
            habitacion[habi] = habitacion[habi].filter(user => user.id !== id)
            let json_habitaciones = JSON.stringify(habitacion)
            fs.writeFileSync('habitaciones.json', json_habitaciones, 'utf-8')
            res.status(200).send('Inquilino fuera de la habitación')
          }
        } else {
          res.status(400).send("ID es invalido")
        }
      });
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
