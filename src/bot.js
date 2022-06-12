require('dotenv').config();
const { Client, Intents } = require('discord.js');

const INTENTS = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
]
const bot = new Client({ intents: INTENTS, partials: ['CHANNEL'] });
const PREFIX = '$';
const CUS_CMDS = ['kick','add','invite'];

currentDate = () => {
    date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

bot.on('ready', () => {
    console.log(`[Logged In] --> ${currentDate()} --> ${bot.user.username, bot.user.tag}`);
});

bot.on('typingStart', (type) => {
    console.log("Typing : ", type, type.author.tag);
})

bot.on('messageCreate', (message) => {
    if (!message.author.bot){
        if(message.content === 'hello') {
            console.log('message', message.author.tag);
            message.channel.send(`Hello ${message.author.tag}`);
        }
        else{
            const [CMD, ...args] = message.content
                                    .substring(PREFIX.length)
                                    .split(/\s+/);
            console.log(CMD, args);
            if (CUS_CMDS.includes(CMD)) {
                console.log('Gotcha');
            }
        }
    }
})

bot.login(process.env.BOT_TOKEN);