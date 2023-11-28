import { Components, Schema, setComponent } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils"

//-------------------
// From Eternum
// https://github.com/BibliothecaDAO/eternum/blob/main/client/src/utils/utils.tsx
//

type DojoEntity = {
  __typename?: "Entity";
  keys?: (string | bigint | null)[] | null | undefined;
  models?: any | null[];
};

export function setComponentFromEntity(entity: DojoEntity | null, componentName: string, models: Components) {
  if (entity) {
    let component = models[componentName];
    let rawComponentValues = entity?.models?.find((component: any) => {
      return component?.__typename === componentName;
    });
    // console.log(`SET_[${componentName}]_rawComponentValues:`, rawComponentValues)
    if (rawComponentValues) {
      // setting the component values
      // console.log(`SET entity:`, entity)
      // let keys = entity?.keys ? extractAndCleanKey(entity.keys) : [];
      let keys = entity?.keys ?? [];
      let entityId = getEntityIdFromKeys(keys.map(k => BigInt(k)));
      // TODO: issue is that torii returns all numbers as strings, need to fix in torii
      // so here i am transforming to a number each time (but it will cause problem for fields that are not numbers)
      const componentValues = Object.keys(component.schema).reduce((acc: Schema, key) => {
        const value = rawComponentValues[key];
        if (typeof value == 'string' && value.startsWith('0x')) {
          //@ts-ignore
          acc[key] = BigInt(value);
        } else {
          acc[key] = Number(value);
        }
        return acc;
      }, {});
      // console.log(`SET_[${componentName}]_keys,entityId,values:`, keys, entityId, componentValues)
      // console.log(`SET_[${componentName}]_component:`, component)
      setComponent(component, entityId, componentValues);
    }
  }
}
