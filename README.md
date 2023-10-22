# Underdark

Losing our mind in the Underdark, for the Dojo Game Jam #2

```
   __  __     __   __     _____     ______     ______   
  /\ \/\ \   /\ "-.\ \   /\  __-.  /\  ___\   /\  == \  
  \ \ \_\ \  \ \ \-.  \  \ \ \/\ \ \ \  __\   \ \  __<  
   \ \_____\  \ \_\\"\_\  \ \____-  \ \_____\  \ \_\ \_\
    \/_____/   \/_/ \/_/   \/____/   \/_____/   \/_/ /_/
       _____     ______     ______     __  __           
      /\  __-.  /\  __ \   /\  == \   /\ \/ /     scoheth      
      \ \ \/\ \ \ \  __ \  \ \  __<   \ \  _"-.    shobro     
       \ \____-  \ \_\ \_\  \ \_\ \_\  \ \_\ \_\    blubble    
        \/____/   \/_/\/_/   \/_/ /_/   \/_/\/_/     quackir   
  
         ,----------------------------------------------------.         
        (_\                                                    \        
           \       Something ill under  Kurnkornor stirs,       \       
            \       down those crumbling old manor stairs,       \      
             \       dark tar that claws and sucks the light,     \     
              \       a   ghastly   duck  no-one   can  fight,     \    
               \       yet  all  in  life  and  death  be  fair,    \   
                \       there's gold  and treasure  buried there.    \  
               _|                                                     | 
              (_/_________________________(*)_________________________/ 
                                          | |                           
                                          ) )            _            
                                          ^%'          >(~)____/             
                                                        (``~~~/     
                ".....had a nightmare about the Slenderduck last night"
                -- gabe | cartridge                                       

```

## Team

* Mataleone
  * GitHub: [@rsodre](https://github.com/rsodre)
  * Twitter: [@matalecode](https://twitter.com/matalecode)
* Recipromancer
  * GitHub: [@Rob-Morris](https://github.com/Rob-Morris)
  * Twitter: [@recipromancer](https://twitter.com/recipromancer)


## Resources

* Starter from open-source [Loot Underworld](https://github.com/funDAOmental/lootunderworld) current rev ([f3b317f](https://github.com/funDAOmental/lootunderworld/tree/f3b317ff03a7b62620f055e5238b9d300f7be189)) CC0
* threejs depth texture [example](https://threejs.org/examples/#webgl_depth_texture) by [@mattdesl](https://twitter.com/mattdesl) CC0
* Color reduction and dither [shader](https://godotshaders.com/shader/color-reduction-and-dither/) by **whiteshampoo**
* Ordered Dithering (Bayer) [shader](https://www.shadertoy.com/view/7sfXDn) by **Tech_*
* [three.js](https://threejs.org/) for graphics
* [tween.js](https://github.com/tweenjs/tween.js) for animation
* Music: Biodecay -- Mazzive Injection (Bonus Track) [1999], Biodecay - Down (Depression) [1999]

## Environment Setup [🔗](https://book.dojoengine.org/getting-started/setup.html)

Install Rust + Cargo + others

```
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup override set stable
rustup update
cargo test

# Install Cargo
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# other stuff you might need
brew install protobuf
```

Install the [Cairo 1.0](https://marketplace.visualstudio.com/items?itemName=starkware.cairo1) extension for Visual Studio Code


### Install Dojo [🔗](https://book.dojoengine.org/getting-started/quick-start.html)

Using Dojo 0.3.0!

```console
curl -L https://install.dojoengine.org | bash
dojoup -v 0.3.0

# install packages
cd client
yarn
```


## Launch Dojo

#### Terminal 1: Katana (local node)

```console
cd dojo
katana --disable-fee --invoke-max-steps 10000000
```

#### Terminal 2: Torii (indexer)

Uncomment the `world_address` parameter in `dojo/Scarb.toml` then:

```console
cd dojo
torii --world 0x6150655e17345af3d45d23f9b1d04a4c5e485dfed5bf55cbd6f53063aaa42a
```

#### Terminal 3: Client

```console
cd client
yarn && yarn dev
```

#### Terminal 4: Sozo commands

```console
cd dojo
sozo build

# migrate to local Katana
./migrate
```


#### Browser

Open [http://localhost:5173/](http://localhost:5173/)

