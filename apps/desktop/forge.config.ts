import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { ForgeConfig } from '@electron-forge/shared-types';
import type { NotaryToolCredentials } from '@electron/notarize/lib/types';
import dotenv from 'dotenv';
import path from 'path';

import { MakerDebConfigOptions } from '@electron-forge/maker-deb/dist/Config';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

dotenv.config();

const IsDev = process.env.BUILD === 'false';

console.log('IsDev', IsDev);

const schemes = ['web3-desk'];

const devAndRpmOptions = {
    name: 'Web3Desk',
    productName: 'Web3Desk',
    genericName: 'Web3Desk',
    license: 'Apache-2.0',
    maintainer: 'Web3Desk Group',
    bin: 'Web3Desk', // bin name
    description: 'Your desktop web3 desk',
    homepage: 'https://web3or.site',
    icon: path.join(__dirname, 'public', 'icon.png'),
    mimeType: schemes.map(schema => `x-scheme-handler/${schema}`)

};

const config: ForgeConfig = {
    packagerConfig: {
        download: {
            mirrorOptions: !process.env.APPLE_API_KEY
                ? {
                      mirror: ''
                  }
                : undefined
        },
        asar: true,
        icon: path.join(__dirname, 'public', 'icon'),
        name: 'Web3Desk',
        executableName: 'Web3Desk',
        protocols: [
            {
                name: 'Web3Desk Protocol',
                schemes: schemes
            }
        ],
        appBundleId: IsDev ? 'com.web3.desk.dev.demo' : 'com.web3.desk',
        ...(process.env.APPLE_API_KEY
            ? {
                  osxSign: {
                      optionsForFile: (optionsForFile: string) => {
                          return {
                              entitlements: 'entitlements.plist'
                          };
                      }
                  },
                  osxNotarize: {
                      appleApiKey: process.env.APPLE_API_KEY,
                      appleApiKeyId: process.env.APPLE_API_KEY_ID,
                      appleApiIssuer: process.env.APPLE_API_ISSUER
                  } as NotaryToolCredentials
              }
            : {}),
        extraResource: ['./public']
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel(
            {
                name: 'Web3Desk',
                authors: 'Web3Desk Group',
                description: 'Your desktop web3 desk',
                iconUrl: 'https://tonkeeper.com/assets/icon.ico',
                setupIcon: path.join(process.cwd(), 'public', 'icon.ico'),
                loadingGif: path.join(process.cwd(), 'public', 'install.gif'),
                remoteReleases: 'https://github.com/TonStockFi/web3-desk'
            },
            ['win32']
        ),
        new MakerZIP({}, ['darwin', 'linux', 'win32']),
        new MakerDMG(
            arch => ({
                background: path.join(process.cwd(), 'public', 'dmg-bg.png'),
                icon: path.join(process.cwd(), 'public', 'icon.icns'),
                format: 'ULFO',
                additionalDMGOptions: { window: { size: { width: 600, height: 372 } } },
                contents: [
                    {
                        x: 200,
                        y: 170,
                        type: 'file',
                        path: `${process.cwd()}/out/Web3Desk-darwin-${arch}/Web3Desk.app`
                    },
                    { x: 400, y: 170, type: 'link', path: '/Applications' }
                ]
            }),
            ['darwin']
        ),
        new MakerRpm(
            {
                options: devAndRpmOptions
            },
            ['linux']
        ),
        new MakerDeb(
            {
                options: { ...devAndRpmOptions, compression: 'xz' } as MakerDebConfigOptions
            },
            ['linux']
        )
    ],
    plugins: [
        new AutoUnpackNativesPlugin({}),
        new WebpackPlugin({
            mainConfig,
            devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.ts',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts'
                        }
                    }
                ]
            }
        })
    ]
};

export default config;
