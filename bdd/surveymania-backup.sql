SET SCHEMA 'surveymania';

INSERT INTO user_types (type_name) VALUES
('user'), ('admin'), ('shop_owner'), ('shop_admin');

INSERT INTO achievements (name, image_path, description) VALUES 
('Bienvenue à SurveyMania !', 'img/achievements/signup.png', 'En finalisant votre inscription, vous avez reçu 200 points.'),
('Vous êtes devenu parrain !', 'img/achievements/parrain.png', 'En parrainant un nouvel utilisateur vous avez reçu 500 points.'),
('Coupe 1', 'img/achievements/cup1.png', 'Vous avez gagné la coupe 1.'),
('Médaille 1', 'img/achievements/medal1.png', 'Vous avez gagné la médaille 1.');

INSERT INTO organizations (name, description, adress, postal, town, country, telephone, logo_path, current_points, verified, verified_dt) VALUES
('EPITA', 'Ecole d''ingénieurs en informatique', '14 rue Voltaire', '94276', 'Kremlin Bicêtre', 'France', '0144080101', 'https://pbs.twimg.com/profile_images/534363526521819136/WLpToBj__bigger.jpeg', 50, false, NULL),
('EPF', 'Ecole d''ingénieurs généraliste', '3 rue lakanal', '92330', 'Sceaux', 'France', '0141130151', 'https://pbs.twimg.com/profile_images/891709693/Phi_normal.jpg', 50, false, NULL),
('Thales', 'Armement', '19, Rue Lucien Boxtael', '95370', 'Montigny-Lès-Cormeilles', 'France', '0663638061', 'img/organizations/3/logo.png', 50, true, '2015-03-23 08:27:48');

