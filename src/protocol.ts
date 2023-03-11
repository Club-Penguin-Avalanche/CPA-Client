const getCommandLineFromProcess = () => {
  return process.argv;
};

export const checkIfLoadedFromProtocol = () => {
  const commandLine = getCommandLineFromProcess();

  return commandLine.some((arg) => arg.startsWith('cpavalanche://'));
};

export const getUrlFromCommandLineProcess = () => {
  const commandLine = getCommandLineFromProcess();

  return getUrlFromCommandLine(commandLine);
};

export const getUrlFromCommandLine = (commandLine: string[]) => {
  const protocol = commandLine.find((arg) => arg.startsWith('cpavalanche://'));

  return protocol.replace('cpavalanche://', 'http://play.cpavalanche.net/');
};