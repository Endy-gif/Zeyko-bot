let handler = async (m, { conn, usedPrefix }) => {
  let mention = `@${m.sender.split('@')[0]}`
  let text = `
*╭───╼ ⚡ ╾───╮*
   *DEVELOPER INFO*
*╰───╼ 👑 ╾───╯*

👋 Ciao ${mention}, 
ecco i riferimenti ufficiali del mio creatore.

*┏━━━━━━━━━━━━━━━━┓*
*┃* 👤 *OWNER:* Blood
*┃* 🪐 *STATUS:* Online
*┃* 💻 *DEV:* JavaScript / Node.js
*┗━━━━━━━━━━━━━━━━┛*

*───╼  SOCIAL LINKS  ╾───*
『 🔗 』*GitHub:* github.com/BLOOD212
『 📸 』*Instagram:* @blood_ilreal

━━━━━━━━━━━━━━━━━━━━
   *😈 𝖇𝖑𝖔𝖔𝖉 𝖉𝖔𝖒𝖎𝖓𝖆 ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  // Struttura compatibile per bottoni interattivi
  const buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🛡️ MENU' }, type: 1 },
    { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '⚡ STATUS' }, type: 1 }
  ]

  const buttonMessage = {
      text: text,
      footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
      buttons: buttons,
      headerType: 1,
      mentions: [m.sender]
  }

  try {
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  } catch (e) {
    // Se i bottoni falliscono ancora, invia il testo semplice (fallback)
    console.error("Errore invio bottoni:", e)
    await conn.reply(m.chat, text, m, { mentions: [m.sender] })
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
