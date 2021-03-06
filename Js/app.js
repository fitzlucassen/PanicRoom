var LastCoords = [];
var OtherCoords = [];

$(document).ready(function() {
    var Helper = new HelperController();
    var Coords = new CoordsProvider();
    var ErrView = new ErrorView(Helper);
    var DOM = new DOMView(Helper);
    var View = new MainView(Helper, DOM, Coords);
    var Client = new ClientController(View, DOM, Helper);
    var CaseEffect = new CaseEffectController(Client);

    View.setCaseEffect(CaseEffect);
    Client.initialize();

    // Toggle du menu
    $('body').on('click', '.toggle', function(){
        if($(this).parent().outerWidth() > 1){
            $(this).parent().animate({width: '0px'}, 500);
            $(this).parent().children('*').addClass('hiddencontent');
            $('.toggle').removeClass('hiddencontent');
        }
        else{
            $(this).parent().animate({width: '200px'}, 500);
            $(this).parent().children('*').removeClass('hiddencontent');
        }
    });

    // RollHover d'un personnage (animation)
    $('body').on('mouseover', '.personnage li', function() {
        $this = $(this);
        $('.personnage li').each(function() {
            if ($this[0] != $(this)[0]) {
                $(this).stop().animate({
                    'opacity': '0.6'
                }, 200);
            }
        });
    }).on('mouseleave', '.personnage li', function() {
        $('.personnage li').stop().animate({
            'opacity': '1'
        }, 200);
    });

    // Vérification login + envoi de l'évènement nouveau joueur
    $('body').on('click', '#getMyName', function() {
        var patt = /[a-zA-Z\-\'\ ]+/;
        var name = $('#newName').val();

        if (!patt.test(name)) {
            ErrView.manageLoginError();
            return false;
        }

        $('#popin-grayback').fadeOut('slow');
        Client.newUser(name);
    });

    // Clique sur un personnage. On émet l'évènement
    $('body').on('click', 'ul.personnage li, .characterTaken', function(e) {
        e.stopPropagation();

        // Si ce personnage n'a pas été déjà prit
        if (!$(this).hasClass('characterTaken')) {
            var idU = Helper.GetCurrentID();
            var characterNameU = $(this).children('span').text();
            var colorU = $(this).data('color');

            // On supprime son ancien choix s'il y en avait un
            $('.characterTaken-' + idU).remove();
            Client.characterChoosen(characterNameU, idU, colorU);
        }
    });

    // Au clique sur le bouton, on lance le jeu
    $('body').on('click', '.btn', function(e) {
        Client.play();
    });

    // Au clique sur une action on la met en avant
    $('body').on('click', '.action', function(e) {
        // Si l'utilisateur n'a pas déjà selectionné ses 2 actions
        // Ou si le clique est en fait l'annulation d'une action
        if ($('.action.ok').length < 2 || $(this).hasClass('ok')) {
            // On fait l'animation de l'action
            View.animateAction($(this), !$(this).hasClass('ok'));

            // Et s'il y a au moins une action de validé on montre le bouton de validation
            // Sinon on le cache
            if ($('.action.ok').length > 0)
                DOM.showButtonOk();
            else
                DOM.hideButtonOk();
        }
    });

    // Au clique sur une action choisie on la remet en possibilité
    $('body').on('click', '.action1-final > img, .action2-final > img', function() {
        // On replace l'action dans les possibilités
        View.animateAction($(this), false);

        // Et s'il y a au moins une action de validé on montre le bouton de validation
        // Sinon on le cache
        if ($('.action.ok').length > 0)
            DOM.showButtonOk();
        else
            DOM.hideButtonOk();
    });

    // Au clique sur le bouton validation des actions on les valide
    $('body').on('click', '.btnOk', function(e) {
        // On fait disparaitre les actions du DOM
        DOM.disableActions();

        var idU = Helper.GetCurrentID();
        var action1 = $('.actionOk-1').children('img').attr('alt');
        var action2 = $('.actionOk-2').length > 0 ? action2 = $('.actionOk-2').children('img').attr('alt') : '';
        
        Client.validateAction(idU, action1, action2);
    });

    // Au clique sur une case proposée
    $('body').on('click', '.tuile .selectMe, .character .characterSelectMe', function(){
        Client.emitAction($(this));
    });

    $('body').on('click', '.tuile .selectMeToken', function(){
        var color = $(this).css('background-color');
        var positions = $(this).parent().data('position');

        $('.selectMeToken').remove();
        Client.emitToken(color, positions);
    });

    // Au clique sur une direction
    $('body').on('click', 'span.direction', function(){
        var element = $(this);
        var action = 'Contrôller';
        var sens = element.removeClass('direction').attr('class');
        var position = element.parent().attr('data-position');
        element.addClass('direction');

        Client.emitComplexAction({
            element: element,
            action: action,
            sens: sens,
            position: position
        });

        return false;
    });

    $('body').on('click', '.putAToken', function(){
        if(!$(this).hasClass('hideToken')){
            View.appendSelectToken();
            $(this).addClass('hideToken');
        }
    });
});
