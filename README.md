# SurveyMania
SurveyMania - EPITA 2016 - MTI PLIC - bourdi_c / sabot_p / lopes_t
#
Install and run the application
1) Installation de Node.js et npm
  $ sudo apt-get install nodejs-legacy npm
2) Installation de MySQL
  $ sudo apt-get install mysql-server
3) Récupération du projet
  $ svn checkout http://subversion.backelite.com/backelite/bkperfdashboard/
4) Aller à la racine du projet
  $ cd bkperfdashboard/trunk
5) Importer la base de données
  $ mysql -u username -p < bkperfdashboard.sql
6) Lancer le server
  $ nodejs server.js
7) Ouvrir l'application dans un navigateur à l'addresse http://localhost:1337/
