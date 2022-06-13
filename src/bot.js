require('dotenv').config();
const { Client, Intents } = require('discord.js');

const INTENTS = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
]
const PARTIALS = [
    'CHANNEL',
    'USER',
]
const bot = new Client({ intents: INTENTS, partials: PARTIALS });
const PREFIX = '$';
const CUS_CMDS = ['kick','add','invite'];
let isTyping = false;

currentDate = () => {
    date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

bot.once('ready', () => {
    console.log(`[Logged In] --> ${currentDate()} --> ${bot.user.username, bot.user.tag}`);
    console.log(bot.channels.cache.each(user => console.log(user)));
    // goodMorningGreeter();
    // console.log(bot);
});

bot.on('typingStart', (type) => {
    console.log(`[Typing] -----> ${type.user.username}`);
    // setTimeout(() => {bot.dis dispatchEvent('typingStart')}, 3000);
});

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
});

setInterval(() => {
    // console.log(bot.channels.cache.each.);
    console.log();
}, 10000);

const goodMorningGreeter = () => {
    bot.setInterval(() => {
       console.log('Called');
    }, 10000);
};

bot.login(process.env.BOT_TOKEN);