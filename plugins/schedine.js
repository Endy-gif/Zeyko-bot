//By Bonzino
import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'

const CARTELLA_CACHE = './media/seriea_cache'
const SFONDO_PATH = path.join(CARTELLA_CACHE, 'sfondo_serie_a.png')
const SNAI_PATH = './media/snai.png'
const SFONDO_URL = 'https://i.imgur.com/3GbgP6K.png'

const SQUADRE = [
  { nome: "Atalanta", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/6/66/Atalanta_BC_logo.svg/1200px-Atalanta_BC_logo.svg.png", file: "atalanta.png" },
  { nome: "Bologna", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/5/5b/Bologna_FC_logo.svg/1200px-Bologna_FC_logo.svg.png", file: "bologna.png" },
  { nome: "Cagliari", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/6/61/Cagliari_Calcio_1920.svg/1024px-Cagliari_Calcio_1920.svg.png", file: "cagliari.png" },
  { nome: "Como", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/2/23/Como_1907_logo.svg/1200px-Como_1907_logo.svg.png", file: "como.png" },
  { nome: "Empoli", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/1/1e/Empoli_FC_logo_2021.svg/1200px-Empoli_FC_logo_2021.svg.png", file: "empoli.png" },
  { nome: "Fiorentina", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/ACF_Fiorentina_2022_logo.svg/1200px-ACF_Fiorentina_2022_logo.svg.png", file: "fiorentina.png" },
  { nome: "Genoa", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/6/6c/Genoa_CFC_logo.svg/1200px-Genoa_CFC_logo.svg.png", file: "genoa.png" },
  { nome: "Inter", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png", file: "inter.png" },
  { nome: "Juventus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png", file: "juve.png" },
  { nome: "Lazio", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/c/ce/S.S._Lazio_logo.svg/1200px-S.S._Lazio_logo.svg.png", file: "lazio.png" },
  { nome: "Lecce", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/a/a2/US_Lecce_logo_2012.svg/1200px-US_Lecce_logo_2012.svg.png", file: "lecce.png" },
  { nome: "Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png", file: "milan.png" },
  { nome: "Monza", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/0/06/AC_Monza_logo.svg/1200px-AC_Monza_logo.svg.png", file: "monza.png" },
  { nome: "Napoli", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Napoli_2004.svg/1200px-SSC_Napoli_2004.svg.png", file: "napoli.png" },
  { nome: "Parma", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/d/df/Parma_Calcio_1913_logo.svg/1200px-Parma_Calcio_1913_logo.svg.png", file: "parma.png" },
  { nome: "Roma", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png", file: "roma.png" },
  { nome: "Torino", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/2/2e/Torino_FC_logo.svg/1200px-Torino_FC_logo.svg.png", file: "torino.png" },
  { nome: "Udinese", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/f/f3/Udinese_Calcio_logo_2010.svg/1200px-Udinese_Calcio_logo_2010.svg.png", file: "udinese.png" },
  { nome: "Venezia", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/6/69/Venezia_FC_logo_2022.svg/1200px-Venezia_FC_logo_2022.svg.png", file: "venezia.png" },
  { nome: "Verona", logo: "https://upload.wikimedia.org/wikipedia/it/thumb/9/92/Hellas_Verona_FC_logo_2020.svg/1200px-Hellas_Verona_FC_logo_2020.svg.png", file: "verona.png" }
]

const EVENTI = ['goal', 'parata', 'palo', 'ammonizione', 'var', 'occasione', 'corner', 'contropiede', 'fuorigioco', 'traversa']

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generaRisultatoReale(segnoScelto) {
  let golCasa = Math.floor(Math.random() * 4)
  let golTrasf = Math.floor(Math.random() * 4)
  
  // Probabilità che il segno scelto si avveri (es. 40%)
  const vinceScommessa = Math.random() < 0.4 

  if (vinceScommessa) {
    if (segnoScelto === '1') {
        golCasa = Math.floor(Math.random() * 3) + 1
        golTrasf = Math.floor(Math.random() * golCasa)
    } else if (segnoScelto === '2') {
        golTrasf = Math.floor(Math.random() * 3) + 1
        golCasa = Math.floor(Math.random() * golTrasf)
    } else {
        golCasa = golTrasf = Math.floor(Math.random() * 3)
    }
  } else {
    // Forza un risultato diverso dal segno scelto se "perde"
    if (segnoScelto === '1' && golCasa >= golTrasf) golTrasf = golCasa + 1
    if (segnoScelto === '2' && golTrasf >= golCasa) golCasa = golTrasf + 1
    if (segnoScelto === 'X' && golCasa === golTrasf) golCasa++
  }
  
  let esitoFinale = golCasa > golTrasf ? '1' : (golCasa < golTrasf ? '2' : 'X')
  return { golCasa, golTrasf, esitoFinale }
}

async function modificaMessaggio(conn, chatId, key, testo, mentions = []) {
  await conn.relayMessage(chatId, { protocolMessage: { key, type: 14, editedMessage: { extendedTextMessage: { text: testo, contextInfo: mentions.length ? { mentionedJid: mentions } : {} } } } }, {})
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender
  const user = global.db.data.users[who]
  const puntata = parseInt(args[0])
  const segno = args[1]?.toUpperCase() // 1, X, 2

  // STEP 1: Selezione Puntata
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💸 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💸 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💸 1000€' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      image: { url: 'https://i.imgur.com/vHIn7rA.png' },
      caption: `⚽ *BENVENUTO NEL CENTRO SCOMMESSE*\n\nQuanto vuoi puntare?`,
      footer: 'Seleziona un importo',
      buttons
    }, { quoted: m })
  }

  // STEP 2: Selezione Segno (1, X, 2)
  if (!segno || !['1', 'X', '2'].includes(segno)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} 1`, buttonText: { displayText: '🏠 CASA (1)' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} X`, buttonText: { displayText: '🤝 PAREGGIO (X)' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} 2`, buttonText: { displayText: '✈️ TRASFERTA (2)' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      text: `🎰 *SCOMMESSA DA ${puntata}€*\n\nSu quale esito vuoi puntare?`,
      footer: 'Scegli il segno',
      buttons
    }, { quoted: m })
  }

  if (user.euro < puntata) return m.reply(`Saldo insufficiente! Hai solo ${formatNumber(user.euro)}€`)

  // LOGICA PARTITA
  const casa = pickRandom(SQUADRE)
  const trasf = pickRandom(SQUADRE.filter(s => s.nome !== casa.nome))
  const quota = (Math.random() * (3.5 - 1.8) + 1.8).toFixed(2)
  const vincita = Math.floor(puntata * quota)
  const risultato = generaRisultatoReale(segno)
  
  user.euro -= puntata
  
  await conn.sendMessage(m.chat, {
    text: `✅ *SCHEDINA GIOCATA!*\n\n🏟️ ${casa.nome} vs ${trasf.nome}\n🎯 Segno: *${segno}*\n📈 Quota: *${quota}*\n💰 Potenziale Vincita: *${formatNumber(vincita)}€*\n\n_La partita sta per iniziare..._`
  }, { quoted: m })

  const live = await conn.sendMessage(m.chat, { text: `🏟️ *LIVE:* ${casa.nome} 0 - 0 ${trasf.nome}` })
  
  // Simulazione cronaca veloce
  for (let i = 0; i < 4; i++) {
    await new Promise(r => setTimeout(r, 2000))
    let progressoGolCasa = Math.floor((risultato.golCasa / 4) * (i + 1))
    let progressoGolTrasf = Math.floor((risultato.golTrasf / 4) * (i + 1))
    await modificaMessaggio(conn, m.chat, live.key, `🏟️ *LIVE:* ${casa.nome} ${progressoGolCasa} - ${progressoGolTrasf} ${trasf.nome}\n\n⌚ Minuto: ${20 * (i+1)}' - Azione pericolosa!`)
  }

  await new Promise(r => setTimeout(r, 2000))
  const vinto = segno === risultato.esitoFinale

  if (vinto) {
    user.euro += vincita
    await modificaMessaggio(conn, m.chat, live.key, `🏁 *FINALE:* ${casa.nome} ${risultato.golCasa} - ${risultato.golTrasf} ${trasf.nome}\n\n🏆 *HAI VINTO!*\n💰 Incasso: +${formatNumber(vincita)}€\n🏦 Saldo: ${formatNumber(user.euro)}€`)
  } else {
    await modificaMessaggio(conn, m.chat, live.key, `🏁 *FINALE:* ${casa.nome} ${risultato.golCasa} - ${risultato.golTrasf} ${trasf.nome}\n\n❌ *HAI PERSO!*\n📉 Perdita: -${formatNumber(puntata)}€\n💼 Saldo: ${formatNumber(user.euro)}€`)
  }
}

handler.help = ['schedina [cifra] [1/X/2]']
handler.tags = ['game']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler
