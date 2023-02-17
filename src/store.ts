import ElectronStore from 'electron-store';

export type PublicSchema = {
  url: string;
  
}

export const defaultPublicValues: PublicSchema = {
  url: 'https://play.newcp.net/',
};

const createPublicStore = () => {
  const publicStore = new ElectronStore<PublicSchema>({
    name: 'preferences',
    defaults: defaultPublicValues,  
  });

  return publicStore;
};

export default createPublicStore;