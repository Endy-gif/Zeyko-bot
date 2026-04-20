//By Bonzino 
import fs from 'fs'

const SNAI_PATH = './media/snai.png'

const SQUADRE = [
  "Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", 
  "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", 
  "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"
]

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generaRisultatoReale(segnoScelto) {
  let golCasa = Math.floor(Math.random() * 4)
  let golTrasf = Math.floor(Math.random() * 4)
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
  const segno = args[1]?.toUpperCase()

  // Controllo immagine locale
  const hasImage = fs.existsSync(SNAI_PATH)

  // STEP 1: Selezione Puntata
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💸 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💸 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💸 1000€' }, type: 1 }
    ]

    const baseMsg = {
      caption: `⚽ *CENTRO SCOMMESSE SERIE A*\n\n👤 Utente: @${who.split('@')[0]}\n💰 Saldo: ${formatNumber(user.euro)}€\n\nQuanto vuoi puntare?`,
      footer: 'Seleziona un importo',
      buttons,
      mentions: [who]
    }

    if (hasImage) {
      return conn.sendMessage(m.chat, { image: fs.readFileSync(SNAI_PATH), ...baseMsg }, { quoted: m })
    } else {
      return conn.sendMessage(m.chat, { text: baseMsg.caption, footer: baseMsg.footer, buttons, mentions: [who] }, { quoted: m })
    }
  }

  // STEP 2: Selezione Segno
  if (!segno || !['1', 'X', '2'].includes(segno)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} 1`, buttonText: { displayText: '🏠 CASA (1)' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} X`, buttonText: { displayText: '🤝 PAREGGIO (X)' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} 2`, buttonText: { displayText: '✈️ TRASFERTA (2)' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      text: `🎰 *SCOMMESSA DA ${formatNumber(puntata)}€*\n\nSu quale esito vuoi puntare per il match di oggi?`,
      footer: 'Scegli il segno vincente',
      buttons
    }, { quoted: m })
  }

  if (user.euro < puntata) return m.reply(`Saldo insufficiente! Hai solo ${formatNumber(user.euro)}€`)

  // LOGICA PARTITA
  const nomeCasa = pickRandom(SQUADRE)
  const nomeTrasf = pickRandom(SQUADRE.filter(s => s !== nomeCasa))
  const quota = (Math.random() * (3.5 - 1.8) + 1.8).toFixed(2)
  const vincita = Math.floor(puntata * quota)
  const risultato = generaRisultatoReale(segno)
  
  user.euro -= puntata
  
  await conn.sendMessage(m.chat, {
    text: `✅ *SCHEDINA CONFERMATA*\n\n🏟️ Match: *${nomeCasa} vs ${nomeTrasf}*\n🎯 Il tuo segno: *${segno}*\n📈 Quota: *x${quota}*\n💰 Potenziale Vincita: *${formatNumber(vincita)}€*\n\n_Il match sta per iniziare..._`
  }, { quoted: m })

  const live = await conn.sendMessage(m.chat, { text: `🏟️ *CAMPIONATO LIVE*\n\n${nomeCasa} 0 - 0 ${nomeTrasf}\n\n⌚ Minuto: 0'` })
  
  for (let i = 0; i < 4; i++) {
    await new Promise(r => setTimeout(r, 2000))
    let progressoGolCasa = Math.floor((risultato.golCasa / 4) * (i + 1))
    let progressoGolTrasf = Math.floor((risultato.golTrasf / 4) * (i + 1))
    
    let eventoMsg = pickRandom([
        `🔥 Occasione incredibile per il ${nomeCasa}!`,
        `🧤 Parata miracolosa del portiere del ${nomeTrasf}!`,
        `🟨 Ammonizione per gioco scorretto.`,
        `🚩 Calcio d'angolo battuto velocemente.`
    ])

    await modificaMessaggio(conn, m.chat, live.key, `🏟️ *CAMPIONATO LIVE*\n\n${nomeCasa} ${progressoGolCasa} - ${progressoGolTrasf} ${nomeTrasf}\n\n⌚ Minuto: ${22 * (i+1)}'\n📝 ${eventoMsg}`)
  }

  await new Promise(r => setTimeout(r, 2000))
  const vinto = segno === risultato.esitoFinale

  if (vinto) {
    user.euro += vincita
    await modificaMessaggio(conn, m.chat, live.key, `🏁 *FISCHIO FINALE*\n\n${nomeCasa} ${risultato.golCasa} - ${risultato.golTrasf} ${nomeTrasf}\n\n✅ *SCHEDINA VINCENTE!*\n💰 Hai vinto: +${formatNumber(vincita)}€\n🏦 Nuovo Saldo: ${formatNumber(user.euro)}€`)
  } else {
    await modificaMessaggio(conn, m.chat, live.key, `🏁 *FISCHIO FINALE*\n\n${nomeCasa} ${risultato.golCasa} - ${risultato.golTrasf} ${nomeTrasf}\n\n❌ *SCHEDINA PERDENTE!*\n📉 Perdita: -${formatNumber(puntata)}€\n💼 Saldo attuale: ${formatNumber(user.euro)}€`)
  }
}

handler.help = ['schedina']
handler.tags = ['game']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler
