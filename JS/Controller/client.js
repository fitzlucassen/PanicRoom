function ClientController(view, helper) {
    this.socket = {};
    this.view = view;

    this.Helper = helper;
}

ClientController.prototype.initialize = function() {
    this.socket = io.connect('http://localhost:1337');

    that = this;

    // Lorsqu'un utilisateur s'est connecté
    this.socket.on('connectedUser', function(object) {
        that.view.appendUserID(object.me);
        that.view.refreshUsers(object.users);
    });
    // Lorsqu'un utilisateur s'est deconnecté
    this.socket.on('disconnectedUser', function(user) {
        that.view.deleteUser(user);
    });
    // Lorsqu'un utilisateur a choisi un personnage
    this.socket.on('newCharacter', function(object) {
        that.view.deleteCharacter(object.id, object.name, object.pseudo);
    });
    // Supprime le bouton si tout le monde n'est pas prêt (personnage)
    this.socket.on('cantPlay', function() {
        that.view.deleteButton();
    });
    // On fait apparaître le bouton si tout le monde est prêt (personnage)
    this.socket.on('letsPlay', function() {
        that.view.showButton();
    });
    // Si tout le monde est ok (actions)
    this.socket.on('everyoneIsOk', function(users) {
        that.view.hideActions();
        var u = {};

        for (var a in users) {
            if (users.hasOwnProperty(a)) {
                if (users[a].order == 1){
                    u = users[a];
                    break;
                }
            }
        }
        that.view.appendTurnOf(u, users, 1);
        if($('.selectMe').length === 0 && $('.characterSelectMe').length === 0 && u.id == $('.userID').val()){
            that.socket.emit('noPossibilities', {user: u});
        }
    });

    // Si on a reçu le signal de jeu
    this.socket.on('play', function(object) {
        LastCoords = object.lastCardsCoords;
        OtherCoords = object.otherCoords;

        that.view.redirectToGame(object);
    });

    // On affiche la deuxieme partie de l'action
    this.socket.on('doNextSentence', function(object){
        that.view.nextSentence({
            user: object.user,
            action: object.action,
            idTarget: object.idTarget
        });
    });

    // On affiche la deuxieme partie de l'action
    this.socket.on('doNextSentenceController', function(object){
        that.view.nextSentence({
            user: object.user,
            action: object.action,
            coords: object.coords
        });
    });

    // On effectue un déplacement
    this.socket.on('playerDeplacer', function(object){
        that.view.deplacer(object.user);
    });
    // On effectue l'action pousser
    this.socket.on('playerPousser', function(object){
        that.view.pousser(object.user);
    });
    // On regarde
    this.socket.on('playerRegarder', function(object){
        that.view.regarder(object.user.id, object.coords);
    });
    // On controlle
    this.socket.on('playerController', function(object){
        that.view.controller(object.users, object.coords, object.sens);
    });

    // On passe au joueur suivant
    this.socket.on('nextPlayer', function(object){
        that.view.hideActions();

        that.view.appendTurnOf(object.user, object.users, 1);
        if($('.selectMe').length === 0 && $('.characterSelectMe').length === 0 && object.user.id == $('.userID').val()){
            that.socket.emit('noPossibilities', object);
        }
    });
    // On passe au joueur suivant pour l'action 2
    this.socket.on('nextPlayer2', function(object){
        that.view.hideActions();

        that.view.appendTurnOf(object.user, object.users, 2);
        if($('.selectMe').length === 0 && $('.characterSelectMe').length === 0 && object.user.id == $('.userID').val()){
            that.socket.emit('noPossibilities', object);
        }
    });
    // On passe au tour suivant
    this.socket.on('nextTurn', function(object){
        that.view.nextTurn(object);
    });
    this.socket.on('gardienWins', function(){
        that.view.gardienWins();
    });
    this.socket.on('userCentral', function(user){
        that.view.deplacer(user);
    });
};

// Nouvel utilisateur avec un pseudo
ClientController.prototype.newUser = function(name) {
    this.socket.emit('readyToPlay', {
        name: name
    });
};

// Actions choisies
ClientController.prototype.validateAction = function(id, action1, action2) {
    this.socket.emit('playerReady', {
        id: id,
        action1: action1,
        action2: action2
    });
};

// Personnage choisi
ClientController.prototype.characterChoosen = function(name, id) {
    this.socket.emit('characterChoosen', {
        name: name,
        id: id
    });
};

// Clique sur le bouton "jouer"
ClientController.prototype.play = function() {
    this.socket.emit('emitPlay');
};

// effectue l'action du joueur
ClientController.prototype.emitAction = function(element){
    var action = element.attr('data-action');
    var that = this;

    if(action === 'Déplacer' || action === 'Regarder'){
        this.socket.emit('doAction', {
            id: that.Helper.GetCurrentID(),
            action: action,
            coords: element.parent().attr('data-position')
        });
        $('.selectMe').remove();
    }
    else if(action === 'Contrôller') {
        var that = this;

        this.socket.emit('getUserAndDoNextSentenceController', {
            id: that.Helper.GetCurrentID(),
            action: action,
            coords: element.parent().attr('data-position')
        });
    }
    else if(action === 'Pousser' && element.parent().hasClass('character')){
        var idTarget = element.parent().removeClass('character').attr('class').split('-')[1];
        var that = this;
        element.parent().addClass('character');

        this.socket.emit('getUserAndDoNextSentence', {
            id: that.Helper.GetCurrentID(),
            action: action,
            idTarget: idTarget
        });
    }
    else if(action === 'regarderMaster'){
        this.view.regarder(that.Helper.GetCurrentID(), element.parent().attr('data-position'));
        $('.selectMe').remove();
    }
    else {
        var that = this;
        this.socket.emit('doAction', {
            id: that.Helper.GetCurrentID(),
            action: action,
            coords: element.parent().attr('data-position'),
            idTarget: $('.characterSelectMe').parent().removeClass('character').attr('class').split('-')[1]
        });
        $('.characterSelectMe').parent().addClass('character');
        $('.selectMe').remove();
        $('.characterSelectMe').remove();
    }
};

// effectue l'action du joueur
ClientController.prototype.emitComplexAction = function(object){
    var that = this;

    this.socket.emit('doAction', {
        id: that.Helper.GetCurrentID(),
        action: object.action,
        sens: object.sens,
        coords: object.position
    });

    $('.selectMe').remove();
    $('.sensArrows').remove();
};

ClientController.prototype.emitDeath = function(user) {
    this.socket.emit('killUser', user);
};
ClientController.prototype.emitGoToCentral = function(user) {
    this.socket.emit('goToCentral', user);
};
ClientController.prototype.takeALook = function(user) {
    this.view.regarder(user.id);
};