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

      #define applyGamma(a,g)		( (a) > 0.0 ? pow( (a), (1.0/(g)) ) : (a) )

			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, uCameraNear, uCameraFar );
				float depth = viewZToOrthographicDepth( viewZ, uCameraNear, uCameraFar );
        depth = applyGamma(depth, uGamma);
        return depth;
			}

			void main() {
				//vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
				float depth = readDepth( tDepth, vUv );

				gl_FragColor.rgb = 1.0 - vec3( depth );
				gl_FragColor.a = 1.0;
			}

		`

};

export { DepthPostShader }
