const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}insultona`,
        buttonText: { displayText: '🤬 Sfaccimm, n’at’ata vota!' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix, text }) => {
    if (!m.isGroup) return

    let gruppi = global.db.data.chats[m.chat]
    if (gruppi.spacobot === false) return

    const cooldownKey = `insultona_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 5000;

    if (now - lastUse < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
        return m.reply(`⏳ Statte quiet', bucchinà! Aspetta ${remaining}s primm 'e rompere 'o cazzo n'ata vota.`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let menzione = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    if (!menzione) throw 'A chi amm’a sfanculà? Miette ‘o nome o quota a coccheruno!'

    const categorie = {
        CATTIVERIA: [
            "si na mappina 'e mmerda, mammata è na sbrinfia ca se piglia pure 'e mazz'e scopa rinto vico!",
            "ti schiattasse 'a capa sott'a nu tram, tu, chillu mmerda 'e patete e tutta 'a razza 'e rignante ca te puorte appriesso!",
            "si nu sfaccimmato senza dignità, mammata m’ha ditto ca pure 'o can'e casa s'a scopa pecchè tene 'a fess'a paraviso!",
            "te n'aggia ditta tante ca t'aggia fà passà 'a voglia 'e nascere, piezz 'e rincoglionito e figl 'e na latrina!"
        ],
        SCHIFEZZE: [
            "tieni n'addore 'e fessa r'a nonna ca manco 'e mosche te s'avvicinano, puorc' e mmerda!",
            "si talmente schifoso ca quann'o pat' s'è venuto a ffa 'o rito e' battesimo, o' prevete t'ha sputato 'nfacce!",
            "mammata è na vavosa ca se ffa passà pure r'e marrucchini for'a ferrovìa, sùcamme 'o purpo!",
            "faje schifo pure a 'e scarrafune d'a fognatura, tieni 'a faccia comm'o pertuso r'o culo 'e n'asino!"
        ],
        UMILIAZIONI: [
            "ma va’ jitt’o sango, tu e chi t'è mmuorto, si na mmerda ca cammina!",
            "si cchiù cornuto 'e na sporta 'e purpetielli, a mugliereta nun t'o ddice ma o' vico sano s'o ffa!",
            "nun sî bbuono manco p'essere jittato mmiez'a via, manco 'e cane te pìsciano 'ncuollo!",
            "si nu sfigato r'a rignante, t'avesser'a piglià e t'avesser'a appennere p'e palle ncopp'o Vesuvio!"
        ]
    };

    const keys = Object.keys(categorie);
    const randomCategory = keys[Math.floor(Math.random() * keys.length)];
    const lista = categorie[randomCategory];
    const insultoRandom = lista[Math.floor(Math.random() * lista.length)];

    const emojiCategoria = {
        CATTIVERIA: "🔥",
        SCHIFEZZE: "🤮",
        UMILIAZIONI: "💀"
    };

    await conn.sendMessage(m.chat, {
        text: `*${emojiCategoria[randomCategory]} SENTENZA NAPOLETANA: ${randomCategory}* \n\n@${menzione.split`@`[0]} ${insultoRandom}`,
        buttons: playAgainButtons(usedPrefix),
        headerType: 1,
        mentions: [menzione]
    }, { quoted: m });
};

handler.help = ['insultanp'];
handler.tags = ['giochi'];
handler.command = /^(insultanp)$/i;
handler.group = true;

export default handler;
