const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const conf = JSON.parse(fs.readFileSync('conf.json'));
const token = conf.key;

const bot = new TelegramBot(token, { polling: true });

let tabella = [" ", " ", " ", " ", " ", " ", " ", " ", " "]; 
let currentPlayer = "❌";
let partita = true; // Controlla se la partita è attiva

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
 
    if (text === "/start") {
        reset();
        tris(chatId);
    }

    if (text === "/help") {
        bot.sendMessage(chatId, 
            "🎮 Benvenuto nel Gioco del Tris!\n\n" +
            "📜 Regole del gioco:\n" +
            "1️⃣ Il gioco si gioca su una griglia 3x3\n" +
            "2️⃣ Due giocatori si alternano: uno usa ❌ e l'altro ⭕\n" +
            "3️⃣ A ogni turno, un giocatore sceglie una casella premendo un bottone\n" +
            "4️⃣ Vince il primo che allinea 3 simboli consecutivi in orizzontale, verticale o diagonale\n" +
            "5️⃣ Se tutte le caselle vengono riempite senza vincitore, la partita finisce in pareggio\n\n" +
            "⚡ Comandi disponibili:\n" +
            "➡️ /start → Inizia una nuova partita\n" +
            "➡️ /help → Mostra le regole del gioco",
        );
    }
    
});

function tris(chatId) {
    const keyboard = {
        inline_keyboard: [
            [cellButton(0), cellButton(1), cellButton(2)],
            [cellButton(3), cellButton(4), cellButton(5)],
            [cellButton(6), cellButton(7), cellButton(8)]
        ]
    };
    
    //reply_markup: keyboard serve per aggiungere la testiera premibile
    bot.sendMessage(chatId, `Gioco del Tris!\nTurno di: ${currentPlayer}`, { reply_markup: keyboard });
}

//per ogni cella
function cellButton(i) {
    return {
        text: tabella[i],
        callback_data: `move_${i}`//ogni bottone della griglia ha un callback_data con il formato move_X dove X è l indice della cella
    };
}

//preme un bottone
bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const i = parseInt(query.data.split("_")[1]);//spacchetto il formato move_x per ottenere l indice 

    if (partita && tabella[i] === " ") { //controllo se il gioco è attivo e la cella è vuota
        tabella[i] = currentPlayer;
        
        if (checkWin(currentPlayer)) {
            partita = false;
            bot.editMessageText(`🎉  ha vinto ${currentPlayer}  🎉`, {
                chat_id: chatId,
                message_id: query.message.message_id
            });
            return;

        } else if (!tabella.includes(" ")) {//pareggio
            partita = false;
            bot.editMessageText("🤝 Pareggio 🤝", {
                chat_id: chatId,
                message_id: query.message.message_id
            });
            return;
        }

        currentPlayer = currentPlayer === "❌" ? "⭕" : "❌";//cambio turno
        
        //aggiorno il messaggio
        bot.editMessageText(`Gioco del Tris!\nTurno di: ${currentPlayer}`, {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: { inline_keyboard: [
                [cellButton(0), cellButton(1), cellButton(2)],
                [cellButton(3), cellButton(4), cellButton(5)],
                [cellButton(6), cellButton(7), cellButton(8)]
            ]}
        });
    }
});

function checkWin(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],//righe
        [0, 3, 6], [1, 4, 7], [2, 5, 8],//colonne
        [0, 4, 8], [2, 4, 6]//diagonali
    ];

    for (let i = 0; i < winningCombinations.length; i++) {
        const [a, b, c] = winningCombinations[i];
        
        //verifico se tutte le celle della combinazione sono uguali al simbolo del giocatore
        if (tabella[a] === player && tabella[b] === player && tabella[c] === player) {
            return true;
        }
    }

    return false;//pareggio
}


function reset() {
    tabella = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
    currentPlayer = "❌";
    partita = true;
}
