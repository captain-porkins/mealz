export function splitIngredient(ingredient) {
  const unitsFormat = /(?<name>.*) (?<quantity>[0-9]+)(?<unit>\w*)?/i
  const match = ingredient.match(unitsFormat)
  let ret
  if (match) {
    ret = {
      name: match.groups.name.toLowerCase(),
      quantity: {
        value: parseInt(match.groups.quantity.toLowerCase(), 10),
        ...(match.groups.unit ? { unit: match.groups.unit.toLowerCase() } : {}),
      },
    }
  } else {
    ret = {
      name: ingredient,
    }
  }
  return ret
}

export function stringifyIngredient(ingredient) {
  if (ingredient.quantity) {
    return `${ingredient.name} ${ingredient.quantity.value}${
      ingredient.quantity.unit ?? ""
    }`
  }
  return ingredient.name
}
