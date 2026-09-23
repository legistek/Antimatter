import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';
import tsNameof from 'vite-plugin-ts-nameof';
const baseFolder = env.APPDATA !== undefined && env.APPDATA !== ''
    ? `${env.APPDATA}/ASP.NET/https`
    : `${env.HOME}/.aspnet/https`;
const certificateName = "reactfun2026-07.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);
if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}
if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', }).status) {
        throw new Error("Could not create certificate.");
    }
}
const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7013';
// Vite's root is the monorepo source folder, NOT this project.
//
// The workspace libraries (@antimatterjs/*) are symlinked, so Vite resolves them to
// their real paths. If the root were this project, those paths would fall outside it
// and Vite would serve them as /@fs/<absolute path>, which no debugger can map back
// to disk without custom rules. Rooting at the common ancestor keeps every source
// file - this project's and the libraries' - under one plain URL space:
//
//   /Test/antimatter.test.client/src/App.tsx
//   /Antimatter/React/src/Binding.tsx
//
// A single webRoot then resolves both, which is what lets Visual Studio's ASP.NET
// JavaScript debugging bind TS/TSX breakpoints in the same browser that the .NET
// debugger launches for Blazor WASM.
const monorepoRoot = fileURLToPath(new URL('../../', import.meta.url));
const projectPath = 'Test/antimatter.test.client';
// Serves this project's index.html at "/" even though it no longer sits at the root.
const spaEntry = {
    name: 'spa-entry',
    configureServer(server) {
        server.middlewares.use((req, _res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
                req.url = `/${projectPath}/index.html`;
            }
            next();
        });
    }
};
// Vite's dev source maps list "sources" as bare filenames with no sourceRoot, so a
// debugger can only locate them by anchoring against something else - a webRoot or
// pathMapping. Visual Studio's ASP.NET JavaScript debugging exposes neither, so it
// resolves them to relative paths and never ties them back to the files on disk:
// breakpoints bind in its own "Script Documents" copy but not in the project source.
//
// Stamping each map with an absolute sourceRoot makes the entries self-locating, so
// no debugger-side mapping is required at all.
const SOURCEMAP_PREFIX = 'sourceMappingURL=data:application/json;base64,';
const absoluteSourceRoots = {
    name: 'absolute-source-roots',
    apply: 'serve',
    configureServer(server) {
        // Rewrites the inline source map on the way out. Patching
        // server.transformRequest does NOT work - Vite's transform middleware does
        // not call that method, so the change never reaches the served bytes.
        server.middlewares.use((req, res, next) => {
            const url = (req.url || '').split('?')[0];
            if (!url.startsWith('/') || url.startsWith('/@') ||
                !/\.(tsx?|jsx?|mts|cts)$/.test(url)) {
                return next();
            }
            const absolute = path.join(monorepoRoot, url);
            const chunks = [];
            const write = res.write.bind(res);
            const end = res.end.bind(res);
            res.write = (chunk, ...rest) => {
                if (chunk)
                    chunks.push(Buffer.from(chunk));
                return true;
            };
            res.end = (chunk, ...rest) => {
                if (chunk && typeof chunk !== 'function')
                    chunks.push(Buffer.from(chunk));
                let body = Buffer.concat(chunks).toString('utf8');
                const at = body.lastIndexOf(SOURCEMAP_PREFIX);
                if (at !== -1) {
                    const encoded = body.slice(at + SOURCEMAP_PREFIX.length).trim();
                    try {
                        const map = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
                        // Rewrite each source to webpack:///<drive>:/<abs path>.
                        // js-debug ships a DEFAULT source map path override,
                        //     "webpack:///([a-z]):/(.+)" -> "$1:/$2"
                        // which turns that straight into an absolute local path with
                        // no webRoot involved. Webpack got this for free; Vite has no
                        // such default, which is why breakpoints bound under the old
                        // setup and not this one.
                        map.sources = (map.sources || []).map((s) => {
                            if (!s || s.startsWith('webpack://'))
                                return s;
                            const abs = path.isAbsolute(s)
                                ? s
                                : path.join(path.dirname(absolute), s);
                            return 'webpack:///' + abs.replace(/\\/g, '/');
                        });
                        delete map.sourceRoot;
                        body = body.slice(0, at + SOURCEMAP_PREFIX.length) +
                            Buffer.from(JSON.stringify(map)).toString('base64');
                    }
                    catch { /* leave the response untouched */ }
                }
                res.write = write;
                res.end = end;
                res.setHeader('Content-Length', Buffer.byteLength(body));
                return end(body);
            };
            next();
        });
    }
};
// https://vitejs.dev/config/
export default defineConfig({
    root: monorepoRoot,
    publicDir: fileURLToPath(new URL('./public', import.meta.url)),
    plugins: [spaEntry, absoluteSourceRoots, plugin(), tsNameof()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: fileURLToPath(new URL('./dist', import.meta.url)),
        emptyOutDir: true,
        rollupOptions: {
            input: fileURLToPath(new URL('./index.html', import.meta.url))
        }
    },
    server: {
        // No proxies here. ASP.NET Core is the origin the browser talks to, and it
        // proxies SPA requests INTO this dev server (UseSpa /
        // UseProxyToSpaDevelopmentServer). Proxying /weatherforecast or /_framework
        // back out to ASP.NET would form a request loop between the two servers and
        // exhaust the socket pool.
        port: parseInt(env.DEV_SERVER_PORT || '44317'),
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    }
});
