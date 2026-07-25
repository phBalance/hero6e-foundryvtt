const { VisionMode } = foundry.canvas.perception;
const { AmplificationBackgroundVisionShader } = foundry.canvas.rendering.shaders;

export class HeroVisionModeInfraredPerception extends foundry.canvas.perception.VisionMode {
    constructor() {
        super(
            {
                id: "infraredPerception",
                label: "Infrared Perception",
                lighting: {
                    background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
                },
                vision: {
                    darkness: { adaptive: false },
                    background: {
                        shader: AmplificationBackgroundVisionShader,
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
