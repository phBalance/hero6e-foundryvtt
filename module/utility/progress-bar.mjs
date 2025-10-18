/**
 * A v13 based progress bar wrapper around the underlying system.
 */
class HeroProgressBarV13 {
    static #concurrentProgressBarCount = 0;

    /**
     * @param {string} label
     * @param {number} max
     * @param {number} [startCount]
     */
    constructor(label, max, startCount = 0) {
        this._message = label;
        this._max = max;
        this._count = startCount;
        this._inProgress = true;
        this._progressBar = ui.notifications.info(label, { progress: true });
        this._performance = [];
        this._performance.push({ timestamp: Date.now(), message: "constructor", pct: 0 });

        if (++HeroProgressBarV13.#concurrentProgressBarCount > 1) {
            ui.notifications.warn(
                `${Date.now()} ${this}: progress bars are fighting for control of the scene navigation`,
            );
        }

        this.advance(this._message, 0);

        if (CONFIG.debug.HERO?.ui?.progress) {
            console.debug(
                `${Date.now()} ${this}: creating progress bar with label "${label}", max ${max}, startCount ${startCount}`,
            );
        }
    }

    toString() {
        return `HeroProgressBarV13(${HeroProgressBarV13.#concurrentProgressBarCount}) (label = ${this._message}, count = ${this._count}, max = ${this._max}, inProgress=${this._inProgress})`;
    }

    /**
     * Advance the percentage on the progress bar. Yes, you can do a negative count but not sure you want to.
     *
     * @param {string} message
     * @param {number} count
     */
    advance(message = this._message, count = 1) {
        this._count = this._count + count;

        if (this._count > this._max) {
            console.log(`${this}:: Count > Max - clamping at max`);
            this._count = this._max;
        } else if (this._count < 0) {
            console.error(`${this}: Count < 0 - clamping at 0`);
            this._count = 0;
        }

        const percentage = this._count / this._max;

        this._progressBar.update({ pct: percentage, message: message });
        this._performance.at(-1).delta = Date.now() - this._performance.at(-1).timestamp;
        this._performance.push({ timestamp: Date.now(), message: message, pct: percentage });

        if (CONFIG.debug.HERO?.ui?.progress) {
            console.debug(`${Date.now()} ${this}: ${percentage * 100}% (${this._count}/${this._max}) ${message}`);
        }
    }

    /**
     * Display a final message and terminate the progress bar.
     *
     * @param {string} message
     */
    close(message = this._message) {
        if (this._inProgress) {
            this._inProgress = false;

            // Set to 100% which will cause foundry to fade out the progress bar.
            this._progressBar.update({ pct: 1, message: message });
            this._performance.push({ timestamp: Date.now(), message: "close", pct: 1 });

            --HeroProgressBarV13.#concurrentProgressBarCount;

            if (CONFIG.debug.HERO?.ui?.progress) console.debug(`${Date.now()} ${this}: closing`);
        } else {
            console.warn(`${Date.now()} ${this}: close called when already closed`);
        }
    }
}

// See https://github.com/foundryvtt/foundryvtt/issues/5692 for the FoundryVTT v9+ solution
// See https://github.com/foundryvtt/foundryvtt/issues/9637 for a possible replacement in v12
/**
 * A v12 based progress bar wrapper around the underlying system.
 */
class HeroProgressBarV12 {
    static #concurrentProgressBarCount = 0;

    /**
     *
     * @param {string} label
     * @param {number} max
     * @param {number} [startCount]
     */
    constructor(label, max, startCount = 0) {
        this._label = label;
        this._max = max;
        this._count = startCount;
        this._inProgress = true;

        // This is very gross reaching in and modifying the CSS while we're using the progress bar.
        document.querySelector("#loading #loading-bar").style.setProperty("white-space", "nowrap");

        const progressBarLabel = document.querySelector("#loading #context").style;
        progressBarLabel.setProperty("text-overflow", "ellipsis");
        //progressBarLabel.setProperty("overflow", "hidden");
        //progressBarLabel.setProperty("width", "0%");

        if (++HeroProgressBarV12.#concurrentProgressBarCount > 1) {
            ui.notifications.warn(
                `${HeroProgressBarV12.#concurrentProgressBarCount} progress bars are fighting for control of the scene navigation`,
            );
        }

        this.advance(this._label, 0);
    }

    toString() {
        return `HeroProgressBar(${HeroProgressBarV12.#concurrentProgressBarCount}) (label = ${this._label}, count = ${this._count}, max = ${this._max}, inProgress=${this._inProgress})`;
    }

    /**
     * advance the percentage on the progress bar. Yes, you can do a negative count but not sure you want to.
     *
     * @param {string} label
     * @param {number} count
     */
    advance(label = this._label, count = 1) {
        this._count = this._count + count;

        if (this._count > this._max) {
            console.log("ProgressBar: Count > Max");
            this._max = this._count;
        }

        const percentage = Math.trunc((100 * this._count) / this._max);

        SceneNavigation.displayProgressBar({
            label: label,
            pct: percentage,
        });

        //console.log(`ProgressBar: ${percentage}% ${label}`);
    }

    close(label = this._label) {
        if (this._inProgress) {
            this._inProgress = false;
            // Set the percentage to 100 which will cause foundry to fade out the progress bar.
            SceneNavigation.displayProgressBar({ label: label, pct: 100 });

            document.querySelector("#loading #loading-bar").style.removeProperty("white-space");

            const progressBarLabel = document.querySelector("#loading #context").style;
            progressBarLabel.removeProperty("text-overflow");
            progressBarLabel.removeProperty("overflow");
            progressBarLabel.removeProperty("width");

            --HeroProgressBarV12.#concurrentProgressBarCount;
        } else {
            console.warn(`Progress bar ${this} close called when already closed`);
        }
    }
}

// v13 backwards compatibility code (new SceneNavigation API in v13). Can remove the v12 version when compatibility has ended.
export const HeroProgressBar = foundry.applications?.ui?.SceneNavigation ? HeroProgressBarV13 : HeroProgressBarV12;
