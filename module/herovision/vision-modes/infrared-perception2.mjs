export class HeroVisionModeInfraredPerception extends foundry.canvas.perception.VisionMode {
    constructor() {
        super(
            {
                id: "infraredPerception",
                label: "Infrared Perception",
                lighting: {
                    background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.REQUIRED },
                },
                vision: {
                    darkness: { adaptive: false },
                    background: {
                        shader: foundry.canvas.rendering.shaders.AmplificationBackgroundVisionShader,
                        //shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
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
