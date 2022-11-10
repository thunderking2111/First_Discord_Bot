require('dotenv').config();
const { Client, Intents } = require('discord.js');
const { embadedMsg, messageHandler } = require('./messaging.js');
const axios = require('axios').default;

const INTENTS = [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_TYPING,
];
const PARTIALS = [
  'CHANNEL',
  'USER',
];
const bot = new Client({ intents: INTENTS, partials: PARTIALS });
const channelManager = {
  channelLocks: {},
  TEST_CHNL: null,
  LOG_CHNL: null,
};
const GREET_TIME = {
  hour: 4,
  minute: 30,
  zone: 'utc',
  format: 'ampm',
  interval: 24,
};

// -----------------------------------------------------------------------
// EVENTLISTENERS
// -----------------------------------------------------------------------

process.on('uncaughtException', (err) => {
  try {
    embadedMsg({ type: 'error', options: { description: err } });
  } catch {
    console.log(err);
  }
});

bot.once('ready', async () => {
  channelManager.LOG_CHNL = bot.channels.cache.get('992506051175923762');
  channelManager.TEST_CHNL = bot.channels.cache.get('991406109598425199');
  setup();
  console.log(`[Logged In] --> ${currentDate()} --> ${bot.user.tag}`);
  const initInterval = setInterval((date = new Date()) => {
    if (date.getHours() === GREET_TIME.hour && date.getMinutes() === GREET_TIME.minute) {
      console.log(`[Greeter  ] --> ${currentDate()} --> Started`);
      greeter();
      goodMorningGreeter();
      clearInterval(initInterval);
    }
  }, 1000);
  bot.commands = await require('./commands/init.js').init(bot.application.commands);
  console.log(bot.commands);
  embadedMsg({ type: 'success', options: { title: 'Logged In' } });
});

bot.on('interactionCreate', (interaction) => {
  if (interaction.isCommand()) {
    const delayedInteraction = new DelayedInteraction(interaction);
    const { command, options } = delayedInteraction.interaction;
    if (command.type === 'CHAT_INPUT') {
      bot.commands[command.name].execute(bot, options)
        .then(res => {
          console.log('Done Executing');
          delayedInteraction.edit(res.description);
        })
        .catch(res => {
          console.error(res);
          delayedInteraction.edit(res.title);
          embadedMsg({ type: 'error', options: { title: res.title, description: res.error } });
        });
    }
  }
});

bot.on('typingStart', (type) => {
  console.log(`[Typing] -----> ${type.user.username}`);
});

bot.on('messageCreate', (message) => {
  messageHandler(message, bot);
});

// -----------------------------------------------------------------------
// METHODS / CLASSES
// -----------------------------------------------------------------------

class DelayedInteraction {
  constructor (interaction) {
    this.interaction = interaction;
    this.deferPromise = this.interaction.deferReply({ ephemeral: true });
  }

  async edit (content) {
    await this.deferPromise;
    this.interaction.editReply({
      content,
      ephemeral: true
    }).catch(error => {
      console.error(error);
      embadedMsg({ type: 'error', options: { title: error.code, description: error } });
    });
  }
}

const currentDate = () => {
  const date = new Date();
  return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
};

const goodMorningGreeter = () => {
  setInterval(() => {
    greeter();
  }, GREET_TIME.interval * 3600000);
};

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
    .then(() => console.log(`[Greeter  ] --> ${currentDate()} --> Greetings Done!`))
    .catch(error => embadedMsg({ type: 'error', options: { description: error } }));
};

const setup = () => {
  const files = require('./config.json').setupFiles;
  files.forEach(file => {
    require(`./${file}`).setup({ channelManager });
  });
};

let retry = 0;
const loginInterval = setInterval(() => {
  bot.login(process.env.BOT_TOKEN)
    .then(() => { clearInterval(loginInterval); })
    .catch((error) => {
      console.log(error);
      if (retry++ >= 5) {
        console.error('ERROR: Could not log into Bot');
        clearInterval(loginInterval);
      }
    });
}, 1000);
