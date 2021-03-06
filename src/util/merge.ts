import webpackMerge from 'webpack-merge';
//import { isAbsolute, resolve } from 'path';
import {
  WebpackOptions,
  Entry,
  //OutputOptions,
} from 'webpack/declarations/WebpackOptions';

//import { isString, isObject, isArray } from './type';

export interface Options extends WebpackOptions {
  entry: Entry & {
    app: string[];
  };
}

function merge(defaultConfig: Options, otherConfig: WebpackOptions) {
  //const cwdPath = process.cwd();
  const config: Options = webpackMerge(defaultConfig, otherConfig);
  //const { entry, output } = config;

  // if (isString(entry) && !isAbsolute(entry as string)) {
  //   config.entry = resolve(cwdPath, entry as string);
  // }

  // if (typeof entry === 'object') {
  //   Object.keys(entry).forEach(key => {
  //     if(isArray(entry[key])){

  //     }
  //     if (!isAbsolute((entry)[key])) {
  //       (config.entry as Object)[key] = resolve(
  //         cwdPath,
  //         entry[key]
  //       );
  //     }
  //   });
  // }

  // if (output && isObject(output)) {
  //   if (output.path && !isAbsolute(output.path)) {
  //     (config.output as OutputOptions).path = resolve(cwdPath, output.path);
  //   }
  // }

  return config;
}

export default merge;
