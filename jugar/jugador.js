PPT.jugadas = ['piedra','papel','tijera'];

PPT.jugadorRandom = function() {
  return new PPT.Jugador(PPT.jugadaRandom);
};

PPT.jugadorBart = function() {
  return new PPT.Jugador(PPT.jugadaPiedra);
};

PPT.jugadorQLearn = function() {
  return new PPT.JugadorQLearn();
};

PPT.JugadorQLearn = function() {
  PPT.Jugador.call(this, PPT.jugadaQLearn);
  this.gane = function() {
    this.aprender('win');
  };
  this.perdi = function() {
    this.aprender('lose');
  };
  this.empate = function() {
    this.aprender('tie');
  };
  this.aprender = function(outcome) {
    this.setQ(outcome);
    this.actualizarHistorial(outcome);
  }
  this.estado = 'HISTORIAL'; // 'HISTORIAL_Y_OUTCOME'
  for (let k in PPT.Settings.parametrosQLearning) {
    this[k] = PPT.Settings.parametrosQLearning[k];
  }
  this.getQ = function(jugada) {
    let clave = this.obtenerClaveEstado();
    if (clave in this.q) {
      if (jugada in this.q[clave]) {
        return this.q[clave][jugada];
      }
    }
    return this.initial;
  };
  this.setQ = function(outcome) {
    let clave = this.obtenerClaveEstado();
    let recompensa = this.recompensa[outcome];
    let nuevoValor = this.nuevoValorQ(recompensa);
    if (!(clave in this.q)) {
      this.q[clave] = {};
    }
    this.q[clave][this.ultima_jugada] = nuevoValor;
  };
  this.nuevoValorQ = function(recompensa) {
    let valorAnterior = this.getQ(this.ultima_jugada);
    let maxqnew = Math.max.apply(null, PPT.jugadas.map((x) => this.getQ(x)));
    return (1-this.alpha) * valorAnterior + this.alpha * ((recompensa/* + this.gamma*maxqnew*/)/* - valorAnterior*/);
  };
  this.obtenerClaveEstado = function() {
    if (this.estado == 'HISTORIAL') {
      return this.historial.join();
    } else if (this.estado == 'HISTORIAL_Y_OUTCOME') {
      return this.historial.map((x) => x.jugada + x.outcome).join();
    }
  };
  this.actualizarHistorial = function(outcome) {
    if (this.estado == 'HISTORIAL') {
      this.historial.push(this.ultima_jugada);
    } else if (this.estado == 'HISTORIAL_Y_OUTCOME') {
      this.historial.push({
        jugada:this.ultima_jugada,
        outcome:outcome
      });
    }
    while (this.historial.length > this.memoria) {
      this.historial = this.historial.splice(1);
    }
  }
  this.reiniciar = function() {
    this.q = {};
    this.historial = [];
    this.porcentajes = {};
    for (let k of PPT.jugadas) {
      this.porcentajes[k] = 100.0/3;
    }
  };
  this.reiniciar();
};

PPT.Jugador = function(funcion_decision) {
  this.decision = funcion_decision;
  this.gane = function() {};
  this.perdi = function() {};
  this.empate = function() {};
  this.reiniciar = function() {};
};

PPT.jugadaRandom = function() {
  return PPT.jugadas[Math.floor(3*Math.random())];
};

PPT.jugadaPiedra = function() {
  return 'piedra';
};

PPT.jugadaQLearn = function() {
  if (this.historial.length < this.memoria) {
    this.ultima_jugada = PPT.jugadaRandom();
  } else {
    const yo = this;
    let qs = PPT.jugadas.map(function(x) {
      return {jugada: x, valor: yo.getQ(x)};
    });
    let maxQ = [];
    let maxVal = qs[0].valor;
    for (let q of qs) {
      if (q.valor > maxVal) {
        maxQ = [q];
        maxVal = q.valor;
      } else if (q.valor == maxVal) {
        maxQ.push(q);
      }
    }
    for (let p in this.porcentajes) {
      if (maxQ.some((x) => x.jugada == p)) {
        this.porcentajes[p] = 100.0/maxQ.length;
      } else {
        this.porcentajes[p] = 0;
      }
    }
    if (maxQ.length == 1) {
      this.ultima_jugada = maxQ[0].jugada;
    } else {
      let rand = Math.random();
      this.ultima_jugada = maxQ[Math.floor(maxQ.length*rand)].jugada;
    }
  }
  return this.ultima_jugada;
};
