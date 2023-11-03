//@ts-nocheck
import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import { print } from 'graphql'
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  ContractAddress: { input: any; output: any; }
  Cursor: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  felt252: { input: any; output: any; }
  u8: { input: any; output: any; }
  u16: { input: any; output: any; }
  u32: { input: any; output: any; }
  u128: { input: any; output: any; }
  u256: { input: any; output: any; }
  usize: { input: any; output: any; }
};

export type Chamber = {
  __typename?: 'Chamber';
  entity?: Maybe<Entity>;
  level_number?: Maybe<Scalars['u16']['output']>;
  location_id?: Maybe<Scalars['u128']['output']>;
  room_id?: Maybe<Scalars['u16']['output']>;
  seed?: Maybe<Scalars['u256']['output']>;
  yonder?: Maybe<Scalars['u16']['output']>;
};

export type ChamberConnection = {
  __typename?: 'ChamberConnection';
  edges?: Maybe<Array<Maybe<ChamberEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type ChamberEdge = {
  __typename?: 'ChamberEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Chamber>;
};

export type ChamberOrder = {
  direction: OrderDirection;
  field: ChamberOrderField;
};

export enum ChamberOrderField {
  LevelNumber = 'LEVEL_NUMBER',
  LocationId = 'LOCATION_ID',
  RoomId = 'ROOM_ID',
  Seed = 'SEED',
  Yonder = 'YONDER'
}

export type ChamberWhereInput = {
  level_number?: InputMaybe<Scalars['u16']['input']>;
  level_numberEQ?: InputMaybe<Scalars['u16']['input']>;
  level_numberGT?: InputMaybe<Scalars['u16']['input']>;
  level_numberGTE?: InputMaybe<Scalars['u16']['input']>;
  level_numberLT?: InputMaybe<Scalars['u16']['input']>;
  level_numberLTE?: InputMaybe<Scalars['u16']['input']>;
  level_numberNEQ?: InputMaybe<Scalars['u16']['input']>;
  location_id?: InputMaybe<Scalars['u128']['input']>;
  location_idEQ?: InputMaybe<Scalars['u128']['input']>;
  location_idGT?: InputMaybe<Scalars['u128']['input']>;
  location_idGTE?: InputMaybe<Scalars['u128']['input']>;
  location_idLT?: InputMaybe<Scalars['u128']['input']>;
  location_idLTE?: InputMaybe<Scalars['u128']['input']>;
  location_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  room_id?: InputMaybe<Scalars['u16']['input']>;
  room_idEQ?: InputMaybe<Scalars['u16']['input']>;
  room_idGT?: InputMaybe<Scalars['u16']['input']>;
  room_idGTE?: InputMaybe<Scalars['u16']['input']>;
  room_idLT?: InputMaybe<Scalars['u16']['input']>;
  room_idLTE?: InputMaybe<Scalars['u16']['input']>;
  room_idNEQ?: InputMaybe<Scalars['u16']['input']>;
  seed?: InputMaybe<Scalars['u256']['input']>;
  seedEQ?: InputMaybe<Scalars['u256']['input']>;
  seedGT?: InputMaybe<Scalars['u256']['input']>;
  seedGTE?: InputMaybe<Scalars['u256']['input']>;
  seedLT?: InputMaybe<Scalars['u256']['input']>;
  seedLTE?: InputMaybe<Scalars['u256']['input']>;
  seedNEQ?: InputMaybe<Scalars['u256']['input']>;
  yonder?: InputMaybe<Scalars['u16']['input']>;
  yonderEQ?: InputMaybe<Scalars['u16']['input']>;
  yonderGT?: InputMaybe<Scalars['u16']['input']>;
  yonderGTE?: InputMaybe<Scalars['u16']['input']>;
  yonderLT?: InputMaybe<Scalars['u16']['input']>;
  yonderLTE?: InputMaybe<Scalars['u16']['input']>;
  yonderNEQ?: InputMaybe<Scalars['u16']['input']>;
};

export type Entity = {
  __typename?: 'Entity';
  created_at?: Maybe<Scalars['DateTime']['output']>;
  event_id?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  keys?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  model_names?: Maybe<Scalars['String']['output']>;
  models?: Maybe<Array<Maybe<ModelUnion>>>;
  updated_at?: Maybe<Scalars['DateTime']['output']>;
};

export type EntityConnection = {
  __typename?: 'EntityConnection';
  edges?: Maybe<Array<Maybe<EntityEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type EntityEdge = {
  __typename?: 'EntityEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Entity>;
};

export type Event = {
  __typename?: 'Event';
  created_at?: Maybe<Scalars['DateTime']['output']>;
  data?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id?: Maybe<Scalars['ID']['output']>;
  keys?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  transaction_hash?: Maybe<Scalars['String']['output']>;
};

export type EventConnection = {
  __typename?: 'EventConnection';
  edges?: Maybe<Array<Maybe<EventEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type EventEdge = {
  __typename?: 'EventEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Event>;
};

export type Map = {
  __typename?: 'Map';
  bitmap?: Maybe<Scalars['u256']['output']>;
  dark_tar?: Maybe<Scalars['u256']['output']>;
  east?: Maybe<Scalars['u8']['output']>;
  entity?: Maybe<Entity>;
  entity_id?: Maybe<Scalars['u128']['output']>;
  generator_name?: Maybe<Scalars['felt252']['output']>;
  generator_value?: Maybe<Scalars['u32']['output']>;
  monsters?: Maybe<Scalars['u256']['output']>;
  north?: Maybe<Scalars['u8']['output']>;
  over?: Maybe<Scalars['u8']['output']>;
  slender_duck?: Maybe<Scalars['u256']['output']>;
  south?: Maybe<Scalars['u8']['output']>;
  under?: Maybe<Scalars['u8']['output']>;
  west?: Maybe<Scalars['u8']['output']>;
};

export type MapConnection = {
  __typename?: 'MapConnection';
  edges?: Maybe<Array<Maybe<MapEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type MapEdge = {
  __typename?: 'MapEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Map>;
};

export type MapOrder = {
  direction: OrderDirection;
  field: MapOrderField;
};

export enum MapOrderField {
  Bitmap = 'BITMAP',
  DarkTar = 'DARK_TAR',
  East = 'EAST',
  EntityId = 'ENTITY_ID',
  GeneratorName = 'GENERATOR_NAME',
  GeneratorValue = 'GENERATOR_VALUE',
  Monsters = 'MONSTERS',
  North = 'NORTH',
  Over = 'OVER',
  SlenderDuck = 'SLENDER_DUCK',
  South = 'SOUTH',
  Under = 'UNDER',
  West = 'WEST'
}

export type MapWhereInput = {
  bitmap?: InputMaybe<Scalars['u256']['input']>;
  bitmapEQ?: InputMaybe<Scalars['u256']['input']>;
  bitmapGT?: InputMaybe<Scalars['u256']['input']>;
  bitmapGTE?: InputMaybe<Scalars['u256']['input']>;
  bitmapLT?: InputMaybe<Scalars['u256']['input']>;
  bitmapLTE?: InputMaybe<Scalars['u256']['input']>;
  bitmapNEQ?: InputMaybe<Scalars['u256']['input']>;
  dark_tar?: InputMaybe<Scalars['u256']['input']>;
  dark_tarEQ?: InputMaybe<Scalars['u256']['input']>;
  dark_tarGT?: InputMaybe<Scalars['u256']['input']>;
  dark_tarGTE?: InputMaybe<Scalars['u256']['input']>;
  dark_tarLT?: InputMaybe<Scalars['u256']['input']>;
  dark_tarLTE?: InputMaybe<Scalars['u256']['input']>;
  dark_tarNEQ?: InputMaybe<Scalars['u256']['input']>;
  east?: InputMaybe<Scalars['u8']['input']>;
  eastEQ?: InputMaybe<Scalars['u8']['input']>;
  eastGT?: InputMaybe<Scalars['u8']['input']>;
  eastGTE?: InputMaybe<Scalars['u8']['input']>;
  eastLT?: InputMaybe<Scalars['u8']['input']>;
  eastLTE?: InputMaybe<Scalars['u8']['input']>;
  eastNEQ?: InputMaybe<Scalars['u8']['input']>;
  entity_id?: InputMaybe<Scalars['u128']['input']>;
  entity_idEQ?: InputMaybe<Scalars['u128']['input']>;
  entity_idGT?: InputMaybe<Scalars['u128']['input']>;
  entity_idGTE?: InputMaybe<Scalars['u128']['input']>;
  entity_idLT?: InputMaybe<Scalars['u128']['input']>;
  entity_idLTE?: InputMaybe<Scalars['u128']['input']>;
  entity_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  generator_name?: InputMaybe<Scalars['felt252']['input']>;
  generator_nameEQ?: InputMaybe<Scalars['felt252']['input']>;
  generator_nameGT?: InputMaybe<Scalars['felt252']['input']>;
  generator_nameGTE?: InputMaybe<Scalars['felt252']['input']>;
  generator_nameLT?: InputMaybe<Scalars['felt252']['input']>;
  generator_nameLTE?: InputMaybe<Scalars['felt252']['input']>;
  generator_nameNEQ?: InputMaybe<Scalars['felt252']['input']>;
  generator_value?: InputMaybe<Scalars['u32']['input']>;
  generator_valueEQ?: InputMaybe<Scalars['u32']['input']>;
  generator_valueGT?: InputMaybe<Scalars['u32']['input']>;
  generator_valueGTE?: InputMaybe<Scalars['u32']['input']>;
  generator_valueLT?: InputMaybe<Scalars['u32']['input']>;
  generator_valueLTE?: InputMaybe<Scalars['u32']['input']>;
  generator_valueNEQ?: InputMaybe<Scalars['u32']['input']>;
  monsters?: InputMaybe<Scalars['u256']['input']>;
  monstersEQ?: InputMaybe<Scalars['u256']['input']>;
  monstersGT?: InputMaybe<Scalars['u256']['input']>;
  monstersGTE?: InputMaybe<Scalars['u256']['input']>;
  monstersLT?: InputMaybe<Scalars['u256']['input']>;
  monstersLTE?: InputMaybe<Scalars['u256']['input']>;
  monstersNEQ?: InputMaybe<Scalars['u256']['input']>;
  north?: InputMaybe<Scalars['u8']['input']>;
  northEQ?: InputMaybe<Scalars['u8']['input']>;
  northGT?: InputMaybe<Scalars['u8']['input']>;
  northGTE?: InputMaybe<Scalars['u8']['input']>;
  northLT?: InputMaybe<Scalars['u8']['input']>;
  northLTE?: InputMaybe<Scalars['u8']['input']>;
  northNEQ?: InputMaybe<Scalars['u8']['input']>;
  over?: InputMaybe<Scalars['u8']['input']>;
  overEQ?: InputMaybe<Scalars['u8']['input']>;
  overGT?: InputMaybe<Scalars['u8']['input']>;
  overGTE?: InputMaybe<Scalars['u8']['input']>;
  overLT?: InputMaybe<Scalars['u8']['input']>;
  overLTE?: InputMaybe<Scalars['u8']['input']>;
  overNEQ?: InputMaybe<Scalars['u8']['input']>;
  slender_duck?: InputMaybe<Scalars['u256']['input']>;
  slender_duckEQ?: InputMaybe<Scalars['u256']['input']>;
  slender_duckGT?: InputMaybe<Scalars['u256']['input']>;
  slender_duckGTE?: InputMaybe<Scalars['u256']['input']>;
  slender_duckLT?: InputMaybe<Scalars['u256']['input']>;
  slender_duckLTE?: InputMaybe<Scalars['u256']['input']>;
  slender_duckNEQ?: InputMaybe<Scalars['u256']['input']>;
  south?: InputMaybe<Scalars['u8']['input']>;
  southEQ?: InputMaybe<Scalars['u8']['input']>;
  southGT?: InputMaybe<Scalars['u8']['input']>;
  southGTE?: InputMaybe<Scalars['u8']['input']>;
  southLT?: InputMaybe<Scalars['u8']['input']>;
  southLTE?: InputMaybe<Scalars['u8']['input']>;
  southNEQ?: InputMaybe<Scalars['u8']['input']>;
  under?: InputMaybe<Scalars['u8']['input']>;
  underEQ?: InputMaybe<Scalars['u8']['input']>;
  underGT?: InputMaybe<Scalars['u8']['input']>;
  underGTE?: InputMaybe<Scalars['u8']['input']>;
  underLT?: InputMaybe<Scalars['u8']['input']>;
  underLTE?: InputMaybe<Scalars['u8']['input']>;
  underNEQ?: InputMaybe<Scalars['u8']['input']>;
  west?: InputMaybe<Scalars['u8']['input']>;
  westEQ?: InputMaybe<Scalars['u8']['input']>;
  westGT?: InputMaybe<Scalars['u8']['input']>;
  westGTE?: InputMaybe<Scalars['u8']['input']>;
  westLT?: InputMaybe<Scalars['u8']['input']>;
  westLTE?: InputMaybe<Scalars['u8']['input']>;
  westNEQ?: InputMaybe<Scalars['u8']['input']>;
};

export type Metadata = {
  __typename?: 'Metadata';
  id?: Maybe<Scalars['ID']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type MetadataConnection = {
  __typename?: 'MetadataConnection';
  edges?: Maybe<Array<Maybe<MetadataEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type MetadataEdge = {
  __typename?: 'MetadataEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Metadata>;
};

export type Model = {
  __typename?: 'Model';
  class_hash?: Maybe<Scalars['felt252']['output']>;
  created_at?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  transaction_hash?: Maybe<Scalars['felt252']['output']>;
};

export type ModelConnection = {
  __typename?: 'ModelConnection';
  edges?: Maybe<Array<Maybe<ModelEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type ModelEdge = {
  __typename?: 'ModelEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Model>;
};

export type ModelUnion = Chamber | Map | Score | State | Tile;

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Query = {
  __typename?: 'Query';
  chamberModels?: Maybe<ChamberConnection>;
  entities?: Maybe<EntityConnection>;
  entity: Entity;
  events?: Maybe<EventConnection>;
  mapModels?: Maybe<MapConnection>;
  metadata: Metadata;
  metadatas?: Maybe<MetadataConnection>;
  model: Model;
  models?: Maybe<ModelConnection>;
  scoreModels?: Maybe<ScoreConnection>;
  stateModels?: Maybe<StateConnection>;
  tileModels?: Maybe<TileConnection>;
  transaction: Transaction;
  transactions?: Maybe<TransactionConnection>;
};


export type QueryChamberModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<ChamberOrder>;
  where?: InputMaybe<ChamberWhereInput>;
};


export type QueryEntitiesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEntityArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  keys?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMapModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<MapOrder>;
  where?: InputMaybe<MapWhereInput>;
};


export type QueryMetadataArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMetadatasArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryModelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryScoreModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<ScoreOrder>;
  where?: InputMaybe<ScoreWhereInput>;
};


export type QueryStateModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<StateOrder>;
  where?: InputMaybe<StateWhereInput>;
};


export type QueryTileModelsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<TileOrder>;
  where?: InputMaybe<TileWhereInput>;
};


export type QueryTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTransactionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Score = {
  __typename?: 'Score';
  entity?: Maybe<Entity>;
  key_location_id?: Maybe<Scalars['u128']['output']>;
  key_player?: Maybe<Scalars['ContractAddress']['output']>;
  location_id?: Maybe<Scalars['u128']['output']>;
  moves?: Maybe<Scalars['usize']['output']>;
  player?: Maybe<Scalars['ContractAddress']['output']>;
};

export type ScoreConnection = {
  __typename?: 'ScoreConnection';
  edges?: Maybe<Array<Maybe<ScoreEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type ScoreEdge = {
  __typename?: 'ScoreEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Score>;
};

export type ScoreOrder = {
  direction: OrderDirection;
  field: ScoreOrderField;
};

export enum ScoreOrderField {
  KeyLocationId = 'KEY_LOCATION_ID',
  KeyPlayer = 'KEY_PLAYER',
  LocationId = 'LOCATION_ID',
  Moves = 'MOVES',
  Player = 'PLAYER'
}

export type ScoreWhereInput = {
  key_location_id?: InputMaybe<Scalars['u128']['input']>;
  key_location_idEQ?: InputMaybe<Scalars['u128']['input']>;
  key_location_idGT?: InputMaybe<Scalars['u128']['input']>;
  key_location_idGTE?: InputMaybe<Scalars['u128']['input']>;
  key_location_idLT?: InputMaybe<Scalars['u128']['input']>;
  key_location_idLTE?: InputMaybe<Scalars['u128']['input']>;
  key_location_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  key_player?: InputMaybe<Scalars['ContractAddress']['input']>;
  key_playerEQ?: InputMaybe<Scalars['ContractAddress']['input']>;
  key_playerGT?: InputMaybe<Scalars['ContractAddress']['input']>;
  key_playerGTE?: InputMaybe<Scalars['ContractAddress']['input']>;
  key_playerLT?: InputMaybe<Scalars['ContractAddress']['input']>;
  key_playerLTE?: InputMaybe<Scalars['ContractAddress']['input']>;
  key_playerNEQ?: InputMaybe<Scalars['ContractAddress']['input']>;
  location_id?: InputMaybe<Scalars['u128']['input']>;
  location_idEQ?: InputMaybe<Scalars['u128']['input']>;
  location_idGT?: InputMaybe<Scalars['u128']['input']>;
  location_idGTE?: InputMaybe<Scalars['u128']['input']>;
  location_idLT?: InputMaybe<Scalars['u128']['input']>;
  location_idLTE?: InputMaybe<Scalars['u128']['input']>;
  location_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  moves?: InputMaybe<Scalars['usize']['input']>;
  movesEQ?: InputMaybe<Scalars['usize']['input']>;
  movesGT?: InputMaybe<Scalars['usize']['input']>;
  movesGTE?: InputMaybe<Scalars['usize']['input']>;
  movesLT?: InputMaybe<Scalars['usize']['input']>;
  movesLTE?: InputMaybe<Scalars['usize']['input']>;
  movesNEQ?: InputMaybe<Scalars['usize']['input']>;
  player?: InputMaybe<Scalars['ContractAddress']['input']>;
  playerEQ?: InputMaybe<Scalars['ContractAddress']['input']>;
  playerGT?: InputMaybe<Scalars['ContractAddress']['input']>;
  playerGTE?: InputMaybe<Scalars['ContractAddress']['input']>;
  playerLT?: InputMaybe<Scalars['ContractAddress']['input']>;
  playerLTE?: InputMaybe<Scalars['ContractAddress']['input']>;
  playerNEQ?: InputMaybe<Scalars['ContractAddress']['input']>;
};

export type State = {
  __typename?: 'State';
  entity?: Maybe<Entity>;
  light?: Maybe<Scalars['u8']['output']>;
  location_id?: Maybe<Scalars['u128']['output']>;
  threat?: Maybe<Scalars['u8']['output']>;
  wealth?: Maybe<Scalars['u8']['output']>;
  wins?: Maybe<Scalars['u8']['output']>;
};

export type StateConnection = {
  __typename?: 'StateConnection';
  edges?: Maybe<Array<Maybe<StateEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type StateEdge = {
  __typename?: 'StateEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<State>;
};

export type StateOrder = {
  direction: OrderDirection;
  field: StateOrderField;
};

export enum StateOrderField {
  Light = 'LIGHT',
  LocationId = 'LOCATION_ID',
  Threat = 'THREAT',
  Wealth = 'WEALTH',
  Wins = 'WINS'
}

export type StateWhereInput = {
  light?: InputMaybe<Scalars['u8']['input']>;
  lightEQ?: InputMaybe<Scalars['u8']['input']>;
  lightGT?: InputMaybe<Scalars['u8']['input']>;
  lightGTE?: InputMaybe<Scalars['u8']['input']>;
  lightLT?: InputMaybe<Scalars['u8']['input']>;
  lightLTE?: InputMaybe<Scalars['u8']['input']>;
  lightNEQ?: InputMaybe<Scalars['u8']['input']>;
  location_id?: InputMaybe<Scalars['u128']['input']>;
  location_idEQ?: InputMaybe<Scalars['u128']['input']>;
  location_idGT?: InputMaybe<Scalars['u128']['input']>;
  location_idGTE?: InputMaybe<Scalars['u128']['input']>;
  location_idLT?: InputMaybe<Scalars['u128']['input']>;
  location_idLTE?: InputMaybe<Scalars['u128']['input']>;
  location_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  threat?: InputMaybe<Scalars['u8']['input']>;
  threatEQ?: InputMaybe<Scalars['u8']['input']>;
  threatGT?: InputMaybe<Scalars['u8']['input']>;
  threatGTE?: InputMaybe<Scalars['u8']['input']>;
  threatLT?: InputMaybe<Scalars['u8']['input']>;
  threatLTE?: InputMaybe<Scalars['u8']['input']>;
  threatNEQ?: InputMaybe<Scalars['u8']['input']>;
  wealth?: InputMaybe<Scalars['u8']['input']>;
  wealthEQ?: InputMaybe<Scalars['u8']['input']>;
  wealthGT?: InputMaybe<Scalars['u8']['input']>;
  wealthGTE?: InputMaybe<Scalars['u8']['input']>;
  wealthLT?: InputMaybe<Scalars['u8']['input']>;
  wealthLTE?: InputMaybe<Scalars['u8']['input']>;
  wealthNEQ?: InputMaybe<Scalars['u8']['input']>;
  wins?: InputMaybe<Scalars['u8']['input']>;
  winsEQ?: InputMaybe<Scalars['u8']['input']>;
  winsGT?: InputMaybe<Scalars['u8']['input']>;
  winsGTE?: InputMaybe<Scalars['u8']['input']>;
  winsLT?: InputMaybe<Scalars['u8']['input']>;
  winsLTE?: InputMaybe<Scalars['u8']['input']>;
  winsNEQ?: InputMaybe<Scalars['u8']['input']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  entityUpdated: Entity;
  modelRegistered: Model;
};


export type SubscriptionEntityUpdatedArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type SubscriptionModelRegisteredArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type Tile = {
  __typename?: 'Tile';
  entity?: Maybe<Entity>;
  key_location_id?: Maybe<Scalars['u128']['output']>;
  key_pos?: Maybe<Scalars['u8']['output']>;
  location_id?: Maybe<Scalars['u128']['output']>;
  pos?: Maybe<Scalars['u8']['output']>;
  tile_type?: Maybe<Scalars['u8']['output']>;
};

export type TileConnection = {
  __typename?: 'TileConnection';
  edges?: Maybe<Array<Maybe<TileEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type TileEdge = {
  __typename?: 'TileEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Tile>;
};

export type TileOrder = {
  direction: OrderDirection;
  field: TileOrderField;
};

export enum TileOrderField {
  KeyLocationId = 'KEY_LOCATION_ID',
  KeyPos = 'KEY_POS',
  LocationId = 'LOCATION_ID',
  Pos = 'POS',
  TileType = 'TILE_TYPE'
}

export type TileWhereInput = {
  key_location_id?: InputMaybe<Scalars['u128']['input']>;
  key_location_idEQ?: InputMaybe<Scalars['u128']['input']>;
  key_location_idGT?: InputMaybe<Scalars['u128']['input']>;
  key_location_idGTE?: InputMaybe<Scalars['u128']['input']>;
  key_location_idLT?: InputMaybe<Scalars['u128']['input']>;
  key_location_idLTE?: InputMaybe<Scalars['u128']['input']>;
  key_location_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  key_pos?: InputMaybe<Scalars['u8']['input']>;
  key_posEQ?: InputMaybe<Scalars['u8']['input']>;
  key_posGT?: InputMaybe<Scalars['u8']['input']>;
  key_posGTE?: InputMaybe<Scalars['u8']['input']>;
  key_posLT?: InputMaybe<Scalars['u8']['input']>;
  key_posLTE?: InputMaybe<Scalars['u8']['input']>;
  key_posNEQ?: InputMaybe<Scalars['u8']['input']>;
  location_id?: InputMaybe<Scalars['u128']['input']>;
  location_idEQ?: InputMaybe<Scalars['u128']['input']>;
  location_idGT?: InputMaybe<Scalars['u128']['input']>;
  location_idGTE?: InputMaybe<Scalars['u128']['input']>;
  location_idLT?: InputMaybe<Scalars['u128']['input']>;
  location_idLTE?: InputMaybe<Scalars['u128']['input']>;
  location_idNEQ?: InputMaybe<Scalars['u128']['input']>;
  pos?: InputMaybe<Scalars['u8']['input']>;
  posEQ?: InputMaybe<Scalars['u8']['input']>;
  posGT?: InputMaybe<Scalars['u8']['input']>;
  posGTE?: InputMaybe<Scalars['u8']['input']>;
  posLT?: InputMaybe<Scalars['u8']['input']>;
  posLTE?: InputMaybe<Scalars['u8']['input']>;
  posNEQ?: InputMaybe<Scalars['u8']['input']>;
  tile_type?: InputMaybe<Scalars['u8']['input']>;
  tile_typeEQ?: InputMaybe<Scalars['u8']['input']>;
  tile_typeGT?: InputMaybe<Scalars['u8']['input']>;
  tile_typeGTE?: InputMaybe<Scalars['u8']['input']>;
  tile_typeLT?: InputMaybe<Scalars['u8']['input']>;
  tile_typeLTE?: InputMaybe<Scalars['u8']['input']>;
  tile_typeNEQ?: InputMaybe<Scalars['u8']['input']>;
};

export type Transaction = {
  __typename?: 'Transaction';
  calldata?: Maybe<Array<Maybe<Scalars['felt252']['output']>>>;
  created_at?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  max_fee?: Maybe<Scalars['felt252']['output']>;
  nonce?: Maybe<Scalars['felt252']['output']>;
  sender_address?: Maybe<Scalars['felt252']['output']>;
  signature?: Maybe<Array<Maybe<Scalars['felt252']['output']>>>;
  transaction_hash?: Maybe<Scalars['felt252']['output']>;
};

export type TransactionConnection = {
  __typename?: 'TransactionConnection';
  edges?: Maybe<Array<Maybe<TransactionEdge>>>;
  total_count: Scalars['Int']['output'];
};

export type TransactionEdge = {
  __typename?: 'TransactionEdge';
  cursor?: Maybe<Scalars['Cursor']['output']>;
  node?: Maybe<Transaction>;
};

export type GetChamberTilesQueryVariables = Exact<{
  locationId: Scalars['String']['input'];
}>;


export type GetChamberTilesQuery = { __typename?: 'Query', entities?: { __typename?: 'EntityConnection', edges?: Array<{ __typename?: 'EntityEdge', node?: { __typename?: 'Entity', keys?: Array<string | null> | null, id?: string | null, models?: Array<{ __typename: 'Chamber' } | { __typename: 'Map' } | { __typename: 'Score' } | { __typename: 'State' } | { __typename: 'Tile', location_id?: any | null, pos?: any | null, tile_type?: any | null } | null> | null } | null } | null> | null } | null };

export type GetLevelScoresQueryVariables = Exact<{
  locationId: Scalars['u128']['input'];
}>;


export type GetLevelScoresQuery = { __typename?: 'Query', entities?: { __typename?: 'ScoreConnection', edges?: Array<{ __typename?: 'ScoreEdge', node?: { __typename?: 'Score', entity?: { __typename?: 'Entity', keys?: Array<string | null> | null, id?: string | null, models?: Array<{ __typename?: 'Chamber' } | { __typename?: 'Map' } | { __typename: 'Score', location_id?: any | null, player?: any | null, moves?: any | null } | { __typename?: 'State' } | { __typename?: 'Tile' } | null> | null } | null } | null } | null> | null } | null };


export const GetChamberTilesDocument = gql`
    query getChamberTiles($locationId: String!) {
  entities(keys: [$locationId], first: 100) {
    edges {
      node {
        keys
        id
        models {
          __typename
          ... on Tile {
            location_id
            pos
            tile_type
          }
        }
      }
    }
  }
}
    `;
export const GetLevelScoresDocument = gql`
    query getLevelScores($locationId: u128!) {
  entities: scoreModels(where: {location_id: $locationId}, first: 100) {
    edges {
      node {
        entity {
          keys
          id
          models {
            ... on Score {
              __typename
              location_id
              player
              moves
            }
          }
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();
const GetChamberTilesDocumentString = print(GetChamberTilesDocument);
const GetLevelScoresDocumentString = print(GetLevelScoresDocument);
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getChamberTiles(variables: GetChamberTilesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetChamberTilesQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetChamberTilesQuery>(GetChamberTilesDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getChamberTiles', 'query');
    },
    getLevelScores(variables: GetLevelScoresQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetLevelScoresQuery; errors?: GraphQLError[]; extensions?: any; headers: Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetLevelScoresQuery>(GetLevelScoresDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getLevelScores', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;