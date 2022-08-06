const { embadedMsg } = require('./../messaging.js');

module.exports.init = async function (cmdManager) {
  const cmdData = Object.values(require('./data.json').commands);
  await cmdManager.set(cmdData);

  const commands = {};
  await cmdData.forEach(async command => {
    commands[command.name] = await require(`./${command.name}.js`);
  });
  console.log('Done Registering');
  embadedMsg({ type: 'success', options: { description: 'Done Registering Commands' } });
  return commands;
};
