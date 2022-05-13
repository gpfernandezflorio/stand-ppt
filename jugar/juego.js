const PPT = {};

PPT.textos = {
  'es':{
    contenidoId: {
      'juego-titulo-texto': 'Cantidad jugadas:',
      'juego-historial-jugador': 'Mis jugadas:',
      'juego-historial-rival': 'Jugadas del oponente:',
      'juego-historial-ganadas': 'Ganadas:',
      'juego-historial-perdidas': 'Perdidas:',
      'juego-historial-empatadas': 'Empatadas:',
      'settings-juego': 'Opciones del juego',
      'settings-juego-timeout': 'Tiempo (ms) mostrando la jugada rival',
      'settings-juego-rival': 'Rival',
      'settings-qlearn': 'Parámetros Q Learning',
      'settings-qlearn-memoria': 'Tamaño de la memoria (cantidad de jugadas que recuerda)',
      'settings-qlearn-alpha': 'Alfa (peso del aprendizaje)',
      'settings-qlearn-gamma': 'Gamma',
      'settings-qlearn-win': 'Recompensa por victoria',
      'settings-qlearn-lose': 'Recompensa por derrota',
      'settings-qlearn-tie': 'Recompensa por empate',
      'settings-controles': 'Controles',
      'settings-controles-piedra': 'Elegir piedra',
      'settings-controles-papel': 'Elegir papel',
      'settings-controles-tijera': 'Elegir tijera'
    },
    contenidoClase: {
      'settings-juego-rival-random': 'Aleatorio',
      'settings-juego-rival-rock': 'La buena piedra',
      'settings-juego-rival-qLearn': 'Q Learning',
    },
    valorId: {
      'botonEmpezar': 'Empezar',
      'botonAtrás': 'Atrás',
      'botonReiniciar': 'Reiniciar'
    }
  },
  'en':{
    contenidoId: {
      'juego-titulo-texto': 'Number of plays:',
      'juego-historial-jugador': 'My plays:',
      'juego-historial-rival': 'Opponent\'s plays:',
      'juego-historial-ganadas': 'Wins:',
      'juego-historial-perdidas': 'Loses:',
      'juego-historial-empatadas': 'Ties:',
      'settings-juego': 'Game options',
      'settings-juego-timeout': 'Time (ms) showing opponent\'s play',
      'settings-juego-rival': 'Opponent',
      'settings-qlearn': 'Q Learning parameters',
      'settings-qlearn-memoria': 'Memory size (number of past plays remembered)',
      'settings-qlearn-alpha': 'Alpha (learning weight)',
      'settings-qlearn-gamma': 'Gamma',
      'settings-qlearn-win': 'Victory reward',
      'settings-qlearn-lose': 'Failure reward',
      'settings-qlearn-tie': 'Draw reward',
      'settings-controles': 'Controls',
      'settings-controles-piedra': 'Choose rock',
      'settings-controles-papel': 'Choose paper',
      'settings-controles-tijera': 'Choose scissors'
    },
    contenidoClase: {
      'settings-juego-rival-random': 'Random',
      'settings-juego-rival-rock': 'Good old rock',
      'settings-juego-rival-qLearn': 'Q Learning',
    },
    valorId: {
      'botonEmpezar': 'Start',
      'botonAtrás': 'Back',
      'botonReiniciar': 'Reset'
    }
  }
};

for (let tecla of 'qwertyuiopasdfghjklzxcvbnm') {
  for (let l in PPT.textos) {
    PPT.textos[l].contenidoClase[`tecla-${tecla}`] = tecla.toUpperCase();
  }
}

PPT.Settings = {
  rival: 'jugadorBart',
  parametrosQLearning: {
    memoria: 3,
    alpha: 0.2,
    gamma: 0.0,
    recompensa: {
      win: 5.0,
      lose:-5.0,
      tie:-4.0
    },
    initial: 2.0
  },
  timeoutJugadaRival: 700, // ms mostrando la decisión del rival antes de refrescar
  controles: {} // se inicializa después en base a Control
};

PPT.Colores = {
  ninguno: '#FFF',
  neutro: '#999',
  empate: '#77d',
  gana: '#3d3',
  pierde: '#d33',
};

PPT.Control = {
  elegir_piedra: 'Z',
  elegir_papel: 'X',
  elegir_tijera: 'C',
};

PPT.EstadoDelJuego = {
  historial: [],
  cantidad_jugadas: 0,
  jugador_rival: null,
  rival: 'tina',
  timeout: null,
  ranking: []
};

