
var surveyManiaControllers = angular.module('surveyManiaControllers', []);

surveyManiaControllers.controller('GlobalController', ['$scope', '$window', '$location', function($scope, $window, $location) {
    $scope.isLogged;
    $scope.isLoggedFun = function(){$scope.isLogged = !($window.localStorage.token == undefined);console.log("inside:"+$scope.isLogged+"     isLogged:"+ $scope.isLogged);};
    $scope.isLoggedFun();

    $scope.isCustomer;
    $scope.isOrganization;
    $scope.isAdmin;
    $scope.initUserType = function () {
        var type = $window.localStorage.userType; $scope.isCustomer = false; $scope.isOrganization = false; $scope.isAdmin = false;
        if (type == 1) $scope.isCustomer = true;
        else if (type == 4 || type == 3) $scope.isOrganization = true;
        else if (type == 2) $scope.isAdmin = true;
    };
    $scope.initUserType();

    $scope.logout = function () {
        delete $window.localStorage.token;
        delete $window.localStorage.userType;
        $scope.isLoggedFun();
        $scope.initUserType();
        console.log("logout"+$scope.isLogged); 
        $location.path("/home");
    };

    var bounceHide = new Bounce();
    bounceHide.scale({
        from: { x: 1, y: 1 },
        to: { x: 0.01, y: 0.01 },
        duration: 1000,
        easing: 'bounce',
        bounces: 6,
        stiffness: 1
    });

    $scope.hideInfosBulle = function () {
        $("#bubble-infos").show();
        bounceHide.applyTo($("#bubble-infos")).then(function() { 
          $("#bubble-infos").hide();
        });
    };
}]);

surveyManiaControllers.controller('DragAndDrop', ['$scope', '$routeParams', '$timeout', '$sce', '$http', '$location', 
    function($scope, $routeParams, $timeout, $sce, $http, $location){
        $scope.list1 = [{'index':'','id':'0','title': 'Titre', 'label': $sce.trustAsHtml('<h1>Titre</h1>'), 'code' : $sce.trustAsHtml('<h1 ng-bind="title">Titre</h1>'), 'show':true, 'icon':'header'},
                        {'index':'','id':'1','title': 'Réponse libre', 'label':$sce.trustAsHtml('<h5>question</h5>'), 'code' : $sce.trustAsHtml('<textarea maxlength="255"></textarea>'), 'show':true, 'icon':'text-height'},
                        {'index':'','id':'2','title': 'Question fermée', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<input type="radio" name="yesno" value="0"> <span class="opt1">Oui</span><br><input type="radio" name="yesno" value="1" checked> <span class="opt2">Non</span>'), 'show':true, 'icon':'toggle-on'},
                        {'index':'','id':'3','title': 'Slider', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<input type="range" min="0" max="50" value="25" step="5" />'), 'show':true, 'icon':'sliders'},
                        {'index':'','id':'4','title': 'Branchement', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<select name="selectform"><option pos="0" value="1">Option 1</option></select>'), 'show':true, 'icon':'code-fork'},
                        {'index':'','id':'5','title': 'Numérique', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<input type="number" min="0" max="50" name="number" />'), 'show':true, 'icon':'list-ol'},
                        {'index':'','id':'6','title': 'Choix multiple', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<select name="selectform"><option pos="0" value="1">Option 1</option></select>'), 'show':true, 'icon':'list'},
                        {'index':'','id':'7','title': 'Texte libre', 'label':$sce.trustAsHtml('<p>Texte</p>'),'code' :  $sce.trustAsHtml('<p ng-bind="title">Titre</p>'), 'show':true, 'icon':'font'}
                        ]; 
        $scope.survey = {name: "", description: "", instructions: "", points: 100};
        $scope.htmlList = new Array();
        $scope.htmlList[0] = new Array();

        $scope.sectionList = new Array({'title':'Section 1', 'required':true});

        $scope.questionList = new Array();
        $scope.categories = [];
        $scope.displayedList = [];

        $scope.currentListNumber = 0;
        $scope.displayedList = $scope.htmlList[0];

        $scope.answer ="";

        $scope.requiredSections = [];

        $scope.updateSectionList = function()
        {
            for (var i = 0; i < $scope.sectionList.length; i++)
            {
                if($scope.requiredSections[i] == 1)
                    $scope.sectionList[i].required = false;
                else
                    $scope.sectionList[i].required = true;
            }
        }

        $scope.getRequiredSections = function()
        {
            $scope.requiredSections = [];
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].type == 4)
                    {
                        var allopts = $scope.questionList[i][j].option;
                        console.log(allopts);
                        for (var k = 0; k < allopts.length; k++)
                        {
                            $scope.requiredSections[allopts[k].sectionId] = 1;
                            $scope.$apply();
                        }
                    }
                }
            }
        }

        $scope.validateSurvey = function ()
        {
            // Get optionnal sections
            $scope.getRequiredSections();
            $scope.updateSectionList();

            $http.post('/app/account/admin/validate/survey', {name: $scope.survey.name, description: $scope.survey.description, instructions: $scope.survey.instructions, points: $scope.survey.points, category: $scope.survey.category, list: $scope.questionList, sections: $scope.sectionList})
            .success(function (data, status, headers, config) {
                console.log(data);
                if (data.error == undefined) {
                    $scope.verifSuccMess = "Le sondage a bien été enregistré.";
                    $location.path("/organizationPanel");
                }
                else $scope.verifErrMess = data.error + '. ' + data.message;
            })
            .error(function (data, status, headers, config) {
                console.log(data);
            });
        }

        $scope.previsualiserSurvey = function ()
        {
            $scope.getRequiredSections();
            $scope.updateSectionList();

            $http.post('/app/account/admin/validate/survey', {name: $scope.survey.name, description: $scope.survey.description, instructions: $scope.survey.instructions, points: $scope.survey.points, category: $scope.survey.category, list: $scope.questionList, sections: $scope.sectionList})
            .success(function (data, status, headers, config) {
                console.log(data);
                if (data.error == undefined) {
                    $scope.verifSuccMess = "Le sondage a bien été enregistré.";
                    $location.path("/previsualisation/" + data.survey_id);
                }
                else $scope.verifErrMess = data.error + '. ' + data.message;
            })
            .error(function (data, status, headers, config) {
                console.log(data);
            });
        }

        $scope.switchList = function ($listNumber)
        {
            var i = parseInt($listNumber) - 1;
            if (!$scope.htmlList[i])
                $scope.htmlList[i] = new Array();
           
            $scope.displayedList = $scope.htmlList[i];
            $scope.currentListNumber = i;

            $scope.$apply();
        }

        $scope.addSection = function ()
        {
            $scope.sectionList.push({'title':"Section "+($scope.sectionList.length + 1), 'required':true});
            $scope.$apply();
        }

        $scope.changeSectionName = function($id, $name)
        {
            $scope.sectionList[$id] = $name;
            $scope.$apply();
        }

        $scope.addNewQuestion = function ($index, $item)
        {
            var i = $scope.currentListNumber;
            if(!$scope.questionList[i])
                $scope.questionList[i] = new Array();

            if($item.id == 0) // Titre
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'video':[], 'image':[]});
            }
            else if ($item.id == 1) // Question ouverte
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'maxlength':'255', 'video':[], 'image':[]});
            }
            else if($item.id == 2) // Question fermée
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'label1':'Oui', 'label2':'Non', 'video':[], 'image':[]});
            }
            else if($item.id == 3) // Slider
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'min':'0', 'max':'50', 'step':'5', 'video':[], 'image':[]});
            }
            else if($item.id == 4) // Branchement
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'option':[], 'multiple':false, 'video':[], 'image':[]});
            }
            else if($item.id == 5) // Question numérique
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'min':'0', 'max':'100', 'video':[], 'image':[]});
            }
            else if($item.id == 6) // Choix multiple
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'option':[], 'multiple':false, 'video':[], 'image':[]});
            }
            else if($item.id == 7) // Texte libre
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'text':'', 'video':[], 'image':[]});
            }
            else
            {
                console.log("caca : "+$item.id);   
            }
        }

        // Add video to question
        $scope.addVideo = function($index, $url){
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].video.push($url);
                        $scope.$apply();
                    }
                }
            }
        }

        // Add image to question
        $scope.addImage = function($index, $url){
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].image.push($url);
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit YesNo question in proper object list
        $scope.editYesNoQuestion = function ($index, $title, $opt1, $opt2)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index && $scope.htmlList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].type = 2;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].label1 = $opt1;
                        $scope.questionList[i][j].label2 = $opt2;

                        $scope.htmlList[i][j].index = $index;
                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h5>"+$title+"</h5>");
                        $scope.htmlList[i][j].code = $sce.trustAsHtml('<input type="radio" name="yesno" value="0"> <span class="opt1">'+$opt1+'</span><br><input type="radio" name="yesno" value="1" checked> <span class="opt2">'+$opt2+'</span>');
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit numric question in proper object list
        $scope.editNumericQuestion = function ($index, $title, $min, $max)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].min = $min;
                        $scope.questionList[i][j].max = $max;

                        $scope.htmlList[i][j].index = $index;
                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h5>"+$title+"</h5>");
                        $scope.htmlList[i][j].code = $sce.trustAsHtml('<input type="number" min="'+$min+'" max="'+$max+'" name="number" />')
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit Slider question in proper object list
        $scope.editSliderQuestion = function ($index, $title, $min, $max, $step)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].type = 3;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].min = $min;
                        $scope.questionList[i][j].max = $max;
                        $scope.questionList[i][j].step = $step;

                        $scope.htmlList[i][j].index = $index;
                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h5>"+$title+"</h5>");
                        $scope.htmlList[i][j].code = $sce.trustAsHtml('<input type="range" min="'+$min+'" max="'+$max+'" value="0" step="'+$step+'" />')
                        $scope.$apply();
                    }
                }
            }
        }
        
        // Edit title question in proper object list
        $scope.editTitleQuestion = function ($index, $title, $type)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].type = $type;
                        $scope.questionList[i][j].title = $title;

                        $scope.htmlList[i][j].index = $index;
                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h1>"+$title+"</h1>");
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit text in proper object list
        $scope.editTextQuestion = function ($index, $text)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].text = $text;

                        $scope.htmlList[i][j].index = $index;
                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<p>"+$text+"</p>");
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit multiple question in proper object list
        $scope.editMultipleQuestion = function ($index, $title, $options, $multiple)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].option = $options;
                        $scope.questionList[i][j].multiple = $multiple;

                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h5>"+$title+"</h5>");
                        $content = '<select name="selectform"';
                            if ($multiple)
                                $content += 'multiple>'
                            else
                                $content +='>';
                            for (var k = 0; k < $options.length; k++)
                                $content += '<option pos="'+(k+1)+'" value="'+(k+2)+'">'+$options[k]+'</option>';
                        $content += '</select>';
                        $scope.htmlList[i][j].code = $sce.trustAsHtml($content);
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit section question in proper object list
        $scope.editSectionQuestion = function ($index, $title, $options, $multiple)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].option = $options;
                        $scope.questionList[i][j].multiple = $multiple;

                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h5>"+$title+"</h5>");
                        $content = '<select name="selectform"';
                            if ($multiple)
                                $content += 'multiple>'
                            else
                                $content +='>';
                            for (var k = 0; k < $options.length; k++)
                                $content += '<option pos="'+(k+1)+'" value="'+$options[k].sectionId+'">'+$options[k].title+'</option>';
                        $content += '</select>';
                        $scope.htmlList[i][j].code = $sce.trustAsHtml($content);
                        $scope.$apply();
                        $scope.$apply();
                    }
                }
            }
            $scope.getRequiredSections();
            $scope.updateSectionList();
        }

        // Edit title question in proper object list
        $scope.editOpenQuestion = function ($index, $title, $type, $maxlength)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].type = $type;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].maxlength = $maxlength;

                        $scope.htmlList[i][j].index = $index;
                        $scope.htmlList[i][j].label = $sce.trustAsHtml("<h5>"+$title+"</h5>");
                        $scope.htmlList[i][j].code = $sce.trustAsHtml('<textarea maxlength="'+$maxlength+'"></textarea>')
                        $scope.$apply();
                    }
                }
            }
        }

        // Edit YesNo question in proper object list
        /*$scope.editYesNoList4 = function ($index, $title, $html)
        {
            for (var i = 0; i < $scope.questionList.length; i++)
            {
                if($scope.list4[i].index == $index)
                {
                    console.log("okokoko");
                    $scope.list4[i].code = $sce.trustAsHtml($html);
                    $scope.list4[i].label =  $sce.trustAsHtml("<h5>"+$title+"</h5>");
                    $scope.$apply();
                }
            }
        }*/

        $scope.hideMe = function() {
            return $scope.displayedList.length > 0;
        }

        $scope.edit = function($index, $type){
            $("#display-item-options").empty();
            $scope.displayOptions($index, $type);
            //$scope.hide($index);
        }

        $scope.addMedia = function($index){
            $("#media_panel_container").empty();
            $("#media_panel_container").append("<div id='media_panel' class='panel panel-default'></div>");
            $("#media_panel").hide();
            $("#media_panel").append("<div class='panel-heading'>Ajouter un média <i class='fa fa-file-image-o'></i>");
            $("#media_panel").append("<div id='display-media-options' class='panel-body'></div>");
            $("#display-media-options").append('<input type="hidden" name="itemIndex" value="'+$index+'" />');
            $("#display-media-options").append("<span>Url de la vidéo youtube</span><input name='videoUrl' type='text' class='form-control'/>");
            $("#display-media-options").append("<input name='videoDescription' type='text' class='form-control' placeholder='Description...'/>");
            $("#display-media-options").append("<hr>");
            $("#display-media-options").append("<span>Url de l'image</span><input name='imageUrl' type='text' class='form-control'/>");
            $("#display-media-options").append("<input name='imageDescription' type='text' class='form-control' placeholder='Description...'/>");
            $("#display-media-options").append('<input type="submit" id="validateMedia" value="Valider" class="btn btn-primary" />');
            $("#media_panel").fadeIn();
        }

        $scope.displayOptions = function($index, $type)
        {
            $("#display-item-options").hide();

            var str = [];

            str.push('<form id="optionsForm">');
            str.push('<span id="errMessage"></span>');
            $('#errMessage').hide();

            str.push('<input type="hidden" name="itemType" value="'+$type+'" />');
            str.push('<input type="hidden" name="itemIndex" value="'+$index+'" />');

            if($type == 0)
            {
                str.push('<h5>Titre</h5>');
                var ttl = $("#itemn"+$index).parent().find("h1").html();
                str.push('<span>Indiquez un nouveau titre</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required />');
            }
            else if($type == 1)
            {
                str.push('<h5>Question ouverte</h5>');
                var ttl = $("#itemn"+$index).parent().find("h5").html();
                str.push('<span>Intitulé de la question</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required="required" />');
                var len = $("#itemn"+$index).children("textarea").prop("maxlength");
                str.push('<input type="number" name="maxlength" class="form-control" value="'+len+'" required="required" />');
            }
            else if($type == 2)
            {
                str.push('<h5>Question fermée</h5>');
                var ttl = $("#itemn"+$index).parent().find("h5").html();
                str.push('<span>Intitulé de la question</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required="required" />');
                var option1 = $("#itemn"+$index).children(".opt1").html();
                str.push('<span>Texte de la première réponse</span> <input type="text" name="opt1" class="form-control" value="'+option1+'" required="required" />');
                var option2 = $("#itemn"+$index).children(".opt2").html();
                str.push('<span>Texte de la première réponse</span> <input type="text" name="opt2" class="form-control" value="'+option2+'" required="required" />');
            }
            else if($type == 3)
            {
                str.push('<h5>Slider</h5>');
                var ttl = $("#itemn"+$index).parent().find("h5").html();
                str.push('<span>Intitulé de la question</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required="required" />');
                var min = $("#itemn"+$index).children("input[type='range']").prop("min");
                var max = $("#itemn"+$index).children("input[type='range']").prop("max");
                var step = $("#itemn"+$index).children("input[type='range']").prop("step");
                str.push('<span>Minimum</span> <input type="number" name="min" class="form-control" value="'+min+'" required="required" />');
                str.push('<span>Maximum</span> <input type="number" name="max" class="form-control" value="'+max+'" required="required" />');
                str.push('<span>Pas</span> <input type="number" name="step" class="form-control" value="'+step+'" required="required" />');
            }
            else if($type == 4)
            {
                str.push('<h5>Branchement</h5>');
                var ttl = $("#itemn"+$index).parent().find("h5").html();
                str.push('<span>Indiquez un nouveau titre</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required />');
                str.push('<input type="checkbox" value="1" id="multipleAnswers"> Autoriser la selection multiple ?');
                var allOptions = $("#itemn"+$index).children("select").children();
                str.push('<div id="allOptionsEdit">');
                allOptions.each(function($index)
                {
                    str.push('<div pos="'+$index+'">');
                    str.push('<input class="form-control" style="display:inline-block; width:45%;" type="text" value="'+$(this).text()+'" />');
                    str.push('<select class="form-control" style="display:inline-block; width:45%;" >');
                    for (var i = 0; i < $scope.sectionList.length; i++)
                    {
                        str.push('<option value="'+i+'">'+$scope.sectionList[i].title+'</option>');
                    }
                    str.push('</select>');
                    str.push('<span class="removeItem fa fa-times"></span></div>');
                });
                str.push('</div>');
                str.push('<button id="addNewSectionOptions" class="btn btn-default">Ajouter une option</button>');
                str.push('<div id="newSectionOptions" style="margin-top:15px;"></div>');

            }
            else if($type == 5)
            {
                str.push('<h5>Question numérique</h5>');
                var ttl = $("#itemn"+$index).parent().find("h5").html();
                str.push('<span>Indiquez un nouveau titre</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required />');

                var min = $("#itemn"+$index).children("input[type='number']").prop("min");
                var max = $("#itemn"+$index).children("input[type='number']").prop("max");
                str.push('<span>Minimum</span> <input type="number" name="min" class="form-control" value="'+min+'" required="required" />');
                str.push('<span>Maximum</span> <input type="number" name="max" class="form-control" value="'+max+'" required="required" />');
            }
            else if($type == 6)
            {
                str.push('<h5>Question à choix multiple</h5>');
                var ttl = $("#itemn"+$index).parent().find("h5").html();
                str.push('<span>Indiquez un nouveau titre</span> <input type="text" name="questionTitle" class="form-control" value="'+ttl+'" required />');
                str.push('<input type="checkbox" value="1" id="multipleAnswers"> Autoriser la selection multiple ?');
                var allOptions = $("#itemn"+$index).children("select").children();
                str.push('<div id="allOptionsEdit">');
                allOptions.each(function($index)
                {
                    str.push('<div><input pos="'+$index+'" class="form-control" style="display:inline-block; width:95%;" type="text" value="'+$(this).text()+'" /><span class="removeItem fa fa-times"></span></div>');
                });
                str.push('</div>');
                str.push('<button id="addNewOptions" class="btn btn-default">Ajouter une option</button>');
                str.push('<div id="newOptions"></div>');

            }
            else if($type == 7)
            {
                str.push('<h5>Texte libre</h5>');
                var ttl = $("#itemn"+$index).parent().find("p").html();
                str.push('<span>Indiquez le texte à afficher</span> <textarea name="questionTitle" class="form-control" required>'+ttl+'</textarea>');
            }
            else
                $("#display-item-options").html('error');

            str.push('<input type="submit" id="closedQuestion" value="Valider" class="btn btn-primary" />');
            str.push('</form>');
            $("#display-item-options").append(str.join(""));
            $("#display-item-options").fadeIn(1000);
        }

        $scope.hide = function($index){
            console.log("index : "+$index)
            $scope.list4[$index].show = false;
        }

        $scope.validate = function($index, $value){
            console.log($value);
            $scope.list4[$index].label = $sce.trustAsHtml('<h5 ng-bind="title">'+$value+'</h5>');
            $scope.list4[$index].show = true;
        }

        $scope.delete = function($index){
            $("#display-item-options").fadeOut("slow", function() {
                 $("#display-item-options").empty();
            });

            $scope.displayedList.splice(($index - ($scope.currentListNumber*100)), 1);

            for (var i = 0; i < $scope.questionList.length; i++)
            {
                for (var j = 0; j < $scope.questionList[i].length; j++)
                {
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i].splice(j,1);
                    }
                }
            }
        }

        $http.post('/app/category/get')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.categories = data.categories;
                $("#survey-categories option:first").remove();
                $scope.survey.category = $scope.categories[0].category_id;
            }
        })
        .error(function (data, status, headers, config) {
        });
    }]);


