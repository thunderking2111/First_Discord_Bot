require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
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
const CUS_COM_PRE = '?';
const CUS_CMDS = ['kick','add','invite'];
const GREET_TIME = {
    hour: 04,
    minute: 30,
    zone: 'utc',
    format: 'ampm',
    interval: 24
}
const TEST_CHNL = '991406109598425199';
const LOG_CHNL = '992506051175923762';

currentDate = () => {
    date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

process.on('uncaughtException', (err, origin) => {
    const errTitle = err.stack.slice(0, err.stack.indexOf('\n'));
    const errDis = err.stack.slice(err.stack.indexOf('\n')+1, err.stack.length);
    const embedMsg = new MessageEmbed()
                            .setColor('RED')
                            .setTitle('☠️ ERROR ☠️')
                            .addFields(
                                {name: errTitle, value: '```js\n' + errDis + '\n```', inline: false},
                            );
    bot.channels.cache.get(LOG_CHNL)
        .send({ embeds: [embedMsg]});
});

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
        if (message.channel.id === TEST_CHNL) {
            if (message.content[0] === CUS_COM_PRE) {
                const CMD = message.content
                            .substring(1)
                            .trim();
                try {
                    const res = eval(CMD);
                    if (res instanceof Promise) {
                        res.then(res => {
                            console.log('Prom');
                            message.channel.send('```json\n' + JSON.stringify(res.toJSON() ,null,2) + '\n```' );
                        })
                    } else {
                        message.channel.send('```json\n' + JSON.stringify(res.toJSON() ,null,2) + '\n```' );
                    }
                } catch(e) {
                    message.channel.send('> Something Went Wrong !! ☠️☠️');
                    message.channel.send('```js\n' + e.stack + '\n```' );
                }
            }
        } else if (message.content === 'hello'){
            message.channel.send('Hello')
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
                    return true;
                });
        })
        .then(response => console.log(`[Greeter  ] --> ${currentDate()} --> Greetings Done!`))
        .catch(error => console.log('Error: ', error));
}

const goodMorningGreeter = () => {
    setInterval(() => {
        greeter();
    }, GREET_TIME.interval*3600000);
};

bot.login(process.env.BOT_TOKEN);
