const Sequelize = require('sequelize');

const {models} = require('./model');

const {log, biglog, errorlog, colorize} = require("./out");



/**
 * Muestra la ayuda
 */
exports.helpCmd = rl => {
    log("Comandos");
    log("   h|help - Muestra esta ayuda");
    log("   list - Listar los quizzes existentes");
    log("   show <id> - Muestra la pregunta y la respuesta el quiz indicado ");
    log("   add - Añadir un nuevo quiz interactivamente");
    log("   delete <id> - Borrar el quiz indicado.");
    log("   edit <id> - Editar el quiz indicado ");
    log("   test <id> - Probar el quiz indicado ");
    log("   p|play - Jugar a preguntar aleatoriamente todos los quizzes. ");
    log("   credits - Créditos. ");
    log("   q|quit - Salir del programa");
    rl.prompt();
};
/**
 * Lista todos los quizzas existentes en el modelo.
 */
exports.listCmd = rl => {

    models.quiz.findAll()
        .each(quiz => {
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


/**
 * Esta función devuelve una promesa que cuando se cumple, proporciona el texto introducido
 * Entonces la llamada a then que hay que hacer la promesa devuelta sera
 *  .then(answer => {...})
 *
 * También colorea en rojo el texto de la pregunta, elimina espacios al principio y final
 *
 * @param rl Objeto readline usado parai mplementar el CLI.
 * @param text Pregunta que hay que hacerle al usuario.
 */
const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};



/**
 * Añade un nuevo quiz al modélo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 *
 */
exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca la respuesta ')
        .then(q => {
            return makeQuestion(rl, 'Introduzca la respuesta ')
                .then(a => {
                    return { question: q, answer: a };
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then(quiz => {
            log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({ message }) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


/**
 * Esta función devuelve una promesa que:
 *  -Valida que se ha introducido un valor para el parametro.
 *  -  Convierte el parametro en un numero entero.
 * Sit todova bien, la promesa se satisface y devuelve el valor de la id a usar
 *
 * @param id Parametro con el índice a validar.
 */

const validateId = id => {
    return new Sequelize.Promise((resolve, reject) => {
        if (typeof id === "undefined") {
            reject(new Error(`Falta el parametro <id>.`));
        } else {
            id = parseInt(id); //coger la parte entera y descartar lo demas
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es un número`));
            } else {
                resolve(id);
            }
        }
    });
};

/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta
 *
 * @param id Clave del quiz a mostrar
 */
exports.showCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.fingById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}`);
            }
            log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};
/**
 * Edita un quiz del modelo.
 *
 * Hay qeu recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id)
        )
        .
        then(quiz => {
            if (
                !quiz
            ) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }

            process.stdout.isTTY && setTimeout(() => {
                rl.write(quiz.question)
            },
                0
            )
                ;
            return makeQuestion(rl, ' Introduzca la pregunta: ')
                .then(q => {
                    process.stdout.isTTY && setTimeout(() => {
                        rl.write
                        {
                            quiz.answer
                        }
                    },
                        0
                    )
                        ;
                    return makeQuestion(rl, ' Introduzca la respuesta ')
                        .then(a => {
                            quiz.question = g;
                            quiz.answer = a;
                            return quiz;
                        })
                        ;
                })
                ;
        })
        .
        then(quiz => {
            return quiz.save();
        })
        .
        then(quiz => {
            log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`
            )
                ;
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({ message }) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};
/**
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param id Clave del quiz a probar
 */
exports.testCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then (quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            return makeQuestion(rl, `${quiz.question}? `)
                .then(a => {
                    ans1 = (a || "").trim();
                    ans = ans1.toLowerCase();
                    console.log(ans);
                    if (ans=== quiz.answer.toLowerCase()) {
                        log("Su respuesta es correcta.");
                        biglog('Correcta', 'green');
                    } else {
                        console.log("Su respuesta es incorrecta.");
                    }

                    rl.prompt();
                });
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then (() => {
            rl.prompt();
        });
};
/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */

exports.deleteCmd = (rl, id) => {
    validateId(id)
        .then(id => models.quiz.destroy({ where: { id } }))
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};
/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio
 * Se gana si se contesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {
    let score = 0;
    let toBeResolved=[];
    let respondidas = [];
    models.quiz.findAll()
    .each(quiz => {
        respondidas.push(quiz);
    })
    .then (() => {
        for (let i = 0; i < respondidas.length; i++) {
            toBeResolved.push(i);
        }
    const playOne = () => {
        if (toBeResolved.length === 0){
            log(`No hay nada más que preguntar`);
            log(`Fin del examen. Aciertos: `);
            biglog(`Puntuación ${colorize(score, 'red')}`);
            rl.prompt();
        } else {
            try {
                let id = Math.floor(Math.random() * toBeResolved.length); //quitarla del array Math.random()
                let quiz = respondidas[toBeResolved[id]]; //sacamos la pregunta asociada a ese id
                toBeResolved.splice(id,1);
                return makeQuestion(rl, `${quiz.question}? `)
                .then(answer =>{
                    if (answer.toLowerCase().trim()=== quiz.answer.toLowerCase()){
                        score++;
                        log(`CORRECTA - Lleva   ${score}  aciertos`);
                        log(`Puntuación ${colorize(score, 'green')}`);

                        playOne();
                    } else {
                        log("INCORRECTA");
                        log("Fin del examen. Aciertos:");
                        biglog(score, 'magenta');
                        rl.prompt();
                    }
                });
            }
            catch (error){
                errorlog(error.message);
                rl.prompt();
            }
        }
    };
    playOne()
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then (() => {
        rl.prompt();
    });
};

/**
 * Muestra los nombres de los autores de la práctica
 */
exports.creditsCmd = rl => {
    log('Autores de la práctica: ');
    log('Jorge Ruiz Calle ', 'green');
    log('Francisco Coll Rueda ', 'green');
    rl.prompt();
};
/**
 * Muestra los nombres de los autores de la práctica
 */
exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
};
