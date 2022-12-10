import { modifyRollEquation } from "../utility/util.js"

async function _renderSkillForm(item, actor, stateData) {
	const token = actor.token;

	const templateData = {
		actor: actor.data,
		tokenId: token?.uuid || null,
		item: item.data,
		state: stateData,
	};

	var path = "systems/hero6e-foundryvtt-v2/templates/skill/item-skill-card.hbs";

	return await renderTemplate(path, templateData);
}

async function createSkillPopOutFromItem(item, actor) {
	const content = await _renderSkillForm(item, actor, {});

	// Attack Card as a Pop Out
	let options = {
		'width' : 300,
	}

	return new Promise(resolve => {
		const data = {
			title: "Roll to Hit",
			content: content,
			buttons: {
				rollToHit: {
					label: "Roll to Hit",
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

    let rollEquation = "3D6";
    rollEquation = modifyRollEquation(rollEquation, form.mod.value)

	let roll = new Roll(rollEquation, actor.getRollData());

	roll.evaluate().then(function(result) {
		let margin = parseInt(item.data.data.roll) - result.total;
		
		result.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: actor }),
			flavor: item.name.toUpperCase() + " ( " + item.data.data.roll + " ) roll " + (margin >= 0 ? "succeeded" : "failed") + " by " + Math.abs(margin),
			borderColor: margin >= 0 ? 0x00FF00 : 0xFF0000,	
		});
	});
}

export {createSkillPopOutFromItem};