surveyManiaControllers.controller('LoginController', ['$rootScope', '$scope', '$http', '$window', '$location', '$route', function($rootScope, $scope, $http, $window, $location, $route) {
    $scope.user = {email: '', password: ''};
    $scope.loginErrMess = undefined;
    $scope.submit = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.loginErrMess = "Format d'email invalide!";
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/login', {email: $scope.user.email, password: password})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                //$window.location.reload(); // O-M-G
                $window.localStorage.token = data.token;
                $window.localStorage.userType = data.usertype;
                $scope.isLoggedFun();
                $scope.initUserType();
                if (data.usertype == 1 || data.usertype == 3 || data.usertype == 4) {
                    if ($rootScope.navigationPart != "account")
                        $location.path( "/account");
                    else $route.reload();
                }
                else $location.path( "/account/admin/validate/pro");
            }
            else {
                delete $window.localStorage.token;
                $scope.loginErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            // Erase the token if the user fails to log in
            delete $window.localStorage.token;
            $scope.loginErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('SignupController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {type: 'particulier', email: '', password: '', password2: '', firstname: '', lastname: '',
                   address: '', postal: '', town: '', country: '', phone: '', inviter: '',
                   firmname: '', firmdescription: '', logo_skip: true};
    $scope.default_img ="img/default_profil.jpg";
    $scope.img ="img/default_profil.jpg";
    $scope.fetch_img = function() {
        $http.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyBaiPSlrA4cVQKAv-RlRwo1UgkkVpOS67U&cx=004343761578996942245:kcfk8xi6kqk&q='+$scope.user.firmname+'+logo&searchType=image&fileType:jpg,png&imgSize=small&alt=json', {cache: true, responseType: "json"})
        .success(function (data, status, headers, config) {
            console.log(data);
            var items = data.items;
            var i = 0;
            while (items[i].mime === "image/gif") i++;

            var successCall = function (data, status, headers, config) {
                console.log(data);
                var myBlob = data;
                var reader = new FileReader();
                reader.onload = function(e) {
                    $scope.img = reader.result;
                    $scope.user.logo_skip = false;
                    $('#logo_suggestion').show();
                    $scope.$apply();
                    console.log($scope.img);
                }
                reader.readAsDataURL(myBlob);
            };

            var errorCall = function (data, status, headers, config) {
                i++;
                if (i < items.length) {
                    $http.get(items[i].link, {cache: true, responseType: "blob"})
                    .success(successCall)
                    .error(errorCall);
                }
            };

            $http.get(items[i].link, {cache: true, responseType: "blob"})
            .success(successCall)
            .error(errorCall);
        })
        .error(function (data, status, headers, config) {
            console.log(data);
        });
    };

    $scope.reset_default_image = function(){$scope.img = $scope.default_img;}

    $scope.isValidEmail = false;
    $scope.isValidConfirmPwd = false;
    $scope.isValidPwd = false;
    $scope.isValidFirstName = false;
    $scope.isValidLastName = false;
    $scope.isValidPhoneNumber = false;
    $scope.email_check = function(){$scope.isValidEmail = !(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.email));}
    $scope.pwd_check = function(){$scope.isValidPwd = !(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test($scope.user.password));} 
    $scope.confirmpwd_check = function(){$scope.isValidConfirmPwd = !($scope.user.password == $scope.user.password2);}
    $scope.firstName_check = function(){$scope.isValidFirstName = !(/^[A-zÀ-ú-']{2,}$/.test($scope.user.firstname));}
    $scope.lastName_check = function(){$scope.isValidLastName = !(/^[A-zÀ-ú-']{2,}$/.test($scope.user.lastname));}
    $scope.phoneNumber_check = function(){$scope.isValidPhoneNumber = !(/^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/.test($scope.user.phone));}
    // Champ non obligatoire. Si il y a déjà eu le focus dessus et que le champ est vide, ça met quand même le message d'erreur. Si le champ est non required et à 0 alors on enlève le msg d'erreur
    $("#phoneNumber").focusout(function() {if($scope.user.phone == 0){$scope.isValidPhoneNumber = false; $scope.$apply();}});

    $scope.change_form = function()
    {
        var pro = $(".professionnal_form");
        var pro_check = $(".pro_check");
        var part_check = $(".part_check");
        var par = $(".particulier_form");
        if (document.getElementById('professionnal').checked) {
            pro.find('input[type=text]:first').attr("required", true);
            pro_check.slideDown();
            par.find('input[type=text]:first').removeAttr("required");
            part_check.slideUp();
            $(".professionnal_form .link_primary").show();
        }
        else
        {
            pro.find('input[type=text]:first').removeAttr("required");
            pro_check.slideUp();
            par.find('input[type=text]:first').attr("required", true);
            part_check.slideDown();
            $(".professionnal_form .link_primary").hide();
        }
    }

    $scope.img_upload_form = function()
    {
        $('#img_upload').slideDown();
    }

    $scope.change_img_preview = function()
    {
        var fileInput = document.getElementById('uploadLogo');
        var file = fileInput.files[0];
        var imageType = /image.*/;

        if (file.type.match(imageType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $scope.img = reader.result;
                $scope.user.logo_skip = false;
                $scope.$apply();
            }
            reader.readAsDataURL(file); 
        }
    }

    $scope.signupErrMess = undefined;
    $scope.signupSuccMess = undefined;
    $scope.submit = function () {
        if ((document.getElementById('particulier').checked && ($scope.user.email == '' || $scope.user.password == '' || $scope.user.password2 == '' 
            || $scope.user.firstname == '' || $scope.user.lastname == '')) || 
            (document.getElementById('professionnal').checked && ($scope.user.email == '' || $scope.user.password == '' || $scope.user.password2 == '' 
            || $scope.user.firmname == '' || $scope.user.firmdescription == '')))
            return $scope.signupErrMess = 'Veuillez remplir tous les champs obligatoires !';

        if($scope.isValidEmail || $scope.isValidConfirmPwd || $scope.isValidPwd || $scope.isValidFirstName || $scope.isValidLastName || $scope.isValidPhoneNumber)
            return $scope.signupErrMess = 'Veuillez corriger les erreurs !';

        var password = CryptoJS.SHA256($scope.user.password).toString();
        var newuser = {
            type: $scope.user.type,
            email: $scope.user.email,
            password: password,
            firstname: ($scope.user.firstname == '') ? null : $scope.user.firstname,
            lastname: ($scope.user.lastname == '') ? null : $scope.user.lastname,
            adress: ($scope.user.address == '') ? null : $scope.user.address,
            postal: ($scope.user.postal == '') ? null : $scope.user.postal,
            town: ($scope.user.town == '') ? null : $scope.user.town,
            country: ($scope.user.country == '') ? null : $scope.user.country,
            phone: ($scope.user.phone == '') ? null : $scope.user.phone,
            inviter: ($scope.user.inviter == '') ? null : $scope.user.inviter,
            firmname: ($scope.user.firmname == '') ? null : $scope.user.firmname,
            firmdescription: ($scope.user.firmdescription == '') ? null : $scope.user.firmdescription,
            logo_img: $scope.img,
            logo_type: '',
            logo_skip: $scope.user.logo_skip
        }

        if (newuser.logo_skip == false) {
            var splits = newuser.logo_img.split(/:(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'data') return $scope.signupErrMess = 'Mauvais format de logo !';
            splits = splits[1].split(/\/(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'image') return $scope.signupErrMess = 'Mauvais format de logo !';
            splits = splits[1].split(/;(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'png' && splits[0] != 'jpeg') return $scope.signupErrMess = 'Mauvais format de logo !';
            else newuser.logo_type = (splits[0] == 'png') ? 'png' : 'jpg';
            splits = splits[1].split(/,(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'base64') return $scope.signupErrMess = 'Mauvais format de logo !';
            newuser.logo_img = splits[1];
        }

        $http.post('/signup', newuser)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                console.log(data);
                $scope.signupSuccMess = "Votre compte à été créé avec succes. Un email vous a été envoyé, suivez les instructions pour finaliser votre inscription.";
            }
            else $scope.signupErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.signupErrMess = data.error + '. ' + data.message;
        });
    };

    googleInitialize();
}]);

surveyManiaControllers.controller('ValidateProAccount', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.verifErrMess = undefined;
    $scope.verifSuccMess = undefined;
    $scope.validate_pro_account = function($id)
    {
        $http.post('/app/account/admin/validate/pro',  {id: $id})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.verifSuccMess = "Le compte a bien été validé.";
                $("#account-pro-" + $id).toggle(700, function () {
                    $("#account-pro-" + $id).removeClass("account-pro");
                    if ($(".account-pro").length == 0)
                        $("#account-pro-none").show();
                });
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    }

    $scope.deny_pro_account = function($id)
    {
        $http.post('/app/account/admin/deny/pro', {id: $id})
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.verifSuccMess = "Le compte a bien été refusé.";
                $("#account-pro-" + $id).toggle(700, function () {
                    $("#account-pro-" + $id).removeClass("account-pro");
                    if ($(".account-pro").length == 0)
                        $("#account-pro-none").show();
                });
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    }
}]);

surveyManiaControllers.controller('AccountController', ['$scope', '$rootScope', '$http', '$window', '$location', function($scope, $rootScope, $http, $window, $location) {
    if ($rootScope.showInfosBubble) {
        $rootScope.showInfosBubble = false;

        $scope.showFileChoser = function () {
            console.log("show");
            $("#profile_pic").click();
        };

        $scope.changeProfilePic = function () {
            console.log("change");
            console.log($("#profile_pic").val());
            var fileInput = document.getElementById('profile_pic');
            var file = fileInput.files[0];
            var imageType = /image.*/;

            if (file.type.match(imageType) && file.size < 2000000) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    $scope.profile_pic = reader.result;
                    //console.log($scope.profile_pic);
                    $http.post('/app/account/set/profilepic', {pic: $scope.profile_pic})
                    .success(function (data, status, headers, config) {
                        console.log(data);
                        if (data.error == undefined) {
                            $("#profil_img").attr("src",$scope.profile_pic);
                        }
                    })
                    .error(function (data, status, headers, config) {});
                }
                reader.readAsDataURL(file); 
            }
            else alert("Veuillez choisir un fichier de type image, de moins de 2 Mo");
        };

        var bounceShow = new Bounce();
        bounceShow.scale({
            from: { x: 0, y: 0 },
            to: { x: 1, y: 1 },
            duration: 1000,
            easing: 'bounce',
            bounces: 6,
            stiffness: 1
        });

        var bounceReact = new Bounce();
        bounceReact.scale({
            from: { x: 0.9, y: 0.9, },
            to: { x: 1, y: 1 },
            duration: 700,
            easing: 'bounce',
            bounces: 5,
            stiffness: 1
        });

        var bounceReactDown = new Bounce();
        bounceReactDown.scale({
            from: { x: 1, y: 1 },
            to: { x: 0.9, y: 0.9 },
            duration: 700,
            easing: 'bounce',
            bounces: 5,
            stiffness: 1
        });

        setTimeout(function() {
            $("#bubble-infos").show();
            bounceShow.applyTo($("#bubble-infos"));
        }, 3500);

        $('.oval-quotes').mouseup(function (e) {
            bounceReact.applyTo($("#bubble-infos"));
        });

        $('.oval-quotes').mousedown(function (e) {
            bounceReactDown.applyTo($("#bubble-infos"));
        });

        $("#bubble-infos").draggable({scroll: false});
    }


    // ****** Points count up ****** //
    var options = {
      useEasing : true, 
      useGrouping : true, 
      separator : '', 
      decimal : '.', 
      prefix : '', 
      suffix : '' 
    };

    // ****** Parrainage *******
    var sponsorContainer = document.getElementById('sponsorVisualization');
    var nodes = [];
    var edges = [];
    var sponsorNetwork = null;
    var sponsorData = null;
    var sponsorOptions = {
        hierarchicalLayout: {
            layout: 'direction'
        },
        nodes: {
          borderWidth:2,
          color: {
            border: '#333333',
            background: '#333333'
          },
          fontColor:'#333333',
        },
        edges: {
          color: '#666666',
          style:"arrow"
        }
    };
    var sponsors = [];

    $http.get('/app/account/get/sponsors')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                sponsors = data.sponsors;
                var tmp_user_id = data.user_id;

                for (var i = 0; i < sponsors.length; i++) {
                    if (tmp_user_id == sponsors[i]['user_id']) {
                        nodes.push({id: sponsors[i]['user_id'], label: sponsors[i]['user_name'] + ' ' + sponsors[i]['user_lastname'] + '\n' + sponsors[i]['user_points'] + ' pts', shape: 'circularImage', image: 'img/sponsors/user.png'});
                        if (sponsors[i]['user_inviter_id'] != null) {
                            nodes.push({id: sponsors[i]['sponsor_id'], label: sponsors[i]['sponsor_name'] + ' ' + sponsors[i]['sponsor_lastname'] + '\n' + sponsors[i]['sponsor_points'] + ' pts', shape: 'circularImage', image: 'img/sponsors/sponsor.png'});
                            edges.push({from: sponsors[i]['user_inviter_id'], to: sponsors[i]['user_id']});
                        }
                    }
                    else {
                        nodes.push({id: sponsors[i]['user_id'], label: sponsors[i]['user_name'] + ' ' + sponsors[i]['user_lastname'] + '\n' + sponsors[i]['user_points'] + ' pts', shape: 'circularImage', image: 'img/sponsors/sponsored.png'});
                        edges.push({from: sponsors[i]['user_inviter_id'], to: sponsors[i]['user_id']});
                    }
                }

                sponsorData = {
                    nodes: nodes,
                    edges: edges
                    };

                network = new vis.Network(sponsorContainer, sponsorData, sponsorOptions);
            }
        })
        .error(function (data, status, headers, config) {});

    var oldUser;
    var oldOrganization;
    $http.post('/app/getUser/')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                oldUser = angular.copy(data.user);
                $scope.user = data.user;
                var count_width = $.fn.textWidth($scope.user.owner_points + '', 'quicksand', 40);
                $("#user_points_count").width(count_width);
                var demo = new CountUp("user_points_count", 0, $scope.user.owner_points, 0, 2.5, options);
                demo.start();

                if ($scope.user.owner_type == 3 || $scope.user.owner_type == 4)
                {
                    console.log("idorga:"+$scope.user.owner_organization);
                    $http.post('/app/getUserOrganization/', {userOrganization:$scope.user.owner_organization})
                    .success(function (data, status, headers, config) {
                        console.log(data);
                        if (data.error == undefined) {
                            oldOrganization = angular.copy(data.organization);
                            $scope.organization = data.organization;
                        }
                        else $scope.verifErrMess = data.error + '. ' + data.message;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.verifErrMess = data.error + '. ' + data.message;
                    });
                }
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.verifErrMess = data.error + '. ' + data.message;
        });

    $scope.reduce = false;
    $scope.tab_hide = function() {
        $("#show_about").hide();
        $("#ss-container").hide();
        $("#account-main").show();
    }
    $scope.tab_show = function($id)
    {
        $("#account-main").hide();
        if (!$scope.reduce)
        {
            $scope.reduce = true;
            $("#profil_bg").animate({height:"100px"},400);
            $("#profil_img").animate({width:"70px",height:"70px", marginRight:"50px"},400);
            $("#default_profil").fadeOut(600, function(){$("#default_profil").css("padding","16px 0px 10px 0px")
                .css("display","flex").css("align-items","center").css("justify-content","center")});
        }
        $("#show_about").hide();
        $("#ss-container").hide();
        $("#"+$id+"").fadeIn();
        scroll(0, 1);
        sponsorNetwork = new vis.Network(sponsorContainer, sponsorData, sponsorOptions);
    }
    
    // Edit profile
    $scope.showEditProfileField=false;
    $scope.addressEdit=false;
    $scope.emailEdit=false;
    $scope.phoneEdit=false;
    $scope.isValidOldPwd=false;
    $scope.isValidPwd=false;
    $scope.isValidConfirmPwd=false;
    $scope.isValidPhoneNumber = false;
    $scope.isValidEmail = false;
    $scope.editProfileField = function(){$scope.showEditProfileField = !$scope.showEditProfileField;}
    $scope.displayChangePassword=function(){$("#changePassword").toggle();}

    $scope.oldPasswordCompare=function(){
        $scope.editProfile=true;
        var password = CryptoJS.SHA256($scope.oldpwd).toString();
        $scope.isValidOldPwd = !(password == $scope.user.owner_password);
    }
    $scope.pwd_check = function(){$scope.isValidPwd = !(/^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test($scope.newPwd));} 
    $scope.confirmpwd_check = function(){$scope.isValidConfirmPwd = !($scope.newPwd == $scope.newPwdConfirm);}
    $scope.email_check = function(){$scope.isValidEmail = !(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.owner_email));}
    $scope.phoneNumber_check = function(){$scope.isValidPhoneNumber = !(/^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/.test($scope.user.owner_tel));}

    //Edit firm profile

    $scope.isValidFirmPhoneNumber = false;
    $scope.showEditFirmField=false;
    $scope.firmPhoneNumber_check = function(){$scope.isValidFirmPhoneNumber = !(/^((\+|00)33\s?|0)[1-9](\s?\d{2}){4}$/.test($scope.organization.organization_tel));}
    $scope.editFirmField = function(){$scope.showEditFirmField = !$scope.showEditFirmField;}

    googleAccountInitialize();

    // Save profile changes
    $scope.submitProfileChange = function()
    {
        var password;
        if($scope.newPwd == undefined)
            password = $scope.user.owner_password;
        else
            password = CryptoJS.SHA256($scope.newPwd).toString();

        var ownerType;
        if ($scope.user.owner_type == 1 || $scope.user.owner_type == 2)
            ownerType = 'particulier';
        else if($scope.user.owner_type == 3 || $scope.user.owner_type == 4)
            ownerType = 'professional';

        var edituser = {
            id: $scope.user.owner_id,
            firstname: $scope.user.owner_firstname,
            lastname: $scope.user.owner_lastname,
            type: ownerType,
            email: $scope.user.owner_email,
            password: password,
            adress: ($scope.user.owner_adress == '') ? null : $scope.user.owner_adress,
            postal: ($scope.user.owner_postal == '') ? null : $scope.user.owner_postal,
            town: ($scope.user.owner_town == '') ? null : $scope.user.owner_town,
            country: ($scope.user.owner_country == '') ? null : $scope.user.owner_country,
            phone: ($scope.user.owner_tel == '') ? null : $scope.user.owner_tel,
        }

        $http.post('/app/editUserProfile', edituser)
        .success(function (data, status, headers, config) {
            if(data.verifMail)
            {
                $scope.editSuccMess = "Un mail vous a été envoyé pour confirmer votre nouvelle adresse e-mail";
                $scope.user.owner_email = oldUser.owner_email;
                $scope.showEditProfileField = false;
            }

            else if (data.error == undefined) {
                $scope.showEditField = false;
                $scope.editSuccMess = "Vos modifications ont bien été prises en compte";
                $scope.showEditProfileField = false;
            }
            else
            {
                $scope.editErrMess = data.error + '. ' + data.message;
                if (data.code == 1)
                    $scope.user.owner_email = oldUser.owner_email;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.editErrMess = data.error + '. ' + data.message;
        });
    }

    //Save firm changes
    $scope.submitFirmChange = function()
    {
         var editfirm = {
            id: $scope.organization.organization_id,
            adress: ($scope.organization.organization_adress == '') ? null : $scope.organization.organization_adress,
            postal: ($scope.organization.organization_postal == '') ? null : $scope.organization.organization_postal,
            town: ($scope.organization.organization_town == '') ? null : $scope.organization.organization_town,
            country: ($scope.organization.organization_country == '') ? null : $scope.organization.organization_country,
            phone: ($scope.organization.organization_tel == '') ? null : $scope.organization.organization_tel,
            description: ($scope.organization.organization_description == '') ? null : $scope.organization.organization_description
        }

        $http.post('/app/editFirmProfile', editfirm)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.showEditFirmField = false;
                $scope.editSuccMess = "Vos modifications ont bien été prises en compte";
            }
            else
                $scope.editErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.editErrMess = data.error + '. ' + data.message;
        });
    }
}]);

surveyManiaControllers.controller('MailVerifyController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: ''};
    $scope.verifSuccMess = undefined;
    $scope.verifErrMess = undefined;
    $scope.submit = function (token) {
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/accounts/verify/' + token, {password: password})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.verifSuccMess = 'Votre compte a bien été activé. Vous pouvez dès à présent vous connecter.';
            }
            else {
                $scope.verifErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.submit2 = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.verifErrMess = "Format d'email invalide!";
        $http.post('/accounts/get/verify', {email: $scope.user.email})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.verifSuccMess = 'Un nouveau mail avec votre code de vérification a bien été envoyé.';
            }
            else {
                $scope.verifErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.verifErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('PwdResetController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.user = {email: '', password: '', password2: ''};
    $scope.resetSuccMess = undefined;
    $scope.resetErrMess = undefined;
    $scope.submit = function (token) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.resetErrMess = "Format d'email invalide!";
        if ($scope.user.password != $scope.user.password2)
            return $scope.resetErrMess = "Les deux mots de passe doivent être identiques!";
        var password = CryptoJS.SHA256($scope.user.password).toString();
        $http.post('/accounts/reset/' + token, {email: $scope.user.email, password: password})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.resetSuccMess = 'Votre mot de passe a été changé avec succès.';
            }
            else {
                $scope.resetErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.resetErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.submit2 = function () {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($scope.user.email))
            return $scope.resetErrMess = "Format d'email invalide!";
        $http.post('/accounts/get/reset', {email: $scope.user.email})
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.resetSuccMess = 'Un nouveau mail avec votre code de réinitialisation a bien été envoyé.';
            }
            else {
                $scope.resetErrMess = data.error + '. ' + data.message;
            }
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.resetErrMess = data.error + '. ' + data.message;
        });
    };
}]);

surveyManiaControllers.controller('MySurveysController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.userSurveys = [];
    $scope.lastAddedSurvey = null;
    $scope.resultMessage = null;
    $scope.dismissButton = null;
    $scope.validateButton = null;
    $scope.QRcode = null;

    $http.post('/app/getUserSurveys/')
        .success(function (data, status, headers, config) {
            $scope.userSurveys = data.userSurveys;
    });

    $('#confirmScanModal')
        .on('hide.bs.modal', function () {
            cameraPause(false);
        })
        .on('show.bs.modal', function() {
            cameraPause(true);
        });
    
    $scope.addSurvey = function (readedQRcode) {
        $scope.QRcode = null;
        $http.post('/app/addUserSurvey/', {qrcode: readedQRcode})
            .success(function (data, status, header, config) {
                switch (data.message.toUpperCase()) {
                    case "SCANNING ERROR":
                        $scope.resultMessage = "Le QRcode n'est pas lisible";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "NOT VALID":
                        $scope.resultMessage = "Ce QRcode est invalide";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "ALREADY SCANNED":
                        $scope.resultMessage = "Vous avez déjà scanné ce QRcode";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "FINISHED":
                        $scope.resultMessage = "Ce sondage est terminé";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "UNKNOWN SURVEY":
                        $scope.resultMessage = "Ce QRcode est invalide";
                        $scope.dismissButton = "Réessayer";
                        $scope.validateButton = null;
                        break;
                    case "VALID":
                        $scope.resultMessage = "Nouveau sondage disponible : " + data.surveyHeader.surveyname + " pour " + data.surveyHeader.points + " points !";
                        $scope.validateButton = "Ajouter à ma liste";
                        $scope.dismissButton = "Annuler";
                        $scope.QRcode = readedQRcode;
                        break;
                    default:
                        $scope.resultMessage = "Erreur inconnue";
                        $scope.dismissButton = "Réessayer";
                }
            })
            .error(function (data, status, header, config) {
                $scope.resultMessage = "Erreur interne";
                $scope.dismissButton = "Réessayer";
                $scope.validateButton = null;
            });
        $("#confirmScanModal").modal('show');
    };

    $scope.validateAddSurvey = function () {
        $http.post('/app/validateAddUserSurvey/', {qrcode: $scope.QRcode})
            .success(function (data, status, header, config) {
                $scope.userSurveys.unshift({id: data.userSurveys.id, organame: data.userSurveys.organame, surveyname: data.userSurveys.surveyname, points: data.userSurveys.points, infos: data.userSurveys.infos, completed: data.userSurveys.completed, progression: 0});
                $http.post('/app/survey/initiateUserSurveySection', {survey: data.userSurveys.id});
            });
        $("#confirmScanModal").modal('hide');
    };

    $scope.$on("$destroy", function (){
        qrcodeStop();
    });
}]);

surveyManiaControllers.controller('SurveyAnswerController', ['$scope', '$http', '$window', '$sce', '$location', /*'vcRecaptchaService',*/ function($scope, $http, $window, $sce, $location/*, vcRecaptchaService*/) {
    $scope.url = $window.location.hash.split('/');
    $scope.surveyid = $scope.url[$scope.url.length - 1];
    $scope.survey;
    $scope.surveyEstimatedTime;
    $scope.surveyAnswerProgression;
    $scope.surveySection;
    $scope.sectionQuestionArray;
    $scope.answerArray;
    $scope.comments;
    $scope.lastComment;
    $scope.usercomment;
    $scope.error;
    $scope.usertime;
    $scope.userpoints;
    $scope.startPageDisplayed = true;

    $http.post('/app/survey/getSurvey', {survey: $scope.surveyid})
        .success(function (data, status, header, config) {
            $scope.survey = data.survey;
            $scope.surveyEstimatedTime = data.time;
            $scope.surveyAnswerProgression = data.progression;
            $('#startPage').fadeIn(800);
        })
        .error(function (data, status, header, config) {
            $location.path("/mysurveys");
        });

    $scope.getNextSection = function () {
        if ($scope.startPageDisplayed) {
            var captchaForm = $("#captcha-form").serialize().split("g-recaptcha-response=")[1];
            $http.post('/app/validateCaptcha', {captcha: captchaForm})
                .success(function (data, status, header, config) {
                    if (data.success) {
                        $('#startPage').fadeOut(800, function () {
                            $("#captcha-error").hide();
                            $scope.startPageDisplayed = false;
                            $scope.surveyAnswerProgression = 0;
                            $scope.getNextSectionContent();
                        });
                    }
                    else $("#captcha-error").show();
                })
                .error(function (data, status, header, config) {
                    $("#captcha-error").show();
                });
        } else {
            $('#answer').fadeOut(800, function () {
                $scope.surveyAnswerProgression = 0;
                $scope.getNextSectionContent();
            });
        }
    }

    $scope.getNextSectionContent = function () {
        $scope.surveySection = undefined;
        $scope.sectionQuestionArray = undefined;

        $http.post('/app/survey/getNextSurveyUserSection', {survey: $scope.surveyid})
            .success(function (data, status, header, config) {
                switch (data.message) {
                    case "Aucune section à remplir":
                        $scope.error = "Une erreur est survenue. Tentez de supprimer le sondage et de le rescanner";
                        break;

                    case "Aucune question dans la section":
                        $scope.error = data.message;
                        break;

                    case "Sondage terminé":
                        $scope.surveyAnswerProgression = 100;
                        $scope.userpoints = data.points;
                        $http.post('/app/survey/getComments', {survey: $scope.surveyid})
                            .success(function (data, status, header, config) {
                                $scope.comments = data.comments;
                            });
                        $('#endPage').fadeIn(800);
                        break;

                    case "OK":
                        $scope.surveySection = data.section;
                        $scope.sectionQuestionArray = data.question_array;
                        $scope.surveyAnswerProgression = data.progression;

                        for (var i = 0; i < $scope.sectionQuestionArray.length; ++i) {
                            for (var j = 0; j < $scope.sectionQuestionArray[i].parameters.length; ++j)
                                if ($scope.sectionQuestionArray[i].parameters[j].value_num != null)
                                    eval('$scope.sectionQuestionArray[i].param' + $scope.sectionQuestionArray[i].parameters[j].name  + ' = ' + $scope.sectionQuestionArray[i].parameters[j].value_num);
                                else
                                    eval('$scope.sectionQuestionArray[i].param' + $scope.sectionQuestionArray[i].parameters[j].name  + ' = ' + $scope.sectionQuestionArray[i].parameters[j].value_text);

                            for (var j = 0; j < $scope.sectionQuestionArray[i].medias.length; ++j) {
                                if ($scope.sectionQuestionArray[i].medias[j].media_type == 'youtube')
                                    $scope.sectionQuestionArray[i].medias[j].media_path = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + $scope.sectionQuestionArray[i].medias[j].media_path);
                                else if ($scope.sectionQuestionArray[i].medias[j].media_type = 'image_url')
                                    $scope.sectionQuestionArray[i].medias[j].media_path = $sce.trustAsResourceUrl($scope.sectionQuestionArray[i].medias[j].media_path);
                            }
                        }

                        $('#answer').fadeIn(800, function() {
                            $scope.usertime = new Date().getTime();
                        });
                        break;
                }
            })
            .error(function (data, status, header, config) {
                $location.path("/mysurveys");
            });
    }

    $scope.saveCurrentSection = function () {
        var nbOther = 0;
        $scope.error = undefined;
        $scope.answerArray = [];

        for (var i = 0; i < $scope.sectionQuestionArray.length; ++i) {
            var q = {id: $scope.sectionQuestionArray[i].question.id};
            $('#question' + $scope.sectionQuestionArray[i].question.question_order + 'master').removeClass("has-error");

            if ($scope.sectionQuestionArray[i].question.type_name == 'Ouverte') {
                q.ansText = document.getElementById('question' + $scope.sectionQuestionArray[i].question.question_order).value;

                if (q.ansText.length > $scope.sectionQuestionArray[i].parammax) {
                    $scope.error = "Veuillez répondre correctement à toutes les questions";
                    $('#question' + $scope.sectionQuestionArray[i].question.question_order + 'master').addClass("has-error");
                    continue;
                }
            }

            else if ($scope.sectionQuestionArray[i].question.type_name == 'QCM' && !$scope.sectionQuestionArray[i].question.multiple_answers) {
                if (document.querySelector('input[name="question' + $scope.sectionQuestionArray[i].question.question_order + '"]:checked') != undefined)
                    q.ansChecked = document.querySelector('input[name="question' + $scope.sectionQuestionArray[i].question.question_order + '"]:checked').value;
            }

            else if ($scope.sectionQuestionArray[i].question.type_name == 'QCM' && $scope.sectionQuestionArray[i].question.multiple_answers) {
                if (document.querySelectorAll('input[name="question' + $scope.sectionQuestionArray[i].question.question_order + '"]:checked').length > 0) {
                    q.ansChecked = [];
                    checked = document.querySelectorAll('input[name="question' + $scope.sectionQuestionArray[i].question.question_order + '"]:checked');
                    for (var j = 0; j < checked.length; ++j)
                        q.ansChecked.push(checked[j].value);
                }
            }

            else if ($scope.sectionQuestionArray[i].question.type_name == 'Numérique' || $scope.sectionQuestionArray[i].question.type_name == 'Slider') {
                q.ansNum = document.getElementById('question' + $scope.sectionQuestionArray[i].question.question_order).value;
                if (q.ansNum > $scope.sectionQuestionArray[i].parammax || q.ansNum < $scope.sectionQuestionArray[i].parammin) {
                    $scope.error = "Veuillez répondre correctement à toutes les questions";
                    $('#question' + $scope.sectionQuestionArray[i].question.question_order + 'master').addClass("has-error");
                    continue;
                }
            }

            if ($scope.sectionQuestionArray[i].question.type_name == 'Ouverte' || $scope.sectionQuestionArray[i].question.type_name == 'QCM' || $scope.sectionQuestionArray[i].question.type_name == 'Numérique' || $scope.sectionQuestionArray[i].question.type_name == 'Slider') {
                if ((q.ansText == undefined || q.ansText == "") && q.ansChecked == undefined && (q.ansNum == undefined || q.ansNum == "")) {
                    $scope.error = "Veuillez répondre correctement à toutes les questions";
                    $('#question' + $scope.sectionQuestionArray[i].question.question_order + 'master').addClass("has-error");
                    continue;
                }
                else $scope.answerArray.push(q);
            } else nbOther++;
        }

        if ($scope.answerArray.length == ($scope.sectionQuestionArray.length - nbOther) && $scope.answerArray.length != 0 && $scope.error == undefined) {
            $http.post('/app/survey/submitSurveyUserSection', {survey: $scope.surveyid, section: $scope.surveySection.id, answerArray: $scope.answerArray, time: new Date().getTime() - $scope.usertime})
                .success(function (data, status, header, config) {
                    $scope.getNextSection();
                })
                .error(function (data, status, header, config) {
                    $location.path("/mysurveys");
                });
        }
        else window.scrollTo(0, 0);
    }

    $scope.addComment = function () {
        if ($scope.usercomment != null && $scope.usercomment != "") {
            $http.post('/app/survey/addComment', {survey: $scope.surveyid, comment: $scope.usercomment})
                .success(function (data, status, header, config) {
                    $scope.usercomment = "";
                    $http.post('/app/survey/getComments', {survey: $scope.surveyid})
                        .success(function (data, status, header, config) {
                            var lastComment = data.comments.shift();
                            $scope.comments = data.comments;
                            $('#lastComment').hide();
                            $scope.lastComment = lastComment;
                            $('#lastComment').fadeIn(500);
                        });
                });
        }
    }

    $scope.remainingCharacter = function (id) {
        var elem = $('#question' + id);
        if (elem.attr('maxlength') != undefined && elem.attr('maxlength') != "") document.getElementById('question' + id + 'remaining').innerHTML = elem.attr('maxlength') - elem[0].value.length + ' caractères restants';
    }
}]);