PPT.volverALosSettings = function() {
  document.body.style['background-color'] = PPT.Colores.ninguno;
  document.getElementById('juego').hidden = true;
  document.getElementById('inicio').hidden = false;
};

PPT.empezar = function() {
  document.getElementById('inicio').hidden = true;
  document.getElementById('juego').hidden = false;
  PPT.cargarSettings();
  PPT.inicializar();
  PPT.reiniciar();
};

PPT.cargarSettings = function() {
  PPT.Settings.rival = document.getElementById('selector-rival').value;
  let memoria = document.getElementById('selector-memoria').value;
  if (memoria > 5) { memoria = 5; }
  if (memoria < 0) { memoria = 0; }
  PPT.Settings.parametrosQLearning.memoria = memoria;
  PPT.Settings.parametrosQLearning.alpha = document.getElementById('selector-alpha').value;
  PPT.Settings.parametrosQLearning.gamma = document.getElementById('selector-gamma').value;
  PPT.Settings.parametrosQLearning.recompensa.win = document.getElementById('selector-win').value;
  PPT.Settings.parametrosQLearning.recompensa.lose = document.getElementById('selector-lose').value;
  PPT.Settings.parametrosQLearning.recompensa.tie = document.getElementById('selector-tie').value;
  PPT.Settings.timeoutJugadaRival = document.getElementById('selector-timeout').value;
  PPT.Control.elegir_piedra = document.getElementById('selector-piedra').value;
  PPT.Control.elegir_papel = document.getElementById('selector-papel').value;
  PPT.Control.elegir_tijera = document.getElementById('selector-tijera').value;
};

PPT.inicializar = function() {
  document.getElementById('elegir-tecla-piedra').innerHTML = PPT.Control.elegir_piedra;
  document.getElementById('elegir-tecla-papel').innerHTML = PPT.Control.elegir_papel;
  document.getElementById('elegir-tecla-tijera').innerHTML = PPT.Control.elegir_tijera;
  PPT.inicializarTablaHistorial();
  PPT.EstadoDelJuego.jugador_rival = PPT[PPT.Settings.rival]();
  PPT.inicializarControles();
}

PPT.inicializarTablaHistorial = function() {
  let cant_columnas = PPT.Settings.parametrosQLearning.memoria;
  for (let i=0; i<2; i++) {
    let contenido = '<tr>';
    for (let j=0; j<cant_columnas; j++) {
      contenido += `<td class="celda-historial" id="celda-historial-${i}-${j}"><img class="celda-historial" id="celda-historial-${i}-${j}-pic"></td>`;
    }
    contenido += '</tr>';
    document.getElementById(`juego-tabla-${i}`).innerHTML = contenido;
  }
}

PPT.inicializarControles = function() {
  PPT.Settings.controles = {};
  PPT.Settings.controles[PPT.codigoTecla(PPT.Control.elegir_piedra)] = PPT.elegirPiedra;
  PPT.Settings.controles[PPT.codigoTecla(PPT.Control.elegir_papel)] = PPT.elegirPapel;
  PPT.Settings.controles[PPT.codigoTecla(PPT.Control.elegir_tijera)] = PPT.elegirTijera;
}

PPT.reiniciar = function() {
  PPT.EstadoDelJuego.cantidad_jugadas = 0;
  PPT.EstadoDelJuego.rival = (PPT.EstadoDelJuego.rival == 'tina' ? 'clemen' : 'tina');
  PPT.EstadoDelJuego.historial = [];
  PPT.EstadoDelJuego.ranking = [];
  PPT.EstadoDelJuego.jugador_rival.reiniciar();
  PPT.actualizarPantallaJuego();
  PPT.actualizarPantallaRanking({w:0, l:0, t:0});
}

PPT.actualizarPantallaJuego = function() {
  PPT.actualizarPantallaJugada()
  document.getElementById('juego-accion-rival').src = `${PPT.EstadoDelJuego.rival}.png`;
}

PPT.actualizarPantallaJugada = function() {
  document.getElementById('juego-titulo-valor').innerHTML = PPT.EstadoDelJuego.cantidad_jugadas;
  PPT.actualizarPantallaHistorial()
  PPT.limpiarPantallaJugadaRival()
}

PPT.limpiarPantallaJugadaRival = function() {
  document.getElementById('juego-accion-jugada-rival').src = '';
  document.getElementById('juego-accion-jugada-rival-outcome').src = '';
  document.body.style['background-color'] = PPT.Colores.neutro;
  if (PPT.EstadoDelJuego.timeout !== null) {
    clearTimeout(PPT.EstadoDelJuego.timeout);
  }
}

