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

  let msg = {
    viewOnce: true,
    text: text,
    footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
    mentions: [m.sender],
    buttons: [
      {
        buttonId: `${usedPrefix}ping`,
        buttonText: { displayText: '⚡ Status' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}menu`,
        buttonText: { displayText: '🛡️ Menu' },
        type: 1
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "💻 GitHub",
          url: "https://github.com/BLOOD212/BLD-BLOOD-BOT",
          merchant_url: "https://github.com/BLOOD212/BLD-BLOOD-BOT"
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "📸 Instagram",
          url: "https://www.instagram.com/blood_ilreal",
          merchant_url: "https://www.instagram.com/blood_ilreal"
        })
      }
    ]
  }

  // Se i bottoni misti danno problemi, Baileys a volte richiede di inviarli separatamente.
  // Ma proviamo prima la soluzione standard.
  await conn.sendMessage(m.chat, msg, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
