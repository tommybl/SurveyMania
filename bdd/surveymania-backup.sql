
INSERT INTO surveymania.user_types (id, type_name) VALUES (1, 'user');
INSERT INTO surveymania.user_types (id, type_name) VALUES (2, 'admin');
INSERT INTO surveymania.user_types (id, type_name) VALUES (3, 'shop_owner');
INSERT INTO surveymania.user_types (id, type_name) VALUES (4, 'shop_admin');

INSERT INTO surveymania.users (id, email, password, user_type, user_organization, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, invite_dt, inviter_id, points, verified, verified_dt) VALUES (3, 'tommyblopes@gmail.com', '26d0458bb3318ee8be1354bae88ba8aa5ec8a0010e93c271fa4a96fdc8bc060b', 1, NULL, 'Foo', 'Bar', NULL, 'Chez la maman de pierre', '92800', 'Puteaux', 'France', '2015-03-15 01:20:11', '2015-03-15 01:20:11', NULL, NULL, 50, false, NULL);
INSERT INTO surveymania.users (id, email, password, user_type, user_organization, name, lastname, telephone, adress, postal, town, country, creation_dt, last_dt, invite_dt, inviter_id, points, verified, verified_dt) VALUES (2, 'tommyblopes@msn.com', '26d0458bb3318ee8be1354bae88ba8aa5ec8a0010e93c271fa4a96fdc8bc060b', 1, NULL, 'Tommy', 'Lopes', '0659301096', '18, allée Henri Sellier', '92800', 'Puteaux', 'France', '2015-03-15 01:18:51', '2015-03-15 01:18:51', NULL, NULL, 550, false, NULL);
