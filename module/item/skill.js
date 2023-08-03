import { HEROSYS } from "../herosystem6e.js";
import { modifyRollEquation } from "../utility/util.js"

async function _renderSkillForm(item, actor, stateData) {
	const token = actor.token;

	// Skill Levels (in most cases it will apply so check it)
	let skillLevels = Array.from(actor.items.filter(o => o.system.XMLID === "SKILL_LEVELS"));
	for (let s of skillLevels) {
		s.system.checked = true;
	}

	const templateData = {
		actor: actor.system,
		tokenId: token?.uuid || null,
		item: item,
		state: stateData,
		skillLevels,
	};

	var path = "systems/hero6efoundryvttv2/templates/pop-out/item-skill-card.hbs";

	return await renderTemplate(path, templateData);
}

async function createSkillPopOutFromItem(item, actor) {
	const content = await _renderSkillForm(item, actor, {});

	// Attack Card as a Pop Out
	let options = {
		'width': 300,
	}

	return new Promise(resolve => {
		const data = {
			title: "Roll Skill",
			content: content,
			buttons: {
				rollToHit: {
					label: "Roll Skill",
					callback: html => resolve(skillRoll(item, actor, html))
				},
			},
			default: "rollToHit",
			close: () => resolve({})
		}

		new Dialog(data, options).render(true);;
	});
}

async function skillRoll(item, actor, html) {
	let form = html[0].querySelector("form");

	let tags = item.system.tags;

	let rollEquation = "3D6";

	// Skill Levels
	const skillLevelInputs = form.querySelectorAll("INPUT:checked")
	for (const skillLevelinput of skillLevelInputs) {
		const skillLevel = actor.items.get(skillLevelinput.id);
		const level = parseInt(skillLevel.system.LEVELS.value);
		if (level > 0) {
			tags.push({ value: level, name: skillLevel.name })
			//rollEquation = modifyRollEquation(rollEquation, level)
			//targetNumber += level;
		}
	}

	// Roll Modifier (from form)
	let modValue = parseInt(form.mod.value || 0);
	if (modValue != 0) {
		tags.push({ value: modValue, name: "Roll Mod" })
		//rollEquation = modifyRollEquation(rollEquation, modValue);
		//targetNumber += modValue;
	}

	let content = `<div class="tags"><div class="tags" style="line-height: 14px;">`
	for (let tag of tags) {
		content += `<span class="tag tag_transparent" title="${tag.title ||''}" >${tag.name} +${tag.value}</span>`;
	}
	content += `</div></div>`;

	let roll = new Roll(rollEquation, actor.getRollData());

	let targetNumber = 0;
	for(let tag of tags) {
		targetNumber += tag.value;
	}

	roll.evaluate({ async: true }).then(function (result) {
		let margin = parseInt(targetNumber) - result.total;

		result.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			flavor: content + item.name.toUpperCase() + " ( " + targetNumber + "- ) roll " + (margin >= 0 ? "succeeded" : "failed") + " by " + Math.abs(margin),
			borderColor: margin >= 0 ? 0x00FF00 : 0xFF0000,
		});
	});
}

export { createSkillPopOutFromItem };