const PPT = {};

PPT.textos = {
  'es':{
    contenidoId: {
      'juego-titulo-texto': 'Cantidad jugadas:'
    },
    valorId: {
      'botonEmpezar': 'Empezar'
    }
  },
  'en':{
    contenidoId: {
      'juego-titulo-texto': 'Number of plays:'
    },
    valorId: {
      'botonEmpezar': 'Start'
    }
  }
};

PPT.Settings = {
  parametrosQLearning: {
    memoria: 3
  },
  timeoutJugadaRival: 700, // ms mostrando la decisión del rival antes de refrescar
  controles: {} // se inicializa después en base a Control
};

PPT.Colores = {
  neutro: '#999',
  empate: '#00d',
  gana: '#0d0',
  pierde: '#d00',
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
  timeout: null
};

PPT.empezar = function() {
  document.getElementById('inicio').hidden = true;
  document.getElementById('juego').hidden = false;
  PPT.inicializar();
  PPT.reiniciar();
};

PPT.inicializar = function() {
  document.getElementById('elegir-tecla-piedra').innerHTML = PPT.Control.elegir_piedra;
  document.getElementById('elegir-tecla-papel').innerHTML = PPT.Control.elegir_papel;
  document.getElementById('elegir-tecla-tijera').innerHTML = PPT.Control.elegir_tijera;
  document.getElementById('juego-accion-historial').innerHTML = PPT.inicializarTablaHistorial();
  PPT.EstadoDelJuego.rival = (Math.floor(2*Math.random())==0 ? 'clemen' : 'tina');
  PPT.EstadoDelJuego.jugador_rival = PPT.jugadorBart();
  PPT.inicializarControles();
}

PPT.inicializarTablaHistorial = function() {
  let contenido = '';
  let cant_columnas = PPT.Settings.parametrosQLearning.memoria;
  for (let i=0; i<2; i++) {
    contenido += '<tr>';
    for (let j=0; j<cant_columnas; j++) {
      contenido += `<td class="celda-historial" id="celda-historial-${i}-${j}"><img class="celda-historial" id="celda-historial-${i}-${j}-pic"></td>`;
    }
    contenido += '</tr>';
  }
  return contenido;
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
  PPT.actualizarPantallaJuego();
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

PPT.actualizarPantallaJugadaRival = function(jugada_rival, color) {
  PPT.actualizarPantallaJugada();
  document.getElementById('juego-accion-jugada-rival').src = `${jugada_rival}.png`;
  document.body.style['background-color'] = color;
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
  victoria = 'empate';
  color_jugador = PPT.Colores.empate;
  color_rival = PPT.Colores.empate;
  if (PPT.gana(nueva_jugada, jugada_rival)) {
    victoria = 'jugador';
    color_jugador = PPT.Colores.gana;
    color_rival = PPT.Colores.pierde;
  } else if (PPT.gana(jugada_rival, nueva_jugada)) {
    victoria = 'rival';
    color_jugador = PPT.Colores.pierde;
    color_rival = PPT.Colores.gana;
  }
  historial.push({
    jugada_jugador: nueva_jugada,
    jugada_rival: jugada_rival,
    victoria: victoria,
    color_jugador: color_jugador,
    color_rival: color_rival,
  });
  PPT.EstadoDelJuego.cantidad_jugadas ++;
  PPT.actualizarPantallaJugadaRival(jugada_rival, color_jugador);
  if (PPT.EstadoDelJuego.timeout !== null) {
    clearTimeout(PPT.EstadoDelJuego.timeout);
  }
  PPT.EstadoDelJuego.timeout = setTimeout(PPT.limpiarPantallaJugadaRival, PPT.Settings.timeoutJugadaRival);
}

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

PPT.onLoad = function() {
  document.getElementById('inicio').hidden = false;
};

window.addEventListener('load', function() {
  LANG.inicializar(PPT.textos, PPT.onLoad);
});

window.addEventListener("keyup", PPT.teclaPresionada);
