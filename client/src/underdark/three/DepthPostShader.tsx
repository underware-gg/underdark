/**
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from https://web.archive.org/web/20090820185047/http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / https://web.archive.org/web/20090810054752/http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

const DepthPostShader = {

  name: 'DepthPostShader',

  uniforms: {
    // 'tDiffuse': { value: null },
    // 'amount': { value: 0.005 },
    // 'angle': { value: 0.0 }
  },

  vertexShader: /* glsl */`
			varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,

  fragmentShader: /* glsl */`

			#include <packing>

			varying vec2 vUv;
			uniform sampler2D tDiffuse;
			uniform sampler2D tDepth;
			uniform float uCameraNear;
			uniform float uCameraFar;
      uniform float uGamma;
      uniform float uColorCount;
      uniform float uDither;
      uniform float uDitherSize;

      #define apply_gamma(a,g)		( (a) > 0.0 ? pow( (a), (1.0/(g)) ) : (a) )

      vec3 apply_dither(vec3 color) {
        vec2 pixelSize = 1.0 / vec2(textureSize(tDiffuse, 0));
        float a = floor(mod(vUv.x / pixelSize.x, uDitherSize));
        float b = floor(mod(vUv.y / pixelSize.y, uDitherSize));
        float c = mod(a + b, uDitherSize);
        vec3 result = vec3(
          (round(color.r * uColorCount + uDither) / uColorCount) * c,
          (round(color.g * uColorCount + uDither) / uColorCount) * c,
          (round(color.b * uColorCount + uDither) / uColorCount) * c
        );
        c = 1.0 - c;
        result.r += (round(color.r * uColorCount - uDither) / uColorCount) * c;
        result.g += (round(color.g * uColorCount - uDither) / uColorCount) * c;
        result.b += (round(color.b * uColorCount - uDither) / uColorCount) * c;
        return result;
      }

			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, uCameraNear, uCameraFar );
				return viewZToOrthographicDepth( viewZ, uCameraNear, uCameraFar );
			}

			void main() {
				//vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
				float depth = readDepth( tDepth, vUv );
        depth = apply_gamma(depth, uGamma);

        vec3 color = 1.0 - vec3( depth );
        color = apply_dither(color);

				gl_FragColor.rgb = color;
				gl_FragColor.a = 1.0;
			}

		`

};

export { DepthPostShader }
