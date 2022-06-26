require('dotenv').config();
const { Client, Intents } = require('discord.js');
const axios = require('axios').default;

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
const GREET_TIME = {
    hour: 10,
    minute: 00,
    zone: 'local',
    format: 'ampm',
    interval: 24
}
let isTyping = false;

currentDate = () => {
    date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

bot.once('ready', () => {
    console.log(`[Logged In] --> ${currentDate()} --> ${bot.user.username, bot.user.tag}`);
    const initInterval = setInterval((date = new Date()) => {
        if (date.getHours() === GREET_TIME.hour && date.getMinutes() === GREET_TIME.minute) {
            console.log(`[Greeter  ] --> ${currentDate()} --> Started`);
            greeter();
            goodMorningGreeter();
            clearInterval(initInterval);
        }
    }, 1000);
});

bot.on('typingStart', (type) => {
    console.log(`[Typing] -----> ${type.user.username}`);
    // setTimeout(() => {bot.dis dispatchEvent('typingStart')}, 3000);
});

bot.on('messageCreate', (message) => {
    if (!message.author.bot){
        if (message.content === 'hello') {
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

const greeter = () => {
    axios.get(`https://tenor.googleapis.com/v2/search?q=Good Morning&key=${process.env.TENOR_TOKEN}&client_key=superbot&limit=8`)
        .then(response => response.data.results)
        .then(results => {
            bot.channels.cache
                .filter((channel) => channel.type === 'GUILD_TEXT')
                .forEach((channel) => {
                    const index = Math.floor(Math.random() * results.length);
                    channel.send(results[index].media_formats.gif.url);
                });
        })
        .then(response => console.log(`[Greeter  ] --> ${currentDate()} --> Greetings Done!`))
        .catch(error => console.log('Error: ', error));
}

const goodMorningGreeter = () => {
    setInterval(() => {
        greeter();
    }, GREET_TIME.interval*3600);
};

bot.login(process.env.BOT_TOKEN);
