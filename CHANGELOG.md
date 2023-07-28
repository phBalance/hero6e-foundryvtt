# Version 3.0.12
- Active Powers consume END at beginning of phase. [#77](https://github.com/dmdorman/hero6e-foundryvtt/issues/77)
- Range Penalty applies when targeting tokens. Tweaked Set/Brace. 5e range penalties are now based on 1".  [#100](https://github.com/dmdorman/hero6e-foundryvtt/issues/100).

# Version 3.0.11
- Drag Ruler units now match grid units of the scene. [#225](https://github.com/dmdorman/hero6e-foundryvtt/issues/225)
- Initial TRANSFER (5e) support. [#133](https://github.com/dmdorman/hero6e-foundryvtt/issues/133)
- POWER DEFENSE works vs DRAIN/TRANSFER.
- DELAYED RETURN RATE works vs AID/DRAIN/TRANSFER.
- Initial REQUIRES A ROLL support.  [#53](https://github.com/dmdorman/hero6e-foundryvtt/issues/53) [#49](https://github.com/dmdorman/hero6e-foundryvtt/issues/49)
- Initial ENDURANCE RESERVE support. [#54](https://github.com/dmdorman/hero6e-foundryvtt/issues/54)


# Version 3.0.10
- Temporary changes to CHARACTERISTIC MAX have red/green backgrounds on character sheet, similar to how VALUE background turns red/green.
- Combat tracker now advances time.  Confirmed compatibility with Simple Calendar when GameWorldTimeIntegrations=Mixed. [#213](https://github.com/dmdorman/hero6e-foundryvtt/issues/213)
- Improved AID and DRAIN support. [#185](https://github.com/dmdorman/hero6e-foundryvtt/issues/185)

# Version 3.0.9
- Initial support for Charges [#191](https://github.com/dmdorman/hero6e-foundryvtt/issues/191) [#47](https://github.com/dmdorman/hero6e-foundryvtt/issues/47)
- Fixed adding skills with NaN- rolls. [#195](https://github.com/dmdorman/hero6e-foundryvtt/issues/195)
- Partial Find Weakness (5e) support.  Shows as a skill roll.  [#208](https://github.com/dmdorman/hero6e-foundryvtt/issues/208)
- Stunned tokens are prevented from attacking.  Stunned effect is removed and end of phase instead of start of phase. [#204](https://github.com/dmdorman/hero6e-foundryvtt/issues/204)
- Fixed "undefined id [] does not exist in the EmbeddedCollection collection" [#185](https://github.com/dmdorman/hero6e-foundryvtt/issues/185) [#211](https://github.com/dmdorman/hero6e-foundryvtt/issues/211)
- Fixed dragging Attack powers to hotbar [#200](https://github.com/dmdorman/hero6e-foundryvtt/issues/200)
- Fixed Post-Segment 12 errors. [#217](https://github.com/dmdorman/hero6e-foundryvtt/issues/217)
- STUN and BODY changes show in chat when manually changed. [#209](https://github.com/dmdorman/hero6e-foundryvtt/issues/209)
- Combat Tracker header shows Segment number [#198](https://github.com/dmdorman/hero6e-foundryvtt/issues/198)
- Macro Compendium with a Create Attack from JSON macro [#201](https://github.com/dmdorman/hero6e-foundryvtt/issues/201)

# Version 3.0.8
- Take a Recovery now also removes the Stunned condition.
- When characteristics are locked (due to Active Effects) they are now readonly and a tooltip shows what is preventing editing.
- PD/ED bought as power with resistant modifier and ADD_MODIFIERS_TO_BASE is checked is now supported. [#182](https://github.com/dmdorman/hero6e-foundryvtt/issues/182)
- Improved Invisibility power description. [#183](https://github.com/dmdorman/hero6e-foundryvtt/issues/183)
- Fixed Knockback calculations [#188](https://github.com/dmdorman/hero6e-foundryvtt/issues/188)
- Fixed Martial Killing attack uploads. [#187](https://github.com/dmdorman/hero6e-foundryvtt/issues/187)
- Damage tags show Damage Classes (DC) [#139](https://github.com/dmdorman/hero6e-foundryvtt/issues/139) [#119](https://github.com/dmdorman/hero6e-foundryvtt/issues/119)


# Version 3.0.7
- Initial Mental Combat Skill Levels (MCSL) support. [#166](https://github.com/dmdorman/hero6e-foundryvtt/issues/166)
- Fixed issue with large worlds failing to load.
- Minor bug fixes for attacks created with "add attack" instead of via HDC upload.
- Knocked Out when 0 STUN.


# Version 3.0.6
- Fixed issue when deleting combatant in Combat Tracker before combatant begins.
- At Post-Segment-12 all active combatants Take a Recovery.
- Stun status is cleared at the beginning of phase.
- Initial Combat Skill Levels (CSL) support.  OCV is added to attacks.  Simple +1DC. DCV (like all DCV modifiers) is shown but not currently implemented. [#166](https://github.com/dmdorman/hero6e-foundryvtt/issues/166)

# Version 3.0.5
- Initial DRAIN support.
- Changing PC/NPC actor type moved to sheet header.  Also can be changed in the context menu of the actor sidebar. Fixes [#170](https://github.com/dmdorman/hero6e-foundryvtt/issues/170).
- Combat Tracker Improvments. Reworked underlying code so that _onEndRound and _onStartTurn are called as expected.  This should lead to future automation improvments.  For example Post-Segment-12 activities and Endurance use at the beginning of turn for continuous powers. Also changed tooltips for PREV/NEXT to align with Hero terminology. [#175](https://github.com/dmdorman/hero6e-foundryvtt/issues/175)
- Minor improvements to framework support.
- Fixed issue where Reduced Endurance was not included in END calculations. [#132](https://github.com/dmdorman/hero6e-foundryvtt/issues/132)

# Version 3.0.4
- Reworked Active Effects such that the effects on items remain with items.  They are no longered
transferred from the item to the actor.  This is following [FoundryVtt v11 ActiveEffect Transferral](https://foundryvtt.com/article/v11-active-effects/) recommendations.
- Fixed Custom martial attacks, they now show on attack tab.  Also fixed the Set & Brace martial manuevers.
- Fixed a bug where an attack using charges would set END=0.
- Fixed a bug where some auto created attacks were missing half die.
- Initial AID support.  Adjustment powers do not automatically fade yet.  One step closer to DRAIN/TRANSFER [#133](https://github.com/dmdorman/hero6e-foundryvtt/issues/133)

# Version 3.0.3
- FoundryVTT 304 verified compatibility.
- Fixed combat tracker reference to LEVELS.value. [#167](https://github.com/dmdorman/hero6e-foundryvtt/issues/167)

# Version 3.0.1-alpha
- Mental Blast Improvements [#157](https://github.com/dmdorman/hero6e-foundryvtt/issues/157)
- System version added to Actor and Item sheets [#158](https://github.com/dmdorman/hero6e-foundryvtt/issues/158)
- Fixed glitchy power toggles [#162](https://github.com/dmdorman/hero6e-foundryvtt/issues/162)
- Fixed PD/ED bought as resistant, showing as non-resistant. [#163](https://github.com/dmdorman/hero6e-foundryvtt/issues/163)

# Version 3.0.0-alpha
- FoundryVTT version 11 (v10 no longer supported)
- Knockback fixes
- Attack OcvMod [#137](https://github.com/dmdorman/hero6e-foundryvtt/issues/137)
- Attack powers are used directly.  No longer need to have separate attack items.
- All attack powers are shown in Attack tab, even those not fully implemented.  A small step toward implementing additional attack types and charges.
aracter sheet can filter on some items. [#90](https://github.com/dmdorman/hero6e-foundryvtt/issues/90)

# Version 2.2.0-alpha
- Defensive powers are used directly.  No longer need to have separate defense items splitting out PD/ED/etc.
- Reworked ActiveEffects to be placed on items (per FoundryVtt design).
- Apply damage only shown to GMs [#95](https://github.com/dmdorman/hero6e-foundryvtt/issues/95)
- Power/item descriptions can be sent to chat [#128](https://github.com/dmdorman/hero6e-foundryvtt/issues/128)
- Initial power framework support.
- Improved 5e support (COM, DAMAGERESISTANCE, FORCEFIELD).
- All movements collapsed to characteritics tab.  Movement powers are now toggles [#88](https://github.com/dmdorman/hero6e-foundryvtt/issues/128).
- Most powers can be toggled [#38](https://github.com/dmdorman/hero6e-foundryvtt/issues/38).  The remaining powers that do not have toggles (but should) are not fully implemented in the system.  As support for those powers is added, so will the toggle.
- Fixed issue where killing attacks were not applying hit location multipliers. [#136](https://github.com/dmdorman/hero6e-foundryvtt/issues/136)

# Version 2.1.9-alpha
- Fixed equipment price showing NaN.  Summary weight/price for equipment now only shows when there are items with weight/price.
- Fixed [Drag Ruler](https://foundryvtt.com/packages/drag-ruler) module errors when Drag Ruler not installed.  Drag Ruler is recommended, but not required.
- Active Effects on actors are editable. A minor step toward enhancing Active Effects and associated temporary bonuses and penalties. [#126](https://github.com/dmdorman/hero6e-foundryvtt/issues/126) [#118](https://github.com/dmdorman/hero6e-foundryvtt/issues/118) [#103](https://github.com/dmdorman/hero6e-foundryvtt/issues/103)

# Version 2.1.8-alpha
- Improved power descriptions. [#78](https://github.com/dmdorman/hero6e-foundryvtt/issues/78)
- Improved Estimation of Character Points spent and Active Points. [#111](https://github.com/dmdorman/hero6e-foundryvtt/issues/111)
- Powers now show endurance. [#116](https://github.com/dmdorman/hero6e-foundryvtt/issues/116)
- Removed old HeroSystem6eActorSheet
- Improved support for [Drag Ruler](https://foundryvtt.com/packages/drag-ruler) module. Can select movement modes.[#99](https://github.com/dmdorman/hero6e-foundryvtt/issues/99)
- Body/Stun/End on character sheet sidebar are now editable.
- Equipment price and weight. Deferring encumbrance penalties for a future release. [#118](https://github.com/dmdorman/hero6e-foundryvtt/issues/118)


# Version 2.1.7-alpha
- Improved custom maneuver support. [#91](https://github.com/dmdorman/hero6e-foundryvtt/issues/91)
- Estimation of Character Points spent and Active Points.  Still pretty rough. [#111](https://github.com/dmdorman/hero6e-foundryvtt/issues/111)
- Improved power descriptions. [#78](https://github.com/dmdorman/hero6e-foundryvtt/issues/78)
- Fix for Attacks missing AP/PEN edit boxes. [#113](https://github.com/dmdorman/hero6e-foundryvtt/issues/113)
- Attacks and Defenses created from equipment. [#114](https://github.com/dmdorman/hero6e-foundryvtt/issues/114)
- Improved 5e support:
  - Added Comeliness (COM) characteristic.  
  - Fixed OCV/DCV/STUN figured characteristics. [#104](https://github.com/dmdorman/hero6e-foundryvtt/issues/104) 
  - Fixed characteristic costs. 
  - Lack of Weakness as a defense (no automation). [#106](https://github.com/dmdorman/hero6e-foundryvtt/issues/106)
  - Added support for the Armor (Resistant Protection) and Growth powers. [#108](https://github.com/dmdorman/hero6e-foundryvtt/issues/108)
 

# Version 2.1.6-alpha
- Added 3rd attribute bar. Expectation is to show body, stun, and endurance for most tokens.  [#75](https://github.com/dmdorman/hero6e-foundryvtt/issues/75)
- New default character sheet.
- Added Perception as a skill [#97](https://github.com/dmdorman/hero6e-foundryvtt/issues/97)
- Skill rolls dynamically change with characteristic changes.
- Improved damage dice and END estimation listed on sheet to account for strength. [#83](https://github.com/dmdorman/hero6e-foundryvtt/issues/83)
- Fixed mislabeled rED and added MD defense summary to left panel of character sheet [#86](https://github.com/dmdorman/hero6e-foundryvtt/issues/86)
- Removed flight from characteristics. [#87](https://github.com/dmdorman/hero6e-foundryvtt/issues/87)
- STR shows lift and throw notes [#51](https://github.com/dmdorman/hero6e-foundryvtt/issues/51)
- Attack edit sheet relaced "Value" with "Damage Dice" [#94](https://github.com/dmdorman/hero6e-foundryvtt/issues/94)
- Changed "Default Attack Card Automation" from "No Automation" to "PCs and NPCs (end, stun, body)"
- "Take a recovery" chat card now shows End/Stun details on chat card. [#96](https://github.com/dmdorman/hero6e-foundryvtt/issues/96)
- "Combat Luck" added to defenses. [#85](https://github.com/dmdorman/hero6e-foundryvtt/issues/85)
- Attacks with Alternate Combat Values are auto created property. [#93](https://github.com/dmdorman/hero6e-foundryvtt/issues/93)
- Attacks will use selected targets, show hit/miss, and hit targets will follow thru to damage cards. [#79](https://github.com/dmdorman/hero6e-foundryvtt/issues/79) [#92](https://github.com/dmdorman/hero6e-foundryvtt/issues/92)

# Version 2.1.5-alpha
- 5th edition characters get figured characteristics and 5E stun multiplier on killing attacks.
- A second (improved) character sheet is available to preview.
- DragDrop to hotbar for attacks, skills and power toggles (like defenses)

# Version 2.1.4-alpha
- NOKB, DOUBLEKB, and KBRESISTANCE
- Penetrating, Armor Piercing, Hardened
- Body and Stun only

# Version2.1.3-alpha
- Adding distinction between PC and NPC actors
- Automation updates (end, body, stun)
- Adding area of effect attribute for attacks

# Version 2.1.2-alpha
- Attack card automation rework

# Version 2.1.1-alpha
- Maneuver fix [#39](https://github.com/dmdorman/hero6e-foundryvtt/issues/39)

# Version 2.1.0-alpha
- power item rework
- Known Issues:
    - Maneuvers items are applying OCV/DCV modifications
    - Defense items toggles are not working
    - Can't edit/delete Power sub items directly from actor sheet
    - Updating and item on an unlinked actor sheet updates the base actor and not the actor in the scene

# Version 2.0.4-alpha
- fixed an issue with the combat tracker not working
- fixed an issue with the Upload .HDC button that caused it to fail
- Upload .HDC now reads in perks, talents, complications, and martial arts
- additional V10 migration

# Version 2.0-alpha
- V10 migration
- changed characteristic keys so that other characteristics can work with Barbrawl
- Known Issues:
    - can't edit power/equipment 'sub-items' from character sheet (to add powers to a character sheet use the item tab
        to create and edit the power there then drag the item onto a character sheet)

# Version 1.1.2
- Bugfixes
    - movement powers were showing the wrong type
    - couldn't update sub item descriptions
    - recovery button didn't produce chat message
    - attack card automation wouldn't work with power sub items
    - attack card automation wouldn't work with attacks that used strength or knockback
    - imitative tracking wasn't working
- Added a dice button for attack roll actions
- Now prioritizing player characters in initiative tracking
- Known Issues
    - clicking 'Apply to Target' with an attack card generated from a power sub item displays a message
        'Error: Item does not exist', this should be safe to ignore
    - can't edit power/equipment 'sub-items' from character sheet (to add powers to a character sheet use the item tab
        to create and edit the power there then drag the item onto a character sheet)
    - rolling initiative produces an error message, this can likely be ignored

# Version 1.1.1
- Bugfixes
    - Split up attack card because players could only make attacks against themselves
    - Attack card messages had wrong sender name

# Version 1.1.0
- Added Characteristics base values to character sheet, Editable only in 'Edit' mode on character sheet
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

# Version 1.0.0
- forked from https://github.com/jared-l-vine/hero6e-foundryvtt
- updated to work with Foundry 9.280
- added option to automatically track endurance
- added hit locations option
- added knockback option
- added powers and equipment items
- added maneuver item
