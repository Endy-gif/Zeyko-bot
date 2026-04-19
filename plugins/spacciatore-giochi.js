// Inizializzazione sicura dell'oggetto globale
if (!global.piazze) global.piazze = {}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let ora = Date.now()
    let oggi = new Date().toLocaleDateString('it-IT')

    // Inizializzazione piazza
    if (!global.piazze[chat]) {
        global.piazze[chat] = {
            boss: null,
            scadenza: 0,
            banca: 0,
            prezzi: { '1': 15, '2': 35, '3': 75, '4': 150 },
            storico: {} 
        }
    }

    let piazza = global.piazze[chat]
    global.db.data.users[user] = global.db.data.users[user] || { euro: 0 }
    let dbUser = global.db.data.users[user]

    // --- 1. DIVENTASPACCINO ---
    if (command === 'diventaspaccino') {
        let bossAttivo = piazza.boss && ora < piazza.scadenza
        if (bossAttivo) {
            let oreMancanti = Math.ceil((piazza.scadenza - ora) / (1000 * 60 * 60))
            return conn.reply(chat, `⚠️ La piazza è occupata da @${piazza.boss.split('@')[0]}.\nLibera tra ${oreMancanti} ore!`, m, { mentions: [piazza.boss] })
        }
        if (piazza.storico[user] === oggi) {
            return conn.reply(chat, '🚫 Hai già gestito la piazza oggi. Aspetta il prossimo turno!', m)
        }

        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000)
        piazza.storico[user] = oggi
        piazza.banca = 0

        let intro = `ㅤ⋆｡˚『 ╭ \`👑 NUOVO BOSS LOCALE 👑\` ╯ 』˚｡⋆\n╭\n`
        intro += `│ 『 👤 』 @${user.split('@')[0]} è lo spaccino del gruppo!\n`
        intro += `│ 『 ⏳ 』 Scadenza: 24 ore.\n`
        intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📦 VEDI LISTINO', id: `${usedPrefix}spaccino` }) }
        ]
        return conn.sendMessage(chat, { text: intro, footer, mentions: [user], interactiveButtons: buttons }, { quoted: m })
    }

    // --- 2. SPACCINO (CON BOTTONI) ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) {
            const btnBoss = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 DIVENTA BOSS', id: `${usedPrefix}diventaspaccino` }) }]
            return conn.sendMessage(chat, { text: `🏙️ Piazza libera. Vuoi prenderne il controllo?`, footer, interactiveButtons: btnBoss }, { quoted: m })
        }

        let menu = `ㅤ⋆｡˚『 ╭ \`🍀 MERCATO DI @${piazza.boss.split('@')[0].toUpperCase()} 🍀\` ╯ 』˚｡⋆\n╭\n`
        menu += `│ 『 🚬 』 Erba: ${piazza.prezzi['1']}€\n`
        menu += `│ 『 🍋 』 Haze: ${piazza.prezzi['2']}€\n`
        menu += `│ 『 🍫 』 Resina: ${piazza.prezzi['3']}€\n`
        menu += `│ 『 👺 』 Amnesia: ${piazza.prezzi['4']}€\n`
        menu += `│ ──────────────────\n`
        menu += `│ 『 🪙 』 Incasso Boss: ${piazza.banca}€\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌿 ERBA', id: `${usedPrefix}compra 1` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🍋 HAZE', id: `${usedPrefix}compra 2` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🍫 RESINA', id: `${usedPrefix}compra 3` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👺 AMNESIA', id: `${usedPrefix}compra 4` }) }
        ]
        return conn.sendMessage(chat, { text: menu, footer, mentions: [piazza.boss], interactiveButtons: buttons }, { quoted: m })
    }

    // --- 3. COMPRA ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Nessuno spaccia.')
        if (user === piazza.boss) return m.reply('🤨 Sei il boss, usa direttamente `.fuma`!')

        let scelta = text.trim()
        if (!['1', '2', '3', '4'].includes(scelta)) return m.reply('📦 Scegli un prodotto dal menu.')
        
        let prezzo = piazza.prezzi[scelta]
        if (dbUser.euro < prezzo) return m.reply(`📉 Non hai abbastanza euro!`)

        dbUser.euro -= prezzo
        piazza.banca += prezzo
        global.db.data.users[piazza.boss] = global.db.data.users[piazza.boss] || { euro: 0 }
        global.db.data.users[piazza.boss].euro += prezzo

        dbUser.tasca_droga = { id: scelta, nome: ['Erba', 'Haze', 'Resina', 'Amnesia'][parseInt(scelta)-1] }

        const buttons = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔥 ACCENDI', id: `${usedPrefix}fuma` }) }]
        return conn.sendMessage(chat, { text: `✅ Hai comprato *${dbUser.tasca_droga.nome}*.\nI soldi sono andati al Boss.`, footer, interactiveButtons: buttons }, { quoted: m })
    }

    // --- 4. FUMA ---
    if (command === 'fuma') {
        let isBoss = (user === piazza.boss && ora < piazza.scadenza)
        if (!dbUser.tasca_droga && !isBoss) return m.reply('🤷‍♂️ Tasche vuote.')

        let qualita = isBoss ? 4 : parseInt(dbUser.tasca_droga.id)
        const moodArr = [
            { t: '🚨 PARANOIA', d: 'Stai fissando la maniglia della porta...' },
            { t: '🍔 FAME CHIMICA', d: 'Hai appena mangiato un pacchetto di cracker del 2015.' },
            { t: '☁️ RELAX', d: 'Ti senti fuso con il materasso.' },
            { t: '🐲 TRIP', d: 'Stai vedendo i colori della musica.' }
        ]
        let mSel = moodArr[qualita - 1]

        let cap = `ㅤ⋆｡˚『 ╭ \`🌬️ SESSIONE DI FUMO\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 🌿 』 \`Roba:\` *${isBoss ? 'Riserva Boss' : dbUser.tasca_droga.nome}*\n`
        cap += `│ 『 🎭 』 \`Mood:\` *${mSel.t}*\n`
        cap += `│ 『 ✨ 』 \`Effetto:\` *${mSel.d}*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        if (!isBoss) delete dbUser.tasca_droga
        return conn.sendMessage(chat, { text: cap, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma)$/i
handler.group = true

export default handler
