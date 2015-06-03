
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


surveyManiaControllers.controller('DragAndDrop', ['$scope', '$routeParams', '$timeout', '$sce', '$http', 
    function($scope, $routeParams, $timeout, $sce, $http){
        $scope.list1 = [{'index':'','id':'0','title': 'Titre', 'label': $sce.trustAsHtml('<h1>Titre</h1>'), 'code' : $sce.trustAsHtml('<h1 ng-bind="title">Titre</h1>'), 'show':true, 'icon':'header'},
                        {'index':'','id':'1','title': 'Réponse libre', 'label':$sce.trustAsHtml('<h5>question</h5>'), 'code' : $sce.trustAsHtml('<textarea maxlength="255"></textarea>'), 'show':true, 'icon':'text-height'},
                        {'index':'','id':'2','title': 'Question fermée', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<input type="radio" name="yesno" value="0"> <span class="opt1">Oui</span><br><input type="radio" name="yesno" value="1" checked> <span class="opt2">Non</span>'), 'show':true, 'icon':'toggle-on'},
                        {'index':'','id':'3','title': 'Slider', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<input type="range" min="0" max="50" value="25" step="5" />'), 'show':true, 'icon':'sliders'},
                        {'index':'','id':'4','title': 'Branchement', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<select name="selectform"><option pos="0" value="1">Option 1</option></select>'), 'show':true, 'icon':'code-fork'},
                        {'index':'','id':'5','title': 'Numérique', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<input type="number" min="0" max="50" name="number" />'), 'show':true, 'icon':'list-ol'},
                        {'index':'','id':'6','title': 'Choix multiple', 'label':$sce.trustAsHtml('<h5>question</h5>'),'code' : $sce.trustAsHtml('<select name="selectform"><option pos="0" value="1">Option 1</option></select>'), 'show':true, 'icon':'list'},
                        {'index':'','id':'7','title': 'Texte libre', 'label':$sce.trustAsHtml('<p>Texte</p>'),'code' :  $sce.trustAsHtml('<p ng-bind="title">Titre</p>'), 'show':true, 'icon':'font'}
                        ]; 

        $scope.htmlList = new Array();
        $scope.htmlList[0] = new Array();

        $scope.sectionList = new Array('Section 1');

        $scope.questionList = new Array();
        $scope.categories = [];
        $scope.displayedList = [];

        $scope.currentListNumber = 0;
        $scope.displayedList = $scope.htmlList[0];

        $scope.answer ="";

        $scope.validateSurvey = function ()
        {
            $http.post('/app/account/admin/validate/survey', {list: $scope.questionList})
            .success(function (data, status, headers, config) {
                if (data.error == undefined) {
                    console.log("lol");
                    $scope.verifSuccMess = "Le compte a bien été refusé.";
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
            $scope.sectionList.push("Section "+($scope.sectionList.length + 1));
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
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'min':'', 'max':'', 'range':'', 'video':[], 'image':[]});
            }
            else if($item.id == 4) // Branchement
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'option':[], 'multiple':false, 'video':[], 'image':[]});
            }
            else if($item.id == 5) // Question numérique
            {
                $scope.questionList[i].push({'index': $index+($scope.currentListNumber*100), 'type':$item.id, 'title':$item.title, 'min':'', 'max':'', 'video':[], 'image':[]});
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
                    if($scope.questionList[i][j].index == $index)
                    {
                        $scope.questionList[i][j].index = $index;
                        $scope.questionList[i][j].type = 2;
                        $scope.questionList[i][j].title = $title;
                        $scope.questionList[i][j].label1 = $opt1;
                        $scope.questionList[i][j].label2 = $opt2;
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
                        $scope.questionList[i][j].index =  $index;
                        $scope.questionList[i][j].text = $text;
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
                        $scope.$apply();
                    }
                }
            }
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
                        str.push('<option value="'+i+'">'+$scope.sectionList[i]+'</option>');
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
            $scope.displayedList.splice($index, 1);
        }

        $http.post('/app/category/get')
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.categories = data.categories;
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
            return $scope.signupErrMess = 'Please provide all needed informations!';

        if($scope.isValidEmail || $scope.isValidConfirmPwd || $scope.isValidPwd || $scope.isValidFirstName || $scope.isValidLastName || $scope.isValidPhoneNumber)
            return $scope.signupErrMess = 'Please correct the errors below';

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
            if (splits[0] != 'data') return $scope.signupErrMess = 'Bad logo image format!';
            splits = splits[1].split(/\/(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'image') return $scope.signupErrMess = 'Bad logo image format!';
            splits = splits[1].split(/;(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'png' && splits[0] != 'jpeg') return $scope.signupErrMess = 'Bad logo image format!';
            else newuser.logo_type = (splits[0] == 'png') ? 'png' : 'jpg';
            splits = splits[1].split(/,(.+)?/);
            console.log(splits[0]);
            if (splits[0] != 'base64') return $scope.signupErrMess = 'Bad logo image format!';
            newuser.logo_img = splits[1];
        }

        $http.post('/signup', newuser)
        .success(function (data, status, headers, config) {
            if (data.error == undefined) {
                console.log(data);
                $scope.signupSuccMess = "Your account has been successfully created. An email has been sent, please follow its intructions to finish your inscription.";
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
  
    // ****************************

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

surveyManiaControllers.controller('SurveyAnswerController', ['$scope', '$http', '$window', '$sce', '$location', function($scope, $http, $window, $sce, $location) {
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
            $('#startPage').fadeOut(800, function () {
                $scope.startPageDisplayed = false;
                $scope.surveyAnswerProgression = 0;
                $scope.getNextSectionContent();
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
    $scope.startPageDisplayed = true;

  
    $scope.surveyEstimatedTime;
    $scope.surveySection;
    $scope.sectionQuestionArray;

    $http.post('/app/survey/getSurvey', {survey: $scope.surveyid, prev: true})
        .success(function (data, status, header, config) {
            $scope.survey = data.survey;
            $scope.surveyEstimatedTime = data.time;
            $http.post('/app/previsualisation/getSections', {surveyid: $scope.surveyid})
                .success(function (data, status, header, config) {
                    $scope.sections = data.sections;
                    $('#startPage').fadeIn(800);
                })
                .error(function (data, status, header, config) {
                    $location.path("/app/createSurvey");
                });
        })
        .error(function (data, status, header, config) {
            $location.path("/app/createSurvey");
        });

    $scope.displaySections = function () {
        if ($scope.startPageDisplayed) {
            $('#startPage').fadeOut(800, function () {
                $scope.startPageDisplayed = false;
                $('#sectionPage').fadeIn(800);
            });
        }
    }

    $scope.remainingCharacter = function (id) {
        var elem = $('#question' + id);
        if (elem.attr('maxlength') != undefined && elem.attr('maxlength') != "") document.getElementById('question' + id + 'remaining').innerHTML = elem.attr('maxlength') - elem[0].value.length + ' caractères restants';
    }
}]);

surveyManiaControllers.controller('Ranking', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    if ($scope.isLogged) $scope.api_rank_route = '/app/ranking/get/users';
    else $scope.api_rank_route = '/ranking/get/users';
    $http.get($scope.api_rank_route)
        .success(function (data, status, headers, config) {
            console.log(data);
            if (data.error == undefined) {
                $scope.ranking_users = data.users;
                if (data.user != undefined) $scope.rank_user_id = data.user;

                for (var i = 0; i < $scope.ranking_users.length; i++) {
                    var tmp_rank = i + 1;
                    /*if (tmp_rank == 1) tmp_rank = tmp_rank + ' &nbsp; <i class="fa fa-trophy fa-lg" style="color: gold"></i>';
                    else if (tmp_rank == 2) tmp_rank = tmp_rank + ' &nbsp; <i class="fa fa-trophy fa-lg" style="color: silver"></i>';
                    else if (tmp_rank == 3) tmp_rank = tmp_rank + ' &nbsp; <i class="fa fa-trophy fa-lg" style="color: Peru"></i>';*/
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


surveyManiaControllers.controller('OrganizationPanel', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
    $scope.categories = [];
    $scope.newCategory = {name: "", color: "#000000"};
    $scope.isValidCategoryName = true;
    $scope.isValidCategoryColor = true;
    $scope.orgaSurveys = [];

    $http.post('/app/category/get')
        .success(function (data, status, header, config) {
            $scope.categories = data.categories;
        });

    $http.post('/app/survey/getOrganizationSurveys')
        .success(function (data, status, headers, config) {
            $scope.orgaSurveys = data.orgaSurveys;
    });

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

surveyManiaControllers.controller('ShopAdmins', ['$scope', '$http', '$window', function($scope, $http, $window) {
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
}]);
