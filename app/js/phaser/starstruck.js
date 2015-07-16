
angular.element(document.body).scope().launch_phaser_starstruck = function (survey_question, survey_options) {
    $('#phaser-starstruck').html(' ');
    window.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-starstruck', { preload: preload, create: create, update: update, render: render });

    function preload() {

        game.load.tilemap('level1', 'js/phaser/assets/games/starstruck/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles-1', 'js/phaser/assets/games/starstruck/tiles-1.png');
        game.load.spritesheet('dude', 'js/phaser/assets/games/starstruck/dude.png', 32, 48);
        game.load.spritesheet('droid', 'js/phaser/assets/games/starstruck/droid.png', 32, 32);
        game.load.image('starSmall', 'js/phaser/assets/games/starstruck/star.png');
        game.load.image('starBig', 'js/phaser/assets/games/starstruck/star2.png');
        game.load.image('background', 'js/phaser/assets/games/starstruck/background2.png');

    }

    var map;
    var tileset;
    var layer;
    var player;
    var facing = 'left';
    var jumpTimer = 0;
    var cursors;
    var jumpButton;
    var bg;
    var survey_answers = [];

    function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.stage.backgroundColor = '#000000';

        bg = game.add.tileSprite(0, 0, 800, 600, 'background');
        bg.fixedToCamera = true;

        map = game.add.tilemap('level1');

        map.addTilesetImage('tiles-1');

        map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

        layer = map.createLayer('Tile Layer 1');

        //  Un-comment this on to see the collision tiles
        // layer.debug = true;

        layer.resizeWorld();

        game.physics.arcade.gravity.y = 250;

        player = game.add.sprite(32, 32, 'dude');
        game.physics.enable(player, Phaser.Physics.ARCADE);

        player.body.bounce.y = 0.2;
        player.body.collideWorldBounds = true;
        player.body.setSize(20, 32, 5, 16);

        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('turn', [4], 20, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        game.add.text(10, 10, survey_question, { font: '28px Arial', fill: '#fff' });
        for (var i = 0; i < survey_options.length; i++) {
            var posx = Math.floor((Math.random() * game.world.width) + 1);
            var posy = Math.floor((Math.random() * game.world.height) + 1);
            survey_answers.push(game.add.text(posx, posy, survey_options[i].choice_name, { font: '20px Arial', fill: '#fff' }));
        }

        game.camera.follow(player);

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    }

    function update() {

        game.physics.arcade.collide(player, layer);

        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;

            if (facing != 'left')
            {
                player.animations.play('left');
                facing = 'left';
            }
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;

            if (facing != 'right')
            {
                player.animations.play('right');
                facing = 'right';
            }
        }
        else
        {
            if (facing != 'idle')
            {
                player.animations.stop();

                if (facing == 'left')
                {
                    player.frame = 0;
                }
                else
                {
                    player.frame = 5;
                }

                facing = 'idle';
            }
        }
        
        if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
        {
            player.body.velocity.y = -250;
            jumpTimer = game.time.now + 750;
        }
        
        //  Run collision
            game.physics.arcade.overlap(collisionHandler, null, this);
    }

    function render () {

        // game.debug.text(game.time.physicsElapsed, 32, 32);
        // game.debug.body(player);
        // game.debug.bodyInfo(player, 16, 24);

    }
    
    function collisionHandler () {

        

    }
}

function launch_phaser_editor (plateforms) {
    $('#phaser-starstruck').html(' ');
    window.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-starstruck', { preload: preload, create: create, update: update, render: render });

    function preload() {
        game.load.spritesheet('pl1', 'img/game/arrivee.png');
        game.load.spritesheet('pl2', 'img/game/nuage.png');
        game.load.spritesheet('pl3', 'img/game/plateforme2.png');
        game.load.spritesheet('pl4', 'img/game/plateforme3.png');

        game.load.spritesheet('dude', 'js/phaser/assets/games/starstruck/dude.png', 32, 48);
        game.load.image('background', 'img/game/fond.png');
    }

    var map;
    var tileset;
    var layer;
    var player;
    var facing = 'left';
    var jumpTimer = 0;
    var cursors;
    var jumpButton;
    var bg;

    function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.stage.backgroundColor = '#000000';

        bg = game.add.tileSprite(0, 0, 800, 600, 'background');
        bg.fixedToCamera = true;

        game.platforms = game.add.physicsGroup();

        plateforms.forEach(function(pl) {
            if (pl.img.src.includes('img/game/arrivee.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl1');
                newPlat.body.velocity.x = 0;
            }
            if (pl.img.src.includes('img/game/nuage.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl2');
                newPlat.body.velocity.x = 100;
            }
            if (pl.img.src.includes('img/game/plateforme2.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl3');
                newPlat.body.velocity.x = 0;
            }
            if (pl.img.src.includes('img/game/plateforme3.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl4');
                newPlat.body.velocity.x = 0;
            }
        });

        game.platforms.setAll('body.allowGravity', false);
        game.platforms.setAll('body.immovable', true);

        game.physics.arcade.gravity.y = 800;

        player = game.add.sprite(32, 550, 'dude');
        game.physics.enable(player, Phaser.Physics.ARCADE);

        player.body.bounce.y = 0;
        player.body.collideWorldBounds = true;
        player.body.setSize(20, 32, 5, 16);

        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('turn', [4], 20, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        game.camera.follow(player);

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }

    function wrapPlatform (platform) {
        if (platform.body.velocity.x > 0 && platform.x >= 800)
        {
            platform.x = -160;
        }
    }

    function update() {
        game.physics.arcade.collide(player, layer);
        game.platforms.forEach(wrapPlatform);
        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;

            if (facing != 'left')
            {
                player.animations.play('left');
                facing = 'left';
            }
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;

            if (facing != 'right')
            {
                player.animations.play('right');
                facing = 'right';
            }
        }
        else
        {
            if (facing != 'idle')
            {
                player.animations.stop();

                if (facing == 'left')
                {
                    player.frame = 0;
                }
                else
                {
                    player.frame = 5;
                }

                facing = 'idle';
            }
        }
        
        //  Run collision
        this.physics.arcade.collide(player, game.platforms, null, null, game);
        var standing = player.body.blocked.down || player.body.touching.down;

        if (jumpButton.isDown && standing && game.time.now > jumpTimer)
        {
            player.body.velocity.y = -500;
            jumpTimer = game.time.now + 750;
        }
    }

    function render () {

    }
    
    function collisionHandler () {
        
    }
}
