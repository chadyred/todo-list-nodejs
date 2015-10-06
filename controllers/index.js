//Index des différents controller. Il permet d'inclure le dossier et ce fichier va exporter l'enseble des autres actions

module.exports = {
  home     : require('./home_controller'),
  task : require('./task_controller'),
  priority : require('./priorite_controller')
};