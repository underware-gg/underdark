# Underdark
Underdark for the Dojo Game Jam #2


## Team

* Mataleone
  * GitHub: [@rsodre](https://github.com/rsodre)
  * Twitter: [@matalecode](https://twitter.com/matalecode)
* Recipromancer
  * GitHub: [@Rob-Morris](https://github.com/Rob-Morris)
  * Twitter: [@recipromancer](https://twitter.com/recipromancer)


## Resources

* Starter from open-source [Loot Underworld](https://github.com/funDAOmental/lootunderworld) current rev ([f3b317f](https://github.com/funDAOmental/lootunderworld/tree/f3b317ff03a7b62620f055e5238b9d300f7be189))


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
torii --world 0x56c991ec4188b7c036066d28a19ed2b245ee1174ed3935f2d7e15c60a496f82
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

