require('dotenv').config();
const { Client, Intents, MessageEmbed, DataResolver } = require('discord.js');
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
let channel_locks = {};
const CUS_CMDS = ['clear', 'kick','add','invite'];
const CUS_COM_PRE = '$';
const EVAL = '?';
const GREET_TIME = {
    hour: 04,
    minute: 30,
    zone: 'utc',
    format: 'ampm',
    interval: 24
}
let TEST_CHNL = null;
let LOG_CHNL = null;

currentDate = () => {
    date = new Date();
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

process.on('uncaughtException', (err) => {
    const errTitle = err.stack.slice(0, err.stack.indexOf('\n'));
    const errDis = err.stack.slice(err.stack.indexOf('\n')+1, err.stack.length);
    const embedMsg = new MessageEmbed()
                            .setColor('RED')
                            .setTitle('☠️ ERROR ☠️')
                            .setDescription(errTitle);
    LOG_CHNL.send({ embeds: [embedMsg]});
    LOG_CHNL.send('```js\n' + errDis + '\n```');
});

bot.once('ready', () => {
    LOG_CHNL = bot.channels.cache.get('992506051175923762');
    TEST_CHNL = bot.channels.cache.get('991406109598425199');
    console.log(`[Logged In] --> ${currentDate()} --> ${bot.user.username, bot.user.tag}`);
    const initInterval = setInterval((date = new Date()) => {
        if (date.getHours() === GREET_TIME.hour && date.getMinutes() === GREET_TIME.minute) {
            console.log(`[Greeter  ] --> ${currentDate()} --> Started`);
            greeter();
            goodMorningGreeter();
            clearInterval(initInterval);
        }
    }, 1000);
    const embedMsg = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('Logged In');
    LOG_CHNL.send({ embeds: [embedMsg]});
});

bot.on('typingStart', (type) => {
    console.log(`[Typing] -----> ${type.user.username}`);
});

bot.on('messageCreate', (message) => {
    if (!message.author.bot){
        switch(message.content[0]) {
            case CUS_COM_PRE: {
                const [CMD, ...args] = message.content
                                        .substring(1)
                                        .trim()
                                        .split(/\s+/);
                if (CUS_CMDS.includes(CMD)) {
                    switch(CMD) {
                        case 'clear': {
                            if (args[0] === 'all') {
                                bot.channels.cache
                                    .filter(channel => channel.type === 'GUILD_TEXT')
                                    .forEach(channel => {
                                        if (! channel_locks[channel.id]) {
                                            channel_locks[channel.id] = true;
                                            console.log(`Clear ${channel.name}`);
                                            channel.messages._fetchMany({}, true)
                                                .then(async (messages) => {
                                                    for (let message of messages.values()) {
                                                        await message.delete();
                                                    }
                                                    return Promise.resolve();
                                                })
                                                .then(() => console.log(`Done Clearing ${channel.name}` ))
                                                .catch(e => console.log(`Couldn't Clear ${channel.name} \n ${e}`))
                                                .finally(() => channel_locks[channel.id] = false);
                                        } else {
                                            message.channel.send(`> Clear already running for ${channel.name}`);
                                        }
                                    });
                            } else {
                                if (!channel_locks[message.channel.id]) {
                                    channel_locks[message.channel.id] = true;
                                    console.log(`Clear ${message.channel.name}`);
                                    message.channel.messages._fetchMany({}, true)
                                        .then(async messages => {
                                            for (let message of messages.values()) {
                                                await message.delete();
                                            }
                                            return Promise.resolve();
                                        }).then(r => console.log(`Done Clearing ${message.channel.name}`))
                                        .catch(e => console.log(`Couldn't Clear ${message.channel.name} \n ${e}`))
                                        .finally(() => channel_locks[message.channel.id] = false);
                                } else {
                                    message.channel.send(`> Clear already running for ${message.channel.name}`);
                                }
                            }
                            break;
                        }
                        default: {
                            message.channel.messages._fetchMany({}, true)
                                .then(messages => {
                                    messages.forEach(message => message.delete())
                                })
                                .catch(e => console.log(e));
                        }
                    }
                }
                break;
            }
            case EVAL: {
                if (message.channel.id === TEST_CHNL.id) {
                        const CMD = message.content
                                    .substring(1)
                                    .trim();
                        try {
                            const res = eval(CMD);
                            if (res instanceof Promise) {
                                res.then(res => {
                                    console.log('Prom');
                                    if (typeof res == 'object') {
                                        message.channel.send('```json\n' + JSON.stringify(res.toJSON() ,null,2) + '\n```' );
                                    } else {
                                        message.channel.send(res.toString());
                                    }
                                })
                            } else {
                                if (typeof res == 'object') {
                                    message.channel.send('```json\n' + JSON.stringify(res.toJSON() ,null,2) + '\n```' );
                                } else {
                                    message.channel.send(res.toString());
                                }
                            }
                        } catch(e) {
                            message.channel.send('> Something Went Wrong !! ☠️☠️');
                            message.channel.send('```js\n' + e.stack + '\n```' );
                        }
                }
                break;
            }
            default: {
                if (message.content === 'hello') {
                    message.channel.send('Hello');
                }
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

let retry = 0;
while(true) {
    try {
        bot.login(process.env.BOT_TOKEN);
        break;
    } catch {
        console.log(err.stack);
        if (retry++ >= 5) {
            console.log('ERROR: Could Not log into Bot');
            break;
        }
    }
}
