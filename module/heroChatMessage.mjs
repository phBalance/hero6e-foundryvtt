export class HeroSystem6eChatMessage extends ChatMessage {
    // REF: https://github.com/foundryvtt/pf2e/blob/acf49e6130dc43e80c9b1f63fcb58a1ab611b4ce/src/module/chat-message/document.ts#L23

    async renderHTML(options) {
        const html = await super.renderHTML(options);

        const header = html?.querySelector("header.message-header");
        if (header) {
            try {
                const actor = this.speakerActor;
                const token = this.token ?? actor?.prototypeToken;

                if (token) {
                    const [imageUrl, scale] = (() => {
                        //const tokenImage = token.texture.src;
                        // const hasTokenImage = tokenImage && fh.media.ImageHelper.hasImageExtension(tokenImage);
                        // if (!hasTokenImage) {
                        // || isDefaultTokenImage(token)) {
                        return [actor.img, 1];
                        //}

                        // Calculate the correction factor for dynamic tokens.
                        // Prototype tokens do not have access to subjectScaleAdjustment so we recompute using default values
                        // const defaultRingThickness = 0.1269848;
                        // const defaultSubjectThickness = 0.6666666;
                        // const scaleCorrection = token.ring.enabled
                        //     ? 1 / (defaultRingThickness + defaultSubjectThickness)
                        //     : 1;
                        // return [tokenImage, Math.max(1, token.texture.scaleX ?? 1) * scaleCorrection];
                    })();

                    const image = document.createElement("img");
                    image.alt = actor.name;
                    image.src = imageUrl;
                    image.inert = true;
                    image.style.transform = `scale(${scale})`;

                    // If image scale is above 1.2, we might need to add a radial fade to not block out the name
                    if (scale > 1.2) {
                        const ringPercent = 100 - Math.floor(((scale - 0.7) / scale) * 100);
                        const limitPercent = 100 - Math.floor(((scale - 1.15) / scale) * 100);
                        image.style.maskImage = `radial-gradient(circle at center, black ${ringPercent}%, rgba(0, 0, 0, 0.2) ${limitPercent}%)`;
                    }

                    //const usedToken = imageUrl === token.texture.src;

                    // const portrait = createHTMLElement("div", {
                    //     children: [image],
                    //     classes: ["portrait", usedToken ? "token" : "actor-image"],
                    // });

                    header.classList.add("with-image");
                    const portrait = document.createElement("div");
                    portrait.classList.add("portrait");
                    portrait.append(image);

                    header.prepend(portrait);

                    // if (this.author) {
                    //     const authorSpan = document.createElement("span");
                    //     authorSpan.classList.add("user");
                    //     authorSpan.append(this.author.name);
                    //     header.append(authorSpan);
                    // }
                }
            } catch (e) {
                console.error(e);
            }
        }

        return html;
    }
}