surveyManiaControllers.controller('PrevisualisationController', ['$scope', '$http', '$window', '$sce', '$location', function($scope, $http, $window, $sce, $location) {
    $scope.url = $window.location.hash.split('/');
    $scope.surveyid = $scope.url[$scope.url.length - 1];
    $scope.survey;
    $scope.sections;
    $scope.surveySection;
    $scope.selectedSection;
    $scope.sectionQuestionArray;
    $scope.surveyEstimatedTime;
    $scope.sectionDisplayed = false;
    $scope.moving = false;

    $http.post('/app/survey/getSurvey', {survey: $scope.surveyid, prev: true})
        .success(function (data, status, header, config) {
            $scope.survey = data.survey;
            $scope.surveyEstimatedTime = data.time;
            $http.post('/app/previsualisation/getSections', {surveyid: $scope.surveyid})
                .success(function (data, status, header, config) {
                    $scope.sections = data.sections;

                    for (var h = 0; h < $scope.sections.length; ++h) {
                        $scope.sectionQuestionArray = $scope.sections[h].question_array;
                        for (var i = 0; i < $scope.sectionQuestionArray.length; ++i) {
                            for (var j = 0; j < $scope.sectionQuestionArray[i].parameters.length; ++j)
                                if ($scope.sectionQuestionArray[i].parameters[j].value_num != null)
                                    eval('$scope.sectionQuestionArray[i].param' + $scope.sectionQuestionArray[i].parameters[j].name  + ' = ' + $scope.sectionQuestionArray[i].parameters[j].value_num);
                                else
                                    eval('$scope.sectionQuestionArray[i].param' + $scope.sectionQuestionArray[i].parameters[j].name  + ' = ' + $scope.sectionQuestionArray[i].parameters[j].value_text);

                            for (var j = 0; j < $scope.sectionQuestionArray[i].medias.length; ++j) {
                                if ($scope.sectionQuestionArray[i].medias[j].media_type == 'youtube')
                                    $scope.sectionQuestionArray[i].medias[j].media_path = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + $scope.sectionQuestionArray[i].medias[j].media_path);
                                else if ($scope.sectionQuestionArray[i].medias[j].media_type = 'image_url')
                                    $scope.sectionQuestionArray[i].medias[j].media_path = $sce.trustAsResourceUrl($scope.sectionQuestionArray[i].medias[j].media_path);
                            }
                        }
                    }
                    $scope.sectionQuestionArray = undefined;
                })
                .error(function (data, status, header, config) {
                    $location.path("/createSurvey");
                });
        })
        .error(function (data, status, header, config) {
            $location.path("/createSurvey");
        });

    $scope.displaySection = function (index) {
        if (!$scope.moving) {
            $scope.moving = true;
            $scope.selectedSection = index;
            if ($scope.sectionDisplayed) {
                $('#answer').fadeOut(400, function() {
                    $scope.getSection(index);
                });
            } else {
                $scope.getSection(index);
            }
        }
    }

    $scope.getSection = function (index) {
        $scope.surveySection = $scope.sections[index].section;
        $scope.sectionQuestionArray = $scope.sections[index].question_array;

        if ($scope.sectionDisplayed) $scope.$apply();
        else $scope.sectionDisplayed = true;

        $('#answer').fadeIn(400, function() {
            $scope.moving = false;
            $('html, body').animate({
                scrollTop: $("#answer").offset().top + 20
            }, 1100);
        });
    }

    $scope.remainingCharacter = function (id) {
        var elem = $('#question' + id);
        if (elem.attr('maxlength') != undefined && elem.attr('maxlength') != "") document.getElementById('question' + id + 'remaining').innerHTML = elem.attr('maxlength') - elem[0].value.length + ' caractères restants';
    }
}]);

