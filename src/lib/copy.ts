export const COPY = {
  duplicateEmail: 'An account with this email already exists.',
  signInFailed: 'Email or password is incorrect.',
  accountCreated: 'Your account was created. Sign in to continue.',
  mileageDecrease: "Mileage can't be less than the current reading.",
  badVin: 'Enter a 17-character VIN, or leave it blank.',
  duplicateVin: 'That VIN is already on a vehicle.',
  futureDate: "Completion date can't be in the future.",
  badCost: 'Enter a cost like 54.99, or leave it blank.',
  unavailable: "That isn't available.",
  planMissing: 'The maintenance plan could not be created.',
  scheduleNeedsUpdate: 'Your entry was saved, but the schedule still needs an update.',
  genericError: 'Something went wrong. Try again.',
  checking: 'Checking your account…',
  nothingDueSoon: 'Nothing is due soon.',
  noVehicles: "You haven't added a vehicle yet.",
  noHistory: 'No service has been recorded yet.',
  addVehiclePrompt: 'Add a vehicle to see what it needs next.',
  enterName: 'Enter your name.',
  enterEmail: 'Enter your email.',
  badEmail: 'Enter an email address like name@example.com.',
  enterPassword: 'Enter a password.',
  shortPassword: 'Use at least 8 characters.',
  enterYear: 'Enter a year from 1980 through 2100.',
  enterMake: 'Enter the make.',
  enterModel: 'Enter the model.',
  enterMileage: 'Enter a mileage of 0 or more.',
  badPurchaseDate: 'Enter a real date, or leave it blank.',
  enterCompletedDate: 'Enter the completion date.',
} as const

export function deleteVehicleQuestion(year: number, make: string, model: string): string {
  return `Delete ${year} ${make} ${model}?`
}

export function deleteLogQuestion(taskName: string): string {
  return `Delete this ${taskName} record?`
}
