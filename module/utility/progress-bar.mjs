// See https://github.com/foundryvtt/foundryvtt/issues/5692 for the FoundryVTT v9+ solution
// See https://github.com/foundryvtt/foundryvtt/issues/9637 for a possible replacement in v12

/**
 * A progress bar wrapper around the underlying system.
 */
export class HeroProgressBar {
    static #concurrentProgressBarCount = 0;

    constructor(label, max, startCount = 0) {
        this._label = label;
        this._max = max;
        this._count = startCount;
        this._inProgress = true;

        if (++HeroProgressBar.#concurrentProgressBarCount > 1) {
            ui.notification.error(
                `${HeroProgressBar.#concurrentProgressBarCount} progress bars are fighting for control of the scene navigation`,
            );
        }

        this.advance(this._label, 0);
    }

    toString() {
        return `HeroProgressBar(${HeroProgressBar.#concurrentProgressBarCount}) (label = ${this._label}, count = ${this._count}, max = ${this._max}, inProgress=${this._inProgress})`;
    }

    /**
     * advance the percentage on the progress bar. Yes, you can do a negative count but not sure you want to.
     *
     * @param {string} label
     * @param {number} count
     */
    advance(label = this._label, count = 1) {
        this._count = this._count + count;

        const percentage = Math.trunc((100 * this._count) / this._max);

        if (this._count < this._max) {
            SceneNavigation.displayProgressBar({
                label: label,
                pct: percentage,
            });
        } else {
            this.close();
        }
    }

    close(label = this._label) {
        if (this._inProgress) {
            this._inProgress = false;
            // Set the percentage to 100 which will cause foundry to fade out the progress bar.
            SceneNavigation.displayProgressBar({ label: label, pct: 100 });

            --HeroProgressBar.#concurrentProgressBarCount;
        } else {
            console.warn(
                `Progress bar ${this} close called when already closed`,
            );
        }
    }
}
