PPT.jugadorRandom = function() {
  return new PPT.Jugador(PPT.jugadaRandom);
}

PPT.jugadorBart = function() {
  return new PPT.Jugador(PPT.jugadaPiedra);
}

PPT.Jugador = function(funcion_decision) {
  this.decision = funcion_decision;
}

PPT.jugadaRandom = function() {
  return ['piedra','papel','tijera'][Math.floor(3*Math.random())];
};

PPT.jugadaPiedra = function() {
  return 'piedra';
};
