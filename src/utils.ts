import glob from 'glob';
import { readFile, readFileSync, writeFile, writeFileSync } from 'fs';
import { resolve } from 'path';
export type Cb = (data: string, p: any) => string | void;

export const CONF = { 'encoding': 'utf-8' } as const;
export const loopFiles = (pattern: string, cb?: Cb) => {
  return new Promise<boolean>((resolve) => {
    glob(pattern, (e, files) => {
      files.forEach((p) => {
        readFile(p, CONF, (e, data) => {
          if(e) return;
          const res = cb(data, p);
          if (typeof res === 'string') {
            writeFile(p, res, (e) => {
              resolve(!e);
            });
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

export const cwd = (p: string) => resolve(process.cwd(), p);
export const relative = (p: string) => resolve(__dirname, p);