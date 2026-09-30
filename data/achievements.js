/** Technical examples only. Achievement logic is driven by criteria, not ids. */
export const ACHIEVEMENT_DEFINITIONS = Object.freeze([
  { id: "test_first_quest", title: "First Test Quest", description: "Complete any quest.", hidden: false, reward: null, criteria: { eventType: "quest_completed", requiredAmount: 1 } },
  { id: "test_item_collector", title: "Test Item Collector", description: "Collect five items.", hidden: false, reward: null, criteria: { eventType: "item_collected", requiredAmount: 5 } },
  { id: "test_explorer", title: "Test Explorer", description: "Enter all four main regions.", hidden: false, reward: null, criteria: { eventType: "region_entered", requiredRegionIds: ["istanbul", "cappadocia", "blackSea", "aegean"] } },
  { id: "test_level_two", title: "Level Two", description: "Reach level 2.", hidden: false, reward: null, criteria: { eventType: "level_reached", requiredLevel: 2 } },
  { id: "istanbul_wrong_number", title: "Wrong Number", description: "You really shouldn't have called that number.", hidden: true, reward: null, criteria: { eventType: "telephone_call_completed", targetId: "istanbul-telephone-booth", requiredAmount: 1 } },
]);

export const ACHIEVEMENTS_BY_ID = new Map(ACHIEVEMENT_DEFINITIONS.map((achievement) => [achievement.id, achievement]));
