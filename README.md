# Epsilon Reticuli B — Astronaut Directory

Angular22 migration of the existing Angular7 directory. Preserves50bundledastronauts, filter/chip controls, account menu and validated add-astronaut dialog.

## Run

```sh
nvm use
npm ci
npm start
```

Foreground http://127.0.0.1:4200; Ctrl+C to stop. Bundleddata/forms work offline. Original NASA/Wikimedia portrait URLs remain in the dataset; a bundledplaceholder is used while offline or when a portrait fails. No remote fonts required.

## Scope retained

Original search input is a display placeholder; selecting a filter changes its chip but does not filter cards. Add-astronaut Save logs values and closes the dialog; it does not persist or append records. Original Log out menu has no backend action. These existing demonstration behaviors remain; no backend/data persistence invented. Mobile sidebar is now a toggleable overlay so it does not squeeze the directory offscreen.

## Checks and versions

`npm run build`, `npm run typecheck`, `npm test -- --browsers=ChromeHeadless`, `npm audit`. Set CHROME_BIN for Chrome installed outside /Applications.

Angular/core/CLI/build22.2.0, Material/CDK22.2.1, RxJS7.8.2, Zone0.16.3, Node26.10.0. TS6.0.3 held by Angular>=6<6.1; Jasmine6.3/types6 held because Jasmine7 read-only globals fail with zone-testing0.16.3. Nativebuilder/ES2022/currentMaterialchips and standalonefalse/EagerZone preserve modulebehavior. UndeclaredLodash replaced by nativeSet/stringsort; sharedreplay reuses bundleddata. [Official Angular compatibility](https://angular.dev/reference/versions).

Build/types, fiveChromium tests and productionPlaywrightdesktop1280x800/mobile390x844 pass:50cards, filterchip/reset, accountmenu, dialogvalidation/save/cancel, offlineportraits, nohorizontaloverflow/pageerrors/externalrequests. Browserplugin absent; existingPlaywright/Chromium148 used. Source snapshotepsilon-before-angular22.tar.gz and screenshots outside repo in mission/Codex evidence folders. Initialbundle1.12MB exceeds1MBwarning but below2MBerror; optionaloptimization remains. Externalportrait availability/otherbrowsers not validated.
