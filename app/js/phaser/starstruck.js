
angular.element(document.body).scope().launch_phaser_starstruck = function (survey_question, survey_options, question_div) {
    $('#phaser-starstruck').html(' ');
    window.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-starstruck', { preload: preload, create: create, update: update, render: render });

    var map_json = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 53, 53, 19, 19, 36, 19, 19, 37, 19, 36, 19, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 54, 57, 19, 19, 36, 36, 19, 20, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 19, 19, 37, 38, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 54, 19, 36, 19, 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 19, 19, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 19, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 20, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 19, 21, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 38, 21, 19, 50, 0, 49, 0, 0, 0, 49, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 48, 0, 0, 0, 49, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 53, 19, 19, 22, 67, 3, 66, 5, 2, 6, 66, 67, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 64, 65, 5, 2, 6, 66, 67, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 19, 39, 19, 19, 37, 19, 19, 36, 19, 22, 23, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 19, 37, 19, 19, 36, 19, 22, 23, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 52, 19, 19, 36, 19, 19, 21, 19, 19, 39, 40, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 19, 36, 19, 19, 38, 19, 19, 39, 40, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6, 19, 41, 0, 0, 0, 0, 0, 25, 53, 54, 53, 53, 55, 53, 54, 55, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 53, 54, 53, 53, 55, 53, 54, 55, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 57, 53, 60, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 6, 5, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 54, 55, 57, 58, 0, 0, 0, 0, 0, 0, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6, 19, 41, 0, 0, 0, 0, 0, 0, 0, 50, 8, 19, 6, 2, 3, 6, 7, 0, 0, 0, 0, 0, 0, 13, 14, 0, 0, 0, 0, 0, 0, 13, 14, 0, 0, 0, 0, 1, 34, 6, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 57, 53, 60, 0, 0, 0, 0, 0, 0, 1, 67, 19, 19, 36, 19, 22, 23, 24, 0, 0, 0, 0, 0, 1, 30, 31, 9, 0, 0, 0, 0, 1, 30, 31, 9, 0, 0, 0, 59, 55, 57, 60, 0, 0, 0, 0, 0, 0, 47, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 19, 19, 19, 19, 39, 40, 41, 0, 0, 0, 0, 0, 25, 19, 19, 26, 0, 0, 0, 0, 25, 19, 19, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 64, 65, 9, 0, 0, 0, 0, 0, 46, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 19, 19, 19, 20, 54, 55, 57, 60, 0, 0, 0, 0, 0, 59, 57, 53, 60, 0, 0, 0, 0, 59, 57, 53, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 56, 60, 0, 0, 0, 0, 1, 5, 19, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 57, 54, 53, 19, 19, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 53, 19, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 19, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 58, 0, 0, 0, 0, 14, 14, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 43, 0, 0, 0, 0, 0, 0, 47, 48, 0, 0, 0, 0, 0, 47, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 31, 31, 31, 9, 17, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 9, 0, 0, 0, 1, 4, 64, 65, 2, 3, 4, 5, 2, 64, 65, 3, 6, 7, 0, 1, 2, 2, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 19, 36, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 25, 19, 26, 0, 0, 0, 18, 19, 19, 19, 19, 19, 37, 19, 19, 36, 19, 22, 23, 24, 0, 18, 19, 19, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 6, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 19, 43, 0, 0, 0, 25, 19, 19, 19, 19, 36, 19, 19, 19, 19, 19, 39, 40, 41, 0, 18, 19, 19, 19, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 19, 41, 0, 0, 0, 42, 19, 19, 19, 53, 54, 53, 53, 55, 53, 54, 55, 57, 60, 0, 59, 56, 56, 56, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 6, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 43, 0, 0, 0, 18, 19, 19, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 19, 19, 19, 26, 0, 0, 0, 35, 19, 19, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 66, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 53, 54, 19, 37, 26, 0, 0, 0, 52, 56, 56, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 19, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 2, 30, 30, 31, 2, 6, 7, 0, 0, 13, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 57, 57, 58, 0, 0, 0, 0, 0, 0, 0, 0, 25, 19, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 20, 21, 22, 23, 19, 19, 19, 19, 19, 19, 19, 6, 3, 30, 4, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 41, 0, 49, 50, 51, 0, 47, 48, 0, 0, 0, 1, 36, 37, 38, 39, 40, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 19, 19, 3, 66, 67, 68, 2, 64, 65, 6, 2, 3, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 57, 57, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 19, 20, 19, 19, 19, 19, 19, 37, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 0, 0, 0, 0, 0, 0, 0, 1, 9, 0, 0, 0, 0, 18, 37, 19, 19, 19, 19, 19, 20, 19, 19, 38, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 30, 9, 0, 0, 0, 0, 0, 0, 0, 52, 58, 0, 0, 0, 0, 0, 1, 2, 19, 41, 0, 0, 0, 0, 35, 19, 19, 20, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 19, 19, 19, 19, 9, 13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 53, 56, 58, 0, 0, 0, 0, 18, 19, 38, 19, 19, 19, 19, 56, 56, 56, 19, 19, 19, 19, 56, 56, 56, 54, 56, 56, 53, 56, 56, 54, 56, 60, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 19, 19, 19, 19, 19, 19, 19, 9, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 19, 19, 19, 56, 56, 60, 0, 0, 0, 18, 19, 57, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 56, 60, 0, 0, 0, 0, 0, 0, 35, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 19, 19, 19, 19, 19, 56, 56, 56, 56, 56, 19, 3, 4, 4, 4, 5, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 43, 0, 0, 0, 0, 0, 0, 0, 0, 52, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 19, 19, 19, 19, 19, 19, 60, 0, 0, 0, 0, 0, 35, 19, 37, 38, 19, 19, 19, 41, 0, 0, 0, 0, 0, 1, 9, 0, 0, 0, 0, 0, 35, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 1, 4, 4, 4, 19, 22, 23, 19, 19, 19, 19, 56, 56, 60, 0, 0, 0, 0, 0, 0, 52, 55, 54, 53, 54, 57, 54, 58, 0, 0, 0, 0, 1, 19, 19, 9, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 30, 4, 4, 4, 19, 19, 19, 19, 19, 39, 40, 19, 19, 19, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 58, 0, 0, 0, 0, 1, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 59, 19, 19, 19, 19, 19, 56, 56, 53, 56, 56, 56, 56, 53, 56, 56, 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 56, 56, 56, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 42, 19, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 9, 0, 0, 0, 0, 0, 0, 1, 19, 19, 19, 9, 0, 0, 0, 0, 0, 0, 0, 1, 34, 19, 19, 19, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 19, 19, 24, 0, 0, 0, 0, 0, 1, 19, 19, 19, 19, 58, 0, 0, 0, 0, 0, 0, 1, 19, 19, 19, 19, 19, 41, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 5, 5, 6, 5, 2, 4, 5, 6, 4, 2, 6, 4, 7, 0, 0, 0, 0, 0, 0, 1, 5, 19, 19, 19, 41, 0, 0, 0, 0, 0, 52, 56, 56, 56, 58, 0, 0, 0, 0, 0, 0, 1, 19, 19, 19, 19, 21, 36, 19, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 57, 53, 53, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 24, 0, 0, 0, 0, 0, 0, 52, 19, 19, 19, 19, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 19, 19, 19, 36, 38, 19, 19, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 52, 57, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 5, 9, 0, 0, 0, 0, 0, 35, 19, 19, 19, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 19, 19, 19, 19, 19, 19, 41, 0, 0, 0, 0, 0, 1, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 19, 19, 19, 19, 19, 54, 53, 53, 54, 55, 55, 58, 0, 0, 0, 0, 0, 52, 56, 56, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 19, 21, 19, 19, 20, 37, 19, 19, 26, 0, 0, 0, 0, 0, 52, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 19, 54, 53, 53, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 19, 19, 20, 19, 19, 38, 19, 19, 19, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 47, 48, 0, 0, 35, 19, 19, 20, 36, 19, 19, 20, 19, 19, 19, 5, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 43, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 6, 7, 0, 0, 0, 1, 64, 7, 0, 1, 19, 19, 37, 22, 23, 37, 19, 19, 22, 19, 19, 19, 41, 0, 0, 0, 47, 48, 0, 47, 48, 0, 47, 48, 0, 1, 5, 19, 43, 0, 13, 14, 14, 13, 14, 14, 0, 0, 0, 0, 1, 5, 34, 9, 0, 0, 49, 49, 50, 0, 0, 1, 19, 19, 19, 19, 9, 0, 1, 19, 19, 19, 6, 19, 19, 38, 19, 39, 40, 19, 19, 19, 39, 19, 19, 19, 19, 5, 5, 5, 64, 65, 5, 64, 65, 5, 64, 65, 5, 19, 19, 19, 19, 2, 30, 31, 31, 30, 31, 31, 5, 2, 3, 2, 21, 22, 23, 19, 5, 5, 66, 66, 67, 5, 5, 19, 19, 19, 19, 19, 19, 6, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19];
    var wall_pos = [];

    for (var k = 0; k < map_json.length; k++) {
        if (map_json[k] > 0) {
            var i = Math.floor(k/64);
            var j = k % 64;
            wall_pos.push({x: j * 16, y: i * 16});
        }
    }

    console.log(wall_pos);

    function preload() {

        game.load.tilemap('level1', 'js/phaser/assets/games/starstruck/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles-1', 'js/phaser/assets/games/starstruck/tiles-1.png');
        game.load.spritesheet('dude', 'js/phaser/assets/games/starstruck/dude.png', 32, 48);
        game.load.spritesheet('droid', 'js/phaser/assets/games/starstruck/droid.png', 32, 32);
        game.load.image('starSmall', 'js/phaser/assets/games/starstruck/star.png');
        game.load.image('starBig', 'js/phaser/assets/games/starstruck/star2.png');
        game.load.image('background', 'js/phaser/assets/games/starstruck/background2.png');
        game.load.image('coin', 'js/phaser/assets/games/starstruck/coin.png');

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
    var survey_answers;
    var score = 0;
    var score_text;
    var answers_hit = [];
    var game_coins;
    var coins_hit = [];

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
        console.log(map);
        console.log(layer);

        game.physics.arcade.gravity.y = 250;

        player = game.add.sprite(32, 32, 'dude');
        game.physics.enable(player, Phaser.Physics.ARCADE);

        player.body.bounce.y = 0.2;
        player.body.collideWorldBounds = true;
        player.body.setSize(20, 32, 5, 16);

        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('turn', [4], 20, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
        
        stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;
        game.add.text(10, 10, survey_question, { font: '28px Arial', fill: '#fff' });
        score_text = game.add.text(650, 10, 'Score: ' + score, { font: '28px Arial', fill: '#fff'});
        score_text.fixedToCamera = true;
        /*for (var i = 0; i < survey_options.length; i++) {
            var posx = Math.floor((Math.random() * game.world.width) + 1);
            var posy = Math.floor((Math.random() * game.world.height) + 1);
            survey_answers.push(game.add.text(posx, posy, survey_options[i].choice_name, { font: '20px Arial', fill: '#fff' }));
        }*/

        game_coins = game.add.group();
        game_coins.enableBody = true;
        game_coins.physicsBodyType = Phaser.Physics.ARCADE;

        survey_answers = game.add.group();
        survey_answers.enableBody = true;
        survey_answers.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < survey_options.length; i++) {
            var bad_pos = true;
            var posx = Math.floor((Math.random() * game.world.width) + 1);
            var posy = Math.floor((Math.random() * game.world.height) + 1);
            var answer_text = game.add.text(posx, posy, survey_options[i].choice_name, { font: '20px Arial', fill: '#fff', stroke: '#333', strokeThickness: 20 });
            while (bad_pos) {
                var wall_collide1 = false;
                var wall_collide2 = false;
                for (var k = 0; k < wall_pos.length; k++) {
                    if (answer_text.x >= wall_pos[k].x && answer_text.x <= wall_pos[k].x + 16 && answer_text.y >= wall_pos[k].y && answer_text.y <= wall_pos[k].y + 16)
                        wall_collide1 = true;
                    if (answer_text.x + answer_text.width >= wall_pos[k].x && answer_text.x + answer_text.width <= wall_pos[k].x + 16 && answer_text.y + answer_text.height >= wall_pos[k].y && answer_text.y + answer_text.height <= wall_pos[k].y + 16)
                        wall_collide2 = true;
                    if (wall_collide1 && wall_collide2) break;
                }
                if (!(answer_text.x < 0 || answer_text.x + answer_text.width > game.world.width || answer_text.y < 50 || answer_text.y + answer_text.height > game.world.height) && !wall_collide1 && !wall_collide2) {
                    bad_pos = false;
                }
                else {
                    posx = Math.floor((Math.random() * game.world.width) + 1);
                    posy = Math.floor((Math.random() * game.world.height) + 1);
                    answer_text.x = posx;
                    answer_text.y = posy;
                }
            }
            survey_answer = survey_answers.add(answer_text);
            //survey_answer.body.bounce.set(1);
            //survey_answer.body.immovable = true;
            //survey_answer.body.mass = 0;
            survey_answer.body.allowGravity = false;
        }

        game.camera.follow(player);

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    }

    function update() {

        //console.log("update");

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

        game.physics.arcade.collide(player, survey_answers, playerHitAnswer, null, this);
        game.physics.arcade.collide(player, game_coins, playerHitCoin, null, this);
        //game.physics.arcade.collide(survey_answers, layer, answerHitLayer, null, this);
    }

    function render () {

        // game.debug.text(game.time.physicsElapsed, 32, 32);
        // game.debug.body(player);
        // game.debug.bodyInfo(player, 16, 24);

    }
    
    function collisionHandler () {

    }

    function playerHitAnswer (_player, _answer) {

        //alert("collision");
        $('#' + question_div + ' input:nth(' + (_answer.z - 1) + ')').attr('checked',true);
        if ($.inArray(_answer.z, answers_hit) == -1) {
            game.add.tween(_answer).to( { alpha: 0 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            setTimeout(function(){ _answer.kill(); }, 1000);
            for (var i = 0; i < 3; i++) {
                var bad_pos = true;
                var posx = Math.floor((Math.random() * game.world.width) + 1);
                var posy = Math.floor((Math.random() * game.world.height) + 1);
                var coin = game.add.sprite(posx, posy, 'coin');
                game.physics.enable(coin, Phaser.Physics.ARCADE);
                coin.body.allowGravity = false;
                coin.anchor.setTo(0.5, 0.5);
                game_coins.add(coin);
                while (bad_pos) {
                    var wall_collide1 = false;
                    var wall_collide2 = false;
                    for (var k = 0; k < wall_pos.length; k++) {
                        if (coin.x >= wall_pos[k].x && coin.x <= wall_pos[k].x + 16 && coin.y >= wall_pos[k].y && coin.y <= wall_pos[k].y + 16)
                            wall_collide1 = true;
                        if (coin.x + coin.width >= wall_pos[k].x && coin.x + coin.width <= wall_pos[k].x + 16 && coin.y + coin.height >= wall_pos[k].y && coin.y + coin.height <= wall_pos[k].y + 16)
                            wall_collide2 = true;
                        if (wall_collide1 && wall_collide2) break;
                    }
                    if (!(coin.x < 0 || coin.x + coin.width > game.world.width || coin.y < 50 || coin.y + coin.height > game.world.height) && !wall_collide1 && !wall_collide2) {
                        bad_pos = false;
                    }
                    else {
                        posx = Math.floor((Math.random() * game.world.width) + 1);
                        posy = Math.floor((Math.random() * game.world.height) + 1);
                        coin.x = posx;
                        coin.y = posy;
                    }
                }
                coin.y = coin.y - 75;
                game.add.tween(coin).to( { y: coin.y + 75}, 1500, Phaser.Easing.Bounce.Out, true);
            }
            answers_hit.push(_answer.z);
        }
    }

    function playerHitCoin (_player, _coin) {
        if ($.inArray(_coin.z, coins_hit) == -1) {
            //_coin.kill();
            score += 10;
            score_text.text = 'Score: ' + score;
            coins_hit.push(_coin.z);
            setTimeout(function(){ _coin.kill(); }, 350);
            game.add.tween(_coin).to( { alpha: 0 }, 400, Phaser.Easing.Linear.None, true, 0, 1000, true);
        }
    }

    /*function answerHitLayer (_answer, _layer) {

        console.log("collision");

    }*/
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
            alert(pl.img.src);
            if (pl.img.src.includes('img/game/arrivee.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl1');
                game.physics.enable(newPlat);
            }
            if (pl.img.src.includes('img/game/nuage.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl2');
                game.physics.enable(newPlat);
            }
            if (pl.img.src.includes('img/game/plateforme2.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl3');
                game.physics.enable(newPlat);
            }
            if (pl.img.src.includes('img/game/plateforme3.png')) {
                var newPlat = game.platforms.create(pl.imageX, pl.imageY, 'pl4');
                game.physics.enable(newPlat);
            }
        });

        game.platforms.setAll('body.allowGravity', false);
        game.platforms.setAll('body.immovable', true);
        game.platforms.setAll('body.velocity.x', 0);

        game.physics.arcade.gravity.y = 800;

        player = game.add.sprite(32, 32, 'dude');
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
