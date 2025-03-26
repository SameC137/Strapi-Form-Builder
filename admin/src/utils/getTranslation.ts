import  pluginId  from '../pluginId';

const getTranslation = (id: string) => `${pluginId}.${id}`;

export { getTranslation };


type TradOptions = Record<string, string>;

export const prefixPluginTranslations = (
  trad: TradOptions,
  pluginId: string
): TradOptions => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce((acc, current) => {
    acc[`${pluginId}.${current}`] = trad[current];
    return acc;
  }, {} as TradOptions);
};
