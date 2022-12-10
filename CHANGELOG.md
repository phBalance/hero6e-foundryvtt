## Version 1.0.0
- forked from https://github.com/jared-l-vine/hero6e-foundryvtt
- updated to work with Foundry 9.280
- added option to automatically track endurance
- added hit locations option
- added knockback option
- added powers and equipment items
- added manuever item

## Version 1.1.0
- Added Characteristics base values to character sheet, Editable only in 'Edit' mode on charater sheet
- Added End cost to power/equipment item sheets
- Added a field on attack items for custom additional effects, custom effect text will display the end of attack cards
- Bugfixes
    - characteristic rolls weren't updating after changing max end/body/stun
    - movement value wasn't updating properly in power/equipment sub items
    - couldn't update sub items from character sheet
    - couldn't update actor name
    - reading in vehicles added additional blank characteristic to character sheet
    - automated attacks fail without Hit Locations setting
    - upload .HDC fails when name is not present in .HDC file