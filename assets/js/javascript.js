//==================== Global Variables ====================//
$(document).ready(function() {

    //====================== Audio Files =======================//
    let victory = new Audio('assets/audio/victory.mp3');
    let lost = new Audio('assets/audio/lost.wav');
    let defeatEnemy = new Audio('assets/audio/defeatenemy.wav');
    let win = new Audio('assets/audio/win.wav');
    let attack = new Audio('assets/audio/attack2.wav');
    let thatsRetarded = new Audio('assets/audio/thatsretarded.wav');
    //==================== End Audio Files =====================//

    //================== Playable Characters ===================//
    let characters = {
        'rickSanchez': {
            name: 'rick sanchez',
            health: 120,
            attack: 8,
            imageUrl: "assets/images/RickSanchez.png",
            enemyAttackBack: 15
        },
        'flargo': {
            name: 'flargo',
            health: 100,
            attack: 14,
            imageUrl: "assets/images/Flargo.png",
            enemyAttackBack: 5
        },
        'scaryTerry': {
            name: 'scary terry',
            health: 150,
            attack: 8,
            imageUrl: "assets/images/ScaryTerry.png",
            enemyAttackBack: 20
        },
        'testicleMonster': {
            name: 'testicle monster',
            health: 180,
            attack: 7,
            imageUrl: "assets/images/TesticleMonster.png",
            enemyAttackBack: 20
        }
    };
    //================ End Playable Characters =================//

    var currSelectedCharacter;
    var currDefender;
    var combatants = [];
    var indexofSelChar;
    var attackResult;
    var turnCounter = 1;
    var killCount = 0;


    var renderOne = function(character, renderArea, makeChar) {
        //character: obj, renderArea: class/id, makeChar: string
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);

        //=================== Conditional Render ===================//
        if (makeChar == 'enemy') {
            $(charDiv).addClass('enemy');
        } else if (makeChar == 'defender') {
            currDefender = character;
            $(charDiv).addClass('target-enemy');
        }
        //================= End Conditional Render =================//
    };

    //================== Game Message Render ===================//
    var renderMessage = function(message) {
        var gameMesageSet = $("#gameMessage");
        var newMessage = $("<div>").text(message);
        gameMesageSet.append(newMessage);

        if (message == 'clearMessage') {
            gameMesageSet.text('');
        }
    };
    //================ End Game Message Render =================//

    //=================== Characters Render ====================//
    var renderCharacters = function(charObj, areaRender) {
        //render all characters
        if (areaRender == '#characters-section') {
            $(areaRender).empty();
            for (var key in charObj) {
                if (charObj.hasOwnProperty(key)) {
                    renderOne(charObj[key], areaRender, '');
                }
            }
        }
        //============== Chosen Character Render ===============//
        if (areaRender == '#selected-character') {
            $('#selected-character').prepend("Your Character");
            renderOne(charObj, areaRender, '');
            $('#attack-button').css('visibility', 'visible');
        }
        //============ End Chosen Character Render =============//

        //============== Enemy Character Render ================//
        if (areaRender == '#available-to-attack-section') {
            $('#available-to-attack-section').prepend("Pick the next asshole to fight!");
            for (var i = 0; i < charObj.length; i++) {
                renderOne(charObj[i], areaRender, 'enemy');
            }
            $(document).on('click', '.enemy', function() {
                name = ($(this).data('name'));
                if ($('#defender').children().length === 0) {
                    renderCharacters(name, '#defender');
                    $(this).hide();
                    renderMessage("clearMessage");
                }
            });
        }
        //============= End Enemy Character Render ==============//

        //============= Defender Character Render ===============//
        if (areaRender == '#defender') {
            $(areaRender).empty();
            for (var i = 0; i < combatants.length; i++) {
                //add enemy to defender area
                if (combatants[i].name == charObj) {
                    $('#defender').append("The poor douchebag selected")
                    renderOne(combatants[i], areaRender, 'defender');
                }
            }
        }
        //============ End Defender Character Render ============//

        //============ If Defender Attacked Render ==============//
        if (areaRender == 'playerDamage') {
            $('#defender').empty();
            $('#defender').append("The poor douchebag selected")
            renderOne(charObj, '#defender', 'defender');
            attack.play();
        }
        //=========== End If Defender Attached Render ===========//

        //============== If Chosen Attacked Render ==============//
        if (areaRender == 'enemyDamage') {
            $('#selected-character').empty();
            renderOne(charObj, '#selected-character', '');
        }
        //============= End If Chosen Attack Render =============//

        //=============== Enemy Defeated Render =================//
        if (areaRender == 'enemyDefeated') {
            $('#defender').empty();
            var gameStateMessage = "You universe warped " + charObj.name + ", pick another douchebag to warp!";
            renderMessage(gameStateMessage);
            defeatEnemy.play();
        }
        //================ End Enemy Defeated ===================//
    };
    //================= End Characters Render ===================//

    //================= All Characters Render ===================//
    renderCharacters(characters, '#characters-section');
    $(document).on('click', '.character', function() {
        name = $(this).data('name');
        if (!currSelectedCharacter) {
            currSelectedCharacter = characters[name];
            for (var key in characters) {
                if (key != name) {
                    combatants.push(characters[key]);
                }
            }
            $("#characters-section").hide();
            renderCharacters(currSelectedCharacter, '#selected-character');
            renderCharacters(combatants, '#available-to-attack-section');
        }
    });
    //================ End All Characters Render ================//

    //===================== Action Enabler ======================//
    $("#attack-button").on("click", function() {
        if ($('#defender').children().length !== 0) {
            var attackMessage = "You zapped " + currDefender.name + " for " + (currSelectedCharacter.attack * turnCounter) + " damage!";
            renderMessage("clearMessage");
            currDefender.health = currDefender.health - (currSelectedCharacter.attack * turnCounter);

            //================ Winning Condition ================//
            if (currDefender.health > 0) {
                renderCharacters(currDefender, 'playerDamage');
                var counterAttackMessage = currDefender.name + " smacked you for " + currDefender.enemyAttackBack + " damage!";
                renderMessage(attackMessage);
                renderMessage(counterAttackMessage);

                currSelectedCharacter.health = currSelectedCharacter.health - currDefender.enemyAttackBack;
                renderCharacters(currSelectedCharacter, 'enemyDamage');
                if (currSelectedCharacter.health <= 0) {
                    renderMessage("clearMessage");
                    restartGame("You're a piece of shit. Yeah. I can prove it mathematically. Actually, let me grab my white board. This has been a long time coming!");
                    setTimeout(function() {
                        lost.play();
                    }, 1000)
                    $("#attack-button").unbind("click");
                }
            } else {
                renderCharacters(currDefender, 'enemyDefeated');
                killCount++;
                if (killCount >= 3) {
                    renderMessage("clearMessage");
                    restartGame("You kicked them in the nads! Way to go!!!");
                    setTimeout(function() {
                        win.play();
                    }, 2000);
                    setTimeout(function() {
                        victory.play();
                    }, 6000);
                }
            }
            turnCounter++;
        } else {
            renderMessage("clearMessage");
            renderMessage("Pick an enemy dumbass!");
            thatsRetarded.play();
        }
    });
    //=================== End Action Enabler ====================//

    //================== Game Restart Render ====================//
    var restartGame = function(inputEndGame) {
        var restart = $('<button class="btn">Restart</button>').click(function() {
            location.reload();
        });
        var gameState = $("<div>").text(inputEndGame);
        $("#gameMessage").append(gameState);
        $("#gameMessage").append(restart);
    };
    //================= End Game Restart Render =================//

});
//==================== End Global Variables =====================//