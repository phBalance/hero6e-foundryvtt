// Chat clean-up for Quench runs.
//
// Foundry re-renders the chat sidebar every time a message arrives. A long log makes each new
// message cost more time, so a test run slows down as its own chat output piles up. A run therefore
// records which messages existed before it started, and deletes the rest when it ends. The next run
// starts from a short log.
//
// The baseline snapshot costs nothing during the run. No hook fires per message, and no chat write
// path changes. It catches messages from every source: system code, Quench itself, macros, and other
// modules.

// localStorage key for the toggle. localStorage survives a page reload, so the toggle stays put
// across the refresh a timing comparison needs.
export const TOGGLE_STORAGE_KEY = "hero6efoundryvttv2.quenchChatCleanup";

// Message ids that existed when the current run captured its baseline.
// Null means no baseline was captured, so clean-up deletes nothing.
let baselineMessageIds = null;

/**
 * Report whether chat clean-up is turned on.
 *
 * Reads the toggle on every call, so a console change takes effect without a reload. Only an
 * explicit off value disables clean-up. An unset key means on.
 *
 * @returns {boolean} True when the run's chat messages get deleted at teardown.
 */
export function isChatCleanupEnabled() {
    const stored = localStorage.getItem(TOGGLE_STORAGE_KEY);

    if (stored === "false" || stored === "off" || stored === "0") {
        return false;
    }

    return true;
}

/**
 * Turn chat clean-up on or off, and keep the choice across page reloads.
 *
 * @param {boolean} enabled True to delete the run's chat messages at teardown, false to leave them.
 *
 * @returns {boolean} The value now in effect.
 */
export function setChatCleanupEnabled(enabled) {
    localStorage.setItem(TOGGLE_STORAGE_KEY, enabled ? "true" : "false");

    return enabled;
}

/**
 * Record the chat messages that exist before the run starts.
 *
 * Global setup calls this first, so the baseline covers everything the run did not create.
 *
 * @returns {number} How many messages the baseline holds. Zero when clean-up is off.
 */
export function captureChatBaseline() {
    if (!isChatCleanupEnabled()) {
        baselineMessageIds = null;

        return 0;
    }

    baselineMessageIds = new Set(game.messages.contents.map((message) => message.id));

    return baselineMessageIds.size;
}

/**
 * Delete the chat messages this run created.
 *
 * Deletes every message absent from the baseline. One bulk delete keeps the cost to a single sidebar
 * update. Without a baseline this deletes nothing, because it cannot tell a run message from a real
 * one.
 *
 * @returns {Promise<{deleted: number, skipped: string|null}>} How many messages went, and why
 *                    nothing went when nothing did.
 */
export async function deleteRunChatMessages() {
    if (!isChatCleanupEnabled()) {
        return { deleted: 0, skipped: "chat clean-up is disabled" };
    }

    if (baselineMessageIds === null) {
        return { deleted: 0, skipped: "no chat baseline captured, so global setup did not run" };
    }

    const runMessageIds = game.messages.contents
        .filter((message) => !baselineMessageIds.has(message.id))
        .map((message) => message.id);

    baselineMessageIds = null;

    if (runMessageIds.length > 0) {
        await ChatMessage.deleteDocuments(runMessageIds);
    }

    return { deleted: runMessageIds.length, skipped: null };
}
