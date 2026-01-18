/* =========================
   UTILIDADES
========================= */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(txt) {
  const logBox = document.getElementById("log");
  logBox.innerText += txt + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

/* =========================
   REGRAS DE RAÇA / CLASSE
========================= */
const classesPorRaca = {
  Humano: ["Guerreiro", "Mago"],
  Elfo: ["Arqueiro", "Mago"],
  Anão: ["Tank", "Guerreiro"],
  Demônio: ["Mago", "Tank"]
};

const classeExclusiva = {
  "Humano-Guerreiro": "Cavaleiro Real",
  "Elfo-Arqueiro": "Arqueiro Élfico",
  "Anão-Tank": "Guardião Anão",
  "Demônio-Mago": "Feiticeiro Abissal"
};

/* =========================
   PLAYER
========================= */
class Player {
  constructor(nome, raca, classe, modo) {
    this.nome = nome;
    this.raca = raca;
    this.classe = classe;
    this.modo = modo;

    this.lvl = 1;
    this.exp = 0;

    this.max_hp = modo === "hardcore" ? 80 : 120;
    this.hp = this.max_hp;
    this.atk = 10;
    this.defesa = 5;

    this.gold = 0;
    this.bioma = "Nevado";

    this.classeEvoluida = false;
    this.racaEvoluida = false;

    this.codigosUsados = {};
  }

  ganharExp(qtd) {
    this.exp += qtd;
    log(`⭐ +${qtd} EXP`);
    while (this.exp >= this.lvl * 100) {
      this.exp -= this.lvl * 100;
      this.lvl++;
      this.max_hp += 20;
      this.atk += 3;
      this.defesa += 2;
      this.hp = this.max_hp;
      log(`⬆️ Subiu para o nível ${this.lvl}`);
    }
  }
}

/* =========================
   INIMIGOS
========================= */
class Enemy {
  constructor(nome, hp, atk, def, exp, gold) {
    this.nome = nome;
    this.hp = hp;
    this.atk = atk;
    this.def = def;
    this.exp = exp;
    this.gold = gold;
  }

  atacar(player) {
    let dano = Math.max(1, this.atk - player.defesa + rand(-2, 2));
    player.hp -= dano;
    log(`💥 ${this.nome} causou ${dano}`);
  }
}

/* =========================
   BIOMAS
========================= */
const biomas = {
  Nevado: [
    new Enemy("Lobo de Gelo", 70, 12, 4, 40, 20),
    new Enemy("Yeti", 120, 18, 6, 70, 50),
    new Enemy("Dragão de Gelo", 220, 28, 10, 150, 120)
  ],
  Floresta: [
    new Enemy("Goblin", 80, 12, 4, 45, 30),
    new Enemy("Ent Ancião", 160, 22, 8, 120, 90)
  ],
  Deserto: [
    new Enemy("Múmia", 110, 18, 6, 70, 60),
    new Enemy("Guardião de Areia", 190, 26, 9, 140, 110)
  ],
  Lava: [
    new Enemy("Demônio do Fogo", 150, 26, 8, 120, 100),
    new Enemy("Titã de Magma", 280, 34, 12, 220, 180)
  ]
};

/* =========================
   JOGO
========================= */
let player = null;

function novoJogo() {
  const nome = prompt("Nome do herói:");
  const raca = prompt("Raça:\nHumano\nElfo\nAnão\nDemônio");
  const classe = prompt("Classe:");
  const modo = prompt("Modo:\nnormal\nhardcore").toLowerCase();

  if (!classesPorRaca[raca] || !classesPorRaca[raca].includes(classe)) {
    alert("❌ Classe não permitida para essa raça!");
    return;
  }

  player = new Player(nome, raca, classe, modo);

  const chave = `${raca}-${classe}`;
  if (classeExclusiva[chave]) {
    player.classe = classeExclusiva[chave];
    player.atk += 5;
    player.defesa += 5;
    log(`✨ Classe exclusiva: ${player.classe}`);
  }

  document.getElementById("start").style.display = "none";
  document.getElementById("game").style.display = "block";

  atualizarStatus();
}

/* =========================
   BATALHA
========================= */
function explorar() {
  const lista = biomas[player.bioma];
  batalha(lista[rand(0, lista.length - 1)]);
}

function batalha(enemy) {
  log(`🔥 ${enemy.nome} apareceu!`);

  while (player.hp > 0 && enemy.hp > 0) {
    const acao = prompt("1-Atacar\n2-Fugir");

    if (acao === "2") {
      if (Math.random() < 0.5) {
        log("🏃 Fugiu!");
        return;
      } else {
        log("❌ Falha ao fugir!");
      }
    }

    enemy.hp -= Math.max(1, player.atk - enemy.def + rand(-2, 3));
    if (enemy.hp > 0) enemy.atacar(player);
  }

  if (player.hp > 0) {
    log(`🏆 Venceu ${enemy.nome}`);
    player.ganharExp(enemy.exp);
    player.gold += enemy.gold;
  } else {
    log("💀 Derrotado...");
    player.hp = Math.floor(player.max_hp / 2);
  }

  atualizarStatus();
}

/* =========================
   EVOLUÇÃO
========================= */
function evoluirClasse() {
  if (player.lvl < 10 || player.classeEvoluida) {
    log("❌ Não pode evoluir classe");
    return;
  }
  player.atk += 20;
  player.defesa += 15;
  player.classeEvoluida = true;
  log("⚔️ Classe evoluída!");
}

function evoluirRaca() {
  if (player.lvl < 15 || player.racaEvoluida) {
    log("❌ Não pode evoluir raça");
    return;
  }
  player.max_hp += 50;
  player.hp = player.max_hp;
  player.raca += " Suprema";
  player.racaEvoluida = true;
  log("🧬 Raça evoluída!");
}

/* =========================
   CÓDIGOS
========================= */
function resgatarCodigo() {
  const c = prompt("Código:").toLowerCase();
  const ilimitados = ["tankmode", "godmode", "admcode", "gptcode"];

  if (player.codigosUsados[c] && !ilimitados.includes(c)) {
    log("❌ Código já usado!");
    return;
  }

  switch (c) {
    case "tankmode":
      player.defesa += 50;
      break;
    case "godmode":
      player.max_hp = 999999;
      player.hp = player.max_hp;
      player.atk = 9999;
      player.defesa = 9999;
      break;
    case "admcode":
      player.atk += 500;
      player.defesa += 500;
      break;
    case "gptcode":
      player.atk += 1000;
      player.max_hp += 1000;
      player.hp = player.max_hp;
      break;
    case "pc5xp":
      player.ganharExp(1000000);
      break;
    case "pc5def":
      player.defesa += 1000;
      break;
    default:
      log("❌ Código inválido");
      return;
  }

  player.codigosUsados[c] = true;
  atualizarStatus();
}

/* =========================
   STATUS
========================= */
function atualizarStatus() {
  document.getElementById("status").innerText =
    `${player.nome} | ${player.raca} | ${player.classe}\n` +
    `Lvl ${player.lvl} | HP ${player.hp}/${player.max_hp}\n` +
    `ATK ${player.atk} | DEF ${player.defesa} | GOLD ${player.gold}`;
}
