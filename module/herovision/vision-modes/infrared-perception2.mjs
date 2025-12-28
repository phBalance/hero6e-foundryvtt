// v13 has namespaced these. Remove when support is no longer provided. Also remove from eslint template.
const FoundryVttVisionMode = foundry.canvas.perception?.VisionMode || VisionMode;
const FoundryVttAmplificationBackgroundVisionShader =
    foundry.canvas.rendering?.shaders?.AmplificationBackgroundVisionShader || AmplificationBackgroundVisionShader;

export class HeroVisionModeInfraredPerception extends FoundryVttVisionMode {
    constructor() {
        super(
            {
                id: "infraredPerception",
                label: "Infrared Perception",
                lighting: {
                    background: { visibility: FoundryVttVisionMode.LIGHTING_VISIBILITY.REQUIRED },
                },
                vision: {
                    darkness: { adaptive: false },
                    background: {
                        shader: FoundryVttAmplificationBackgroundVisionShader,
                        uniforms: {
                            contrast: 0,
                            saturation: 0,
                            exposure: 0,
                            brightness: 0,
                            colorTint: [0.8, 0.38, 0.38],
                        },
                    },
                },
            },
            // { animated: true },
        );
    }
}
