// Initialisation
var express = require('express'),
    http = require('http');

var app = express();
var server = http.createServer(app).listen(1337);

var io = require('socket.io').listen(server);
// End

// Tous les utilisateurs
var users = [];
var nbUser = -1;

// La classe user
var User = function(name) {
    this.id = 0;
    this.name = name;
    this.position = {
        x: 2,
        y: 2
    };
    this.character = '';
};

// Au chargement de la page
io.sockets.on('connection', function(socket) {
    console.log('Nouvel utilisateur');
    var me = false;

    // Quand un utilisateur a choisi un pseudo
    socket.on('readyToPlay', function(name) {
        // ON instancie un nouveau user avec le pseudo
        me = new User(name.name);
        // On incrémente son id
        me.id = ++nbUser;
        // On l'ajoute au tableau des user
        users[me.id] = me;

        // Et on emet le signal pour la personne qui vient de se connecter qu'on l'a bien enregistré
        socket.emit('connectedUser', {
            me: me,
            users: users
        });

        console.log('Le visiteur ' + me.id + ' : ' + me.name + ' s\'est connecté');
    });

    // Quand un utilisateur à choisi un personnage
    socket.on('characterChoosen', function(object) {
        // On ajoute le nom du personnage choisi à l'utilisateur actuel
        me.character = object.name;

        console.log('L\'utilisateur ' + me.id + ' : ' + me.name + ' a choisi le personnage ' + object.name);

        // Et on émet à tous les autres utilisateurs le signal qu'un personnage a été prit
        io.sockets.emit('newCharacter', {
            id: object.id,
            name: object.name,
            pseudo: me.name
        });
    });

    // QUand un utilisateur se deconnecte
    socket.on('disconnect', function() {
        if (!me) {
            return false;
        }

        console.log(me.id + ' : ' + me.name + ' s\'est déconnecté');

        // On supprime l'utilisateur du tableau
        delete users[me.id];
        users.splice(me.id, 1);

        // Et on émet à tous les autres joueurs qu'un utilisateur s'est deconnecté
        io.sockets.emit('disconnectedUser', me);
    });
});

exports = module.exports = server;
// delegates use() function
exports.use = function() {
    app.use.apply(app, arguments);
};

function idInArray(array, id) {
    for (var a in array) {
        if (array[a] == id || a == id)
            return true;
    }
    return false;
}

function debugArray(array) {
    for (var a in array) {
        console.log(a + ' -> ' + array[a]);
    }
}