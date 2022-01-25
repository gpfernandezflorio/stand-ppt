const Settings = {
  parametrosQLearning: {
    memoria: 3
  },
  timeoutJugadaRival: 700, // ms mostrando la decisión del rival antes de refrescar
  controles: {} // se inicializa después en base a Control
};

const Colores = {
  neutro: '#999',
  empate: '#00d',
  gana: '#0d0',
  pierde: '#d00',
};

const Control = {
  elegir_piedra: 'Z',
  elegir_papel: 'X',
  elegir_tijera: 'C',
};

const EstadoDelJuego = {
  historial: [],
  cantidad_jugadas: 0,
  jugador_rival: null,
  rival: 'tina',
  timeout: null
};

function onLoad() {
  document.getElementById('inicio').hidden = false;
}

function empezar() {
  document.getElementById('inicio').hidden = true;
  document.getElementById('juego').hidden = false;
  inicializar();
  reiniciar();
}

function inicializar() {
  document.getElementById('elegir-tecla-piedra').innerHTML = Control.elegir_piedra;
  document.getElementById('elegir-tecla-papel').innerHTML = Control.elegir_papel;
  document.getElementById('elegir-tecla-tijera').innerHTML = Control.elegir_tijera;
  document.getElementById('juego-accion-historial').innerHTML = inicializarTablaHistorial();
  EstadoDelJuego.rival = (Math.floor(2*Math.random())==0 ? 'clemen' : 'tina');
  EstadoDelJuego.jugador_rival = jugadorBart();
  inicializarControles();
}

function inicializarTablaHistorial() {
  let contenido = '';
  let cant_columnas = Settings.parametrosQLearning.memoria;
  for (let i=0; i<2; i++) {
    contenido += '<tr>';
    for (let j=0; j<cant_columnas; j++) {
      contenido += `<td class="celda-historial" id="celda-historial-${i}-${j}"><img class="celda-historial" id="celda-historial-${i}-${j}-pic"></td>`;
    }
    contenido += '</tr>';
  }
  return contenido;
}

function inicializarControles() {
  Settings.controles = {};
  Settings.controles[codigoTecla(Control.elegir_piedra)] = elegirPiedra;
  Settings.controles[codigoTecla(Control.elegir_papel)] = elegirPapel;
  Settings.controles[codigoTecla(Control.elegir_tijera)] = elegirTijera;
}

function reiniciar() {
  EstadoDelJuego.cantidad_jugadas = 0;
  EstadoDelJuego.rival = (EstadoDelJuego.rival == 'tina' ? 'clemen' : 'tina');
  actualizarPantallaJuego();
}

function actualizarPantallaJuego() {
  actualizarPantallaJugada()
  document.getElementById('juego-accion-rival').src = `${EstadoDelJuego.rival}.png`;
}

function actualizarPantallaJugada() {
  document.getElementById('juego-titulo-valor').innerHTML = EstadoDelJuego.cantidad_jugadas;
  actualizarPantallaHistorial()
  limpiarPantallaJugadaRival()
}

function limpiarPantallaJugadaRival() {
  document.getElementById('juego-accion-jugada-rival').src = '';
  document.body.style['background-color'] = Colores.neutro;
  if (EstadoDelJuego.timeout !== null) {
    clearTimeout(EstadoDelJuego.timeout);
  }
}

function actualizarPantallaHistorial() {
  let cant_columnas = Settings.parametrosQLearning.memoria;
  let historial = EstadoDelJuego.historial;
  for (let i=0; i<2; i++) {
    let quien = i==0 ? 'jugador' : 'rival';
    for (let j=0; j<cant_columnas; j++) {
      let jugada = '';
      let color = Colores.neutro;
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

function actualizarPantallaJugadaRival(jugada_rival, color) {
  actualizarPantallaJugada();
  document.getElementById('juego-accion-jugada-rival').src = `${jugada_rival}.png`;
  document.body.style['background-color'] = color;
}

function teclaPresionada(evento) {
  let codigo = evento.code;
  if (codigo in Settings.controles) {
    Settings.controles[codigo]();
  }
}

function elegirPiedra() {
  jugada('piedra');
}

function elegirPapel() {
  jugada('papel');
}

function elegirTijera() {
  jugada('tijera');
}

function jugada(nueva_jugada) {
  let historial = EstadoDelJuego.historial;
  let jugada_rival = EstadoDelJuego.jugador_rival.decision();
  if (historial.length == Settings.parametrosQLearning.memoria) {
    historial.splice(0, 1);
  }
  victoria = 'empate';
  color_jugador = Colores.empate;
  color_rival = Colores.empate;
  if (gana(nueva_jugada, jugada_rival)) {
    victoria = 'jugador';
    color_jugador = Colores.gana;
    color_rival = Colores.pierde;
  } else if (gana(jugada_rival, nueva_jugada)) {
    victoria = 'rival';
    color_jugador = Colores.pierde;
    color_rival = Colores.gana;
  }
  historial.push({
    jugada_jugador: nueva_jugada,
    jugada_rival: jugada_rival,
    victoria: victoria,
    color_jugador: color_jugador,
    color_rival: color_rival,
  });
  EstadoDelJuego.cantidad_jugadas ++;
  actualizarPantallaJugadaRival(jugada_rival, color_jugador);
  if (EstadoDelJuego.timeout !== null) {
    clearTimeout(EstadoDelJuego.timeout);
  }
  EstadoDelJuego.timeout = setTimeout(limpiarPantallaJugadaRival, Settings.timeoutJugadaRival);
}

function gana(una_jugada, otra_jugada) {
  return (una_jugada == 'piedra' && otra_jugada == 'tijera') ||
    (una_jugada == 'papel' && otra_jugada == 'piedra') ||
    (una_jugada == 'tijera' && otra_jugada == 'papel')
}

function codigoTecla(tecla) {
  if ('QWERTYUIOPASDFGHJKLZXCVBNM'.includes(tecla)) {
    return `Key${tecla}`;
  }
}

window.addEventListener("keyup", teclaPresionada);
