import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { fileURLToPath } from 'node:url';
import { env } from 'process';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createRequire } from 'node:module';

// Installs the ts.factory shims ts-nameof 5.0 needs on TypeScript 6, then hands back
// the transformer factory. Must be loaded before ts-loader compiles anything.
//
// Lives in the library because the library's sources are what require it - any app
// that bundles @antimatterjs/react needs the same transformer registered.
const tsNameof = createRequire(import.meta.url)(
    '@antimatterjs/react/ts-nameof-transformer.cjs');


const projectDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(projectDir, '../../..');

/* ------------------------------------------------------------------ *
 * HTTPS dev certificate (same scheme the Vite config used).
 * ------------------------------------------------------------------ */
const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = 'reactfun2026-07.client';
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs', 'https', '--export-path', certFilePath,
        '--format', 'Pem', '--no-password',
    ], { stdio: 'inherit' }).status) {
        throw new Error('Could not create certificate.');
    }
}

/*
 * One ts-loader configuration per tsconfig. Each rule gets its own named `instance`
 * so ts-loader keeps a separate TypeScript program per config rather than merging
 * them.
 *
 * Only the options that MUST be overridden are set here - everything else comes from
 * the tsconfig the caller passes in:
 *   noEmit / allowImportingTsExtensions - the tsconfigs are type-check-only configs;
 *       webpack needs emit, and allowImportingTsExtensions is illegal alongside it.
 *       webpack resolves the explicit .tsx specifiers itself.
 *   sourceMap - without it ts-loader emits no map, webpack treats ts-loader's OUTPUT
 *       as the original source, and every breakpoint lands on the wrong line.
 *   composite - the sources are outside their tsconfig's "include".
 */
const tsLoader = (configFile, instance) => ({
    loader: 'ts-loader',
    options: {
        configFile,
        instance,
        transpileOnly: true,
        onlyCompileBundledFiles: true,
        compilerOptions: {
            noEmit: false,
            allowImportingTsExtensions: false,
            sourceMap: true,
            // The tsconfigs are set up for `tsc -b`, which emits declarations only.
            // webpack needs the opposite: real JS, no declarations, no project
            // references. All three must be cleared together - emitDeclarationOnly is
            // illegal without declaration or composite.
            composite: false,
            declaration: false,
            declarationMap: false,
            emitDeclarationOnly: false,
        },
        getCustomTransformers: () => ({ before: [tsNameof] }),
    },
});

export default (_wenv, argv) => {
    const isDev = argv.mode !== 'production';

    return {
        mode: isDev ? 'development' : 'production',
        context: projectDir,
        entry: './src/main.tsx',

        // "source-map" (not an eval variant) so the browser receives a real source
        // map that a debugger can read.
        devtool: isDev ? 'source-map' : false,

        output: {
            path: path.resolve(projectDir, 'dist'),
            filename: isDev ? '[name].js' : '[name].[contenthash].js',
            publicPath: '/',

            // THE line that makes Visual Studio breakpoints bind.
            //
            // js-debug ships a DEFAULT source map path override:
            //     "webpack:///([a-z]):/(.+)"  ->  "$1:/$2"
            // Emitting sources as webpack:///D:/full/path/File.tsx means every source
            // resolves straight to an absolute file on disk, with no webRoot,
            // pathMapping or sourceMapPathOverrides required. That is why breakpoints
            // worked under webpack before and never did under Vite, whose sources are
            // bare filenames that need an anchor the ASP.NET debugger cannot supply.
            //
            // It also makes the folder split irrelevant: this project and the shared
            // libraries both emit absolute paths, so both bind the same way.
            devtoolModuleFilenameTemplate: info =>
                'webpack:///' + info.absoluteResourcePath.replace(/\\/g, '/'),
            devtoolFallbackModuleFilenameTemplate: info =>
                'webpack:///' + info.absoluteResourcePath.replace(/\\/g, '/'),
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs'],
            // Resolve symlinked workspace packages to their real paths, so the shared
            // libraries compile from D:\...\Antimatter\React\src\* - the same paths
            // the editor has open, which is what lets their breakpoints bind.
            symlinks: true,
            alias: {
                '@': path.resolve(projectDir, 'src'),
            },
            // Node builtins have no browser equivalent. Kept as a safety net: a stray
            // editor auto-import of one of these (it has happened - `dns` in
            // BindingExpression.tsx) resolves to an empty module instead of failing
            // the whole build. Vite silently elided such imports; webpack does not.
            fallback: {
                dns: false,
                fs: false,
                net: false,
                tls: false,
                path: false,
                crypto: false,
            },
        },

        module: {
            rules: [
                // This project's own sources - compiled under its tsconfig.
                {
                    test: /\.[cm]?[jt]sx?$/,
                    include: [path.resolve(projectDir, 'src')],
                    use: [tsLoader(
                        path.resolve(projectDir, 'tsconfig.app.json'), 'app')],
                },
                // The shared libraries - compiled under THEIR OWN tsconfig, so their
                // settings (experimentalDecorators, verbatimModuleSyntax: false,
                // noImplicitAny: false, ...) apply to their code instead of this
                // project's stricter ones being forced onto them.
                {
                    test: /\.[cm]?[jt]sx?$/,
                    include: [path.resolve(monorepoRoot, '@antimatterjs')],
                    use: [tsLoader(
                        path.resolve(monorepoRoot, '@antimatterjs/react/tsconfig.json'),
                        'libraries')],
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(svg|png|jpe?g|gif|webp|woff2?)$/i,
                    type: 'asset/resource',
                },
            ],
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(projectDir, 'index.html'),
                inject: 'body',
            }),
        ],

        devServer: {
            port: parseInt(env.DEV_SERVER_PORT || '44317'),
            server: {
                type: 'https',
                options: {
                    key: fs.readFileSync(keyFilePath),
                    cert: fs.readFileSync(certFilePath),
                },
            },
            // ASP.NET Core proxies INTO this server (UseSpa /
            // UseProxyToSpaDevelopmentServer), so it must accept those forwarded
            // requests and must NOT proxy anything back out - that would loop.
            allowedHosts: 'all',
            historyApiFallback: true,
            static: {
                directory: path.resolve(projectDir, 'public'),
                publicPath: '/',
            },
            hot: true,
            client: { overlay: true },
            headers: {
                'Access-Control-Allow-Origin': '*',
                // index.html and the bundles must never be cached in dev; a stale
                // index.html is what leaves the browser requesting _framework
                // fingerprints from a previous build.
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        },

        // The shared libraries live outside this project; watch them too.
        watchOptions: {
            ignored: /node_modules[\\/](?!@antimatterjs)/,
        },

        infrastructureLogging: { level: 'warn' },
        stats: 'minimal',

        snapshot: {
            managedPaths: [path.resolve(monorepoRoot, 'node_modules')],
        },
    };
};
