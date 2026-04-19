import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    // Cerchiamo video con hashtag meme
    let searchUrl = `https://www.tikwm.com/api/feed/search?keywords=meme&count=20&cursor=0`;
    
    try {
        let res = await fetch(searchUrl);
        let json = await res.json();

        if (!json.data || !json.data.videos || json.data.videos.length === 0) {
            return m.reply('❌ Non ho trovato meme al momento.');
        }

        // Scegliamo un video a caso
        let videos = json.data.videos;
        let randomVideo = videos[Math.floor(Math.random() * videos.length)];
        let videoUrl = randomVideo.play; // URL del video senza watermark

        // --- IL PASSAGGIO CHIAVE: SCARICAMENTO EFFETTIVO ---
        // Scarichiamo il video trasformandolo in un Buffer (dati binari)
        let response = await fetch(videoUrl);
        let buffer = await response.buffer();

        // Inviamo il Buffer come file video reale
        await conn.sendMessage(
            m.chat, 
            { 
                video: buffer, 
                caption: `😂 *Meme caricato!*\n👤 @${randomVideo.author.unique_id}`,
                mimetype: 'video/mp4',
                fileName: `meme.mp4`
            }, 
            { quoted: m }
        );

    } catch (e) {
        console.error(e);
        m.reply('⚠️ Errore nel download del video.');
    }
};

handler.help = ['meme'];
handler.tags = ['giochi'];
handler.command = ['meme'];

export default handler;
