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

      #include <common>
      #include <packing>

			varying vec2 vUv;
			uniform sampler2D tDiffuse;
			uniform sampler2D tDepth;
			uniform sampler2D tPalette;
      uniform float uPalette;
      uniform bool uLightness;
      uniform float uNoise;
      uniform float uTime;
			uniform float uCameraNear;
			uniform float uCameraFar;
			uniform float uCameraFov;
      uniform float uGamma;
      uniform float uColorCount;
      uniform float uDither;
      uniform float uDitherSize;
      uniform float uBayer;

			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, uCameraNear, uCameraFar );
				float depth = viewZToOrthographicDepth( viewZ, uCameraNear, uCameraFar );
				// warp depth from frustum to camera position
				float a = (coord.x - 0.5) * uCameraFov;
				depth = 1.0 - ((1.0 - depth) * cos(a));
				return depth;
			}

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


      // https://www.shadertoy.com/view/7sfXDn
      float Bayer2(vec2 a) {
        a = floor(a);
        return fract(a.x / 2. + a.y * a.y * .75);
      }
      #define Bayer4(a)   (Bayer2 (.5 *(a)) * .25 + Bayer2(a))
      #define Bayer8(a)   (Bayer4 (.5 *(a)) * .25 + Bayer2(a))
      #define Bayer16(a)  (Bayer8 (.5 *(a)) * .25 + Bayer2(a))
      #define Bayer32(a)  (Bayer16(.5 *(a)) * .25 + Bayer2(a))
      #define Bayer64(a)  (Bayer32(.5 *(a)) * .25 + Bayer2(a))
      vec3 apply_dither_bayer(vec3 color) {
        vec2 frag = vUv * vec2(textureSize(tDiffuse, 0)) * uBayer;
        float dithering = (Bayer64(frag * 0.25) * 2.0 - 1.0) * 0.5;
        float d = color.g + dithering;
        return 1.0 - vec3(d < 0.5);
      }

      // from:
      // https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/FilmPass.js
      // https://github.com/mrdoob/three.js/blob/dev/examples/jsm/shaders/FilmShader.js
      float apply_noise(float value) {
        float noise = rand( fract( vUv + uTime * 1.0 ) );
        // float result = value + value * clamp( 0.1 + noise, 0.0, 1.0 );
        float result = value * clamp( 0.1 + noise, 0.6, 1.0 );
        result = mix( value, result, uNoise );
        if ( true ) { // grayscale
          result = vec3( luminance( vec3(result) ) ).r; // assuming linear-srgb
        }
        return result;
      }

      vec3 apply_palette(vec3 color, float intensity) {
        if (uPalette > 0.0) {
          vec3 albedo = texture2D(tPalette, vec2(intensity, 0.0) ).rgb;
          if (uLightness) {
            vec3 back = texture2D(tPalette, vec2(0.0, 0.0) ).rgb;
            return (albedo * color) + (back * (1.0- color));
          } else {
            return color * albedo;
          }
        } else if (uLightness) {
          return 1.0 - color;
        }
        return color;
      }


			void main() {
				//vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
				float depth = readDepth( tDepth, vUv );
        depth = apply_gamma(depth, uGamma);
        depth = 1.0 - depth;

        // save depth value
        float intensity = depth;

        // noise
        if (uNoise > 0.0) {
          depth = apply_noise(depth);
        }

        // result
        vec3 color = vec3( depth );

        // color reduction + dither
        if(uColorCount > 0.0) {
          color = apply_dither(color);
        }

        // another dither
        if (uBayer > 0.0) {
          color = apply_dither_bayer(color);
        }

        // palette
        color = apply_palette(color, intensity);

				gl_FragColor.rgb = color;
				gl_FragColor.a = 1.0;
			}

		`

};

export { DepthPostShader }
