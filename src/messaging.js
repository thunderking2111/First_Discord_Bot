const CUS_CMDS = ['clear', 'kick', 'add', 'invite'];
const CUS_COM_PRE = '$';
const EVAL = '?';

// -----------------------------------------------------------------------
// PRIVATE
// -----------------------------------------------------------------------

function _formatData (data, embade = false) {
  if (!data) {
    return [];
  }
  if (typeof data === 'object') {
    data = require('util').inspect(data, { depth: 1 });
  } else {
    data = data.toString();
  }
  const newData = [];
  let messageLimit = (embade ? 4000 : 2000) - 10;
  function divideData (pos) {
    if (data.length - pos > messageLimit) {
      const char = data[pos + messageLimit - 1];
      let offSet = 0;
      if (char === '\n') {
        newData.push(data.slice(pos, pos + messageLimit));
      } else {
        offSet = 1;
        while (true) {
          if (data[pos + messageLimit - 1 - offSet] === '\n') {
            break;
          }
          offSet++;
        }
        newData.push('```js\n' + data.slice(pos, pos + messageLimit - offSet) + '\n```');
      }
      messageLimit = 2000 - 10;
      divideData(pos + messageLimit - offSet);
    } else {
      newData.push('```js\n' + data.slice(pos) + '\n```');
    }
  }
  divideData(0);
  return newData;
}

// -----------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------

function setup (objects = {}) {
  Object.entries(objects).forEach(object => {
    global[object[0]] = object[1];
  });
  console.log(global);
}

function embadedMsg ({ channel = null, type = null, options = {} } = {}) {
  const message = options || {};
  channel = channel || global.channelManager.LOG_CHNL;
  switch (type) {
    case 'success':
      if (!message.title) message.title = 'SUCCESS 👍';
      message.color = 'GREEN';
      break;

    case 'error':
      message.title = message.title || '☠️ ERROR ☠️';
      message.color = 'RED';
      break;

    case 'notification':
      message.title = message.title || 'NOTIFICATION 🔔';
      message.color = 'YELLOW';
      break;

    default:
      message.title = message.title || 'GENERAL';
      message.color = 'BLUE';
      break;
  }

  const res = _formatData(message.description);
  message.description = res[0] || '';
  channel.send({ embeds: [message] });
  for (let i = 1; i < res.length; i++) {
    channel.send(res[i]);
  }
}

function normalMsg (channel, data) {
  _formatData(data).forEach(msg => channel.send(msg));
}

function messageHandler (message, bot) {
  if (!message.author.bot) {
    switch (message.content[0]) {
      case CUS_COM_PRE: {
        const [CMD, ...args] = message.content
          .substring(1)
          .trim()
          .split(/\s+/);
        if (CUS_CMDS.includes(CMD)) {
          switch (CMD) {
            case 'clear': {
              if (args[0] === 'all') {
                bot.channels.cache
                  .filter(channel => channel.type === 'GUILD_TEXT')
                  .forEach(channel => {
                    if (!global.channelManager.channelLocks[channel.id]) {
                      global.channelManager.channelLocks[channel.id] = true;
                      embadedMsg({ channel: message.channel, type: 'notification', options: { title: `Clear ${channel.name}` } });
                      console.log(`Clear ${channel.name}`);
                      channel.messages._fetchMany({}, true)
                        .then(async (messages) => {
                          for (const message of messages.values()) {
                            await message.delete();
                          }
                          return Promise.resolve();
                        })
                        .then(() => console.log(`Done Clearing ${channel.name}`))
                        .catch(e => embadedMsg({ channel: message.channel, type: 'error', options: { title: 'Something Went Wrong !! ☠️☠️', description: e } }))
                        .finally(() => {
                          global.channelManager.channelLocks[channel.id] = false;
                        });
                    } else {
                      embadedMsg({ channel: message.channel, type: 'notification', options: { title: `Clear already running for ${channel.name}` } });
                    }
                  });
              } else {
                if (!global.channelManager.channelLocks[message.channel.id]) {
                  global.channelManager.channelLocks[message.channel.id] = true;
                  console.log(`Clear ${message.channel.name}`);
                  message.channel.messages._fetchMany({}, true)
                    .then(async messages => {
                      for (const message of messages.values()) {
                        await message.delete();
                      }
                      return Promise.resolve();
                    }).then(r => console.log(`Done Clearing ${message.channel.name}`))
                    .catch(e => console.log(`Couldn't Clear ${message.channel.name} \n ${e}`))
                    .finally(() => {
                      global.channelManager.channelLocks[message.channel.id] = false;
                    });
                } else {
                  message.channel.send(`> Clear already running for ${message.channel.name}`);
                }
              }
              break;
            }
            default: {
              message.channel.messages._fetchMany({}, true)
                .then(messages => {
                  messages.forEach(message => message.delete());
                })
                .catch(e => console.log(e));
            }
          }
        }
        break;
      }
      case EVAL: {
        if (message.channel.id === global.channelManager.TEST_CHNL.id) {
          const CMD = message.content
            .substring(1)
            .trim();
          try {
            const result = (eval)(CMD);
            if (result instanceof Promise) {
              result.then(res => normalMsg(message.channel, res));
            } else {
              normalMsg(message.channel, result);
            }
          } catch (e) {
            embadedMsg({ channel: message.channel, type: 'error', options: { title: 'Something Went Wrong !! ☠️☠️', description: e } });
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
};

module.exports = { setup, messageHandler, normalMsg, embadedMsg };