PPT.actualizarPantallaHistorial = function() {
  let cant_columnas = PPT.Settings.parametrosQLearning.memoria;
  let historial = PPT.EstadoDelJuego.historial;
  for (let i=0; i<2; i++) {
    let quien = i==0 ? 'jugador' : 'rival';
    for (let j=0; j<cant_columnas; j++) {
      let jugada = '';
      let color = PPT.Colores.neutro;
      try {
        jugada = historial[cant_columnas-j-1][`jugada_${quien}`] + '.png';
        color = historial[cant_columnas-j-1][`color_${quien}`];
      } catch (e) {
        jugada = '';
      }
      document.getElementById(`celda-historial-${i}-${j}-pic`).src = jugada;
      document.getElementById(`celda-historial-${i}-${j}`).style['background-color'] = color;
    }
  }
}

PPT.actualizarPantallaJugadaRival = function(jugada_rival, color, pulgar) {
  PPT.actualizarPantallaJugada();
  document.getElementById('juego-accion-jugada-rival').src = `${jugada_rival}.png`;
  if (PPT.EstadoDelJuego.timeout !== null) { clearTimeout(PPT.EstadoDelJuego.timeout); }
  PPT.EstadoDelJuego.timeout = setTimeout(
    function() { PPT.actualizarPantallaJugadaRivalOutcome(color, pulgar); }, 150);
}

PPT.actualizarPantallaJugadaRivalOutcome = function(color, pulgar) {
  if (pulgar != 0) {
    let img = document.getElementById('juego-accion-jugada-rival-outcome');
    img.src = 'pulgar.png';
    img.style = `transform:rotate(${90*(pulgar-1)}deg);`;
  }
  document.body.style['background-color'] = color;
  if (PPT.EstadoDelJuego.timeout !== null) { clearTimeout(PPT.EstadoDelJuego.timeout); }
  PPT.EstadoDelJuego.timeout = setTimeout(PPT.limpiarPantallaJugadaRival, PPT.Settings.timeoutJugadaRival);
}

PPT.teclaPresionada = function(evento) {
  let codigo = evento.code;
  if (codigo in PPT.Settings.controles) {
    PPT.Settings.controles[codigo]();
  }
}

PPT.elegirPiedra = function() {
  PPT.jugada('piedra');
}

PPT.elegirPapel = function() {
  PPT.jugada('papel');
}

PPT.elegirTijera = function() {
  PPT.jugada('tijera');
}

PPT.jugada = function(nueva_jugada) {
  let historial = PPT.EstadoDelJuego.historial;
  let jugada_rival = PPT.EstadoDelJuego.jugador_rival.decision();
  if (historial.length == PPT.Settings.parametrosQLearning.memoria) {
    historial.splice(0, 1);
  }
  let victoria = 'empate';
  let color_jugador = PPT.Colores.empate;
  let color_rival = PPT.Colores.empate;
  let pulgar = 0;
  if (PPT.gana(nueva_jugada, jugada_rival)) {
    victoria = 'jugador';
    color_jugador = PPT.Colores.gana;
    color_rival = PPT.Colores.pierde;
    PPT.EstadoDelJuego.jugador_rival.perdi();
    pulgar = 1;
  } else if (PPT.gana(jugada_rival, nueva_jugada)) {
    victoria = 'rival';
    color_jugador = PPT.Colores.pierde;
    color_rival = PPT.Colores.gana;
    PPT.EstadoDelJuego.jugador_rival.gane();
    pulgar = -1;
  } else {
    PPT.EstadoDelJuego.jugador_rival.empate();
  }
  historial.push({
    jugada_jugador: nueva_jugada,
    jugada_rival: jugada_rival,
    victoria: victoria,
    color_jugador: color_jugador,
    color_rival: color_rival,
  });
  PPT.EstadoDelJuego.cantidad_jugadas ++;
  PPT.actualizarRanking(victoria);
  PPT.actualizarPantallaJugadaRival(jugada_rival, color_jugador, pulgar);
}

PPT.actualizarRanking = function(victoria) {
  let ultimo;
  let nuevo;
  if (PPT.EstadoDelJuego.ranking.length > 0) {
    ultimo = PPT.EstadoDelJuego.ranking[PPT.EstadoDelJuego.ranking.length-1];
    nuevo = Object.assign({}, ultimo);
  } else {
    ultimo = { w: 0, l: 0, t: 0 };
    nuevo = ultimo;
  }
  if (victoria == 'jugador') {
    nuevo.w = ultimo.w + 1;
  } else if (victoria == 'rival') {
    nuevo.l = ultimo.l + 1;
  } else {
    nuevo.t = ultimo.t + 1;
  }
  PPT.EstadoDelJuego.ranking.push(nuevo);
  PPT.actualizarPantallaRanking(nuevo);
};