surveyManiaControllers.controller('ResultsController', ['$scope', '$http', '$window', '$sce', '$location', function($scope, $http, $window, $sce, $location) {
    /* General stats vars */
    $scope.url = $window.location.hash.split('/');
    $scope.surveyid = $scope.url[$scope.url.length - 1];
    $scope.survey;
    $scope.detailledInformations;
    $scope.surveyEstimatedTime;
    $scope.comments = null;
    $scope.widgets = null;

    /* Charts vars */
    $scope.chartsWidth = 400;
    $scope.chartsHeight = 300;
    $scope.sections;
    $scope.parameterSections;
    $scope.sectionQuestionArray;
    $scope.selectedSection = null;
    $scope.parameterSelectedSection = null;
    $scope.selectedQuestion = null;
    $scope.parameterSelectedQuestion = null;
    $scope.selectedModel = "Camembert";
    $scope.parameters = [];
    $scope.uselessWords = ['', 'de', 'le', 'et', 'en', 'la', 'au', 'des', 'à', 'que', 'un', 'une', 'y', 'les', 'le', 'aux', 'par', 'ce', 'ces', 'cet', 'cette', 'ses', 'son', 'sa', 'ses', 'ça', 'ca', 'dans', 'il', 'est', 'a', 'du', 'afin', 'mais', 'd\'un', 'qu\'un'];

    $http.post('/app/survey/getSurvey', {survey: $scope.surveyid, prev: true})
        .success(function (data, status, header, config) {
            $scope.survey = data.survey;
            $scope.surveyEstimatedTime = data.time;

            $http.post('/app/survey/getSurveyDetailledInfos', {survey: $scope.surveyid, prev: true})
                .success(function (data, status, header, config) {
                    $scope.detailledInformations = data;
                    $scope.detailledInformations.averageAnswerTimeMinutes = Math.floor(($scope.detailledInformations.averageAnswerTime / 1000) / 60);
                    $scope.detailledInformations.averageAnswerTimeSeconds = Math.round(($scope.detailledInformations.averageAnswerTime / 1000) - ($scope.detailledInformations.averageAnswerTimeMinutes * 60));
                    if ($scope.survey.surveytime != null && !$scope.survey.surveytime.days)
                        $scope.survey.surveytime.days = 0;
                })
                .error(function (data, status, header, config) {
                    $location.path("/organizationPanel");
                });

            $http.post('/app/results/getQuestions', {surveyid: $scope.surveyid})
                .success(function (data, status, header, config) {
                    $scope.sections = data.sections;

                    for (var h = 0; h < $scope.sections.length; ++h) {
                        $scope.sectionQuestionArray = $scope.sections[h].question_array;
                        for (var i = 0; i < $scope.sectionQuestionArray.length; ++i) {
                            for (var j = 0; j < $scope.sectionQuestionArray[i].parameters.length; ++j)
                                if ($scope.sectionQuestionArray[i].parameters[j].value_num != null)
                                    eval('$scope.sectionQuestionArray[i].param' + $scope.sectionQuestionArray[i].parameters[j].name  + ' = ' + $scope.sectionQuestionArray[i].parameters[j].value_num);
                                else
                                    eval('$scope.sectionQuestionArray[i].param' + $scope.sectionQuestionArray[i].parameters[j].name  + ' = ' + $scope.sectionQuestionArray[i].parameters[j].value_text);
                        }
                        $scope.sectionQuestionArray.unshift({question: {description: "Choisissez une question...", question_order:"default"}});
                    }
                    $scope.sectionQuestionArray = undefined;
                    $scope.sections.unshift({section: {title: "Choisissez une section...", section_order: "default"}});
                    $scope.selectedSection = $scope.sections[0];
                    $scope.parameterSelectedSection = $scope.sections[0];
                    $scope.parameterSections = jQuery.extend(true, [], $scope.sections);

                    for (var i = 0; i < $scope.parameterSections.length; ++i) {
                        if ($scope.parameterSections[i].section.section_order != "default") {
                            for (var j = 0; j < $scope.parameterSections[i].question_array.length; ++j) {
                                if ($scope.parameterSections[i].question_array[j].question.type_name != "QCM" && $scope.parameterSections[i].question_array[j].question.question_order != "default" ) {
                                    $scope.parameterSections[i].question_array = $scope.parameterSections[i].question_array.filter(function (el) {
                                        return el.question.id !== $scope.parameterSections[i].question_array[j].question.id;
                                    });
                                    j--;
                                }
                            }

                            if ($scope.parameterSections[i].question_array.length <= 1) {
                                $scope.parameterSections = $scope.parameterSections.filter(function (el) {
                                    return el.section.id !== $scope.parameterSections[i].section.id;
                                });
                                i--;
                            }
                        }
                    }
                })
                .error(function (data, status, header, config) {
                    $location.path("/organizationPanel");
                });

            $http.post('/app/results/getWidgets', {surveyid: $scope.surveyid})
                .success(function (data, status, header, config) {
                    $scope.widgets = data.widgets;
                })
                .error(function (data, status, header, config) {
                    $location.path("/organizationPanel");
                });

            $http.post('/app/survey/getComments', {survey: $scope.surveyid})
                .success(function (data, status, header, config) {
                    $scope.comments = data.comments;
                    $scope.initCommentsCloud();
                })
                .error(function (data, status, header, config) {
                    $location.path("/organizationPanel");
                });
        })
        .error(function (data, status, header, config) {
            $location.path("/organizationPanel");
        });

    $scope.initCommentsCloud = function () {
        var d = [];
        for (var i = 0; i < $scope.comments.length; ++i) {
            var words = $scope.comments[i].comment.replace(/([ .,;()"«»!?:]+)/g, ' ').split(' ');

            for (var j = 0; j < words.length; ++j) {
                if (d.length == 0) {
                    d.push({opt: words[j], nb: 1});
                } else {
                    for (var k = 0; k < d.length; ++k) {
                        if (d[k].opt == words[j]) {
                            d[k].nb++;
                            break;
                        } else if (k == d.length - 1) {
                            d.push({opt: words[j], nb: 1});
                            break;
                        }
                    }
                }
            }
        }

        d = d.filter(function (el) {
            for (var i = 0; i < $scope.uselessWords.length; ++i) {
                if (el.opt.toUpperCase() == $scope.uselessWords[i].toUpperCase())
                    return false;
            }
            return true;
        });

        d.sort(function(a, b) {
            return b.nb - a.nb
        });

        var table = new google.visualization.DataTable();
        table.addColumn('string', 'Tag');
        table.addColumn('number', 'Weight');
        for (var i = 0; i < d.length && i < 40; ++i)
            table.addRow([d[i].opt, d[i].nb]);

        var options = {
                        text_color: '#000000',
                        width: $scope.chartsWidth,
                        height: $scope.chartsHeight
                      };

        var chart = new gviz_word_cumulus.WordCumulus(document.getElementById('comments_chart_div'));
        chart.draw(table, options);
    }

    $scope.selectSection = function () {
        if ($scope.selectedSection != null && $scope.selectedSection.section.section_order != "default") {
            $scope.selectedQuestion = $scope.selectedSection.question_array[0];
            document.getElementById('questionSelection').style.display = "initial";
        } else {
            $scope.selectedQuestion = null;
            document.getElementById('questionSelection').style.display = "none";
        }
        $scope.selectQuestion();
    }

    $scope.selectQuestion = function() {
        if ($scope.selectedQuestion != null && $scope.selectedQuestion.question.question_order != "default") {
            if ($scope.selectedQuestion.question.type_name == "QCM")
                document.getElementById('modelSelection').style.display = "initial";
            else if ($scope.selectedQuestion.question.type_name == "Numérique" || $scope.selectedQuestion.question.type_name == "Slider")
                document.getElementById('modelSelection').style.display = "none";
            else if ($scope.selectedQuestion.question.type_name == "Ouverte")
                document.getElementById('modelSelection').style.display = "none";
        } else {
            document.getElementById('modelSelection').style.display = "none";
        }
        $scope.updatePreviewChart();
    }

    $scope.showAddParameter = function () {
        document.getElementById("addParameterButton").style.display = "none";
        document.getElementById("addParameterDiv").style.display = "initial";
    }

    $scope.hideAddParameter = function () {
        document.getElementById("addParameterButton").style.display = "initial";
        document.getElementById("addParameterDiv").style.display = "none";
    }

    $scope.parameterSelectSection = function () {
        if ($scope.parameterSelectedSection.section.section_order != "default") {
            $scope.parameterSelectedQuestion = $scope.parameterSelectedSection.question_array[0];
            document.getElementById('parameterQuestionSelection').style.display = "initial";
        } else {
            $scope.parameterSelectedQuestion = null;
            document.getElementById('parameterQuestionSelection').style.display = "none";
        }
    }

    $scope.addParameter = function () {
        if ($scope.parameterSelectedSection != null && $scope.parameterSelectedSection.section.section_order != "default" && $scope.parameterSelectedQuestion != null && $scope.parameterSelectedQuestion.question.question_order != "default") {
            $scope.parameters.push({section: $scope.parameterSelectedSection, question: $scope.parameterSelectedQuestion, selectedValues: []});
            $scope.parameterSelectedSection.question_array = $scope.parameterSelectedSection.question_array.filter(function (el) {
                return el.question.id !== $scope.parameterSelectedQuestion.question.id;
            });

            if ($scope.parameterSelectedSection.question_array.length <= 1) {
                $scope.parameterSections = $scope.parameterSections.filter(function (el) {
                    return el.section.id !== $scope.parameterSelectedSection.section.id;
                });
                $scope.parameterSelectedSection = $scope.parameterSections[0];
            }
            
            $scope.parameterSelectSection();
            $scope.hideAddParameter();
            $scope.updatePreviewChart();
        }
    }

    $scope.removeParameter = function (param) {
        $scope.parameters = $scope.parameters.filter(function (el) {
            return el !== param;
        });

        var done = false;
        for (var i = 0; i < $scope.parameterSections.length; i++) {
            if ($scope.parameterSections[i].section.section_order == param.section.section.section_order) {
                $scope.parameterSections[i].question_array.push(param.question);
                done = true;
            }
        }

        if (!done) {
            $scope.parameterSections.push(param.section);
            param.section.question_array.push(param.question);
        }
        $scope.updatePreviewChart();
    }

    $scope.updatePreviewChart = function () {
        if ($scope.selectedQuestion != null && $scope.selectedQuestion.question.question_order != "default") {
            for (var i = 0; i < $scope.parameters.length; ++i) {
                checked = document.querySelectorAll('input[name="param' + $scope.parameters[i].question.question.question_order + '"]:checked');
                $scope.parameters[i].selectedValues = [];

                for (var j = 0; j < checked.length; ++j)
                    $scope.parameters[i].selectedValues.push(checked[j].value);
            }

            var formatedParameters = [];
            for (var i = 0; i < $scope.parameters.length; ++i) {
                formatedParameters.push({questionid: $scope.parameters[i].question.question.id, description: $scope.parameters[i].question.question.description, selectedValues: []});
                for (var j = 0; j < $scope.parameters[i].selectedValues.length; ++j) {
                    formatedParameters[i].selectedValues.push({id: $scope.parameters[i].selectedValues[j]})

                    var val = '';
                    for (var k = 0; k < $scope.parameters[i].question.options.length; ++k) {
                        if ($scope.parameters[i].question.options[k].id == $scope.parameters[i].selectedValues[j]) {
                            val = $scope.parameters[i].question.options[k].choice_name;
                            break;
                        }
                    }
                    formatedParameters[i].selectedValues[j].choice_name = val;
                }
            }

            $http.post('/app/results/doQuery', {surveyid: $scope.surveyid, questionid: $scope.selectedQuestion.question.id, parameters: formatedParameters})
                .success(function (data, status, header, config) {
                    document.getElementById('masterChartPreview').innerHTML = '<div id="chartPreview"></div>';
                    $scope.drawChart($scope.selectedQuestion.question, formatedParameters, data.answers, $scope.selectedModel, 'chartPreview', 'csvPreview');
                })
        }
    }

    $scope.saveWidget = function () {
        if ($scope.selectedQuestion != null && $scope.selectedQuestion.question.question_order != "default") {
            var selModel = $scope.selectedModel;
            if ($scope.selectedQuestion.question.type_name == "Ouverte" || $scope.selectedQuestion.question.type_name == "Numérique" || $scope.selectedQuestion.question.type_name == "Slider")
                selModel = '';

            $http.post('/app/results/saveWidget', {surveyid: $scope.surveyid, questionid: $scope.selectedQuestion.question.id, parameters: $scope.parameters, chartType: selModel})
                .success(function (data, status, header, config) {
                    $http.post('/app/results/getWidgets', {surveyid: $scope.surveyid})
                        .success(function (data, status, header, config) {
                            $scope.widgets = data.widgets;
                        })
                        .error(function (data, status, header, config) {
                            $location.path("/organizationPanel");
                        });
                });
        }
    }

    $scope.deleteWidget = function (id) {
        $http.post('/app/results/deleteWidget', {surveyid: $scope.surveyid, widgteid: id})
            .success(function (data, status, header, config) {
                $http.post('/app/results/getWidgets', {surveyid: $scope.surveyid})
                    .success(function (data, status, header, config) {
                        $scope.widgets = data.widgets;
                    })
                    .error(function (data, status, header, config) {
                        $location.path("/organizationPanel");
                    });
            });
    }

    $scope.reorderWidgets = function (elem, target) {
        var divList = document.getElementById("savedCharts").children;
        var idList = [];
        for (var i = 0; i < divList.length; ++i)
            idList.push(divList[i].id.substring(14));

        elem = elem.substring(14);
        target = target.substring(14);

        if (idList.indexOf(elem) != idList.indexOf(target)) {
            var elemItem;
            var targetItem;

            for (var i = 0; i < $scope.widgets.length; ++i) {
                if (idList.indexOf($scope.widgets[i].id.toString()) > idList.indexOf(target))
                    $scope.widgets[i].cardorder++;

                if ($scope.widgets[i].id == elem)
                    elemItem = $scope.widgets[i];

                if ($scope.widgets[i].id == target)
                    targetItem = $scope.widgets[i];
            }

            if (idList.indexOf(elem) > idList.indexOf(target)) {
                elemItem.cardorder = targetItem.cardorder;
                targetItem.cardorder++;
            } else if (idList.indexOf(elem) < idList.indexOf(target)) {
                elemItem.cardorder = targetItem.cardorder + 1;
            }

            $scope.$apply();
            $http.post('/app/results/saveWidgetsOrder', {widgets: $scope.widgets});
        }
    }

    /* Draw every widget on page load */
    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        $scope.widgets.forEach(function(widget, index, array) {
            $http.post('/app/results/doQuery', {surveyid: $scope.surveyid, questionid: widget.question_id, parameters: widget.parameters})
                .success(function (data, status, header, config) {
                    var chartID = 'chartDiv' + widget.id;
                    var csvID = 'csvDiv' + widget.id;
                    $scope.drawChart(widget, widget.parameters, data.answers, widget.charttype, chartID, csvID);

                    var parameterContent = '';
                    if (widget.parameters.length == 0)
                        parameterContent = '<i class="fa fa-exclamation-circle"></i> Aucun paramètre ajouté';
                    else {
                        for (var i = 0; i < widget.parameters.length; ++i) {
                            var param = widget.parameters[i];
                            if (param.selectedValues.length != 0) {
                                if (i > 0)
                                    parameterContent += "<br/><br/>";
                                parameterContent += '<i class="fa fa-question-circle"></i> ' + param.description + '<br/><small><i>(';

                                for (var j = 0; j < param.selectedValues.length; ++j) {
                                    if (j > 0)
                                        parameterContent += ', ';
                                    parameterContent += param.selectedValues[j].choice_name;
                                }
                                parameterContent += ')</i></small>';
                            }
                        }
                    }

                    $('#tooltipp' + widget.id).qtip({
                        content: {
                            text: parameterContent
                        },
                        position: {
                            my: 'center left',
                            at: 'center right'
                        },
                        style: {
                            classes: 'qtip-tipsy qtip-shadow'
                        }
                    });
                });
        });
    });

    /* Generic functions to draw chart everywhere */
    $scope.drawChart = function (question, parameters, answers, model, chartDivID, csvDivID) {
        if (answers != null) {
            if (question.type_name == "QCM") {
                var d = [];
                for (var i = 0; i < answers.length; ++i) {
                    if (d.length == 0) {
                        d.push({opt: answers[i].choice_name, nb: 1});
                    } else {
                        for (var j = 0; j < d.length; ++j) {
                            if (d[j].opt == answers[i].choice_name) {
                                d[j].nb++;
                                break;
                            } else if (j == d.length - 1) {
                                d.push({opt: answers[i].choice_name, nb: 1});
                                break;
                            }
                        }
                    }
                }

                if (model == "Camembert") {
                    var table = new google.visualization.DataTable();
                    table.addColumn('string', 'Topping');
                    table.addColumn('number', 'Slices');
                    for (var i = 0; i < d.length; ++i) {
                        table.addRow([d[i].opt, d[i].nb]);
                    }

                    var options = {
                        'title': question.description + ' (' + answers.length + ' réponses)',
                        'width': $scope.chartsWidth,
                        'height': $scope.chartsHeight,
                        'backgroundColor': { fill:'transparent' },
                        'chartArea' : {left: 20, top: 50, width: "62%", height: "100%"}
                    };

                    var chart = new google.visualization.PieChart(document.getElementById(chartDivID));
                    chart.draw(table, options);
                    $scope.generateCSV(options.title, d, parameters, csvDivID);
                } else if (model == "Donut") {
                    var table = new google.visualization.DataTable();
                    table.addColumn('string', 'Topping');
                    table.addColumn('number', 'Slices');
                    for (var i = 0; i < d.length; ++i) {
                        table.addRow([d[i].opt, d[i].nb]);
                    }

                    var options = {
                        'title': question.description + ' (' + answers.length + ' réponses)',
                        'width': $scope.chartsWidth,
                        'height': $scope.chartsHeight,
                        'pieHole': 0.4,
                        'backgroundColor': { fill:'transparent' },
                        'chartArea' : {left: 20, top: 50, width: "62%", height: "100%"}
                    };

                    var chart = new google.visualization.PieChart(document.getElementById(chartDivID));
                    chart.draw(table, options);
                    $scope.generateCSV(options.title, d, parameters, csvDivID);
                } else if (model == "Histogramme") {
                    var table = new google.visualization.DataTable();
                    table.addColumn('string');
                    table.addColumn('number');
                    for (var i = 0; i < d.length; ++i) {
                        table.addRow([d[i].opt, d[i].nb]);
                    }

                    var options = {
                        'title': question.description + ' (' + answers.length + ' réponses)',
                        'width': $scope.chartsWidth,
                        'height': $scope.chartsHeight,
                        'legend': 'none',
                        'backgroundColor': { fill:'transparent' },
                        'chartArea' : {left: 20, top: 50, width: "62%", height: "100%"}
                    };

                    var chart = new google.visualization.ColumnChart(document.getElementById(chartDivID));
                    chart.draw(table, options);
                    $scope.generateCSV(options.title, d, parameters, csvDivID);
                } else if (model == "Tableau") {
                    var table = new google.visualization.DataTable();
                    table.addColumn('string', 'Réponse');
                    table.addColumn('number', 'Nombre');
                    for (var i = 0; i < d.length; ++i) {
                        table.addRow([d[i].opt, d[i].nb]);
                    }

                    var options = {
                        'title': question.description + ' (' + answers.length + ' réponses)',
                        'showRowNumber': true,
                        'chartArea' : {left: 20, top: 50, width: "62%", height: "100%"}
                    };

                    var chart = new google.visualization.Table(document.getElementById(chartDivID));
                    chart.draw(table, options);
                    $scope.generateCSV(options.title, d, parameters, csvDivID);
                }                
            } else if (question.type_name == "Numérique" || question.type_name == "Slider") {
                var d = [];
                for (var i = 0; i < answers.length; ++i) {
                    if (d.length == 0) {
                        d.push({opt: answers[i].answer_num, nb: 1});
                    } else {
                        for (var j = 0; j < d.length; ++j) {
                            if (d[j].opt == answers[i].answer_num) {
                                d[j].nb++;
                                break;
                            } else if (j == d.length - 1) {
                                d.push({opt: answers[i].answer_num, nb: 1});
                                break;
                            }
                        }
                    }
                }

                
                var table = new google.visualization.DataTable();
                table.addColumn('number');
                table.addColumn('number');

                for (var i = 0; i < d.length; ++i) {
                    table.addRow([d[i].opt, d[i].nb]);
                }

                var options = {
                    'title': question.description + ' (' + answers.length + ' réponses)',
                    'hAxis': {title: 'Valeur'},
                    'vAxis': {title: 'Nombre'},
                    'legend': 'none',
                    'width': $scope.chartsWidth,
                    'height': $scope.chartsHeight,
                    'backgroundColor': { fill:'transparent' },
                    'chartArea' : {left: 20, top: 50, width: "62%", height: "100%"}
                };

                var chart = new google.visualization.ScatterChart(document.getElementById(chartDivID));
                chart.draw(table, options);
                $scope.generateCSV(options.title, d, parameters, csvDivID);
            } else if (question.type_name == "Ouverte") {
                var d = [];
                for (var i = 0; i < answers.length; ++i) {
                    var words = answers[i].answer_text.replace(/([ .,;()"«»!?:]+)/g, ' ').split(' ');

                    for (var j = 0; j < words.length; ++j) {
                        if (d.length == 0) {
                            d.push({opt: words[j], nb: 1});
                        } else {
                            for (var k = 0; k < d.length; ++k) {
                                if (d[k].opt == words[j]) {
                                    d[k].nb++;
                                    break;
                                } else if (k == d.length - 1) {
                                    d.push({opt: words[j], nb: 1});
                                    break;
                                }
                            }
                        }
                    }
                }

                d = d.filter(function (el) {
                    for (var i = 0; i < $scope.uselessWords.length; ++i) {
                        if (el.opt.toUpperCase() == $scope.uselessWords[i].toUpperCase())
                            return false;
                    }
                    return true;
                });

                d.sort(function(a, b) {
                    return b.nb - a.nb
                });

                var table = new google.visualization.DataTable();
                table.addColumn('string', 'Tag');
                table.addColumn('number', 'Weight');
                for (var i = 0; i < d.length && i < 40; ++i)
                    table.addRow([d[i].opt, d[i].nb]);

                var options = {
                    'title': question.description + ' (' + answers.length + ' réponses)',
                    'text_color': '#000000',
                    'width': 290,
                    'height': 290,
                    'chartArea' : {left: 20, top: 50, width: "62%", height: "100%"}
                };

                var chart = new gviz_word_cumulus.WordCumulus(document.getElementById(chartDivID));
                chart.draw(table, options);
                $scope.generateCSV(options.title, d, parameters, csvDivID);
            }
        }
    }

    $scope.generateCSV = function (title, table, parameters, csvDivID) {
        if (table.length > 0) {
            var csvData = title + '\n\n';
            if (parameters != null) {
                for (var i = 0; i < parameters.length; ++i) {
                    if (parameters[i].selectedValues.length > 0) {
                        csvData += parameters[i].description + ' : ';
                        for (var j = 0; j < parameters[i].selectedValues.length; ++j) {
                            if (j > 0)
                                csvData += ' \\ ';
                            csvData += parameters[i].selectedValues[j].choice_name;
                        }
                        csvData += '\n';
                    }
                }
                csvData += '\n\n';
            }

            csvData += 'Name,Weight\n';
            for (var i = 0; i < table.length; ++i)
                csvData += table[i].opt + ',' + table[i].nb + '\n';

            document.getElementById(csvDivID).innerHTML = '<a style="color: black" download="data.csv" href="data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData) + '">Télécharger au format CSV</a>';
       } else {
            document.getElementById(csvDivID).innerHTML = '';
       }
    }
    /* End of generic functions to draw chart everywhere */

    $scope.$on("$destroy", function(){
        $(".qtip").remove();
    });
}]);

surveyManiaControllers.controller('Ranking', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    if ($scope.isLogged) $scope.api_rank_route = '/app/ranking/get/users';
    else $scope.api_rank_route = '/ranking/get/users';
    $http.get($scope.api_rank_route)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.ranking_users = data.users;
                if (data.user != undefined) $scope.rank_user_id = data.user;

                for (var i = 0; i < $scope.ranking_users.length; i++) {
                    var tmp_rank = i + 1;

                    if (tmp_rank == 1) {
                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-1">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['points'] + '</td></tr>';
                    }
                    else if (tmp_rank == 2) {
                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-2">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['points'] + '</td></tr>';
                    }
                    else if (tmp_rank == 3) {
                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-3">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['points'] + '</td></tr>';
                    }
                    else {
                        var rank_row = '<tr class="odd gradeX"><td class="center">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['points'] + '</td></tr>';
                    }
                    $("#ranking-table").append(rank_row);
                    if ($scope.rank_user_id != undefined && $scope.rank_user_id == $scope.ranking_users[i]['user_id']) {
                        var user_rank_row = '<tr class="odd gradeX" style="font-weight: bold; color: #f5c950"><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + tmp_rank + ' <SUP>e</SUP></td><td class="center">' + $scope.ranking_users[i]['points'] + ' points</td></tr>';
                        $("#user-rank-table").append(user_rank_row);
                        $("#user-rank-div").show();
                    }
                }

                $('#dataTables-example').DataTable({
                        responsive: true
                });
            }
        })
        .error(function (data, status, headers, config) {});
}]);

