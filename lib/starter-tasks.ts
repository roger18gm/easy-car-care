export type StarterTask = {
  name: string;
  description: string;
  intervalMiles: number | null;
  intervalMonths: number | null;
};

const guidance = "This is general guidance, not a manufacturer schedule.";

export const STARTER_TASKS: StarterTask[] = [
  { name: "Oil change", description: `Fresh oil keeps the engine running smoothly. ${guidance}`, intervalMiles: 5000, intervalMonths: 6 },
  { name: "Tire rotation", description: `Rotating tires helps them wear evenly. ${guidance}`, intervalMiles: 7500, intervalMonths: 6 },
  { name: "Tire-pressure check", description: `Tires at the right pressure are safer and use less fuel. ${guidance}`, intervalMiles: 1000, intervalMonths: 1 },
  { name: "Air-filter replacement", description: `A clean air filter helps the engine breathe. ${guidance}`, intervalMiles: 15000, intervalMonths: 12 },
  { name: "Brake inspection", description: `A periodic brake check can catch wear before it becomes a safety problem. ${guidance}`, intervalMiles: 10000, intervalMonths: 12 },
  { name: "Battery check", description: `A quick battery check can prevent a no-start surprise. ${guidance}`, intervalMiles: null, intervalMonths: 6 },
  { name: "Coolant inspection", description: `Coolant protects the engine from overheating and freezing. ${guidance}`, intervalMiles: 30000, intervalMonths: 24 },
];
