import glob from 'glob';
import { readFile, readFileSync, writeFile, writeFileSync } from 'fs';
import path from 'path';
export type Cb = (data: string, p: any) => string | void;

export const CONF = { 'encoding': 'utf-8' } as const;
export const loopFiles = (pattern: string, cb?: Cb) => {
  return new Promise<boolean>((rawR) => {
    glob(pattern, (e, files) => {
      if(e) return rawR(false);
      let count = 0;
      const max = files.length;
      const resolve = (x: boolean) => {
        count++;
        if(count === max) {
          rawR(x);
        }
      }
      files.forEach((p) => {
        readFile(p, CONF, (e, data) => {
          if(e) return resolve(false);
          const res = cb(data, p);
          if (typeof res === 'string') {
            writeFile(p, res, (e) => {
              resolve(!e);
            });
          } else {
            resolve(true);
          }
        })
      })
    });
  })
};

/** path */
export function readJsonSync(path: string) {
  const res = JSON.parse(readFileSync(path, CONF));
  return res;
}

export function writeJsonSync(path: string, data: any) {
  /** 标准两空格缩进 */
  writeFileSync(path, JSON.stringify(data, null, '  '));
}

export function changeJsonSync(path: string, handle: (dt: any) => any) {
  const res = readJsonSync(path);
  const data = handle(res);
  writeJsonSync(path, data);
}

export const cwd = (p: string) => path.resolve(process.cwd(), p);
export const relative = (p: string) => path.resolve(__dirname, p);