surveyManiaControllers.controller('GamesController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    var options = {
      useEasing : true, 
      useGrouping : true, 
      separator : '', 
      decimal : '.', 
      prefix : '', 
      suffix : '' 
    };

    $scope.game_current = function (gameInfos) {
        $scope.game_curr = gameInfos;
    };

    $http.get('/app/games/get')
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.games = data.games;
                console.log($scope.games);
            }
        })
        .error(function (data, status, headers, config) {});

    $http.get('/app/user/get/points')
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.game_user = data.user;
                console.log($scope.game_user);
            }
        })
        .error(function (data, status, headers, config) {});

    $http.post('/app/getUser/')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.user = data.user;
                var count_width = $.fn.textWidth($scope.user.owner_points + '', 'Arial', 23);
                console.log(count_width);
                $("#user_points_count").width(count_width);
                setTimeout(function(){ 
                    var demo = new CountUp("user_points_count", 0, $scope.user.owner_points, 0, 2.5, options);
                    demo.start();
                 }, 2000);
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.verifErrMess = data.error + '. ' + data.message;
        });

    $scope.openFbShareBut = function (gameid) {
        window.open('http://www.facebook.com/sharer/sharer.php?u=http://localhost:1337/#/game/' + gameid + '&title=surveymania', 'sharewin', 'height=500,width=500');
    };
}]);

surveyManiaControllers.controller('GameController', ['$scope', '$http', '$window', '$location', '$routeParams', function($scope, $http, $window, $location, $routeParams) {
    var options = {
      useEasing : true, 
      useGrouping : true, 
      separator : '', 
      decimal : '.', 
      prefix : '', 
      suffix : '' 
    };

    $scope.gameid = $routeParams.gameid;
    $http.get('/app/games/get')
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.game = data.games[$scope.gameid - 1];
                $scope.oldgame = $.extend({}, $scope.game);
                console.log($scope.game);
            }
        })
        .error(function (data, status, headers, config) {});
    $http.get('/app/user/get/points')
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.game_user = data.user;
                $scope.oldgameuser = $.extend({}, $scope.game_user[0]);
                console.log($scope.game_user);
            }
        })
        .error(function (data, status, headers, config) {});

    $http.post('/app/getUser/')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.user = data.user;
                var count_width = $.fn.textWidth($scope.user.owner_points + '', 'Arial', 23);
                console.log(count_width);
                $("#user_points_count").width(count_width);
                setTimeout(function(){ 
                    var demo = new CountUp("user_points_count", 0, $scope.user.owner_points, 0, 2.5, options);
                    demo.start();
                }, 500);
            }
            else $scope.verifErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            $scope.verifErrMess = data.error + '. ' + data.message;
        });

    $http.get('/app/game/' + $scope.gameid + '/ranking')
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                $scope.ranking_users = data.users;
                console.log($scope.ranking_users);
                if (data.user != undefined) $scope.rank_user_id = data.user;

                for (var i = 0; i < $scope.ranking_users.length; i++) {
                    var tmp_rank = i + 1;

                    if (tmp_rank == 1) {
                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-1">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                    }
                    else if (tmp_rank == 2) {
                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-2">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                    }
                    else if (tmp_rank == 3) {
                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-3">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                    }
                    else {
                        var rank_row = '<tr class="odd gradeX"><td class="center">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                    }
                    $("#ranking-table").append(rank_row);
                    if ($scope.rank_user_id != undefined && $scope.rank_user_id == $scope.ranking_users[i]['user_id']) {
                        $("#game_user_rank").html(tmp_rank + '');
                    }
                }
            }
        })
        .error(function (data, status, headers, config) {});

    $scope.openFbShareBut = function (gameid) {
        window.open('http://www.facebook.com/sharer/sharer.php?u=http://localhost:1337/#/game/' + gameid + '&title=surveymania', 'sharewin', 'height=500,width=500');
    };

    var div_score_big = $('#game_user_big_score');
    var div_rank = $('#game_user_rank');
    var div_score = $('#game_user_score');
    var div_points = $('#game_user_score');

    $scope.validateScore = function (score, points) {
        console.log("toto");
        $http.post('/app/game/post/score', {score: score, points: points, game: $scope.game})
            .success(function (data, status, headers, config) {
                console.log(data);
                if (data.action == 'updated') {
                    setTimeout(function(){
                            $scope.oldgame.score = $scope.game.score;
                            $scope.oldgame.points = $scope.game.points;
                            $scope.game.score = score;
                            $scope.game.points = points;
                            $scope.oldgameuser.user_points = $scope.game_user[0].user_points;
                            $scope.game_user[0].user_points = $scope.game_user[0].user_points + ($scope.game.points - $scope.oldgame.points);
                            div_score_big.html($scope.game.score);
                            div_score.html($scope.game.score);
                            div_points.html($scope.game.points);
                            $scope.$apply();
                    }, 1000);
                    $('#game-description-stats').fadeOut(1000, function(){
                        $(this).fadeIn(1000, function(){
                            setTimeout(function(){ 
                                var demo = new CountUp("user_points_count", $scope.oldgameuser.user_points, $scope.game_user[0].user_points, 0, 2.5, options);
                                demo.start();
                        }, 500);
                        });
                    });


                    $http.get('/app/game/' + $scope.gameid + '/ranking')
                        .success(function (data, status, headers, config) {
                            if (data.error == undefined) {
                                $("#ranking-table").html(' ');
                                $scope.ranking_users = data.users;
                                console.log($scope.ranking_users);
                                if (data.user != undefined) $scope.rank_user_id = data.user;

                                for (var i = 0; i < $scope.ranking_users.length; i++) {
                                    var tmp_rank = i + 1;

                                    if (tmp_rank == 1) {
                                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-1">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                                    }
                                    else if (tmp_rank == 2) {
                                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-2">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                                    }
                                    else if (tmp_rank == 3) {
                                        var rank_row = '<tr class="odd gradeX"><td class="center ranking-top-3">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                                    }
                                    else {
                                        var rank_row = '<tr class="odd gradeX"><td class="center">' + tmp_rank + '</td><td class="center">' + $scope.ranking_users[i]['name'] + ' ' + $scope.ranking_users[i]['lastname'] + '</td><td class="center">' + $scope.ranking_users[i]['score'] + '</td></tr>';
                                    }
                                    $("#ranking-table").append(rank_row);
                                    if ($scope.rank_user_id != undefined && $scope.rank_user_id == $scope.ranking_users[i]['user_id']) {
                                        $("#game_user_rank").html(tmp_rank + '');
                                    }
                                }
                            }
                        })
                        .error(function (data, status, headers, config) {});
                }
                else if (data.action == 'notupdated') {

                }
                else if (data.action == 'created') {

                }
                $('#phaser-example').html(' ');
                $('#phaser-example').hide();
                $('#phaser-example-img').show();
            })
            .error(function (data, status, headers, config) {console.log(data)});
    };
}]);

surveyManiaControllers.controller('GameMailController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    
    $scope.emailContacts = "";
    $scope.GameMailSubmit = function (gameInfos) {
        var user_rank = $('#game_user_rank').html();
        user_rank = (user_rank == undefined) ? '-- ' : user_rank;
        $scope.emailContent = " <!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>SurveyMania</title><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css\"><style>.games-images {width: 100%;border-radius: 5px;box-shadow: 2px 2px 10px #000;} body * {text-decoration: none!important;} a {text-decoration: none!important;} a * {text-decoration: none!important;} .games-description {margin: auto;width: 100%;background: rgba(0, 0, 0, 0.8);position: absolute;top: 56px; margin-right: 15px;font-family: 'Arial';color: #fff;padding: 50px;border-radius: 5px 5px 0 0;display: none;box-shadow: 2px 2px 10px #000;margin-top: 70px;margin-bottom: 100px;} .game-description { margin: auto;  width: 100%;background: rgba(0, 0, 0, 0.8);font-family: 'Arial';color: #fff;padding: 50px;padding-bottom: 200px;}</style> </head><body style=\"font-family: 'Arial'\"><div style=\"width: 100%; height: 100px; background: #f5c950; text-align: center\"> <h1 style=\"color: #fff; line-height: 100px\">SurveyMania &nbsp; <span style=\"color: #ddd; font-weight: normal\">|</span> &nbsp; <span style=\"font-weight: normal\">Relève le défi et viens me battre !</span></h1></div><a href=\"http://localhost:1337/#/game/" + gameInfos.id_game + "\"><div class=\"game-description\" > ";
                if ($scope.game_user[0].user_points < gameInfos.points_req) {
                    $scope.emailContent += "<h3 style=\"color: #fff\">" + gameInfos.name + "</h3><br><span style=\"color: #f5c950;\">Points requis: </span> " + gameInfos.points_req + " <br><span style=\"color: #f5c950;\">Points restants: </span> " + (gameInfos.points_req - $scope.game_user[0].user_points) + " <br><br> <div style=\"width: 60%\"><hr></div><br><p>" + gameInfos.description + "</p><br><div style=\"font-size: 50px; margin-top: -35px; display: inline-block;\"><i class=\"fa fa-users\" style=\"color: #999;\"></i> <span id=\"game_user_rank\">--</span>e&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;</div><div style=\"display: inline-block; font-size: 50px; margin-top: -35px;\"><i class=\"fa fa-trophy\" style=\"color: #d14836;\"></i> -- pts</div>";
                }
                else if (gameInfos.user_id != undefined) {
                    $scope.emailContent += "<h3 style=\"color: #fff\">" + gameInfos.name + "</h3><br><span style=\"color: #f5c950;\">Points requis: </span> " + gameInfos.points_req + " <br><span style=\"color: #f5c950;\">Points gagnés: </span> " + gameInfos.points + " <br><span style=\"color: #f5c950;\">Meilleur score: </span> " + gameInfos.score + " " + gameInfos.type + " <br><br> <div style=\"width: 60%\"><hr></div><br><p>" + gameInfos.description + "</p><br><div style=\"display: inline-block; font-size: 50px;\"><i class=\"fa fa-users\" style=\"color: #999;\"></i> <span id=\"game_user_rank\">" + user_rank + "</span>e&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;</div><div style=\"display: inline-block; font-size: 50px;\"><i class=\"fa fa-trophy\" style=\"color: #f5c950;\"></i> " + gameInfos.score + " pts</div>";
                }
                else if ($scope.game_user[0].user_points >= gameInfos.points_req && gameInfos.user_id == undefined) {
                    $scope.emailContent += "<h3 style=\"color: #fff\">" + gameInfos.name + "</h3><br><span style=\"color: #f5c950;\">Points requis: </span> " + gameInfos.points_req + " <br><span style=\"color: #f5c950;\">Points gagnés: </span> -- <br><span style=\"color: #f5c950;\">Meilleur score: </span> -- <br> <br><div style=\"width: 60%\"><hr></div><br><p>" + gameInfos.description + "</p><br><div style=\"display: inline-block; font-size: 50px;\"><i class=\"fa fa-users\" style=\"color: #999;\"></i> <span id=\"game_user_rank\">" + user_rank + "</span>e&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;</div><div style=\"display: inline-block; font-size: 50px;\"><i class=\"fa fa-trophy\" style=\"color: #d14836;\"></i> -- pts</div>";
                }
                $scope.emailContent += "</div></a></body></html>";
        if ($scope.emailContacts != "" && $scope.emailContacts != undefined) {
            $http.post('/app/games/share/mail', {mailContacts: $scope.emailContacts, mailContent: $scope.emailContent, mailGame: gameInfos.name, mailImage: gameInfos.image_path})
            .success(function (data, status, header, config) {
                $scope.mailErrMess = "Mails envoyés avec succès";
            })
            .error(function (data, status, header, config) {
            });
        }
    };
}]);