INSERT INTO users (email, password, user_type, user_organization, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, invite_dt, inviter_id, points, verified, verified_dt) VALUES 
('tommyblopes@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 2, NULL, 'Foo', 'Bar', NULL, NULL, NULL, NULL, NULL, '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, NULL, 50, true, '2015-03-19 04:33:32'),
('antoine.soler@epf.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 3, 2, 'Antoine', 'Soler', '0123456789', '6, allée des tulipes', '94470', 'Boissy Saint Leger', 'France', '2015-03-22 22:05:10', '2015-03-22 22:05:10', NULL, NULL, 50, true, '2015-03-22 22:05:10'),
('tommyblopes@msn.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Tommy', 'Lopes', '0659301096', '18, allée Henri Sellier', '92800', 'Puteaux', 'France', '2015-03-15 01:18:51', '2015-03-15 01:18:51', NULL, NULL, 3050, true, '2015-03-19 03:32:52'),
('lopes.tommy@epita.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 3, 1, 'Fabio', 'Fereirra', '0123456789', '1, rue Charles Lorilleux', '92800', 'Puteaux', 'France', '2015-03-25 08:05:10', '2015-03-25 08:05:10', NULL, NULL, 50, true, NULL),
('lopes_t@epita.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Andreas', 'Foti', NULL, NULL, NULL, NULL, NULL, '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, NULL, 550, true, '2015-03-25 03:11:43'),
('bourdinclement95@gmail.com', 'afa6c0952e63538841419d750772621df34c9656b41a1b3b439bafadf928f72c', 3, 3, 'Jean', 'Pierre', '0663638061', '19, Rue Lucien Boxtael', '95370', 'Montigny-Lès-Cormeilles', 'France', '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, 7, 50, true, '2015-03-25 03:11:43'),
('bourdi_c@epita.fr', 'afa6c0952e63538841419d750772621df34c9656b41a1b3b439bafadf928f72c', 1, NULL, 'Clément', 'Bourdin', '0663638061', '19, Rue Lucien Boxtael', '95370', 'Montigny-Lès-Cormeilles', 'France', '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, 3, 3400, true, '2015-03-25 03:11:43'),
('tommyblopes+5@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 4, 3, 'Richard', 'Forestier', NULL, NULL, NULL, NULL, NULL, '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, 7, 50, true, '2015-03-19 04:33:32'),
('tommyblopes+7@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 4, 3, 'Alain', 'Roquiny', NULL, NULL, NULL, NULL, NULL, '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, 7, 50, true, '2015-03-19 04:33:32'),
('tommyblopes+8@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 4, 3, 'Monique', 'Baudeloque', NULL, NULL, NULL, NULL, NULL, '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, 7, 50, true, '2015-03-19 04:33:32');

INSERT INTO user_achievements (user_id, achiev_id, recieved_dt) VALUES
(3, 1, '2015-03-25 14:40:00'),
(3, 2, '2015-03-25 14:40:00'),
(3, 4, '2015-03-25 14:40:00'),
(3, 3, '2015-03-25 14:40:00'),
(5, 1, '2015-03-25 03:11:43'),
(5, 4, '2015-03-25 03:11:43'),
(5, 3, '2015-03-25 03:11:43'),
(7, 1, '2015-03-25 14:40:00'),
(7, 2, '2015-03-25 03:11:43'),
(7, 3, '2015-03-25 03:11:43'),
(7, 4, '2015-03-25 03:11:43');

INSERT INTO survey_themes (theme_name) VALUES
('Theme 1');

INSERT INTO organization_categories (organization_id, name, color) VALUES
(3, 'Technologie', '#B9121B'),
(3, 'Boulangerie', '#BD8D46'),
(3, 'Conserves', '#96CA2D');

INSERT INTO survey_headers (organization_id, category_id, theme_id, name, instructions, info, points, publied, publication_date) VALUES
(3, 3, 1, 'Haricots verts', 'Remplir les questions', 'Vous aimez les haricots verts ?', 100, false, NULL),
(3, 3, 1, 'Haricots rouges', 'Remplir les questions', 'Vous aimez les haricots rouges ?', 50, false, NULL),
(3, 3, 1, 'Cassoulet', 'Remplir les questions', 'De castelnaudary', 200, true, '2015-03-25 03:11:43'),
(3, 3, 1, 'Steak', 'Remplir les questions', 'Bien saignant', 150, true, '2015-03-25 03:11:43'),
(3, 3, 1, 'Pack de 6 bières', 'Remplir les questions', 'Avec modération', 100, true, '2015-03-25 03:11:43'),
(3, 3, 1, 'Crunch', 'Remplir les questions', 'Chocolat ... :D', 350, false, NULL);

INSERT INTO user_surveys (user_id, survey_header_id, completed) VALUES
(7, 5, NULL);

INSERT INTO input_types (id, type_name) VALUES
(1, 'Ouverte'), (2, 'Numérique'), (3, 'QCM'), (4, 'Slider'), (5, 'Titre'), (6, 'Texte'), (7, 'Anti-robot');


/* ------------------------- */
/* Insert one testing survey */
/* ------------------------- */
INSERT INTO survey_sections (header_id, title, subtitle, required, section_order) VALUES
(4, 'Votre situation', 'Remplis, VITE !', true, 1),
(4, 'Votre consommation', 'Les steaks c''est la vie. Mais a quel point les aimez vous ?', false, 2),
(4, 'Autres remarques', NULL, true, 5),
(4, 'Les steaks de marque Bigard', 'Bigard, Bigard, ça c''est Bigard !', false, 3),
(4, 'Les steaks de marque Pouce', NULL, false, 4),
(5, 'La bière au quotidien', NULL, true, 1);

INSERT INTO surveymania.user_survey_sections (user_id, section_id) VALUES
(7, 6);

INSERT INTO questions (survey_section_id, input_type_id, description, question_order, multiple_answers) VALUES
(1, 3, 'Quelle est votre situation familiale ?', 3, false),
(1, 3, 'Quels sont les revenus mensuels de votre foyer ?', 4, false),
(1, 3, 'Mangez vous des steaks régulièrement ?', 5, false),
(2, 3, 'Combien de steaks mangez-vous par semaine ?', 1, false),
(2, 3, 'Quelle(s) marque(s) de steak achetez-vous ?', 2, true),
(3, 1, 'Avez vous une remarque à ajouter ?', 3, false),
(3, 2, 'Sur 100, comment noteriez vous la qualité de ce sondage ?', 1, false),
(3, 4, 'Même question avec un slider, parce que c''est cool', 2, false),
(4, 3, 'Que pensez-vous de l''emballage des steaks Bigards ?', 1, false),
(4, 3, 'Que pensez-vous du goût de ces mêmes steaks ?', 2, false),
(4, 3, 'Que pensez-vous de la texture de ces steaks ?', 3, false),
(4, 2, 'Combien payerez-vous pour acheter cette boîte de 10 steaks Bigard congelés ?', 4, false),
(4, 1, 'Autres commentaires ?', 5, false),
(5, 3, 'Que pensez-vous de l''emballage de ces soi-disants "steaks" ?', 1, false),
(5, 3, 'Que pensez-vous du goût de ces mêmes steaks ?', 2, false),
(5, 3, 'Que pensez-vous de la texture de ces steaks ?', 3, false),
(5, 2, 'Combien payerez-vous pour acheter cette boîte de 10 steaks marque Pouce congelés ?', 4, false),
(5, 1, 'Autres commentaires ?', 5, false),
(6, 1, 'T''aimes la bière ?', 1, false),
(1, 5, 'C''est quoi un steak ?', 1, false),
(1, 6, 'Un steak c''est de la viande de boeuf hachée et en forme de cercle. On les trouve souvent sous leur forme congelée (l''objet de ce sondage). C''est pas ce qu''il y a de mieux mais bon, on fait avec. Justement si tu veux manger du steak frais, répond donc à ce sondage et à plein d''autres, récupère la rémunération et go en acheter à OKABE. Sur ce, on vous souhaite un bon sondage.', 2, false);

INSERT INTO question_params(question_id, name, value_num, value_text) VALUES
(6, 'max', 20, NULL),
(7, 'min', 0, NULL),
(7, 'max', 100, NULL),
(7, 'def', 50, NULL),
(8, 'min', 0, NULL),
(8, 'max', 100, NULL),
(8, 'def', 50, NULL),
(8, 'pas', 2, NULL),
(12, 'min', 0, NULL),
(12, 'max', 20, NULL),
(13, 'max', 35, NULL),
(17, 'max', 5, NULL);

INSERT INTO option_choices (question_id, choice_name, option_order, linked_section_id) VALUES
(1, 'Célibataire', 1, NULL),
(1, 'En couple', 2, NULL),
(1, 'Marié / Pacsé', 3, NULL),
(1, 'Veuf', 4, NULL),
(2, 'Entre 0 et 800 €', 1, NULL),
(2, 'Entre 801 et 1500 €', 2, NULL),
(2, 'Entre 1600 et 2500 €', 3, NULL),
(2, 'Entre 2500 et 4000 €', 4, NULL),
(2, '4000 et plus', 5, NULL),
(3, 'Non', 2, NULL),
(3, 'Oui', 1, 2),
(4, 'Entre 0 et 2', 1, NULL),
(4, 'Entre 2 et 5', 2, NULL),
(4, '5 et plus', 3, NULL),
(5, 'Charal', 1, NULL),
(5, 'Marque Pouce', 2, 5),
(5, 'Marque Carrefour', 3, NULL),
(5, 'Bigard', 4, 4),
(5, 'Marque Auchan', 5, NULL),
(5, 'Autre', 6, NULL),
(9, 'Nul', 1, NULL),
(9, 'Mouais', 2, NULL),
(9, 'Pas mal', 3, NULL),
(9, 'Très bien', 4, NULL),
(10, 'Nul', 1, NULL),
(10, 'Mouais', 2, NULL),
(10, 'Pas mal', 3, NULL),
(10, 'Très bien', 4, NULL),
(11, 'Nul', 1, NULL),
(11, 'Mouais', 2, NULL),
(11, 'Pas mal', 3, NULL),
(11, 'Très bien', 4, NULL),
(14, 'Nul', 1, NULL),
(14, 'Mouais', 2, NULL),
(14, 'Pas mal', 3, NULL),
(14, 'Très bien', 4, NULL),
(15, 'Nul', 1, NULL),
(15, 'Mouais', 2, NULL),
(15, 'Pas mal', 3, NULL),
(15, 'Très bien', 4, NULL),
(16, 'Nul', 1, NULL),
(16, 'Mouais', 2, NULL),
(16, 'Pas mal', 3, NULL),
(16, 'Très bien', 4, NULL);

INSERT INTO question_medias (question_id, media_path, media_order, media_type, description) VALUES
(9, 'http://www.lsa-conso.fr/mediatheque/2/4/6/000017642_74.jpg', 1, 'image_url', 'Boîte de steak Bigard'),
(9, 'Wg3l9tvDU5Y', 2, 'youtube', 'Pub Bigard'),
(14, 'http://www.prixing.fr/images/product_images/876/8760f0edba11786d5401a047588f194c.jpg', 1, 'image_url', 'Boîte de steak Marque Pouce');

INSERT INTO surveymania.survey_comments (header_id, user_id, comment, posted) VALUES
(4, 1, 'Super sondage, mais un peu court', '2014-06-21 15:02:00'),
(4, 2, 'On veut plus de points !', '2015-03-19 18:25:00'),
(4, 3, 'J''aime les sondages, à quand le prochain ?', '2015-01-01 01:39:00'),
(4, 4, 'Joyeux noël les gens !', '2014-12-25 08:12:00'),
(4, 5, 'Cool :)', '2012-05-20 20:58:00');

INSERT INTO surveymania.answers (question_id, user_id, option_choice_id, answer_num, answer_text) VALUES
(1, 7, 1, NULL, NULL),
(2, 7, 8, NULL, NULL),
(3, 7, 11, NULL, NULL),
(4, 7, 13, NULL, NULL),
(5, 7, 15, NULL, NULL),
(5, 7, 18, NULL, NULL),
(9, 7, 21, NULL, NULL),
(9, 7, 21, NULL, NULL),
(9, 7, 22, NULL, NULL),
(9, 7, 22, NULL, NULL),
(9, 7, 22, NULL, NULL),
(9, 7, 22, NULL, NULL),
(9, 7, 22, NULL, NULL),
(9, 7, 23, NULL, NULL),
(9, 7, 23, NULL, NULL),
(9, 7, 23, NULL, NULL),
(9, 7, 23, NULL, NULL),
(9, 7, 24, NULL, NULL),
(9, 7, 24, NULL, NULL),
(9, 7, 24, NULL, NULL),
(9, 7, 24, NULL, NULL),
(9, 7, 24, NULL, NULL),
(9, 7, 24, NULL, NULL),
(10, 7, 28, NULL, NULL),
(11, 7, 32, NULL, NULL),
(12, 7, NULL, 10, NULL),
(13, 7, NULL, NULL, 'Trop bon ! :)'),
(7, 7, NULL, 50, NULL),
(8, 7, NULL, 68, NULL),
(6, 7, NULL, NULL, 'Super sondage'),
(1, 8, 2, NULL, NULL),
(2, 8, 9, NULL, NULL),
(3, 8, 11, NULL, NULL),
(4, 8, 13, NULL, NULL),
(5, 8, 15, NULL, NULL),
(5, 8, 18, NULL, NULL),
(9, 8, 23, NULL, NULL),
(10, 8, 27, NULL, NULL),
(11, 8, 31, NULL, NULL),
(12, 8, NULL, 15, NULL),
(13, 8, NULL, NULL, 'Nice'),
(7, 8, NULL, 80, NULL),
(8, 8, NULL, 82, NULL),
(6, 8, NULL, NULL, 'Good'),
(1, 1, 1, NULL, NULL),
(2, 1, 6, NULL, NULL),
(3, 1, 11, NULL, NULL),
(4, 1, 13, NULL, NULL),
(5, 1, 15, NULL, NULL),
(5, 1, 18, NULL, NULL),
(9, 1, 24, NULL, NULL),
(10, 1, 27, NULL, NULL),
(11, 1, 32, NULL, NULL),
(12, 1, NULL, 10, NULL),
(13, 1, NULL, NULL, 'Trop bon ! :)'),
(7, 1, NULL, 50, NULL),
(8, 1, NULL, 68, NULL),
(6, 1, NULL, NULL, 'Super sondage'),
(1, 6, 1, NULL, NULL),
(2, 6, 8, NULL, NULL),
(3, 6, 11, NULL, NULL),
(4, 6, 13, NULL, NULL),
(5, 6, 15, NULL, NULL),
(5, 6, 18, NULL, NULL),
(9, 6, 24, NULL, NULL),
(10, 6, 28, NULL, NULL),
(11, 6, 32, NULL, NULL),
(12, 6, NULL, 10, NULL),
(13, 6, NULL, NULL, 'Trop bon ! :)'),
(7, 6, NULL, 50, NULL),
(8, 6, NULL, 68, NULL),
(6, 6, NULL, NULL, 'Super sondage');