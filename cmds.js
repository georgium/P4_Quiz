const model = require('./model');

const { log, biglog, errorlog, colorize } = require("./out");



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

    model.getAll().forEach((quiz, id) => {

        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    });

    rl.prompt();
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
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
};
/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta
 *
 * @param id Clave del quiz a mostrar
 */
exports.showCmd = (rl, id) => {

    if (typeof id == "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch (error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
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
    if (typeof id == "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => { rl.write(quiz.question) }, 0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => { rl.write(quiz.answer) }, 0);

                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id, 'magenta')}:  por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
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
    if (typeof id == "undefined") {
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {
                rl.write()
            }, 0);
            rl.question(colorize(quiz.question, 'red'), answer => {
                if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    log("Su respuesta es correcta.");
                    biglog('CORRECTA', 'green');
                    rl.prompt();
                } else {
                    log("Su respuesta es incorrecta.");
                    biglog('INCORRECTA', 'red');
                    rl.prompt();
                }
            });

        } catch
            (error) {
            errorlog(error.message);
            rl.prompt();
        }

    }
}
;
/**
 * Borra un quiz del modelo.
 *
 * @param id Clave del quiz a borrar en el modelo.
 */

exports.deleteCmd = (rl, id) => {
    if (typeof id == "undefined") {
        errorlog(`Falta el parámetro id.`);
    } else {
        try {
            model.deleteByIndex(id);
        } catch (error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};
/**
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio
 * Se gana si se contesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {
    let score = 0; //Mantiene aciertos
    let toBeResolved = [];
    //array que guarda id de todas las preguntas que existen
    //for (var i = 1; i < model.count(); i++) {
    let num = 0;
    for (let i = 0; i < model.count(); i++){
        toBeResolved[i]=i;

    };

    //mete todos los id


    const playOne = () => {
        //ninguna pregunta por resolver
        if (toBeResolved.length === 0) {
            log(`No hay nada más que preguntar`);
            log(`Fin del examen. Aciertos: `);
            biglog(`Puntuación ${colorize(score, 'red')}`);
            rl.prompt();
        } else {
            try {            //coge una pregunta la azar
                let id = Math.floor(Math.random() * toBeResolved.length); //quitarla del array Math.random()
                let quiz = model.getByIndex(toBeResolved[id]); //sacamos la pregunta asociada a ese id
                //model.deleteByIndex(id);
                toBeResolved.splice(id,1);
                rl.question(colorize(quiz.question, 'red'), answer => {
                    if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                        score++;
                        log(`CORRECTA - Lleva   ${score}  aciertos`);
                        //log(`Puntuación ${colorize(score, 'green')}`);

                        playOne();

                    }
                    else {
                        log("INCORRECTA");
                        log("Fin del examen. Aciertos:");
                        biglog(score, 'magenta');
                        rl.prompt();
                    }
                });
            } catch (error){
                errorlog(error.message);
                rl.prompt();
            }
        }
    };
    playOne();
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
