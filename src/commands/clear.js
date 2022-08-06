const { embadedMsg } = require('./../messaging.js');

const setup = function (objects = {}) {
  Object.entries(objects).forEach(object => {
    global[object[0]] = object[1];
  });
};

const execute = async function (bot, options) {
  return new Promise((resolve, reject) => {
    const channel = options.getChannel('channel');
    if (channel) {
      if (!global.channelManager.channelLocks[channel.id]) {
        channel.bulkDelete(50, false)
          .then(res => {
            console.log(`Done Clearing ${channel.name}`);
            resolve({ description: `Done Clearing \`${channel.name}\`` });
          })
          .catch(error => {
            console.log(`Couldn't Clear ${channel.name} \n ${error}`);
            const res = { error, title: `Couldn't Clear \`${channel.name}\`` };
            reject(res);
          })
          .finally(() => {
            global.channelManager.channelLocks[channel.id] = false;
          });
      } else {
        embadedMsg({ channel, type: 'notification', options: { title: `Clear already running for ${channel.name}` } });
      }
    } else {
      const promises = bot.channels.cache
        .filter(channel => channel.type === 'GUILD_TEXT')
        .map(channel => {
          if (!global.channelManager.channelLocks[channel.id]) {
            const prom = channel.bulkDelete(50, false);
            prom.then(res => {
              console.log(`Done Clearing ${channel.name}`);
            }).catch(error => {
              console.log(`Couldn't Clear ${channel.name} \n ${error}`);
            }).finally(() => {
              global.channelManager.channelLocks[channel.id] = false;
            });
            return prom;
          } else {
            embadedMsg({ channel, type: 'notification', options: { title: `Clear already running for ${channel.name}` } });
            return Promise.resolve();
          }
        });

      Promise.all(promises)
        .then(res => resolve({ description: 'Done Clearing All the channels' }))
        .catch(error => {
          const res = { error, title: 'Couldn\'t Clear All channels' };
          reject(res);
        });
    }
  });
};

module.exports = { setup, execute };
