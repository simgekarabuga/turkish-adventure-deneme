/** First authored Istanbul items; definitions remain independent of inventory rules. */
export const ITEM_TYPES = Object.freeze(["quest_item", "consumable", "collectible", "key_item", "currency"]);

export const ITEM_DEFINITIONS = Object.freeze([
  { id: "simit", name: "Simit", description: "A classic Turkish sesame bread ring.", type: "consumable", stackable: true, maxStack: 20, icon: "ring", sellable: false, usable: true, useMessage: "You ate a Simit.", metadata: {} },
  { id: "turkish_tea", name: "Turkish Tea", description: "A small glass of strong Turkish tea.", type: "consumable", stackable: true, maxStack: 20, icon: "cup", sellable: false, usable: true, useMessage: "You drank Turkish Tea.", metadata: {} },
  { id: "nazar_charm", name: "Nazar Charm", description: "A traditional blue eye charm said to protect against bad luck.", type: "key_item", stackable: false, maxStack: 1, icon: "charm", sellable: false, usable: false, metadata: {} },
  { id: "cat_food", name: "Cat Food", description: "Food for a hungry Istanbul cat.", type: "quest_item", stackable: true, maxStack: 10, icon: "gem", sellable: false, usable: false, metadata: {} },
]);

export const ITEMS_BY_ID = new Map(ITEM_DEFINITIONS.map((item) => [item.id, item]));