surveyManiaControllers.controller('OrganizationPanel', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.categories = [];
    $scope.newCategory = {name: "", color: "#000000"};
    $scope.isValidCategoryName = true;
    $scope.isValidCategoryColor = true;
    $scope.orgaSurveys = [];

    $scope.actionErrMess = undefined;
    $scope.actionSuccMess = undefined;
    $scope.shopadmins = [];
    $scope.shopadminDel = undefined;
    $scope.user = {email: "", firstname: "", lastname: ""};

    $scope.isValidEmail = false;
    $scope.isValidFirstName = false;
    $scope.isValidLastName = false;

    $http.post('/app/category/get')
        .success(function (data, status, header, config) {
            $scope.categories = data.categories;
        });

    $http.post('/app/survey/getOrganizationSurveys')
        .success(function (data, status, headers, config) {
            $scope.orgaSurveys = data.orgaSurveys;
    });

    $scope.email_check = function(){$scope.isValidEmail = !(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.email));}
    $scope.firstName_check = function(){$scope.isValidFirstName = (!(/^[A-zÀ-ú-']{2,}$/.test($scope.user.firstname)) || !$scope.user.firstname.length);}
    $scope.lastName_check = function(){$scope.isValidLastName = (!(/^[A-zÀ-ú-']{2,}$/.test($scope.user.lastname)) || !$scope.user.lastname.length);}

    $scope.getAdmin = function (shopadminId) {
        for (var i = 0; i < $scope.shopadmins.length; i++) {
            if ($scope.shopadmins[i].admin_id == shopadminId) return $scope.shopadmins[i];
        }
        return undefined;
    };

    $scope.getIndex = function () {
        for (var i = 0; i < $scope.shopadmins.length; i++) {
            if ($scope.shopadmins[i].admin_id == $scope.shopadminDel.admin_id) return i;
        }
        return -1;
    };

    $scope.hide_modal = function(name) {
        $('#' + name).modal('hide');
    };

    $scope.get_shopadmins = function()
    {
        $http.get('/app/account/pro/get/shopadmins')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                if (data.shopadmins != undefined) $scope.shopadmins = data.shopadmins;
            }
            else $scope.actionErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.actionErrMess = data.error + '. ' + data.message;
        });
    };

    $scope.add_shopadmin = function()
    {
        if ($scope.isValidEmail || $scope.isValidFirstName || $scope.isValidLastName) return console.log("not valid");
        $http.post('/app/account/pro/add/shopadmin', $scope.user)
        .success(function (data, status, headers, config) {
            console.log(data);
            $('#modalAddAdmin').modal('hide');
            if (data.error == undefined) {
                if (data.shopadmin != undefined) {
                    $scope.shopadmins.splice(0, 0, data.shopadmin);
                    $scope.actionSuccMess = 'L\'administrateur de magasin a bien été ajouté. Un email lui a été envoyé avec ses identifiants de connexion.';
                }
            }
            else $scope.actionErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $('#modalAddAdmin').modal('hide');
            $scope.actionErrMess = data.error + '. ' + data.message;
        });
    };

    $scope.delConfirm_shopadmin = function($id)
    {
        $scope.shopadminDel = $scope.getAdmin($id);
        if ($scope.shopadminDel != undefined) $('#modalDelAdmin').modal('show');
    };

    $scope.del_shopadmin = function()
    {
        $http.post('/app/account/pro/del/shopadmin', {shopadminId: $scope.shopadminDel.admin_id})
        .success(function (data, status, headers, config) {
            console.log(data);
            $('#modalDelAdmin').modal('hide');
            if (data.error == undefined) {
                index = $scope.getIndex();
                $scope.shopadmins.splice(index, (index < 0) ? 0 : 1);
                $scope.actionSuccMess = 'L\'administrateur de magasin a bien été supprimé';
            }
            else $scope.actionErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $('#modalDelAdmin').modal('hide');
            $scope.actionErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.get_shopadmins();

    $scope.publishSurvey = function($id, elem)
    {
        $http.post('/app/account/admin/publish/survey', {surveyid: $id})
            .success(function (data, status, header, config) {
                elem.publied = true;
            })
            .error(function (data, status, header, config) {

            });
    }

    $scope.stopSurvey = function($id, elem)
    {
        $http.post('/app/account/admin/stop/survey', {surveyid: $id})
            .success(function (data, status, header, config) {
                elem.stopped = true;
            })
            .error(function (data, status, header, config) {

            });
    }

    $scope.printQrCode = function($id, $title)
    {
        var qrcodestr;
        $http.post('/app/account/admin/survey/getCode', {surveyid: $id})
            .success(function (data, status, header, config) {
                qrcodestr = data.qrcodestr;
                document.getElementById("qrimage").innerHTML = "<h1>"+$title+"</h1><img onload='window.print()' src='https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=" + qrcodestr + "'/>";
            })
            .error(function (data, status, header, config) {

            });
    }

    $scope.redirectToSurvey = function($id)
    {
        $location.path("/results/" + $id);        
    }

    $scope.categoryNameCheck = function () {$scope.isValidCategoryName = (/^.{2,25}$/.test($scope.newCategory.name));}
    $scope.categoryColorCheck = function () {$scope.isValidCategoryColor = (/^#(\d|[A-Fa-f]){6}$/.test($scope.newCategory.color));}

    $scope.addCategory = function () {
        $http.post('/app/category/add', {newCategory: $scope.newCategory})
            .success(function (data, status, header, config) {
                alert(data.message);
                if (data.message == "done") {
                    $scope.categories.push({name: $scope.newCategory.name, color: $scope.newCategory.color});
                }
            })
            .error(function (data, status, header, config) {

            });
    };

    $scope.updateCategoryName = function (a) {
        var color = document.getElementById("catNaFoLi" + a.defaultValue);
        if (a.value != a.defaultValue) {
            $http.post('/app/category/update', {category: {name: a.value, color: color.value}, old_category: a.defaultValue, n: true})
                .success(function (data, status, header, config) {
                    alert(data.message);
                    if (data.message == "done") {
                        a.defaultValue = a.value;
                        color.id = "catNaFoLi" + a.defaultValue;
                    } else {
                        a.value = a.defaultValue;
                    }
                })
                .error(function (data, status, header, config) {
                    alert(data.message);
                    a.value = a.defaultValue;
                });
        }
    };

    $scope.updateCategoryColor = function (a) {
        $http.post('/app/category/update', {category: {name: a.id.substr(9), color: a.value}, old_category: a.id.substr(9), n: false})
            .success(function (data, status, header, config) {
                alert(data.message);
            })
            .error(function (data, status, header, config) {
                alert(data.message);
            });
    };

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
       $('.categoryColorPicker').each(function(){
            $(this).spectrum({
                preferredFormat: "hex",
                color : $(this).attr('value')
            });
        });
    });

    $scope.$on("$destroy", function(){
        $('.categoryColorPicker').each(function(){
            $(this).spectrum("destroy");
        });
        $('.sp-container').remove();
    });
}]);

surveyManiaControllers.directive('categoryRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});

/*surveyManiaControllers.controller('ShopAdmins', ['$scope', '$http', '$window', function($scope, $http, $window) {
    $scope.actionErrMess = undefined;
    $scope.actionSuccMess = undefined;
    $scope.shopadmins = [];
    $scope.shopadminDel = undefined;
    $scope.user = {email: "", firstname: "", lastname: ""};

    $scope.isValidEmail = false;
    $scope.isValidFirstName = false;
    $scope.isValidLastName = false;
    $scope.email_check = function(){$scope.isValidEmail = !(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.email));}
    $scope.firstName_check = function(){$scope.isValidFirstName = (!(/^[A-zÀ-ú-']{2,}$/.test($scope.user.firstname)) || !$scope.user.firstname.length);}
    $scope.lastName_check = function(){$scope.isValidLastName = (!(/^[A-zÀ-ú-']{2,}$/.test($scope.user.lastname)) || !$scope.user.lastname.length);}

    $scope.getAdmin = function (shopadminId) {
        for (var i = 0; i < $scope.shopadmins.length; i++) {
            if ($scope.shopadmins[i].admin_id == shopadminId) return $scope.shopadmins[i];
        }
        return undefined;
    };
    $scope.getIndex = function () {
        for (var i = 0; i < $scope.shopadmins.length; i++) {
            if ($scope.shopadmins[i].admin_id == $scope.shopadminDel.admin_id) return i;
        }
        return -1;
    };
    $scope.hide_modal = function(name) {
        $('#' + name).modal('hide');
    };
    $scope.get_shopadmins = function()
    {
        $http.get('/app/account/pro/get/shopadmins')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                if (data.shopadmins != undefined) $scope.shopadmins = data.shopadmins;
            }
            else $scope.actionErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $scope.actionErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.add_shopadmin = function()
    {
        if ($scope.isValidEmail || $scope.isValidFirstName || $scope.isValidLastName) return console.log("not valid");
        $http.post('/app/account/pro/add/shopadmin', $scope.user)
        .success(function (data, status, headers, config) {
            console.log(data);
            $('#modalAddAdmin').modal('hide');
            if (data.error == undefined) {
                if (data.shopadmin != undefined) {
                    $scope.shopadmins.splice(0, 0, data.shopadmin);
                    $scope.actionSuccMess = 'L\'administrateur de magasin a bien été ajouté. Un email lui a été envoyé avec ses identifiants de connexion.';
                }
            }
            else $scope.actionErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $('#modalAddAdmin').modal('hide');
            $scope.actionErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.delConfirm_shopadmin = function($id)
    {
        $scope.shopadminDel = $scope.getAdmin($id);
        if ($scope.shopadminDel != undefined) $('#modalDelAdmin').modal('show');
    };
    $scope.del_shopadmin = function()
    {
        $http.post('/app/account/pro/del/shopadmin', {shopadminId: $scope.shopadminDel.admin_id})
        .success(function (data, status, headers, config) {
            console.log(data);
            $('#modalDelAdmin').modal('hide');
            if (data.error == undefined) {
                index = $scope.getIndex();
                $scope.shopadmins.splice(index, (index < 0) ? 0 : 1);
                $scope.actionSuccMess = 'L\'administrateur de magasin a bien été supprimé';
            }
            else $scope.actionErrMess = data.error + '. ' + data.message;
        })
        .error(function (data, status, headers, config) {
            console.log(data);
            $('#modalDelAdmin').modal('hide');
            $scope.actionErrMess = data.error + '. ' + data.message;
        });
    };
    $scope.get_shopadmins();
}]);*/
