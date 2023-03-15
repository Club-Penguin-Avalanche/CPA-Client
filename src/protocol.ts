export const PROTOCOL = 'cpavalanche';
export const PROTOCOL_URL = PROTOCOL + '://';
export const DOMAIN = 'cpavalanche.net';
export const PLAY_URL = 'https://play.cpavalanche.net/';

const getCommandLineFromProcess = () => {
  return process.argv;
};

export const checkIfLoadedFromProtocol = () => {
  const commandLine = getCommandLineFromProcess();

  return commandLine.some((arg) => arg.startsWith(PROTOCOL_URL));
};

export const getUrlFromCommandLineProcess = () => {
  const commandLine = getCommandLineFromProcess();

  return getUrlFromCommandLine(commandLine);
};

export const getUrlFromCommandLine = (commandLine: string[]) => {
  const protocol = commandLine.find((arg) => arg.startsWith(PROTOCOL_URL));

  return replaceProtocolToDomain(protocol);
};

export const replaceProtocolToDomain = (protocol: string) => {
  if (protocol.includes(DOMAIN)) {
    return protocol.replace(PROTOCOL_URL, '');
  }

  return protocol.replace(PROTOCOL_URL, PLAY_URL);
};