
INSERT INTO user_types VALUES (1, 'user');
INSERT INTO user_types VALUES (2, 'admin');
INSERT INTO user_types VALUES (3, 'shop_owner');
INSERT INTO user_types VALUES (4, 'shop_admin');

INSERT INTO achievements VALUES (1, 'Bienvenue à SurveyMania !', 'img/achievements/signup.png', 'En finalisant votre inscription, vous avez reçu 200 points.');
INSERT INTO achievements VALUES (2, 'Vous êtes devenu parrain !', 'img/achievements/parrain.png', 'En parrainant un nouvel utilisateur vous avez reçu 500 points.');
INSERT INTO achievements VALUES (4, 'Coupe 1', 'img/achievements/cup1.png', 'Vous avez gagné la coupe 1.');
INSERT INTO achievements VALUES (3, 'Médaille 1', 'img/achievements/medal1.png', 'Vous avez gagné la médaille 1.');

INSERT INTO organizations VALUES (1, 'EPITA', 'Ecole d''ingénieurs en informatique', '14 rue Voltaire', '94276', 'Kremlin Bicêtre', 'France', '0144080101', 'https://pbs.twimg.com/profile_images/534363526521819136/WLpToBj__bigger.jpeg', 'url', 'url', 'url', 50, false, '2015-03-23 02:00:19');
INSERT INTO organizations VALUES (2, 'EPF', 'Ecole d''ingénieurs généraliste', '3 rue lakanal', '92330', 'Sceaux', 'France', '0141130151', 'https://pbs.twimg.com/profile_images/891709693/Phi_normal.jpg', 'url', 'url', 'url', 50, false, '2015-03-23 08:27:48');

INSERT INTO users VALUES (3, 'tommyblopes@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 2, NULL, 'Foo', 'Bar', NULL, NULL, NULL, NULL, NULL, '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, NULL, 50, true, '2015-03-19 04:33:32');
INSERT INTO users VALUES (6, 'antoine.soler@epf.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 3, 2, 'Antoine', 'Soler', '0123456789', '6, allée des tulipes', '94470', 'Boissy Saint Leger', 'France', '2015-03-22 22:05:10', '2015-03-22 22:05:10', NULL, NULL, 50, true, '2015-03-22 22:05:10');
INSERT INTO users VALUES (2, 'tommyblopes@msn.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Tommy', 'Lopes', '0659301096', '18, allée Henri Sellier', '92800', 'Puteaux', 'France', '2015-03-15 01:18:51', '2015-03-15 01:18:51', NULL, NULL, 3050, true, '2015-03-19 03:32:52');
INSERT INTO users VALUES (7, 'lopes.tommy@epita.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 3, 1, 'Alo', 'Moto', '0123456789', '1, rue Charles Lorilleux', '92800', 'Puteaux', 'France', '2015-03-25 08:05:10', '2015-03-25 08:05:10', NULL, NULL, 50, true, NULL);
INSERT INTO users VALUES (4, 'lopes_t@epita.fr', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 1, NULL, 'Toto', 'Tata', NULL, NULL, NULL, NULL, NULL, '2015-03-18 06:44:06', '2015-03-18 06:44:06', NULL, NULL, 550, true, '2015-03-25 03:11:43');

INSERT INTO user_achievements VALUES (1, 2, 1, '2015-03-25 14:40:00');
INSERT INTO user_achievements VALUES (2, 2, 2, '2015-03-25 14:40:00');
INSERT INTO user_achievements VALUES (3, 2, 3, '2015-03-25 14:40:00');
INSERT INTO user_achievements VALUES (4, 2, 4, '2015-03-25 14:40:00');
INSERT INTO user_achievements VALUES (5, 4, 1, '2015-03-25 03:11:43');
INSERT INTO user_achievements VALUES (6, 4, 3, '2015-03-25 03:11:43');
INSERT INTO user_achievements VALUES (7, 4, 4, '2015-03-25 03:11:43');
