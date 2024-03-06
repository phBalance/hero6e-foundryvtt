Discord example of how to unpack/pack compendiums: https://discord.com/channels/732325252788387980/734755256524865557/1195023034877218927
FVTT command line tool: https://github.com/foundryvtt/foundryvtt-cli

```js
fvtt configure view
Current Configuration: {
  installPath: 'C:\\Program Files\\Foundry Virtual Tabletop',
  dataPath: 'C:/Users/aaron/AppData/Local/FoundryVTT-dev',
  currentPackageId: 'hero6efoundryvttv2',
  currentPackageType: 'System'
}
```

Unpack existing compendium.  Creates a /packs/heroMacros/_source folder with a json entry per macro.
`fvtt package unpack -c "heroMacros"`

Packing the compendium should be done in two places.
1. `npm run build` should pack the macros.  Probably can't use GULP because foundryvtt-cli refuses to work with open compendiums.
2. /.github/workflows/release.yml should include pack macro commands.
`fvtt package pack "heroMacros"`
