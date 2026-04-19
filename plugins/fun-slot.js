import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gif-encoder-2'

// --- CONFIGURAZIONI ---
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://openmoji.org/data/color/svg/1F352.svg',
    '🍋': 'https://openmoji.org/data/color/svg/1F34B.svg',
    '🍉': 'https://openmoji.org/data/color/svg/1F349.svg',
    '🍇': 'https://openmoji.org/data/color/svg/1F347.svg',
    '🍎': 'https://openmoji.org/data/color/svg/1F34E.svg',
    '🍓': 'https://openmoji.org/data/color/svg/1F353.svg'
}
const cavalliConfig = [
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    try {
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        let user = global.db.data.users[m.sender]
        if (user.euro === undefined) user.euro = 1000

        const checkMoney = (costo) => {
            if (user.euro < costo) {
                m.reply(`⚠️ Saldo insufficiente! Hai ${user.euro}€`)
                return false
            }
            return true
        }

        // --- MENU PRINCIPALE ---
        if (command === 'casino') {
            let txt = `*🎰 GRAND CASINÒ ANIMATO 🎰*\n\n`
            txt += `💰 *Saldo:* ${user.euro}€\n\n`
            txt += `• ${usedPrefix}slot (100€)\n`
            txt += `• ${usedPrefix}rigore <sx|cx|dx> (100€)\n`
            txt += `• ${usedPrefix}puntacorsa <nome> (100€)\n`
            txt += `• ${usedPrefix}playroulette <pari|dispari> (100€)\n`
            txt += `• ${usedPrefix}gratta (200€)`
            return m.reply(txt)
        }

        // --- SLOT MACHINE ---
        if (command === 'slot') {
            if (!checkMoney(100)) return
            const encoder = new GIFEncoder(600, 250)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(100); encoder.setQuality(10)
            const canvas = createCanvas(600, 250); const ctx = canvas.getContext('2d')
            let final = [fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)]]
            let win = (final[0] === final[1] || final[1] === final[2] || final[0] === final[2])
            const imgs = {}; for(let f of fruits) imgs[f] = await loadImage(fruitURLs[f])

            for(let i=0; i<8; i++) {
                ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
                for(let j=0; j<3; j++) ctx.drawImage(imgs[fruits[Math.floor(Math.random()*6)]], 100+(j*150), 50, 100, 100)
                encoder.addFrame(ctx)
            }
            ctx.fillStyle = '#111'; ctx.fillRect(0,0,600,250)
            ctx.drawImage(imgs[final[0]], 100, 50, 100, 100); ctx.drawImage(imgs[final[1]], 250, 50, 100, 100); ctx.drawImage(imgs[final[2]], 400, 50, 100, 100)
            for(let i=0; i<10; i++) encoder.addFrame(ctx)
            encoder.finish()
            user.euro += win ? 200 : -100
            return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? '✅ VINTO!' : '❌ PERSO!' }, { quoted: m })
        }

        // --- RIGORI ---
        if (command === 'rigore') {
            if (!checkMoney(100)) return
            let tiro = args[0] || 'cx'
            let parata = ['sx', 'cx', 'dx'][Math.floor(Math.random()*3)]
            let win = tiro !== parata
            const encoder = new GIFEncoder(600, 300)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(120)
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            let pos = { sx: 150, cx: 300, dx: 450 }
            for(let f=0; f<7; f++) {
                ctx.fillStyle = '#2e7d32'; ctx.fillRect(0,0,600,300); ctx.strokeStyle = '#fff'; ctx.strokeRect(100, 50, 400, 200)
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(300 + (pos[tiro]-300)*(f/6), 250 - (150*(f/6)), 15, 0, Math.PI*2); ctx.fill()
                encoder.addFrame(ctx)
            }
            encoder.finish()
            user.euro += win ? 150 : -100
            return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? '⚽ GOOOL!' : '🧤 PARATA!' }, { quoted: m })
        }

        // --- CORSA CAVALLI ---
        if (command === 'puntacorsa') {
            if (!checkMoney(100)) return
            let scelta = args[0]?.toUpperCase()
            let winnerIdx = Math.floor(Math.random()*4)
            let win = scelta === cavalliConfig[winnerIdx].nome
            const encoder = new GIFEncoder(600, 300)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(150)
            const canvas = createCanvas(600, 300); const ctx = canvas.getContext('2d')
            for(let f=0; f<10; f++) {
                ctx.fillStyle = '#558b2f'; ctx.fillRect(0,0,600,300)
                cavalliConfig.forEach((c, i) => {
                    let x = 50 + (f === 9 && i === winnerIdx ? 450 : Math.random()*300)
                    ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(x, 60+(i*60), 15, 0, Math.PI*2); ctx.fill()
                    ctx.fillStyle = '#fff'; ctx.font = '12px Arial'; ctx.fillText(c.nome, 10, 65+(i*60))
                })
                encoder.addFrame(ctx)
            }
            encoder.finish()
            user.euro += win ? 300 : -100
            return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? '🏆 VINTO!' : `❌ VINCE ${cavalliConfig[winnerIdx].nome}` }, { quoted: m })
        }

        // --- ROULETTE ---
        if (command === 'playroulette') {
            if (!checkMoney(100)) return
            let n = Math.floor(Math.random()*37)
            let scelta = args[0]?.toLowerCase()
            let win = (scelta === 'pari' && n % 2 === 0 && n !== 0) || (scelta === 'dispari' && n % 2 !== 0)
            const encoder = new GIFEncoder(300, 300)
            encoder.start(); encoder.setRepeat(0); encoder.setDelay(100)
            const canvas = createCanvas(300, 300); const ctx = canvas.getContext('2d')
            for(let f=0; f<8; f++) {
                ctx.fillStyle = '#064e3b'; ctx.fillRect(0,0,300,300)
                ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'
                ctx.fillText(Math.floor(Math.random()*37), 150, 160)
                encoder.addFrame(ctx)
            }
            ctx.fillStyle = '#064e3b'; ctx.fillRect(0,0,300,300); ctx.fillStyle = '#f1c40f'; ctx.fillText(n, 150, 160)
            for(let i=0; i<10; i++) encoder.addFrame(ctx)
            encoder.finish()
            user.euro += win ? 150 : -100
            return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? `✅ USCITO ${n}: VINTO!` : `❌ USCITO ${n}: PERSO!` }, { quoted: m })
        }

        // --- GRATTA E VINCI ---
        if (command === 'gratta') {
            if (!checkMoney(200)) return
            let premio = [0, 0, 500, 0, 1000, 5000][Math.floor(Math.random()*6)]
            const canvas = createCanvas(400, 200); const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#ffd700'; ctx.fillRect(0,0,400,200)
            ctx.fillStyle = '#000'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'
            ctx.fillText(premio > 0 ? `HAI VINTO ${premio}€!` : 'NON HAI VINTO', 200, 110)
            user.euro += (premio - 200)
            return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `Saldo attuale: ${user.euro}€` }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante la creazione della GIF. Riprova.')
    }
}

handler.help = ['casino']
handler.tags = ['giochi']
handler.command = /^(casino|slot|rigore|puntacorsa|playroulette|gratta)$/i
handler.group = true

export default handler
