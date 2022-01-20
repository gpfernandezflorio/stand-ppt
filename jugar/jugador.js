function jugadorRandom() {
  return new Jugador(jugadaRandom);
}

function jugadorBart() {
  return new Jugador(jugadaPiedra);
}

function Jugador(funcion_decision) {
  this.decision = funcion_decision;
}

function jugadaRandom() {
  return ['piedra','papel','tijera'][Math.floor(3*Math.random())];
};

function jugadaPiedra() {
  return 'piedra';
};
