SET SCHEMA 'surveymania';

INSERT INTO user_types (type_name) VALUES
('user'), ('admin'), ('shop_owner'), ('shop_admin');

INSERT INTO achievements (name, image_path, description) VALUES 
('Bienvenue à SurveyMania !', 'img/achievements/signup.png', 'En finalisant votre inscription, vous avez reçu 200 points.'),
('Vous êtes devenu parrain !', 'img/achievements/parrain.png', 'En parrainant un nouvel utilisateur vous avez reçu 500 points.'),
('Coupe 1', 'img/achievements/cup1.png', 'Vous avez gagné la coupe 1.'),
('Médaille 1', 'img/achievements/medal1.png', 'Vous avez gagné la médaille 1.');

INSERT INTO organizations (name, description, adress, postal, town, country, telephone, logo_path, url_add_discount, url_verify_discount, url_remove_discount, current_points, verified, verified_dt) VALUES 
('EPITA', 'Ecole d''ingénieurs en informatique', '14 rue Voltaire', '94276', 'Kremlin Bicêtre', 'France', '0144080101', 'https://pbs.twimg.com/profile_images/534363526521819136/WLpToBj__bigger.jpeg', 'url', 'url', 'url', 50, false, NULL),
('EPF', 'Ecole d''ingénieurs généraliste', '3 rue lakanal', '92330', 'Sceaux', 'France', '0141130151', 'https://pbs.twimg.com/profile_images/891709693/Phi_normal.jpg', 'url', 'url', 'url', 50, false, NULL),
('Thales', 'Armement', '19, Rue Lucien Boxtael', '95370', 'Montigny-Lès-Cormeilles', 'France', '0663638061', 'img/organizations/3/logo.png', 'url', 'url', 'url', 50, true, '2015-03-23 08:27:48');

INSERT INTO users (email, password, user_type, user_organization, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, invite_dt, inviter_id, points, verified, verified_dt) VALUES 
('tommyblopes@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 2, NULL, 'Foo', 'Bar', NULL, NULL, NULL, NULL, NULL, '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, NULL, 50, true, '2015-03-19 04:33:32'),
('antoine.soler@epf.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 3, 2, 'Antoine', 'Soler', '0123456789', '6, allée des tulipes', '94470', 'Boissy Saint Leger', 'France', '2015-03-22 22:05:10', '2015-03-22 22:05:10', NULL, NULL, 50, true, '2015-03-22 22:05:10'),
('tommyblopes@msn.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Tommy', 'Lopes', '0659301096', '18, allée Henri Sellier', '92800', 'Puteaux', 'France', '2015-03-15 01:18:51', '2015-03-15 01:18:51', NULL, NULL, 3050, true, '2015-03-19 03:32:52'),
('lopes.tommy@epita.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 3, 1, 'Alo', 'Moto', '0123456789', '1, rue Charles Lorilleux', '92800', 'Puteaux', 'France', '2015-03-25 08:05:10', '2015-03-25 08:05:10', NULL, NULL, 50, true, NULL),
('lopes_t@epita.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Toto', 'Tata', NULL, NULL, NULL, NULL, NULL, '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, NULL, 550, true, '2015-03-25 03:11:43'),
('bourdinclement95@gmail.com', 'afa6c0952e63538841419d750772621df34c9656b41a1b3b439bafadf928f72c', 3, 3, 'Jean', 'Pierre', '0663638061', '19, Rue Lucien Boxtael', '95370', 'Montigny-Lès-Cormeilles', 'France', '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, NULL, 50, true, '2015-03-25 03:11:43'),
('bourdi_c@epita.fr', 'afa6c0952e63538841419d750772621df34c9656b41a1b3b439bafadf928f72c', 1, NULL, 'Clément', 'Bourdin', '0663638061', '19, Rue Lucien Boxtael', '95370', 'Montigny-Lès-Cormeilles', 'France', '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, NULL, 50, true, '2015-03-25 03:11:43');

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

INSERT INTO survey_headers (organization_id, theme_id, name, instructions, info, points) VALUES
(3, 1, 'Haricots verts', 'Remplir les questions', 'Vous aimez les haricots verts ?', 100),
(3, 1, 'Haricots rouges', 'Remplir les questions', 'Vous aimez les haricots rouges ?', 50),
(3, 1, 'Cassoulet', 'Remplir les questions', 'De castelnaudary', 200),
(3, 1, 'Steak', 'Remplir les questions', 'Bien saignant', 150),
(3, 1, 'Pack de 6 bières', 'Remplir les questions', 'Avec modération', 100),
(3, 1, 'Crunch', 'Remplir les questions', 'Chocolat ... :D', 350);

INSERT INTO user_surveys (user_id, survey_header_id, completed) VALUES
(7, 4, NULL),
(7, 5, NULL);

INSERT INTO organization_categories (organization_id, name, color) VALUES
(3, 'Technologie', '#B9121B'),
(3, 'Boulangerie', '#BD8D46'),
(3, 'Conserves', '#96CA2D');