PPT.actualizarPantallaRanking = function(data) {
  let k = PPT.EstadoDelJuego.cantidad_jugadas;
  if (k > 0) { k = 100 / k; }
  document.getElementById('juego-historial-ganadas-data').innerHTML = data.w + ' (' + Math.round(data.w *k) + '%)';
  document.getElementById('juego-historial-perdidas-data').innerHTML = data.l + ' (' + Math.round(data.l *k) + '%)';
  document.getElementById('juego-historial-empatadas-data').innerHTML = data.t + ' (' + Math.round(data.t *k) + '%)';
};

PPT.gana = function(una_jugada, otra_jugada) {
  return (una_jugada == 'piedra' && otra_jugada == 'tijera') ||
    (una_jugada == 'papel' && otra_jugada == 'piedra') ||
    (una_jugada == 'tijera' && otra_jugada == 'papel')
}

PPT.codigoTecla = function(tecla) {
  if ('QWERTYUIOPASDFGHJKLZXCVBNM'.includes(tecla)) {
    return `Key${tecla}`;
  }
}

PPT.teclas = [{id:'tecla-a'},{id:'tecla-b'},{id:'tecla-c'}];

PPT.onLoad = function() {
  let teclas = [];
  let dependenciaQLearn = {'selector-rival':'jugadorQLearn'};
  for (let tecla of 'qwertyuiopasdfghjklzxcvbnm') {
    teclas.push({class:`tecla-${tecla}`, value:tecla.toUpperCase()});
  }
  document.body.style['background-color'] = PPT.Colores.ninguno;
  Settings.menu('settings', [
    {id:'settings-juego'},
      {id:'settings-juego-timeout', valor:{campo:{id:'selector-timeout',value:700,opciones:'numero'}}},
      {id:'settings-juego-rival', valor:{campo:{id:'selector-rival',defectoClass:'settings-juego-rival-qLearn',opciones:[
        {class:'settings-juego-rival-random', value:'jugadorRandom'},
        {class:'settings-juego-rival-rock', value:'jugadorBart'},
        {class:'settings-juego-rival-qLearn', value:'jugadorQLearn'}
      ]}}},
    {id:'settings-qlearn',dependencias:dependenciaQLearn},
      {id:'settings-qlearn-memoria',dependencias:dependenciaQLearn,
        valor:{dependencias:dependenciaQLearn,campo:{id:'selector-memoria',value:3,min:1,max:5,opciones:'numero'}}},
      {id:'settings-qlearn-alpha',dependencias:dependenciaQLearn,
        valor:{dependencias:dependenciaQLearn,campo:{id:'selector-alpha',value:0.2,min:0,max:1,step:0.1,opciones:'numero'}}},
      {id:'settings-qlearn-gamma',dependencias:dependenciaQLearn,
        valor:{dependencias:dependenciaQLearn,campo:{id:'selector-gamma',value:0.1,min:0,max:1,step:0.1,opciones:'numero'}}},
      {id:'settings-qlearn-win',dependencias:dependenciaQLearn,
        valor:{dependencias:dependenciaQLearn,campo:{id:'selector-win',value:5,opciones:'numero'}}},
      {id:'settings-qlearn-lose',dependencias:dependenciaQLearn,
        valor:{dependencias:dependenciaQLearn,campo:{id:'selector-lose',value:-5,opciones:'numero'}}},
      {id:'settings-qlearn-tie',dependencias:dependenciaQLearn,
        valor:{dependencias:dependenciaQLearn,campo:{id:'selector-tie',value:-4,opciones:'numero'}}},
    {id:'settings-controles'},
      {id:'settings-controles-piedra', valor:{campo:{id:'selector-piedra',defectoClass:'tecla-z',opciones:teclas}}},
      {id:'settings-controles-papel', valor:{campo:{id:'selector-papel',defectoClass:'tecla-x',opciones:teclas}}},
      {id:'settings-controles-tijera', valor:{campo:{id:'selector-tijera',defectoClass:'tecla-c',opciones:teclas}}}
  ]);
  document.getElementById('inicio').hidden = false;
};

window.addEventListener('load', function() {
  LANG.inicializar(PPT.textos, PPT.onLoad);
});

window.addEventListener("keyup", PPT.teclaPresionada);
